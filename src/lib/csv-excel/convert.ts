import JSZip from "jszip";
import Papa from "papaparse";
import { applyCleanup } from "./cleanup";
import type {
  ColumnType,
  ConverterSettings,
  DateFormatOption,
  Delimiter,
  ParsedWorkbook,
  SheetData,
} from "./types";
import { sheetNameFromFile } from "./types";

export type BuiltDownload = {
  blob: Blob;
  fileName: string;
  mime: string;
  bytes: number;
};

function formatDateCell(raw: string, format: DateFormatOption): string | Date | number {
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return raw;
  const d = new Date(t);
  if (format === "excel") return d;
  if (format === "us") {
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  }
  if (format === "eu") {
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }
  return d.toISOString().slice(0, 10);
}

function parseNumeric(raw: string): number | null {
  const cleaned = raw.replace(/[$€£¥,\s]/g, "").replace(/%$/, "");
  if (!cleaned || Number.isNaN(Number(cleaned))) return null;
  return Number(cleaned);
}

function excelNumFmt(type: ColumnType): string | undefined {
  switch (type) {
    case "number":
      return "#,##0.##";
    case "currency":
      return '"$"#,##0.00';
    case "percentage":
      return "0.00%";
    case "date":
      return "yyyy-mm-dd";
    default:
      return undefined;
  }
}

function cellValue(
  raw: string,
  type: ColumnType,
  dateFormat: DateFormatOption
): string | number | Date {
  if (!raw) return "";
  if (type === "text") return raw;
  if (type === "date") return formatDateCell(raw, dateFormat);
  if (type === "percentage") {
    const n = parseNumeric(raw);
    if (n == null) return raw;
    return raw.includes("%") ? n / 100 : n;
  }
  if (type === "number" || type === "currency") {
    const n = parseNumeric(raw);
    return n == null ? raw : n;
  }
  return raw;
}

async function sheetToWorkbookBuffer(
  sheets: { name: string; sheet: SheetData }[],
  settings: ConverterSettings
): Promise<ArrayBuffer> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "AxenFlow AI CSV Excel Converter";
  wb.created = new Date();

  for (const { name, sheet: raw } of sheets) {
    const sheet = applyCleanup(raw, settings);
    if (!sheet.headers.length) continue;

    const ws = wb.addWorksheet(name.slice(0, 31) || "Sheet", {
      views: [{ state: "frozen", ySplit: 1 }],
      properties: { tabColor: { argb: "FF6366F1" } },
    });

    const headerRow = ws.addRow(sheet.headers);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };
    headerRow.alignment = { vertical: "middle" };
    headerRow.height = 22;

    for (const row of sheet.rows) {
      const values = sheet.columns.map((col, i) =>
        cellValue(row[i] ?? "", col.type, settings.dateFormat)
      );
      const excelRow = ws.addRow(values);
      if (excelRow.number % 2 === 0) {
        excelRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF1F5F9" },
          };
        });
      }
    }

    sheet.columns.forEach((col, i) => {
      const column = ws.getColumn(i + 1);
      const fmt = excelNumFmt(col.type);
      if (fmt) column.numFmt = fmt;
      if (col.type === "text") {
        column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
          if (rowNumber === 1) return;
          if (typeof cell.value === "number") {
            cell.value = String(cell.value);
          }
          cell.numFmt = "@";
        });
      }

      let max = String(col.name).length;
      for (let r = 0; r < Math.min(sheet.rows.length, 200); r++) {
        max = Math.max(max, String(sheet.rows[r][i] ?? "").length);
      }
      column.width = Math.min(48, Math.max(10, max + 2));
    });

    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.headers.length },
    };
  }

  const buf = await wb.xlsx.writeBuffer();
  return buf as ArrayBuffer;
}

