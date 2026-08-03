import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Privacy Policy | AxenFlow AI",
  description: "Read AxenFlow AI's privacy policy. We explain what data we collect, how we use it, and how we protect your information.",
  alternates: { canonical: "https://www.axenflowai.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" description={`Last updated: ${new Date().getFullYear()}`} />
      <Section tight>
        <div className="glass-card mx-auto max-w-3xl rounded-2xl p-8 sm:p-12">
          <div className="space-y-8">
            {[
              { h: "Information We Collect", p: "When you contact us by email or Fiverr, we collect the name, email, and project information you choose to share with us. If you connect a mailbox to Email Warmup, we store your email address, provider type, and an encrypted App Password used only for warmup automation." },
              { h: "How We Use Your Information", p: "We use your data to respond to inquiries, deliver requested services, and run tools you enable (such as email warmup). Warmup uses SMTP/IMAP only for messages our tool tags for warmup. We never sell personal data to third parties." },
              { h: "Connected mailboxes (Email Warmup)", p: "App Passwords are encrypted at rest using envelope encryption (AES-256-GCM). You can disconnect anytime from your dashboard, which permanently deletes stored credentials. We retain connection audit logs (action type and timestamp, not inbox content) for security. Have legal counsel review before broad launch." },
              { h: "Retention", p: "Encrypted mailbox credentials exist only while connected. Disconnecting deletes them immediately. Audit logs may be kept for a limited period for security investigations." },
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
