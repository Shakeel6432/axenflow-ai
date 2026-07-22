import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { OutreachClient } from "@/components/bbb/OutreachClient";

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
          <div className="mb-6 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/tools/email-validator" className="text-indigo-500 hover:text-teal-500">
              Email Validator
            </Link>
            <Link href="/tools/phone-validator" className="text-indigo-500 hover:text-teal-500">
              Phone Validator
            </Link>
            <Link href="/tools" className="text-indigo-500 hover:text-teal-500">
              All tools
            </Link>
          </div>
          <OutreachClient />
        </Container>
      </Section>
    </>
  );
}
