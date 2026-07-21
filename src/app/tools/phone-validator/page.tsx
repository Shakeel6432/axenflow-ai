import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PhoneValidatorClient } from "@/components/tools/PhoneValidatorClient";

export const metadata: Metadata = {
  title: "Phone Validator",
  description:
    "Validate and clean phone numbers: format check, US normalize, keep one number, reject toll-free or short codes.",
  alternates: { canonical: `${siteConfig.url}/tools/phone-validator` },
};

export default function PhoneValidatorPage() {
  return (
    <>
      <section
        className="relative overflow-hidden pt-24 pb-8 sm:pt-28"
        style={{ borderBottom: "1px solid var(--c-border)" }}
      >
        <Container>
          <p className="text-sm font-semibold" style={{ color: "#14b8a6" }}>
            AxenFlow AI Tools
          </p>
          <h1
            className="mt-2 font-[var(--font-space)] text-3xl font-bold sm:text-4xl"
            style={{ color: "var(--c-heading)" }}
          >
            Phone Validator
          </h1>
          <p className="mt-2 max-w-2xl text-base" style={{ color: "var(--c-text-dim)" }}>
            Clean multi-number cells, normalize US format, and flag invalid or toll-free numbers.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/tools/email-validator" className="text-indigo-500 hover:text-teal-500">
              Email Validator
            </Link>
            <Link href="/tools" className="text-indigo-500 hover:text-teal-500">
              All tools
            </Link>
          </div>
        </Container>
      </section>
      <Section tight>
        <Container>
          <PhoneValidatorClient />
        </Container>
      </Section>
    </>
  );
}
