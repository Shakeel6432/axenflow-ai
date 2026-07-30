"use client";

import { useCallback, useState } from "react";
import { Upload, FolderOpen } from "lucide-react";
import { MAX_FILE_BYTES, formatBytes } from "@/lib/csv-excel/types";

type UploadZoneProps = {
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
};

export function UploadZone({ accept, multiple = true, disabled, onFiles }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const take = useCallback(
    (list: FileList | File[] | null) => {
      if (!list || disabled) return;
      const files = Array.from(list);
      const ok: File[] = [];
      for (const f of files) {
        if (f.size > MAX_FILE_BYTES) {
          continue;
        }
        ok.push(f);
      }
      if (ok.length) onFiles(ok);
    },
    [disabled, onFiles]
  );

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        take(e.dataTransfer.files);
      }}
      className={`relative overflow-hidden rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 ${
        dragOver ? "scale-[1.01] shadow-lg shadow-indigo-500/20" : ""
      }`}
      style={{
        borderColor: dragOver ? "rgba(99,102,241,0.8)" : "var(--c-border)",
        background: dragOver ? "rgba(99,102,241,0.08)" : "var(--c-hover-bg)",
      }}
    >
      <div
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 ${
          dragOver ? "scale-110" : ""
        }`}
        style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
      >
        <Upload size={26} />
      </div>
      <p className="text-base font-semibold" style={{ color: "var(--c-heading)" }}>
        Drag & drop files here
      </p>
      <p className="mt-1 text-sm" style={{ color: "var(--c-text-muted)" }}>
        or browse from your computer · max {formatBytes(MAX_FILE_BYTES)} each
      </p>
      <label className="btn-main mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold">
        <FolderOpen size={16} />
        Browse Files
        <input
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            take(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      <p className="mt-3 text-xs" style={{ color: "var(--c-text-muted)" }}>
        Tip: press Ctrl+V to paste CSV text when no file is selected
      </p>
    </div>
  );
}
