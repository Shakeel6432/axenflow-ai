import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";

type CacheEntry<T> = { at: number; data: T };

const cache: {
  categories?: CacheEntry<unknown>;
  countries?: CacheEntry<unknown>;
} = {};

const TTL_MS = 5 * 60 * 1000;

function getCached<T>(key: keyof typeof cache): T | null {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.at > TTL_MS) return null;
  return entry.data as T;
}

function setCached<T>(key: keyof typeof cache, data: T) {
  cache[key] = { at: Date.now(), data };
}

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json([]);

  try {
    const cached = getCached<unknown[]>("categories");
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Cache": "HIT",
        },
      });
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
    setCached("categories", categories);

    return NextResponse.json(categories, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}
