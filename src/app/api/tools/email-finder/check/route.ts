import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { assertApiBotGuard, antiScrapeHeaders, getClientIpFromHeaders } from "@/lib/bot-guard";
import { getSessionUser, userIdFromSession } from "@/lib/auth-guards";
import {
  consumeMonthlyFinderUsage,
  findEmailsPhase1,
  findEmailsWithVerification,
} from "@/services/email-finder.service";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  firstName: z.string().trim().max(80).optional().default(""),
  lastName: z.string().trim().max(80).optional().default(""),
  domain: z.string().trim().min(3).max(253),
});

/**
 * Free Email Finder check.
 * Guests: Phase 1 (pattern + MX) + upgrade nudge for SMTP/API verify.
 * Signed-in: Phase 2 (top candidates via verification provider) + monthly quota.
 */
export async function POST(req: NextRequest) {
  const bot = assertApiBotGuard(req, { strict: true });
  if (!bot.ok) return bot.response;

  const session = await getSessionUser();
  const userId = userIdFromSession(session);
  const isAuthed = Boolean(userId);

  const ip = getClientIpFromHeaders(req.headers);
  const limited = rateLimit(
    isAuthed ? `email-finder:user:${userId}` : `email-finder:guest:${ip}`,
    bot.suspicious ? 2 : isAuthed ? 30 : 5,
    60 * 60 * 1000
  );
  if (!limited.ok) {
    return NextResponse.json(
      {
        error: isAuthed
          ? "Hourly Email Finder limit reached. Try again later."
          : "Free Email Finder limit reached for this hour. Sign in for SMTP-level verification and bulk CSV (50/month free), or try again later.",
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
    if (isAuthed && userId) {
      const usage = await consumeMonthlyFinderUsage(userId, 1);
      if (!usage.ok) {
        return NextResponse.json(
          {
            error: `Free monthly Email Finder quota reached (${usage.limit}/month). Upgrade or wait until next month.`,
            remaining: usage.remaining,
            limit: usage.limit,
          },
          { status: 402, headers: antiScrapeHeaders() }
        );
      }

      const result = await findEmailsWithVerification({
        ...parsed.data,
        userId,
        bulk: false,
      });

      if (!result.domain.includes(".")) {
        return NextResponse.json(
          { error: "Enter a valid domain like company.com" },
          { status: 400, headers: antiScrapeHeaders() }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          remaining: Math.min(limited.remaining, usage.remaining),
          monthlyRemaining: usage.remaining,
          monthlyLimit: usage.limit,
          result,
        },
        {
          headers: antiScrapeHeaders({
            "X-RateLimit-Remaining": String(limited.remaining),
          }),
        }
      );
    }

    const result = await findEmailsPhase1(parsed.data);
    if (!result.domain.includes(".")) {
      return NextResponse.json(
        { error: "Enter a valid domain like company.com" },
        { status: 400, headers: antiScrapeHeaders() }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        remaining: limited.remaining,
        result: {
          ...result,
          smtpUpgradeAvailable: true,
        },
      },
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
