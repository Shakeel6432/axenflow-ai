import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { EmailValidatorClient } from "@/components/tools/EmailValidatorClient";

export const metadata: Metadata = {
  title: "Email Validator",
  description:
    "Validate emails with syntax, DNS, MX, disposable, and hard-bounce estimates. Upload CSV or check a single address.",
  alternates: { canonical: `${siteConfig.url}/tools/email-validator` },
};

export default function EmailValidatorPage() {
  return (
    <>
      <section
        className="relative overflow-hidden pt-24 pb-8 sm:pt-28"
        style={{ borderBottom: "1px solid var(--c-border)" }}
      >
        <Container>
          <p className="text-sm font-semibold" style={{ color: "#818cf8" }}>
            AxenFlow AI Tools
          </p>
          <h1
            className="mt-2 font-[var(--font-space)] text-3xl font-bold sm:text-4xl"
            style={{ color: "var(--c-heading)" }}
          >
            Email Validator
          </h1>
          <p className="mt-2 max-w-2xl text-base" style={{ color: "var(--c-text-dim)" }}>
            Choose which checks to run: syntax, DNS, MX, disposable domains, role accounts, and hard
            bounce estimates.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/tools/phone-validator" className="text-indigo-500 hover:text-teal-500">
              Phone Validator
            </Link>
            <Link href="/tools" className="text-indigo-500 hover:text-teal-500">
              All tools
            </Link>
          </div>
        </Container>
      </section>
      <Section tight>
        <Container>
          <EmailValidatorClient />
        </Container>
      </Section>
    </>
  );
}
