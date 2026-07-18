import { cn } from "@/lib/utils";
import { Container } from "./Container";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  divider?: boolean;
  /**
   * Compact section after PageHero.
   * Grows to fill remaining main height and vertically centers short content
   * between the hero and footer CTA.
   */
  tight?: boolean;
  style?: React.CSSProperties;
};

export function Section({ children, className, id, divider, tight, style }: SectionProps) {
  const alignStart = Boolean(className?.includes("justify-start"));

  return (
    <section
      id={id}
      className={cn(
        "relative",
        tight
          ? cn("flex min-h-0 flex-1 flex-col", alignStart ? "justify-start py-3 lg:py-4" : "justify-center py-6 lg:py-8")
          : "py-20 lg:py-28",
        className
      )}
      style={style}
    >
      {divider && <div className="glow-divider absolute inset-x-0 top-0 mx-auto max-w-4xl" />}
      <Container
        className={cn(
          // items-center: max-w-* grids center like Services (flex stretch otherwise left-aligns them)
          tight && "flex min-h-0 w-full flex-1 flex-col items-center",
          tight && (alignStart ? "justify-start" : "justify-center")
        )}
      >
        {children}
      </Container>
    </section>
  );
}
