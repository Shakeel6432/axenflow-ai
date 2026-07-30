import type { HistoryEntry } from "./types";
import { HISTORY_KEY } from "./types";

export function loadHistory(): Omit<HistoryEntry, "objectUrl">[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Omit<HistoryEntry, "objectUrl">[];
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function saveHistoryMeta(entries: Omit<HistoryEntry, "objectUrl">[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 5)));
}

export function pushHistoryMeta(entry: Omit<HistoryEntry, "objectUrl">) {
  const prev = loadHistory().filter((e) => e.id !== entry.id);
  saveHistoryMeta([entry, ...prev].slice(0, 5));
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Keep URL briefly for history re-download in-session
  return url;
}
