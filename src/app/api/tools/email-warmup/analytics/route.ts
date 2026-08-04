import { NextRequest, NextResponse } from "next/server";
import { requireUser, userIdFromSession } from "@/lib/auth-guards";
import {
  buildExportCsv,
  getMailboxDetail,
  getWarmupDashboard,
} from "@/services/warmupAnalytics.service";
import { dailyTrend } from "@/services/warmupEvent.service";
import { setMailboxWarmupStatus } from "@/services/warmupEngine.service";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await requireUser();
  const userId = userIdFromSession(session);
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "overview";
  const mailboxId = searchParams.get("mailboxId") || undefined;
  const days = Math.min(90, Math.max(7, Number(searchParams.get("days") || 30)));

  if (view === "export") {
    const csv = await buildExportCsv(userId, days);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="warmup-report-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  if (view === "trend") {
    const trend = await dailyTrend(userId, days, mailboxId);
    return NextResponse.json({ ok: true, days, mailboxId: mailboxId || null, trend });
  }

  if (view === "mailbox" && mailboxId) {
    const detail = await getMailboxDetail(userId, mailboxId);
    if (!detail) {
      return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, detail });
  }

  const dashboard = await getWarmupDashboard(userId);
  return NextResponse.json({ ok: true, ...dashboard });
}

export async function PATCH(req: NextRequest) {
  const session = await requireUser();
  const userId = userIdFromSession(session);
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const mailboxId = typeof body?.mailboxId === "string" ? body.mailboxId : "";
  const status = body?.status === "paused" ? "paused" : body?.status === "active" ? "active" : null;
  if (!mailboxId || !status) {
    return NextResponse.json({ error: "mailboxId and status (active|paused) required" }, { status: 400 });
  }

  const out = await setMailboxWarmupStatus(
    userId,
    mailboxId,
    status,
    typeof body?.reason === "string" ? body.reason : undefined
  );
  if (!out.ok) {
    return NextResponse.json({ error: out.error }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
