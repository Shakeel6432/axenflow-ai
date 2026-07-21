import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { OutreachClient } from "@/components/bbb/OutreachClient";

export const metadata: Metadata = {
  title: "AI Outreach for BBB Leads",
  description:
    "Generate cold emails, phone scripts, and follow-ups with your business name in Best regards.",
  alternates: { canonical: `${siteConfig.url}/bbb-scraper/outreach` },
};

export default function BbbOutreachPage() {
  return (
    <>
      <section
        className="relative overflow-hidden pt-24 pb-8 sm:pt-28"
        style={{ borderBottom: "1px solid var(--c-border)" }}
      >
        <Container>
          <p className="text-sm font-semibold" style={{ color: "#818cf8" }}>
            AxenFlow AI
          </p>
          <h1
            className="mt-2 font-[var(--font-space)] text-3xl font-bold sm:text-4xl"
            style={{ color: "var(--c-heading)" }}
          >
            AI Outreach
          </h1>
          <p className="mt-2 max-w-xl text-base" style={{ color: "var(--c-text-dim)" }}>
            Draft cold emails, phone scripts, and follow-ups. Add your business name for the Best
            regards line.
          </p>
          <Link
            href="/bbb-scraper/validate"
            className="mt-3 inline-block text-sm font-semibold text-indigo-500 hover:text-teal-500"
          >
            Open Validate leads
          </Link>
        </Container>
      </section>
      <Section tight>
        <Container>
          <OutreachClient />
        </Container>
      </Section>
    </>
  );
}
