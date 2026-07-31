import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { formatDisplayAddress, US_STATE_NAMES } from "@/lib/address";
import { resolveCategoryFilter } from "@/lib/category-taxonomy";
import type { BusinessCard, PaginatedSearchResult, SearchParams, SearchSort } from "@/types/leads";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function stateMatchFilter(stateInput: string): Prisma.BusinessWhereInput {
  const value = stateInput.trim();
  const upper = value.toUpperCase();
  const fromCode = US_STATE_NAMES[upper];
  const fromName = Object.entries(US_STATE_NAMES).find(
    ([, name]) => name.toLowerCase() === value.toLowerCase()
  );

  const aliases = new Set<string>([value]);
  if (fromCode) {
    aliases.add(fromCode);
    aliases.add(upper);
  }
  if (fromName) {
    aliases.add(fromName[0]);
    aliases.add(fromName[1]);
  }

  return {
    OR: [...aliases].map((alias) => ({
      state: { equals: alias, mode: "insensitive" as const },
    })),
  };
}

function hasNonEmpty(field: "website" | "phone" | "email"): Prisma.BusinessWhereInput {
  return {
    AND: [{ [field]: { not: null } }, { NOT: { [field]: "" } }],
  };
}

/** At least one outreach channel — hide address-only rows from Lead Finder. */
function hasPhoneOrEmail(): Prisma.BusinessWhereInput {
  return { OR: [hasNonEmpty("phone"), hasNonEmpty("email")] };
}

function toCard(row: {
  id: string;
  slug: string;
  businessName: string;
  owner: string | null;
  categoryName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  rating: number | null;
  reviewsCount: number;
  googleMapsUrl: string | null;
}): BusinessCard {
  return {
    id: row.id,
    slug: row.slug,
    businessName: row.businessName,
    owner: row.owner,
    category: row.categoryName,
    address: formatDisplayAddress(row.address),
    city: row.city,
    state: row.state,
    country: row.country,
    phone: row.phone,
    website: row.website,
    email: row.email,
    rating: row.rating,
    reviewsCount: row.reviewsCount,
    googleMapsUrl: row.googleMapsUrl,
  };
}

