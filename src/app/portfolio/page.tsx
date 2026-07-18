import type { Metadata } from "next";
import Image from "next/image";
import { portfolioItems } from "@/lib/constants";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Portfolio | Automation Projects & Case Studies",
  description:
    "See real automation projects by AxenFlow AI including lead scrapers, AI WhatsApp agents, email agents, CRM workflows, and more. All running in production for real clients.",
  keywords: [
    "AI automation portfolio",
    "AI WhatsApp agents case study",
    "web scraping project",
    "automation case studies",
  ],
  alternates: { canonical: "https://www.axenflowai.com/portfolio" },
};

/**
 * Mirrors /services card layout:
 * - Section tight
 * - max-w-5xl · gap-4 · sm:2 · lg:3
 * - glass-card · rounded-2xl · p-5/sm:p-6 text block
 * - title text-base/sm:text-lg font-bold · body text-sm
 */
export default function PortfolioPage() {
  return (
    <>
      <PageHero
        title="Our Portfolio"
        description="Every project here is real. Built for actual clients, running in production."
      />
      <Section tight>
        <div className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioItems.map((item) => (
            <article
              key={item.title}
              className="glass-card group flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative h-16 shrink-0 overflow-hidden sm:h-20">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, var(--c-bg), transparent 65%)" }}
                />
                <span className="absolute bottom-2 left-2 rounded-md bg-indigo-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {item.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h2
                  className="font-[var(--font-space)] mb-2 text-base font-bold sm:text-lg"
                  style={{ color: "var(--c-heading)" }}
                >
                  {item.title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
