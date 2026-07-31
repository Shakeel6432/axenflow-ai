import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth-guards";
import { AI_OUTREACH_FAQS } from "@/lib/ai-outreach-faq";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { OutreachClient } from "@/components/bbb/OutreachClient";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";
import { OutreachSingleSample } from "@/components/tools/outreach/OutreachSingleSample";
import { OutreachMarketing } from "@/components/tools/outreach/OutreachMarketing";

export const metadata: Metadata = {
  title: "AI Outreach | Cold Email & Call Script Generator",
  description:
    "Generate cold emails, phone scripts, and follow ups. Free sample with lead fields, chat to build templates, personalize each row, and batch fill CSV or Excel on AxenFlowAI.",
  keywords: [
    "AI outreach",
    "cold email generator",
    "phone script generator",
    "follow up email template",
    "CSV outreach",
  ],
  alternates: { canonical: `${siteConfig.url}/tools/ai-outreach` },
};

export default async function AiOutreachPage() {
  const session = await getSessionUser();
  const isAuthed = Boolean(session);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: AI_OUTREACH_FAQS.map((item) => ({
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
        title="AI Outreach"
        description="Free personalized sample (no signup). Sign in to chat-build templates, merge lead fields, and batch-fill CSV or Excel."
      />
      <Section tight>
        <Container>
          <ToolHubLinks current="/tools/ai-outreach" />

          <div className="mt-2 space-y-8">
            <OutreachSingleSample />

            <OutreachMarketing isAuthed={isAuthed}>
              <OutreachClient />
            </OutreachMarketing>
          </div>
        </Container>
      </Section>
    </>
  );
}
