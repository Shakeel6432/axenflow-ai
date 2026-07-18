import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireUser, userIdFromSession } from "@/lib/auth-guards";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Search History",
  robots: { index: false, follow: false },
};

export default async function SearchHistoryPage() {
  const session = await requireUser();
  if (!session) {
    redirect(`/signin?callbackUrl=${encodeURIComponent("/dashboard/history")}`);
  }

  const userId = userIdFromSession(session);
  const rows =
    isDatabaseConfigured() && userId
      ? await prisma.searchHistory.findMany({
          where: { userId },
          orderBy: { searchedAt: "desc" },
          take: 50,
        })
      : [];

  return (
    <>
      <PageHero title="Search History" description="Recent Lead Finder searches from your account." />
      <Section tight>
        <div className="mb-4">
          <Link href="/dashboard" className="text-sm font-semibold text-indigo-500 hover:text-teal-500">
            ← Back to dashboard
          </Link>
        </div>
        {!rows.length ? (
          <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>
            No saved searches yet. Run a search from the{" "}
            <Link href="/tools" className="text-indigo-500">Lead Finder tool</Link>.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--c-border)" }}>
            <table className="min-w-full text-left text-sm">
              <thead style={{ background: "var(--c-hover-bg)", color: "var(--c-text-dim)" }}>
                <tr>
                  <th className="px-4 py-3 font-semibold">Keyword</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Results</th>
                  <th className="px-4 py-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} style={{ borderTop: "1px solid var(--c-border)", color: "var(--c-heading)" }}>
                    <td className="px-4 py-3">{row.keyword || "-"}</td>
                    <td className="px-4 py-3">{row.city || "-"}</td>
                    <td className="px-4 py-3">{row.category || "-"}</td>
                    <td className="px-4 py-3">{row.totalResults}</td>
                    <td className="px-4 py-3">{row.searchedAt.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}
