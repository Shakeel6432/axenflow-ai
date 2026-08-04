import { prisma, isDatabaseConfigured } from "@/lib/db";
import type { WarmupEventType } from "@/lib/mailbox/warmupEvents";

export async function logWarmupEvent(input: {
  userId: string;
  mailboxId: string;
  eventType: WarmupEventType;
  messageId?: string | null;
  counterpartMailboxId?: string | null;
  counterpartEmail?: string | null;
  detail?: string | null;
  createdAt?: Date;
}) {
  if (!isDatabaseConfigured()) return null;
  return prisma.warmupEvent.create({
    data: {
      userId: input.userId,
      mailboxId: input.mailboxId,
      eventType: input.eventType,
      messageId: input.messageId || null,
      counterpartMailboxId: input.counterpartMailboxId || null,
      counterpartEmail: input.counterpartEmail || null,
      detail: input.detail || null,
      createdAt: input.createdAt,
    },
  });
}

export async function countEventsSince(
  userId: string,
  eventTypes: WarmupEventType[],
  since: Date,
  mailboxId?: string
) {
  if (!isDatabaseConfigured()) return 0;
  return prisma.warmupEvent.count({
    where: {
      userId,
      eventType: { in: eventTypes },
      createdAt: { gte: since },
      ...(mailboxId ? { mailboxId } : {}),
    },
  });
}

export async function listRecentEvents(
  userId: string,
  opts: { mailboxId?: string; limit?: number } = {}
) {
  if (!isDatabaseConfigured()) return [];
  return prisma.warmupEvent.findMany({
    where: {
      userId,
      ...(opts.mailboxId ? { mailboxId: opts.mailboxId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts.limit ?? 30,
    select: {
      id: true,
      mailboxId: true,
      eventType: true,
      messageId: true,
      counterpartEmail: true,
      counterpartMailboxId: true,
      detail: true,
      createdAt: true,
    },
  });
}

export async function dailyTrend(
  userId: string,
  days: number,
  mailboxId?: string
): Promise<
  Array<{
    date: string;
    sent: number;
    received: number;
    deliveredInbox: number;
    deliveredSpam: number;
    rescued: number;
    inboxRate: number;
  }>
> {
  if (!isDatabaseConfigured()) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const events = await prisma.warmupEvent.findMany({
    where: {
      userId,
      createdAt: { gte: since },
      ...(mailboxId ? { mailboxId } : {}),
      eventType: {
        in: ["sent", "delivered_inbox", "delivered_spam", "rescued", "opened", "replied"],
      },
    },
    select: { eventType: true, createdAt: true },
  });

  const map = new Map<
    string,
    {
      sent: number;
      received: number;
      deliveredInbox: number;
      deliveredSpam: number;
      rescued: number;
    }
  >();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, {
      sent: 0,
      received: 0,
      deliveredInbox: 0,
      deliveredSpam: 0,
      rescued: 0,
    });
  }

  for (const e of events) {
    const key = e.createdAt.toISOString().slice(0, 10);
    const row = map.get(key);
    if (!row) continue;
    if (e.eventType === "sent") row.sent += 1;
    if (e.eventType === "delivered_inbox") {
      row.deliveredInbox += 1;
      row.received += 1;
    }
    if (e.eventType === "delivered_spam") {
      row.deliveredSpam += 1;
      row.received += 1;
    }
    if (e.eventType === "rescued") row.rescued += 1;
    if (e.eventType === "opened" || e.eventType === "replied") {
      // engagement counts as received-side activity for volume chart
    }
  }

  return [...map.entries()].map(([date, v]) => {
    const delivered = v.deliveredInbox + v.deliveredSpam;
    return {
      date,
      ...v,
      inboxRate: delivered === 0 ? 0 : Math.round((v.deliveredInbox / delivered) * 100),
    };
  });
}

export async function activeDaysCount(
  mailboxId: string,
  since: Date
): Promise<number> {
  if (!isDatabaseConfigured()) return 0;
  const events = await prisma.warmupEvent.findMany({
    where: { mailboxId, createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const days = new Set(events.map((e) => e.createdAt.toISOString().slice(0, 10)));
  return days.size;
}

export async function mailboxDeliveryCounts(mailboxId: string, since: Date) {
  if (!isDatabaseConfigured()) return { inbox: 0, spam: 0, rescued: 0 };
  const [inbox, spam, rescued] = await Promise.all([
    prisma.warmupEvent.count({
      where: { mailboxId, eventType: "delivered_inbox", createdAt: { gte: since } },
    }),
    prisma.warmupEvent.count({
      where: { mailboxId, eventType: "delivered_spam", createdAt: { gte: since } },
    }),
    prisma.warmupEvent.count({
      where: { mailboxId, eventType: "rescued", createdAt: { gte: since } },
    }),
  ]);
  return { inbox, spam, rescued };
}
