import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { assertApiBotGuard, antiScrapeHeaders, getClientIpFromHeaders } from "@/lib/bot-guard";
import { generateOutreachSample } from "@/services/outreach.service";
import type { OutreachKind } from "@/lib/outreach";

export const runtime = "nodejs";

const KIND_SET = new Set<OutreachKind>(["cold_email", "phone_script", "follow_up"]);

const schema = z.object({
  recipientName: z.string().trim().max(80).optional().default(""),
  companyName: z.string().trim().min(1).max(120),
  industry: z.string().trim().min(1).max(80),
  city: z.string().trim().max(80).optional().default(""),
  outreachType: z.enum(["cold_email", "phone_script", "follow_up"]),
  offerContext: z.string().trim().max(280).optional().default(""),
  senderName: z.string().trim().max(80).optional().default(""),
});

/**
 * Free single outreach sample — no signup.
 * Uses the same generateOutreach() path as signed-in batch (not Groq chat).
 * Rate-limited lower than validators because this endpoint is publicly scrapable.
 */
export async function POST(req: NextRequest) {
  const bot = assertApiBotGuard(req, { strict: true });
  if (!bot.ok) return bot.response;

  const ip = getClientIpFromHeaders(req.headers);
  // 3/hour anonymous (validators use 5). LocalStorage also caps at 3/day on client.
  const limited = rateLimit(`outreach-sample:guest:${ip}`, bot.suspicious ? 1 : 3, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      {
        error:
          "Free sample limit reached for this hour. Sign in for chat templates and CSV/Excel batch fill, or try again later.",
      },
      { status: 429, headers: antiScrapeHeaders() }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a company name, industry/role, and outreach type." },
      { status: 400, headers: antiScrapeHeaders() }
    );
  }

  const kind = parsed.data.outreachType;
  if (!KIND_SET.has(kind)) {
    return NextResponse.json(
      { error: "Choose Cold Email, Follow-up Email, or Call Script." },
      { status: 400, headers: antiScrapeHeaders() }
    );
  }

  try {
    const draft = generateOutreachSample(kind, {
      businessName: parsed.data.companyName,
      category: parsed.data.industry,
      city: parsed.data.city || "your area",
      senderName: parsed.data.senderName || "AxenFlow AI",
      recipientName: parsed.data.recipientName || undefined,
      offerContext: parsed.data.offerContext || undefined,
    });

    return NextResponse.json(
      {
        ok: true,
        remaining: limited.remaining,
        kind,
        draft,
        personalizedUsing: {
          recipientName: parsed.data.recipientName || null,
          companyName: parsed.data.companyName,
          industry: parsed.data.industry,
          city: parsed.data.city || null,
          offerContext: parsed.data.offerContext || null,
        },
      },
      {
        headers: antiScrapeHeaders({
          "X-RateLimit-Remaining": String(limited.remaining),
        }),
      }
    );
  } catch (error) {
    console.error("outreach free-sample error:", error);
    return NextResponse.json(
      { error: "Could not generate a sample right now. Please try again." },
      { status: 500, headers: antiScrapeHeaders() }
    );
  }
}
