import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      businesses: 0,
      categories: 0,
      users: 0,
      searches: 0,
      pending: 0,
    });
  }

  const [businesses, categories, users, searches, pending] = await Promise.all([
    prisma.business.count(),
    prisma.category.count(),
    prisma.user.count(),
    prisma.searchHistory.count(),
    prisma.business.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({ businesses, categories, users, searches, pending });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "Business id required" }, { status: 400 });

  const updated = await prisma.business.update({
    where: { id },
    data: {
      businessName: data.businessName,
      categoryName: data.categoryName,
      website: data.website,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      status: data.status,
      rating: data.rating,
      reviewsCount: data.reviewsCount,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Business id required" }, { status: 400 });
  await prisma.business.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
