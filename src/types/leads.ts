export type SearchSort = "newest" | "oldest" | "alphabetical" | "alphabetical_desc";

export type SearchParams = {
  keyword?: string;
  /** Main category group, e.g. Dental / Medical */
  mainCategory?: string;
  /** Subcategory / specialty name stored on Business.category */
  category?: string;
  country?: string;
  state?: string;
  city?: string;
  minRating?: number;
  hasWebsite?: boolean;
  hasPhone?: boolean;
  hasEmail?: boolean;
  sort?: SearchSort;
  page?: number;
  pageSize?: number;
  /** Skip COUNT(*) on pagination — reuse knownTotal from the first search. */
  skipTotal?: boolean;
  knownTotal?: number;
  /** When set, search is attributed to this user in search_history */
  userId?: string;
};

export type BusinessCard = {
  id: string;
  slug: string;
  businessName: string;
  owner: string | null;
  category: string;
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
};

export type PaginatedSearchResult = {
  results: BusinessCard[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
