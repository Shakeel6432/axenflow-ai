import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { normalizeHeader, parseCsv, rowsToCsv } from "@/lib/bbb-validate";
import {
  enrichRowsWithOutreach,
  type CustomTemplate,
  type OutreachKind,
} from "@/lib/outreach";

export const runtime = "nodejs";

const MAX_ROWS = 5000;
const MAX_BYTES = 12 * 1024 * 1024;

const KIND_SET = new Set<OutreachKind>(["cold_email", "phone_script", "follow_up"]);

function parseKinds(raw: unknown): OutreachKind[] {
  if (Array.isArray(raw)) {
    return raw.filter((k): k is OutreachKind => KIND_SET.has(k as OutreachKind));
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parseKinds(parsed);
    } catch {
      /* single kind */
    }
    if (KIND_SET.has(raw as OutreachKind)) return [raw as OutreachKind];
  }
  return [];
}

function parseCustoms(raw: unknown): CustomTemplate[] {
  let list: unknown = raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      list = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const id = String(o.id || "").trim();
      const name = String(o.name || "").trim();
      const prompt = String(o.prompt || "").trim();
      if (!id || !name || !prompt) return null;
      return { id, name, prompt };
    })
    .filter((t): t is CustomTemplate => Boolean(t));
}

async function rowsFromXlsx(buffer: ArrayBuffer): Promise<Record<string, string>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(buffer) as unknown as ExcelJS.Buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const matrix: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values = row.values as Array<string | number | boolean | Date | null | undefined>;
    const cells: string[] = [];
    for (let i = 1; i < values.length; i++) {
      const v = values[i];
      if (v == null) cells.push("");
      else if (v instanceof Date) cells.push(v.toISOString());
      else if (typeof v === "object" && v !== null && "text" in v) {
        cells.push(String((v as { text: string }).text || ""));
      } else {
        cells.push(String(v));
      }
    }
    if (cells.some((c) => c.trim())) matrix.push(cells);
  });

  if (matrix.length < 2) return [];
  const headers = matrix[0].map(normalizeHeader);
  return matrix.slice(1).map((cols) => {
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (!h) return;
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

async function parseUpload(file: File): Promise<Record<string, string>[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    if (name.endsWith(".xls") && !name.endsWith(".xlsx")) {
      throw new Error("Old .xls is not supported. Save as .xlsx or CSV.");
    }
    return rowsFromXlsx(await file.arrayBuffer());
  }
  if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt")) {
    let text = await file.text();
    if (name.endsWith(".tsv")) {
      text = text
        .split(/\r?\n/)
        .map((line) =>
          line
            .split("\t")
            .map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c))
            .join(",")
        )
        .join("\n");
    }
    return parseCsv(text);
  }
  throw new Error("Supported files: .csv, .xlsx, .tsv, .txt");
}

