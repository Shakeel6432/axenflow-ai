import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactGuidelines } from "@/components/contact/ContactGuidelines";
import { ContactForm } from "@/components/contact/ContactForm";

export function ClientFormSection() {
  return (
    <Section id="inquiry" style={{ background: "var(--c-bg-alt)" }}>
      <SectionHeading
        title="Start a Project"
        description="Send a message, email us, or reach out on Fiverr. We reply within 24 hours."
      />
      <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-6">
        <ContactGuidelines sidebar />
        <ContactForm />
      </div>
    </Section>
  );
}
