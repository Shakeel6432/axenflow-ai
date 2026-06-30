import type { Metadata } from "next";
import { Bot, MessageCircle, Mail, Globe, Workflow, Cpu } from "lucide-react";
import { services } from "@/lib/constants";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Services | AI Bots, Scraping, WhatsApp & Email Automation",
  description: "AxenFlow AI offers AI automation, WhatsApp bots, web scraping, AI email agents, n8n/Make workflow automation, and custom AI solutions. See what we can build for you.",
  keywords: ["AI automation services", "WhatsApp bot service", "web scraping agency", "email automation", "n8n developer", "Make.com expert"],
  alternates: { canonical: "https://axenflow.ai/services" },
};

const serviceIcons = [
  { Icon: Bot, bg: "from-indigo-500/20 to-indigo-500/5", border: "border-indigo-500/20", color: "#6366f1" },
  { Icon: MessageCircle, bg: "from-teal-500/20 to-teal-500/5", border: "border-teal-500/20", color: "#14b8a6" },
  { Icon: Mail, bg: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20", color: "#f59e0b" },
  { Icon: Globe, bg: "from-indigo-500/20 to-indigo-500/5", border: "border-indigo-500/20", color: "#6366f1" },
  { Icon: Workflow, bg: "from-teal-500/20 to-teal-500/5", border: "border-teal-500/20", color: "#14b8a6" },
  { Icon: Cpu, bg: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20", color: "#f59e0b" },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero title="What We Can Build for You" description="From simple bots to complex multi-tool automations, here is everything we offer." />
      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const si = serviceIcons[i];
            return (
              <article key={service.title} className={`glass-card group overflow-hidden rounded-2xl border ${si.border} p-8 transition-all duration-300 hover:scale-[1.02]`}>
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-b ${si.bg}`} style={{ border: `1px solid ${si.color}30` }}>
                  <si.Icon size={26} style={{ color: si.color }} strokeWidth={1.8} />
                </div>
                <h2 className="font-[var(--font-space)] mb-3 text-lg font-bold" style={{ color: "var(--c-heading)" }}>{service.title}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>{service.description}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-14 text-center"><Button href="/contact" size="lg">Get a Free Quote</Button></div>
      </Section>
    </>
  );
}
