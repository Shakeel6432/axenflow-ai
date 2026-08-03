import { prisma, isDatabaseConfigured } from "@/lib/db";
import {
  PROVIDER_PRESETS,
  type MailboxCredentialPayload,
  type MailboxProvider,
} from "@/lib/mailbox/constants";
import {
  encryptMailboxCredentials,
  isVaultConfigured,
} from "@/services/mailboxCredentialVault";
import { testImapLogin } from "@/services/mailboxImap.service";
import { testMailboxConnection } from "@/services/mailboxTransport.service";
import { logMailboxAudit } from "@/services/mailboxAudit.service";

export type ConnectMailboxInput = {
  userId: string;
  provider: MailboxProvider;
  email: string;
  appPassword: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
  displayName?: string;
};

function buildCredentialPayload(input: ConnectMailboxInput): MailboxCredentialPayload {
  const email = input.email.trim().toLowerCase();
  const appPassword = input.appPassword.replace(/\s/g, "");

  if (input.provider === "custom") {
    if (!input.smtpHost || !input.imapHost || !input.smtpPort || !input.imapPort) {
      throw new Error("Custom domain requires SMTP and IMAP host/port settings.");
    }
    return {
      email,
      appPassword,
      smtp: {
        host: input.smtpHost.trim(),
        port: input.smtpPort,
        secure: Boolean(input.smtpSecure),
      },
      imap: {
        host: input.imapHost.trim(),
        port: input.imapPort,
        secure: Boolean(input.imapSecure ?? true),
      },
    };
  }

  const preset = PROVIDER_PRESETS[input.provider];
  return {
    email,
    appPassword,
    smtp: { ...preset.smtp },
    imap: { ...preset.imap },
  };
}

export async function testConnectMailbox(input: ConnectMailboxInput) {
  if (!isVaultConfigured()) {
    return {
      ok: false as const,
      error: "Mailbox vault is not configured on the server. Contact support.",
    };
  }

  let creds: MailboxCredentialPayload;
  try {
    creds = buildCredentialPayload(input);
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Invalid connection settings",
    };
  }

  const result = await testMailboxConnection(creds, testImapLogin);
  return { ...result, provider: input.provider, email: creds.email };
}

export async function saveConnectedMailbox(input: ConnectMailboxInput) {
  const test = await testConnectMailbox(input);
  if (!test.ok) {
    return { ok: false as const, test };
  }

  if (!isDatabaseConfigured()) {
    return { ok: false as const, error: "Database not configured" };
  }

  const creds = buildCredentialPayload(input);
  const { blob, keyId } = encryptMailboxCredentials(creds);

  const mailbox = await prisma.connectedMailbox.upsert({
    where: {
      userId_email: { userId: input.userId, email: creds.email },
    },
    create: {
      userId: input.userId,
      email: creds.email,
      provider: input.provider,
      displayName: input.displayName?.trim() || null,
      encryptedCredentials: blob,
      keyId,
      status: "connected",
      lastVerifiedAt: new Date(),
      lastAuthError: null,
    },
    update: {
      provider: input.provider,
      displayName: input.displayName?.trim() || null,
      encryptedCredentials: blob,
      keyId,
      status: "connected",
      lastVerifiedAt: new Date(),
      lastAuthError: null,
    },
  });

  await logMailboxAudit({
    userId: input.userId,
    mailboxId: mailbox.id,
    action: "connect",
    detail: `Connected ${input.provider} mailbox after live SMTP+IMAP test`,
  });

  return {
    ok: true as const,
    mailbox: {
      id: mailbox.id,
      email: mailbox.email,
      provider: mailbox.provider,
      status: mailbox.status,
      lastVerifiedAt: mailbox.lastVerifiedAt,
    },
  };
}

export async function listUserMailboxes(userId: string) {
  if (!isDatabaseConfigured()) return [];
  return prisma.connectedMailbox.findMany({
    where: { userId, status: { not: "disconnected" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      provider: true,
      displayName: true,
      status: true,
      lastVerifiedAt: true,
      lastAuthError: true,
      createdAt: true,
    },
  });
}

/** Hard delete credential record (not a soft flag). */
export async function disconnectMailbox(userId: string, mailboxId: string) {
  if (!isDatabaseConfigured()) {
    return { ok: false as const, error: "Database not configured" };
  }

  const mailbox = await prisma.connectedMailbox.findFirst({
    where: { id: mailboxId, userId },
  });
  if (!mailbox) {
    return { ok: false as const, error: "Mailbox not found" };
  }

  await logMailboxAudit({
    userId,
    mailboxId,
    action: "disconnect",
    detail: `User disconnected ${mailbox.provider} mailbox; credential record deleted`,
  });

  await prisma.connectedMailbox.delete({ where: { id: mailboxId } });

  return {
    ok: true as const,
    provider: mailbox.provider as MailboxProvider,
    email: mailbox.email,
  };
}

export async function reverifyMailbox(mailboxId: string, userId?: string) {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database not configured" };

  const mailbox = await prisma.connectedMailbox.findFirst({
    where: userId ? { id: mailboxId, userId } : { id: mailboxId },
  });
  if (!mailbox) return { ok: false, error: "Mailbox not found" };

  const { decryptMailboxCredentials } = await import("@/services/mailboxCredentialVault");
  let creds: MailboxCredentialPayload;
  try {
    creds = decryptMailboxCredentials(
      mailbox.encryptedCredentials,
      mailbox.keyId,
      `reverify:${mailbox.id}`
    );
  } catch {
    await prisma.connectedMailbox.delete({ where: { id: mailbox.id } });
    await logMailboxAudit({
      userId: mailbox.userId,
      mailboxId: mailbox.id,
      action: "auth_revoked",
      detail: "Credential decrypt failed during reverify; record deleted",
    });
    return { ok: false, revoked: true, error: "Credentials invalid; mailbox disconnected" };
  }

  const test = await testMailboxConnection(creds, testImapLogin);
  if (test.ok) {
    await prisma.connectedMailbox.update({
      where: { id: mailbox.id },
      data: {
        status: "connected",
        lastVerifiedAt: new Date(),
        lastAuthError: null,
      },
    });
    return { ok: true };
  }

  await prisma.connectedMailbox.delete({ where: { id: mailbox.id } });
  await logMailboxAudit({
    userId: mailbox.userId,
    mailboxId: mailbox.id,
    action: "auth_revoked",
    detail: test.error || "Auth failed during scheduled reverify; record deleted",
  });

  return {
    ok: false,
    revoked: true,
    error: test.error || "App Password no longer valid; mailbox disconnected",
  };
}

export async function reverifyStaleMailboxes(maxAgeDays = 7) {
  if (!isDatabaseConfigured()) return { checked: 0, revoked: 0 };

  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  const stale = await prisma.connectedMailbox.findMany({
    where: {
      status: "connected",
      OR: [{ lastVerifiedAt: null }, { lastVerifiedAt: { lt: cutoff } }],
    },
    select: { id: true },
  });

  let revoked = 0;
  for (const row of stale) {
    const out = await reverifyMailbox(row.id);
    if (!out.ok && out.revoked) revoked += 1;
  }
  return { checked: stale.length, revoked };
}
