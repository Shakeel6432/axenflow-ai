import type { Metadata } from "next";
import { getPortfolioProjects } from "@/lib/portfolio";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Portfolio | Automation Projects & Case Studies",
  description:
    "Case studies of AxenFlow AI client work: scrapers, WhatsApp agents, email AI, CRM sync, and outreach pipelines. Request full proof for any project.",
  keywords: [
    "AI automation portfolio",
    "AI WhatsApp agents case study",
    "web scraping project",
    "automation case studies",
  ],
  alternates: { canonical: "https://www.axenflowai.com/portfolio" },
};

export default function PortfolioPage() {
  const projects = getPortfolioProjects();

  return (
    <>
      <PageHero
        title="Our Portfolio"
        description="Real automation projects built for clients and running in production."
      />
      <Section tight>
        <div className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <PortfolioCard key={project.id} project={project} variant="page" />
          ))}
        </div>
      </Section>
    </>
  );
}
