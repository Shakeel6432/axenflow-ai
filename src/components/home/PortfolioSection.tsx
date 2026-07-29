import { getFeaturedPortfolioProjects } from "@/lib/portfolio";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { HomeReveal } from "@/components/home/HomeReveal";

export function PortfolioSection() {
  const projects = getFeaturedPortfolioProjects();

  return (
    <Section id="portfolio" style={{ background: "var(--c-bg-alt)" }} divider>
      <HomeReveal>
        <SectionHeading
          title="Recent Projects"
          description="Scrapers, WhatsApp agents, email AI, and pipelines built for real clients."
        />
      </HomeReveal>
      <HomeReveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <PortfolioCard key={project.id} project={project} variant="home" />
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
