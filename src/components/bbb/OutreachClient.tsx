"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { rowsToCsv } from "@/lib/bbb-validate";
import { OutreachChatbot } from "@/components/bbb/OutreachChatbot";
import {
  PROMPT_PLACEHOLDER,
  type CustomTemplate,
  type OutreachKind,
} from "@/lib/outreach";

const inputStyle = {
  border: "1px solid var(--c-border)",
  background: "var(--c-hover-bg)",
  color: "var(--c-heading)",
} as const;

const BUILTIN: { key: OutreachKind; label: string }[] = [
  { key: "cold_email", label: "Cold email" },
  { key: "phone_script", label: "Phone script" },
  { key: "follow_up", label: "Follow-up" },
];

const CUSTOM_STORE_KEY = "axenflow-outreach-customs";

function newId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function OutreachClient() {
  const [senderName, setSenderName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");

  const [prompt, setPrompt] = useState(PROMPT_PLACEHOLDER);
  const [customName, setCustomName] = useState("");
  const [customs, setCustoms] = useState<CustomTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedKinds, setSelectedKinds] = useState<Record<OutreachKind, boolean>>({
    cold_email: false,
    phone_script: false,
    follow_up: false,
  });
  const [selectedCustomIds, setSelectedCustomIds] = useState<Record<string, boolean>>({});
  const [includeCurrentDraft, setIncludeCurrentDraft] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [sheetRows, setSheetRows] = useState<Record<string, string>[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [batchRows, setBatchRows] = useState<Record<string, string>[]>([]);
  const [counts, setCounts] = useState<{ total: number; filled: number; skipped: number } | null>(
    null
  );
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [editModal, setEditModal] = useState<CustomTemplate | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const newSheetInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("axenflow-sender-name");
      if (saved) setSenderName(saved);
      const raw = localStorage.getItem(CUSTOM_STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CustomTemplate[];
        if (Array.isArray(parsed)) setCustoms(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function persistCustoms(next: CustomTemplate[]) {
    setCustoms(next);
    try {
      localStorage.setItem(CUSTOM_STORE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function saveSender() {
    try {
      localStorage.setItem("axenflow-sender-name", senderName.trim());
    } catch {
      /* ignore */
    }
  }

  const leadInput = useMemo(
    () => ({ businessName, category, city, senderName }),
    [businessName, category, city, senderName]
  );

  function saveCustomTemplate(nameOverride?: string) {
    const name = (nameOverride ?? customName).trim() || `Custom ${customs.length + 1}`;
    const text = prompt.trim();
    if (!text) {
      setMsg("Create a template in chat first");
      return;
    }
    if (editingId) {
      const next = customs.map((c) => (c.id === editingId ? { ...c, name, prompt: text } : c));
      persistCustoms(next);
      setMsg(`Updated template: ${name}`);
    } else {
      const tpl: CustomTemplate = { id: newId(), name, prompt: text };
      persistCustoms([...customs, tpl]);
      setSelectedCustomIds((prev) => ({ ...prev, [tpl.id]: true }));
      setMsg(`Saved template: ${name}`);
    }
    setEditingId(null);
    setCustomName("");
  }

  function openEditModal(tpl: CustomTemplate) {
    setEditModal(tpl);
    setEditName(tpl.name);
    setEditPrompt(tpl.prompt);
    setEditingId(tpl.id);
  }

  function saveEditModal() {
    if (!editModal) return;
    const name = editName.trim() || editModal.name;
    const text = editPrompt.trim();
    if (!text) {
      setMsg("Template text cannot be empty");
      return;
    }
    const next = customs.map((c) =>
      c.id === editModal.id ? { ...c, name, prompt: text } : c
    );
    persistCustoms(next);
    setPrompt(text);
    setCustomName(name);
    setEditingId(editModal.id);
    setMsg(`Updated template: ${name}`);
    setEditModal(null);
  }

  function confirmDeleteCustom(id: string) {
    const removed = customs.find((c) => c.id === id);
    persistCustoms(customs.filter((c) => c.id !== id));
    setSelectedCustomIds((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (editingId === id) {
      setEditingId(null);
      setCustomName("");
    }
    if (editModal?.id === id) setEditModal(null);
    setDeleteConfirmId(null);
    setMsg(removed ? `Deleted template: ${removed.name}` : "Template deleted");
  }

  function toggleKind(key: OutreachKind) {
    setSelectedKinds((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleCustom(id: string) {
    setSelectedCustomIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selectedPayload() {
    const kinds = BUILTIN.map((b) => b.key).filter((k) => selectedKinds[k]);
    const customTemplates = [...customs.filter((c) => selectedCustomIds[c.id])];
    if (includeCurrentDraft && prompt.trim()) {
      customTemplates.push({
        id: "current-draft",
        name: customName.trim() || "AI Draft",
        prompt: prompt.trim(),
      });
    }
    return { kinds, customTemplates };
  }

  function clearResults() {
    setBatchRows([]);
    setSheetRows([]);
    setFile(null);
    setCounts(null);
    setShowResultsModal(false);
    setMsg("Results cleared. Upload a new CSV or Excel sheet to continue.");
  }

  function onNewSheetSelected(selected: File | null) {
    if (!selected) return;
    setShowResultsModal(false);
    setBatchRows([]);
    setCounts(null);
    void onUpload(selected);
  }

  async function onUpload(selected: File | null) {
    if (!selected) return;
    setFile(selected);
    setBatchRows([]);
    setCounts(null);
    setMsg("");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", selected);
      form.append("parseOnly", "1");
      const res = await fetch("/api/tools/ai-outreach", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setSheetRows(data.rows || []);
      setMsg(`File loaded: ${data.counts?.total || 0} rows. Select templates, then add to sheet.`);
    } catch (err) {
      setSheetRows([]);
      setMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function addSelectedToSheet() {
    const { kinds, customTemplates } = selectedPayload();
    if (!kinds.length && !customTemplates.length) {
      setMsg("Select at least one template (built-in or custom)");
      return;
    }
    if (!sheetRows.length && !file) {
      setMsg("Upload a CSV or Excel file first");
      return;
    }
    saveSender();
    setBusy(true);
    setMsg("Adding selected templates to your sheet...");
    try {
      let res: Response;
      if (sheetRows.length) {
        res = await fetch("/api/tools/ai-outreach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: sheetRows,
            kinds,
            customTemplates,
            senderName: senderName.trim(),
          }),
        });
      } else if (file) {
        const form = new FormData();
        form.append("file", file);
        form.append("kinds", JSON.stringify(kinds));
        form.append("customTemplates", JSON.stringify(customTemplates));
        form.append("senderName", senderName.trim());
        res = await fetch("/api/tools/ai-outreach", { method: "POST", body: form });
      } else {
        throw new Error("Upload a file first");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add templates");
      setBatchRows(data.rows || []);
      setSheetRows(data.rows || []);
      setCounts(data.counts || null);
      const names = [
        ...kinds.map((k) => BUILTIN.find((b) => b.key === k)?.label || k),
        ...customTemplates.map((c) => c.name),
      ];
      setMsg(
        `Added ${names.length} template(s) (${names.join(", ")}) for ${data.counts?.filled || 0} businesses`
      );
      setShowResultsModal(true);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to add templates");
      setShowResultsModal(false);
    } finally {
      setBusy(false);
    }
  }

  function downloadCsv() {
    if (!batchRows.length) return;
    const blob = new Blob(["\uFEFF" + rowsToCsv(batchRows)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ai-outreach.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function downloadXlsx() {
    if (!batchRows.length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/tools/ai-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: batchRows,
          exportOnly: true,
          download: "xlsx",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Excel download failed");
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ai-outreach.xlsx";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Excel download failed");
    } finally {
      setBusy(false);
    }
  }

  const preview = batchRows.slice(0, 8);
  const previewHeaders = useMemo(() => {
    if (!batchRows.length) return ["Business Name"];
    const keys = Object.keys(batchRows[0]);
    const prefer = [
      "Business Name",
      "Cold Email Subject",
      "Cold Email Body",
      "Phone Script",
      "Follow-up Subject",
      "Follow-up Body",
    ];
    const extras = keys.filter((k) => !prefer.includes(k) && /(Subject|Body|Script)$/i.test(k));
    return [...prefer.filter((h) => keys.includes(h)), ...extras].slice(0, 5);
  }, [batchRows]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      {busy && (
        <div
          className="fixed inset-0 z-50 grid place-items-center"
          style={{ background: "rgba(5,5,9,0.72)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="rounded-2xl px-8 py-6 text-center"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-card, #12101c)" }}
          >
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
            <p className="font-semibold" style={{ color: "var(--c-heading)" }}>
              Working...
            </p>
          </div>
        </div>
      )}

      <section className="rounded-2xl p-4" style={{ border: "1px solid var(--c-border)" }}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--c-heading)" }}>
            Your company name (used in Best regards)
          </span>
          <input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            onBlur={saveSender}
            placeholder="e.g. AxenFlow AI"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </label>
      </section>

      <OutreachChatbot
        lead={leadInput}
        prompt={prompt}
        onPromptChange={setPrompt}
        onFilledPreview={() => {}}
      />

      <section className="space-y-4 rounded-2xl p-5" style={{ border: "1px solid var(--c-border)" }}>
        <div>
          <h3 className="text-base font-semibold" style={{ color: "var(--c-heading)" }}>
            Step 2 · Add to your sheet
          </h3>
          <p className="mt-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
            Choose templates, upload CSV/Excel, then apply.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label
            className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm"
            style={{
              border: "1px solid var(--c-border)",
              background: includeCurrentDraft ? "rgba(20,184,166,0.15)" : "transparent",
              color: "var(--c-heading)",
            }}
          >
            <input
              type="checkbox"
              checked={includeCurrentDraft}
              onChange={() => setIncludeCurrentDraft((v) => !v)}
            />
            AI draft
          </label>
          {BUILTIN.map((b) => (
            <label
              key={b.key}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm"
              style={{
                border: "1px solid var(--c-border)",
                background: selectedKinds[b.key] ? "rgba(99,102,241,0.15)" : "transparent",
                color: "var(--c-heading)",
              }}
            >
              <input
                type="checkbox"
                checked={selectedKinds[b.key]}
                onChange={() => toggleKind(b.key)}
              />
              {b.label}
            </label>
          ))}
          {customs.map((tpl) => (
            <label
              key={tpl.id}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm"
              style={{
                border: "1px solid var(--c-border)",
                background: selectedCustomIds[tpl.id] ? "rgba(99,102,241,0.15)" : "transparent",
                color: "var(--c-heading)",
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(selectedCustomIds[tpl.id])}
                onChange={() => toggleCustom(tpl.id)}
              />
              {tpl.name}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => saveCustomTemplate(`Custom ${customs.length + 1}`)}
          >
            Save AI draft
          </Button>
          <label
            className="inline-flex cursor-pointer items-center rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
          >
            {file ? `File: ${file.name}` : "Upload CSV / Excel"}
            <input
              type="file"
              accept=".csv,.xlsx,.tsv,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => {
                void onUpload(e.target.files?.[0] || null);
                e.currentTarget.value = "";
              }}
            />
          </label>
          <Button
            type="button"
            variant="green"
            disabled={busy}
            onClick={() => void addSelectedToSheet()}
          >
            Apply to sheet
          </Button>
        </div>

        {file && (
          <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>
            {sheetRows.length} rows loaded
            {includeCurrentDraft ||
            Object.values(selectedKinds).some(Boolean) ||
            Object.values(selectedCustomIds).some(Boolean)
              ? ""
              : " · select at least one template"}
          </p>
        )}
        {msg && (
          <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>
            {msg}
          </p>
        )}

        {customs.length > 0 && (
          <div className="space-y-2 border-t pt-3" style={{ borderColor: "var(--c-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-text-muted)" }}>
              Saved templates
            </p>
            <ul className="space-y-1.5">
              {customs.map((tpl) => (
                <li
                  key={tpl.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm"
                  style={{ color: "var(--c-heading)" }}
                >
                  <span>{tpl.name}</span>
                  <span className="flex gap-3">
                    <button
                      type="button"
                      className="font-semibold text-indigo-500 hover:text-teal-500"
                      onClick={() => openEditModal(tpl)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="font-semibold text-red-400 hover:text-red-300"
                      onClick={() => setDeleteConfirmId(tpl.id)}
                    >
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {batchRows.length > 0 && (
        <section className="space-y-3 rounded-2xl p-5" style={{ border: "1px solid var(--c-border)" }}>
          <div>
            <h3 className="text-base font-semibold" style={{ color: "var(--c-heading)" }}>
              Step 3 · Results
            </h3>
            {counts && (
              <p className="mt-1 text-sm" style={{ color: "var(--c-text-muted)" }}>
                {counts.filled} of {counts.total} rows updated
                {counts.skipped ? ` · ${counts.skipped} skipped` : ""}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="green" onClick={downloadCsv}>
              Download CSV
            </Button>
            <Button type="button" variant="outline" onClick={() => void downloadXlsx()}>
              Download Excel
            </Button>
            <label
              className="inline-flex cursor-pointer items-center rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
            >
              New sheet
              <input
                ref={newSheetInputRef}
                type="file"
                accept=".csv,.xlsx,.tsv,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => {
                  onNewSheetSelected(e.target.files?.[0] || null);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <Button type="button" variant="outline" onClick={clearResults}>
              Clear
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--c-border)" }}>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr style={{ background: "var(--c-hover-bg)" }}>
                  {previewHeaders.map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-3 py-2 font-semibold"
                      style={{ color: "var(--c-heading)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--c-border)" }}>
                    {previewHeaders.map((h) => (
                      <td
                        key={h}
                        className="max-w-[200px] truncate px-3 py-2"
                        style={{
                          color: h === "Business Name" ? "var(--c-heading)" : "var(--c-text-dim)",
                        }}
                      >
                        {row[h] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {batchRows.length > preview.length && (
              <p className="px-3 py-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
                Showing first {preview.length} of {batchRows.length} rows.
              </p>
            )}
          </div>
        </section>
      )}

      {showResultsModal && batchRows.length > 0 && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center p-4"
          style={{ background: "rgba(5,5,9,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowResultsModal(false)}
        >
          <div
            className="w-full max-w-lg space-y-4 rounded-2xl p-5"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-card, #12101c)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold" style={{ color: "var(--c-heading)" }}>
              Done
            </h3>
            <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>
              {counts
                ? `Templates added to ${counts.filled} of ${counts.total} rows.`
                : "Templates added to your sheet."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="green" onClick={downloadCsv}>
                Download CSV
              </Button>
              <Button type="button" variant="outline" onClick={() => void downloadXlsx()}>
                Download Excel
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowResultsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center p-4"
          style={{ background: "rgba(5,5,9,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setEditModal(null)}
        >
          <div
            className="w-full max-w-2xl space-y-4 rounded-2xl p-5"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-card, #12101c)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold" style={{ color: "var(--c-heading)" }}>
              Edit template
            </h3>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Template name"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              rows={10}
              className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none"
              style={inputStyle}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="green" onClick={saveEditModal}>
                Save
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditModal(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center p-4"
          style={{ background: "rgba(5,5,9,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-full max-w-md space-y-4 rounded-2xl p-5"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-card, #12101c)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold" style={{ color: "var(--c-heading)" }}>
              Delete this template?
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="green" onClick={() => confirmDeleteCustom(deleteConfirmId)}>
                Delete
              </Button>
              <Button type="button" variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
