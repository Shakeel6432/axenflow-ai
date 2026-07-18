import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const to = process.env.CONTACT_TO?.trim() || user;

  return { host, port, user, pass, to };
}

export function isSmtpConfigured() {
  const { host, user, pass, to } = getSmtpConfig();
  return Boolean(host && user && pass && to);
}

export function getMailTransporter(): Transporter {
  const { host, port, user, pass } = getSmtpConfig();
  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: { user, pass },
    });
  }

  return transporter;
}

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export async function sendContactEmail(opts: {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
  replyToName?: string;
  attachments?: MailAttachment[];
}) {
  const { user, to } = getSmtpConfig();
  if (!to || !user) {
    throw new Error("CONTACT_TO / SMTP_USER missing.");
  }

  const mailer = getMailTransporter();
  try {
    return await mailer.sendMail({
      from: `"AxenFlow AI Website" <${user}>`,
      to,
      replyTo: opts.replyToName ? `"${opts.replyToName}" <${opts.replyTo}>` : opts.replyTo,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      attachments: opts.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
  } catch (error) {
    const err = error as { code?: string; responseCode?: number; message?: string };
    if (err.code === "EAUTH" || err.responseCode === 535) {
      throw new Error(
        "SMTP login failed. Check SMTP_USER / SMTP_PASS (Zoho app password) in .env.local and restart the server."
      );
    }
    throw error;
  }
}
