import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ExportFormat } from "@prisma/client";
import { requireUser, userIdFromSession } from "@/lib/auth-guards";
import { isDatabaseConfigured, prisma } from "@/lib/db";

const postSchema = z.object({
  format: z.enum(["CSV", "XLSX", "JSON"]),
  rowCount: z.number().int().min(1).max(10_000),
  source: z.enum(["search", "saved"]).default("search"),
  filters: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const userId = userIdFromSession(session);
  if (!userId || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("pageSize") || "20")));
  const skip = (page - 1) * pageSize;

  try {
    const [total, rows] = await Promise.all([
      prisma.exportHistory.count({ where: { userId } }),
      prisma.exportHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      results: rows.map((r) => ({
        id: r.id,
        format: r.format,
        rowCount: r.rowCount,
        source: r.source,
        createdAt: r.createdAt.toISOString(),
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    console.error("List exports error:", error);
    return NextResponse.json({ error: "Could not load export history." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const userId = userIdFromSession(session);
  if (!userId || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  try {
    const parsed = postSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid export payload." }, { status: 400 });
    }

    const row = await prisma.exportHistory.create({
      data: {
        userId,
        format: parsed.data.format as ExportFormat,
        rowCount: parsed.data.rowCount,
        source: parsed.data.source,
        filtersJson: parsed.data.filters ? JSON.stringify(parsed.data.filters) : null,
      },
    });

    return NextResponse.json({
      success: true,
      id: row.id,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Export history error:", error);
    return NextResponse.json({ error: "Could not record export." }, { status: 500 });
  }
}
