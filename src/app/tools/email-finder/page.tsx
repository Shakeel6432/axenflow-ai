import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth-guards";
import { EMAIL_FINDER_FAQS } from "@/lib/email-finder-faq";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";
import { EmailFinderSingleCheck } from "@/components/tools/email-finder/EmailFinderSingleCheck";
import { EmailFinderMarketing } from "@/components/tools/email-finder/EmailFinderMarketing";

export const metadata: Metadata = {
  title: "Email Finder | Find Work Emails by Name + Domain",
  description:
    "Find likely work emails from first name, last name, and domain. Pattern + MX ranking for everyone; signed-in users get SMTP-level API verification of top candidates on AxenFlowAI.",
  keywords: [
    "email finder",
    "find email by name",
    "work email finder",
    "email pattern generator",
    "MX email finder",
  ],
  alternates: { canonical: `${siteConfig.url}/tools/email-finder` },
};

export default async function EmailFinderPage() {
  const session = await getSessionUser();
  const isAuthed = Boolean(session);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: EMAIL_FINDER_FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PageHero
        title="Email Finder"
        description="Generate likely emails from name + domain, verify MX, reuse domain pattern memory. Sign in for SMTP-level API verification of top candidates and bulk CSV."
      />
      <Section tight>
        <Container>
          <ToolHubLinks current="/tools/email-finder" />
          <div className="mt-2 space-y-8">
            <EmailFinderSingleCheck isAuthed={isAuthed} />
            <EmailFinderMarketing isAuthed={isAuthed} />
          </div>
        </Container>
      </Section>
    </>
  );
}
