"use client";

import { PREVIEW_COLS, PREVIEW_ROWS, type SheetData } from "@/lib/csv-excel/types";

type PreviewTableProps = {
  sheet: SheetData | null;
  emptyHint?: string;
};

export function PreviewTable({ sheet, emptyHint }: PreviewTableProps) {
  if (!sheet || (!sheet.headers.length && !sheet.rows.length)) {
    return (
      <div
        className="rounded-xl px-4 py-8 text-center text-sm"
        style={{ background: "var(--c-hover-bg)", color: "var(--c-text-muted)", border: "1px dashed var(--c-border)" }}
      >
        {emptyHint || "Upload a file to see a live preview of the first rows."}
      </div>
    );
  }

  const headers = sheet.headers.slice(0, PREVIEW_COLS);
  const rows = sheet.rows.slice(0, PREVIEW_ROWS);
  const extraCols = Math.max(0, sheet.headers.length - PREVIEW_COLS);
  const extraRows = Math.max(0, sheet.rows.length - PREVIEW_ROWS);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
        <span>
          Preview · {sheet.name} · {sheet.rows.length.toLocaleString()} rows · {sheet.headers.length} columns
        </span>
        {(extraCols > 0 || extraRows > 0) && (
          <span>
            Showing first {Math.min(PREVIEW_ROWS, sheet.rows.length)} × {Math.min(PREVIEW_COLS, sheet.headers.length)}
            {extraCols || extraRows ? " (truncated)" : ""}
          </span>
        )}
      </div>
      <div
        className="overflow-x-auto rounded-xl"
        style={{ border: "1px solid var(--c-border)", background: "var(--c-surface-solid)" }}
      >
        <table className="min-w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr style={{ background: "rgba(79,70,229,0.9)" }}>
              {headers.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-3 py-2.5 font-semibold text-white"
                >
                  {h}
                </th>
              ))}
              {extraCols > 0 && (
                <th className="px-3 py-2.5 font-semibold text-white/80">+{extraCols} more</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  background: ri % 2 === 0 ? "transparent" : "var(--c-hover-bg)",
                  color: "var(--c-text-dim)",
                }}
              >
                {headers.map((_, ci) => (
                  <td key={ci} className="max-w-[220px] truncate whitespace-nowrap px-3 py-2">
                    {row[ci] || ""}
                  </td>
                ))}
                {extraCols > 0 && <td className="px-3 py-2 opacity-50">…</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {extraRows > 0 && (
        <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>
          +{extraRows.toLocaleString()} more rows not shown in preview
        </p>
      )}
    </div>
  );
}
