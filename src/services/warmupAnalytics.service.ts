import { prisma, isDatabaseConfigured } from "@/lib/db";
import {
  calculateWarmupScore,
  type WarmupScoreBreakdown,
} from "@/lib/mailbox/warmupEvents";
import {
  activeDaysCount,
  countEventsSince,
  dailyTrend,
  listRecentEvents,
  mailboxDeliveryCounts,
} from "@/services/warmupEvent.service";

function startOfUtcDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export type MailboxAnalyticsRow = {
  id: string;
  email: string;
  provider: string;
  displayName: string | null;
  warmupStatus: string;
  status: string;
  rampDay: number;
  totalRampDays: number;
  pauseReason: string | null;
  pausedAt: string | null;
  sentToday: number;
  receivedToday: number;
  inboxRate7d: number;
  spamRescues7d: number;
  spamRate7d: number;
  score: WarmupScoreBreakdown;
  warning?: string | null;
};

export async function getMailboxScore(mailbox: {
  id: string;
  rampDay: number;
  totalRampDays: number;
}): Promise<WarmupScoreBreakdown> {
  const since7 = daysAgo(7);
  const since14 = daysAgo(14);
  const counts = await mailboxDeliveryCounts(mailbox.id, since7);
  const active = await activeDaysCount(mailbox.id, since14);
  return calculateWarmupScore({
    rampDay: mailbox.rampDay,
    totalRampDays: mailbox.totalRampDays,
    deliveredInbox7d: counts.inbox,
    deliveredSpam7d: counts.spam,
    activeDays14d: active,
  });
}

export async function getWarmupDashboard(userId: string) {
  if (!isDatabaseConfigured()) {
    return emptyDashboard();
  }

  const mailboxes = await prisma.connectedMailbox.findMany({
    where: { userId, status: { not: "disconnected" } },
    orderBy: { createdAt: "desc" },
  });

  const today = startOfUtcDay();
  const week = daysAgo(7);
  const month = daysAgo(30);

  const [
    sentToday,
    sentWeek,
    sentMonth,
    inboxWeek,
    spamWeek,
    rescuedWeek,
    receivedToday,
    receivedWeek,
    receivedMonth,
  ] = await Promise.all([
    countEventsSince(userId, ["sent"], today),
    countEventsSince(userId, ["sent"], week),
    countEventsSince(userId, ["sent"], month),
    countEventsSince(userId, ["delivered_inbox"], week),
    countEventsSince(userId, ["delivered_spam"], week),
    countEventsSince(userId, ["rescued"], week),
    countEventsSince(userId, ["delivered_inbox", "delivered_spam"], today),
    countEventsSince(userId, ["delivered_inbox", "delivered_spam"], week),
    countEventsSince(userId, ["delivered_inbox", "delivered_spam"], month),
  ]);

  const rows: MailboxAnalyticsRow[] = [];
  for (const m of mailboxes) {
    const score = await getMailboxScore(m);
    const counts7 = await mailboxDeliveryCounts(m.id, week);
    const delivered = counts7.inbox + counts7.spam;
    const inboxRate7d = delivered === 0 ? 0 : Math.round((counts7.inbox / delivered) * 100);
    const spamRate7d = delivered === 0 ? 0 : Math.round((counts7.spam / delivered) * 100);

    const [sentTodayMb, receivedTodayMb] = await Promise.all([
      countEventsSince(userId, ["sent"], today, m.id),
      countEventsSince(userId, ["delivered_inbox", "delivered_spam"], today, m.id),
    ]);

    let warning: string | null = null;
    if (m.warmupStatus === "paused") {
      warning = m.pauseReason || "This mailbox is paused.";
    } else if (m.warmupStatus === "flagged") {
      warning = m.pauseReason || "This mailbox is flagged for review.";
    } else if (delivered >= 5 && spamRate7d > 15) {
      warning =
        "This mailbox is landing in spam more than expected. This can happen with new domains or if sending volume increased too fast. Consider reducing volume temporarily.";
    }

    rows.push({
      id: m.id,
      email: m.email,
      provider: m.provider,
      displayName: m.displayName,
      warmupStatus: m.warmupStatus,
      status: m.status,
      rampDay: m.rampDay,
      totalRampDays: m.totalRampDays,
      pauseReason: m.pauseReason,
      pausedAt: m.pausedAt?.toISOString() || null,
      sentToday: sentTodayMb,
      receivedToday: receivedTodayMb,
      inboxRate7d,
      spamRescues7d: counts7.rescued,
      spamRate7d,
      score,
      warning,
    });
  }

  const avgScore =
    rows.length === 0
      ? 0
      : Math.round(rows.reduce((s, r) => s + r.score.score, 0) / rows.length);

  const fullyWarmed = rows.filter((r) => r.score.score >= 90).length;
  const ramping = rows.filter((r) => r.score.score < 90).length;
  const deliveredWeek = inboxWeek + spamWeek;
  const inboxPlacementRate =
    deliveredWeek === 0 ? 0 : Math.round((inboxWeek / deliveredWeek) * 100);

  return {
    summary: {
      overallScore: avgScore,
      mailboxCount: rows.length,
      fullyWarmed,
      ramping,
      sentToday,
      sentWeek,
      sentMonth,
      receivedToday,
      receivedWeek,
      receivedMonth,
      inboxPlacementRate,
      spamRescuesWeek: rescuedWeek,
    },
    mailboxes: rows,
  };
}

