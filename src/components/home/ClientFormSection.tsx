import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactGuidelines } from "@/components/contact/ContactGuidelines";

export function ClientFormSection() {
  return (
    <Section id="inquiry" style={{ background: "var(--c-bg-alt)" }}>
      <SectionHeading
        title="Start a Project"
        description="Contact us by email or Fiverr. Send your project details and we will discuss the best solution for your business."
      />
      <div className="mx-auto max-w-5xl">
        <ContactGuidelines compact />
      </div>
    </Section>
  );
}
