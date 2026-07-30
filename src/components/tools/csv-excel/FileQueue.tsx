"use client";

import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import type { QueueItem } from "@/lib/csv-excel/types";
import { formatBytes } from "@/lib/csv-excel/types";

type FileQueueProps = {
  items: QueueItem[];
  onRemove: (id: string) => void;
};

const stageLabel: Record<QueueItem["status"], string> = {
  queued: "Queued",
  reading: "Reading file",
  detecting: "Detecting structure",
  formatting: "Formatting",
  generating: "Generating file",
  done: "Done",
  error: "Error",
};

export function FileQueue({ items, onRemove }: FileQueueProps) {
  if (!items.length) return null;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-xl px-4 py-3"
          style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {item.status === "done" ? (
                <CheckCircle2 size={16} className="text-teal-400" />
              ) : item.status === "error" ? (
                <AlertCircle size={16} className="text-red-400" />
              ) : item.status === "queued" ? (
                <span className="block h-4 w-4 rounded-full border border-indigo-400/50" />
              ) : (
                <Loader2 size={16} className="animate-spin text-indigo-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold" style={{ color: "var(--c-heading)" }}>
                  {item.file.name}
                </p>
                <button
                  type="button"
                  className="cursor-pointer rounded p-1 text-red-400 hover:bg-red-500/10"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <X size={14} />
                </button>
              </div>
              <p className="mt-0.5 text-xs" style={{ color: "var(--c-text-muted)" }}>
                {formatBytes(item.file.size)} · {stageLabel[item.status]}
                {item.error ? ` — ${item.error}` : ""}
              </p>
              {item.status !== "done" && item.status !== "error" && item.status !== "queued" && (
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full"
                  style={{ background: "var(--c-border)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(8, item.progress)}%`,
                      background: "linear-gradient(90deg,#6366f1,#14b8a6)",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
