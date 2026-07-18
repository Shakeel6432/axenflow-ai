import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { redactBusinessContact, redactBusinessList } from "@/lib/redact-business";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const limited = rateLimit(`businesses:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ results: [], total: 0, page: 1, pageSize: 20 });
  }

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("pageSize") || 20)));
  const slug = req.nextUrl.searchParams.get("slug");
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  try {
    if (slug) {
      const business = await prisma.business.findFirst({ where: { slug, status: "APPROVED" } });
      if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(userId ? business : redactBusinessContact(business));
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

    return NextResponse.json({
      results: safeResults,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 0,
    });
  } catch (error) {
    console.error("Businesses API error:", error);
    return NextResponse.json({ error: "Failed to load businesses" }, { status: 500 });
  }
}
