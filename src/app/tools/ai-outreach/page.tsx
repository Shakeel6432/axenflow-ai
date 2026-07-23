import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
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

export default function AiOutreachPage() {
  return (
    <>
      <PageHero
        title="AI Outreach"
        description="Chat to create a template, then add it to your CSV or Excel sheet."
      />
      <Section tight>
        <Container>
          <ToolHubLinks current="/tools/ai-outreach" />
          <OutreachClient />
        </Container>
      </Section>
    </>
  );
}
