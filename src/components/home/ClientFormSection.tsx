import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactGuidelines } from "@/components/contact/ContactGuidelines";
import { ContactForm } from "@/components/contact/ContactForm";
import { HomeReveal } from "@/components/home/HomeReveal";

export function ClientFormSection() {
  return (
    <Section id="inquiry" style={{ background: "var(--c-bg-alt)" }}>
      <HomeReveal>
        <SectionHeading
          title="Start a Project"
          description="Need a custom scraper, WhatsApp agent, or workflow on top of our tools? Message us. We reply within 24 hours."
        />
      </HomeReveal>
      <HomeReveal stagger className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-6">
        <ContactGuidelines sidebar />
        <ContactForm />
      </HomeReveal>
    </Section>
  );
}
