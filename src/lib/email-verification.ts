import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { isSmtpConfigured, sendMail } from "@/lib/smtp";
import { siteConfig } from "@/lib/constants";
import { buildVerifyEmail } from "@/lib/email-templates/verify-email";

export const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
export const EMAIL_VERIFY_HOURS = 24;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function emailVerifyIdentifier(email: string) {
  return `email-verify:${email.toLowerCase()}`;
}

export function resolveAppBaseUrl(req?: Request): string {
  if (req) {
    const forwarded = req.headers.get("x-forwarded-host");
    const host = (forwarded || req.headers.get("host") || "").split(",")[0]?.trim().toLowerCase() || "";
    if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
      const proto = req.headers.get("x-forwarded-proto") || "http";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }
  return (process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || siteConfig.url).replace(/\/$/, "");
}

/** Create verification token and email the confirm link. */
export async function sendEmailVerification(opts: {
  email: string;
  name: string;
  req?: Request;
}) {
  if (!isSmtpConfigured()) {
    throw new Error("Email service is not configured.");
  }

  const email = opts.email.toLowerCase();
  const identifier = emailVerifyIdentifier(email);
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const rawToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashToken(rawToken),
      expires,
    },
  });

  const baseUrl = resolveAppBaseUrl(opts.req);
  const verifyUrl = `${baseUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;
  const mail = buildVerifyEmail({
    name: opts.name.trim() || "there",
    email,
    verifyUrl,
    expiresHours: EMAIL_VERIFY_HOURS,
    supportEmail: "sales@axenflowai.com",
  });

  await sendMail({
    to: email,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
}
