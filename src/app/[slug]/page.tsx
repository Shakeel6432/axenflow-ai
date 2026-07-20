import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { BusinessResultCard } from "@/components/leads/LeadFinderSection";
import { searchBusinesses } from "@/services/search.service";
import { siteConfig } from "@/lib/constants";
import { redactBusinessList } from "@/lib/redact-business";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

const RESERVED = new Set([
  "services", "about", "contact", "portfolio", "privacy", "terms", "leads", "admin", "api", "login", "auth",
  "signin", "signup", "dashboard", "tools", "download",
]);

function parseSeoSlug(slug: string) {
  // Patterns:
  // dentists
  // dentists-in-miami
  // dentists-in-california
  if (!slug.includes("-in-")) {
    return { categorySlug: slug, locationSlug: null as string | null };
  }
  const [categorySlug, locationSlug] = slug.split("-in-");
  return { categorySlug, locationSlug };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};
  const { categorySlug, locationSlug } = parseSeoSlug(slug);
  const title = locationSlug
    ? `${titleCase(categorySlug)} in ${titleCase(locationSlug)}`
    : titleCase(categorySlug);

  return {
    title: `${title} Leads`,
    description: `Browse ${title.toLowerCase()} business leads. Sign in to unlock phone, email, and website details.`,
    alternates: { canonical: `${siteConfig.url}/${slug}` },
  };
}

export default async function SeoLeadPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();
  if (!isDatabaseConfigured()) notFound();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam || 1));
  const { categorySlug, locationSlug } = parseSeoSlug(slug);

  let category: { id: string; name: string; slug: string } | null = null;
  try {
    category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  } catch {
    notFound();
  }
  if (!category) notFound();

  let cityName: string | undefined;
  let stateName: string | undefined;

  if (locationSlug) {
    try {
      const city = await prisma.city.findFirst({ where: { slug: locationSlug } });
      const state = !city ? await prisma.state.findFirst({ where: { slug: locationSlug } }) : null;
      if (!city && !state) notFound();
      cityName = city?.name;
      stateName = state?.name;
    } catch {
      notFound();
    }
  }

  const session = await auth();
  const isAuthed = Boolean((session?.user as { id?: string } | undefined)?.id);

  const data = await searchBusinesses({
    category: category.name,
    city: cityName,
    state: stateName,
    page,
    pageSize: 20,
    sort: "rating",
  });

  const results = isAuthed ? data.results : redactBusinessList(data.results);

  const heading = locationSlug
    ? `${category.name} in ${titleCase(locationSlug)}`
    : category.name;

  // Public JSON-LD: name + place + rating only (no phone/email/street for guests)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: heading,
    itemListElement: results.slice(0, 10).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "LocalBusiness",
        name: item.businessName,
        ...(isAuthed && item.phone ? { telephone: item.phone } : {}),
        ...(isAuthed && item.website ? { url: item.website } : {}),
        address: {
          "@type": "PostalAddress",
          ...(isAuthed && item.address ? { streetAddress: item.address } : {}),
          addressLocality: item.city || undefined,
          addressRegion: item.state || undefined,
          addressCountry: item.country || undefined,
        },
        aggregateRating: item.rating
          ? {
              "@type": "AggregateRating",
              ratingValue: item.rating,
              reviewCount: item.reviewsCount || 1,
            }
          : undefined,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        title={heading}
        description={`Explore ${data.total} verified ${category.name.toLowerCase()} leads${cityName || stateName ? ` in ${cityName || stateName}` : ""}${isAuthed ? "." : ". Sign in to unlock contact details."}`}
      />
      <Section tight>
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((business) => (
            <BusinessResultCard key={business.id} business={business} preview={!isAuthed} />
          ))}
        </div>
        {!results.length && (
          <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>No approved businesses found for this page yet.</p>
        )}
      </Section>
    </>
  );
}

function titleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
