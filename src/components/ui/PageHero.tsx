import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  description?: string;
  /** Larger marketing hero (default is compact so content sits higher) */
  large?: boolean;
  /** Center title/description (auth pages) */
  align?: "left" | "center";
};

export function PageHero({ title, description, large = false, align = "left" }: PageHeroProps) {
  const centered = align === "center";

  return (
    <section
      className={cn(
        "page-hero relative shrink-0 overflow-hidden",
        large ? "pt-28 pb-16 lg:pt-32 lg:pb-20" : "pt-24 pb-5 lg:pt-28 lg:pb-6"
      )}
      style={{ borderBottom: "1px solid var(--c-border)" }}
    >
      <div aria-hidden className="page-hero-fx">
        <span className="page-hero-spotlight" />
        <span className="page-hero-sweep" />
        <span className="page-hero-ring page-hero-ring-a" />
        <span className="page-hero-ring page-hero-ring-b" />
        <span className="page-hero-dot page-hero-dot-1" />
        <span className="page-hero-dot page-hero-dot-2" />
        <span className="page-hero-dot page-hero-dot-3" />
        <span className="page-hero-dot page-hero-dot-4" />
        <span className="page-hero-dot page-hero-dot-5" />
        <span className="page-hero-horizon" />
      </div>
      <Container>
        <div className={cn("relative max-w-3xl", centered && "mx-auto text-center")}>
          <h1
            className={cn(
              "font-[var(--font-space)] font-bold tracking-tight",
              large ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl lg:text-4xl"
            )}
            style={{ color: "var(--c-heading)" }}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                large ? "mt-4 text-lg" : "mt-2 text-base",
                centered && "mx-auto max-w-md"
              )}
              style={{ color: "var(--c-text-dim)" }}
            >
              {description}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
