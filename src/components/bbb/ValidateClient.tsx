"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

type Row = Record<string, string>;

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

function firstValue(raw: string) {
  const parts = String(raw || "")
    .split(/[|;,]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts[0] || "";
}

function phoneStatus(raw: string) {
  const phone = firstValue(raw);
  if (!phone) return "Unknown";
  const digits = phone.replace(/\D+/g, "");
  if (/^\+?1?\d{10}$/.test(digits) || (digits.length >= 7 && digits.length <= 15)) {
    return "Valid";
  }
  return "Invalid";
}

function emailStatus(raw: string) {
  const email = firstValue(raw).toLowerCase();
  if (!email) return "Unknown";
  return EMAIL_RE.test(email) ? "Valid" : "Invalid";
}

function parseCsv(text: string): Row[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: Row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function toCsv(rows: Row[], headers: string[]) {
  const esc = (v: string) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h] || "")).join(","))].join(
    "\n"
  );
}

export function ValidateClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const stats = useMemo(() => {
    let phonesCollapsed = 0;
    let valid = 0;
    let invalid = 0;
    let unknown = 0;
    for (const r of rows) {
      const phones = String(r["Phone Numbers"] || "");
      if (/[|;,]/.test(phones) && phones.split(/[|;,]/).filter((p) => p.trim()).length > 1) {
        phonesCollapsed += 1;
      }
      const status = r["Lead Status"] || "Unknown";
      if (status === "Valid") valid += 1;
      else if (status === "Invalid") invalid += 1;
      else unknown += 1;
    }
    return { phonesCollapsed, valid, invalid, unknown, total: rows.length };
  }, [rows]);

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setMsg("Reading CSV...");
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      const cleaned = parsed.map((row) => {
        const phone = firstValue(row["Phone Numbers"] || row.phone || "");
        const email = firstValue(row.Emails || row.email || "");
        const es = emailStatus(email);
        const ps = phoneStatus(phone);
        let lead = "Unknown";
        if (es === "Invalid" || ps === "Invalid") lead = "Invalid";
        else if (es === "Valid" || ps === "Valid") lead = "Valid";
        return {
          ...row,
          "Phone Numbers": phone,
          Emails: email,
          "Email Status": es,
          "Phone Status": ps,
          "Lead Status": lead,
        };
      });
      setRows(cleaned);
      setFileName(file.name);
      setMsg(`Validated ${cleaned.length} rows. Multi-phone cells reduced to one number.`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not read file");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const blob = new Blob([toCsv(rows, headers)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName.replace(/\.csv$/i, "") + "_validated.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      {busy && (
        <div
          className="fixed inset-0 z-50 grid place-items-center"
          style={{ background: "rgba(5,5,9,0.72)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="rounded-2xl px-8 py-6 text-center"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-card, #12101c)" }}
          >
            <div
              className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"
            />
            <p className="font-semibold" style={{ color: "var(--c-heading)" }}>
              Validating leads
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
              Cleaning phones and checking emails...
            </p>
          </div>
        </div>
      )}

      <label
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl px-6 py-10 text-center"
        style={{ border: "1px dashed var(--c-border)", background: "var(--c-hover-bg)" }}
      >
        <span className="font-[var(--font-space)] text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
          Upload scraper CSV
        </span>
        <span className="mt-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
          We keep one phone per row and mark email/phone Valid, Invalid, or Unknown
        </span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-4 text-sm"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </label>

      {msg && (
        <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>
          {msg}
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Total", stats.total],
              ["Valid", stats.valid],
              ["Invalid", stats.invalid],
              ["Phones cleaned", stats.phonesCollapsed],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-xl p-3"
                style={{ border: "1px solid var(--c-border)" }}
              >
                <div className="text-xs uppercase tracking-wide" style={{ color: "var(--c-text-muted)" }}>
                  {label}
                </div>
                <div className="mt-1 text-xl font-bold" style={{ color: "var(--c-heading)" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
          <Button type="button" onClick={download} variant="green">
            Download validated CSV
          </Button>
        </>
      )}
    </div>
  );
}
