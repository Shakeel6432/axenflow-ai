import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export async function GET(req: NextRequest) {
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
