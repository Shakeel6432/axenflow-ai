"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Flame,
  Inbox,
  Loader2,
  Mail,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/Button";

type Score = {
  rampCompletion: number;
  inboxPlacementRate: number;
  engagementConsistency: number;
  score: number;
  label: string;
};

type MailboxRow = {
  id: string;
  email: string;
  provider: string;
  displayName: string | null;
  warmupStatus: string;
  rampDay: number;
  totalRampDays: number;
  pauseReason: string | null;
  sentToday: number;
  receivedToday: number;
  inboxRate7d: number;
  spamRescues7d: number;
  spamRate7d: number;
  score: Score;
  warning?: string | null;
};

type Summary = {
  overallScore: number;
  mailboxCount: number;
  fullyWarmed: number;
  ramping: number;
  sentToday: number;
  sentWeek: number;
  sentMonth: number;
  receivedToday: number;
  receivedWeek: number;
  receivedMonth: number;
  inboxPlacementRate: number;
  spamRescuesWeek: number;
};

type TrendPoint = {
  date: string;
  sent: number;
  received: number;
  inboxRate: number;
  rescued: number;
};

type Detail = {
  mailbox: {
    id: string;
    email: string;
    provider: string;
    warmupStatus: string;
    rampDay: number;
    totalRampDays: number;
    pauseReason: string | null;
  };
  score: Score;
  rampCurve: Array<{ day: number; limit: number; isToday: boolean }>;
  spamRescueHistory: { last30Days: number; trend: string };
  spamRate7d: number;
  warning: string | null;
  events: Array<{
    id: string;
    eventType: string;
    counterpartEmail: string | null;
    detail: string | null;
    createdAt: string;
  }>;
};

type SortKey = "score" | "ramp" | "inbox";

const cardStyle = {
  border: "1px solid var(--c-border)",
  background: "var(--c-hover-bg)",
} as const;

function providerIcon(provider: string) {
  if (provider === "gmail") return "G";
  if (provider === "outlook") return "O";
  return "C";
}

