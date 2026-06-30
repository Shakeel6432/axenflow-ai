import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ClientRequirementForm } from "@/components/forms/ClientRequirementForm";

export function ClientFormSection() {
  return (
    <Section id="inquiry" style={{ background: "var(--c-bg-alt)" }}>
      <div className="mx-auto max-w-2xl">
        <SectionHeading title="Start a Project" description="Fill this out and we'll get back to you within 24 hours with a plan and quote." />
        <div className="glass-card rounded-2xl p-7 sm:p-10">
          <ClientRequirementForm />
        </div>
      </div>
    </Section>
  );
}
