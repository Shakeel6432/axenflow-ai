import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { PhoneValidatorClient } from "@/components/tools/PhoneValidatorClient";

export const metadata: Metadata = {
  title: "Phone Validator",
  description:
    "Validate phone numbers for every country: E.164 check, country detection, toll free and premium filters.",
  alternates: { canonical: `${siteConfig.url}/tools/phone-validator` },
};

export default function PhoneValidatorPage() {
  return (
    <>
      <PageHero
        title="Phone Validator"
        description="Validate any country number locally: Mobile vs Landline vs VoIP, country, and likely operator. No third party API."
      />
      <Section tight>
        <Container>
          <div className="mb-6 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/tools/email-validator" className="text-indigo-500 hover:text-teal-500">
              Email Validator
            </Link>
            <Link href="/tools" className="text-indigo-500 hover:text-teal-500">
              All tools
            </Link>
          </div>
          <PhoneValidatorClient />
        </Container>
      </Section>
    </>
  );
}
