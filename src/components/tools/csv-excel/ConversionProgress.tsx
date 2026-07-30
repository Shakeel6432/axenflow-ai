"use client";

import { Loader2 } from "lucide-react";

type ConversionProgressProps = {
  stage: string;
  progress: number;
  visible: boolean;
};

export function ConversionProgress({ stage, progress, visible }: ConversionProgressProps) {
  if (!visible) return null;

  return (
    <div
      className="rounded-2xl px-5 py-6"
      style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--c-heading)" }}>
        <Loader2 size={16} className="animate-spin text-indigo-400" />
        {stage || "Working…"}
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--c-border)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(5, progress))}%`,
            background: "linear-gradient(90deg,#6366f1,#14b8a6)",
          }}
        />
      </div>
      <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
        Reading → Detecting structure → Formatting → Generating file
      </p>
    </div>
  );
}
