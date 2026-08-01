"use client";

import { useState } from "react";
import Link from "@/components/ui/AppLink";
import {
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { EMAIL_FINDER_FAQS } from "@/lib/email-finder-faq";
import { BlogGuideCard } from "@/components/tools/validators/BlogGuideCard";
import { TrustStrip } from "@/components/tools/validators/TrustStrip";

const HOW = [
  {
    title: "Pattern generation",
    text: "From first + last + domain we build first.last, flast, first, f.last, and more, ranked by industry likelihood weights.",
  },
  {
    title: "MX / DNS check",
    text: "Uses the same MX lookup as Email Validator. No MX means we stop immediately — the domain cannot receive mail.",
  },
  {
    title: "Domain pattern memory",
    text: "When a pattern is confirmed for a domain, later searches reuse it first (High confidence) without re-learning from scratch.",
  },
  {
    title: "Catch-all awareness",
    text: "If a domain is known catch-all, confidence is capped and we explain why any address may be accepted. Full mailbox SMTP probing is Phase 2.",
  },
] as const;

const SAMPLE_ROWS = [
  {
    name: "Jane Doe",
    domain: "acme.com",
    email: "jane.doe@acme.com",
    confidence: "Medium",
  },
  {
    name: "Alex Kim",
    domain: "acme.com",
    email: "akim@acme.com",
    confidence: "High",
  },
  {
    name: "Sam Lee",
    domain: "catchall.example",
    email: "sam.lee@catchall.example",
    confidence: "Low",
  },
] as const;

type Props = {
  isAuthed: boolean;
  children?: React.ReactNode;
};

export function EmailFinderMarketing({ isAuthed, children }: Props) {
  const [fileMsg, setFileMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onBulk(file: File | null) {
    if (!file) return;
    setBusy(true);
    setFileMsg("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/tools/email-finder", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk find failed");
      setFileMsg(
        `Processed ${data.results?.length || 0} row(s). Monthly remaining: ${data.remaining}/${data.limit}. Open browser console or download via a future export UI — Phase 1 returns JSON results.`
      );
      console.info("email-finder bulk results", data.results);
    } catch (err) {
      setFileMsg(err instanceof Error ? err.message : "Bulk find failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-12">
      <TrustStrip
        items={[
          { icon: Sparkles, label: "No signup for single search" },
          { icon: Search, label: "Pattern + MX Phase 1" },
          { icon: FileSpreadsheet, label: "Bulk CSV after login" },
          { icon: Shield, label: "Honest confidence labels" },
        ]}
      />

      <section>
        <h2
          className="font-[var(--font-space)] text-xl font-bold sm:text-2xl"
          style={{ color: "var(--c-heading)" }}
        >
          How Email Finder works (Phase 1)
        </h2>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--c-text-muted)" }}>
          Built to be useful without risking your sending IP. Live SMTP mailbox probing is Phase 2
          and needs separate infrastructure.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {HOW.map((item) => (
            <div
              key={item.title}
              className="rounded-xl p-4"
              style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
            >
              <h3
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "var(--c-heading)" }}
              >
                <CheckCircle2 size={14} className="text-teal-400" />
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2
          className="font-[var(--font-space)] text-xl font-bold sm:text-2xl"
          style={{ color: "var(--c-heading)" }}
        >
          Bulk CSV email finder
        </h2>
        {isAuthed ? (
          <div className="mt-4 space-y-4">
            <div
              className="rounded-2xl p-5"
              style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
            >
              <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>
                Upload a CSV with columns <strong>First Name</strong>, <strong>Last Name</strong>,{" "}
                <strong>Domain</strong>. Free tier: <strong>50 finds/month</strong>, max{" "}
                <strong>100 rows</strong> per upload, <strong>8MB</strong>. When quota runs out,
                wait until next month or contact us for higher limits.
              </p>
              <label
                className="mt-4 inline-flex cursor-pointer items-center rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
              >
                {busy ? "Finding…" : "Upload CSV"}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  disabled={busy}
                  onChange={(e) => {
                    void onBulk(e.target.files?.[0] || null);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              {fileMsg && (
                <p className="mt-3 text-sm" style={{ color: "var(--c-text-muted)" }}>
                  {fileMsg}
                </p>
              )}
            </div>
            {children}
          </div>
        ) : (
          <div
            className="mt-4 rounded-2xl p-5 sm:p-7"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
              >
                <Lock size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--c-heading)" }}>
                  Sign up for bulk CSV finds
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                  Upload a list of names + domains. We return ranked pattern candidates with
                  confidence for each row. Free tier: <strong>50 finds/month</strong>, max{" "}
                  <strong>100 rows</strong> per file, <strong>8MB</strong>. When the monthly quota
                  runs out, wait for the next month or ask us about paid volume.
                </p>
              </div>
            </div>

            <div
              className="mt-5 overflow-x-auto rounded-xl"
              style={{ border: "1px solid var(--c-border)" }}
            >
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead style={{ background: "rgba(99,102,241,0.12)" }}>
                  <tr>
                    {["name", "domain", "best_email", "confidence"].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 font-semibold"
                        style={{ color: "var(--c-heading)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_ROWS.map((row) => (
                    <tr key={row.email} style={{ borderTop: "1px solid var(--c-border)" }}>
                      <td className="px-3 py-2.5">{row.name}</td>
                      <td className="px-3 py-2.5">{row.domain}</td>
                      <td className="px-3 py-2.5 font-medium">{row.email}</td>
                      <td className="px-3 py-2.5">{row.confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={`/signup?callbackUrl=${encodeURIComponent("/tools/email-finder")}`}>
                Create Account
              </Button>
              <Button
                href={`/signin?callbackUrl=${encodeURIComponent("/tools/email-finder")}`}
                variant="outline"
              >
                Login
              </Button>
            </div>
          </div>
        )}
      </section>

      <section
        className="rounded-2xl p-5 text-sm leading-relaxed"
        style={{ border: "1px solid var(--c-border)", color: "var(--c-text-dim)" }}
      >
        <p className="font-semibold" style={{ color: "var(--c-heading)" }}>
          Compliance note
        </p>
        <p className="mt-2">
          Results are generated using publicly available domain mail-server information (MX/DNS)
          and standard pattern analysis, not obtained from private scraped inbox databases. You are
          responsible for complying with applicable regulations (GDPR, CAN-SPAM, and similar) when
          using found addresses for outreach. This is informational, not legal advice — consult your
          own counsel for compliance-sensitive use cases. See our{" "}
          <Link href="/privacy" className="text-indigo-500 hover:text-teal-500">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <BlogGuideCard
        href="/blog/bulkemailvalidation"
        title="Related: Bulk Email Validation Guide"
        description="After you find candidates, validate syntax, MX, and disposable domains before outreach."
      />

      <section>
        <h2
          className="mb-4 font-[var(--font-space)] text-xl font-bold sm:text-2xl"
          style={{ color: "var(--c-heading)" }}
        >
          Email Finder FAQ
        </h2>
        <Accordion items={[...EMAIL_FINDER_FAQS]} />
      </section>
    </div>
  );
}
