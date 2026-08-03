import nodemailer from "nodemailer";
import type { MailboxCredentialPayload } from "@/lib/mailbox/constants";
import { assertTlsRequired } from "@/services/mailboxCredentialVault";
import { safeErrorMessage } from "@/lib/mailbox/redact";

export type ConnectionTestResult = {
  ok: boolean;
  smtpOk: boolean;
  imapOk: boolean;
  error?: string;
  smtpError?: string;
  imapError?: string;
};

export function mapAuthError(error: unknown): string {
  const msg = safeErrorMessage(error).toLowerCase();
  if (msg.includes("invalid login") || msg.includes("authentication failed") || msg.includes("535")) {
    return "Authentication rejected. Check your App Password (not your regular password) and that 2-Step Verification is enabled.";
  }
  if (msg.includes("certificate") || msg.includes("ssl") || msg.includes("tls")) {
    return "TLS/SSL connection failed. We only allow encrypted connections.";
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return "Connection timed out. Check host/port or firewall settings.";
  }
  if (msg.includes("econnrefused") || msg.includes("enotfound")) {
    return "Could not reach the mail server. Check host name and port.";
  }
  if (msg.includes("app password") || msg.includes("2-step") || msg.includes("two-step")) {
    return "This account may require 2-Step Verification and an App Password before mail access works.";
  }
  return "Connection failed. Double-check App Password, host, and port settings.";
}

export async function testSmtpLogin(creds: MailboxCredentialPayload): Promise<{ ok: boolean; error?: string }> {
  assertTlsRequired(creds.smtp, "SMTP");
  const transporter = nodemailer.createTransport({
    host: creds.smtp.host,
    port: creds.smtp.port,
    secure: creds.smtp.secure,
    requireTLS: !creds.smtp.secure,
    auth: {
      user: creds.email,
      pass: creds.appPassword,
    },
    connectionTimeout: 12_000,
    greetingTimeout: 12_000,
    socketTimeout: 12_000,
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  });

  try {
    await transporter.verify();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: mapAuthError(error) };
  } finally {
    transporter.close();
  }
}

export async function testMailboxConnection(
  creds: MailboxCredentialPayload,
  imapTest: (c: MailboxCredentialPayload) => Promise<{ ok: boolean; error?: string }>
): Promise<ConnectionTestResult> {
  const smtp = await testSmtpLogin(creds);
  const imap = await imapTest(creds);

  if (smtp.ok && imap.ok) {
    return { ok: true, smtpOk: true, imapOk: true };
  }

  return {
    ok: false,
    smtpOk: smtp.ok,
    imapOk: imap.ok,
    smtpError: smtp.error,
    imapError: imap.error,
    error: !smtp.ok ? smtp.error : imap.error,
  };
}
