"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { PrivacyBadge } from "./PrivacyBadge";
import { UploadZone } from "./UploadZone";
import { FileQueue } from "./FileQueue";
import { PreviewTable } from "./PreviewTable";
import { SettingsPanel } from "./SettingsPanel";
import { ConversionProgress } from "./ConversionProgress";
import { ResultDownload } from "./ResultDownload";
import { parseUploadedFile } from "@/lib/csv-excel/parse";
import { convertCsvToExcel, convertExcelToCsv, type BuiltDownload } from "@/lib/csv-excel/convert";
import { applyFindReplace } from "@/lib/csv-excel/cleanup";
import { pushHistoryMeta, triggerDownload, loadHistory } from "@/lib/csv-excel/history";
import {
  DEFAULT_SETTINGS,
  MAX_FILE_BYTES,
  formatBytes,
  type ColumnMeta,
  type ConverterSettings,
  type HistoryEntry,
  type ParsedWorkbook,
  type QueueItem,
} from "@/lib/csv-excel/types";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function CsvExcelConverterClient() {
  const [settings, setSettings] = useState<ConverterSettings>(DEFAULT_SETTINGS);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [workbooks, setWorkbooks] = useState<ParsedWorkbook[]>([]);
  const [activeWbId, setActiveWbId] = useState<string | null>(null);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<(BuiltDownload & { objectUrl: string; inputBytes: number }) | null>(
    null
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const accept =
    settings.direction === "csv-to-excel"
      ? ".csv,.tsv,.txt,text/csv,text/tab-separated-values"
      : ".xlsx,.xls,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const activeWb = workbooks.find((w) => w.id === activeWbId) || workbooks[0] || null;
  const activeSheet = activeWb?.sheets[activeSheetIdx] || activeWb?.sheets[0] || null;

  const previewSheet = useMemo(() => {
    if (!activeSheet) return null;
    if (!columns.length) return activeSheet;
    return { ...activeSheet, columns };
  }, [activeSheet, columns]);

  useEffect(() => {
    if (!activeSheet) {
      setColumns([]);
      return;
    }
    setColumns(activeSheet.columns.map((c) => ({ ...c })));
  }, [activeSheet?.name, activeWb?.id, activeSheetIdx]);

  useEffect(() => {
    const meta = loadHistory();
    setHistory(meta.map((m) => ({ ...m, objectUrl: "" })));
  }, []);

  const updateQueue = (id: string, patch: Partial<QueueItem>) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const ingestFiles = useCallback(
    async (files: File[]) => {
      setError("");
      setResult(null);

      const oversized = files.filter((f) => f.size > MAX_FILE_BYTES);
      if (oversized.length) {
        setError(
          `These files exceed the ${formatBytes(MAX_FILE_BYTES)} limit: ${oversized
            .map((f) => f.name)
            .join(", ")}`
        );
      }

      const accepted = files.filter((f) => f.size <= MAX_FILE_BYTES);
      if (!accepted.length) return;

      const large = accepted.filter((f) => f.size > 10 * 1024 * 1024);
      if (large.length) {
        setError(
          `Large file(s) detected (${large.map((f) => f.name).join(", ")}). Conversion may take longer — keep this tab open.`
        );
      } else if (!oversized.length) {
        setError("");
      }

      const items: QueueItem[] = accepted.map((file) => ({
        id: uid(),
        file,
        status: "queued",
        progress: 0,
      }));
      setQueue((prev) => [...prev, ...items]);

      const parsedAll: ParsedWorkbook[] = [];

      for (const item of items) {
        try {
          updateQueue(item.id, { status: "reading", progress: 15 });
          await sleep(120);
          updateQueue(item.id, { status: "detecting", progress: 45 });
          const parsed = await parseUploadedFile(item.file, settings);
          updateQueue(item.id, { status: "done", progress: 100, parsed });
          parsedAll.push(parsed);
        } catch (err) {
          updateQueue(item.id, {
            status: "error",
            progress: 100,
            error: err instanceof Error ? err.message : "Could not read this file.",
          });
        }
      }

      if (parsedAll.length) {
        setWorkbooks((prev) => {
          const next = [...prev, ...parsedAll];
          setActiveWbId(parsedAll[0].id);
          setActiveSheetIdx(0);
          // default select all sheets
          setSettings((s) => {
            const selected = { ...s.selectedSheetIndexes };
            for (const wb of parsedAll) {
              selected[wb.id] = wb.sheets.map((_, i) => i);
            }
            return { ...s, selectedSheetIndexes: selected };
          });
          return next;
        });
      }
    },
    [settings]
  );

  // Paste CSV via Ctrl+V
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (busy || workbooks.length) return;
      const text = e.clipboardData?.getData("text/plain");
      if (!text || !text.includes("\n")) return;
      if (settings.direction !== "csv-to-excel") return;
      const file = new File([text], "pasted-data.csv", { type: "text/csv" });
      void ingestFiles([file]);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [busy, workbooks.length, settings.direction, ingestFiles]);

  const syncColumnsIntoWorkbooks = () => {
    if (!activeWb || !activeSheet) return workbooks;
    return workbooks.map((wb) => {
      if (wb.id !== activeWb.id) return wb;
      return {
        ...wb,
        sheets: wb.sheets.map((sh, i) =>
          i === activeSheetIdx ? { ...sh, columns } : sh
        ),
      };
    });
  };

  const onConvert = async () => {
    if (!workbooks.length) {
      setError("Upload at least one file first.");
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    setProgress(5);
    setStage("Reading file");

    try {
      await sleep(200);
      setProgress(20);
      setStage("Detecting structure");
      const synced = syncColumnsIntoWorkbooks();
      await sleep(150);
      setProgress(40);
      setStage("Formatting");

      const inputBytes = synced.reduce((n, w) => n + w.fileSize, 0);
      const built =
        settings.direction === "csv-to-excel"
          ? await convertCsvToExcel(synced, settings, (pct, st) => {
              setProgress(pct);
              setStage(st);
            })
          : await convertExcelToCsv(synced, settings, (pct, st) => {
              setProgress(pct);
              setStage(st);
            });

      await sleep(180);
      const objectUrl = triggerDownload(built.blob, built.fileName);
      const entry = {
        id: uid(),
        at: Date.now(),
        label: built.fileName,
        bytes: built.bytes,
        mime: built.mime,
      };
      pushHistoryMeta(entry);
      setHistory((prev) => [{ ...entry, objectUrl }, ...prev].slice(0, 5));
      setResult({ ...built, objectUrl, inputBytes });
      setStage("Done");
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed. Please try another file.");
    } finally {
      setBusy(false);
    }
  };

  const resetAll = () => {
    if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    setQueue([]);
    setWorkbooks([]);
    setActiveWbId(null);
    setActiveSheetIdx(0);
    setColumns([]);
    setResult(null);
    setError("");
    setProgress(0);
    setStage("");
    setFindText("");
    setReplaceText("");
  };

  const applyReplace = () => {
    if (!activeWb || !findText) return;
    setWorkbooks((prev) =>
      prev.map((wb) => {
        if (wb.id !== activeWb.id) return wb;
        return {
          ...wb,
          sheets: wb.sheets.map((sh, i) =>
            i === activeSheetIdx ? applyFindReplace(sh, findText, replaceText) : sh
          ),
        };
      })
    );
  };

  const warnings = workbooks.flatMap((w) => w.warnings);

  return (
    <div className="space-y-6">
      <PrivacyBadge />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            settings.direction === "csv-to-excel" ? "btn-main" : "btn-secondary"
          }`}
          onClick={() => {
            resetAll();
            setSettings((s) => ({ ...s, direction: "csv-to-excel" }));
          }}
        >
          <FileSpreadsheet size={16} /> CSV → Excel
        </button>
        <button
          type="button"
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            settings.direction === "excel-to-csv" ? "btn-main" : "btn-secondary"
          }`}
          onClick={() => {
            resetAll();
            setSettings((s) => ({ ...s, direction: "excel-to-csv" }));
          }}
        >
          <ArrowLeftRight size={16} /> Excel → CSV
        </button>
      </div>

      <UploadZone accept={accept} disabled={busy} onFiles={(files) => void ingestFiles(files)} />

      {error && (
        <div
          className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <FileQueue
        items={queue}
        onRemove={(id) => {
          setQueue((prev) => prev.filter((q) => q.id !== id));
          setWorkbooks((prev) => {
            const item = queue.find((q) => q.id === id);
            const parsedId = item?.parsed?.id;
            const next = parsedId ? prev.filter((w) => w.id !== parsedId) : prev;
            if (activeWbId && parsedId === activeWbId) {
              setActiveWbId(next[0]?.id || null);
              setActiveSheetIdx(0);
            }
            return next;
          });
        }}
      />

      {warnings.length > 0 && (
        <ul className="space-y-1 text-xs" style={{ color: "#fbbf24" }}>
          {warnings.map((w) => (
            <li key={w}>⚠ {w}</li>
          ))}
        </ul>
      )}

      {workbooks.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {workbooks.map((wb) => (
            <button
              key={wb.id}
              type="button"
              className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{
                background: wb.id === activeWb?.id ? "rgba(99,102,241,0.2)" : "var(--c-hover-bg)",
                color: "var(--c-heading)",
                border: "1px solid var(--c-border)",
              }}
              onClick={() => {
                setActiveWbId(wb.id);
                setActiveSheetIdx(0);
              }}
            >
              {wb.fileName}
            </button>
          ))}
        </div>
      )}

      {activeWb && activeWb.sheets.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {activeWb.sheets.map((sh, i) => (
            <button
              key={sh.name}
              type="button"
              className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{
                background: i === activeSheetIdx ? "rgba(20,184,166,0.2)" : "var(--c-hover-bg)",
                color: "var(--c-heading)",
                border: "1px solid var(--c-border)",
              }}
              onClick={() => setActiveSheetIdx(i)}
            >
              {sh.name}
            </button>
          ))}
        </div>
      )}

      <div className="glass-card rounded-2xl p-4 sm:p-5" style={{ border: "1px solid var(--c-border)" }}>
        <PreviewTable sheet={previewSheet} />
      </div>

      <SettingsPanel
        settings={settings}
        onChange={setSettings}
        workbooks={workbooks}
        activeColumns={columns}
        onColumnsChange={setColumns}
        findText={findText}
        replaceText={replaceText}
        onFindChange={setFindText}
        onReplaceChange={setReplaceText}
        onApplyReplace={applyReplace}
      />

      <ConversionProgress visible={busy} stage={stage} progress={progress} />

      {result && !busy && (
        <ResultDownload
          fileName={result.fileName}
          bytes={result.bytes}
          inputBytes={result.inputBytes}
          onDownload={() => {
            const a = document.createElement("a");
            a.href = result.objectUrl;
            a.download = result.fileName;
            a.click();
          }}
          onReset={resetAll}
        />
      )}

      {!result && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy || !workbooks.length}
            onClick={() => void onConvert()}
            className="btn-main inline-flex cursor-pointer items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Converting…" : "Convert & Download"}
          </button>
          {workbooks.length > 0 && (
            <button
              type="button"
              disabled={busy}
              onClick={resetAll}
              className="btn-secondary inline-flex cursor-pointer rounded-xl px-5 py-3 text-sm font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>
            Session history (browser only)
          </p>
          <ul className="space-y-1.5 text-xs" style={{ color: "var(--c-text-muted)" }}>
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-2">
                <span>
                  {h.label} · {formatBytes(h.bytes)}
                </span>
                {h.objectUrl ? (
                  <a href={h.objectUrl} download={h.label} className="text-indigo-400 hover:text-teal-400">
                    Re-download
                  </a>
                ) : (
                  <span>Saved this session</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
