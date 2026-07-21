"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DEFAULT_PHONE_OPTIONS, type PhoneCheckOptions } from "@/lib/validators/phone";
import { rowsToCsv } from "@/lib/bbb-validate";

type Result = {
  original: string;
  phone: string;
  status: string;
  digits: string;
  tollFree: boolean | null;
  shortCode: boolean | null;
  collapsed: boolean;
  notes: string[];
};

const OPTION_META: { key: keyof PhoneCheckOptions; label: string; help: string }[] = [
  { key: "format", label: "Format check", help: "US / E.164 length rules" },
  { key: "normalizeUs", label: "Normalize US format", help: "(XXX) XXX-XXXX" },
  { key: "keepOneOnly", label: "Keep one number", help: "If cell has a|b|c, keep first valid" },
  { key: "rejectShort", label: "Reject short codes", help: "Under 7 digits = invalid" },
  { key: "rejectTollFree", label: "Reject toll-free", help: "800 / 888 / 877 ..." },
];

export function PhoneValidatorClient() {
  const [options, setOptions] = useState<PhoneCheckOptions>({ ...DEFAULT_PHONE_OPTIONS });
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  function toggle(key: keyof PhoneCheckOptions) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function run(payload: FormData | object) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/tools/phone-validator", {
        method: "POST",
        ...(payload instanceof FormData
          ? { body: payload }
          : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");
      setResults(data.results || []);
      setCounts(data.counts || null);
      setMsg(`Validated ${data.counts?.total || 0} phone(s)`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Validation failed");
      setResults([]);
      setCounts(null);
    } finally {
      setBusy(false);
    }
  }

  async function onSingle() {
    if (!phone.trim()) {
      setMsg("Enter a phone number");
      return;
    }
    await run({ phone: phone.trim(), options });
  }

  async function onFile(file: File | null) {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("options", JSON.stringify(options));
    await run(form);
  }

  function download() {
    if (!results.length) return;
    const rows = results.map((r) => ({
      Original: r.original,
      Phone: r.phone,
      Status: r.status,
      Digits: r.digits,
      Collapsed: String(r.collapsed),
      "Toll Free": r.tollFree == null ? "" : String(r.tollFree),
      Notes: (r.notes || []).join("; "),
    }));
    const blob = new Blob(["\uFEFF" + rowsToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "phone-validated.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {busy && (
        <div
          className="fixed inset-0 z-50 grid place-items-center"
          style={{ background: "rgba(5,5,9,0.72)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="rounded-2xl px-8 py-6 text-center"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-card, #12101c)" }}
          >
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
            <p className="font-semibold" style={{ color: "var(--c-heading)" }}>
              Validating phones
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
              Cleaning and checking numbers...
            </p>
          </div>
        </div>
      )}

      <section className="rounded-2xl p-5" style={{ border: "1px solid var(--c-border)" }}>
        <h2 className="text-base font-semibold" style={{ color: "var(--c-heading)" }}>
          Checks to run
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {OPTION_META.map((opt) => (
            <label key={opt.key} className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={!!options[opt.key]}
                onChange={() => toggle(opt.key)}
              />
              <span>
                <span className="font-medium" style={{ color: "var(--c-heading)" }}>
                  {opt.label}
                </span>
                <span className="mt-0.5 block" style={{ color: "var(--c-text-muted)" }}>
                  {opt.help}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl p-5" style={{ border: "1px solid var(--c-border)" }}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--c-heading)" }}>
            Single phone
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(602) 265-8566 | (623) 931-5467"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              border: "1px solid var(--c-border)",
              background: "var(--c-hover-bg)",
              color: "var(--c-heading)",
            }}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="green" onClick={() => void onSingle()}>
            Validate phone
          </Button>
          <label
            className="inline-flex cursor-pointer items-center rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
          >
            Upload CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                void onFile(e.target.files?.[0] || null);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>
          CSV should include a Phone Numbers / Phone column.
        </p>
      </section>

      {msg && (
        <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>
          {msg}
        </p>
      )}

      {counts && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["Total", counts.total],
            ["Valid", counts.valid],
            ["Invalid", counts.invalid],
            ["Unknown", counts.unknown],
            ["Multi cleaned", counts.collapsed],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl p-3" style={{ border: "1px solid var(--c-border)" }}>
              <div className="text-xs uppercase tracking-wide" style={{ color: "var(--c-text-muted)" }}>
                {label}
              </div>
              <div className="mt-1 text-xl font-bold" style={{ color: "var(--c-heading)" }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <>
          <Button type="button" variant="outline" onClick={download}>
            Download results CSV
          </Button>
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--c-border)" }}>
            <table className="min-w-full text-left text-sm">
              <thead style={{ background: "var(--c-hover-bg)" }}>
                <tr>
                  {["Original", "Clean phone", "Status", "Digits", "Notes"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 font-semibold" style={{ color: "var(--c-heading)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 50).map((r, i) => (
                  <tr key={`${r.phone}-${i}`} style={{ borderTop: "1px solid var(--c-border)" }}>
                    <td className="max-w-[200px] truncate px-3 py-2" style={{ color: "var(--c-text-dim)" }}>
                      {r.original || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2" style={{ color: "var(--c-heading)" }}>
                      {r.phone || "-"}
                    </td>
                    <td className="px-3 py-2 font-medium">{r.status}</td>
                    <td className="px-3 py-2">{r.digits || "-"}</td>
                    <td className="max-w-[240px] truncate px-3 py-2" style={{ color: "var(--c-text-dim)" }}>
                      {(r.notes || []).join("; ") || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
