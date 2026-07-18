"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type ExportRow = {
  id: string;
  format: string;
  rowCount: number;
  source: string;
  createdAt: string;
};

type ListResponse = {
  results: ExportRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  error?: string;
};

export function ExportHistoryClient() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (nextPage: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/exports?page=${nextPage}&pageSize=20`);
      const json = (await res.json()) as ListResponse;
      if (!res.ok) {
        setError(json.error || "Could not load export history.");
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

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
        <Loader2 size={16} className="animate-spin" /> Loading export history…
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
          No exports yet
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
          Select leads in the Lead Finder and export as CSV, Excel, or JSON.
        </p>
        <Link href="/tools" className="btn-main mt-5 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold">
          Open Lead Finder
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--c-border)" }}>
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead style={{ background: "var(--c-hover-bg)", color: "var(--c-text-dim)" }}>
          <tr>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Format</th>
            <th className="px-4 py-3 font-semibold">Rows</th>
            <th className="px-4 py-3 font-semibold">Source</th>
          </tr>
        </thead>
        <tbody>
          {data.results.map((row) => (
            <tr key={row.id} style={{ borderTop: "1px solid var(--c-border)", color: "var(--c-heading)" }}>
              <td className="px-4 py-3">{new Date(row.createdAt).toLocaleString()}</td>
              <td className="px-4 py-3">{row.format}</td>
              <td className="px-4 py-3">{row.rowCount}</td>
              <td className="px-4 py-3 capitalize">{row.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 border-t px-4 py-3" style={{ borderColor: "var(--c-border)" }}>
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
