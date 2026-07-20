import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { assertApiBotGuard, getClientIpFromHeaders } from "@/lib/bot-guard";

export async function GET(req: NextRequest) {
  const bot = assertApiBotGuard(req);
  if (!bot.ok) return bot.response;

  const ip = getClientIpFromHeaders(req.headers);
  const limited = rateLimit(`cities:${ip}`, 90, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isDatabaseConfigured()) return NextResponse.json([]);
  const stateId = req.nextUrl.searchParams.get("stateId") || undefined;
  try {
    const cities = await prisma.city.findMany({
      where: stateId ? { stateId } : undefined,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(cities, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load cities" }, { status: 500 });
  }
}
