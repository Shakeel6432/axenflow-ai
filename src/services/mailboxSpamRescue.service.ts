/**
 * Spam-to-inbox rescue for warmup-tagged messages only.
 *
 * Flow when a tagged message is found in Spam/Junk:
 * 1. Log `delivered_spam` immediately (before move) for accurate reporting
 * 2. Schedule a delayed MOVE to INBOX (5–30 minutes) via WarmupPendingRescue
 * 3. On execute: IMAP MOVE/COPY+delete, then log `rescued`
 *
 * OUT OF SCOPE (v1): Gmail Primary vs Promotions/Social tab categorization.
 * Those are Inbox categories, not Spam. Tab "rescue" needs Gmail API labels,
 * not standard IMAP Spam→Inbox MOVE — deferred as a future enhancement.
 */
import { ImapFlow } from "imapflow";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import {
  WARMUP_HEADER,
  WARMUP_HEADER_VALUE,
  type MailboxCredentialPayload,
} from "@/lib/mailbox/constants";
import { SPAM_FOLDER_CANDIDATES } from "@/lib/mailbox/warmupEvents";
import { decryptMailboxCredentials, assertTlsRequired } from "@/services/mailboxCredentialVault";
import { logWarmupEvent } from "@/services/warmupEvent.service";
import { logMailboxAudit } from "@/services/mailboxAudit.service";
import { safeErrorMessage } from "@/lib/mailbox/redact";

function createImapClient(creds: MailboxCredentialPayload) {
  assertTlsRequired(creds.imap, "IMAP");
  return new ImapFlow({
    host: creds.imap.host,
    port: creds.imap.port,
    secure: creds.imap.secure,
    auth: { user: creds.email, pass: creds.appPassword },
    logger: false,
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    connectionTimeout: 15_000,
  });
}

function randomRescueDelayMs() {
  const min = 5 * 60 * 1000;
  const max = 30 * 60 * 1000;
  return min + Math.floor(Math.random() * (max - min));
}

async function resolveSpamFolders(client: ImapFlow): Promise<string[]> {
  const list = await client.list();
  const names = list.map((b) => b.path);
  const found: string[] = [];
  for (const candidate of SPAM_FOLDER_CANDIDATES) {
    if (names.includes(candidate)) found.push(candidate);
  }
  // Also pick any mailbox with \Junk flag
  for (const box of list) {
    if (box.specialUse === "\\Junk" && !found.includes(box.path)) {
      found.push(box.path);
    }
  }
  return found;
}

/**
 * Scan Spam/Junk for warmup-tagged messages ONLY.
 * Logs delivered_spam + queues delayed rescue. Also logs delivered_inbox for
 * tagged messages found already in INBOX (placement proof without reading bodies).
 */
