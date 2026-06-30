import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ClientRequirementForm } from "@/components/forms/ClientRequirementForm";

export const metadata: Metadata = {
  title: "Contact | Get a Free Automation Quote",
  description: "Ready to automate your business? Contact AxenFlow AI for a free quote. We respond within 24 hours with a clear plan and timeline.",
  keywords: ["hire AI automation agency", "automation quote", "contact AxenFlow AI", "WhatsApp bot quote"],
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
      <PageHero title="Contact Us" description="Tell us what you need and we'll figure out the best way to automate it." />
      <Section>
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
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
          <div className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-7 sm:p-10">
              <h2 className="font-[var(--font-space)] mb-6 text-xl font-bold" style={{ color: "var(--c-heading)" }}>Your Project Details</h2>
              <ClientRequirementForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
