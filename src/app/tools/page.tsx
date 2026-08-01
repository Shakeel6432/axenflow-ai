import type { Metadata } from "next";
import Link from "@/components/ui/AppLink";
import {
  Wrench,
  Sparkles,
  ShieldCheck,
  Mail,
  Phone,
  MessageSquare,
  FileSpreadsheet,
  Search,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "AxenFlow AI tools hub: lead finder, email validator, phone validator, AI outreach, CSV Excel converter, desktop scrapers, and blog guides.",
};

const tools = [
  {
    title: "Lead Finder",
    description: "Search, filter, export, and save business leads.",
    href: "/leads",
    status: "Live",
    icon: Sparkles,
  },
  {
    title: "Email Finder",
    description:
      "Find likely work emails from name + domain. Phase 1: patterns, MX check, domain memory.",
    href: "/tools/email-finder",
    status: "Live",
    icon: Search,
  },
  {
    title: "Email Validator",
    description:
      "Syntax, DNS, MX, disposable, role flags, and hard-bounce estimates. Single email or CSV.",
    href: "/tools/email-validator",
    status: "Live",
    icon: Mail,
  },
  {
    title: "Phone Validator",
    description:
      "International validation for every country, E.164 cleanup, country detection, toll-free filters.",
    href: "/tools/phone-validator",
    status: "Live",
    icon: Phone,
  },
  {
    title: "AI Outreach",
    description:
      "Cold emails, phone scripts, follow-ups. Single lead or CSV/Excel with templates beside each business.",
    href: "/tools/ai-outreach",
    status: "Live",
    icon: MessageSquare,
  },
  {
    title: "CSV ⇄ Excel Converter",
    description:
      "Browser-only CSV ↔ Excel conversion with auto-detect, multi-sheet export, and styled XLSX no uploads.",
    href: "/tools/csv-excel-converter",
    status: "Live",
    icon: FileSpreadsheet,
  },
  {
    title: "Desktop Scrapers",
    description:
      "AxenFlow AI BBB Scraper and Yellow Pages Scraper for Windows. Use with a VPN, unpack, then run the app.",
    href: "/download",
    status: "Live",
    icon: Wrench,
  },
  {
    title: "AI Enrichment",
    description: "Future module for enrichment workflows and automation.",
    href: "#",
    status: "Planned",
    icon: ShieldCheck,
  },
] as const;

export default function ToolsPage() {
  return (
    <>
      <PageHero
        title="Tools"
        description="Lead Finder, validators, AI Outreach, CSV⇄Excel converter, desktop scrapers, and guides on the blog."
      />
      <Section tight>
        <div className="mx-auto mb-6 flex max-w-5xl flex-wrap gap-4 px-4 text-sm font-semibold sm:px-6">
          <Link href="/blog" className="text-indigo-500 hover:text-teal-500">
            Blog guides
          </Link>
          <Link href="/blog/businessleaddatabase" className="text-indigo-500 hover:text-teal-500">
            Lead database guide
          </Link>
          <Link href="/blog/bulkemailvalidation" className="text-indigo-500 hover:text-teal-500">
            Bulk email validation guide
          </Link>
          <Link href="/blog/bulkphonevalidation" className="text-indigo-500 hover:text-teal-500">
            Bulk phone validation guide
          </Link>
          <Link href="/blog/aioutreach" className="text-indigo-500 hover:text-teal-500">
            AI Outreach guide
          </Link>
          <Link href="/blog/bbbscraper" className="text-indigo-500 hover:text-teal-500">
            BBB Scraper guide
          </Link>
          <Link href="/blog/csvexcelconverter" className="text-indigo-500 hover:text-teal-500">
            CSV to Excel Converter guide
          </Link>
        </div>
        <div className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ title, description, href, status, icon: Icon }) => (
            <div
              key={title}
              className="glass-card rounded-2xl p-6"
              style={{ border: "1px solid var(--c-border)" }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
              >
                <Icon size={18} />
              </div>
              <div
                className="mb-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ background: "var(--c-hover-bg)", color: "var(--c-text-dim)" }}
              >
                {status}
              </div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
                {title}
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
                {description}
              </p>
              {href !== "#" && (
                <Link
                  href={href}
                  className="mt-4 inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
                  style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                >
                  Open
                </Link>
              )}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
