import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth-guards";
import { AuthRequired } from "@/components/auth/AuthRequired";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { OutreachClient } from "@/components/bbb/OutreachClient";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";

export const metadata: Metadata = {
  title: "AI Outreach",
  description:
    "Generate cold emails, phone scripts, and follow-ups with your business name in Best regards.",
  alternates: { canonical: `${siteConfig.url}/tools/ai-outreach` },
};

export default async function AiOutreachPage() {
  const session = await getSessionUser();
  const isAuthed = Boolean(session);

  return (
    <>
      <PageHero
        title="AI Outreach"
        description={
          isAuthed
            ? "Chat to create a template, then add it to your CSV or Excel sheet."
            : "Browse the tool here. Sign in to generate outreach templates and export files."
        }
      />
      <Section tight>
        <Container>
          <ToolHubLinks current="/tools/ai-outreach" />
          {isAuthed ? (
            <OutreachClient />
          ) : (
            <AuthRequired
              callbackUrl="/tools/ai-outreach"
              message="Sign in to generate AI outreach and export CSV or Excel."
            />
          )}
        </Container>
      </Section>
    </>
  );
}
