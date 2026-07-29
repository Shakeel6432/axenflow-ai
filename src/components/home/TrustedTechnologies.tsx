import Link from "@/components/ui/AppLink";
import { Database, Mail, Phone, Sparkles, Wrench } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HomeReveal } from "@/components/home/HomeReveal";

const platformTools = [
  {
    name: "Lead Finder",
    blurb: "Search and export our business lead database",
    href: "/leads",
    Icon: Database,
    bg: "bg-indigo-500/10",
    color: "#6366f1",
  },
  {
    name: "Email Validator",
    blurb: "Syntax, DNS, MX, and bulk CSV checks",
    href: "/tools/email-validator",
    Icon: Mail,
    bg: "bg-teal-500/10",
    color: "#14b8a6",
  },
  {
    name: "Phone Validator",
    blurb: "E.164 cleanup and country detection",
    href: "/tools/phone-validator",
    Icon: Phone,
    bg: "bg-amber-500/10",
    color: "#f59e0b",
  },
  {
    name: "AI Outreach",
    blurb: "Cold emails, scripts, and follow-ups",
    href: "/tools/ai-outreach",
    Icon: Sparkles,
    bg: "bg-teal-500/10",
    color: "#14b8a6",
  },
  {
    name: "Desktop Scrapers",
    blurb: "Agency scrapers for fresh leads",
    href: "/download",
    Icon: Wrench,
    bg: "bg-amber-500/10",
    color: "#f59e0b",
  },
] as const;

export function TrustedTechnologies() {
  return (
    <Section divider>
      <HomeReveal>
        <SectionHeading
          title="Products & Live Tools"
          description="Lead database, email and phone validators, AI outreach, and desktop scrapers. Use them free on AxenFlow, or hire us to automate the rest."
        />
      </HomeReveal>

      <HomeReveal stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {platformTools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className="glass-card home-hover-lift flex flex-col items-center gap-3 px-4 py-7 text-center sm:px-5 sm:py-8"
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${tool.bg}`}>
              <tool.Icon size={24} style={{ color: tool.color }} strokeWidth={1.8} />
            </div>
            <div>
              <span
                className="font-[var(--font-space)] block text-sm font-semibold sm:text-base"
                style={{ color: "var(--c-heading)" }}
              >
                {tool.name}
              </span>
              <p className="mt-1.5 text-xs leading-relaxed sm:text-[13px]" style={{ color: "var(--c-text-muted)" }}>
                {tool.blurb}
              </p>
            </div>
          </Link>
        ))}
      </HomeReveal>
    </Section>
  );
}
