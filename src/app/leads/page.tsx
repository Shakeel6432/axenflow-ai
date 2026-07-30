import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "@/components/ui/AppLink";
import { PageHero } from "@/components/ui/PageHero";
import { LeadFinderSection } from "@/components/leads/LeadFinderSection";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { getSessionUser, userIdFromSession } from "@/lib/auth-guards";
import { getClientIpFromHeaders } from "@/lib/bot-guard";
import { rateLimit } from "@/lib/rate-limit";
import {
  filtersToSearchParams,
  parseLeadSearchParams,
  teaserResult,
} from "@/lib/leads-access";
import { getLocationOptions, searchBusinesses } from "@/services/search.service";
import type { PaginatedSearchResult } from "@/types/leads";

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
  robots: {
    index: true,
    follow: true,
  },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const session = await getSessionUser();
  const userId = userIdFromSession(session);
  const isAuthed = Boolean(userId);

  const hdrs = await headers();
  const ip = getClientIpFromHeaders(hdrs);

  const limited = userId
    ? rateLimit(`leads-page:user:${userId}`, 90, 60_000)
    : rateLimit(`leads-page:guest:${ip}`, 25, 60_000);

  const { filters, searched } = parseLeadSearchParams(sp);

  let result: PaginatedSearchResult | null = null;
  let error = "";
  let authRequiredForPage = false;

  if (!limited.ok) {
    error = "Too many requests. Please wait a moment and try again.";
  } else if (searched) {
    if (!isAuthed && filters.page > 1) {
      authRequiredForPage = true;
      error = "Sign in to browse more results.";
    } else {
      if (filters.page > 8) {
        console.warn("[leads] deep pagination", {
          ip,
          userId: userId || null,
          page: filters.page,
          keyword: filters.keyword || null,
        });
      }

      const data = await searchBusinesses({
        ...filtersToSearchParams(filters, { isAuthed }),
        userId: userId || undefined,
      });

      // Always teaser-only in HTML — contacts only via reveal server action.
      result = teaserResult(data);
    }
  }

  const locations = await getLocationOptions();

  return (
    <>
      <PageHero
        title="Lead Finder"
        description={
          isAuthed
            ? "Search, reveal contacts (daily quota), export CSV/Excel/JSON, and save leads to your dashboard."
            : "Search business leads by keyword, category, and location. Sign in to reveal contacts, export, and save."
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
        initialCategories={locations.categories}
        initialCountries={locations.countries}
        filters={filters}
        result={result}
        searched={searched}
        error={error}
        authRequiredForPage={authRequiredForPage}
        rateLimitRemaining={limited.remaining}
      />
    </>
  );
}
