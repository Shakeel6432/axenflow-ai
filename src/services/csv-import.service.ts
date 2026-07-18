import { prisma, isDatabaseConfigured } from "@/lib/db";
import { firstContactValue, formatDisplayAddress, parseUsAddress, US_STATE_NAMES } from "@/lib/address";
import { normalizeEmail, normalizePhone, normalizeWebsite } from "@/lib/normalize";
import { buildBusinessSlug, slugify } from "@/lib/slug";

export type CsvBusinessRow = {
  business_name?: string;
  businessName?: string;
  "Business Name"?: string;
  category?: string;
  Category?: string;
  website?: string;
  phone?: string;
  "Phone Numbers"?: string;
  email?: string;
  Emails?: string;
  address?: string;
  Address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  postalCode?: string;
  latitude?: string | number;
  longitude?: string | number;
  rating?: string | number;
  reviews_count?: string | number;
  reviewsCount?: string | number;
  google_maps_url?: string;
  googleMapsUrl?: string;
  source?: string;
  Owner?: string;
};

export type ImportReport = {
  total: number;
  imported: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  errors: string[];
};

async function findDuplicate(input: {
  businessName: string;
  city?: string | null;
  website?: string | null;
  phone?: string | null;
}) {
  const or = [];
  if (input.website) or.push({ website: input.website });
  if (input.phone) or.push({ phone: input.phone });
  if (input.businessName && input.city) {
    or.push({
      AND: [
        { businessName: { equals: input.businessName, mode: "insensitive" as const } },
        { city: { equals: input.city, mode: "insensitive" as const } },
      ],
    });
  }
  if (!or.length) return null;
  return prisma.business.findFirst({ where: { OR: or } });
}

async function ensureCategory(name: string) {
  const slug = slugify(name);
  return prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });
}

async function ensureLocation(input: {
  city: string | null;
  state: string | null;
  stateCode: string | null;
  country: string;
}) {
  const country = await prisma.country.upsert({
    where: { code: "US" },
    update: { name: input.country },
    create: { name: input.country, code: "US" },
  });

  if (!input.state && !input.stateCode) return;

  const stateName =
    input.state ||
    (input.stateCode ? US_STATE_NAMES[input.stateCode] || input.stateCode : null);
  if (!stateName) return;

  const state = await prisma.state.upsert({
    where: {
      countryId_slug: { countryId: country.id, slug: slugify(stateName) },
    },
    update: { name: stateName },
    create: {
      countryId: country.id,
      name: stateName,
      slug: slugify(stateName),
    },
  });

  if (!input.city) return;

  await prisma.city.upsert({
    where: {
      stateId_slug: { stateId: state.id, slug: slugify(input.city) },
    },
    update: { name: input.city },
    create: {
      stateId: state.id,
      name: input.city,
      slug: slugify(input.city),
    },
  });
}

function normalizeRow(row: CsvBusinessRow, defaultCategory = "Dentists") {
  const businessName = (
    row.business_name ||
    row.businessName ||
    row["Business Name"] ||
    ""
  ).trim();

  const categoryName = (
    row.category ||
    row.Category ||
    defaultCategory
  ).trim();

  const rawAddress = (row.address || row.Address || "").trim();
  const parsed = parseUsAddress(rawAddress);

  const phone = normalizePhone(
    firstContactValue(row.phone || row["Phone Numbers"])
  );
  const email = normalizeEmail(firstContactValue(row.email || row.Emails));
  const website = normalizeWebsite(row.website);

  return {
    businessName,
    categoryName,
    owner: (row.Owner || "").trim() || null,
    website,
    phone,
    email,
    address: formatDisplayAddress(rawAddress),
    city: row.city?.trim() || parsed.city,
    state: row.state?.trim() || parsed.state,
    stateCode: parsed.stateCode,
    country: row.country?.trim() || parsed.country,
    postalCode:
      (row.postal_code || row.postalCode || "").toString().trim() ||
      parsed.postalCode,
    latitude: row.latitude,
    longitude: row.longitude,
    rating: row.rating,
    reviewsCount: row.reviews_count ?? row.reviewsCount,
    googleMapsUrl: row.google_maps_url || row.googleMapsUrl,
    source: row.source?.trim() || "csv",
  };
}

export async function importBusinessRows(
  rows: CsvBusinessRow[],
  options?: { defaultCategory?: string }
): Promise<ImportReport> {
  if (!isDatabaseConfigured()) {
    return {
      total: rows.length,
      imported: 0,
      skippedDuplicates: 0,
      skippedInvalid: rows.length,
      errors: ["DATABASE_URL is not configured"],
    };
  }

  const report: ImportReport = {
    total: rows.length,
    imported: 0,
    skippedDuplicates: 0,
    skippedInvalid: 0,
    errors: [],
  };

  const defaultCategory = options?.defaultCategory || "Dentists";

  for (let i = 0; i < rows.length; i++) {
    const normalized = normalizeRow(rows[i], defaultCategory);

    if (!normalized.businessName) {
      report.skippedInvalid += 1;
      report.errors.push(`Row ${i + 1}: missing business_name`);
      continue;
    }

    try {
      const duplicate = await findDuplicate({
        businessName: normalized.businessName,
        city: normalized.city,
        website: normalized.website,
        phone: normalized.phone,
      });
      if (duplicate) {
        report.skippedDuplicates += 1;
        continue;
      }

      const category = await ensureCategory(normalized.categoryName);
      await ensureLocation({
        city: normalized.city,
        state: normalized.state,
        stateCode: normalized.stateCode,
        country: normalized.country,
      });

      let slug = buildBusinessSlug(normalized.businessName, normalized.city);
      const existingSlug = await prisma.business.findUnique({ where: { slug } });
      if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;

      await prisma.business.create({
        data: {
          slug,
          businessName: normalized.businessName,
          owner: normalized.owner,
          categoryId: category.id,
          categoryName: category.name,
          website: normalized.website,
          phone: normalized.phone,
          email: normalized.email,
          address: normalized.address,
          city: normalized.city,
          state: normalized.state,
          country: normalized.country,
          postalCode: normalized.postalCode,
          latitude:
            normalized.latitude !== undefined && normalized.latitude !== ""
              ? Number(normalized.latitude)
              : null,
          longitude:
            normalized.longitude !== undefined && normalized.longitude !== ""
              ? Number(normalized.longitude)
              : null,
          rating:
            normalized.rating !== undefined && normalized.rating !== ""
              ? Number(normalized.rating)
              : null,
          reviewsCount: Number(normalized.reviewsCount ?? 0) || 0,
          googleMapsUrl:
            (normalized.googleMapsUrl || "").toString().trim() || null,
          source: normalized.source,
          status: "APPROVED",
        },
      });

      report.imported += 1;
    } catch (error) {
      report.skippedInvalid += 1;
      report.errors.push(
        `Row ${i + 1}: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  return report;
}
