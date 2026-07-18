import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactGuidelines } from "@/components/contact/ContactGuidelines";

export const metadata: Metadata = {
  title: "Contact | Start Your Automation Project",
  description:
    "Contact AxenFlow AI by email or Fiverr. Send your project details, discuss your requirements, and get a response within 24 hours.",
  keywords: [
    "hire AI automation agency",
    "contact AxenFlow AI",
    "automation project inquiry",
    "Fiverr automation developer",
  ],
  alternates: { canonical: "https://www.axenflowai.com/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        description="Share your project details by form, email, or Fiverr. We reply within 24 hours."
      />
      {/* Same centered max-w-5xl band as /services */}
      <Section tight>
        <div className="mx-auto grid w-full max-w-5xl gap-4 self-center lg:grid-cols-2 lg:items-start lg:gap-5">
          <ContactGuidelines sidebar />
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
