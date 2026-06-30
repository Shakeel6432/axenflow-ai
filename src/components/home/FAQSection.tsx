import { faqs } from "@/lib/constants";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";

export function FAQSection() {
  return (
    <Section id="faq" divider>
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          title="Frequently Asked Questions"
          description="Got questions? Here are the ones we hear most often."
        />
        <Accordion items={faqs} />
      </div>
    </Section>
  );
}
