import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { LeadFinderSection } from "@/components/leads/LeadFinderSection";
import { getSessionUser } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: "Lead Finder | Search Business Leads",
  description:
    "Search business leads by keyword, category, and location with full filters and exports.",
  alternates: { canonical: "https://www.axenflowai.com/leads" },
};

export default async function LeadsPage() {
  const session = await getSessionUser();
  const isAuthed = Boolean(session);

  return (
    <>
      <PageHero
        title="Lead Finder"
        description={
          isAuthed
            ? "Search, select, export CSV/Excel/JSON, and save leads to your dashboard."
            : "Search business leads by keyword, category, and location. Sign in to export and save."
        }
      />
      <LeadFinderSection
        mode={isAuthed ? "full" : "preview"}
        hideHeading
      />
    </>
  );
}
