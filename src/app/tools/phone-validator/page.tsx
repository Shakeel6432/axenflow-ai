import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth-guards";
import { AuthRequired } from "@/components/auth/AuthRequired";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { PhoneValidatorClient } from "@/components/tools/PhoneValidatorClient";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";

export const metadata: Metadata = {
  title: "Phone Validator | Bulk Phone Validation CSV",
  description:
    "Validate phone numbers for any country. Detect Mobile, Landline, or VoIP, normalize to E.164, and export clean CSV results on AxenFlowAI.",
  keywords: [
    "phone validator",
    "bulk phone validation",
    "validate phone numbers CSV",
    "E.164 phone validation",
    "international phone validator",
  ],
  alternates: { canonical: `${siteConfig.url}/tools/phone-validator` },
};

export default async function PhoneValidatorPage() {
  const session = await getSessionUser();
  const isAuthed = Boolean(session);

  return (
    <>
      <PageHero
        title="Phone Validator"
        description={
          isAuthed
            ? "Validate any country number: Mobile vs Landline vs VoIP, country, and likely operator. Upload CSV or check a single number."
            : "Browse the tool here. Sign in to validate numbers or upload CSV files."
        }
      />
      <Section tight>
        <Container>
          <ToolHubLinks current="/tools/phone-validator" />
          <p className="mb-6 text-sm" style={{ color: "var(--c-text-muted)" }}>
            New to list cleaning? Read the{" "}
            <Link href="/blog/bulkphonevalidation" className="text-indigo-500 hover:text-teal-500">
              bulk phone validation guide
            </Link>{" "}
            for CSV prep, result fields, and export tips.
          </p>
          {isAuthed ? (
            <PhoneValidatorClient />
          ) : (
            <AuthRequired
              callbackUrl="/tools/phone-validator"
              message="Sign in to validate phone numbers and upload CSV files."
            />
          )}
        </Container>
      </Section>
    </>
  );
}
