"use client";

import { useState } from "react";
import {
  BookmarkPlus,
  Copy,
  Download,
  FileJson,
  FileSpreadsheet,
  Loader2,
  X,
} from "lucide-react";
import type { BusinessCard } from "@/types/leads";
import {
  copyUniqueField,
  downloadBlob,
  exportFilename,
  leadsToCsv,
  leadsToJson,
  leadsToXlsxBuffer,
} from "@/lib/export-leads";

type Props = {
  selected: BusinessCard[];
  onClear: () => void;
  onSaved?: () => void;
};

export function LeadBulkToolbar({ selected, onClear, onSaved }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const count = selected.length;

  if (!count) return null;

  const trackExport = async (format: "CSV" | "XLSX" | "JSON", rowCount: number) => {
    try {
      await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, rowCount, source: "search" }),
      });
    } catch {
      /* non-blocking */
    }
  };

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setMessage("");
    try {
      await fn();
    } catch {
      setMessage("Action failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const exportCsv = () =>
    run("csv", async () => {
      const blob = new Blob([leadsToCsv(selected)], { type: "text/csv;charset=utf-8" });
      downloadBlob(blob, exportFilename("csv"));
      await trackExport("CSV", count);
      setMessage(`Downloaded ${count} leads as CSV.`);
    });

  const exportXlsx = () =>
    run("xlsx", async () => {
      const buffer = await leadsToXlsxBuffer(selected);
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadBlob(blob, exportFilename("xlsx"));
      await trackExport("XLSX", count);
      setMessage(`Downloaded ${count} leads as Excel.`);
    });

  const exportJson = () =>
    run("json", async () => {
      const blob = new Blob([leadsToJson(selected)], { type: "application/json" });
      downloadBlob(blob, exportFilename("json"));
      await trackExport("JSON", count);
      setMessage(`Downloaded ${count} leads as JSON.`);
    });

  const copyField = (field: "phone" | "email") =>
    run(`copy-${field}`, async () => {
      const text = copyUniqueField(selected, field);
      if (!text) {
        setMessage(`No ${field}s in selection.`);
        return;
      }
      await navigator.clipboard.writeText(text);
      setMessage(`Copied ${text.split("\n").length} unique ${field}s.`);
    });

  const saveSelected = () =>
    run("save", async () => {
      const res = await fetch("/api/saved-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessIds: selected.map((l) => l.id) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not save leads.");
        return;
      }
      setMessage(`Saved ${data.saved} lead(s)${data.skipped ? ` (${data.skipped} already saved)` : ""}.`);
      onSaved?.();
    });

  const btnClass =
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50";

  return (
    <div
      className="sticky top-20 z-20 mb-4 rounded-xl p-3 sm:p-4"
      style={{
        background: "var(--c-bg)",
        border: "1px solid var(--c-border)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold" style={{ color: "var(--c-heading)" }}>
          {count} selected
        </span>

        <button type="button" className={btnClass} style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }} disabled={!!busy} onClick={saveSelected}>
          {busy === "save" ? <Loader2 size={14} className="animate-spin" /> : <BookmarkPlus size={14} />}
          Save List
        </button>
        <button type="button" className={btnClass} style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }} disabled={!!busy} onClick={exportCsv}>
          {busy === "csv" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          CSV
        </button>
        <button type="button" className={btnClass} style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }} disabled={!!busy} onClick={exportXlsx}>
          {busy === "xlsx" ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
          Excel
        </button>
        <button type="button" className={btnClass} style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }} disabled={!!busy} onClick={exportJson}>
          {busy === "json" ? <Loader2 size={14} className="animate-spin" /> : <FileJson size={14} />}
          JSON
        </button>
        <button type="button" className={btnClass} style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }} disabled={!!busy} onClick={() => copyField("email")}>
          <Copy size={14} /> Emails
        </button>
        <button type="button" className={btnClass} style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }} disabled={!!busy} onClick={() => copyField("phone")}>
          <Copy size={14} /> Phones
        </button>
        <button
          type="button"
          className={btnClass}
          style={{ color: "var(--c-text-dim)" }}
          onClick={onClear}
          disabled={!!busy}
          aria-label="Clear selection"
        >
          <X size={14} /> Clear
        </button>
      </div>
      {message && (
        <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
          {message}
        </p>
      )}
    </div>
  );
}
