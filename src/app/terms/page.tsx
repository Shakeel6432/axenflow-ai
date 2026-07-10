import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Terms of Service | AxenFlow AI",
  description: "AxenFlow AI terms of service. Covers project scope, payments, delivery timelines, and intellectual property rights.",
  alternates: { canonical: "https://www.axenflowai.com/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms of Service" description={`Last updated: ${new Date().getFullYear()}`} />
      <Section className="!py-16">
        <div className="glass-card mx-auto max-w-3xl rounded-2xl p-8 sm:p-12">
          <div className="space-y-8">
            {[
              { h: "Services", p: `${siteConfig.name} provides AI automation, web scraping, and workflow consulting. Deliverables are defined per project agreement.` },
              { h: "Payment & Delivery", p: "Terms, timelines, and payments are agreed before project start. We deliver within agreed timeframes." },
              { h: "Intellectual Property", p: "Upon full payment, clients receive ownership of custom workflows and code built for their project." },
              { h: "Contact", p: `Questions? Email ${siteConfig.email}` },
            ].map(({ h, p }) => (
              <div key={h}>
                <h2 className="font-[var(--font-space)] text-lg font-bold" style={{ color: "var(--c-heading)" }}>{h}</h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
