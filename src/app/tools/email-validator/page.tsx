import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { EmailValidatorClient } from "@/components/tools/EmailValidatorClient";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";

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
          <ToolHubLinks current="/tools/email-validator" />
          <EmailValidatorClient />
        </Container>
      </Section>
    </>
  );
}
