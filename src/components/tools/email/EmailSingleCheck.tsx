"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { consumeDailyCheck, peekDailyRemaining } from "@/lib/free-check-quota";
import {
  CheckRowIcon,
  ValidityBadge,
  type ValidityBadgeKind,
} from "@/components/tools/validators/ValidityBadge";

type CheckResult = {
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

const LS_KEY = "axenflow_email_free_checks_v1";
const LS_DAILY_LIMIT = 5;

const STAGES = [
  "Checking syntax...",
  "Checking DNS...",
  "Checking MX records...",
  "Scanning disposable and role flags...",
  "Estimating bounce risk...",
] as const;

export function EmailSingleCheck() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [badge, setBadge] = useState<ValidityBadgeKind | null>(null);
  const [bounceRisk, setBounceRisk] = useState("");
  const [remaining, setRemaining] = useState(LS_DAILY_LIMIT);

  useEffect(() => {
    setRemaining(peekDailyRemaining(LS_KEY, LS_DAILY_LIMIT));
  }, []);

  async function onCheck(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setBadge(null);

    const value = email.trim();
    if (!value || !value.includes("@") || value.length < 5) {
      setError("Please enter a valid email format before checking.");
      return;
    }

    const local = consumeDailyCheck(LS_KEY, LS_DAILY_LIMIT);
    if (!local.ok) {
      setError(
        "Free daily check limit reached in this browser. Sign in for bulk CSV validation, or try again tomorrow."
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
      const res = await fetch("/api/tools/email-validator/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check failed");
      setResult(data.result);
      setBadge(data.badge);
      setBounceRisk(data.bounceRisk || "");
      if (typeof data.remaining === "number") {
        setRemaining((prev) => Math.min(prev, data.remaining));
      }
      setStage("Done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      window.clearInterval(timer);
      setBusy(false);
    }
  }

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
            Free email check (no signup)
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--c-text-muted)" }}>
            Test one address with syntax, DNS, MX record check, disposable filter, and bounce
            risk estimate.
          </p>
        </div>
        <span
          className="rounded-lg px-2.5 py-1 text-xs font-semibold"
          style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
        >
          {remaining} free left today
        </span>
      </div>

      <form onSubmit={onCheck} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="free-email-check">
          Email address
        </label>
        <div className="relative min-w-0 flex-1">
          <Mail
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400"
          />
          <input
            id="free-email-check"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            className="form-input w-full !pl-10"
          />
        </div>
        <Button type="submit" disabled={busy || remaining <= 0} className="shrink-0 sm:px-6">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
          Check Email
        </Button>
      </form>

      {busy && (
        <p className="mt-4 flex items-center gap-2 text-sm text-indigo-400">
          <Loader2 size={14} className="animate-spin" />
          {stage}
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {result && badge && (
        <div
          className="mt-5 rounded-xl p-4 sm:p-5"
          style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-text-dim)" }}>
                Result for
              </p>
              <p className="mt-0.5 break-all font-semibold" style={{ color: "var(--c-heading)" }}>
                {result.email}
              </p>
            </div>
            <ValidityBadge badge={badge} />
          </div>

          <ul className="mt-4 space-y-2.5 text-sm" style={{ color: "var(--c-text-dim)" }}>
            <li className="flex items-start gap-2">
              <CheckRowIcon
                ok={result.syntax === "Valid"}
                bad={result.syntax === "Invalid"}
              />
              <span>
                Syntax {result.syntax === "Valid" ? "valid" : "invalid"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckRowIcon
                ok={result.dns === "Valid"}
                bad={result.dns === "Invalid"}
                warn={result.dns === "Skipped" || result.dns === "Unknown"}
              />
              <span>
                Domain resolves (DNS): {result.dns === "Valid" ? "yes" : result.dns.toLowerCase()}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckRowIcon
                ok={result.mx === "Valid"}
                bad={result.mx === "Invalid"}
                warn={result.mx === "Skipped" || result.mx === "Unknown"}
              />
              <span>
                Domain has MX records: {result.mx === "Valid" ? "yes" : result.mx.toLowerCase()}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckRowIcon
                ok={result.disposable === false}
                bad={result.disposable === true}
                warn={result.disposable == null}
              />
              <span>
                {result.disposable
                  ? "Disposable/temporary email detected"
                  : "Not a known disposable domain"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckRowIcon
                ok={result.role === false}
                warn={result.role === true || result.role == null}
              />
              <span>
                {result.role
                  ? "Role-based address (info@, admin@, etc.)"
                  : "Not a role-based address"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckRowIcon warn />
              <span>
                Catch-all / mailbox existence: not probed (no live SMTP). Valid MX does not prove
                the inbox exists.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckRowIcon
                ok={bounceRisk === "Low"}
                warn={bounceRisk === "Medium"}
                bad={bounceRisk === "High"}
              />
              <span>Estimated bounce risk: {bounceRisk || "Unknown"}</span>
            </li>
          </ul>

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
