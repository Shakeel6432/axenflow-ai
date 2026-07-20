import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { emailVerifyIdentifier, hashToken } from "@/lib/email-verification";

const bodySchema = z.object({
  email: z.string().trim().email(),
  token: z.string().trim().min(20).max(200),
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

    const ip = getClientIp(req);
    const limited = rateLimit(`verify-email:ip:${ip}`, 20, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid confirmation link." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const identifier = emailVerifyIdentifier(email);
    const tokenHash = hashToken(parsed.data.token.trim());

    const record = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier, token: tokenHash } },
    });

    if (!record || record.expires.getTime() < Date.now()) {
      if (record) {
        await prisma.verificationToken
          .delete({ where: { identifier_token: { identifier, token: tokenHash } } })
          .catch(() => undefined);
      }
      return NextResponse.json(
        { error: "Confirmation link is invalid or has expired. Sign up again or request a new email." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, emailVerified: true } });
    if (!user) {
      return NextResponse.json({ error: "Confirmation link is invalid or has expired." }, { status: 400 });
    }

    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    await prisma.verificationToken.deleteMany({ where: { identifier } });

    return NextResponse.json({
      success: true,
      message: "Email confirmed. You can sign in now.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Could not confirm email. Please try again." }, { status: 500 });
  }
}