function buildOrderBy(sort: SearchSort = "newest"): Prisma.BusinessOrderByWithRelationInput[] {
  switch (sort) {
    case "alphabetical":
      return [{ nameSort: { sort: "asc", nulls: "last" } }, { businessName: "asc" }];
    case "alphabetical_desc":
      return [{ nameSort: { sort: "desc", nulls: "last" } }, { businessName: "desc" }];
    case "oldest":
      return [{ createdAt: "asc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

export function buildBusinessWhere(params: SearchParams): Prisma.BusinessWhereInput {
  const and: Prisma.BusinessWhereInput[] = [{ status: "APPROVED" }, hasPhoneOrEmail()];

  if (params.keyword?.trim()) {
    const q = params.keyword.trim();
    // Prefer indexed fields first; avoid scanning address/website on every keyword hit.
    and.push({
      OR: [
        { businessName: { contains: q, mode: "insensitive" } },
        { categoryName: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { state: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const categoryNames = resolveCategoryFilter({
    mainCategory: params.mainCategory,
    category: params.category,
  });
  // Match on denormalized categoryName only (indexed) — avoid category-table joins.
  if (categoryNames?.length === 1) {
    and.push({ categoryName: { equals: categoryNames[0], mode: "insensitive" } });
  } else if (categoryNames && categoryNames.length > 1) {
    and.push({
      OR: categoryNames.map((name) => ({
        categoryName: { equals: name, mode: "insensitive" as const },
      })),
    });
  }

  if (params.country?.trim()) {
    const country = params.country.trim();
    and.push({
      OR: [
        { country: { equals: country, mode: "insensitive" } },
        ...(country.toLowerCase() === "united states" || country.toUpperCase() === "US"
          ? [
              { country: { equals: "United States", mode: "insensitive" as const } },
              { country: { equals: "US", mode: "insensitive" as const } },
              { country: { equals: "USA", mode: "insensitive" as const } },
            ]
          : []),
      ],
    });
  }
  if (params.state?.trim()) {
    and.push(stateMatchFilter(params.state));
  }
  if (params.city?.trim()) {
    and.push({ city: { equals: params.city.trim(), mode: "insensitive" } });
  }
  if (typeof params.minRating === "number" && !Number.isNaN(params.minRating)) {
    and.push({ rating: { gte: params.minRating } });
  }
  if (params.hasWebsite) and.push(hasNonEmpty("website"));
  if (params.hasPhone) and.push(hasNonEmpty("phone"));
  if (params.hasEmail) and.push(hasNonEmpty("email"));

  return { AND: and };
}

export async function searchBusinesses(params: SearchParams): Promise<PaginatedSearchResult> {
  if (!isDatabaseConfigured()) {
    return { results: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0, totalPages: 0 };
  }

  try {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));
    const where = buildBusinessWhere(params);
    const orderBy = buildOrderBy(params.sort ?? "newest");
    const reuseTotal =
      params.skipTotal === true &&
      typeof params.knownTotal === "number" &&
      params.knownTotal >= 0;

    const select = {
      id: true,
      slug: true,
      businessName: true,
      owner: true,
      categoryName: true,
      address: true,
      city: true,
      state: true,
      country: true,
      phone: true,
      website: true,
      email: true,
      rating: true,
      reviewsCount: true,
      googleMapsUrl: true,
    } as const;

    const rowsPromise = prisma.business.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select,
    });

    // Guest teaser pages (pageSize <= 3): skip expensive COUNT(*) on 250k+ rows.
    // Use take+1 to know if more results exist for the signup CTA.
    const fastPreview = pageSize <= 3 && !reuseTotal;
    let total: number;
    let rows: Awaited<typeof rowsPromise>;

    if (reuseTotal) {
      total = params.knownTotal as number;
      rows = await rowsPromise;
    } else if (fastPreview) {
      const previewRows = await prisma.business.findMany({
        where,
        orderBy,
        skip: 0,
        take: pageSize + 1,
        select,
      });
      const hasMore = previewRows.length > pageSize;
      rows = previewRows.slice(0, pageSize);
      // Synthetic total: enough to show "more available" without a full table count.
      total = hasMore ? Math.max(pageSize * 40, pageSize + 1) : rows.length;
    } else {
      [total, rows] = await Promise.all([prisma.business.count({ where }), rowsPromise]);
    }

    // Log first-page searches for signed-in users only (less write load from public traffic).
    if (page === 1 && !reuseTotal && !fastPreview && params.userId) {
      void prisma.searchHistory
        .create({
          data: {
            userId: params.userId,
            keyword: params.keyword ?? null,
            city: params.city ?? params.state ?? null,
            category: params.category ?? params.mainCategory ?? null,
            totalResults: total,
          },
        })
        .catch(() => undefined);
    }

    return {
      results: rows.map(toCard),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 0,
    };
  } catch (error) {
    console.error("searchBusinesses failed:", error);
    return { results: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0, totalPages: 0 };
  }
}

export async function getBusinessBySlug(slug: string) {
  if (!isDatabaseConfigured()) return null;
  return prisma.business.findFirst({
    where: { slug, status: "APPROVED" },
  });
}

const cardSelect = {
  id: true,
  slug: true,
  businessName: true,
  owner: true,
  categoryName: true,
  address: true,
  city: true,
  state: true,
  country: true,
  phone: true,
  website: true,
  email: true,
  rating: true,
  reviewsCount: true,
  googleMapsUrl: true,
} as const;

/** Full contact cards for authenticated reveal / save flows (server-only). */
export async function getBusinessCardsByIds(ids: string[]): Promise<BusinessCard[]> {
  if (!isDatabaseConfigured() || !ids.length) return [];
  const unique = [...new Set(ids)].slice(0, 20);
  try {
    const rows = await prisma.business.findMany({
      where: { id: { in: unique }, status: "APPROVED" },
      select: cardSelect,
    });
    const byId = new Map(rows.map((row) => [row.id, toCard(row)]));
    return unique.map((id) => byId.get(id)).filter(Boolean) as BusinessCard[];
  } catch (error) {
    console.error("getBusinessCardsByIds failed:", error);
    return [];
  }
}

async function loadLocationOptions() {
  if (!isDatabaseConfigured()) {
    return { categories: [], countries: [], states: [], cities: [] };
  }

  try {
    // Only fetch dropdown roots - states/cities load lazily by country/state filters.
    const [categories, countries] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
      prisma.country.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, code: true } }),
    ]);

    return { categories, countries, states: [], cities: [] };
  } catch (error) {
    console.error("Failed to load location options:", error);
    return { categories: [], countries: [], states: [], cities: [] };
  }
}

/** Cached for Lead Finder SSR - avoids 2 DB hits on every /leads page view. */
export const getLocationOptions = unstable_cache(loadLocationOptions, ["lead-location-options"], {
  revalidate: 300,
});