function emptyDashboard() {
  return {
    summary: {
      overallScore: 0,
      mailboxCount: 0,
      fullyWarmed: 0,
      ramping: 0,
      sentToday: 0,
      sentWeek: 0,
      sentMonth: 0,
      receivedToday: 0,
      receivedWeek: 0,
      receivedMonth: 0,
      inboxPlacementRate: 0,
      spamRescuesWeek: 0,
    },
    mailboxes: [] as MailboxAnalyticsRow[],
  };
}

export async function getMailboxDetail(userId: string, mailboxId: string) {
  if (!isDatabaseConfigured()) return null;
  const mailbox = await prisma.connectedMailbox.findFirst({
    where: { id: mailboxId, userId },
  });
  if (!mailbox) return null;

  const score = await getMailboxScore(mailbox);
  const week = daysAgo(7);
  const month = daysAgo(30);
  const counts7 = await mailboxDeliveryCounts(mailboxId, week);
  const counts30 = await mailboxDeliveryCounts(mailboxId, month);
  const events = await listRecentEvents(userId, { mailboxId, limit: 30 });
  const trend30 = await dailyTrend(userId, 30, mailboxId);

  const rescuesFirst15 = trend30
    .slice(0, 15)
    .reduce((s, d) => s + d.rescued, 0);
  const rescuesLast15 = trend30.slice(15).reduce((s, d) => s + d.rescued, 0);

  let rescueTrend: "improving" | "stable" | "worsening" = "stable";
  if (rescuesLast15 > rescuesFirst15 + 2) rescueTrend = "worsening";
  else if (rescuesLast15 + 2 < rescuesFirst15) rescueTrend = "improving";

  const delivered = counts7.inbox + counts7.spam;
  const spamRate7d = delivered === 0 ? 0 : Math.round((counts7.spam / delivered) * 100);

  let warning: string | null = null;
  if (mailbox.warmupStatus === "paused" || mailbox.warmupStatus === "flagged") {
    warning = mailbox.pauseReason || `Mailbox is ${mailbox.warmupStatus}.`;
  } else if (delivered >= 5 && spamRate7d > 15) {
    warning =
      "This mailbox is landing in spam more than expected. This can happen with new domains or if sending volume increased too fast. Consider reducing volume temporarily.";
  } else if (rescueTrend === "worsening" && counts30.rescued >= 3) {
    warning =
      "This mailbox's spam rate isn't improving as expected — you may want to pause and review.";
  }

  const rampCurve = Array.from({ length: mailbox.totalRampDays }, (_, i) => {
    const day = i + 1;
    return {
      day,
      limit: day <= 3 ? 3 : day <= 7 ? 5 : day <= 14 ? 10 : day <= 21 ? 15 : 25,
      isToday: day === mailbox.rampDay,
    };
  });

  return {
    mailbox: {
      id: mailbox.id,
      email: mailbox.email,
      provider: mailbox.provider,
      displayName: mailbox.displayName,
      warmupStatus: mailbox.warmupStatus,
      rampDay: mailbox.rampDay,
      totalRampDays: mailbox.totalRampDays,
      pauseReason: mailbox.pauseReason,
      pausedAt: mailbox.pausedAt?.toISOString() || null,
    },
    score,
    rampCurve,
    spamRescueHistory: {
      last30Days: counts30.rescued,
      trend: rescueTrend,
    },
    spamRate7d,
    warning,
    events,
  };
}

export async function buildExportCsv(userId: string, days = 30): Promise<string> {
  const dash = await getWarmupDashboard(userId);
  const since = daysAgo(days);
  const header = [
    "email",
    "provider",
    "warmup_score",
    "score_label",
    "ramp_day",
    "total_ramp_days",
    "warmup_status",
    "sent_today",
    "received_today",
    "inbox_rate_7d",
    "spam_rescues_7d",
    "spam_rate_7d",
  ].join(",");

  const lines = dash.mailboxes.map((m) =>
    [
      m.email,
      m.provider,
      m.score.score,
      `"${m.score.label}"`,
      m.rampDay,
      m.totalRampDays,
      m.warmupStatus,
      m.sentToday,
      m.receivedToday,
      m.inboxRate7d,
      m.spamRescues7d,
      m.spamRate7d,
    ].join(",")
  );

  return [
    `# AxenFlowAI Email Warmup Report`,
    `# Generated ${new Date().toISOString()}`,
    `# Range last ${days} days (inbox/spam metrics are 7d windows where noted)`,
    `# Since ${since.toISOString()}`,
    header,
    ...lines,
  ].join("\n");
}
