import type { ColumnType, Delimiter, EncodingOption } from "./types";

const DELIMS: Delimiter[] = [",", ";", "\t", "|"];

export function detectDelimiter(sample: string): Delimiter {
  const lines = sample.split(/\r?\n/).filter((l) => l.trim()).slice(0, 12);
  if (!lines.length) return ",";

  let best: Delimiter = ",";
  let bestScore = -1;

  for (const d of DELIMS) {
    const counts = lines.map((line) => countUnquoted(line, d));
    const mode = mostCommon(counts.filter((c) => c > 0));
    if (mode == null) continue;
    const consistency = counts.filter((c) => c === mode).length;
    const score = mode * 10 + consistency;
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best;
}

function countUnquoted(line: string, delim: string): number {
  let count = 0;
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && ch === delim) count += 1;
  }
  return count;
}

function mostCommon(nums: number[]): number | null {
  if (!nums.length) return null;
  const map = new Map<number, number>();
  for (const n of nums) map.set(n, (map.get(n) || 0) + 1);
  let best = nums[0];
  let bestC = 0;
  for (const [k, v] of map) {
    if (v > bestC) {
      best = k;
      bestC = v;
    }
  }
  return best;
}

export function detectEncoding(buffer: ArrayBuffer): EncodingOption {
  const bytes = new Uint8Array(buffer.slice(0, 4));
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return "utf-8";
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return "utf-16le";
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return "utf-16be";

  // Heuristic: high Latin-1 / Windows-1252 bytes without valid UTF-8
  try {
    const dec = new TextDecoder("utf-8", { fatal: true });
    dec.decode(buffer.slice(0, Math.min(buffer.byteLength, 64 * 1024)));
    return "utf-8";
  } catch {
    const sample = new Uint8Array(buffer.slice(0, Math.min(buffer.byteLength, 8 * 1024)));
    let high = 0;
    for (const b of sample) if (b >= 0x80) high += 1;
    // Prefer windows-1252 for Western European CSVs from Excel
    return high > 0 ? "windows-1252" : "utf-8";
  }
}

export function decodeBuffer(buffer: ArrayBuffer, encoding: EncodingOption): string {
  let start = 0;
  const bytes = new Uint8Array(buffer);
  if (encoding === "utf-8" && bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    start = 3;
  }
  if (
    (encoding === "utf-16le" || encoding === "utf-16be") &&
    bytes.length >= 2 &&
    ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff))
  ) {
    start = 2;
  }

  const label =
    encoding === "windows-1252"
      ? "windows-1252"
      : encoding === "iso-8859-1"
        ? "iso-8859-1"
        : encoding === "utf-16le"
          ? "utf-16le"
          : encoding === "utf-16be"
            ? "utf-16be"
            : "utf-8";

  try {
    return new TextDecoder(label).decode(buffer.slice(start));
  } catch {
    return new TextDecoder("utf-8").decode(buffer.slice(start));
  }
}

export function looksLikeHeader(row: string[]): boolean {
  if (!row.length) return false;
  const nonEmpty = row.filter((c) => c.trim());
  if (!nonEmpty.length) return false;
  let textish = 0;
  for (const cell of nonEmpty) {
    const t = cell.trim();
    if (!/^-?\d+(\.\d+)?%?$/.test(t) && !/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(t)) {
      textish += 1;
    }
  }
  return textish / nonEmpty.length >= 0.6;
}

export function detectColumnType(values: string[]): ColumnType {
  const sample = values.map((v) => v.trim()).filter(Boolean).slice(0, 80);
  if (!sample.length) return "text";

  let numbers = 0;
  let dates = 0;
  let currency = 0;
  let percent = 0;

  for (const v of sample) {
    if (/^-?\d+(\.\d+)?%$/.test(v)) {
      percent += 1;
      continue;
    }
    if (/^[$€£¥]\s?-?[\d,]+(\.\d+)?$/.test(v) || /^-?[\d,]+(\.\d+)?\s?[$€£¥]$/.test(v)) {
      currency += 1;
      continue;
    }
    if (isDateLike(v)) {
      dates += 1;
      continue;
    }
    // Preserve leading zeros / long IDs as text
    if (/^0\d+$/.test(v) || /^\d{11,}$/.test(v)) continue;
    if (/^-?[\d,]+(\.\d+)?$/.test(v)) numbers += 1;
  }

  const n = sample.length;
  if (percent / n >= 0.6) return "percentage";
  if (currency / n >= 0.6) return "currency";
  if (dates / n >= 0.6) return "date";
  if (numbers / n >= 0.7) return "number";
  return "text";
}

function isDateLike(v: string): boolean {
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return true;
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(v)) return true;
  const t = Date.parse(v);
  return !Number.isNaN(t) && /[a-zA-Z/-]/.test(v);
}

export function buildColumns(headers: string[], rows: string[][]): import("./types").ColumnMeta[] {
  return headers.map((name, index) => {
    const values = rows.map((r) => r[index] ?? "");
    return {
      index,
      name: name || `Column ${index + 1}`,
      type: detectColumnType(values),
      include: true,
    };
  });
}
