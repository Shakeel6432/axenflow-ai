import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z
  .object({
    email: z.string().trim().email(),
    token: z.string().trim().min(6, "Enter the security code or use the email link").max(200),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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

    const ip = getClientIp(req);
    const ipLimited = rateLimit(`reset:ip:${ip}`, 10, 60 * 60 * 1000);
    if (!ipLimited.ok) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const emailLimited = rateLimit(`reset:email:${email}`, 8, 60 * 60 * 1000);
    if (!emailLimited.ok) {
      return NextResponse.json({ error: "Too many attempts for this email. Request a new code." }, { status: 429 });
    }

    const rawToken = parsed.data.token.trim();
    const tokenHash = hashToken(rawToken);
    const otpIdentifier = `password-reset-otp:${email}`;
    const linkIdentifier = `password-reset-link:${email}`;
    const legacyIdentifier = `password-reset:${email}`;

    const record =
      (await prisma.verificationToken.findUnique({
        where: { identifier_token: { identifier: otpIdentifier, token: tokenHash } },
      })) ||
      (await prisma.verificationToken.findUnique({
        where: { identifier_token: { identifier: linkIdentifier, token: tokenHash } },
      })) ||
      (await prisma.verificationToken.findUnique({
        where: { identifier_token: { identifier: legacyIdentifier, token: tokenHash } },
      }));

    if (!record || record.expires.getTime() < Date.now()) {
      if (record) {
        await prisma.verificationToken
          .delete({
            where: { identifier_token: { identifier: record.identifier, token: record.token } },
          })
          .catch(() => undefined);
      }
      return NextResponse.json({ error: "Code or link is invalid or has expired. Request a new one." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ error: "Code or link is invalid or has expired. Request a new one." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(parsed.data.password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: { in: [otpIdentifier, linkIdentifier, legacyIdentifier] } },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Password updated. You can sign in now." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Could not reset password. Please try again." }, { status: 500 });
  }
}
