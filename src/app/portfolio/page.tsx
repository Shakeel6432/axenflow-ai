import type { Metadata } from "next";
import Image from "next/image";
import { portfolioItems } from "@/lib/constants";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Portfolio | Automation Projects & Case Studies",
  description: "See real automation projects by AxenFlow AI including lead scrapers, WhatsApp bots, email agents, CRM workflows, and more. All running in production for real clients.",
  keywords: ["AI automation portfolio", "WhatsApp bot case study", "web scraping project", "automation case studies"],
  alternates: { canonical: "https://www.axenflowai.com/portfolio" },
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero title="Our Portfolio" description="Every project here is real. Built for actual clients, running in production." />
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioItems.map((item) => (
            <article key={item.title} className="glass-card group overflow-hidden">
              <div className="relative h-52 overflow-hidden">
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, var(--c-bg), transparent)` }} />
                <span className="absolute bottom-4 left-4 rounded-lg bg-indigo-600/90 px-3 py-1.5 text-xs font-bold text-white">{item.category}</span>
              </div>
              <div className="p-6">
                <h2 className="font-[var(--font-space)] mb-2 font-bold" style={{ color: "var(--c-heading)" }}>{item.title}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-14 text-center"><Button href="/contact" size="lg">Start Your Project</Button></div>
      </Section>
    </>
  );
}
