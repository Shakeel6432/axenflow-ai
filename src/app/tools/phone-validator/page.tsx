import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { PhoneValidatorClient } from "@/components/tools/PhoneValidatorClient";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";
import { PHONE_VALIDATOR_FAQS, phoneValidatorFaqSchema } from "@/lib/phone-validator-faq";

export const metadata: Metadata = {
  title: {
    absolute: "Phone Number Validator | Free International Check | AxenFlowAI",
  },
  description:
    "Validate phone numbers for any country. Detect Mobile, Landline, or VoIP, clean CSV lists, and export results. Free online phone validator by AxenFlowAI.",
  keywords: [
    "phone number validator",
    "phone validator online",
    "bulk phone validation",
    "E.164 phone validation",
    "international phone validator",
  ],
  alternates: { canonical: `${siteConfig.url}/tools/phone-validator` },
  openGraph: {
    title: "Phone Number Validator | Free International Check",
    description:
      "Validate phone numbers for any country. Detect Mobile, Landline, or VoIP and export clean CSV results.",
    url: `${siteConfig.url}/tools/phone-validator`,
  },
};

export default function PhoneValidatorPage() {
  return (
    <>
      <PageHero
        title="Free Phone Number Validator for Every Country"
        description="Validate any country number locally: Mobile vs Landline vs VoIP, country, and likely operator. No third party API."
      />
      <Section tight>
        <Container>
          <ToolHubLinks current="/tools/phone-validator" />

          <div
            className="mb-8 rounded-2xl p-5 text-sm leading-relaxed sm:p-6"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
          >
            <p style={{ color: "var(--c-text-dim)" }}>
              Bad phone data wastes dialer budget and slows sales teams. Validate international
              formats, detect line type, normalize to E.164, and export clean CSV results. Pair with{" "}
              <Link href="/tools/email-validator" className="text-indigo-400 hover:text-teal-400">
                Email Validator
              </Link>
              ,{" "}
              <Link href="/leads" className="text-indigo-400 hover:text-teal-400">
                Lead Finder
              </Link>
              , or{" "}
              <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
                AI Outreach
              </Link>
              . Read our{" "}
              <Link
                href="/blog/bulk-phone-validation-csv-guide"
                className="text-indigo-400 hover:text-teal-400"
              >
                bulk CSV validation guide
              </Link>
              .
            </p>
            <div className="mt-4">
              <Button href="/tools/phone-validator#validator" variant="green" size="sm">
                Jump to validator
              </Button>
            </div>
          </div>

          <div id="validator">
            <PhoneValidatorClient />
          </div>

          <div className="mt-12">
            <h2
              className="mb-4 font-[var(--font-space)] text-xl font-bold sm:text-2xl"
              style={{ color: "var(--c-heading)" }}
            >
              Phone Validator FAQ
            </h2>
            <Accordion items={PHONE_VALIDATOR_FAQS} />
          </div>
        </Container>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(phoneValidatorFaqSchema()) }}
      />
    </>
  );
}
