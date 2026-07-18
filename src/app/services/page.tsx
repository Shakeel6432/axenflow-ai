import type { Metadata } from "next";
import { Bot, MessageCircle, Mail, Globe, Workflow, Cpu } from "lucide-react";
import { services } from "@/lib/constants";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Services | AI Bots, Scraping, WhatsApp & Email Agents",
  description: "AxenFlow AI offers AI automation, AI WhatsApp agents, web scraping, AI email agents, n8n/Make workflow automation, and custom AI solutions. See what we can build for you.",
  keywords: ["AI automation services", "AI WhatsApp agents", "web scraping agency", "email automation", "n8n developer", "Make.com expert"],
  alternates: { canonical: "https://www.axenflowai.com/services" },
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
      <PageHero
        title="What We Can Build for You"
        description="From simple bots to complex multi-tool automations, here is everything we offer."
      />
      <Section tight>
        <div className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const si = serviceIcons[i];
            return (
              <article
                key={service.title}
                className={`glass-card group overflow-hidden rounded-2xl border ${si.border} p-5 transition-all duration-300 hover:scale-[1.02] sm:p-6`}
              >
                <div
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b ${si.bg}`}
                  style={{ border: `1px solid ${si.color}30` }}
                >
                  <si.Icon size={22} style={{ color: si.color }} strokeWidth={1.8} />
                </div>
                <h2
                  className="font-[var(--font-space)] mb-2 text-base font-bold sm:text-lg"
                  style={{ color: "var(--c-heading)" }}
                >
                  {service.title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                  {service.description}
                </p>
              </article>
            );
          })}
        </div>
      </Section>
    </>
  );
}
