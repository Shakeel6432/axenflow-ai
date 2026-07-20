import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(128),
});

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "anonymous";
  return req.headers.get("x-real-ip")?.trim() || "anonymous";
}

/** Used by Sign In UI when Auth.js collapses custom errors to CredentialsSignin. */
export async function POST(req: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ code: "UNAVAILABLE" }, { status: 503 });
    }

    const ip = getClientIp(req);
    const limited = rateLimit(`email-status:ip:${ip}`, 30, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ code: "RATE_LIMIT" }, { status: 429 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ code: "INVALID" });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true, emailVerified: true },
    });

    if (!user?.password) {
      return NextResponse.json({ code: "INVALID" });
    }

    const valid = await bcrypt.compare(parsed.data.password, user.password);
    if (!valid) {
      return NextResponse.json({ code: "INVALID" });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ code: "EMAIL_NOT_VERIFIED" });
    }

    return NextResponse.json({ code: "OK" });
  } catch (error) {
    console.error("Email status error:", error);
    return NextResponse.json({ code: "ERROR" }, { status: 500 });
  }
}
