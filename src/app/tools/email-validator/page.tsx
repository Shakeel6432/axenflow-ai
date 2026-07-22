import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
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
      <PageHero
        title="Email Validator"
        description="Choose which checks to run: syntax, DNS, MX, disposable domains, role accounts, and hard bounce estimates."
      />
      <Section tight>
        <Container>
          <div className="mb-6 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/tools/phone-validator" className="text-indigo-500 hover:text-teal-500">
              Phone Validator
            </Link>
            <Link href="/tools" className="text-indigo-500 hover:text-teal-500">
              All tools
            </Link>
          </div>
          <EmailValidatorClient />
        </Container>
      </Section>
    </>
  );
}
