import portfolioData from "../../content/portfolio.json";

export type PortfolioProofType =
  | "screenshot"
  | "video"
  | "written_permission_quote"
  | "none_yet";

export type PortfolioProject = {
  id: string;
  title: string;
  client_name: string;
  industry: string;
  problem: string;
  solution: string;
  /** Qualitative or proven metric only — never invent numbers without proof_asset. */
  result: string;
  tech_stack: string[];
  proof_type: PortfolioProofType;
  /** Public path under /public, e.g. "/images/portfolio/proofs/my-shot.png". Empty if none_yet. */
  proof_asset: string;
  timeline: string;
  /** Optional live/demo URL. Empty string if not shareable. */
  project_url: string;
  /** Decorative card cover (not proof). */
  cover_image: string;
  /** When true, shown in homepage "Recent Projects". */
  featured: boolean;
};

const projects = portfolioData.projects as PortfolioProject[];

export function getPortfolioProjects(): PortfolioProject[] {
  return projects;
}

export function getFeaturedPortfolioProjects(): PortfolioProject[] {
  const featured = projects.filter((p) => p.featured);
  return featured.length ? featured : projects.slice(0, 3);
}

export function getPortfolioProjectById(id: string): PortfolioProject | undefined {
  return projects.find((p) => p.id === id);
}

export function caseStudyRequestMessage(title: string): string {
  return `I'd like to see the full case study for ${title}`;
}

export function caseStudyRequestHref(title: string): string {
  const message = caseStudyRequestMessage(title);
  return `/contact?message=${encodeURIComponent(message)}#contact-form`;
}
