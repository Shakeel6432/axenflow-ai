/**
 * Bulk-import BBB scraper CSV folders into Postgres.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/import-bbb-folders.ts
 *   npx tsx --env-file=.env.local scripts/import-bbb-folders.ts "C:\path\to\Business Services" "C:\path\to\Home Services"
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";
import { firstContactValue, formatDisplayAddress, parseUsAddress, US_STATE_NAMES } from "../src/lib/address";
import { normalizeEmail, normalizePhone } from "../src/lib/normalize";
import { buildBusinessSlug, slugify } from "../src/lib/slug";

const prisma = new PrismaClient();
const BATCH = 500;

type Row = Record<string, string>;

const DEFAULT_FOLDERS = [
  path.resolve(__dirname, "../../Scrapers/BBB Scraper/Business Services"),
  path.resolve(__dirname, "../../Scrapers/BBB Scraper/Home Services"),
];

function categoryFromFilename(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath));
  return base.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

function listCsvFiles(folder: string): string[] {
  if (!fs.existsSync(folder)) return [];
  return fs
    .readdirSync(folder)
    .filter((f) => f.toLowerCase().endsWith(".csv"))
    .map((f) => path.join(folder, f))
    .sort((a, b) => a.localeCompare(b));
}

async function syncLocations(
  locations: Map<string, { stateName: string; cityName: string | null }>,
  countryId: string,
  stateCache: Map<string, string>
) {
  const stateNames = new Set<string>();
  for (const loc of locations.values()) stateNames.add(loc.stateName);

  for (const stateName of stateNames) {
    const slug = slugify(stateName);
    if (stateCache.has(slug)) continue;
    const row = await prisma.state.upsert({
      where: { countryId_slug: { countryId, slug } },
      update: { name: stateName },
      create: { countryId, name: stateName, slug },
    });
    stateCache.set(slug, row.id);
  }

  const cityPayload: { stateId: string; name: string; slug: string }[] = [];
  const seenCity = new Set<string>();
  for (const loc of locations.values()) {
    if (!loc.cityName) continue;
    const stateId = stateCache.get(slugify(loc.stateName));
    if (!stateId) continue;
    const citySlug = slugify(loc.cityName);
    const key = `${stateId}:${citySlug}`;
    if (seenCity.has(key)) continue;
    seenCity.add(key);
    cityPayload.push({ stateId, name: loc.cityName, slug: citySlug });
  }

  for (let i = 0; i < cityPayload.length; i += BATCH) {
    const slice = cityPayload.slice(i, i + BATCH);
    await prisma.city.createMany({ data: slice, skipDuplicates: true });
  }
}

async function importFile(
  csvPath: string,
  caches: {
    stateCache: Map<string, string>;
    seenBusiness: Set<string>;
    countryId: string;
  }
) {
  const categoryName = categoryFromFilename(csvPath);
  const text = fs.readFileSync(csvPath, "utf8");
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Row[];

  console.log(`\n=== ${path.basename(csvPath)} → category "${categoryName}" (${rows.length} rows) ===`);

  const category = await prisma.category.upsert({
    where: { slug: slugify(categoryName) },
    update: { name: categoryName },
    create: { name: categoryName, slug: slugify(categoryName) },
  });

  type Prep = {
    businessName: string;
    owner: string | null;
    phone: string | null;
    email: string | null;
    address: string;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    index: number;
  };

  const prepared: Prep[] = [];
  const locations = new Map<string, { stateName: string; cityName: string | null }>();
  let skippedDuplicates = 0;
  let skippedInvalid = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const businessName = (row["Business Name"] || row.business_name || "").trim();
    if (!businessName) {
      skippedInvalid += 1;
      continue;
    }

    const parsedAddr = parseUsAddress(row.Address || row.address || "");
    const phone = normalizePhone(firstContactValue(row["Phone Numbers"] || row.phone));
    const email = normalizeEmail(firstContactValue(row.Emails || row.email));
    const city = parsedAddr.city;
    const state =
      parsedAddr.state ||
      (parsedAddr.stateCode ? US_STATE_NAMES[parsedAddr.stateCode] || parsedAddr.stateCode : null);

    const dupKeys = [
      phone ? `phone:${phone}` : null,
      city ? `name:${businessName.toLowerCase()}|${city.toLowerCase()}` : null,
    ].filter(Boolean) as string[];

    if (dupKeys.some((k) => caches.seenBusiness.has(k))) {
      skippedDuplicates += 1;
      continue;
    }
    for (const k of dupKeys) caches.seenBusiness.add(k);

    if (state) {
      locations.set(`${state}|${city || ""}`, { stateName: state, cityName: city });
    }

    prepared.push({
      businessName,
      owner: (row.Owner || "").trim() || null,
      phone,
      email,
      address: formatDisplayAddress(row.Address || row.address || ""),
      city,
      state,
      postalCode: parsedAddr.postalCode,
      index: i,
    });
  }

  if (locations.size) {
    await syncLocations(locations, caches.countryId, caches.stateCache);
  }

  let imported = 0;
  const stamp = Date.now().toString(36);

  for (let i = 0; i < prepared.length; i += BATCH) {
    const slice = prepared.slice(i, i + BATCH);
    const data = slice.map((p) => ({
      slug: `${buildBusinessSlug(p.businessName, p.city)}-${stamp}-${(p.index + 1).toString(36)}`,
      businessName: p.businessName,
      owner: p.owner,
      categoryId: category.id,
      categoryName: category.name,
      website: null as string | null,
      phone: p.phone,
      email: p.email,
      address: p.address,
      city: p.city,
      state: p.state,
      country: "United States",
      postalCode: p.postalCode,
      source: "bbb-csv",
      status: "APPROVED" as const,
    }));

    const result = await prisma.business.createMany({ data, skipDuplicates: true });
    imported += result.count;
    console.log(
      `  progress imported=${imported}/${prepared.length} skippedDup=${skippedDuplicates} batch=${Math.floor(i / BATCH) + 1}`
    );
  }

  console.log(
    JSON.stringify({
      file: path.basename(csvPath),
      totalRows: rows.length,
      imported,
      skippedDuplicates,
      skippedInvalid,
    })
  );
  return { imported, skippedDuplicates, skippedInvalid, totalRows: rows.length };
}

async function main() {
  const folders = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_FOLDERS;

  const country = await prisma.country.upsert({
    where: { code: "US" },
    update: { name: "United States" },
    create: { name: "United States", code: "US" },
  });

  const caches = {
    stateCache: new Map<string, string>(),
    seenBusiness: new Set<string>(),
    countryId: country.id,
  };

  console.log("Preloading states...");
  const states = await prisma.state.findMany({
    where: { countryId: country.id },
    select: { id: true, slug: true },
  });
  for (const s of states) caches.stateCache.set(s.slug, s.id);
  console.log(`States cached: ${caches.stateCache.size}`);

  console.log("Loading existing businesses for duplicate detection...");
  const existing = await prisma.business.findMany({
    select: { phone: true, website: true, businessName: true, city: true },
  });
  for (const e of existing) {
    if (e.phone) caches.seenBusiness.add(`phone:${e.phone}`);
    if (e.website) caches.seenBusiness.add(`web:${e.website}`);
    if (e.businessName && e.city) {
      caches.seenBusiness.add(`name:${e.businessName.toLowerCase()}|${e.city.toLowerCase()}`);
    }
  }
  console.log(`Existing fingerprint keys: ${caches.seenBusiness.size}`);

  const totals = { files: 0, totalRows: 0, imported: 0, skippedDuplicates: 0, skippedInvalid: 0 };

  for (const folder of folders) {
    const files = listCsvFiles(folder);
    console.log(`\nFolder: ${folder} (${files.length} CSV files)`);
    if (!files.length) {
      console.warn(`No CSV files found in ${folder}`);
      continue;
    }
    for (const file of files) {
      const r = await importFile(file, caches);
      totals.files += 1;
      totals.totalRows += r.totalRows;
      totals.imported += r.imported;
      totals.skippedDuplicates += r.skippedDuplicates;
      totals.skippedInvalid += r.skippedInvalid;
    }
  }

  const businessesInDb = await prisma.business.count();
  console.log("\n===== IMPORT COMPLETE =====");
  console.log(JSON.stringify({ ...totals, businessesInDb }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
