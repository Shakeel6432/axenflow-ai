import type { BusinessCard, PaginatedSearchResult, SearchParams, SearchSort } from "@/types/leads";

/** Fixed page sizes — URL manipulation cannot raise these. */
export const LEADS_GUEST_PAGE_SIZE = 3;
export const LEADS_AUTH_PAGE_SIZE = 20;
export const LEADS_MAX_PAGE_SIZE = 20;

/** Daily reveal quota (credit gate) per authenticated user. */
export const LEADS_DAILY_REVEAL_LIMIT = 100;
export const LEADS_REVEAL_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Teaser-only fields allowed in SSR HTML / list payloads. */
export type LeadTeaser = Pick<
  BusinessCard,
  "id" | "slug" | "businessName" | "category" | "city" | "state" | "country" | "rating" | "reviewsCount"
> & {
  owner: null;
  address: null;
  phone: null;
  email: null;
  website: null;
  googleMapsUrl: null;
};

export function toTeaserCard(card: BusinessCard): LeadTeaser {
  return {
    id: card.id,
    slug: card.slug,
    businessName: card.businessName,
    category: card.category,
    city: card.city,
    state: card.state,
    country: card.country,
    rating: card.rating,
    reviewsCount: card.reviewsCount,
    owner: null,
    address: null,
    phone: null,
    email: null,
    website: null,
    googleMapsUrl: null,
  };
}

export function toTeaserList(list: BusinessCard[]): LeadTeaser[] {
  return list.map(toTeaserCard);
}

export function teaserResult(data: PaginatedSearchResult): PaginatedSearchResult {
  return {
    ...data,
    results: toTeaserList(data.results),
  };
}

export type LeadSearchFilters = {
  keyword: string;
  mainCategory: string;
  category: string;
  country: string;
  state: string;
  city: string;
  hasPhone: boolean;
  hasEmail: boolean;
  sort: SearchSort;
  page: number;
};

export function emptyLeadFilters(): LeadSearchFilters {
  return {
    keyword: "",
    mainCategory: "",
    category: "",
    country: "",
    state: "",
    city: "",
    hasPhone: false,
    hasEmail: false,
    sort: "newest",
    page: 1,
  };
}

function truthyParam(value: string | string[] | undefined): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return false;
  const n = raw.trim().toLowerCase();
  return n === "true" || n === "1" || n === "yes" || n === "on";
}

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return (value[0] || "").trim();
  return (value || "").trim();
}

const SORTS = new Set<SearchSort>(["newest", "oldest", "alphabetical", "alphabetical_desc"]);

/** Parse /leads URL search params into filters. */
export function parseLeadSearchParams(
  sp: Record<string, string | string[] | undefined>
): { filters: LeadSearchFilters; searched: boolean } {
  const sortRaw = first(sp.sort) as SearchSort;
  const pageRaw = Number(first(sp.page) || "1");
  const filters: LeadSearchFilters = {
    keyword: first(sp.keyword),
    mainCategory: first(sp.mainCategory),
    category: first(sp.category),
    country: first(sp.country),
    state: first(sp.state),
    city: first(sp.city),
    hasPhone: truthyParam(sp.hasPhone),
    hasEmail: truthyParam(sp.hasEmail),
    sort: SORTS.has(sortRaw) ? sortRaw : "newest",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
  };

  const searched =
    truthyParam(sp.search) ||
    Boolean(
      filters.keyword ||
        filters.mainCategory ||
        filters.category ||
        filters.country ||
        filters.state ||
        filters.city ||
        filters.hasPhone ||
        filters.hasEmail ||
        first(sp.page)
    );

  return { filters, searched };
}

export function filtersToSearchParams(
  filters: LeadSearchFilters,
  opts?: { isAuthed: boolean }
): SearchParams {
  const isAuthed = opts?.isAuthed ?? false;
  const page = isAuthed ? filters.page : 1;
  const pageSize = isAuthed ? LEADS_AUTH_PAGE_SIZE : LEADS_GUEST_PAGE_SIZE;

  return {
    keyword: filters.keyword || undefined,
    mainCategory: filters.mainCategory || undefined,
    category: filters.category || undefined,
    country: filters.country || undefined,
    state: filters.state || undefined,
    city: filters.city || undefined,
    hasPhone: filters.hasPhone || undefined,
    hasEmail: filters.hasEmail || undefined,
    sort: filters.sort,
    page,
    pageSize,
  };
}

/** Build a shareable /leads query string (always includes search=1 when searching). */
export function buildLeadsQuery(filters: Partial<LeadSearchFilters> & { page?: number }): string {
  const params = new URLSearchParams();
  params.set("search", "1");
  if (filters.keyword?.trim()) params.set("keyword", filters.keyword.trim());
  if (filters.mainCategory) params.set("mainCategory", filters.mainCategory);
  if (filters.category) params.set("category", filters.category);
  if (filters.country) params.set("country", filters.country);
  if (filters.state) params.set("state", filters.state);
  if (filters.city) params.set("city", filters.city);
  if (filters.hasPhone) params.set("hasPhone", "true");
  if (filters.hasEmail) params.set("hasEmail", "true");
  if (filters.sort) params.set("sort", filters.sort);
  params.set("page", String(Math.max(1, filters.page || 1)));
  return params.toString();
}
