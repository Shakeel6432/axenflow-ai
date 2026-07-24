"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { rowsToCsv } from "@/lib/bbb-validate";

type Result = {
  original: string;
  normalizedPhone: string;
  status: string;
  label: string;
  snippet: string;
};

type Counts = {
  total: number;
  onWhatsApp: number;
  notOnWhatsApp: number;
  unknown: number;
  badNumber: number;
  error: number;
};

type ProviderStatus = {
  configured: boolean;
  source: string | null;
  bridgeHealth: boolean | null;
  hint: string;
};

function statusColor(status: string): string {
  if (status === "yes") return "#25D366";
  if (status === "no") return "#f87171";
  if (status === "unknown") return "#fbbf24";
  if (status === "bad_number") return "var(--c-text-muted)";
  if (status === "error") return "#ef4444";
  return "var(--c-heading)";
}

export function WhatsAppCheckerClient() {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("1");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [provider, setProvider] = useState<ProviderStatus | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/tools/whatsapp-checker");
        if (!res.ok) return;
        setProvider((await res.json()) as ProviderStatus);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function run(payload: FormData | object) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/tools/whatsapp-checker", {
        method: "POST",
        ...(payload instanceof FormData
          ? { body: payload }
          : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
      });
      const data = await res.json();
      if (!res.ok) {
        const hint = typeof data.hint === "string" ? `\n${data.hint}` : "";
        throw new Error(`${data.error || "Check failed"}${hint}`);
      }
      setResults(data.results || []);
      setCounts(data.counts || null);
      setMsg(`Checked ${data.counts?.total || 0} number(s)`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Check failed");
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
    await run({ phone: phone.trim(), countryCode });
  }

  async function onFile(file: File | null) {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("countryCode", countryCode);
    await run(form);
  }

  function resultRows(source: Result[]) {
    return source.map((r) => ({
      Original: r.original,
      Normalized: r.normalizedPhone,
      Status: r.label,
      "WhatsApp Status": r.status,
      Snippet: r.snippet,
    }));
  }

  function pickSource(onWhatsAppOnly: boolean) {
    const source = onWhatsAppOnly
      ? results.filter((r) => r.status === "yes")
      : results;
    if (!source.length) {
      setMsg(
        onWhatsAppOnly
          ? "No WhatsApp numbers to download. Run a check first."
          : "No results to download"
      );
      return null;
    }
    return source;
  }

  function downloadCsv(onWhatsAppOnly = false) {
    const source = pickSource(onWhatsAppOnly);
    if (!source) return;
    const blob = new Blob(["\uFEFF" + rowsToCsv(resultRows(source))], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = onWhatsAppOnly ? "whatsapp-on-wa.csv" : "whatsapp-check-results.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg(`Downloaded ${source.length} row(s) as CSV`);
  }

  function clearResults() {
    setResults([]);
    setCounts(null);
    setMsg("Results cleared. Check a new number or upload a new file.");
  }

  const preview = results.slice(0, 10);
  const onWaCount = results.filter((r) => r.status === "yes").length;

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
              Checking WhatsApp numbers
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
              This may take a moment for bulk lists...
            </p>
          </div>
        </div>
      )}

      <section className="rounded-2xl p-5" style={{ border: "1px solid var(--c-border)" }}>
        <h2 className="text-base font-semibold" style={{ color: "var(--c-heading)" }}>
          How it works
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
          Uses the same WhatsApp Web session as your desktop checker via a local bridge, or a
          configured lookup API on production. Upload CSV with a <strong>number</strong> or{" "}
          <strong>phone</strong> column (max 150 per run).
        </p>
        {provider?.bridgeHealth === false && (
          <pre
            className="mt-4 overflow-x-auto rounded-xl p-4 text-xs leading-relaxed whitespace-pre-wrap"
            style={{ background: "rgba(239,68,68,0.08)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            {provider.hint ||
              "Start the bridge:\ncd \"Whatsapp number checker\"\npython whatsapp_checker_server.py"}
          </pre>
        )}
        {provider?.source === "dev-bridge" && provider.bridgeHealth && (
          <p className="mt-3 text-sm font-medium" style={{ color: "#25D366" }}>
            Desktop bridge connected. Ready to check numbers.
          </p>
        )}
      </section>

      <section className="space-y-3 rounded-2xl p-5" style={{ border: "1px solid var(--c-border)" }}>
        <label className="block max-w-xs">
          <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--c-heading)" }}>
            Default country code
          </span>
          <input
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.replace(/\D/g, ""))}
            placeholder="1"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              border: "1px solid var(--c-border)",
              background: "var(--c-hover-bg)",
              color: "var(--c-heading)",
            }}
          />
          <span className="mt-1 block text-xs" style={{ color: "var(--c-text-muted)" }}>
            Used when a number has 10 digits without country prefix (e.g. US/Canada = 1).
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--c-heading)" }}>
            Single number
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 415 555 2671 or 4155552671"
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
            Check WhatsApp
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
      </section>

      {msg && (
        <p className="whitespace-pre-wrap text-sm" style={{ color: "var(--c-text-dim)" }}>
          {msg}
        </p>
      )}

      {counts && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Total", counts.total],
            ["On WhatsApp", counts.onWhatsApp],
            ["Not on WA", counts.notOnWhatsApp],
            ["Unknown", counts.unknown],
            ["Invalid", counts.badNumber],
            ["Errors", counts.error],
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
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={clearResults}>
              Clear results
            </Button>
          </div>
          <div className="space-y-2 rounded-2xl p-4" style={{ border: "1px solid var(--c-border)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--c-heading)" }}>
              Download on WhatsApp only ({onWaCount})
            </p>
            <Button type="button" variant="green" onClick={() => downloadCsv(true)}>
              CSV
            </Button>
            <p className="pt-2 text-sm font-medium" style={{ color: "var(--c-heading)" }}>
              Download all ({results.length})
            </p>
            <Button type="button" variant="outline" onClick={() => downloadCsv(false)}>
              CSV
            </Button>
          </div>
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--c-border)" }}>
            <table className="min-w-full text-left text-sm">
              <thead style={{ background: "var(--c-hover-bg)" }}>
                <tr>
                  {["Original", "Normalized", "Status", "Details"].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-3 py-2 font-semibold"
                      style={{ color: "var(--c-heading)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={`${r.original}-${i}`} style={{ borderTop: "1px solid var(--c-border)" }}>
                    <td
                      className="max-w-[180px] truncate px-3 py-2"
                      style={{ color: "var(--c-heading)" }}
                    >
                      {r.original || "-"}
                    </td>
                    <td className="px-3 py-2">{r.normalizedPhone || "-"}</td>
                    <td className="px-3 py-2 font-medium" style={{ color: statusColor(r.status) }}>
                      {r.label}
                    </td>
                    <td
                      className="max-w-[280px] truncate px-3 py-2"
                      style={{ color: "var(--c-text-dim)" }}
                      title={r.snippet}
                    >
                      {r.snippet || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length > preview.length && (
              <p className="px-3 py-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
                Showing first {preview.length} of {results.length}. Download CSV for full results.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
