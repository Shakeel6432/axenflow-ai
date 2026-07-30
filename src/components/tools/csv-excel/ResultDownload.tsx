"use client";

import { CheckCircle2, Download, RotateCcw } from "lucide-react";
import { formatBytes } from "@/lib/csv-excel/types";

type ResultDownloadProps = {
  fileName: string;
  bytes: number;
  inputBytes: number;
  onDownload: () => void;
  onReset: () => void;
};

export function ResultDownload({
  fileName,
  bytes,
  inputBytes,
  onDownload,
  onReset,
}: ResultDownloadProps) {
  return (
    <div
      className="rounded-2xl px-5 py-8 text-center"
      style={{
        background: "rgba(20,184,166,0.08)",
        border: "1px solid rgba(45,212,191,0.3)",
      }}
    >
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/20 text-teal-400 animate-[pulse_1.2s_ease-in-out_1]">
        <CheckCircle2 size={28} />
      </div>
      <h3 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
        Conversion complete
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--c-text-muted)" }}>
        {fileName}
      </p>
      <p className="mt-2 text-xs" style={{ color: "var(--c-text-dim)" }}>
        Input {formatBytes(inputBytes)} → Output {formatBytes(bytes)}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="btn-main inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          <Download size={16} /> Download
        </button>
        <button
          type="button"
          onClick={onReset}
          className="btn-secondary inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          <RotateCcw size={16} /> Convert another
        </button>
      </div>
    </div>
  );
}
