import Link from "@/components/ui/AppLink";
import { BookOpen } from "lucide-react";

export function BlogGuideCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="glass-card flex flex-col gap-3 rounded-2xl p-5 transition-colors hover:border-indigo-500/40 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      style={{ border: "1px solid var(--c-border)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(20,184,166,0.12)", color: "#2dd4bf" }}
        >
          <BookOpen size={20} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--c-heading)" }}>
            {title}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
            {description}
          </p>
        </div>
      </div>
      <span className="text-sm font-semibold text-indigo-500">Read the guide →</span>
    </Link>
  );
}
