"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { consumeDailyCheck, peekDailyRemaining } from "@/lib/free-check-quota";

type OutreachType = "cold_email" | "phone_script" | "follow_up";

type Draft = { subject: string; body: string };

type PersonalizedUsing = {
  recipientName: string | null;
  companyName: string;
  industry: string;
  city: string | null;
  offerContext: string | null;
};

const LS_KEY = "axenflow_outreach_free_samples_v1";
const LS_DAILY_LIMIT = 3;

const TYPE_OPTIONS = [
  { value: "cold_email", label: "Cold Email" },
  { value: "follow_up", label: "Follow-up Email" },
  { value: "phone_script", label: "Call Script" },
] as const;

const STAGES = [
  "Reading your lead fields...",
  "Personalizing the message...",
  "Polishing subject and body...",
] as const;

const inputStyle = {
  border: "1px solid var(--c-border)",
  background: "var(--c-hover-bg)",
  color: "var(--c-heading)",
} as const;

export function OutreachSingleSample() {
  const [recipientName, setRecipientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [outreachType, setOutreachType] = useState<OutreachType>("cold_email");
  const [offerContext, setOfferContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [personalized, setPersonalized] = useState<PersonalizedUsing | null>(null);
  const [remaining, setRemaining] = useState(LS_DAILY_LIMIT);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setRemaining(peekDailyRemaining(LS_KEY, LS_DAILY_LIMIT));
  }, []);

  async function runGenerate() {
    setError("");
    setCopied(false);

    if (!companyName.trim() || !industry.trim()) {
      setError("Please enter a company name and industry/role.");
      return;
    }

    const local = consumeDailyCheck(LS_KEY, LS_DAILY_LIMIT);
    if (!local.ok) {
      setError(
        "Free daily sample limit reached in this browser. Sign in for chat templates and CSV/Excel batch fill, or try again tomorrow."
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
    }, 400);

    // Brief wait so the loading UX is visible (generation itself is local/fast).
    await new Promise((r) => setTimeout(r, 700));

    try {
      const res = await fetch("/api/tools/ai-outreach/sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          companyName: companyName.trim(),
          industry: industry.trim(),
          city: city.trim(),
          outreachType,
          offerContext: offerContext.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sample generation failed");
      setDraft(data.draft);
      setPersonalized(data.personalizedUsing);
      if (typeof data.remaining === "number") {
        setRemaining((prev) => Math.min(prev, data.remaining));
      }
      setStage("Done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sample generation failed");
      setDraft(null);
      setPersonalized(null);
    } finally {
      window.clearInterval(timer);
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await runGenerate();
  }

  async function onCopy() {
    if (!draft) return;
    const text =
      outreachType === "phone_script"
        ? draft.body
        : `Subject: ${draft.subject}\n\n${draft.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy to clipboard. Select the text and copy manually.");
    }
  }

  const personalTag = personalized
    ? [
        personalized.recipientName,
        personalized.companyName,
        personalized.industry,
        personalized.city,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

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
            Free outreach sample (no signup)
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--c-text-muted)" }}>
            Generate one personalized cold email, follow-up, or call script using the same merge
            engine as signed-in batch fill.
          </p>
        </div>
        <span
          className="rounded-lg px-2.5 py-1 text-xs font-semibold"
          style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
        >
          {remaining} free left today
        </span>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
            Recipient name
          </span>
          <input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Alex Chen"
            disabled={busy}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
            Company name
          </span>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme HVAC"
            disabled={busy}
            required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
            Industry / role
          </span>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Home services"
            disabled={busy}
            required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
            City (optional)
          </span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Austin"
            disabled={busy}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
            Outreach type
          </span>
          <GlassSelect
            aria-label="Outreach type"
            value={outreachType}
            onChange={(v) => setOutreachType(v as OutreachType)}
            options={TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
            What are you offering? (optional)
          </span>
          <input
            value={offerContext}
            onChange={(e) => setOfferContext(e.target.value)}
            placeholder="Verified local leads for service businesses"
            disabled={busy}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" disabled={busy || remaining <= 0} className="sm:px-6">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate sample
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

      {draft && !busy && (
        <div
          className="mt-5 rounded-xl p-4 sm:p-5"
          style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
        >
          {outreachType !== "phone_script" && (
            <div className="mb-3">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--c-text-dim)" }}
              >
                Subject
              </p>
              <p className="mt-0.5 font-semibold" style={{ color: "var(--c-heading)" }}>
                {draft.subject}
              </p>
            </div>
          )}
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--c-text-dim)" }}
          >
            {outreachType === "phone_script" ? "Call script" : "Body"}
          </p>
          <pre
            className="mt-2 whitespace-pre-wrap font-[var(--font-inter)] text-sm leading-relaxed"
            style={{ color: "var(--c-text-dim)" }}
          >
            {draft.body}
          </pre>

          {personalTag && (
            <p className="mt-4 text-xs" style={{ color: "var(--c-text-muted)" }}>
              Personalized using: {personalTag}
              {personalized?.offerContext ? ` · Offer: ${personalized.offerContext}` : ""}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void onCopy()}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <button
              type="button"
              onClick={() => void runGenerate()}
              disabled={remaining <= 0}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
              style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
            Regenerate also uses one free sample from today&apos;s limit.
          </p>
        </div>
      )}
    </div>
  );
}
