"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "@/components/ui/AppLink";
import {
  BookmarkPlus,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  MapPin,
  Phone,
  Search,
  Star,
  Loader2,
  Mail,
  User,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { LeadBulkToolbar } from "@/components/leads/LeadBulkToolbar";
import { formatDisplayAddress } from "@/lib/address";
import { MAIN_CATEGORIES, getMainCategoryName, getSubcategoriesForMain } from "@/lib/category-taxonomy";
import { buildLeadsQuery, type LeadSearchFilters } from "@/lib/leads-access";
import {
  revealLeadContact,
  revealLeadContacts,
  saveLeadAction,
} from "@/app/leads/actions";
import type { BusinessCard, PaginatedSearchResult, SearchSort } from "@/types/leads";

type Option = { id: string; name: string; slug?: string; code?: string; countryId?: string; stateId?: string };

type LeadFinderProps = {
  initialCategories?: Option[];
  initialCountries?: Option[];
  mode?: "preview" | "full";
  hideHeading?: boolean;
  className?: string;
  filters?: LeadSearchFilters;
  result?: PaginatedSearchResult | null;
  searched?: boolean;
  error?: string;
  authRequiredForPage?: boolean;
  rateLimitRemaining?: number;
};

const pagerBtnClass =
  "cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 hover:border-indigo-500/60 hover:bg-[var(--c-hover-bg)] hover:text-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--c-border)] disabled:hover:bg-transparent disabled:hover:text-[var(--c-heading)]";

function asOptions(value: unknown): Option[] {
  return Array.isArray(value) ? (value as Option[]) : [];
}

function hasContact(b: BusinessCard) {
  return Boolean(b.phone || b.email || b.website || b.address || b.owner);
}

export function LeadFinderSection({
  initialCategories = [],
  initialCountries = [],
  mode = "preview",
  hideHeading = false,
  className,
  filters: filtersProp,
  result = null,
  searched = false,
  error = "",
  authRequiredForPage = false,
}: LeadFinderProps) {
  const isPreview = mode === "preview";
  const [pending, startTransition] = useTransition();

  const [keyword, setKeyword] = useState(filtersProp?.keyword ?? "");
  const [mainCategory, setMainCategory] = useState(filtersProp?.mainCategory ?? "");
  const [category, setCategory] = useState(filtersProp?.category ?? "");
  const [country, setCountry] = useState(filtersProp?.country ?? "");
  const [state, setState] = useState(filtersProp?.state ?? "");
  const [city, setCity] = useState(filtersProp?.city ?? "");
  const [hasPhone, setHasPhone] = useState(filtersProp?.hasPhone ?? false);
  const [hasEmail, setHasEmail] = useState(filtersProp?.hasEmail ?? false);
  const [sort, setSort] = useState<SearchSort>(filtersProp?.sort ?? "newest");

  const [categories] = useState(() => asOptions(initialCategories));
  const [countries] = useState(() => asOptions(initialCountries));
  const [states, setStates] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);

  /** Merge revealed contacts into teaser rows (client memory only). */
  const [revealedById, setRevealedById] = useState<Record<string, BusinessCard>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionMsg, setActionMsg] = useState("");
  const [revealError, setRevealError] = useState("");

  const pageResults = useMemo(() => {
    const rows = result?.results ?? [];
    return rows.map((row) => revealedById[row.id] ?? row);
  }, [result, revealedById]);

  const visibleResults = isPreview ? pageResults.slice(0, 3) : pageResults;
  const selectedLeads = useMemo(
    () => pageResults.filter((r) => selectedIds.has(r.id)),
    [pageResults, selectedIds]
  );
  const allPageSelected =
    !isPreview && visibleResults.length > 0 && visibleResults.every((r) => selectedIds.has(r.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const r of visibleResults) next.delete(r.id);
      } else {
        for (const r of visibleResults) next.add(r.id);
      }
      return next;
    });
  };

  const subcategoryOptions = useMemo(() => {
    const dbNames = new Set(categories.map((c) => c.name));
    const fromTaxonomy = mainCategory
      ? getSubcategoriesForMain(mainCategory)
      : MAIN_CATEGORIES.flatMap((m) => m.subcategories);

    const filtered = fromTaxonomy.filter((name) => !dbNames.size || dbNames.has(name));
    if (filtered.length) return filtered;

    if (mainCategory) {
      return categories
        .filter((c) => getMainCategoryName(c.name) === mainCategory)
        .map((c) => c.name);
    }
    return categories.map((c) => c.name);
  }, [mainCategory, categories]);

  // Location cascade — metadata only (no lead contacts)
  useEffect(() => {
    if (!country) {
      setStates([]);
      return;
    }
    const selected = countries.find((c) => c.name === country || c.code === country);
    const query = selected?.id ? `?countryId=${selected.id}` : "";
    fetch(`/api/states${query}`)
      .then((r) => r.json())
      .then((rows) => setStates(asOptions(rows)))
      .catch(() => setStates([]));
  }, [country, countries]);

  useEffect(() => {
    if (!state) {
      setCities([]);
      return;
    }
    const selected = states.find((s) => s.name === state || s.slug === state);
    const query = selected?.id ? `?stateId=${selected.id}` : "";
    fetch(`/api/cities${query}`)
      .then((r) => r.json())
      .then((rows) => setCities(asOptions(rows)))
      .catch(() => setCities([]));
  }, [state, states]);

  // Reset selection when server result page changes
  useEffect(() => {
    setSelectedIds(new Set());
    setRevealError("");
  }, [result?.page, result?.total]);

  const currentFilters = (): LeadSearchFilters => ({
    keyword,
    mainCategory,
    category,
    country,
    state,
    city,
    hasPhone,
    hasEmail,
    sort,
    page: 1,
  });

  const navigateSearch = (next: LeadSearchFilters) => {
    // Full document navigation — appears as Document in DevTools, not /api/search XHR
    const href = `/leads?${buildLeadsQuery(next)}`;
    startTransition(() => {
      window.location.assign(href);
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateSearch(currentFilters());
  };

  const pageHref = (page: number) =>
    `/leads?${buildLeadsQuery({ ...currentFilters(), page, ...filtersProp, keyword, mainCategory, category, country, state, city, hasPhone, hasEmail, sort })}`;

  const handleReveal = async (id: string) => {
    setRevealError("");
    const res = await revealLeadContact(id);
    if (!res.ok) {
      setRevealError(res.error);
      return;
    }
    setRevealedById((prev) => ({ ...prev, [id]: res.lead }));
    setActionMsg(`Contact revealed · ${res.remaining} reveals left today`);
  };

  const ensureRevealedForExport = async (leads: BusinessCard[]) => {
    const need = leads.filter((l) => !hasContact(l)).map((l) => l.id);
    if (!need.length) return leads;
    const res = await revealLeadContacts(need);
    if (!res.ok) {
      setRevealError(res.error);
      return leads;
    }
    const map = Object.fromEntries(res.leads.map((l) => [l.id, l]));
    setRevealedById((prev) => ({ ...prev, ...map }));
    return leads.map((l) => map[l.id] ?? revealedById[l.id] ?? l);
  };

  return (
    <Section id="leads" tight={hideHeading} className={className}>
      {!hideHeading && (
        <SectionHeading
          title="Lead Finder"
          description={
            isPreview
              ? "Preview sample leads below. Create a free account for full search, filters, and download access."
              : "Search business leads, reveal contacts with your daily quota, export CSV/Excel/JSON, and save lists."
          }
        />
      )}

      <div className="glass-card mx-auto w-full max-w-5xl rounded-2xl p-4 sm:p-6 lg:p-8">
        <form method="GET" action="/leads" onSubmit={onSubmit} className="contents">
          <input type="hidden" name="search" value="1" />
          <input type="hidden" name="mainCategory" value={mainCategory} />
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="country" value={country} />
          <input type="hidden" name="state" value={state} />
          <input type="hidden" name="city" value={city} />
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="page" value="1" />
          {hasPhone ? <input type="hidden" name="hasPhone" value="true" /> : null}
          {hasEmail ? <input type="hidden" name="hasEmail" value="true" /> : null}

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            <Field label="Search Keyword">
              <input
                className="form-input"
                name="keyword"
                placeholder="Business name, category, city..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Field>
            <Field label="Main Category">
              <GlassSelect
                aria-label="Main Category"
                value={mainCategory}
                onChange={(v) => {
                  setMainCategory(v);
                  setCategory("");
                }}
                options={[
                  { value: "", label: "All main categories" },
                  ...MAIN_CATEGORIES.map((m) => ({ value: m.name, label: m.name })),
                ]}
              />
            </Field>
            <Field label="Sub Category">
              <GlassSelect
                aria-label="Sub Category"
                value={category}
                onChange={setCategory}
                disabled={!subcategoryOptions.length}
                options={[
                  { value: "", label: "All sub categories" },
                  ...subcategoryOptions.map((name) => ({ value: name, label: name })),
                ]}
              />
            </Field>
            <Field label="Country">
              <GlassSelect
                aria-label="Country"
                value={country}
                onChange={(v) => {
                  setCountry(v);
                  setState("");
                  setCity("");
                }}
                options={[
                  { value: "", label: "All countries" },
                  ...countries.map((c) => ({ value: c.name, label: c.name })),
                ]}
              />
            </Field>
            <Field label="State">
              <GlassSelect
                aria-label="State"
                value={state}
                onChange={(v) => {
                  setState(v);
                  setCity("");
                }}
                disabled={!country && !states.length}
                options={[
                  { value: "", label: "All states" },
                  ...states.map((s) => ({ value: s.name, label: s.name })),
                ]}
              />
            </Field>
            <Field label="City">
              <GlassSelect
                aria-label="City"
                value={city}
                onChange={setCity}
                disabled={!state && !cities.length}
                options={[
                  { value: "", label: "All cities" },
                  ...cities.map((c) => ({ value: c.name, label: c.name })),
                ]}
              />
            </Field>
            <Field label="Sort By">
              <GlassSelect
                aria-label="Sort By"
                value={sort}
                onChange={(v) => setSort(v as SearchSort)}
                options={[
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "alphabetical", label: "A–Z" },
                  { value: "alphabetical_desc", label: "Z–A" },
                ]}
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
              <input
                type="checkbox"
                checked={hasPhone}
                onChange={(e) => setHasPhone(e.target.checked)}
                className="accent-indigo-500"
              />
              Has Phone
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
              <input
                type="checkbox"
                checked={hasEmail}
                onChange={(e) => setHasEmail(e.target.checked)}
                className="accent-indigo-500"
              />
              Has Email
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Search Leads
            </Button>
            {isPreview ? (
              <Button href="/signup" variant="outline">
                Unlock Full Access
              </Button>
            ) : (
              <Button href="/dashboard" variant="outline">
                Back to Dashboard
              </Button>
            )}
          </div>
        </form>

        {(error || revealError) && (
          <p className="mt-4 text-sm text-red-500">{revealError || error}</p>
        )}
        {authRequiredForPage && (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-main rounded-xl px-5 py-2.5 text-sm font-semibold">
              Create Account
            </Link>
            <Link
              href={`/signin?callbackUrl=${encodeURIComponent("/leads")}`}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold"
              style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
            >
              Login
            </Link>
          </div>
        )}

        {searched && !error && result && (
          <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
                {isPreview
                  ? `Previewing ${Math.min(result.results.length, 3)} of ${result.total} matches`
                  : `${result.total} results found · contacts hidden until revealed`}
              </p>
              {!isPreview && visibleResults.length > 0 && (
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAllPage}
                    className="accent-indigo-500"
                  />
                  Select all on page
                </label>
              )}
            </div>

            {!isPreview && (
              <LeadBulkToolbar
                selected={selectedLeads}
                onClear={() => setSelectedIds(new Set())}
                onSaved={() => setActionMsg("Leads saved. View them under Dashboard → Saved Leads.")}
                ensureRevealed={ensureRevealedForExport}
              />
            )}
            {actionMsg && <p className="mb-3 text-xs text-teal-500">{actionMsg}</p>}

            <div className={`grid gap-4 md:grid-cols-2 ${pending ? "opacity-60 pointer-events-none" : ""}`}>
              {visibleResults.map((item) => (
                <BusinessResultCard
                  key={item.id}
                  business={item}
                  preview={isPreview}
                  selectable={!isPreview}
                  selected={selectedIds.has(item.id)}
                  onToggleSelect={() => toggleSelect(item.id)}
                  revealed={hasContact(item)}
                  onReveal={!isPreview ? () => handleReveal(item.id) : undefined}
                />
              ))}
            </div>
            {!result.results.length && (
              <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>
                No businesses matched your filters.
              </p>
            )}
            {isPreview && result.total > 0 && (
              <div
                className="mt-6 rounded-xl p-5 text-center"
                style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--c-heading)" }}>
                  You need an account to use the full Lead Finder
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/signup" className="btn-main rounded-xl px-5 py-2.5 text-sm font-semibold">
                    Create Account
                  </Link>
                  <Link
                    href={`/signin?callbackUrl=${encodeURIComponent("/leads")}`}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold"
                    style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                  >
                    Login
                  </Link>
                </div>
              </div>
            )}
            {!isPreview && result.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                {/* Plain anchors → Document navigations (SSR), not /api/search XHR */}
                {result.page > 1 ? (
                  <a
                    href={pageHref(result.page - 1)}
                    className={pagerBtnClass}
                    style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                  >
                    Previous
                  </a>
                ) : (
                  <button
                    type="button"
                    className={pagerBtnClass}
                    style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                    disabled
                  >
                    Previous
                  </button>
                )}
                <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--c-text-muted)" }}>
                  {pending ? <Loader2 size={14} className="animate-spin text-indigo-500" /> : null}
                  Page {result.page} of {result.totalPages}
                </span>
                {result.page < result.totalPages ? (
                  <a
                    href={pageHref(result.page + 1)}
                    className={pagerBtnClass}
                    style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                  >
                    Next
                  </a>
                ) : (
                  <button
                    type="button"
                    className={pagerBtnClass}
                    style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                    disabled
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function BusinessResultCard({
  business,
  preview = false,
  selectable = false,
  selected = false,
  onToggleSelect,
  onUnsave,
  savedId,
  revealed = false,
  onReveal,
}: {
  business: BusinessCard;
  preview?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onUnsave?: () => void;
  savedId?: string;
  revealed?: boolean;
  onReveal?: () => void | Promise<void>;
}) {
  const [copied, setCopied] = useState<"phone" | "email" | "">("");
  const [saving, setSaving] = useState(false);
  const [revealing, setRevealing] = useState(false);

  const locationLine = revealed
    ? formatDisplayAddress(business.address) ||
      [business.city, business.state, business.country].filter(Boolean).join(", ")
    : [business.city, business.state].filter(Boolean).join(", ");
  const mainName = getMainCategoryName(business.category);

  const copyText = async (value: string, kind: "phone" | "email") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(""), 1500);
    } catch {
      /* ignore */
    }
  };

  const saveOne = async () => {
    setSaving(true);
    try {
      await saveLeadAction(business.id);
    } finally {
      setSaving(false);
    }
  };

  const reveal = async () => {
    if (!onReveal) return;
    setRevealing(true);
    try {
      await onReveal();
    } finally {
      setRevealing(false);
    }
  };

  return (
    <article
      className="rounded-xl p-5"
      style={{
        background: "var(--c-hover-bg)",
        border: selected ? "1px solid rgba(99,102,241,0.55)" : "1px solid var(--c-border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            {selectable && (
              <input
                type="checkbox"
                className="mt-1 accent-indigo-500"
                checked={selected}
                onChange={onToggleSelect}
                aria-label={`Select ${business.businessName}`}
              />
            )}
            <div className="min-w-0">
              <h3 className="font-semibold" style={{ color: "var(--c-heading)" }}>
                {business.businessName}
              </h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-indigo-500">
                {mainName ? `${mainName} · ${business.category}` : business.category}
              </p>
            </div>
          </div>
          {revealed && business.owner ? (
            <p className="mt-2 flex items-center gap-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
              <User size={14} className="shrink-0" />
              {business.owner}
            </p>
          ) : null}
        </div>
        {business.rating != null && (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs"
            style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
          >
            <Star size={12} /> {business.rating.toFixed(1)} ({business.reviewsCount})
          </span>
        )}
      </div>
      {locationLine && (
        <p className="mt-3 flex items-start gap-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
          <MapPin size={14} className="mt-0.5 shrink-0" />
          {locationLine}
        </p>
      )}
      {!preview && revealed && (
        <div className="mt-3 flex flex-col gap-2 text-sm">
          {business.phone && (
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`tel:${business.phone}`}
                className="inline-flex items-center gap-2 text-indigo-500 hover:text-teal-500"
              >
                <Phone size={14} className="shrink-0" /> {business.phone}
              </a>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs"
                style={{ color: "var(--c-text-dim)" }}
                onClick={() => copyText(business.phone!, "phone")}
              >
                <Copy size={12} /> {copied === "phone" ? "Copied" : "Copy"}
              </button>
            </div>
          )}
          {business.email && (
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`mailto:${business.email}`}
                className="inline-flex items-center gap-2 break-all text-indigo-500 hover:text-teal-500"
              >
                <Mail size={14} className="shrink-0" /> {business.email}
              </a>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs"
                style={{ color: "var(--c-text-dim)" }}
                onClick={() => copyText(business.email!, "email")}
              >
                <Copy size={12} /> {copied === "email" ? "Copied" : "Copy"}
              </button>
            </div>
          )}
          {business.website && (
            <a
              href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-500 hover:text-teal-500"
            >
              <Globe size={14} className="shrink-0" /> Visit website <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
      {!preview && (
        <div className="mt-4 flex flex-wrap gap-2">
          {!revealed && onReveal && (
            <button
              type="button"
              onClick={() => void reveal()}
              disabled={revealing}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              style={{ background: "rgba(20,184,166,0.15)", color: "#2dd4bf" }}
            >
              {revealing ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />}
              Reveal Contact
            </button>
          )}
          {savedId && onUnsave ? (
            <button
              type="button"
              onClick={onUnsave}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={saveOne}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <BookmarkPlus size={12} />}
              Save Lead
            </button>
          )}
        </div>
      )}
      {preview && (
        <p className="mt-3 text-xs" style={{ color: "var(--c-text-dim)" }}>
          Phone & email unlock after you sign in and reveal contacts.
        </p>
      )}
    </article>
  );
}
