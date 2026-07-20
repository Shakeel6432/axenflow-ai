import { NextResponse } from "next/server";
import { createHash, randomBytes, randomInt } from "node:crypto";
import { z } from "zod";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { isSmtpConfigured, sendMail } from "@/lib/smtp";
import { siteConfig } from "@/lib/constants";
import { buildPasswordResetEmail } from "@/lib/email-templates/password-reset";

const bodySchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(200),
});

const OTP_TTL_MS = 15 * 60 * 1000;
const OTP_TTL_MINUTES = 15;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "anonymous";
  return req.headers.get("x-real-ip")?.trim() || "anonymous";
}

function resolveBaseUrl(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-host");
  const host = (forwarded || req.headers.get("host") || "").split(",")[0]?.trim().toLowerCase() || "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    const proto = req.headers.get("x-forwarded-proto") || "http";
    return `${proto}://${host}`.replace(/\/$/, "");
  }
  return (process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || siteConfig.url).replace(/\/$/, "");
}

export async function POST(req: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    }

    if (!isSmtpConfigured()) {
      return NextResponse.json(
        { error: "Email service is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const ip = getClientIp(req);
    const ipLimited = rateLimit(`forgot:ip:${ip}`, 5, 60 * 60 * 1000);
    if (!ipLimited.ok) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid email" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const emailLimited = rateLimit(`forgot:email:${email}`, 3, 60 * 60 * 1000);
    if (!emailLimited.ok) {
      return NextResponse.json({ error: "Too many reset requests for this email. Try again later." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    const okMessage = {
      success: true as const,
      message: "If an account exists for that email, a security code has been sent. Check your inbox (and spam).",
    };

    // Only password accounts can reset; keep response generic for privacy
    if (!user?.password) {
      return NextResponse.json(okMessage);
    }

    const otpIdentifier = `password-reset-otp:${email}`;
    const linkIdentifier = `password-reset-link:${email}`;
    await prisma.verificationToken.deleteMany({
      where: { identifier: { in: [otpIdentifier, linkIdentifier, `password-reset:${email}`] } },
    });

    const otp = String(randomInt(100000, 1000000));
    const linkToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + OTP_TTL_MS);

    await prisma.verificationToken.createMany({
      data: [
        { identifier: otpIdentifier, token: hashToken(otp), expires },
        { identifier: linkIdentifier, token: hashToken(linkToken), expires },
      ],
    });

    const baseUrl = resolveBaseUrl(req);
    // Long opaque token in URL — never put the 6-digit OTP in the query string
    const resetUrl = `${baseUrl}/reset-password?token=${linkToken}&email=${encodeURIComponent(email)}`;
    const name = user.name?.trim() || "there";
    const requestedAt = new Date().toUTCString();
    const mail = buildPasswordResetEmail({
      name,
      email,
      otp,
      resetUrl,
      expiresMinutes: OTP_TTL_MINUTES,
      requestedAt,
      requestIp: ip === "anonymous" ? undefined : ip,
      supportEmail: "sales@axenflowai.com",
    });

    try {
      await sendMail({
        to: email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });
      return NextResponse.json(okMessage);
    } catch (mailError) {
      console.error("Forgot password SMTP error:", mailError);
      await prisma.verificationToken
        .deleteMany({ where: { identifier: { in: [otpIdentifier, linkIdentifier] } } })
        .catch(() => undefined);
      return NextResponse.json(
        { error: "Could not send email right now. Please try again later or contact support." },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Could not process reset request. Please try again." }, { status: 500 });
  }
}
