import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth-guards";
import { AuthRequired } from "@/components/auth/AuthRequired";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { OutreachClient } from "@/components/bbb/OutreachClient";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";

export const metadata: Metadata = {
  title: "AI Outreach | Cold Email & Call Script Generator",
  description:
    "Generate cold emails, phone scripts, and follow ups. Chat to build templates, personalize with lead fields, and batch fill CSV or Excel on AxenFlowAI.",
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
          <p className="mb-6 text-sm" style={{ color: "var(--c-text-muted)" }}>
            New here? Read the{" "}
            <Link href="/blog/aioutreach" className="text-indigo-500 hover:text-teal-500">
              AI Outreach guide
            </Link>{" "}
            for templates, placeholders, and batch CSV tips.
          </p>
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
