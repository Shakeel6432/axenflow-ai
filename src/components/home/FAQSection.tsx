import { faqs } from "@/lib/constants";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { HomeReveal } from "@/components/home/HomeReveal";

export function FAQSection() {
  return (
    <Section id="faq" divider>
      <div className="mx-auto max-w-2xl">
        <HomeReveal>
        <SectionHeading
          title="Frequently Asked Questions"
          description="About Lead Finder, live tools, desktop scrapers, and custom automation projects."
        />
        </HomeReveal>
        <HomeReveal>
          <Accordion items={faqs} />
        </HomeReveal>
      </div>
    </Section>
  );
}
