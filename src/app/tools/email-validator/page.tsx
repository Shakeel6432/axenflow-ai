import type { Metadata } from "next";
import Link from "@/components/ui/AppLink";
import { siteConfig } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth-guards";
import { AuthRequired } from "@/components/auth/AuthRequired";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { EmailValidatorClient } from "@/components/tools/EmailValidatorClient";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";

export const metadata: Metadata = {
  title: "Email Validator | Bulk Email Validation CSV",
  description:
    "Validate emails with syntax, DNS, MX, disposable, role, and hard bounce estimates. Upload CSV or check a single address on AxenFlowAI.",
  keywords: [
    "email validator",
    "bulk email validation",
    "validate emails CSV",
    "MX record check",
    "disposable email filter",
  ],
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
          <p className="mb-6 text-sm" style={{ color: "var(--c-text-muted)" }}>
            New to list cleaning? Read the{" "}
            <Link href="/blog/bulkemailvalidation" className="text-indigo-500 hover:text-teal-500">
              bulk email validation guide
            </Link>{" "}
            for CSV prep, check meanings, and export tips.
          </p>
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
