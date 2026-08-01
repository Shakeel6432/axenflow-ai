"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Search, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { consumeDailyCheck, peekDailyRemaining } from "@/lib/free-check-quota";
import { CheckRowIcon } from "@/components/tools/validators/ValidityBadge";

type Confidence = "High" | "Medium" | "Low" | "Invalid";

type Candidate = {
  email: string;
  pattern: string;
  patternLabel: string;
  weight: number;
  confidence: Confidence;
  reason: string;
  rank: number;
};

type FinderResult = {
  domain: string;
  firstName: string;
  lastName: string;
  mxValid: boolean;
  isCatchAll: boolean | null;
  catchAllDetail: string;
  confirmedPattern: string | null;
  best: Candidate | null;
  candidates: Candidate[];
  notes: string[];
  phase: string;
  smtpMailboxProbe: boolean;
};

const LS_KEY = "axenflow_email_finder_free_v1";
const LS_DAILY_LIMIT = 5;

const STAGES = [
  "Checking MX records...",
  "Generating name patterns...",
  "Checking domain memory...",
  "Ranking candidates...",
] as const;

function confidenceStyle(c: Confidence) {
  switch (c) {
    case "High":
      return { bg: "rgba(20,184,166,0.15)", color: "#14b8a6" };
    case "Medium":
      return { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" };
    case "Low":
      return { bg: "rgba(148,163,184,0.18)", color: "#94a3b8" };
    default:
      return { bg: "rgba(239,68,68,0.15)", color: "#ef4444" };
  }
}

const inputStyle = {
  border: "1px solid var(--c-border)",
  background: "var(--c-hover-bg)",
  color: "var(--c-heading)",
} as const;

export function EmailFinderSingleCheck() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<FinderResult | null>(null);
  const [remaining, setRemaining] = useState(LS_DAILY_LIMIT);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setRemaining(peekDailyRemaining(LS_KEY, LS_DAILY_LIMIT));
  }, []);

  async function onFind(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setCopied("");

    if (!domain.trim() || (!firstName.trim() && !lastName.trim())) {
      setError("Enter a first name and/or last name plus a company domain.");
      return;
    }

    const local = consumeDailyCheck(LS_KEY, LS_DAILY_LIMIT);
    if (!local.ok) {
      setError(
        "Free daily search limit reached in this browser. Sign in for bulk CSV (50/month free), or try again tomorrow."
      );
      setRemaining(0);
      return;
    }
    setRemaining(local.remaining);

    setBusy(true);
    let stageIdx = 0;
    setStage(STAGES[0]);
    const timer = window.setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, STAGES.length - 1);
      setStage(STAGES[stageIdx]);
    }, 450);

    try {
      const res = await fetch("/api/tools/email-finder/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          domain: domain.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResult(data.result);
      if (typeof data.remaining === "number") {
        setRemaining((prev) => Math.min(prev, data.remaining));
      }
      setStage("Done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      window.clearInterval(timer);
      setBusy(false);
    }
  }

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(email);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setError("Could not copy. Select the address manually.");
    }
  }

  async function confirmPattern(pattern: string, domainValue: string) {
    try {
      const res = await fetch("/api/tools/email-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", domain: domainValue, pattern }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError("Sign in to save a confirmed pattern for this domain.");
          return;
        }
        throw new Error(data.error || "Could not save confirmation");
      }
      setError("");
      setResult((prev) =>
        prev
          ? {
              ...prev,
              confirmedPattern: data.confirmedPattern,
              notes: [
                ...prev.notes,
                `Saved confirmed pattern "${data.confirmedPattern}" (count ${data.confidenceCount})`,
              ],
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirm failed");
    }
  }

  const best = result?.best;
  const badge = best ? confidenceStyle(best.confidence) : null;

  return (
    <div
      className="glass-card rounded-2xl p-5 sm:p-7"
      style={{ border: "1px solid var(--c-border)" }}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            className="font-[var(--font-space)] text-xl font-bold sm:text-2xl"
            style={{ color: "var(--c-heading)" }}
          >
            Free email finder (Phase 1)
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--c-text-muted)" }}>
            Pattern generation + MX/DNS validation + domain pattern memory. No live mailbox SMTP
            probing yet.
          </p>
        </div>
        <span
          className="rounded-lg px-2.5 py-1 text-xs font-semibold"
          style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
        >
          {remaining} free left today
        </span>
      </div>

      <form onSubmit={onFind} className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
            First name
          </span>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            disabled={busy}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
            Last name
          </span>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            disabled={busy}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
            Domain
          </span>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="company.com"
            disabled={busy}
            required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </label>
        <div className="sm:col-span-3">
          <Button type="submit" disabled={busy || remaining <= 0} className="sm:px-6">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Find email
          </Button>
        </div>
      </form>

      {busy && (
        <p className="mt-4 flex items-center gap-2 text-sm text-indigo-400">
          <Loader2 size={14} className="animate-spin" />
          {stage}
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {result && !busy && (
        <div
          className="mt-5 rounded-xl p-4 sm:p-5"
          style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
        >
          {!result.mxValid ? (
            <div className="flex items-start gap-2 text-sm text-red-500">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <span>
                Invalid — domain cannot receive email (no MX for{" "}
                <strong>{result.domain}</strong>).
              </span>
            </div>
          ) : best && badge ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--c-text-dim)" }}
                  >
                    Best match
                  </p>
                  <p className="mt-0.5 break-all text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
                    {best.email}
                  </p>
                </div>
                <span
                  className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-bold"
                  style={{ background: badge.bg, color: badge.color }}
                  title={best.reason}
                >
                  {best.confidence}
                </span>
              </div>
              <p className="mt-2 text-sm" style={{ color: "var(--c-text-dim)" }} title={best.reason}>
                {best.reason}
              </p>

              <ul className="mt-4 space-y-2.5 text-sm" style={{ color: "var(--c-text-dim)" }}>
                <li className="flex items-start gap-2">
                  <CheckRowIcon ok={result.mxValid} />
                  <span>MX records valid for {result.domain}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckRowIcon
                    ok={result.confirmedPattern === best.pattern}
                    warn={!result.confirmedPattern}
                  />
                  <span>
                    Pattern: {best.patternLabel}
                    {result.confirmedPattern
                      ? ` (confirmed for domain)`
                      : ` (statistical weight ${best.weight})`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckRowIcon
                    ok={result.isCatchAll === false}
                    warn={result.isCatchAll == null}
                    bad={result.isCatchAll === true}
                  />
                  <span>
                    {result.isCatchAll === true
                      ? "Catch-all domain — mailbox existence cannot be fully confirmed"
                      : result.isCatchAll === false
                        ? "Not a catch-all domain (cached or probed)"
                        : "Catch-all status unknown (probe off or inconclusive)"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckRowIcon warn />
                  <span>
                    Phase 1: no live SMTP probe of this mailbox. Candidate list ranked below.
                  </span>
                </li>
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => void copyEmail(best.email)}>
                  {copied === best.email ? <Check size={14} /> : <Copy size={14} />}
                  {copied === best.email ? "Copied" : "Copy"}
                </Button>
                <button
                  type="button"
                  onClick={() => void confirmPattern(best.pattern, result.domain)}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                >
                  Mark pattern confirmed
                </button>
              </div>
              <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
                Confirming (signed-in) stores this pattern in domain memory so future searches for{" "}
                {result.domain} rank it High faster.
              </p>
            </>
          ) : null}

          {result.candidates.length > 0 && (
            <div className="mt-5 overflow-x-auto rounded-xl" style={{ border: "1px solid var(--c-border)" }}>
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead style={{ background: "rgba(99,102,241,0.12)" }}>
                  <tr>
                    {["rank", "email", "pattern", "confidence"].map((h) => (
                      <th key={h} className="px-3 py-2.5 font-semibold" style={{ color: "var(--c-heading)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.candidates.slice(0, 8).map((c) => (
                    <tr key={c.email} style={{ borderTop: "1px solid var(--c-border)" }}>
                      <td className="px-3 py-2.5">{c.rank}</td>
                      <td className="px-3 py-2.5 font-medium">{c.email}</td>
                      <td className="px-3 py-2.5">{c.patternLabel}</td>
                      <td className="px-3 py-2.5" title={c.reason}>
                        {c.confidence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.notes?.length > 0 && (
            <p className="mt-3 text-xs" style={{ color: "var(--c-text-muted)" }}>
              Notes: {result.notes.join(" · ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
