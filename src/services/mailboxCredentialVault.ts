/**
 * Sole module allowed to encrypt/decrypt mailbox app passwords.
 * All SMTP/IMAP code must obtain credentials through decryptMailboxCredentials().
 *
 * Envelope encryption: per-record DEK (AES-256-GCM) wrapped by a master key provider.
 * Master key is loaded from MAILBOX_VAULT_MASTER_KEY (Vercel encrypted env). Architecture
 * is KMS-ready: swap getMasterKeyProvider() to AWS KMS / GCP KMS when provisioned.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { MailboxCredentialPayload } from "@/lib/mailbox/constants";
import { safeErrorMessage } from "@/lib/mailbox/redact";

const ALGO = "aes-256-gcm";
const DEK_BYTES = 32;
const IV_BYTES = 12;

type EnvelopeBlob = {
  v: 1;
  keyId: string;
  wrappedDek: string;
  dekIv: string;
  dekTag: string;
  ciphertext: string;
  iv: string;
  tag: string;
};

export interface MasterKeyProvider {
  readonly keyId: string;
  wrapDataKey(dek: Buffer): { wrapped: Buffer; iv: Buffer; tag: Buffer };
  unwrapDataKey(wrapped: Buffer, iv: Buffer, tag: Buffer): Buffer;
}

/** Production: store MAILBOX_VAULT_MASTER_KEY in Vercel encrypted env (32-byte base64). */
class EnvMasterKeyProvider implements MasterKeyProvider {
  readonly keyId = "env-v1";
  private readonly key: Buffer;

  constructor() {
    const raw = process.env.MAILBOX_VAULT_MASTER_KEY?.trim();
    if (!raw) {
      throw new Error("MAILBOX_VAULT_MASTER_KEY is not configured");
    }
    const key = Buffer.from(raw, "base64");
    if (key.length !== 32) {
      throw new Error("MAILBOX_VAULT_MASTER_KEY must be 32 bytes base64-encoded");
    }
    this.key = key;
  }

  wrapDataKey(dek: Buffer) {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGO, this.key, iv);
    const wrapped = Buffer.concat([cipher.update(dek), cipher.final()]);
    return { wrapped, iv, tag: cipher.getAuthTag() };
  }

  unwrapDataKey(wrapped: Buffer, iv: Buffer, tag: Buffer) {
    const decipher = createDecipheriv(ALGO, this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(wrapped), decipher.final()]);
  }
}

let masterProvider: MasterKeyProvider | null = null;

function getMasterKeyProvider(): MasterKeyProvider {
  if (!masterProvider) masterProvider = new EnvMasterKeyProvider();
  return masterProvider;
}

export function isVaultConfigured(): boolean {
  return Boolean(process.env.MAILBOX_VAULT_MASTER_KEY?.trim());
}

export function encryptMailboxCredentials(payload: MailboxCredentialPayload): {
  blob: string;
  keyId: string;
} {
  const provider = getMasterKeyProvider();
  const dek = randomBytes(DEK_BYTES);
  const dataIv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, dek, dataIv);
  const plaintext = JSON.stringify(payload);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const dataTag = cipher.getAuthTag();

  const wrapped = provider.wrapDataKey(dek);
  const envelope: EnvelopeBlob = {
    v: 1,
    keyId: provider.keyId,
    wrappedDek: wrapped.wrapped.toString("base64"),
    dekIv: wrapped.iv.toString("base64"),
    dekTag: wrapped.tag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    iv: dataIv.toString("base64"),
    tag: dataTag.toString("base64"),
  };

  return { blob: JSON.stringify(envelope), keyId: provider.keyId };
}

const decryptFailureCounts = new Map<string, { count: number; resetAt: number }>();

function recordDecryptFailure(context: string) {
  const now = Date.now();
  const bucket = decryptFailureCounts.get(context);
  if (!bucket || now > bucket.resetAt) {
    decryptFailureCounts.set(context, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return 1;
  }
  bucket.count += 1;
  if (bucket.count >= 5) {
    console.warn("[mailbox-vault] repeated decrypt failures", {
      context,
      count: bucket.count,
    });
    const hook = process.env.MAILBOX_VAULT_ALERT_WEBHOOK_URL?.trim();
    if (hook) {
      void fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `[mailbox-vault] ${bucket.count} decrypt failures for ${context} in 15m`,
        }),
      }).catch(() => undefined);
    }
  }
  return bucket.count;
}

/** Only export for mailbox transport/IMAP services. Do not import elsewhere. */
export function decryptMailboxCredentials(
  encryptedBlob: string,
  expectedKeyId: string,
  context = "unknown"
): MailboxCredentialPayload {
  try {
    const envelope = JSON.parse(encryptedBlob) as EnvelopeBlob;
    if (envelope.v !== 1) throw new Error("Unsupported envelope version");
    if (envelope.keyId !== expectedKeyId) throw new Error("Key id mismatch");

    const provider = getMasterKeyProvider();
    const dek = provider.unwrapDataKey(
      Buffer.from(envelope.wrappedDek, "base64"),
      Buffer.from(envelope.dekIv, "base64"),
      Buffer.from(envelope.dekTag, "base64")
    );

    const decipher = createDecipheriv(
      ALGO,
      dek,
      Buffer.from(envelope.iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
    const json = Buffer.concat([
      decipher.update(Buffer.from(envelope.ciphertext, "base64")),
      decipher.final(),
    ]).toString("utf8");

    const parsed = JSON.parse(json) as MailboxCredentialPayload;
    if (!parsed.email || !parsed.appPassword || !parsed.smtp?.host || !parsed.imap?.host) {
      throw new Error("Invalid credential payload shape");
    }
    return parsed;
  } catch (error) {
    recordDecryptFailure(context);
    console.error("[mailbox-vault] decrypt failed", {
      context,
      error: safeErrorMessage(error),
      blobLength: encryptedBlob?.length ?? 0,
    });
    throw new Error("Could not decrypt mailbox credentials");
  }
}

export function assertTlsRequired(server: { secure: boolean; port: number }, label: string) {
  const implicitTls = server.secure || server.port === 465 || server.port === 993;
  if (!implicitTls && server.port !== 587) {
    throw new Error(`${label}: only TLS/SSL connections are allowed (port ${server.port} rejected)`);
  }
}

/** Dev-only helper to validate vault round-trip without persisting secrets in logs. */
export function selfTestVaultRoundTrip(sample: MailboxCredentialPayload): boolean {
  const { blob, keyId } = encryptMailboxCredentials(sample);
  const out = decryptMailboxCredentials(blob, keyId, "self-test");
  return out.email === sample.email && out.appPassword === sample.appPassword;
}
