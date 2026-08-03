"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2, Unplug } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PROVIDER_PRESETS } from "@/lib/mailbox/constants";

type MailboxRow = {
  id: string;
  email: string;
  provider: string;
  status: string;
  lastVerifiedAt: string | null;
  lastAuthError: string | null;
};

export function ConnectedMailboxesPanel() {
  const [rows, setRows] = useState<MailboxRow[]>([]);
  const [busyId, setBusyId] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mailbox/connect");
      const data = await res.json();
      if (res.ok) setRows(data.mailboxes || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function disconnect(id: string) {
    if (!window.confirm("Disconnect this mailbox? Stored credentials will be permanently deleted.")) {
      return;
    }
    setBusyId(id);
    setMsg("");
    try {
      const res = await fetch(`/api/mailbox/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Disconnect failed");
      setMsg(data.message || "Disconnected.");
      if (data.revokeUrl) {
        setMsg(
          `${data.message} Revoke in provider settings: ${data.revokeUrl}`
        );
      }
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-indigo-400">
        <Loader2 size={14} className="animate-spin" /> Loading connected mailboxes...
      </p>
    );
  }

  if (!rows.length) {
    return (
      <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
        No mailboxes connected yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const revokeUrl =
          row.provider === "gmail"
            ? PROVIDER_PRESETS.gmail.revokeUrl
            : row.provider === "outlook"
              ? PROVIDER_PRESETS.outlook.revokeUrl
              : null;
        return (
          <div
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
          >
            <div>
              <p className="font-semibold" style={{ color: "var(--c-heading)" }}>
                {row.email}
              </p>
              <p className="text-xs capitalize" style={{ color: "var(--c-text-muted)" }}>
                {row.provider} · {row.status}
                {row.lastVerifiedAt
                  ? ` · verified ${new Date(row.lastVerifiedAt).toLocaleDateString()}`
                  : ""}
              </p>
              {row.lastAuthError && (
                <p className="mt-1 text-xs text-red-500">{row.lastAuthError}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {revokeUrl && (
                <a
                  href={revokeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold"
                  style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                >
                  <Unplug size={12} /> Revoke in {row.provider}
                </a>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={busyId === row.id}
                onClick={() => void disconnect(row.id)}
              >
                {busyId === row.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Disconnect
              </Button>
            </div>
          </div>
        );
      })}
      {msg && (
        <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
          {msg}
        </p>
      )}
    </div>
  );
}
