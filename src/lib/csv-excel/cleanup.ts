import type { ColumnMeta, ConverterSettings, SheetData } from "./types";

function cleanCell(value: string, settings: ConverterSettings): string {
  let v = value ?? "";
  if (settings.trimWhitespace) v = v.trim();
  if (settings.removeSpecialChars) {
    // Keep letters, numbers, common punctuation used in leads
    v = v.replace(/[^\w\s@.+,\-_/()&#:;%]/g, "");
  }
  return v;
}

export function applyCleanup(sheet: SheetData, settings: ConverterSettings): SheetData {
  const included = sheet.columns.filter((c) => c.include);
  if (!included.length) {
    return { ...sheet, headers: [], rows: [], columns: [] };
  }

  let headers = included.map((c) => c.name);
  let rows = sheet.rows.map((row) =>
    included.map((c) => cleanCell(row[c.index] ?? "", settings))
  );

  if (settings.removeEmptyRows) {
    rows = rows.filter((r) => r.some((c) => c.trim()));
  }

  if (settings.removeEmptyCols) {
    const keep: boolean[] = headers.map((_, i) => rows.some((r) => (r[i] || "").trim()));
    headers = headers.filter((_, i) => keep[i]);
    rows = rows.map((r) => r.filter((_, i) => keep[i]));
  }

  if (settings.removeDuplicates) {
    const seen = new Set<string>();
    rows = rows.filter((r) => {
      const key = r.join("\u0001");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const columns: ColumnMeta[] = headers.map((name, index) => ({
    index,
    name,
    type: included[index]?.type || "text",
    include: true,
  }));

  return { name: sheet.name, headers, rows, columns };
}

export function applyFindReplace(
  sheet: SheetData,
  find: string,
  replace: string
): SheetData {
  if (!find) return sheet;
  const rows = sheet.rows.map((row) =>
    row.map((cell) => cell.split(find).join(replace))
  );
  return { ...sheet, rows };
}

export function reorderColumns(sheet: SheetData, from: number, to: number): SheetData {
  if (from === to || from < 0 || to < 0 || from >= sheet.columns.length || to >= sheet.columns.length) {
    return sheet;
  }
  const columns = [...sheet.columns];
  const [moved] = columns.splice(from, 1);
  columns.splice(to, 0, moved);
  // Re-index for display order only — keep original index for data access until cleanup
  return { ...sheet, columns };
}
