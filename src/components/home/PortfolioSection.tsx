import Image from "next/image";
import { portfolioItems } from "@/lib/constants";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { HomeReveal } from "@/components/home/HomeReveal";

export function PortfolioSection() {
  return (
    <Section id="portfolio" style={{ background: "var(--c-bg-alt)" }} divider>
      <HomeReveal>
        <SectionHeading
          title="Recent Projects"
          description="Scrapers, WhatsApp agents, email AI, and pipelines that connect to our lead tools and your stack."
        />
      </HomeReveal>
      <HomeReveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {portfolioItems.slice(0, 3).map((item) => (
          <article key={item.title} className="glass-card home-hover-lift overflow-hidden">
            <div className="relative h-52 overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={65}
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, var(--c-bg), transparent)" }}
              />
              <span className="absolute bottom-4 left-4 rounded-lg bg-indigo-600/90 px-3 py-1.5 text-xs font-bold text-white">
                {item.category}
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-[var(--font-space)] mb-2 text-base font-bold" style={{ color: "var(--c-heading)" }}>
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                {item.description}
              </p>
            </div>
          </article>
        ))}
      </HomeReveal>
      <HomeReveal className="mt-12 text-center">
        <Button href="/portfolio" variant="outline" size="lg">
          See All Projects
        </Button>
      </HomeReveal>
    </Section>
  );
}
