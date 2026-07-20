import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { isSmtpConfigured } from "@/lib/smtp";
import { sendEmailVerification } from "@/lib/email-verification";

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().trim().email("Enter a valid email").max(200),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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
      return NextResponse.json(
        { error: "Email service is not configured. Please try again later." },
        { status: 503 }
      );
    }

    const ip = getClientIp(req);
    const limited = rateLimit(`signup:ip:${ip}`, 8, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Too many signup attempts. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const emailLimited = rateLimit(`signup:email:${email}`, 5, 60 * 60 * 1000);
    if (!emailLimited.ok) {
      return NextResponse.json({ error: "Too many signup attempts for this email." }, { status: 429 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.emailVerified) {
      return NextResponse.json(
        { error: "Unable to create account with that email. Try signing in or resetting your password." },
        { status: 409 }
      );
    }

    // Unverified account: refresh password/name and resend confirmation
    if (existing && !existing.emailVerified) {
      const passwordHash = await bcrypt.hash(parsed.data.password, 12);
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: parsed.data.name,
          password: passwordHash,
        },
      });

      try {
        await sendEmailVerification({
          email,
          name: parsed.data.name,
          req,
        });
      } catch (mailError) {
        console.error("Signup resend verification email error:", mailError);
        return NextResponse.json(
          { error: "Account saved, but confirmation email could not be sent. Try again shortly." },
          { status: 503 }
        );
      }

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message: "Check your email and confirm your address before signing in.",
      });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        password: passwordHash,
        emailVerified: null,
      },
      select: { id: true, name: true, email: true },
    });

    try {
      await sendEmailVerification({
        email: user.email!,
        name: user.name || parsed.data.name,
        req,
      });
    } catch (mailError) {
      console.error("Signup verification email error:", mailError);
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
      return NextResponse.json(
        { error: "Could not send confirmation email. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      message: "Account created. Check your email and confirm your address before signing in.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
