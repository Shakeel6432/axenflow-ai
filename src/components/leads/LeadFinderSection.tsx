"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  BookmarkPlus,
  Copy,
  ExternalLink,
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
import type { BusinessCard, PaginatedSearchResult, SearchSort } from "@/types/leads";

type Option = { id: string; name: string; slug?: string; code?: string; countryId?: string; stateId?: string };

type LeadFinderProps = {
  initialCategories?: Option[];
  initialCountries?: Option[];
  /** preview = public teaser (limited results); full = authenticated tools */
  mode?: "preview" | "full";
  /** Hide inner section title when page already has PageHero */
  hideHeading?: boolean;
  className?: string;
};

const emptyResult: PaginatedSearchResult = {
  results: [],
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
};

function asOptions(value: unknown): Option[] {
  return Array.isArray(value) ? (value as Option[]) : [];
}

export function LeadFinderSection({
  initialCategories = [],
  initialCountries = [],
  mode = "preview",
  hideHeading = false,
  className,
}: LeadFinderProps) {
  const isPreview = mode === "preview";
  const [keyword, setKeyword] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [hasPhone, setHasPhone] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [sort, setSort] = useState<SearchSort>("newest");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState(() => asOptions(initialCategories));
  const [countries, setCountries] = useState(() => asOptions(initialCountries));
  const [states, setStates] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [data, setData] = useState<PaginatedSearchResult>(emptyResult);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [pending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionMsg, setActionMsg] = useState("");

  const visibleResults = isPreview ? data.results.slice(0, 3) : data.results;
  const selectedLeads = useMemo(
    () => data.results.filter((r) => selectedIds.has(r.id)),
    [data.results, selectedIds]
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

  useEffect(() => {
    if (!categories.length) {
      fetch("/api/categories")
        .then((r) => r.json())
        .then((json) => setCategories(asOptions(json)))
        .catch(() => undefined);
    }
    if (!countries.length) {
      fetch("/api/countries")
        .then((r) => r.json())
        .then((json) => setCountries(asOptions(json)))
        .catch(() => undefined);
    }
  }, [categories.length, countries.length]);

  useEffect(() => {
    if (!country) {
      setStates([]);
      setState("");
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
      setCity("");
      return;
    }
    const selected = states.find((s) => s.name === state || s.slug === state);
    const query = selected?.id ? `?stateId=${selected.id}` : "";
    fetch(`/api/cities${query}`)
      .then((r) => r.json())
      .then((rows) => setCities(asOptions(rows)))
      .catch(() => setCities([]));
  }, [state, states]);

  const buildParams = (nextPage: number) => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (mainCategory) params.set("mainCategory", mainCategory);
    if (category) params.set("category", category);
    if (country) params.set("country", country);
    if (state) params.set("state", state);
    if (city) params.set("city", city);
    if (hasPhone) params.set("hasPhone", "true");
    if (hasEmail) params.set("hasEmail", "true");
    if (sort) params.set("sort", sort);
    params.set("page", String(nextPage));
    params.set("pageSize", isPreview ? "3" : "20");
    return params;
  };

  const runSearch = (nextPage = 1) => {
    setPage(nextPage);
    setError("");
    setSearched(true);
    const params = buildParams(nextPage);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/search?${params.toString()}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Search failed");
          setData(emptyResult);
          setSelectedIds(new Set());
          return;
        }
        setData(json);
        setSelectedIds(new Set());
      } catch {
        setError("Network error while searching leads");
        setData(emptyResult);
        setSelectedIds(new Set());
      }
    });
  };

  useEffect(() => {
    if (!searched) return;
    const timer = window.setTimeout(() => runSearch(1), 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, mainCategory, category, country, state, city, hasPhone, hasEmail, sort]);

  return (
    <Section id="leads" tight={hideHeading} className={className}>
      {!hideHeading && (
        <SectionHeading
          title="Lead Finder"
          description={
            isPreview
              ? "Preview sample leads below. Create a free account for full search, filters, and download access."
              : "Search business leads, select results, export CSV/Excel/JSON, and save lists to your dashboard."
          }
        />
      )}

      <div className="glass-card mx-auto w-full max-w-5xl rounded-2xl p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Search Keyword">
            <input
              className="form-input"
              placeholder="Business name, owner, phone..."
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
                { value: "newest", label: "Newest" },
                { value: "rating", label: "Highest Rating" },
                { value: "reviews", label: "Most Reviews" },
                { value: "alphabetical", label: "Alphabetical" },
              ]}
            />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
            <input type="checkbox" checked={hasPhone} onChange={(e) => setHasPhone(e.target.checked)} className="accent-indigo-500" />
            Has Phone
          </label>
          <label className="flex items-center gap-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
            <input type="checkbox" checked={hasEmail} onChange={(e) => setHasEmail(e.target.checked)} className="accent-indigo-500" />
            Has Email
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={() => runSearch(1)} disabled={pending}>
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Search Leads
          </Button>
          {isPreview ? (
            <Button href="/signup" variant="outline">Unlock Full Access</Button>
          ) : (
            <Button href="/dashboard" variant="outline">Back to Dashboard</Button>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}

        {searched && !error && (
          <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
                {isPreview
                  ? `Previewing ${Math.min(data.results.length, 3)} of ${data.total} matches`
                  : `${data.total} results found`}
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
              />
            )}
            {actionMsg && (
              <p className="mb-3 text-xs text-teal-500">{actionMsg}</p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {visibleResults.map((item) => (
                <BusinessResultCard
                  key={item.id}
                  business={item}
                  preview={isPreview}
                  selectable={!isPreview}
                  selected={selectedIds.has(item.id)}
                  onToggleSelect={() => toggleSelect(item.id)}
                />
              ))}
            </div>
            {!data.results.length && (
              <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>
                No businesses matched your filters.
              </p>
            )}
            {isPreview && data.total > 0 && (
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
            {!isPreview && data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm"
                  style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                  disabled={page <= 1 || pending}
                  onClick={() => runSearch(page - 1)}
                >
                  Previous
                </button>
                <span className="text-sm" style={{ color: "var(--c-text-muted)" }}>
                  Page {data.page} of {data.totalPages}
                </span>
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm"
                  style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                  disabled={page >= data.totalPages || pending}
                  onClick={() => runSearch(page + 1)}
                >
                  Next
                </button>
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
      <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>{label}</label>
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
}: {
  business: BusinessCard;
  preview?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onUnsave?: () => void;
  savedId?: string;
}) {
  const [copied, setCopied] = useState<"phone" | "email" | "">("");
  const [saving, setSaving] = useState(false);

  const locationLine =
    formatDisplayAddress(business.address) ||
    [business.city, business.state, business.country].filter(Boolean).join(", ");
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
      await fetch("/api/saved-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessIds: [business.id] }),
      });
    } finally {
      setSaving(false);
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
              <h3 className="font-semibold" style={{ color: "var(--c-heading)" }}>{business.businessName}</h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-indigo-500">
                {mainName ? `${mainName} · ${business.category}` : business.category}
              </p>
            </div>
          </div>
          {business.owner && (
            <p className="mt-2 flex items-center gap-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
              <User size={14} className="shrink-0" />
              {business.owner}
            </p>
          )}
        </div>
        {business.rating != null && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
            <Star size={12} /> {business.rating.toFixed(1)} ({business.reviewsCount})
          </span>
        )}
      </div>
      {locationLine && (
        <p className="mt-3 flex items-start gap-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
          <MapPin size={14} className="mt-0.5 shrink-0" />
          {preview ? [business.city, business.state].filter(Boolean).join(", ") || locationLine : locationLine}
        </p>
      )}
      {!preview && (
        <div className="mt-3 flex flex-col gap-2 text-sm">
          {business.phone && (
            <div className="flex flex-wrap items-center gap-2">
              <a href={`tel:${business.phone}`} className="inline-flex items-center gap-2 text-indigo-500 hover:text-teal-500">
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
              <a href={`mailto:${business.email}`} className="inline-flex items-center gap-2 break-all text-indigo-500 hover:text-teal-500">
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
          Phone & email unlock after you sign in.
        </p>
      )}
    </article>
  );
}
