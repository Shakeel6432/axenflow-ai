"use client";

import { useEffect, useState } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Stats = {
  businesses: number;
  categories: number;
  users: number;
  searches: number;
  pending: number;
};

type ImportReport = {
  total: number;
  imported: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  errors: string[];
};

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized or failed");
        return res.json();
      })
      .then(setStats)
      .catch(() => setError("Admin access required. Sign in with an ADMIN account."));
  }, []);

  const onImport = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/import", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Import failed");
        return;
      }
      setReport(json);
      const refreshed = await fetch("/api/admin/stats").then((r) => r.json());
      setStats(refreshed);
    } catch {
      setError("Network error during CSV import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-red-500" style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)" }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Businesses", stats.businesses],
            ["Categories", stats.categories],
            ["Users", stats.users],
            ["Searches", stats.searches],
            ["Pending", stats.pending],
          ].map(([label, value]) => (
            <div key={label as string} className="glass-card rounded-xl p-5">
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--c-text-muted)" }}>{label}</p>
              <p className="mt-2 text-2xl font-bold" style={{ color: "var(--c-heading)" }}>{value as number}</p>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-bold" style={{ color: "var(--c-heading)" }}>CSV Importer</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
          Upload a CSV with columns like business_name, category, website, phone, email, address, city, state, country, rating, reviews_count, google_maps_url.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
            style={{ color: "var(--c-text-dim)" }}
          />
          <button
            type="button"
            onClick={onImport}
            disabled={!file || loading}
            className="btn-main inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Import CSV
          </button>
        </div>

        {report && (
          <div className="mt-5 rounded-xl p-4" style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}>
            <p className="flex items-center gap-2 text-sm font-semibold text-teal-500">
              <CheckCircle2 size={16} /> Import complete
            </p>
            <ul className="mt-3 space-y-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
              <li>Total rows: {report.total}</li>
              <li>Imported: {report.imported}</li>
              <li>Skipped duplicates: {report.skippedDuplicates}</li>
              <li>Skipped invalid: {report.skippedInvalid}</li>
            </ul>
            {!!report.errors.length && (
              <div className="mt-3 max-h-40 overflow-y-auto text-xs text-red-400">
                {report.errors.slice(0, 20).map((err) => <p key={err}>{err}</p>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
