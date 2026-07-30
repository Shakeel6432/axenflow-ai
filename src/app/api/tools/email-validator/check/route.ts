import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { assertApiBotGuard, antiScrapeHeaders, getClientIpFromHeaders } from "@/lib/bot-guard";
import { DEFAULT_EMAIL_OPTIONS } from "@/lib/validators/email";
import {
  bounceRiskLabel,
  emailDisplayBadge,
  validateOneEmail,
} from "@/services/email-validator.service";

export const runtime = "nodejs";
export const maxDuration = 30;

const schema = z.object({
  email: z.string().trim().min(3).max(254),
});

/** Free single-email check — no signup. IP rate-limited. */
export async function POST(req: NextRequest) {
  const bot = assertApiBotGuard(req, { strict: true });
  if (!bot.ok) return bot.response;

  const ip = getClientIpFromHeaders(req.headers);
  const limited = rateLimit(`email-check:guest:${ip}`, bot.suspicious ? 3 : 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      {
        error:
          "Free check limit reached for this hour. Sign in for bulk CSV validation, or try again later.",
      },
      { status: 429, headers: antiScrapeHeaders() }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email format before checking." },
      { status: 400, headers: antiScrapeHeaders() }
    );
  }

  try {
    const results = await validateOneEmail(parsed.data.email, {
      ...DEFAULT_EMAIL_OPTIONS,
      keepOneOnly: true,
    });
    const result = results[0];
    if (!result?.email) {
      return NextResponse.json(
        { error: "Please enter a valid email format before checking." },
        { status: 400, headers: antiScrapeHeaders() }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        remaining: limited.remaining,
        result,
        badge: emailDisplayBadge(result),
        bounceRisk: bounceRiskLabel(result.hardBounceEstimate),
      },
      {
        headers: antiScrapeHeaders({
          "X-RateLimit-Remaining": String(limited.remaining),
        }),
      }
    );
  } catch (error) {
    console.error("email free-check error:", error);
    return NextResponse.json(
      { error: "Email check failed. Please try again." },
      { status: 500, headers: antiScrapeHeaders() }
    );
  }
}
