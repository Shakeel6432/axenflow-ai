import { CheckCircle2, Download, Search, Sparkles } from "lucide-react";

const defaultPoints = [
  {
    icon: Search,
    title: "Lead Finder access",
    text: "Search, filter, and export business leads in CSV, Excel, or JSON.",
  },
  {
    icon: Download,
    title: "Desktop scrapers",
    text: "Download tools and manage your saved leads from one dashboard.",
  },
  {
    icon: Sparkles,
    title: "Project-ready support",
    text: "Built for teams that need automation, bots, and reliable delivery.",
  },
];

type AuthShellProps = {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  points?: { icon: typeof Search; title: string; text: string }[];
};

export function AuthShell({
  children,
  eyebrow = "AxenFlow AI",
  title,
  description,
  points = defaultPoints,
}: AuthShellProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
      <aside className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">{eyebrow}</p>
        <h2
          className="mt-3 font-[var(--font-space)] text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: "var(--c-heading)" }}
        >
          {title}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed sm:text-base" style={{ color: "var(--c-text-dim)" }}>
          {description}
        </p>

        <ul className="mt-7 space-y-4">
          {points.map(({ icon: Icon, title: pointTitle, text }) => (
            <li key={pointTitle} className="flex gap-3">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
              >
                <Icon size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--c-heading)" }}>
                  {pointTitle}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-7 inline-flex items-center gap-2 text-xs font-medium" style={{ color: "var(--c-text-muted)" }}>
          <CheckCircle2 size={14} className="text-teal-500" />
          Free account, secure login, and reply within 24h on projects
        </p>
      </aside>

      <div className="w-full">{children}</div>
    </div>
  );
}