function buildXlsxBuffer(rows: Record<string, string>[]): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Outreach");
  if (!rows.length) {
    return workbook.xlsx.writeBuffer().then((b) => b as unknown as ArrayBuffer);
  }

  const preferred = [
    "Business Name",
    "Cold Email Subject",
    "Cold Email Body",
    "Phone Script",
    "Follow-up Subject",
    "Follow-up Body",
  ];
  const keys = new Set<string>();
  for (const row of rows) Object.keys(row).forEach((k) => keys.add(k));
  const headers = [
    ...preferred.filter((h) => keys.has(h)),
    ...[...keys].filter((k) => !preferred.includes(k)),
  ];
  sheet.addRow(headers);
  for (const row of rows) {
    sheet.addRow(headers.map((h) => row[h] || ""));
  }
  sheet.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer().then((b) => b as unknown as ArrayBuffer);
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let rows: Record<string, string>[] = [];
    let kinds: OutreachKind[] = [];
    let customTemplates: CustomTemplate[] = [];
    let senderName = "AxenFlow AI";
    let defaultCategory = "";
    let defaultCity = "";
    let download: "json" | "csv" | "xlsx" = "json";
    let parseOnly = false;
    let exportOnly = false;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      kinds = parseKinds(form.get("kinds") || form.get("kind"));
      customTemplates = parseCustoms(form.get("customTemplates"));
      senderName = String(form.get("senderName") || "").trim() || "AxenFlow AI";
      defaultCategory = String(form.get("defaultCategory") || "").trim();
      defaultCity = String(form.get("defaultCity") || "").trim();
      parseOnly = String(form.get("parseOnly") || "") === "1";
      exportOnly = String(form.get("exportOnly") || "") === "1";
      const dl = String(form.get("download") || "json");
      if (dl === "csv" || dl === "xlsx") download = dl;

      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Upload a CSV or Excel file" }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "File too large (max 12MB)" }, { status: 400 });
      }
      rows = await parseUpload(file);
    } else {
      const body = (await req.json().catch(() => null)) as {
        csv?: string;
        rows?: Record<string, string>[];
        kinds?: OutreachKind[];
        kind?: OutreachKind;
        customTemplates?: CustomTemplate[];
        senderName?: string;
        defaultCategory?: string;
        defaultCity?: string;
        download?: "json" | "csv" | "xlsx";
        parseOnly?: boolean;
        exportOnly?: boolean;
      } | null;

      if (!body) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }
      kinds = parseKinds(body.kinds || body.kind);
      customTemplates = parseCustoms(body.customTemplates);
      senderName = String(body.senderName || "").trim() || "AxenFlow AI";
      defaultCategory = String(body.defaultCategory || "").trim();
      defaultCity = String(body.defaultCity || "").trim();
      parseOnly = Boolean(body.parseOnly);
      exportOnly = Boolean(body.exportOnly);
      if (body.download === "csv" || body.download === "xlsx") download = body.download;
      if (body.rows?.length) rows = body.rows;
      else if (body.csv) rows = parseCsv(body.csv);
    }

    if (!rows.length) {
      return NextResponse.json(
        { error: "No rows found. Include a Business Name / Company column." },
        { status: 400 }
      );
    }
    if (rows.length > MAX_ROWS) {
      return NextResponse.json({ error: `Max ${MAX_ROWS} rows per file` }, { status: 400 });
    }

    if (parseOnly) {
      return NextResponse.json({
        ok: true,
        counts: { total: rows.length, filled: 0, skipped: 0 },
        rows,
      });
    }

    if (exportOnly || (download !== "json" && !kinds.length && !customTemplates.length)) {
      if (download === "csv") {
        return new NextResponse("\uFEFF" + rowsToCsv(rows), {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="ai-outreach.csv"',
          },
        });
      }
      if (download === "xlsx") {
        const buffer = await buildXlsxBuffer(rows);
        return new NextResponse(buffer, {
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": 'attachment; filename="ai-outreach.xlsx"',
          },
        });
      }
      return NextResponse.json({ ok: true, rows, counts: { total: rows.length, filled: 0, skipped: 0 } });
    }

    if (!kinds.length && !customTemplates.length) {
      return NextResponse.json(
        { error: "Select at least one template to add to the sheet" },
        { status: 400 }
      );
    }

    const enriched = enrichRowsWithOutreach(rows, {
      senderName,
      defaultCategory,
      defaultCity,
      kinds,
      customTemplates,
    });

    if (download === "csv") {
      return new NextResponse("\uFEFF" + rowsToCsv(enriched.rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="ai-outreach.csv"',
        },
      });
    }
    if (download === "xlsx") {
      const buffer = await buildXlsxBuffer(enriched.rows);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="ai-outreach.xlsx"',
        },
      });
    }

    return NextResponse.json({
      ok: true,
      counts: {
        total: enriched.rows.length,
        filled: enriched.filled,
        skipped: enriched.skipped,
      },
      kinds,
      customTemplates: customTemplates.map((t) => ({ id: t.id, name: t.name })),
      rows: enriched.rows,
    });
  } catch (error) {
    console.error("ai-outreach error:", error);
    const message = error instanceof Error ? error.message : "Outreach generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
