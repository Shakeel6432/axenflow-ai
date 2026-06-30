import { cn } from "@/lib/utils";
import { Container } from "./Container";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  divider?: boolean;
  style?: React.CSSProperties;
};

export function Section({ children, className, id, divider, style }: SectionProps) {
  return (
    <section id={id} className={cn("relative py-20 lg:py-28", className)} style={style}>
      {divider && <div className="glow-divider absolute inset-x-0 top-0 mx-auto max-w-4xl" />}
      <Container>{children}</Container>
    </section>
  );
}
