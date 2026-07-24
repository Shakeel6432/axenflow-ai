import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth-guards";
import { AuthRequired } from "@/components/auth/AuthRequired";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { WhatsAppCheckerClient } from "@/components/tools/WhatsAppCheckerClient";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";

export const metadata: Metadata = {
  title: {
    absolute: "WhatsApp Number Checker | Bulk CSV | AxenFlowAI",
  },
  description:
    "Check if phone numbers are registered on WhatsApp. Single number or bulk CSV upload with export. AxenFlowAI tools hub.",
  keywords: [
    "whatsapp number checker",
    "check whatsapp number",
    "bulk whatsapp checker",
    "whatsapp registered number",
  ],
  alternates: { canonical: `${siteConfig.url}/tools/whatsapp-checker` },
  openGraph: {
    title: "WhatsApp Number Checker | Bulk CSV",
    description: "Verify if numbers are on WhatsApp. Single check or CSV bulk upload.",
    url: `${siteConfig.url}/tools/whatsapp-checker`,
  },
};

export default async function WhatsAppCheckerPage() {
  const session = await getSessionUser();
  const isAuthed = Boolean(session);

  return (
    <>
      <PageHero
        wide
        singleLine
        title="WhatsApp Number Checker"
        description={
          isAuthed
            ? "Verify if numbers are registered on WhatsApp. Single check or CSV bulk upload with CSV export."
            : "Browse the tool here. Sign in to run checks and upload CSV files."
        }
      />
      <Section tight>
        <Container>
          <ToolHubLinks current="/tools/whatsapp-checker" />

          <div
            className="mb-8 rounded-2xl p-5 text-sm leading-relaxed sm:p-6"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
          >
            <p style={{ color: "var(--c-text-dim)" }}>
              Clean your outreach lists before WhatsApp campaigns. Pair with{" "}
              <Link href="/tools/phone-validator" className="text-indigo-400 hover:text-teal-400">
                Phone Validator
              </Link>
              ,{" "}
              <Link href="/tools/email-validator" className="text-indigo-400 hover:text-teal-400">
                Email Validator
              </Link>
              , or{" "}
              <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
                AI Outreach
              </Link>
              .
            </p>
            <div className="mt-4">
              <Button href="/tools/whatsapp-checker#checker" variant="green" size="sm">
                Jump to checker
              </Button>
            </div>
          </div>

          <div id="checker">
            {isAuthed ? (
              <WhatsAppCheckerClient />
            ) : (
              <AuthRequired
                callbackUrl="/tools/whatsapp-checker"
                message="Sign in to check WhatsApp numbers and upload CSV files."
              />
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
