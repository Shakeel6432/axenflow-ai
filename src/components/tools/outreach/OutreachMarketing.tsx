"use client";

import {
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { AI_OUTREACH_FAQS } from "@/lib/ai-outreach-faq";
import { BlogGuideCard } from "@/components/tools/validators/BlogGuideCard";
import { TrustStrip } from "@/components/tools/validators/TrustStrip";
import { generateOutreach } from "@/lib/outreach";

const HOW_IT_WORKS = [
  {
    title: "Chat-based template building",
    text: "After sign-in, describe the tone, length, and structure you want. The assistant returns a full reusable template with placeholders like {{business_name}}, {{category}}, {{city}}, and {{sender_name}}. Refine until it sounds like you.",
  },
  {
    title: "Lead-field personalization",
    text: "When you apply a template (built-in or custom), each CSV/Excel row fills those fields automatically: company name, industry/category, city, and your sender name.",
  },
  {
    title: "Batch CSV / Excel fill",
    text: "Upload a list (up to 5,000 rows, max 12MB), choose cold email, follow-up, call script, and/or saved custom templates, then download personalized subject/body columns for every lead.",
  },
] as const;

const SHOWCASE = [
  {
    label: "Cold email",
    draft: generateOutreach("cold_email", {
      businessName: "Summit Roofing",
      category: "home services",
      city: "Denver",
      senderName: "Jordan Lee",
      recipientName: "Maria",
      offerContext: "a steady stream of verified local homeowner leads",
    }),
  },
  {
    label: "Follow-up",
    draft: generateOutreach("follow_up", {
      businessName: "Northside Dental",
      category: "healthcare",
      city: "Chicago",
      senderName: "Jordan Lee",
      recipientName: "Dr. Patel",
      offerContext: "patient-acquisition outreach that stays compliant and on-brand",
    }),
  },
  {
    label: "Call script",
    draft: generateOutreach("phone_script", {
      businessName: "BrightPath Tutoring",
      category: "education",
      city: "Austin",
      senderName: "Jordan Lee",
      recipientName: "Sam",
      offerContext: "filling open tutoring slots with parents already searching nearby",
    }),
  },
] as const;

const SAMPLE_ROWS = [
  {
    name: "Summit Roofing",
    company: "Summit Roofing",
    subject: "Quick idea for Summit Roofing in Denver",
    body: "Hello Maria, … Open to a 10-minute call…",
  },
  {
    name: "Northside Dental",
    company: "Northside Dental",
    subject: "Following up: Northside Dental",
    body: "Hello Dr. Patel, Just bumping this…",
  },
  {
    name: "BrightPath Tutoring",
    company: "BrightPath Tutoring",
    subject: "Call script: BrightPath Tutoring",
    body: "Hi Sam, this is [Your Name] with Jordan Lee…",
  },
] as const;

type Props = {
  isAuthed: boolean;
  children?: React.ReactNode;
};

export function OutreachMarketing({ isAuthed, children }: Props) {
  return (
    <div className="space-y-12">
      <TrustStrip
        items={[
          { icon: Sparkles, label: "No signup for a free sample" },
          { icon: FileSpreadsheet, label: "CSV / Excel batch export" },
          { icon: Users, label: "Personalized per lead" },
        ]}
      />

      <section>
        <h2
          className="font-[var(--font-space)] text-xl font-bold sm:text-2xl"
          style={{ color: "var(--c-heading)" }}
        >
          Example outputs (quality preview)
        </h2>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--c-text-muted)" }}>
          Static samples from the same built-in personalization engine. Try the live generator
          above with your own lead fields.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {SHOWCASE.map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-4"
              style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
                {item.label}
              </p>
              {item.label !== "Call script" && (
                <p className="mt-2 text-sm font-semibold" style={{ color: "var(--c-heading)" }}>
                  {item.draft.subject}
                </p>
              )}
              <p
                className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed"
                style={{ color: "var(--c-text-dim)" }}
              >
                {item.draft.body}
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
          How it works
        </h2>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--c-text-muted)" }}>
          Matches what the tool actually does after you sign in: chat to shape a template, merge
          lead fields, then batch-fill a spreadsheet.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
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
          Batch CSV / Excel outreach
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
                  Unlock chat templates and full-list fill
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                  Sign up to build reusable templates via chat, apply them to your entire CSV/Excel
                  list, and export personalized outreach for every lead in minutes. Limits today:{" "}
                  <strong>5,000 rows</strong> per file, max <strong>12MB</strong>. Batch
                  personalization uses the same merge engine as the free sample (no per-row AI bill).
                  Chat template building uses the Groq assistant when configured. There is{" "}
                  <strong>no credit meter</strong> on this tool today.
                </p>
                <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
                  Uploaded lists are not saved into a marketing database. Exports download in your
                  browser.
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
                    {["name", "company", "generated_subject", "generated_body"].map((h) => (
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
                    <tr key={row.name} style={{ borderTop: "1px solid var(--c-border)" }}>
                      <td className="px-3 py-2.5 whitespace-nowrap">{row.name}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{row.company}</td>
                      <td className="px-3 py-2.5">{row.subject}</td>
                      <td className="px-3 py-2.5" style={{ color: "var(--c-text-dim)" }}>
                        {row.body}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
              Sample batch output shape. Your export includes full subject/body (or script) columns
              next to the original lead fields.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={`/signup?callbackUrl=${encodeURIComponent("/tools/ai-outreach")}`}>
                Create Account
              </Button>
              <Button
                href={`/signin?callbackUrl=${encodeURIComponent("/tools/ai-outreach")}`}
                variant="outline"
              >
                Login
              </Button>
              <span
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{ border: "1px solid var(--c-border)", color: "var(--c-text-dim)" }}
              >
                <MessageSquare size={14} />
                Chat templates unlock after login
              </span>
            </div>
          </div>
        )}
      </section>

      <BlogGuideCard
        href="/blog/aioutreach"
        title="Learn more: AI Outreach Guide"
        description="Templates, placeholders, chat tips, and batch CSV/Excel fill for cold email and call scripts."
      />

      <section>
        <h2
          className="mb-4 font-[var(--font-space)] text-xl font-bold sm:text-2xl"
          style={{ color: "var(--c-heading)" }}
        >
          AI Outreach FAQ
        </h2>
        <Accordion items={[...AI_OUTREACH_FAQS]} />
      </section>
    </div>
  );
}
