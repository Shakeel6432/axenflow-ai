import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";
import { firstContactValue, formatDisplayAddress, parseUsAddress, US_STATE_NAMES } from "../src/lib/address";
import { normalizeEmail, normalizePhone } from "../src/lib/normalize";
import { buildBusinessSlug, slugify } from "../src/lib/slug";

const prisma = new PrismaClient();
const BATCH = 50;

type Row = Record<string, string>;

async function main() {
  const csvPath =
    process.argv[2] ||
    path.resolve(__dirname, "../../Leads/Dentist.csv");
  const defaultCategory = process.argv[3] || "Dentists";

  const text = fs.readFileSync(csvPath, "utf8");
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Row[];

  console.log(`Fast-import ${rows.length} rows...`);

  const category = await prisma.category.upsert({
    where: { slug: slugify(defaultCategory) },
    update: { name: defaultCategory },
    create: { name: defaultCategory, slug: slugify(defaultCategory) },
  });

  const country = await prisma.country.upsert({
    where: { code: "US" },
    update: { name: "United States" },
    create: { name: "United States", code: "US" },
  });

  const stateCache = new Map<string, string>(); // slug -> id
  const cityCache = new Map<string, string>(); // stateId:citySlug -> id
  const seenBusiness = new Set<string>();

  // Prefetch existing phones/websites for duplicate skipping
  const existing = await prisma.business.findMany({
    select: { phone: true, website: true, businessName: true, city: true },
  });
  for (const e of existing) {
    if (e.phone) seenBusiness.add(`phone:${e.phone}`);
    if (e.website) seenBusiness.add(`web:${e.website}`);
    if (e.businessName && e.city) {
      seenBusiness.add(`name:${e.businessName.toLowerCase()}|${e.city.toLowerCase()}`);
    }
  }

  let imported = 0;
  let skippedDuplicates = 0;
  let skippedInvalid = 0;
  let batch: Parameters<typeof prisma.business.createMany>[0]["data"] = [];

  async function flush() {
    if (!batch.length) return;
    const result = await prisma.business.createMany({
      data: batch,
      skipDuplicates: true,
    });
    imported += result.count;
    batch = [];
  }

  async function ensureState(stateName: string) {
    const slug = slugify(stateName);
    const cached = stateCache.get(slug);
    if (cached) return cached;
    const row = await prisma.state.upsert({
      where: { countryId_slug: { countryId: country.id, slug } },
      update: { name: stateName },
      create: { countryId: country.id, name: stateName, slug },
    });
    stateCache.set(slug, row.id);
    return row.id;
  }

  async function ensureCity(stateId: string, cityName: string) {
    const slug = slugify(cityName);
    const key = `${stateId}:${slug}`;
    const cached = cityCache.get(key);
    if (cached) return cached;
    const row = await prisma.city.upsert({
      where: { stateId_slug: { stateId, slug } },
      update: { name: cityName },
      create: { stateId, name: cityName, slug },
    });
    cityCache.set(key, row.id);
    return row.id;
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const businessName = (row["Business Name"] || row.business_name || "").trim();
    if (!businessName) {
      skippedInvalid += 1;
      continue;
    }

    const parsed = parseUsAddress(row.Address || row.address || "");
    const phone = normalizePhone(firstContactValue(row["Phone Numbers"] || row.phone));
    const email = normalizeEmail(firstContactValue(row.Emails || row.email));
    const city = parsed.city;
    const state =
      parsed.state ||
      (parsed.stateCode ? US_STATE_NAMES[parsed.stateCode] || parsed.stateCode : null);

    const dupKeys = [
      phone ? `phone:${phone}` : null,
      city ? `name:${businessName.toLowerCase()}|${city.toLowerCase()}` : null,
    ].filter(Boolean) as string[];

    if (dupKeys.some((k) => seenBusiness.has(k))) {
      skippedDuplicates += 1;
      continue;
    }
    for (const k of dupKeys) seenBusiness.add(k);

    if (state) {
      const stateId = await ensureState(state);
      if (city) await ensureCity(stateId, city);
    }

    const slugBase = buildBusinessSlug(businessName, city);
    const slug = `${slugBase}-${(i + 1).toString(36)}`;

    batch.push({
      slug,
      businessName,
      owner: (row.Owner || "").trim() || null,
      categoryId: category.id,
      categoryName: category.name,
      website: null,
      phone,
      email,
      address: formatDisplayAddress(row.Address || row.address || ""),
      city,
      state,
      country: "United States",
      postalCode: parsed.postalCode,
      source: "csv",
      status: "APPROVED",
    });

    if (batch.length >= BATCH) {
      await flush();
      if ((imported + skippedDuplicates) % 200 === 0) {
        console.log(`progress imported=${imported} skipped=${skippedDuplicates} row=${i + 1}/${rows.length}`);
      }
    }
  }

  await flush();

  const total = await prisma.business.count();
  console.log(
    JSON.stringify(
      { totalRows: rows.length, imported, skippedDuplicates, skippedInvalid, businessesInDb: total },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
