import { prisma, isDatabaseConfigured } from "@/lib/db";
import { redactForLog } from "@/lib/mailbox/redact";

export type MailboxAuditAction =
  | "connect"
  | "disconnect"
  | "smtp_test"
  | "imap_test"
  | "send"
  | "imap_scan"
  | "auth_revoked";

export async function logMailboxAudit(input: {
  userId: string;
  mailboxId?: string | null;
  action: MailboxAuditAction;
  messageUid?: string | null;
  detail?: string | null;
}) {
  const detail = input.detail ? String(redactForLog(input.detail)) : null;
  if (!isDatabaseConfigured()) {
    console.info("[mailbox-audit]", {
      userId: input.userId,
      mailboxId: input.mailboxId,
      action: input.action,
      messageUid: input.messageUid,
      detail,
    });
    return;
  }
  try {
    await prisma.mailboxAuditLog.create({
      data: {
        userId: input.userId,
        mailboxId: input.mailboxId || null,
        action: input.action,
        messageUid: input.messageUid || null,
        detail,
      },
    });
  } catch (error) {
    console.error("[mailbox-audit] write failed", { action: input.action });
  }
}

export async function listMailboxAudit(userId: string, mailboxId: string, limit = 50) {
  if (!isDatabaseConfigured()) return [];
  return prisma.mailboxAuditLog.findMany({
    where: { userId, mailboxId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      messageUid: true,
      detail: true,
      createdAt: true,
    },
  });
}
