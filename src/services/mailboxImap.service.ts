import { ImapFlow } from "imapflow";
import {
  WARMUP_HEADER,
  WARMUP_HEADER_VALUE,
  type MailboxCredentialPayload,
} from "@/lib/mailbox/constants";
import { assertTlsRequired, decryptMailboxCredentials } from "@/services/mailboxCredentialVault";
import { mapAuthError } from "@/services/mailboxTransport.service";
import { safeErrorMessage } from "@/lib/mailbox/redact";
import { logMailboxAudit } from "@/services/mailboxAudit.service";

function createImapClient(creds: MailboxCredentialPayload) {
  assertTlsRequired(creds.imap, "IMAP");
  return new ImapFlow({
    host: creds.imap.host,
    port: creds.imap.port,
    secure: creds.imap.secure,
    auth: {
      user: creds.email,
      pass: creds.appPassword,
    },
    logger: false,
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    connectionTimeout: 12_000,
  });
}

export async function testImapLogin(creds: MailboxCredentialPayload): Promise<{ ok: boolean; error?: string }> {
  const client = createImapClient(creds);
  try {
    await client.connect();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: mapAuthError(error) };
  } finally {
    try {
      await client.logout();
    } catch {
      /* ignore */
    }
  }
}

/**
 * PRIVACY GUARD (auditable): IMAP access is limited to warmup-tagged messages ONLY.
 * This function searches exclusively for X-Warmup-Tool: axenflowai-internal.
 * It must NEVER list, read, move, or index untagged user email.
 */
export async function findTaggedWarmupMessageUids(input: {
  encryptedBlob: string;
  keyId: string;
  userId: string;
  mailboxId: string;
}): Promise<{ uids: string[]; scanned: number }> {
  const creds = decryptMailboxCredentials(
    input.encryptedBlob,
    input.keyId,
    `imap-scan:${input.mailboxId}`
  );

  const client = createImapClient(creds);
  const uids: string[] = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      // ONLY search for our warmup header. Do not broaden this query.
      const searchResult = await client.search({
        header: { [WARMUP_HEADER]: WARMUP_HEADER_VALUE },
      });

      if (searchResult !== false) {
        for (const uid of searchResult) {
          uids.push(String(uid));
        }
      }
    } finally {
      lock.release();
    }

    await logMailboxAudit({
      userId: input.userId,
      mailboxId: input.mailboxId,
      action: "imap_scan",
      detail: `Tagged-only scan found ${uids.length} message(s)`,
      messageUid: uids[0] || null,
    });

    return { uids, scanned: uids.length };
  } catch (error) {
    await logMailboxAudit({
      userId: input.userId,
      mailboxId: input.mailboxId,
      action: "imap_scan",
      detail: `Tagged-only scan failed: ${safeErrorMessage(error)}`,
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

/** Warmup send helper: always sets the internal warmup header on outbound mail. */
export function warmupMailHeaders(): Record<string, string> {
  return { [WARMUP_HEADER]: WARMUP_HEADER_VALUE };
}
