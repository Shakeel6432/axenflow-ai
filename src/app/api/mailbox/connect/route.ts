import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, userIdFromSession } from "@/lib/auth-guards";
import { rateLimit, peekRateLimit } from "@/lib/rate-limit";
import { getClientIpFromHeaders } from "@/lib/bot-guard";
import {
  saveConnectedMailbox,
  testConnectMailbox,
} from "@/services/mailboxConnection.service";
import { isVaultConfigured } from "@/services/mailboxCredentialVault";
import { logMailboxAudit } from "@/services/mailboxAudit.service";

export const runtime = "nodejs";
export const maxDuration = 45;

const connectSchema = z.object({
  provider: z.enum(["gmail", "outlook", "custom"]),
  email: z.string().trim().email().max(254),
  appPassword: z.string().trim().min(8).max(128),
  displayName: z.string().trim().max(120).optional(),
  smtpHost: z.string().trim().max(253).optional(),
  smtpPort: z.coerce.number().int().min(1).max(65535).optional(),
  smtpSecure: z.boolean().optional(),
  imapHost: z.string().trim().max(253).optional(),
  imapPort: z.coerce.number().int().min(1).max(65535).optional(),
  imapSecure: z.boolean().optional(),
});

function assertHttps(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") return true;
  const proto = req.headers.get("x-forwarded-proto");
  return proto === "https";
}

function failedLimitKeys(userId: string, ip: string) {
  return [`mailbox:connect:fail:user:${userId}`, `mailbox:connect:fail:ip:${ip}`];
}

export async function POST(req: NextRequest) {
  if (!assertHttps(req)) {
    return NextResponse.json({ error: "HTTPS required" }, { status: 403 });
  }

  const session = await requireUser();
  const userId = userIdFromSession(session);
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!isVaultConfigured()) {
    return NextResponse.json(
      { error: "Mailbox connection is not available yet. Server vault key missing." },
      { status: 503 }
    );
  }

  const ip = getClientIpFromHeaders(req.headers);
  for (const key of failedLimitKeys(userId, ip)) {
    const blocked = peekRateLimit(key, 8);
    if (!blocked.ok) {
      return NextResponse.json(
        { error: "Too many failed connection attempts. Try again in an hour." },
        { status: 429 }
      );
    }
  }

  const body = await req.json().catch(() => null);
  const parsed = connectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid connection form data." }, { status: 400 });
  }

  const out = await saveConnectedMailbox({ userId, ...parsed.data });
  if (!out.ok) {
    for (const key of failedLimitKeys(userId, ip)) {
      rateLimit(key, 8, 60 * 60 * 1000);
    }
    const test = "test" in out ? out.test : undefined;
    await logMailboxAudit({
      userId,
      action: "connect",
      detail: test?.error || ("error" in out ? out.error : undefined) || "Connection test failed",
    });
    return NextResponse.json(
      {
        ok: false,
        error: test?.error || ("error" in out ? out.error : undefined) || "Connection test failed",
        smtpOk: test && "smtpOk" in test ? test.smtpOk : undefined,
        imapOk: test && "imapOk" in test ? test.imapOk : undefined,
        smtpError: test && "smtpError" in test ? test.smtpError : undefined,
        imapError: test && "imapError" in test ? test.imapError : undefined,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, mailbox: out.mailbox });
}

/** Live test only (does not save credentials). */
export async function PUT(req: NextRequest) {
  if (!assertHttps(req)) {
    return NextResponse.json({ error: "HTTPS required" }, { status: 403 });
  }

  const session = await requireUser();
  const userId = userIdFromSession(session);
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = connectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid connection form data." }, { status: 400 });
  }

  const test = await testConnectMailbox({ userId, ...parsed.data });
  if (!test.ok) {
    const ip = getClientIpFromHeaders(req.headers);
    for (const key of failedLimitKeys(userId, ip)) {
      rateLimit(key, 8, 60 * 60 * 1000);
    }
  }

  return NextResponse.json(test);
}

export async function GET() {
  const session = await requireUser();
  const userId = userIdFromSession(session);
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { listUserMailboxes } = await import("@/services/mailboxConnection.service");
  const mailboxes = await listUserMailboxes(userId);
  return NextResponse.json({ ok: true, mailboxes, vaultConfigured: isVaultConfigured() });
}
