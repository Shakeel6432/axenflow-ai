"use client";

import { useState } from "react";
import Link from "@/components/ui/AppLink";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Globe2,
  Lock,
  Sparkles,
  Upload,
} from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { PHONE_VALIDATOR_FAQS } from "@/lib/phone-validator-faq";
import { BlogGuideCard } from "@/components/tools/validators/BlogGuideCard";
import { TrustStrip } from "@/components/tools/validators/TrustStrip";

const CHECKS = [
  {
    title: "Format validation",
    text: "Confirms the number is structurally valid for its country using libphonenumber rules (length, prefixes, country code).",
  },
  {
    title: "E.164 normalization",
    text: "Converts to the international standard (+countrycode...) used by SMS/calling APIs and CRMs so every row shares one clean format.",
  },
  {
    title: "Line type detection",
    text: "Labels Mobile, Landline, VoIP, or Fixed or Mobile where the numbering plan allows. Useful for filtering numbers that cannot receive SMS before a campaign.",
  },
  {
    title: "Likely carrier from prefixes",
    text: "Where we have prefix tables (for example some PK/AE/IN ranges, NANP region hints), we show a likely operator. This is not live HLR or porting lookup, so ported numbers may differ.",
  },
] as const;

const SAMPLE_ROWS = [
  {
    original: "+1 (415) 555-2671",
    valid: "Valid",
    e164: "+14155552671",
    line: "Fixed or Mobile",
    country: "United States",
  },
  {
    original: "03001234567",
    valid: "Valid",
    e164: "+923001234567",
    line: "Mobile",
    country: "Pakistan",
  },
  {
    original: "02079460958",
    valid: "Valid",
    e164: "+442079460958",
    line: "Landline",
    country: "United Kingdom",
  },
  {
    original: "123",
    valid: "Invalid",
    e164: "",
    line: "Unknown",
    country: "",
  },
] as const;

type Props = {
  isAuthed: boolean;
  children?: React.ReactNode;
};

export function PhoneValidatorMarketing({ isAuthed, children }: Props) {
  const [showSample, setShowSample] = useState(false);

  return (
    <div className="space-y-12">
      <TrustStrip
        items={[
          { icon: Sparkles, label: "No signup for quick check" },
          { icon: FileSpreadsheet, label: "CSV export" },
          { icon: Globe2, label: "International support" },
          { icon: Upload, label: "Bulk processing available" },
        ]}
      />

      <section>
        <h2
          className="font-[var(--font-space)] text-xl font-bold sm:text-2xl"
          style={{ color: "var(--c-heading)" }}
        >
          What we check
        </h2>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--c-text-muted)" }}>
          Same checks for the free single phone check and signed-in CSV uploads: format, E.164,
          line type, and prefix-based carrier hints where available.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {CHECKS.map((item) => (
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
        <p className="mt-3 text-xs" style={{ color: "var(--c-text-muted)" }}>
          Accuracy note: we do not publish a single invented accuracy percentage. Format checks use
          local numbering rules; we do not call or text the number to confirm it is live.
        </p>
      </section>

      <section>
        <h2
          className="font-[var(--font-space)] text-xl font-bold sm:text-2xl"
          style={{ color: "var(--c-heading)" }}
        >
          Bulk CSV phone validation
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
                  Upload a CSV with up to <strong>10,000</strong> phone numbers (max{" "}
                  <strong>8MB</strong>). We validate each one, detect line type, normalize to E.164,
                  and give you a downloadable report. Bulk upload is free with an account (no credit
                  system on this tool today).
                </p>
                <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
                  Processing is request-scoped: uploaded lists are not saved into a marketing
                  database, and we do not sell phone lists. Exports download in your browser.{" "}
                  <Link href="/privacy" className="text-indigo-500 hover:text-teal-500">
                    Privacy Policy
                  </Link>
                  .
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
                    {["original_number", "valid", "e164_format", "line_type", "country"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 font-semibold"
                          style={{ color: "var(--c-heading)" }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_ROWS.map((row) => (
                    <tr key={row.original} style={{ borderTop: "1px solid var(--c-border)" }}>
                      <td className="px-3 py-2.5 whitespace-nowrap">{row.original}</td>
                      <td className="px-3 py-2.5 font-semibold">{row.valid}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{row.e164 || ""}</td>
                      <td className="px-3 py-2.5" style={{ color: "var(--c-text-dim)" }}>
                        {row.line}
                      </td>
                      <td className="px-3 py-2.5">{row.country || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
              Sample preview: your signed-in export includes the same style of columns plus
              operator, region, and notes fields.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={`/signup?callbackUrl=${encodeURIComponent("/tools/phone-validator")}`}>
                Create Account
              </Button>
              <Button
                href={`/signin?callbackUrl=${encodeURIComponent("/tools/phone-validator")}`}
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
                style={{
                  background: "var(--c-bg)",
                  color: "var(--c-text-dim)",
                  border: "1px solid var(--c-border)",
                }}
              >{`original_number,valid,e164_format,line_type,country,operator
+1 (415) 555-2671,Valid,+14155552671,Fixed or Mobile,United States,California local carrier
03001234567,Valid,+923001234567,Mobile,Pakistan,Jazz Pakistan
02079460958,Valid,+442079460958,Landline,United Kingdom,
123,Invalid,,,Unknown,`}</pre>
            )}
          </div>
        )}
      </section>

      <BlogGuideCard
        href="/blog/bulkphonevalidation"
        title="Learn more: Bulk Phone Validation Guide"
        description="CSV prep, result fields (E.164, line type, operator), and export tips for SMS-ready lists."
      />

      <section>
        <h2
          className="mb-4 font-[var(--font-space)] text-xl font-bold sm:text-2xl"
          style={{ color: "var(--c-heading)" }}
        >
          Phone validator FAQ
        </h2>
        <Accordion items={[...PHONE_VALIDATOR_FAQS]} />
      </section>
    </div>
  );
}
