import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Validate Leads",
  description: "Use the separate Email Validator and Phone Validator tools.",
  alternates: { canonical: `${siteConfig.url}/bbb-scraper/validate` },
  robots: { index: false, follow: true },
};

/** Legacy combined page: point users to the dedicated tools. */
export default function LegacyValidatePage() {
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
            Choose a validator
          </h1>
          <p className="mt-2 max-w-xl text-base" style={{ color: "var(--c-text-dim)" }}>
            Email and phone validation are now separate advanced tools.
          </p>
        </Container>
      </section>
      <Section tight>
        <Container>
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl p-6" style={{ border: "1px solid var(--c-border)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
                Email Validator
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
                Syntax, DNS, MX, disposable, hard-bounce estimate
              </p>
              <Button href="/tools/email-validator" className="mt-4" variant="green">
                Open email tool
              </Button>
            </div>
            <div className="rounded-2xl p-6" style={{ border: "1px solid var(--c-border)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
                Phone Validator
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
                Format, US normalize, keep one number
              </p>
              <Button href="/tools/phone-validator" className="mt-4" variant="outline">
                Open phone tool
              </Button>
            </div>
          </div>
          <p className="mt-6 text-center text-sm">
            <Link href="/tools" className="font-semibold text-indigo-500 hover:text-teal-500">
              Back to Tools
            </Link>
          </p>
        </Container>
      </Section>
    </>
  );
}
