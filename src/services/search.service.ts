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
    case "rating":
      // Put rated leads first; null ratings sink to the bottom.
      return [{ rating: { sort: "desc", nulls: "last" } }, { reviewsCount: "desc" }];
    case "reviews":
      return [{ reviewsCount: "desc" }, { rating: { sort: "desc", nulls: "last" } }];
    case "alphabetical":
      return [{ businessName: "asc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

export function buildBusinessWhere(params: SearchParams): Prisma.BusinessWhereInput {
  const and: Prisma.BusinessWhereInput[] = [{ status: "APPROVED" }];

  if (params.keyword?.trim()) {
    const q = params.keyword.trim();
    and.push({
      OR: [
        { businessName: { contains: q, mode: "insensitive" } },
        { owner: { contains: q, mode: "insensitive" } },
        { categoryName: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { state: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { website: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const categoryNames = resolveCategoryFilter({
    mainCategory: params.mainCategory,
    category: params.category,
  });
  if (categoryNames?.length === 1) {
    const name = categoryNames[0];
    and.push({
      OR: [
        { categoryName: { equals: name, mode: "insensitive" } },
        { category: { slug: { equals: name.toLowerCase().replace(/\s+/g, "-") } } },
      ],
    });
  } else if (categoryNames && categoryNames.length > 1) {
    and.push({
      OR: categoryNames.flatMap((name) => [
        { categoryName: { equals: name, mode: "insensitive" as const } },
        { category: { slug: { equals: name.toLowerCase().replace(/\s+/g, "-") } } },
      ]),
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

    const [total, rows] = await Promise.all([
      prisma.business.count({ where }),
      prisma.business.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
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
        },
      }),
    ]);

    void prisma.searchHistory
      .create({
        data: {
          userId: params.userId ?? null,
          keyword: params.keyword ?? null,
          city: params.city ?? params.state ?? null,
          category: params.category ?? params.mainCategory ?? null,
          totalResults: total,
        },
      })
      .catch(() => undefined);

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

export async function getLocationOptions() {
  if (!isDatabaseConfigured()) {
    return { categories: [], countries: [], states: [], cities: [] };
  }

  try {
    // Only fetch dropdown roots — states/cities load lazily by country/state filters.
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
