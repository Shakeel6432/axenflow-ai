"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { BusinessResultCard } from "@/components/leads/LeadFinderSection";
import type { BusinessCard } from "@/types/leads";

type SavedRow = {
  id: string;
  notes: string | null;
  savedAt: string;
  business: BusinessCard;
};

type ListResponse = {
  results: SavedRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  error?: string;
};

export function SavedLeadsClient() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (nextPage: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/saved-leads?page=${nextPage}&pageSize=20`);
      const json = (await res.json()) as ListResponse;
      if (!res.ok) {
        setError(json.error || "Could not load saved leads.");
        setData(null);
        return;
      }
      setData(json);
      setPage(nextPage);
    } catch {
      setError("Network error.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  const remove = async (id: string) => {
    const res = await fetch(`/api/saved-leads/${id}`, { method: "DELETE" });
    if (res.ok) {
      void load(page);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
        <Loader2 size={16} className="animate-spin" /> Loading saved leads…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (!data?.results.length) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--c-heading)" }}>
          No saved leads yet
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
          Search leads in the Lead Finder and click Save Lead or Save List.
        </p>
        <Link href="/tools" className="btn-main mt-5 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold">
          Open Lead Finder
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm" style={{ color: "var(--c-text-muted)" }}>
        {data.total} saved lead{data.total === 1 ? "" : "s"}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {data.results.map((row) => (
          <BusinessResultCard
            key={row.id}
            business={row.business}
            savedId={row.id}
            onUnsave={() => remove(row.id)}
          />
        ))}
      </div>
      {data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm"
            style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
            disabled={page <= 1 || loading}
            onClick={() => load(page - 1)}
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
            disabled={page >= data.totalPages || loading}
            onClick={() => load(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
