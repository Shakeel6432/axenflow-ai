"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { rowsToCsv, type ValidatedLead } from "@/lib/bbb-validate";

type ValidateResponse = {
  ok?: boolean;
  error?: string;
  total?: number;
  valid?: number;
  invalid?: number;
  unknown?: number;
  emails_valid?: number;
  phones_valid?: number;
  phones_collapsed?: number;
  emails_collapsed?: number;
  rows?: ValidatedLead[];
};

export function ValidateClient() {
  const [rows, setRows] = useState<ValidatedLead[]>([]);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("Preparing...");
  const [msg, setMsg] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    unknown: 0,
    emails_valid: 0,
    phones_valid: 0,
    phones_collapsed: 0,
    emails_collapsed: 0,
  });

  const preview = useMemo(() => rows.slice(0, 12), [rows]);

  async function onFile(file: File | null) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setMsg("Please upload a .csv file from the BBB scraper.");
      return;
    }

    setBusy(true);
    setProgress("Uploading and validating...");
    setMsg("");
    setRows([]);

    try {
      const form = new FormData();
      form.append("file", file);

      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 90000);

      const res = await fetch("/api/bbb/validate", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      window.clearTimeout(timer);

      const data = (await res.json().catch(() => ({}))) as ValidateResponse;
      if (!res.ok) {
        throw new Error(data.error || "Validation failed");
      }

      const nextRows = data.rows || [];
      setRows(nextRows);
      setFileName(file.name);
      setStats({
        total: data.total || nextRows.length,
        valid: data.valid || 0,
        invalid: data.invalid || 0,
        unknown: data.unknown || 0,
        emails_valid: data.emails_valid || 0,
        phones_valid: data.phones_valid || 0,
        phones_collapsed: data.phones_collapsed || 0,
        emails_collapsed: data.emails_collapsed || 0,
      });
      setMsg(
        `Done: ${data.total || 0} rows · ${data.phones_collapsed || 0} multi-phone cleaned · ` +
          `${data.emails_valid || 0} valid emails · ${data.phones_valid || 0} valid phones`
      );
    } catch (err) {
      const text =
        err instanceof Error
          ? err.name === "AbortError"
            ? "Validation timed out. Try a smaller CSV."
            : err.message
          : "Could not validate file";
      setMsg(text);
    } finally {
      setBusy(false);
      setProgress("Preparing...");
    }
  }

  function download() {
    if (!rows.length) return;
    const blob = new Blob(["\uFEFF" + rowsToCsv(rows)], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName.replace(/\.csv$/i, "") + "_validated.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      {busy && (
        <div
          className="fixed inset-0 z-50 grid place-items-center"
          style={{ background: "rgba(5,5,9,0.72)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-[min(340px,calc(100vw-2rem))] rounded-2xl px-8 py-6 text-center"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-card, #12101c)" }}
          >
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
            <p className="font-semibold" style={{ color: "var(--c-heading)" }}>
              Validating leads
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
              {progress}
            </p>
            <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
              Cleaning phones, checking email domains...
            </p>
          </div>
        </div>
      )}

      <label
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl px-6 py-10 text-center transition hover:opacity-95"
        style={{ border: "1px dashed var(--c-border)", background: "var(--c-hover-bg)" }}
      >
        <span
          className="font-[var(--font-space)] text-lg font-semibold"
          style={{ color: "var(--c-heading)" }}
        >
          Upload scraper CSV
        </span>
        <span className="mt-1 max-w-md text-sm" style={{ color: "var(--c-text-dim)" }}>
          Keeps one phone per row, formats US numbers, and checks email syntax + domain (MX/DNS).
        </span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-4 text-sm"
          disabled={busy}
          onChange={(e) => {
            void onFile(e.target.files?.[0] || null);
            e.currentTarget.value = "";
          }}
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
              ["Valid leads", stats.valid],
              ["Invalid", stats.invalid],
              ["Unknown", stats.unknown],
              ["Valid emails", stats.emails_valid],
              ["Valid phones", stats.phones_valid],
              ["Phones cleaned", stats.phones_collapsed],
              ["Emails cleaned", stats.emails_collapsed],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-xl p-3"
                style={{ border: "1px solid var(--c-border)" }}
              >
                <div
                  className="text-xs uppercase tracking-wide"
                  style={{ color: "var(--c-text-muted)" }}
                >
                  {label}
                </div>
                <div className="mt-1 text-xl font-bold" style={{ color: "var(--c-heading)" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={download} variant="green">
              Download validated CSV
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--c-border)" }}>
            <table className="min-w-full text-left text-sm">
              <thead style={{ background: "var(--c-hover-bg)" }}>
                <tr>
                  {["Business Name", "Phone", "Email", "Email Status", "Phone Status", "Lead"].map(
                    (h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-3 py-2 font-semibold"
                        style={{ color: "var(--c-heading)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={`${row["Business Name"]}-${i}`} style={{ borderTop: "1px solid var(--c-border)" }}>
                    <td className="max-w-[180px] truncate px-3 py-2" style={{ color: "var(--c-heading)" }}>
                      {row["Business Name"] || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2" style={{ color: "var(--c-text-dim)" }}>
                      {row["Phone Numbers"] || "-"}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2" style={{ color: "var(--c-text-dim)" }}>
                      {row.Emails || "-"}
                    </td>
                    <td className="px-3 py-2">{row["Email Status"]}</td>
                    <td className="px-3 py-2">{row["Phone Status"]}</td>
                    <td className="px-3 py-2 font-medium">{row["Lead Status"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > preview.length && (
              <p className="px-3 py-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
                Showing first {preview.length} of {rows.length} rows. Download CSV for full results.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
