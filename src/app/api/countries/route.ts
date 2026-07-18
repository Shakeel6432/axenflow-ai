import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";

type CacheEntry<T> = { at: number; data: T };
let countriesCache: CacheEntry<unknown> | null = null;
const TTL_MS = 5 * 60 * 1000;

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json([]);

  try {
    if (countriesCache && Date.now() - countriesCache.at < TTL_MS) {
      return NextResponse.json(countriesCache.data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Cache": "HIT",
        },
      });
    }

    const countries = await prisma.country.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
    countriesCache = { at: Date.now(), data: countries };

    return NextResponse.json(countries, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load countries" }, { status: 500 });
  }
}
