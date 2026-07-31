"use client";

import { useEffect, useState } from "react";
import { Loader2, Phone, ShieldAlert } from "lucide-react";
import type { CountryCode } from "libphonenumber-js/max";
import { Button } from "@/components/ui/Button";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { PHONE_COUNTRY_OPTIONS } from "@/lib/validators/phone";
import { consumeDailyCheck, peekDailyRemaining } from "@/lib/free-check-quota";
import {
  CheckRowIcon,
  ValidityBadge,
  type ValidityBadgeKind,
} from "@/components/tools/validators/ValidityBadge";

type CheckResult = {
  original: string;
  phone: string;
  e164: string;
  status: string;
  formatValid: boolean;
  country: string;
  countryName: string;
  phoneType: string;
  lineCategory: string;
  operatorName: string;
  operatorNote: string;
  notes: string[];
};

const LS_KEY = "axenflow_phone_free_checks_v1";
const LS_DAILY_LIMIT = 5;

const STAGES = [
  "Validating format...",
  "Detecting country...",
  "Detecting line type...",
  "Looking up carrier prefixes...",
  "Normalizing to E.164...",
] as const;

export function PhoneSingleCheck() {
  const [phone, setPhone] = useState("");
  const [defaultCountry, setDefaultCountry] = useState<CountryCode | "">("US");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [badge, setBadge] = useState<ValidityBadgeKind | null>(null);
  const [remaining, setRemaining] = useState(LS_DAILY_LIMIT);

  useEffect(() => {
    setRemaining(peekDailyRemaining(LS_KEY, LS_DAILY_LIMIT));
  }, []);

  async function onCheck(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setBadge(null);

    const value = phone.trim();
    if (!value || value.replace(/\D/g, "").length < 7) {
      setError("Please select a country and enter a valid number format.");
      return;
    }
    if (!value.startsWith("+") && !defaultCountry) {
      setError(
        "Please select a country and enter a valid number format, or include a +country code."
      );
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
      const res = await fetch("/api/tools/phone-validator/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: value,
          defaultCountry: defaultCountry || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check failed");
      setResult(data.result);
      setBadge(data.badge);
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
            Free phone check (no signup)
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--c-text-muted)" }}>
            Test one number for format, country, line type (Mobile / Landline / VoIP), E.164
            normalization, and likely carrier from prefixes where known.
          </p>
        </div>
        <span
          className="rounded-lg px-2.5 py-1 text-xs font-semibold"
          style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
        >
          {remaining} free left today
        </span>
      </div>

      <form onSubmit={onCheck} className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr_auto]">
          <label className="block min-w-0">
            <span className="sr-only">Country</span>
            <GlassSelect
              aria-label="Default country"
              searchable
              value={defaultCountry}
              onChange={(v) => setDefaultCountry(v as CountryCode | "")}
              options={PHONE_COUNTRY_OPTIONS.map((c) => ({
                value: c.code,
                label: c.label,
              }))}
            />
          </label>
          <label className="relative min-w-0">
            <span className="sr-only" id="free-phone-check-label">
              Phone number
            </span>
            <Phone
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400"
            />
            <input
              id="free-phone-check"
              aria-labelledby="free-phone-check-label"
              type="tel"
              autoComplete="tel"
              placeholder="4155552671 or +14155552671"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={busy}
              className="form-input w-full !pl-10"
            />
          </label>
          <Button type="submit" disabled={busy || remaining <= 0} className="shrink-0 sm:px-6">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
            Check Number
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

      {result && badge && (
        <div
          className="mt-5 rounded-xl p-4 sm:p-5"
          style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--c-text-dim)" }}
              >
                Result for
              </p>
              <p className="mt-0.5 break-all font-semibold" style={{ color: "var(--c-heading)" }}>
                {result.original}
              </p>
            </div>
            <ValidityBadge badge={badge} />
          </div>

          <ul className="mt-4 space-y-2.5 text-sm" style={{ color: "var(--c-text-dim)" }}>
            <li className="flex items-start gap-2">
              <CheckRowIcon ok={result.formatValid} bad={!result.formatValid && badge === "Invalid"} />
              <span>
                {result.formatValid
                  ? `Valid format for ${result.countryName || result.country || "detected country"}`
                  : `Format not valid${result.countryName ? ` for ${result.countryName}` : ""}`}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckRowIcon ok={Boolean(result.e164)} bad={!result.e164 && badge === "Invalid"} />
              <span>
                {result.e164
                  ? `Normalized to E.164: ${result.e164}`
                  : "E.164 normalization unavailable (fix invalid or incomplete)"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckRowIcon
                ok={result.phoneType !== "Unknown"}
                warn={result.lineCategory === "ambiguous" || result.phoneType === "Unknown"}
              />
              <span>Line type: {result.phoneType || "Unknown"}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckRowIcon
                ok={Boolean(result.operatorName)}
                warn={!result.operatorName}
              />
              <span>
                {result.operatorName
                  ? `Likely carrier / operator: ${result.operatorName}`
                  : "Carrier: not available from prefixes for this number"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckRowIcon warn />
              <span>
                Live reachability not probed (no call/SMS/HLR). Prefix carrier estimates can differ
                after number portability.
              </span>
            </li>
          </ul>

          {(result.operatorNote || result.notes?.length > 0) && (
            <p className="mt-3 text-xs" style={{ color: "var(--c-text-muted)" }}>
              Notes:{" "}
              {[result.operatorNote, ...(result.notes || [])].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
