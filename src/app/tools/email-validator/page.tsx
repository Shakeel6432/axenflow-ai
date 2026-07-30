import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth-guards";
import { EMAIL_VALIDATOR_FAQS } from "@/lib/email-validator-faq";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { EmailValidatorClient } from "@/components/tools/EmailValidatorClient";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";
import { EmailSingleCheck } from "@/components/tools/email/EmailSingleCheck";
import { EmailValidatorMarketing } from "@/components/tools/email/EmailValidatorMarketing";

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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: EMAIL_VALIDATOR_FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PageHero
        title="Email Validator"
        description="Free single email check with syntax, DNS, MX record check, disposable filter, and bounce risk. Sign in for bulk email validation and CSV export."
      />
      <Section tight>
        <Container>
          <ToolHubLinks current="/tools/email-validator" />

          <div className="mt-2 space-y-8">
            <EmailSingleCheck />

            <EmailValidatorMarketing isAuthed={isAuthed}>
              <EmailValidatorClient />
            </EmailValidatorMarketing>
          </div>
        </Container>
      </Section>
    </>
  );
}
