"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type {
  ColumnMeta,
  ColumnType,
  ConverterSettings,
  Delimiter,
  EncodingOption,
  ParsedWorkbook,
} from "@/lib/csv-excel/types";
import { delimiterLabel } from "@/lib/csv-excel/types";

type SettingsPanelProps = {
  settings: ConverterSettings;
  onChange: (next: ConverterSettings) => void;
  workbooks: ParsedWorkbook[];
  activeColumns: ColumnMeta[];
  onColumnsChange: (cols: ColumnMeta[]) => void;
  findText: string;
  replaceText: string;
  onFindChange: (v: string) => void;
  onReplaceChange: (v: string) => void;
  onApplyReplace: () => void;
};

export function SettingsPanel({
  settings,
  onChange,
  workbooks,
  activeColumns,
  onColumnsChange,
  findText,
  replaceText,
  onFindChange,
  onReplaceChange,
  onApplyReplace,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(true);
  const patch = (partial: Partial<ConverterSettings>) => onChange({ ...settings, ...partial });

  return (
    <div className="glass-card rounded-2xl" style={{ border: "1px solid var(--c-border)" }}>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-semibold" style={{ color: "var(--c-heading)" }}>
          Conversion settings
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--c-text-muted)" }}
        />
      </button>

      {open && (
        <div className="space-y-5 border-t px-5 py-5" style={{ borderColor: "var(--c-border)" }}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Delimiter">
              <select
                className="form-input"
                value={settings.delimiter}
                onChange={(e) => patch({ delimiter: e.target.value as Delimiter | "auto" })}
              >
                <option value="auto">Auto-detect</option>
                <option value=",">{delimiterLabel(",")}</option>
                <option value=";">{delimiterLabel(";")}</option>
                <option value={"\t"}>{delimiterLabel("\t")}</option>
                <option value="|">{delimiterLabel("|")}</option>
              </select>
            </Field>

            <Field label="Encoding">
              <select
                className="form-input"
                value={settings.encoding}
                onChange={(e) => patch({ encoding: e.target.value as EncodingOption | "auto" })}
              >
                <option value="auto">Auto-detect</option>
                <option value="utf-8">UTF-8</option>
                <option value="utf-16le">UTF-16 LE</option>
                <option value="utf-16be">UTF-16 BE</option>
                <option value="windows-1252">Windows-1252</option>
                <option value="iso-8859-1">Latin-1 (ISO-8859-1)</option>
              </select>
            </Field>

            <Field label="Date format">
              <select
                className="form-input"
                value={settings.dateFormat}
                onChange={(e) =>
                  patch({ dateFormat: e.target.value as ConverterSettings["dateFormat"] })
                }
              >
                <option value="iso">ISO (YYYY-MM-DD)</option>
                <option value="us">US (MM/DD/YYYY)</option>
                <option value="eu">EU (DD/MM/YYYY)</option>
                <option value="excel">Excel date serial</option>
              </select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--c-text-dim)" }}>
            <Toggle
              label="Override header detection"
              checked={settings.headerOverride}
              onChange={(v) => patch({ headerOverride: v })}
            />
            <Toggle
              label="First row is header"
              checked={settings.hasHeader}
              onChange={(v) => patch({ hasHeader: v, headerOverride: true })}
            />
            <Toggle
              label="UTF-8 BOM (Excel-friendly CSV)"
              checked={settings.utf8Bom}
              onChange={(v) => patch({ utf8Bom: v })}
            />
            <Toggle
              label="Combine into one workbook / zip separately"
              checked={settings.multiOutput === "workbook"}
              onChange={(v) => patch({ multiOutput: v ? "workbook" : "separate-zip" })}
            />
            <Toggle label="Trim whitespace" checked={settings.trimWhitespace} onChange={(v) => patch({ trimWhitespace: v })} />
            <Toggle label="Remove empty rows" checked={settings.removeEmptyRows} onChange={(v) => patch({ removeEmptyRows: v })} />
            <Toggle label="Remove empty columns" checked={settings.removeEmptyCols} onChange={(v) => patch({ removeEmptyCols: v })} />
            <Toggle label="Remove duplicate rows" checked={settings.removeDuplicates} onChange={(v) => patch({ removeDuplicates: v })} />
            <Toggle
              label="Remove special characters"
              checked={settings.removeSpecialChars}
              onChange={(v) => patch({ removeSpecialChars: v })}
            />
          </div>

          {workbooks.some((w) => w.sourceKind === "excel" && w.sheets.length > 1) && (
            <div>
              <p className="mb-2 text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>
                Sheets to export
              </p>
              <div className="flex flex-wrap gap-3">
                {workbooks.map((wb) =>
                  wb.sheets.map((sheet, idx) => {
                    const selected = settings.selectedSheetIndexes[wb.id] ?? wb.sheets.map((_, i) => i);
                    const checked = selected.includes(idx);
                    return (
                      <label
                        key={`${wb.id}-${idx}`}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs"
                        style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                      >
                        <input
                          type="checkbox"
                          className="accent-indigo-500"
                          checked={checked}
                          onChange={() => {
                            const current = settings.selectedSheetIndexes[wb.id] ?? wb.sheets.map((_, i) => i);
                            const next = checked ? current.filter((i) => i !== idx) : [...current, idx];
                            patch({
                              selectedSheetIndexes: {
                                ...settings.selectedSheetIndexes,
                                [wb.id]: next.sort((a, b) => a - b),
                              },
                            });
                          }}
                        />
                        {wb.fileName}: {sheet.name}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeColumns.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>
                Columns · include, reorder, force type
              </p>
              <ul className="space-y-2">
                {activeColumns.map((col, index) => (
                  <li
                    key={`${col.index}-${col.name}`}
                    className="flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-xs"
                    style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", String(index))}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = Number(e.dataTransfer.getData("text/plain"));
                      if (Number.isNaN(from) || from === index) return;
                      const next = [...activeColumns];
                      const [moved] = next.splice(from, 1);
                      next.splice(index, 0, moved);
                      onColumnsChange(next);
                    }}
                  >
                    <span className="cursor-grab opacity-60" style={{ color: "var(--c-text-muted)" }}>
                      ⋮⋮
                    </span>
                    <input
                      type="checkbox"
                      className="accent-indigo-500"
                      checked={col.include}
                      onChange={() => {
                        const next = activeColumns.map((c, i) =>
                          i === index ? { ...c, include: !c.include } : c
                        );
                        onColumnsChange(next);
                      }}
                    />
                    <span className="min-w-0 flex-1 font-medium" style={{ color: "var(--c-heading)" }}>
                      {col.name}
                    </span>
                    <select
                      className="form-input max-w-[140px] py-1 text-xs"
                      value={col.type}
                      onChange={(e) => {
                        const type = e.target.value as ColumnType;
                        onColumnsChange(
                          activeColumns.map((c, i) => (i === index ? { ...c, type } : c))
                        );
                      }}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="currency">Currency</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              className="form-input"
              placeholder="Find in preview…"
              value={findText}
              onChange={(e) => onFindChange(e.target.value)}
            />
            <input
              className="form-input"
              placeholder="Replace with…"
              value={replaceText}
              onChange={(e) => onReplaceChange(e.target.value)}
            />
            <button
              type="button"
              className="btn-secondary cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold"
              onClick={onApplyReplace}
            >
              Replace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        className="accent-indigo-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
