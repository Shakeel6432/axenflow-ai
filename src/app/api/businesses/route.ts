import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { assertApiBotGuard, antiScrapeHeaders, getClientIpFromHeaders } from "@/lib/bot-guard";
import { redactBusinessList } from "@/lib/redact-business";

export async function GET(req: NextRequest) {
  const bot = assertApiBotGuard(req, { strict: true });
  if (!bot.ok) return bot.response;

  const ip = getClientIpFromHeaders(req.headers);
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const limited = userId
    ? rateLimit(`businesses:user:${userId}`, 120, 60_000)
    : rateLimit(`businesses:guest:${ip}`, bot.suspicious ? 8 : 15, 60_000);

  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: antiScrapeHeaders() });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ results: [], total: 0, page: 1, pageSize: 20 }, { headers: antiScrapeHeaders() });
  }

  const requestedPage = Math.max(1, Number(req.nextUrl.searchParams.get("page") || 1));
  const requestedSize = Math.max(1, Number(req.nextUrl.searchParams.get("pageSize") || 20));
  const page = userId ? requestedPage : 1;
  const pageSize = userId ? Math.min(50, requestedSize) : Math.min(3, requestedSize);
  const slug = req.nextUrl.searchParams.get("slug");

  if (!userId && requestedPage > 1) {
    return NextResponse.json(
      { error: "Sign in to browse more results." },
      { status: 401, headers: antiScrapeHeaders() }
    );
  }

  try {
    if (slug) {
      if (!userId) {
        return NextResponse.json(
          { error: "Sign in to view business details." },
          { status: 401, headers: antiScrapeHeaders() }
        );
      }
      const business = await prisma.business.findFirst({ where: { slug, status: "APPROVED" } });
      if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(business, { headers: antiScrapeHeaders() });
    }

    const [total, results] = await Promise.all([
      prisma.business.count({ where: { status: "APPROVED" } }),
      prisma.business.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const safeResults = userId ? results : redactBusinessList(results);

    return NextResponse.json(
      {
        results: safeResults,
        total,
        page,
        pageSize,
        totalPages: userId ? Math.ceil(total / pageSize) || 0 : 1,
      },
      { headers: antiScrapeHeaders({ "X-RateLimit-Remaining": String(limited.remaining) }) }
    );
  } catch (error) {
    console.error("Businesses API error:", error);
    return NextResponse.json({ error: "Failed to load businesses" }, { status: 500 });
  }
}
