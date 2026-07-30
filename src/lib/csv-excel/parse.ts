import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  buildColumns,
  decodeBuffer,
  detectDelimiter,
  detectEncoding,
  looksLikeHeader,
} from "./detect";
import type {
  ConverterSettings,
  Delimiter,
  EncodingOption,
  ParsedWorkbook,
  SheetData,
} from "./types";
import { sheetNameFromFile } from "./types";

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeMatrix(matrix: string[][]): string[][] {
  if (!matrix.length) return [];
  const width = Math.max(...matrix.map((r) => r.length), 0);
  return matrix.map((row) => {
    const next = row.map((c) => (c == null ? "" : String(c)));
    while (next.length < width) next.push("");
    return next;
  });
}

function matrixToSheet(name: string, matrix: string[][], forceHeader: boolean | null): SheetData {
  const normalized = normalizeMatrix(matrix).filter((r) => r.some((c) => c.trim()));
  if (!normalized.length) {
    return { name, headers: [], rows: [], columns: [] };
  }

  const headerGuess = forceHeader == null ? looksLikeHeader(normalized[0]) : forceHeader;
  let headers: string[];
  let rows: string[][];

  if (headerGuess) {
    headers = normalized[0].map((h, i) => h.trim() || `Column ${i + 1}`);
    rows = normalized.slice(1);
  } else {
    const width = normalized[0].length;
    headers = Array.from({ length: width }, (_, i) => `Column ${i + 1}`);
    rows = normalized;
  }

  rows = rows.map((r) => {
    const next = [...r];
    while (next.length < headers.length) next.push("");
    return next.slice(0, headers.length);
  });

  return {
    name: name.slice(0, 31),
    headers,
    rows,
    columns: buildColumns(headers, rows),
  };
}

export async function parseCsvFile(
  file: File,
  settings: ConverterSettings
): Promise<ParsedWorkbook> {
  const buffer = await file.arrayBuffer();
  const encoding: EncodingOption =
    settings.encoding === "auto" ? detectEncoding(buffer) : settings.encoding;
  const text = decodeBuffer(buffer, encoding);
  const sample = text.slice(0, 12_000);
  const delimiter: Delimiter =
    settings.delimiter === "auto" ? detectDelimiter(sample) : settings.delimiter;

  const warnings: string[] = [];
  if (!text.trim()) warnings.push("This file appears to be empty.");

  const parsed = Papa.parse<string[]>(text, {
    delimiter,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
  });

  if (parsed.errors?.length) {
    const serious = parsed.errors.filter((e) => e.type === "Quotes" || e.type === "FieldMismatch");
    if (serious.length > 3) {
      warnings.push(
        "Some rows look malformed (quotes or column count). Preview carefully before exporting."
      );
    }
  }

  const matrix = (parsed.data || []).map((row) =>
    (Array.isArray(row) ? row : [row]).map((c) => String(c ?? ""))
  );

  if (matrix.length > 1) {
    const widths = new Set(matrix.map((r) => r.length));
    if (widths.size > 1) {
      warnings.push("Rows have inconsistent column counts — padded shorter rows for conversion.");
    }
  }

  const forceHeader = settings.headerOverride ? settings.hasHeader : null;
  const sheet = matrixToSheet(sheetNameFromFile(file.name), matrix, forceHeader);

  return {
    id: uid(),
    fileName: file.name,
    fileSize: file.size,
    sourceKind: "csv",
    sheets: [sheet],
    detectedDelimiter: delimiter,
    detectedEncoding: encoding,
    warnings,
  };
}

export async function parseExcelFile(
  file: File,
  settings: ConverterSettings
): Promise<ParsedWorkbook> {
  const buffer = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true,
      raw: false,
    });
  } catch {
    throw new Error("This file appears to be corrupted or not a valid Excel workbook.");
  }

  if (!workbook.SheetNames.length) {
    throw new Error("This Excel file has no sheets.");
  }

  const warnings: string[] = [];
  const forceHeader = settings.headerOverride ? settings.hasHeader : null;

  const sheets: SheetData[] = workbook.SheetNames.map((name) => {
    const ws = workbook.Sheets[name];
    const matrix = XLSX.utils.sheet_to_json<string[]>(ws, {
      header: 1,
      defval: "",
      raw: false,
      blankrows: false,
    }) as string[][];

    const asStrings = (matrix || []).map((row) =>
      (Array.isArray(row) ? row : []).map((c) => {
        if (c != null && typeof c === "object" && Object.prototype.toString.call(c) === "[object Date]") {
          return (c as Date).toISOString().slice(0, 10);
        }
        return c == null ? "" : String(c);
      })
    );

    return matrixToSheet(name || "Sheet", asStrings, forceHeader);
  });

  if (sheets.every((s) => !s.rows.length && !s.headers.length)) {
    warnings.push("All sheets look empty.");
  }

  return {
    id: uid(),
    fileName: file.name,
    fileSize: file.size,
    sourceKind: "excel",
    sheets,
    warnings,
  };
}

export function isCsvLike(file: File): boolean {
  const n = file.name.toLowerCase();
  return n.endsWith(".csv") || n.endsWith(".tsv") || n.endsWith(".txt");
}

export function isExcelLike(file: File): boolean {
  const n = file.name.toLowerCase();
  return n.endsWith(".xlsx") || n.endsWith(".xls") || n.endsWith(".xlsm");
}

export async function parseUploadedFile(
  file: File,
  settings: ConverterSettings
): Promise<ParsedWorkbook> {
  if (settings.direction === "csv-to-excel") {
    if (isExcelLike(file)) {
      throw new Error("Switch direction to Excel → CSV to convert spreadsheet files.");
    }
    if (!isCsvLike(file) && !file.type.includes("csv") && !file.type.includes("text")) {
      // allow unknown mime if extension ok; otherwise soft fail
      if (!/\.(csv|tsv|txt)$/i.test(file.name)) {
        throw new Error("Unsupported file type. Use .csv or .tsv for CSV → Excel.");
      }
    }
    return parseCsvFile(file, settings);
  }

  if (isCsvLike(file)) {
    throw new Error("Switch direction to CSV → Excel to convert CSV files.");
  }
  if (!isExcelLike(file)) {
    throw new Error("Unsupported file type. Use .xlsx or .xls for Excel → CSV.");
  }
  return parseExcelFile(file, settings);
}
