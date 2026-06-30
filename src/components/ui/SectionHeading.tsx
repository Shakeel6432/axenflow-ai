import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ title, description, align = "center", className }: Props) {
  return (
    <div className={cn("mb-14 max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <h2 className="font-[var(--font-space)] text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]" style={{ color: "var(--c-heading)" }}>
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed sm:text-lg" style={{ color: "var(--c-text-dim)" }}>{description}</p>
      )}
    </div>
  );
}
