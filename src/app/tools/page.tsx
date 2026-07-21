import type { Metadata } from "next";
import Link from "next/link";
import { Wrench, Sparkles, ShieldCheck, Mail, Phone } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Tools",
  description: "AxenFlow AI tools hub: lead finder, scrapers, email validator, phone validator.",
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
      "Format check, US normalize, keep one number, reject short codes or toll-free.",
    href: "/tools/phone-validator",
    status: "Live",
    icon: Phone,
  },
  {
    title: "BBB Scraper",
    description: "Desktop BBB lead scraper. Validate emails and phones with the tools above.",
    href: "/bbb-scraper",
    status: "Live",
    icon: Wrench,
  },
  {
    title: "Desktop Scrapers",
    description:
      "Agency products from AxenFlow AI for fresh leads. Use with a VPN, unpack the RAR, then run the app.",
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
        description="Lead Finder, Email Validator, Phone Validator, and desktop scrapers."
      />
      <Section tight>
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