function sheetToCsvString(sheet: SheetData, settings: ConverterSettings): string {
  const cleaned = applyCleanup(sheet, settings);
  const delim: Delimiter =
    settings.delimiter === "auto" || settings.delimiter === "\t"
      ? settings.delimiter === "\t"
        ? "\t"
        : ","
      : settings.delimiter;

  const data = [cleaned.headers, ...cleaned.rows];
  let csv = Papa.unparse(data, { delimiter: delim, quotes: true });

  // Format dates in CSV as chosen
  if (settings.dateFormat !== "iso") {
    // already stored as strings in cells; cleanup left as-is
  }

  if (settings.utf8Bom) csv = `\uFEFF${csv}`;
  return csv;
}

function downloadName(base: string, ext: string): string {
  return `${base.replace(/\.[^.]+$/, "") || "converted"}.${ext}`;
}

export async function convertCsvToExcel(
  workbooks: ParsedWorkbook[],
  settings: ConverterSettings,
  onProgress?: (pct: number, stage: string) => void
): Promise<BuiltDownload> {
  onProgress?.(10, "Formatting sheets");

  const sheets: { name: string; sheet: SheetData }[] = [];
  for (const wb of workbooks) {
    for (const sheet of wb.sheets) {
      const selected = settings.selectedSheetIndexes[wb.id];
      const idx = wb.sheets.indexOf(sheet);
      if (selected && !selected.includes(idx)) continue;
      sheets.push({
        name: workbooks.length > 1 ? sheetNameFromFile(`${wb.fileName}-${sheet.name}`) : sheet.name,
        sheet,
      });
    }
  }

  if (!sheets.length) throw new Error("No sheets available to convert.");

  if (settings.multiOutput === "separate-zip" && (workbooks.length > 1 || sheets.length > 1)) {
    onProgress?.(40, "Generating Excel files");
    const zip = new JSZip();
    let i = 0;
    for (const item of sheets) {
      const buf = await sheetToWorkbookBuffer([item], settings);
      zip.file(downloadName(item.name, "xlsx"), buf);
      i += 1;
      onProgress?.(40 + Math.round((i / sheets.length) * 50), "Packaging ZIP");
    }
    const blob = await zip.generateAsync({ type: "blob" });
    onProgress?.(100, "Done");
    return {
      blob,
      fileName: "csv-to-excel.zip",
      mime: "application/zip",
      bytes: blob.size,
    };
  }

  onProgress?.(55, "Generating workbook");
  const buf = await sheetToWorkbookBuffer(sheets, settings);
  onProgress?.(100, "Done");
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  return {
    blob,
    fileName: downloadName(workbooks[0]?.fileName || "converted", "xlsx"),
    mime: blob.type,
    bytes: blob.size,
  };
}

export async function convertExcelToCsv(
  workbooks: ParsedWorkbook[],
  settings: ConverterSettings,
  onProgress?: (pct: number, stage: string) => void
): Promise<BuiltDownload> {
  onProgress?.(15, "Preparing CSV output");
  const files: { name: string; content: string }[] = [];

  for (const wb of workbooks) {
    const selected = settings.selectedSheetIndexes[wb.id] ?? wb.sheets.map((_, i) => i);
    for (const idx of selected) {
      const sheet = wb.sheets[idx];
      if (!sheet) continue;
      const csv = sheetToCsvString(sheet, settings);
      const ext = settings.delimiter === "\t" ? "tsv" : "csv";
      const label =
        wb.sheets.length > 1
          ? downloadName(`${sheetNameFromFile(wb.fileName)}_${sheet.name}`, ext)
          : downloadName(wb.fileName, ext);
      files.push({ name: label, content: csv });
    }
  }

  if (!files.length) throw new Error("Select at least one sheet to export.");

  onProgress?.(70, "Generating download");

  if (files.length === 1) {
    const mime = files[0].name.endsWith(".tsv") ? "text/tab-separated-values" : "text/csv";
    const blob = new Blob([files[0].content], { type: `${mime};charset=utf-8` });
    onProgress?.(100, "Done");
    return { blob, fileName: files[0].name, mime: blob.type, bytes: blob.size };
  }

  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.content);
  const blob = await zip.generateAsync({ type: "blob" });
  onProgress?.(100, "Done");
  return {
    blob,
    fileName: "excel-to-csv.zip",
    mime: "application/zip",
    bytes: blob.size,
  };
}
