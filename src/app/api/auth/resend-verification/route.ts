import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { isSmtpConfigured } from "@/lib/smtp";
import { sendEmailVerification } from "@/lib/email-verification";

const bodySchema = z.object({
  email: z.string().trim().email(),
});

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
      return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
    }

    const ip = getClientIp(req);
    const limited = rateLimit(`resend-verify:ip:${ip}`, 5, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const emailLimited = rateLimit(`resend-verify:email:${email}`, 3, 60 * 60 * 1000);
    if (!emailLimited.ok) {
      return NextResponse.json({ error: "Too many emails for this address. Try again later." }, { status: 429 });
    }

    const okMessage = {
      success: true as const,
      message: "If an unverified account exists for that email, a new confirmation link has been sent.",
    };

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, password: true, emailVerified: true },
    });

    if (!user?.password || user.emailVerified) {
      return NextResponse.json(okMessage);
    }

    await sendEmailVerification({
      email,
      name: user.name || "there",
      req,
    });

    return NextResponse.json(okMessage);
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Could not resend confirmation email." }, { status: 500 });
  }
}
