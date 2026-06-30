import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Privacy Policy | AxenFlow AI",
  description: "Read AxenFlow AI's privacy policy. We explain what data we collect, how we use it, and how we protect your information.",
  alternates: { canonical: "https://axenflow.ai/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" description={`Last updated: ${new Date().getFullYear()}`} />
      <Section className="!py-16">
        <div className="glass-card mx-auto max-w-3xl rounded-2xl p-8 sm:p-12">
          <div className="space-y-8">
            {[
              { h: "Information We Collect", p: "When you submit our contact form, we collect your name, email, company details, and project information you provide voluntarily." },
              { h: "How We Use Your Information", p: "We use your data solely to respond to inquiries and deliver requested services. We never sell personal data to third parties." },
            ].map(({ h, p }) => (
              <div key={h}>
                <h2 className="font-[var(--font-space)] text-lg font-bold" style={{ color: "var(--c-heading)" }}>{h}</h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>{p}</p>
              </div>
            ))}
            <div>
              <h2 className="font-[var(--font-space)] text-lg font-bold" style={{ color: "var(--c-heading)" }}>Contact</h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>Questions? Email <a href={`mailto:${siteConfig.email}`} className="text-indigo-500 hover:text-teal-500">{siteConfig.email}</a></p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
