"use client";

import { useState } from "react";
import Link from "@/components/ui/AppLink";
import {
  BookOpen,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Lock,
  Shield,
  Sparkles,
  Upload,
} from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { EMAIL_VALIDATOR_FAQS } from "@/lib/email-validator-faq";

const CHECKS = [
  {
    title: "Syntax validation",
    text: "Catches typos and malformed addresses before they hit your CRM or ESP.",
  },
  {
    title: "MX record check",
    text: "Confirms the domain publishes mail exchangers and can receive email.",
  },
  {
    title: "DNS validation",
    text: "Confirms the domain resolves on the public internet (A/AAAA).",
  },
  {
    title: "Disposable / temporary email detection",
    text: "Flags throwaway providers (Mailinator, Guerrilla Mail, Yopmail, and similar).",
  },
  {
    title: "Role-based detection",
    text: "Flags generic addresses like info@, support@, and admin@ that rarely convert.",
  },
  {
    title: "Catch-all / mailbox note",
    text: "We do not run live SMTP probes, so catch-all domains cannot be confirmed. A valid MX does not prove a specific inbox exists.",
  },
  {
    title: "Bounce risk estimate",
    text: "Combines syntax, DNS, and MX signals into a Low / Medium / High estimate (not a real send).",
  },
] as const;

const SAMPLE_ROWS = [
  {
    email: "alex@acme.com",
    status: "Valid",
    reason: "MX found",
    bounce: "Low",
  },
  {
    email: "info@acme.com",
    status: "Risky",
    reason: "Role account",
    bounce: "Low",
  },
  {
    email: "temp@mailinator.com",
    status: "Invalid",
    reason: "Disposable domain",
    bounce: "High",
  },
  {
    email: "broken@@company",
    status: "Invalid",
    reason: "Invalid syntax",
    bounce: "High",
  },
] as const;

type Props = {
  isAuthed: boolean;
  children?: React.ReactNode;
};

export function EmailValidatorMarketing({ isAuthed, children }: Props) {
  const [showSample, setShowSample] = useState(false);

  return (
    <div className="space-y-12">
      {/* Trust strip */}
      <div className="flex flex-wrap gap-2">
        {[
          { icon: Sparkles, label: "No signup for quick check" },
          { icon: Shield, label: "Request-scoped processing" },
          { icon: FileSpreadsheet, label: "CSV / Excel export" },
          { icon: Upload, label: "Bulk processing available" },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
            style={{ background: "var(--c-hover-bg)", color: "var(--c-text-dim)", border: "1px solid var(--c-border)" }}
          >
            <Icon size={12} className="text-indigo-400" />
            {label}
          </span>
        ))}
      </div>

      {/* What we check */}
      <section>
        <h2
          className="font-[var(--font-space)] text-xl font-bold sm:text-2xl"
          style={{ color: "var(--c-heading)" }}
        >
          What we check in bulk email validation
        </h2>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--c-text-muted)" }}>
          Same checks for the free single email check and signed-in CSV uploads: syntax, DNS, MX
          record check, disposable email filter, role flags, and bounce risk estimates.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {CHECKS.map((item) => (
            <div
              key={item.title}
              className="rounded-xl p-4"
              style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--c-heading)" }}>
                <CheckCircle2 size={14} className="text-teal-400" />
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs" style={{ color: "var(--c-text-muted)" }}>
          Accuracy note: we do not publish a single invented “99% accuracy” number. DNS/MX layers
          use live lookups; inbox existence is not SMTP-confirmed.
        </p>
      </section>

      {/* Bulk gate or full tool */}
      <section>
        <h2
          className="font-[var(--font-space)] text-xl font-bold sm:text-2xl"
          style={{ color: "var(--c-heading)" }}
        >
          Bulk CSV email validation
        </h2>
        {isAuthed ? (
          <div className="mt-4">{children}</div>
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
                  Upload a CSV for full list cleaning
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                  Upload a CSV, Excel, or JSON file with up to <strong>5,000</strong> email addresses
                  (max <strong>8MB</strong>). We check each one for syntax, MX, DNS, disposable,
                  role, and bounce risk, then you download a report with status columns. Bulk upload
                  is free with an account (no credit system on this tool today).
                </p>
                <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
                  Processing is request-scoped: uploaded lists are not saved into a marketing
                  database, and we do not sell email lists. Exports download in your browser.{" "}
                  <Link href="/privacy" className="text-indigo-500 hover:text-teal-500">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Sample output mock */}
            <div className="mt-5 overflow-x-auto rounded-xl" style={{ border: "1px solid var(--c-border)" }}>
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead style={{ background: "rgba(99,102,241,0.12)" }}>
                  <tr>
                    {["original_email", "status", "reason", "bounce_risk"].map((h) => (
                      <th key={h} className="px-3 py-2.5 font-semibold" style={{ color: "var(--c-heading)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_ROWS.map((row) => (
                    <tr key={row.email} style={{ borderTop: "1px solid var(--c-border)" }}>
                      <td className="px-3 py-2.5">{row.email}</td>
                      <td className="px-3 py-2.5 font-semibold">{row.status}</td>
                      <td className="px-3 py-2.5" style={{ color: "var(--c-text-dim)" }}>
                        {row.reason}
                      </td>
                      <td className="px-3 py-2.5">{row.bounce}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
              Sample preview: your signed-in export includes the same style of columns plus DNS/MX
              detail fields.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={`/signup?callbackUrl=${encodeURIComponent("/tools/email-validator")}`}>
                Create Account
              </Button>
              <Button
                href={`/signin?callbackUrl=${encodeURIComponent("/tools/email-validator")}`}
                variant="outline"
              >
                Login
              </Button>
              <button
                type="button"
                onClick={() => setShowSample((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
              >
                <Download size={14} />
                {showSample ? "Hide sample report" : "See a sample report"}
              </button>
            </div>

            {showSample && (
              <pre
                className="mt-4 overflow-x-auto rounded-xl p-4 text-xs leading-relaxed"
                style={{ background: "var(--c-bg)", color: "var(--c-text-dim)", border: "1px solid var(--c-border)" }}
              >{`original_email,status,syntax,dns,mx,disposable,role,bounce_risk,reason
alex@acme.com,Valid,Valid,Valid,Valid,false,false,Low,MX found
info@acme.com,Valid,Valid,Valid,Valid,false,true,Low,Role account
temp@mailinator.com,Invalid,Valid,Valid,Valid,true,false,High,Disposable domain
broken@@company,Invalid,Invalid,Skipped,Skipped,,,High,Invalid syntax`}</pre>
            )}
          </div>
        )}
      </section>

      {/* Learn more card */}
      <Link
        href="/blog/bulkemailvalidation"
        className="glass-card flex flex-col gap-3 rounded-2xl p-5 transition-colors hover:border-indigo-500/40 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        style={{ border: "1px solid var(--c-border)" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(20,184,166,0.12)", color: "#2dd4bf" }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--c-heading)" }}>
              Learn more: Bulk Email Validation Guide
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
              Step-by-step CSV prep, check meanings, and export tips for deliverability.
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold text-indigo-500">Read the guide →</span>
      </Link>

      {/* FAQ */}
      <section>
        <h2
          className="mb-4 font-[var(--font-space)] text-xl font-bold sm:text-2xl"
          style={{ color: "var(--c-heading)" }}
        >
          Email validator FAQ
        </h2>
        <Accordion items={[...EMAIL_VALIDATOR_FAQS]} />
      </section>
    </div>
  );
}
