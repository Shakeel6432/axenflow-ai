import { prisma, isDatabaseConfigured } from "@/lib/db";
import nodemailer from "nodemailer";
import { rampDailyLimit } from "@/lib/mailbox/warmupEvents";
import { decryptMailboxCredentials, assertTlsRequired } from "@/services/mailboxCredentialVault";
import { warmupMailHeaders } from "@/services/mailboxImap.service";
import { logWarmupEvent } from "@/services/warmupEvent.service";
import {
  processDueRescues,
  scanWarmupPlacementAndQueueRescues,
} from "@/services/mailboxSpamRescue.service";
import { safeErrorMessage } from "@/lib/mailbox/redact";

function utcDateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

/** Advance ramp day once per calendar day for active mailboxes. */
async function advanceRampDays() {
  if (!isDatabaseConfigured()) return 0;
  const mailboxes = await prisma.connectedMailbox.findMany({
    where: { status: "connected", warmupStatus: "active" },
  });
  let advanced = 0;
  const today = utcDateKey();
  for (const m of mailboxes) {
    if (!m.warmupStartedAt) {
      await prisma.connectedMailbox.update({
        where: { id: m.id },
        data: { warmupStartedAt: new Date(), sendsTodayDate: today },
      });
      continue;
    }
    const started = m.warmupStartedAt;
    const days = Math.floor((Date.now() - started.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const rampDay = Math.min(m.totalRampDays, Math.max(1, days));
    const limit = rampDailyLimit(rampDay);
    const resetSends = m.sendsTodayDate !== today;
    await prisma.connectedMailbox.update({
      where: { id: m.id },
      data: {
        rampDay,
        dailySendLimit: limit,
        ...(resetSends ? { sendsToday: 0, sendsTodayDate: today } : {}),
      },
    });
    advanced += 1;
  }
  return advanced;
}

/** Auto-flag mailboxes with >15% spam rate over last 7 days (min 5 deliveries). */
async function applySpamSafetyFlags() {
  if (!isDatabaseConfigured()) return 0;
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const mailboxes = await prisma.connectedMailbox.findMany({
    where: { status: "connected", warmupStatus: "active" },
  });
  let flagged = 0;
  for (const m of mailboxes) {
    const [inbox, spam] = await Promise.all([
      prisma.warmupEvent.count({
        where: { mailboxId: m.id, eventType: "delivered_inbox", createdAt: { gte: since } },
      }),
      prisma.warmupEvent.count({
        where: { mailboxId: m.id, eventType: "delivered_spam", createdAt: { gte: since } },
      }),
    ]);
    const delivered = inbox + spam;
    if (delivered < 5) continue;
    const rate = spam / delivered;
    if (rate > 0.15) {
      await prisma.connectedMailbox.update({
        where: { id: m.id },
        data: {
          warmupStatus: "flagged",
          pauseReason:
            "Auto-flagged: spam landing rate exceeded 15% over the last 7 days. Reduce volume or pause to review.",
          pausedAt: new Date(),
        },
      });
      flagged += 1;
    }
  }
  return flagged;
}

/** Send one warmup email between two active pool mailboxes (if available). */
async function sendPoolWarmupPair(): Promise<number> {
  if (!isDatabaseConfigured()) return 0;
  const today = utcDateKey();
  const pool = await prisma.connectedMailbox.findMany({
    where: { status: "connected", warmupStatus: "active" },
    take: 20,
  });
  if (pool.length < 2) return 0;

  // Pick sender with remaining daily capacity
  const sender = pool.find((m) => {
    const sends = m.sendsTodayDate === today ? m.sendsToday : 0;
    return sends < m.dailySendLimit;
  });
  if (!sender) return 0;
  const recipient = pool.find((m) => m.id !== sender.id);
  if (!recipient) return 0;

  try {
    const creds = decryptMailboxCredentials(
      sender.encryptedCredentials,
      sender.keyId,
      `warmup-send:${sender.id}`
    );
    assertTlsRequired(creds.smtp, "SMTP");
    const transporter = nodemailer.createTransport({
      host: creds.smtp.host,
      port: creds.smtp.port,
      secure: creds.smtp.secure,
      requireTLS: !creds.smtp.secure,
      auth: { user: creds.email, pass: creds.appPassword },
      connectionTimeout: 12_000,
      tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    });

    const messageId = `<warmup-${Date.now()}-${Math.random().toString(36).slice(2)}@axenflowai>`;
    await transporter.sendMail({
      from: creds.email,
      to: recipient.email,
      subject: `Quick note ${new Date().toISOString().slice(0, 10)}`,
      text: "Hi — just checking in. Hope your week is going well.\n\nBest",
      headers: {
        ...warmupMailHeaders(),
        "Message-ID": messageId,
      },
    });
    transporter.close();

    await logWarmupEvent({
      userId: sender.userId,
      mailboxId: sender.id,
      eventType: "sent",
      messageId,
      counterpartMailboxId: recipient.id,
      counterpartEmail: recipient.email,
      detail: `Warmup send to ${recipient.email}`,
    });

    const sends = sender.sendsTodayDate === today ? sender.sendsToday : 0;
    await prisma.connectedMailbox.update({
      where: { id: sender.id },
      data: { sendsToday: sends + 1, sendsTodayDate: today },
    });
    return 1;
  } catch (error) {
    await logWarmupEvent({
      userId: sender.userId,
      mailboxId: sender.id,
      eventType: "bounced",
      counterpartMailboxId: recipient.id,
      counterpartEmail: recipient.email,
      detail: `Send failed: ${safeErrorMessage(error)}`,
    });
    return 0;
  }
}

/** Cron entry: ramp + placement scan + delayed rescues + optional pool send. */
export async function runWarmupTick(opts: { sendPairs?: number } = {}) {
  const rampAdvanced = await advanceRampDays();
  const flagged = await applySpamSafetyFlags();

  let scanned = 0;
  let inboxFound = 0;
  let spamFound = 0;
  let queued = 0;

  if (isDatabaseConfigured()) {
    const active = await prisma.connectedMailbox.findMany({
      where: { status: "connected", warmupStatus: { in: ["active", "flagged"] } },
      select: { id: true, userId: true },
      take: 50,
    });
    for (const m of active) {
      try {
        const r = await scanWarmupPlacementAndQueueRescues({
          mailboxId: m.id,
          userId: m.userId,
        });
        scanned += 1;
        inboxFound += r.inboxFound;
        spamFound += r.spamFound;
        queued += r.queued;
      } catch {
        /* per-mailbox failures already audited */
      }
    }
  }

  const rescues = await processDueRescues(30);

  let sent = 0;
  const pairs = opts.sendPairs ?? 3;
  for (let i = 0; i < pairs; i++) {
    sent += await sendPoolWarmupPair();
  }

  return {
    rampAdvanced,
    flagged,
    scanned,
    inboxFound,
    spamFound,
    queued,
    rescues,
    sent,
  };
}

export async function setMailboxWarmupStatus(
  userId: string,
  mailboxId: string,
  status: "active" | "paused",
  reason?: string
) {
  if (!isDatabaseConfigured()) return { ok: false as const, error: "Database not configured" };
  const mailbox = await prisma.connectedMailbox.findFirst({
    where: { id: mailboxId, userId },
  });
  if (!mailbox) return { ok: false as const, error: "Mailbox not found" };

  await prisma.connectedMailbox.update({
    where: { id: mailboxId },
    data:
      status === "paused"
        ? {
            warmupStatus: "paused",
            pausedAt: new Date(),
            pauseReason: reason || "Paused by user",
          }
        : {
            warmupStatus: "active",
            pausedAt: null,
            pauseReason: null,
          },
  });
  return { ok: true as const };
}
