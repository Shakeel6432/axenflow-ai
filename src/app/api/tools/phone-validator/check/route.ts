import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { assertApiBotGuard, antiScrapeHeaders, getClientIpFromHeaders } from "@/lib/bot-guard";
import { DEFAULT_PHONE_OPTIONS, type PhoneCheckOptions } from "@/lib/validators/phone";
import { phoneDisplayBadge, validateOnePhone } from "@/services/phone-validator.service";
import type { CountryCode } from "libphonenumber-js/max";

export const runtime = "nodejs";
export const maxDuration = 30;

const schema = z.object({
  phone: z.string().trim().min(3).max(40),
  defaultCountry: z.string().max(2).optional(),
});

/** Free single-phone check — no signup. IP rate-limited (same helper as email). */
export async function POST(req: NextRequest) {
  const bot = assertApiBotGuard(req, { strict: true });
  if (!bot.ok) return bot.response;

  const ip = getClientIpFromHeaders(req.headers);
  const limited = rateLimit(`phone-check:guest:${ip}`, bot.suspicious ? 3 : 5, 60 * 60 * 1000);
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
      { error: "Please select a country and enter a valid number format." },
      { status: 400, headers: antiScrapeHeaders() }
    );
  }

  const hasPlus = parsed.data.phone.trim().startsWith("+");
  const country = (parsed.data.defaultCountry || "").toUpperCase();
  if (!hasPlus && !country) {
    return NextResponse.json(
      {
        error:
          "Please select a country and enter a valid number format, or include a +country code.",
      },
      { status: 400, headers: antiScrapeHeaders() }
    );
  }

  try {
    const options: PhoneCheckOptions = {
      ...DEFAULT_PHONE_OPTIONS,
      defaultCountry: (country || "") as CountryCode | "",
      keepOneOnly: true,
      outputFormat: "e164",
    };
    const result = validateOnePhone(parsed.data.phone, options);
    if (!result.original) {
      return NextResponse.json(
        { error: "Please select a country and enter a valid number format." },
        { status: 400, headers: antiScrapeHeaders() }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        remaining: limited.remaining,
        result,
        badge: phoneDisplayBadge(result),
      },
      {
        headers: antiScrapeHeaders({
          "X-RateLimit-Remaining": String(limited.remaining),
        }),
      }
    );
  } catch (error) {
    console.error("phone free-check error:", error);
    return NextResponse.json(
      { error: "Phone check failed. Please try again." },
      { status: 500, headers: antiScrapeHeaders() }
    );
  }
}
