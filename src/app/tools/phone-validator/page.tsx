import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth-guards";
import { PHONE_VALIDATOR_FAQS } from "@/lib/phone-validator-faq";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { PhoneValidatorClient } from "@/components/tools/PhoneValidatorClient";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";
import { PhoneSingleCheck } from "@/components/tools/phone/PhoneSingleCheck";
import { PhoneValidatorMarketing } from "@/components/tools/phone/PhoneValidatorMarketing";

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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PHONE_VALIDATOR_FAQS.map((item) => ({
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
        title="Phone Validator"
        description="Free single phone check with format validation, Mobile/Landline/VoIP detection, and E.164 normalization. Sign in for bulk phone validation and CSV export."
      />
      <Section tight>
        <Container>
          <ToolHubLinks current="/tools/phone-validator" />

          <div className="mt-2 space-y-8">
            <PhoneSingleCheck />

            <PhoneValidatorMarketing isAuthed={isAuthed}>
              <PhoneValidatorClient />
            </PhoneValidatorMarketing>
          </div>
        </Container>
      </Section>
    </>
  );
}
