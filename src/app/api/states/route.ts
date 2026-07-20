import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { assertApiBotGuard, getClientIpFromHeaders } from "@/lib/bot-guard";

export async function GET(req: NextRequest) {
  const bot = assertApiBotGuard(req);
  if (!bot.ok) return bot.response;

  const ip = getClientIpFromHeaders(req.headers);
  const limited = rateLimit(`states:${ip}`, 90, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isDatabaseConfigured()) return NextResponse.json([]);
  const countryId = req.nextUrl.searchParams.get("countryId") || undefined;
  try {
    const states = await prisma.state.findMany({
      where: countryId ? { countryId } : undefined,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(states, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load states" }, { status: 500 });
  }
}
