import { NextRequest, NextResponse } from "next/server";
import { runWarmupTick } from "@/services/warmupEngine.service";

export const runtime = "nodejs";
export const maxDuration = 120;

/** Warmup engine tick: ramp, IMAP placement scan, delayed spam rescues, pool sends. */
async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runWarmupTick({ sendPairs: 5 });
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