export async function scanWarmupPlacementAndQueueRescues(input: {
  mailboxId: string;
  userId: string;
}): Promise<{ inboxFound: number; spamFound: number; queued: number }> {
  if (!isDatabaseConfigured()) return { inboxFound: 0, spamFound: 0, queued: 0 };

  const mailbox = await prisma.connectedMailbox.findFirst({
    where: { id: input.mailboxId, userId: input.userId },
  });
  if (!mailbox || mailbox.warmupStatus === "paused") {
    return { inboxFound: 0, spamFound: 0, queued: 0 };
  }

  const creds = decryptMailboxCredentials(
    mailbox.encryptedCredentials,
    mailbox.keyId,
    `spam-scan:${mailbox.id}`
  );

  const client = createImapClient(creds);
  let inboxFound = 0;
  let spamFound = 0;
  let queued = 0;

  try {
    await client.connect();

    // INBOX: tagged messages → delivered_inbox (idempotent-ish: one event per uid/day not enforced; keep simple)
    {
      const lock = await client.getMailboxLock("INBOX");
      try {
        const searchResult = await client.search({
          header: { [WARMUP_HEADER]: WARMUP_HEADER_VALUE },
          seen: false,
        });
        const uids = searchResult === false ? [] : searchResult;
        for (const uid of uids.slice(0, 40)) {
          const uidStr = String(uid);
          const already = await prisma.warmupEvent.findFirst({
            where: {
              mailboxId: mailbox.id,
              messageId: uidStr,
              eventType: { in: ["delivered_inbox", "delivered_spam", "rescued"] },
            },
          });
          if (already) continue;
          await logWarmupEvent({
            userId: input.userId,
            mailboxId: mailbox.id,
            eventType: "delivered_inbox",
            messageId: uidStr,
            detail: "Warmup-tagged message detected in INBOX",
          });
          inboxFound += 1;
        }
      } finally {
        lock.release();
      }
    }

    const spamFolders = await resolveSpamFolders(client);
    for (const folder of spamFolders) {
      let lock;
      try {
        lock = await client.getMailboxLock(folder);
      } catch {
        continue;
      }
      try {
        // PRIVACY GUARD: ONLY search warmup-tagged headers in Spam/Junk.
        const searchResult = await client.search({
          header: { [WARMUP_HEADER]: WARMUP_HEADER_VALUE },
        });
        const uids = searchResult === false ? [] : searchResult;

        for (const uid of uids.slice(0, 40)) {
          const uidStr = String(uid);
          const alreadySpam = await prisma.warmupEvent.findFirst({
            where: {
              mailboxId: mailbox.id,
              messageId: uidStr,
              eventType: "delivered_spam",
            },
          });
          if (!alreadySpam) {
            // 1) Log delivered_spam BEFORE moving (critical for accurate reporting)
            await logWarmupEvent({
              userId: input.userId,
              mailboxId: mailbox.id,
              eventType: "delivered_spam",
              messageId: uidStr,
              detail: `Warmup-tagged message found in ${folder}`,
            });
            spamFound += 1;
          }

          const existingPending = await prisma.warmupPendingRescue.findUnique({
            where: {
              mailboxId_messageUid_spamFolder: {
                mailboxId: mailbox.id,
                messageUid: uidStr,
                spamFolder: folder,
              },
            },
          });
          if (existingPending) continue;

          // 2) Schedule delayed rescue (5–30 min) — not instant
          await prisma.warmupPendingRescue.create({
            data: {
              userId: input.userId,
              mailboxId: mailbox.id,
              messageUid: uidStr,
              spamFolder: folder,
              messageId: uidStr,
              executeAt: new Date(Date.now() + randomRescueDelayMs()),
            },
          });
          queued += 1;
        }
      } finally {
        lock.release();
      }
    }

    await logMailboxAudit({
      userId: input.userId,
      mailboxId: mailbox.id,
      action: "imap_scan",
      detail: `Placement scan: inbox=${inboxFound} spam=${spamFound} queued_rescues=${queued}`,
    });

    return { inboxFound, spamFound, queued };
  } catch (error) {
    await logMailboxAudit({
      userId: input.userId,
      mailboxId: input.mailboxId,
      action: "imap_scan",
      detail: `Placement scan failed: ${safeErrorMessage(error)}`,
    });
    throw error;
  } finally {
    try {
      await client.logout();
    } catch {
      /* ignore */
    }
  }
}

/** Execute due pending rescues: MOVE to INBOX then log `rescued`. */
export async function processDueRescues(limit = 20): Promise<{ processed: number; failed: number }> {
  if (!isDatabaseConfigured()) return { processed: 0, failed: 0 };

  const due = await prisma.warmupPendingRescue.findMany({
    where: { executeAt: { lte: new Date() } },
    take: limit,
    orderBy: { executeAt: "asc" },
    include: { mailbox: true },
  });

  let processed = 0;
  let failed = 0;

  for (const job of due) {
    try {
      const creds = decryptMailboxCredentials(
        job.mailbox.encryptedCredentials,
        job.mailbox.keyId,
        `rescue:${job.mailboxId}`
      );
      const client = createImapClient(creds);
      try {
        await client.connect();
        const lock = await client.getMailboxLock(job.spamFolder);
        try {
          const uid = Number(job.messageUid);
          // Prefer native MOVE; fall back to COPY + flag Deleted
          try {
            await client.messageMove(uid, "INBOX", { uid: true });
          } catch {
            await client.messageCopy(uid, "INBOX", { uid: true });
            await client.messageFlagsAdd(uid, ["\\Deleted"], { uid: true });
            // ImapFlow purges \Deleted on mailbox close / next SELECT; no separate expunge API
          }
        } finally {
          lock.release();
        }
      } finally {
        try {
          await client.logout();
        } catch {
          /* ignore */
        }
      }

      // 3) Log rescued after successful move
      await logWarmupEvent({
        userId: job.userId,
        mailboxId: job.mailboxId,
        eventType: "rescued",
        messageId: job.messageId || job.messageUid,
        detail: `Moved from ${job.spamFolder} to INBOX`,
      });

      await prisma.warmupPendingRescue.delete({ where: { id: job.id } });
      processed += 1;
    } catch (error) {
      failed += 1;
      await logMailboxAudit({
        userId: job.userId,
        mailboxId: job.mailboxId,
        action: "imap_scan",
        detail: `Rescue failed for uid ${job.messageUid}: ${safeErrorMessage(error)}`,
      });
      // Retry later — bump executeAt by 15 min
      await prisma.warmupPendingRescue.update({
        where: { id: job.id },
        data: { executeAt: new Date(Date.now() + 15 * 60 * 1000) },
      });
    }
  }

  return { processed, failed };
}