function eventLabel(e: Detail["events"][number]) {
  const time = new Date(e.createdAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  switch (e.eventType) {
    case "sent":
      return { icon: "✉️", text: `Sent to ${e.counterpartEmail || "pool mailbox"} — ${time}`, rescue: false };
    case "delivered_inbox":
      return { icon: "📬", text: `Delivered to Inbox — ${time}`, rescue: false };
    case "delivered_spam":
      return { icon: "⚠️", text: `Landed in Spam — ${time}`, rescue: true };
    case "rescued":
      return { icon: "⚠️", text: `Landed in Spam — rescued to Inbox — ${time}`, rescue: true };
    case "opened":
      return { icon: "👁️", text: `Marked as read — ${time}`, rescue: false };
    case "replied":
      return { icon: "💬", text: `Auto-reply sent — ${time}`, rescue: false };
    case "flagged_important":
      return { icon: "⭐", text: `Flagged important — ${time}`, rescue: false };
    case "bounced":
      return { icon: "🚫", text: `Bounced / send failed — ${time}`, rescue: false };
    default:
      return { icon: "•", text: `${e.eventType} — ${time}`, rescue: false };
  }
}

export function WarmupAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [mailboxes, setMailboxes] = useState<MailboxRow[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [days, setDays] = useState(30);
  const [trendMailboxId, setTrendMailboxId] = useState("");
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tools/email-warmup/analytics");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load analytics");
      setSummary(data.summary);
      setMailboxes(data.mailboxes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTrend = useCallback(async () => {
    const q = new URLSearchParams({ view: "trend", days: String(days) });
    if (trendMailboxId) q.set("mailboxId", trendMailboxId);
    const res = await fetch(`/api/tools/email-warmup/analytics?${q}`);
    const data = await res.json();
    if (res.ok) setTrend(data.trend || []);
  }, [days, trendMailboxId]);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setDetailId(id);
    try {
      const res = await fetch(
        `/api/tools/email-warmup/analytics?view=mailbox&mailboxId=${encodeURIComponent(id)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load mailbox");
      setDetail(data.detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mailbox");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    void loadTrend();
  }, [loadTrend]);

  const sorted = useMemo(() => {
    const rows = [...mailboxes];
    rows.sort((a, b) => {
      if (sortKey === "ramp") return b.rampDay - a.rampDay;
      if (sortKey === "inbox") return b.inboxRate7d - a.inboxRate7d;
      return b.score.score - a.score.score;
    });
    return rows;
  }, [mailboxes, sortKey]);

  async function exportCsv() {
    window.location.href = `/api/tools/email-warmup/analytics?view=export&days=${days}`;
  }

  async function togglePause(id: string, currentlyPaused: boolean) {
    const res = await fetch("/api/tools/email-warmup/analytics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mailboxId: id,
        status: currentlyPaused ? "active" : "paused",
        reason: currentlyPaused ? undefined : "Paused by user from dashboard",
      }),
    });
    if (res.ok) {
      await loadOverview();
      if (detailId === id) await loadDetail(id);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-indigo-400">
        <Loader2 size={14} className="animate-spin" /> Loading warmup analytics...
      </p>
    );
  }

  if (detailId) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => {
            setDetailId(null);
            setDetail(null);
            void loadOverview();
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-teal-400"
        >
          <ArrowLeft size={14} /> Back to overview
        </button>
        {detailLoading || !detail ? (
          <p className="flex items-center gap-2 text-sm text-indigo-400">
            <Loader2 size={14} className="animate-spin" /> Loading mailbox detail...
          </p>
        ) : (
          <MailboxDetailView
            detail={detail}
            onTogglePause={() =>
              void togglePause(detail.mailbox.id, detail.mailbox.warmupStatus === "paused")
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold" style={{ color: "var(--c-heading)" }}>
            <Flame size={20} className="text-amber-400" />
            Warmup analytics
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--c-text-muted)" }}>
            Progress, inbox placement, and spam-to-inbox rescues across your connected mailboxes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/tools/email-warmup/connect" variant="outline">
            Connect mailbox
          </Button>
          <Button type="button" onClick={() => void exportCsv()}>
            <Download size={14} /> Export report
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            title="Overall Warmup Score"
            value={`${summary.overallScore}%`}
            hint="Average across connected mailboxes"
            icon={<Sparkles size={16} className="text-indigo-400" />}
          />
          <SummaryCard
            title="Mailboxes"
            value={`${summary.mailboxCount}`}
            hint={`${summary.fullyWarmed} fully warmed · ${summary.ramping} still ramping`}
            icon={<Mail size={16} className="text-teal-400" />}
          />
          <SummaryCard
            title="Sent"
            value={`${summary.sentToday}`}
            hint={`Today · ${summary.sentWeek} this week · ${summary.sentMonth} this month`}
            icon={<Mail size={16} className="text-indigo-400" />}
          />
          <SummaryCard
            title="Received"
            value={`${summary.receivedToday}`}
            hint={`Today · ${summary.receivedWeek} this week · ${summary.receivedMonth} this month`}
            icon={<Inbox size={16} className="text-teal-400" />}
          />
          <SummaryCard
            title="Inbox placement (7d)"
            value={`${summary.inboxPlacementRate}%`}
            hint={`${summary.inboxPlacementRate}% of warmup emails landed directly in Inbox this week`}
            icon={<Inbox size={16} className="text-teal-400" />}
          />
          <SummaryCard
            title="Spam rescues (7d)"
            value={`${summary.spamRescuesWeek}`}
            hint="Emails found in Spam/Junk and moved back to Inbox"
            icon={<ShieldAlert size={16} className="text-amber-400" />}
          />
        </div>
      )}

      <section className="rounded-2xl p-5" style={cardStyle}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold" style={{ color: "var(--c-heading)" }}>
            Volume & inbox rate
          </h3>
          <div className="flex flex-wrap gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{
                  border: `1px solid ${days === d ? "#818cf8" : "var(--c-border)"}`,
                  background: days === d ? "rgba(99,102,241,0.15)" : "transparent",
                  color: "var(--c-heading)",
                }}
              >
                {d}d
              </button>
            ))}
            <select
              value={trendMailboxId}
              onChange={(e) => setTrendMailboxId(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-xs"
              style={{
                border: "1px solid var(--c-border)",
                background: "var(--c-hover-bg)",
                color: "var(--c-heading)",
              }}
            >
              <option value="">All mailboxes</option>
              {mailboxes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.email}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-72 w-full">
          {trend.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
              No trend data yet. Events appear after the warmup engine sends and scans mailboxes.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--c-hover-bg)",
                    border: "1px solid var(--c-border)",
                    borderRadius: 12,
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="sent"
                  name="Sent"
                  stroke="#818cf8"
                  fill="rgba(129,140,248,0.2)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="received"
                  name="Received"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="inboxRate"
                  name="Inbox %"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold" style={{ color: "var(--c-heading)" }}>
            Per-mailbox breakdown
          </h3>
          <div className="flex gap-2 text-xs">
            {(
              [
                ["score", "Score"],
                ["ramp", "Ramp day"],
                ["inbox", "Inbox rate"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setSortKey(k)}
                className="rounded-lg px-2.5 py-1 font-semibold"
                style={{
                  border: `1px solid ${sortKey === k ? "#818cf8" : "var(--c-border)"}`,
                  color: "var(--c-heading)",
                }}
              >
                Sort: {label}
              </button>
            ))}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-2xl p-6 text-sm" style={cardStyle}>
            <p style={{ color: "var(--c-text-dim)" }}>
              No mailboxes connected yet. Connect Gmail, Outlook, or custom SMTP/IMAP to start
              tracking warmup progress and spam rescues.
            </p>
            <div className="mt-4">
              <Button href="/tools/email-warmup/connect">Connect Your Email</Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--c-border)" }}>
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead style={{ background: "rgba(99,102,241,0.12)" }}>
                <tr>
                  {[
                    "Mailbox",
                    "Score",
                    "Ramp",
                    "Sent today",
                    "Received today",
                    "Inbox %",
                    "Rescues",
                    "Status",
                  ].map((h) => (
                    <th key={h} className="px-3 py-2.5 font-semibold" style={{ color: "var(--c-heading)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((m) => (
                  <tr
                    key={m.id}
                    className="cursor-pointer hover:bg-white/5"
                    style={{ borderTop: "1px solid var(--c-border)" }}
                    onClick={() => void loadDetail(m.id)}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
                          style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
                        >
                          {providerIcon(m.provider)}
                        </span>
                        <div>
                          <p className="font-medium" style={{ color: "var(--c-heading)" }}>
                            {m.displayName || m.email}
                          </p>
                          <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-semibold text-teal-400">{m.score.score}%</span>
                      <span className="ml-1 text-xs" style={{ color: "var(--c-text-muted)" }}>
                        {m.score.label}
                      </span>
                    </td>
                    <td className="px-3 py-3" style={{ color: "var(--c-text-dim)" }}>
                      Day {m.rampDay} of {m.totalRampDays}
                    </td>
                    <td className="px-3 py-3">{m.sentToday}</td>
                    <td className="px-3 py-3">{m.receivedToday}</td>
                    <td className="px-3 py-3">{m.inboxRate7d}%</td>
                    <td className="px-3 py-3 text-amber-400">{m.spamRescues7d}</td>
                    <td className="px-3 py-3 capitalize">
                      {m.warmupStatus === "paused" || m.warmupStatus === "flagged" ? (
                        <span className="text-amber-400">{m.warmupStatus}</span>
                      ) : (
                        <span className="text-teal-400">active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-4" style={cardStyle}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-text-muted)" }}>
          {title}
        </p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold" style={{ color: "var(--c-heading)" }}>
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
        {hint}
      </p>
    </div>
  );
}

function MailboxDetailView({
  detail,
  onTogglePause,
}: {
  detail: Detail;
  onTogglePause: () => void;
}) {
  const { mailbox, score, rampCurve, spamRescueHistory, warning, events } = detail;
  const maxLimit = Math.max(...rampCurve.map((r) => r.limit), 1);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--c-heading)" }}>
              {mailbox.email}
            </h2>
            <p className="mt-1 text-sm capitalize" style={{ color: "var(--c-text-muted)" }}>
              {mailbox.provider} · Day {mailbox.rampDay} of {mailbox.totalRampDays} ·{" "}
              {mailbox.warmupStatus}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onTogglePause}>
            {mailbox.warmupStatus === "paused" ? "Resume warmup" : "Pause warmup"}
          </Button>
        </div>

        {warning && (
          <div
            className="mt-4 flex items-start gap-2 rounded-xl p-3 text-sm"
            style={{
              border: "1px solid rgba(245,158,11,0.4)",
              background: "rgba(245,158,11,0.1)",
              color: "#fbbf24",
            }}
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{warning}</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl p-5" style={cardStyle}>
          <h3 className="mb-3 font-semibold" style={{ color: "var(--c-heading)" }}>
            Warmup score breakdown
          </h3>
          <p className="mb-4 text-3xl font-bold text-teal-400">
            {score.score}%{" "}
            <span className="text-sm font-semibold" style={{ color: "var(--c-text-muted)" }}>
              {score.label}
            </span>
          </p>
          {[
            { label: "Ramp completion (40%)", value: score.rampCompletion, max: 40 },
            { label: "Inbox placement 7d (40%)", value: score.inboxPlacementRate, max: 40 },
            { label: "Engagement consistency 14d (20%)", value: score.engagementConsistency, max: 20 },
          ].map((b) => (
            <div key={b.label} className="mb-3">
              <div className="mb-1 flex justify-between text-xs" style={{ color: "var(--c-text-dim)" }}>
                <span>{b.label}</span>
                <span>
                  {b.value}/{b.max}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(148,163,184,0.2)" }}>
                <div
                  className="h-full rounded-full bg-teal-400"
                  style={{ width: `${Math.min(100, (b.value / b.max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <h3 className="mb-3 font-semibold" style={{ color: "var(--c-heading)" }}>
            Ramp curve (daily send limit)
          </h3>
          <div className="flex h-40 items-end gap-0.5">
            {rampCurve.map((r) => (
              <div
                key={r.day}
                title={`Day ${r.day}: ${r.limit}/day`}
                className="flex-1 rounded-t"
                style={{
                  height: `${(r.limit / maxLimit) * 100}%`,
                  background: r.isToday ? "#f59e0b" : "rgba(99,102,241,0.45)",
                  minHeight: 4,
                }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
            Amber bar = today (day {mailbox.rampDay}). Height = allowed daily sends.
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{
          border: "1px solid rgba(245,158,11,0.35)",
          background: "rgba(245,158,11,0.08)",
        }}
      >
        <h3 className="font-semibold text-amber-400">Spam rescue history</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
          This mailbox has had <strong>{spamRescueHistory.last30Days}</strong> emails rescued from
          spam in the last 30 days. Trend:{" "}
          <strong className="capitalize">{spamRescueHistory.trend}</strong>
          {spamRescueHistory.trend === "worsening"
            ? " — spam rate isn't improving as expected; consider pausing and reviewing."
            : spamRescueHistory.trend === "improving"
              ? " — fewer rescues recently is a good sign."
              : "."}
        </p>
      </div>

      <div className="rounded-2xl p-5" style={cardStyle}>
        <h3 className="mb-4 font-semibold" style={{ color: "var(--c-heading)" }}>
          Recent activity
        </h3>
        {events.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
            No warmup events yet for this mailbox.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {events.map((e) => {
              const label = eventLabel(e);
              return (
                <li
                  key={e.id}
                  className="rounded-xl px-3 py-2 text-sm"
                  style={{
                    background: label.rescue ? "rgba(245,158,11,0.12)" : "transparent",
                    border: label.rescue
                      ? "1px solid rgba(245,158,11,0.35)"
                      : "1px solid transparent",
                    color: label.rescue ? "#fbbf24" : "var(--c-text-dim)",
                  }}
                >
                  <span className="mr-2">{label.icon}</span>
                  {label.text}
                  {e.detail && !label.rescue && (
                    <span className="ml-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
                      {e.detail}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
