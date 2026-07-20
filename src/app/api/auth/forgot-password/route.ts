import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { z } from "zod";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { isSmtpConfigured, sendMail } from "@/lib/smtp";
import { siteConfig } from "@/lib/constants";

const bodySchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(200),
});

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "anonymous";
  return req.headers.get("x-real-ip")?.trim() || "anonymous";
}

export async function POST(req: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    }
    if (!isSmtpConfigured()) {
      return NextResponse.json({ error: "Email is not configured. Please contact support." }, { status: 503 });
    }

    const ip = getClientIp(req);
    const limited = rateLimit(`forgot:${ip}`, 5, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid email" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    // Always return success to avoid account enumeration
    const okMessage = {
      success: true,
      message: "If an account exists for that email, a reset link has been sent.",
    };

    if (!user?.password) {
      return NextResponse.json(okMessage);
    }

    const identifier = `password-reset:${email}`;
    await prisma.verificationToken.deleteMany({ where: { identifier } });

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: { identifier, token: tokenHash, expires },
    });

    const baseUrl = (process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || siteConfig.url).replace(/\/$/, "");
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    const name = user.name?.trim() || "there";
    await sendMail({
      to: email,
      subject: "Reset your AxenFlow AI password",
      text: `Hi ${name},\n\nReset your password using this link (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n\n— AxenFlow AI`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
          <p>Hi ${name},</p>
          <p>We received a request to reset your AxenFlow AI password.</p>
          <p><a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600">Reset password</a></p>
          <p style="font-size:13px;color:#64748b">This link expires in 1 hour. If you did not request a reset, ignore this email.</p>
          <p style="font-size:12px;color:#94a3b8;word-break:break-all">${resetUrl}</p>
        </div>
      `,
    });

    return NextResponse.json(okMessage);
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Could not send reset email. Please try again." }, { status: 500 });
  }
}
