import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ContactGuidelines } from "@/components/contact/ContactGuidelines";

export const metadata: Metadata = {
  title: "Contact | Start Your Automation Project",
  description: "Contact AxenFlow AI by email or Fiverr. Send your project details, discuss your requirements, and get a response within 24 hours.",
  keywords: ["hire AI automation agency", "contact AxenFlow AI", "automation project inquiry", "Fiverr automation developer"],
  alternates: { canonical: "https://axenflow.ai/contact" },
};

const cards = [
  { icon: Mail, label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}`, color: "#6366f1" },
  { icon: MapPin, label: "We Work With", value: "Clients Worldwide", color: "#14b8a6" },
  { icon: Clock, label: "Response Time", value: "Under 24 Hours", color: "#f59e0b" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        description="Reach out by email or Fiverr. Share your project details and we will discuss the best way to automate your workflow."
      />
      <Section>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {cards.map(({ icon: Icon, label, value, href, color }) => (
            <div key={label} className="glass-card rounded-xl p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}12` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--c-text-muted)" }}>{label}</p>
              {href ? (
                <a href={href} className="mt-1 block text-sm hover:text-indigo-500" style={{ color: "var(--c-heading)" }}>{value}</a>
              ) : (
                <p className="mt-1 text-sm" style={{ color: "var(--c-heading)" }}>{value}</p>
              )}
            </div>
          ))}
        </div>

        <ContactGuidelines />
      </Section>
    </>
  );
}
