import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Download, FileDown, History, Search, Settings } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const cards = [
  {
    title: "Lead Finder Tool",
    description: "Search leads, bulk-select, export CSV/Excel/JSON, and save lists.",
    href: "/tools",
    icon: Search,
  },
  {
    title: "Saved Leads",
    description: "Open businesses you bookmarked from search results.",
    href: "/dashboard/saved",
    icon: Bookmark,
  },
  {
    title: "Export History",
    description: "See past CSV, Excel, and JSON downloads from your account.",
    href: "/dashboard/exports",
    icon: FileDown,
  },
  {
    title: "Desktop Scrapers",
    description: "Agency scrapers from AxenFlow AI for fresh leads. Use with a VPN (sign-in required).",
    href: "/download",
    icon: Download,
  },
  {
    title: "Search History",
    description: "Review recent lead searches tied to your account.",
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "Account Settings",
    description: "View your profile details and account information.",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default async function DashboardPage() {
  const session = await requireUser();
  if (!session) {
    redirect(`/signin?callbackUrl=${encodeURIComponent("/dashboard")}`);
  }

  const name = session.user?.name || session.user?.email || "there";

  return (
    <>
      <PageHero
        title={`Welcome, ${name}`}
        description="Your AxenFlow AI workspace for lead tools, downloads, and account controls."
      />
      <Section tight>
        <div className="mx-auto grid w-full max-w-4xl gap-4 sm:grid-cols-2">
          {cards.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="glass-card group rounded-2xl p-6 transition hover:-translate-y-0.5"
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
              >
                <Icon size={20} />
              </div>
              <h2 className="text-lg font-semibold group-hover:text-indigo-400" style={{ color: "var(--c-heading)" }}>
                {title}
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--c-text-muted)" }}>{description}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
