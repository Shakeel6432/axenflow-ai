import { cn } from "@/lib/utils";
import { Container } from "./Container";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  divider?: boolean;
  /**
   * Compact section after PageHero.
   * Uses normal document flow (no forced vertical centering) to avoid
   * large empty gaps on mobile / “desktop site” mode.
   */
  tight?: boolean;
  style?: React.CSSProperties;
};

export function Section({ children, className, id, divider, tight, style }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full",
        tight ? "py-4 sm:py-6 lg:py-8" : "py-14 sm:py-20 lg:py-28",
        className
      )}
      style={style}
    >
      {divider && <div className="glow-divider absolute inset-x-0 top-0 mx-auto max-w-4xl" />}
      <Container className="w-full">{children}</Container>
    </section>
  );
}
