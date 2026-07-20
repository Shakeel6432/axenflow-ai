import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { assertApiBotGuard, antiScrapeHeaders, getClientIpFromHeaders } from "@/lib/bot-guard";
import { redactBusinessList } from "@/lib/redact-business";
import { searchBusinesses } from "@/services/search.service";

/** Query-string booleans: only "true"/"1" are true. "false" must stay false (z.coerce.boolean treats any non-empty string as true). */
const queryBoolean = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return undefined;
}, z.boolean().optional());

const schema = z.object({
  keyword: z.string().optional(),
  mainCategory: z.string().optional(),
  category: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  hasWebsite: queryBoolean,
  hasPhone: queryBoolean,
  hasEmail: queryBoolean,
  sort: z.enum(["newest", "rating", "reviews", "alphabetical"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
});

export async function GET(req: NextRequest) {
  const bot = assertApiBotGuard(req, { strict: true });
  if (!bot.ok) return bot.response;

  const ip = getClientIpFromHeaders(req.headers);
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const limited = userId
    ? rateLimit(`search:user:${userId}`, 120, 60_000)
    : rateLimit(`search:guest:${ip}`, bot.suspicious ? 10 : 20, 60_000);

  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: antiScrapeHeaders() }
    );
  }

  const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search parameters", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const page = userId ? parsed.data.page : 1;
    const pageSize = userId ? Math.min(parsed.data.pageSize ?? 20, 50) : Math.min(parsed.data.pageSize ?? 3, 3);

    if (!userId && (parsed.data.page ?? 1) > 1) {
      return NextResponse.json(
        { error: "Sign in to browse more results." },
        { status: 401, headers: antiScrapeHeaders() }
      );
    }

    const data = await searchBusinesses({
      ...parsed.data,
      page,
      pageSize,
      userId: userId || undefined,
    });

    const results = userId ? data.results : redactBusinessList(data.results);

    return NextResponse.json(
      { ...data, results },
      {
        headers: antiScrapeHeaders({
          "X-RateLimit-Remaining": String(limited.remaining),
        }),
      }
    );
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed. Check database configuration." }, { status: 500 });
  }
}
