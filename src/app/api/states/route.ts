import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export async function GET(req: NextRequest) {
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
