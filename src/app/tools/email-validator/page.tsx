import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth-guards";
import { AuthRequired } from "@/components/auth/AuthRequired";
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

export default async function EmailValidatorPage() {
  const session = await getSessionUser();
  const isAuthed = Boolean(session);

  return (
    <>
      <PageHero
        title="Email Validator"
        description={
          isAuthed
            ? "Choose which checks to run: syntax, DNS, MX, disposable domains, role accounts, and hard bounce estimates."
            : "Browse the tool here. Sign in to validate emails or upload CSV files."
        }
      />
      <Section tight>
        <Container>
          <ToolHubLinks current="/tools/email-validator" />
          {isAuthed ? (
            <EmailValidatorClient />
          ) : (
            <AuthRequired
              callbackUrl="/tools/email-validator"
              message="Sign in to validate emails and upload CSV files."
            />
          )}
        </Container>
      </Section>
    </>
  );
}
