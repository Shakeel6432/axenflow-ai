import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ValidateClient } from "@/components/bbb/ValidateClient";

export const metadata: Metadata = {
  title: "Validate BBB Leads",
  description:
    "Upload AxenFlow BBB scraper CSV files to keep one phone per row and validate emails and phones.",
  alternates: { canonical: `${siteConfig.url}/bbb-scraper/validate` },
};

export default function BbbValidatePage() {
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
            Validate leads
          </h1>
          <p className="mt-2 max-w-xl text-base" style={{ color: "var(--c-text-dim)" }}>
            Upload your desktop scraper CSV. Multi phone rows become one number, then email and phone
            statuses are marked.
          </p>
          <Link
            href="/bbb-scraper/outreach"
            className="mt-3 inline-block text-sm font-semibold text-indigo-500 hover:text-teal-500"
          >
            Open AI Outreach
          </Link>
        </Container>
      </section>
      <Section tight>
        <Container>
          <ValidateClient />
        </Container>
      </Section>
    </>
  );
}
