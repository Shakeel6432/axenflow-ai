"use client";

import { useState } from "react";
import { Download, Loader2, Monitor } from "lucide-react";
import type { DesktopTool } from "@/lib/desktop-tools";

export function DownloadToolCard({ tool }: { tool: DesktopTool }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onDownload = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: tool.name, toolId: tool.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start download");
        setLoading(false);
        return;
      }
      window.location.href = tool.downloadUrl;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-400">
            <Monitor size={14} /> {tool.platform}
          </div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--c-heading)" }}>{tool.name}</h2>
          <p className="mt-2 max-w-xl text-sm" style={{ color: "var(--c-text-muted)" }}>{tool.description}</p>
          <p className="mt-3 text-xs font-semibold text-teal-500">
            Instruction: Always run this scraper with a VPN enabled.
          </p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
        <button
          type="button"
          onClick={onDownload}
          disabled={loading}
          className="btn-main inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Download {tool.platform} App
        </button>
      </div>
    </article>
  );
}
