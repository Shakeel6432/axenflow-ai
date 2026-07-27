import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { LeadFinderSection } from "@/components/leads/LeadFinderSection";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { getSessionUser } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: "Lead Finder | Free Business Lead Database",
  description:
    "Search the free AxenFlowAI business lead database by keyword, category, and location. Filter, select, and export leads to CSV, Excel, or JSON.",
  keywords: [
    "business lead database",
    "lead finder",
    "free lead database",
    "export business leads",
    "B2B lead search",
  ],
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
      <Section tight className="!pb-0">
        <Container>
          <p className="mx-auto mb-2 max-w-5xl text-sm" style={{ color: "var(--c-text-muted)" }}>
            New here? Read the{" "}
            <Link href="/blog/businessleaddatabase" className="text-indigo-500 hover:text-teal-500">
              business lead database guide
            </Link>{" "}
            for search, filter, and export tips.
          </p>
        </Container>
      </Section>
      <LeadFinderSection
        mode={isAuthed ? "full" : "preview"}
        hideHeading
      />
    </>
  );
}
