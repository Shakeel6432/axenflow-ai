import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { assertApiBotGuard, antiScrapeHeaders, getClientIpFromHeaders } from "@/lib/bot-guard";
import { findEmailsPhase1 } from "@/services/email-finder.service";

export const runtime = "nodejs";
export const maxDuration = 30;

const schema = z.object({
  firstName: z.string().trim().max(80).optional().default(""),
  lastName: z.string().trim().max(80).optional().default(""),
  domain: z.string().trim().min(3).max(253),
});

/** Free Email Finder (Phase 1) — no signup. IP + bot guarded. */
export async function POST(req: NextRequest) {
  const bot = assertApiBotGuard(req, { strict: true });
  if (!bot.ok) return bot.response;

  const ip = getClientIpFromHeaders(req.headers);
  const limited = rateLimit(`email-finder:guest:${ip}`, bot.suspicious ? 2 : 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      {
        error:
          "Free Email Finder limit reached for this hour. Sign in for bulk CSV (50/month free), or try again later.",
      },
      { status: 429, headers: antiScrapeHeaders() }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a first name and/or last name plus a company domain." },
      { status: 400, headers: antiScrapeHeaders() }
    );
  }

  try {
    const result = await findEmailsPhase1(parsed.data);
    if (!result.domain.includes(".")) {
      return NextResponse.json(
        { error: "Enter a valid domain like company.com" },
        { status: 400, headers: antiScrapeHeaders() }
      );
    }
    return NextResponse.json(
      { ok: true, remaining: limited.remaining, result },
      {
        headers: antiScrapeHeaders({
          "X-RateLimit-Remaining": String(limited.remaining),
        }),
      }
    );
  } catch (error) {
    console.error("email-finder check error:", error);
    return NextResponse.json(
      { error: "Email Finder failed. Please try again." },
      { status: 500, headers: antiScrapeHeaders() }
    );
  }
}
