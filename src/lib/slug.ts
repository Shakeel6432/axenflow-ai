/** Create URL-safe slugs for businesses, cities, and SEO routes. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildBusinessSlug(businessName: string, city?: string | null, idHint?: string) {
  const base = [businessName, city].filter(Boolean).map((v) => slugify(String(v))).join("-");
  if (!base) return `business-${idHint ?? Date.now()}`;
  return base.slice(0, 180);
}

/** Sort key for A–Z: strip leading punctuation, case-insensitive. */
export function businessNameSortKey(name: string): string {
  return name
    .trim()
    .replace(/^[^a-zA-Z0-9]+/, "")
    .toLowerCase();
}
