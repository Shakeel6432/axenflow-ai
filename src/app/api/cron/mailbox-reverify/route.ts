import { NextRequest, NextResponse } from "next/server";
import { reverifyStaleMailboxes } from "@/services/mailboxConnection.service";

export const runtime = "nodejs";
export const maxDuration = 120;

/** Weekly cron: re-test stored credentials; delete revoked mailboxes. */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await reverifyStaleMailboxes(7);
  return NextResponse.json({ ok: true, ...result });
}
