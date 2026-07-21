"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DEFAULT_EMAIL_OPTIONS, type EmailCheckOptions } from "@/lib/validators/email";
import { rowsToCsv } from "@/lib/bbb-validate";

type Result = {
  email: string;
  status: string;
  syntax: string;
  dns: string;
  mx: string;
  disposable: boolean | null;
  role: boolean | null;
  hardBounceEstimate: string;
  notes: string[];
};

const OPTION_META: { key: keyof EmailCheckOptions; label: string; help: string }[] = [
  { key: "syntax", label: "Syntax check", help: "Valid email format" },
  { key: "dns", label: "DNS record", help: "Domain resolves (A/AAAA)" },
  { key: "mx", label: "MX record", help: "Domain can receive mail" },
  { key: "disposable", label: "Disposable filter", help: "Temp-mail domains" },
  { key: "role", label: "Role account flag", help: "info@, admin@, etc." },
  {
    key: "hardBounceEstimate",
    label: "Hard bounce estimate",
    help: "Likely undeliverable (not a real send)",
  },
  { key: "keepOneOnly", label: "Keep one email", help: "If cell has multiple, keep first valid" },
];

export function EmailValidatorClient() {
  const [options, setOptions] = useState<EmailCheckOptions>({ ...DEFAULT_EMAIL_OPTIONS });
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  function toggle(key: keyof EmailCheckOptions) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function run(payload: FormData | object) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/tools/email-validator", {
        method: "POST",
        ...(payload instanceof FormData
          ? { body: payload }
          : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");
      setResults(data.results || []);
      setCounts(data.counts || null);
      setMsg(`Validated ${data.counts?.total || 0} email(s)`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Validation failed");
      setResults([]);
      setCounts(null);
    } finally {
      setBusy(false);
    }
  }

  async function onSingle() {
    if (!email.trim()) {
      setMsg("Enter an email address");
      return;
    }
    await run({ email: email.trim(), options });
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
      Email: r.email,
      Status: r.status,
      Syntax: r.syntax,
      DNS: r.dns,
      MX: r.mx,
      Disposable: r.disposable == null ? "" : String(r.disposable),
      Role: r.role == null ? "" : String(r.role),
      "Hard Bounce Estimate": r.hardBounceEstimate,
      Notes: (r.notes || []).join("; "),
    }));
    const blob = new Blob(["\uFEFF" + rowsToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "email-validated.csv";
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
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
            <p className="font-semibold" style={{ color: "var(--c-heading)" }}>
              Validating emails
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
              Running selected checks...
            </p>
          </div>
        </div>
      )}

      <section className="rounded-2xl p-5" style={{ border: "1px solid var(--c-border)" }}>
        <h2 className="text-base font-semibold" style={{ color: "var(--c-heading)" }}>
          Checks to run
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
          Soft bounce needs real email delivery and is not available here. Hard bounce is an estimate
          from DNS/MX only.
        </p>
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
            Single email
          </span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
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
            Validate email
          </Button>
          <label className="inline-flex cursor-pointer items-center rounded-xl px-4 py-2 text-sm font-semibold" style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}>
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
          CSV should include an Emails / Email column (BBB scraper format works).
        </p>
      </section>

      {msg && (
        <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>
          {msg}
        </p>
      )}

      {counts && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Total", counts.total],
            ["Valid", counts.valid],
            ["Invalid", counts.invalid],
            ["Unknown", counts.unknown],
            ["Disposable", counts.disposable],
            ["Hard bounce ~", counts.hardBounceLikely],
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
                  {["Email", "Status", "Syntax", "DNS", "MX", "Hard bounce", "Notes"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 font-semibold" style={{ color: "var(--c-heading)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 50).map((r, i) => (
                  <tr key={`${r.email}-${i}`} style={{ borderTop: "1px solid var(--c-border)" }}>
                    <td className="max-w-[220px] truncate px-3 py-2" style={{ color: "var(--c-heading)" }}>
                      {r.email || "-"}
                    </td>
                    <td className="px-3 py-2 font-medium">{r.status}</td>
                    <td className="px-3 py-2">{r.syntax}</td>
                    <td className="px-3 py-2">{r.dns}</td>
                    <td className="px-3 py-2">{r.mx}</td>
                    <td className="px-3 py-2">{r.hardBounceEstimate}</td>
                    <td className="max-w-[240px] truncate px-3 py-2" style={{ color: "var(--c-text-dim)" }}>
                      {(r.notes || []).join("; ") || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length > 50 && (
              <p className="px-3 py-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
                Showing first 50 of {results.length}. Download CSV for full results.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
