import { prisma } from "@/lib/db";
import type { BusinessCard } from "@/types/leads";

function toCard(b: {
  id: string;
  slug: string;
  businessName: string;
  owner: string | null;
  categoryName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  rating: number | null;
  reviewsCount: number;
  googleMapsUrl: string | null;
}): BusinessCard {
  return {
    id: b.id,
    slug: b.slug,
    businessName: b.businessName,
    owner: b.owner,
    category: b.categoryName,
    address: b.address,
    city: b.city,
    state: b.state,
    country: b.country,
    phone: b.phone,
    website: b.website,
    email: b.email,
    rating: b.rating,
    reviewsCount: b.reviewsCount,
    googleMapsUrl: b.googleMapsUrl,
  };
}

export async function listSavedLeads(userId: string, page = 1, pageSize = 20) {
  const take = Math.min(Math.max(pageSize, 1), 50);
  const skip = (Math.max(page, 1) - 1) * take;

  const [total, rows] = await Promise.all([
    prisma.savedLead.count({ where: { userId } }),
    prisma.savedLead.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: { business: true },
    }),
  ]);

  return {
    results: rows.map((row) => ({
      id: row.id,
      notes: row.notes,
      savedAt: row.createdAt.toISOString(),
      business: toCard(row.business),
    })),
    page: Math.max(page, 1),
    pageSize: take,
    total,
    totalPages: Math.max(1, Math.ceil(total / take)),
  };
}

export async function saveLeads(userId: string, businessIds: string[]) {
  const unique = [...new Set(businessIds)].slice(0, 100);
  if (!unique.length) return { saved: 0, skipped: 0 };

  const existing = await prisma.business.findMany({
    where: { id: { in: unique }, status: "APPROVED" },
    select: { id: true },
  });
  const validIds = new Set(existing.map((b) => b.id));
  const toSave = unique.filter((id) => validIds.has(id));

  if (!toSave.length) return { saved: 0, skipped: unique.length };

  const result = await prisma.savedLead.createMany({
    data: toSave.map((businessId) => ({ userId, businessId })),
    skipDuplicates: true,
  });

  return { saved: result.count, skipped: unique.length - result.count };
}

export async function unsaveLead(userId: string, savedLeadId: string) {
  const deleted = await prisma.savedLead.deleteMany({
    where: { id: savedLeadId, userId },
  });
  return deleted.count > 0;
}

export async function unsaveByBusinessIds(userId: string, businessIds: string[]) {
  const result = await prisma.savedLead.deleteMany({
    where: { userId, businessId: { in: businessIds } },
  });
  return result.count;
}

export async function getSavedBusinessIdSet(userId: string, businessIds: string[]) {
  if (!businessIds.length) return new Set<string>();
  const rows = await prisma.savedLead.findMany({
    where: { userId, businessId: { in: businessIds } },
    select: { businessId: true },
  });
  return new Set(rows.map((r) => r.businessId));
}
