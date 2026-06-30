import { Container } from "@/components/ui/Container";

type PageHeroProps = { title: string; description?: string };

export function PageHero({ title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-20" style={{ borderBottom: "1px solid var(--c-border)" }}>
      <Container>
        <div className="relative max-w-3xl">
          <h1 className="font-[var(--font-space)] text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl" style={{ color: "var(--c-heading)" }}>{title}</h1>
          {description && <p className="mt-4 text-lg" style={{ color: "var(--c-text-dim)" }}>{description}</p>}
        </div>
      </Container>
    </section>
  );
}
