import Link from "next/link";
import { ArrowUpRight, Bot, MessageCircle, Mail, Globe, Workflow, Cpu } from "lucide-react";
import { services } from "@/lib/constants";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HomeReveal } from "@/components/home/HomeReveal";

const serviceIcons = [
  { Icon: Bot, bg: "bg-indigo-500/15", ring: "ring-indigo-500/20", color: "#6366f1" },
  { Icon: MessageCircle, bg: "bg-teal-500/15", ring: "ring-teal-500/20", color: "#14b8a6" },
  { Icon: Mail, bg: "bg-amber-500/15", ring: "ring-amber-500/20", color: "#f59e0b" },
  { Icon: Globe, bg: "bg-indigo-500/15", ring: "ring-indigo-500/20", color: "#6366f1" },
  { Icon: Workflow, bg: "bg-teal-500/15", ring: "ring-teal-500/20", color: "#14b8a6" },
  { Icon: Cpu, bg: "bg-amber-500/15", ring: "ring-amber-500/20", color: "#f59e0b" },
];

export function ServicesSection() {
  return (
    <Section id="services">
      <HomeReveal>
        <SectionHeading
          title="Custom Services"
          description="Hire us for scrapers, WhatsApp agents, email AI, and workflows that plug into Lead Finder and our live tools."
        />
      </HomeReveal>
      <HomeReveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => {
          const si = serviceIcons[i];
          return (
            <article key={service.title} className="glass-card home-hover-lift group relative overflow-hidden p-7">
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${si.bg} ${si.ring} ring-1`}>
                <si.Icon size={26} style={{ color: si.color }} strokeWidth={1.8} />
              </div>
              <h3 className="font-[var(--font-space)] mb-2 text-lg font-bold" style={{ color: "var(--c-heading)" }}>
                {service.title}
              </h3>
              <p className="mb-5 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                {service.description}
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-500 transition-colors group-hover:text-teal-500"
              >
                Learn More <ArrowUpRight size={14} />
              </Link>
            </article>
          );
        })}
      </HomeReveal>
    </Section>
  );
}
