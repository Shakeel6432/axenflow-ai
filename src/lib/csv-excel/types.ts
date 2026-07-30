export type Delimiter = "," | ";" | "\t" | "|";
export type EncodingOption = "utf-8" | "utf-16le" | "utf-16be" | "windows-1252" | "iso-8859-1";
export type DateFormatOption = "iso" | "us" | "eu" | "excel";
export type ColumnType = "text" | "number" | "date" | "currency" | "percentage";
export type FileStatus = "queued" | "reading" | "detecting" | "formatting" | "generating" | "done" | "error";
export type ConvertDirection = "csv-to-excel" | "excel-to-csv";
export type MultiOutputMode = "workbook" | "separate-zip";

export type ColumnMeta = {
  index: number;
  name: string;
  type: ColumnType;
  include: boolean;
};

export type SheetData = {
  name: string;
  headers: string[];
  rows: string[][];
  columns: ColumnMeta[];
};

export type ParsedWorkbook = {
  id: string;
  fileName: string;
  fileSize: number;
  sourceKind: "csv" | "excel";
  sheets: SheetData[];
  detectedDelimiter?: Delimiter;
  detectedEncoding?: EncodingOption;
  warnings: string[];
};

export type QueueItem = {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
  parsed?: ParsedWorkbook;
};

export type ConverterSettings = {
  direction: ConvertDirection;
  delimiter: Delimiter | "auto";
  encoding: EncodingOption | "auto";
  hasHeader: boolean;
  headerOverride: boolean;
  dateFormat: DateFormatOption;
  multiOutput: MultiOutputMode;
  utf8Bom: boolean;
  trimWhitespace: boolean;
  removeEmptyRows: boolean;
  removeEmptyCols: boolean;
  removeDuplicates: boolean;
  removeSpecialChars: boolean;
  selectedSheetIndexes: Record<string, number[]>;
};

export type HistoryEntry = {
  id: string;
  at: number;
  label: string;
  bytes: number;
  mime: string;
  /** Object URL lasting for session — revoked on clear */
  objectUrl: string;
};

export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const PREVIEW_ROWS = 20;
export const PREVIEW_COLS = 10;
export const HISTORY_KEY = "axenflow-csv-excel-history-v1";

export const DEFAULT_SETTINGS: ConverterSettings = {
  direction: "csv-to-excel",
  delimiter: "auto",
  encoding: "auto",
  hasHeader: true,
  headerOverride: false,
  dateFormat: "iso",
  multiOutput: "workbook",
  utf8Bom: true,
  trimWhitespace: true,
  removeEmptyRows: true,
  removeEmptyCols: false,
  removeDuplicates: false,
  removeSpecialChars: false,
  selectedSheetIndexes: {},
};

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function delimiterLabel(d: Delimiter): string {
  if (d === "\t") return "Tab";
  if (d === ",") return "Comma";
  if (d === ";") return "Semicolon";
  return "Pipe";
}

export function sheetNameFromFile(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").replace(/[\\/?*[\]]/g, "_").trim() || "Sheet";
  return base.slice(0, 31);
}
