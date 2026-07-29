/**
 * Add name_sort column (if missing) and backfill A–Z sort keys in one SQL pass.
 * Usage: npx tsx --env-file=.env.local scripts/backfill-name-sort.mjs
 */
import { PrismaClient } from "@prisma/client";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);

try {
  console.log("Ensuring name_sort column...");
  await prisma.$executeRawUnsafe(
    `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS name_sort text`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS businesses_name_sort_idx ON businesses (name_sort)`
  );

  console.log("Backfilling name_sort (may take a minute)...");
  const updated = await prisma.$executeRawUnsafe(`
    UPDATE businesses
    SET name_sort = lower(regexp_replace(trim(business_name), '^[^a-zA-Z0-9]+', '', 'g'))
    WHERE name_sort IS NULL
       OR name_sort = ''
       OR name_sort <> lower(regexp_replace(trim(business_name), '^[^a-zA-Z0-9]+', '', 'g'))
  `);
  console.log(`Updated rows: ${updated}`);

  const sample = await prisma.$queryRawUnsafe(`
    SELECT business_name, name_sort
    FROM businesses
    ORDER BY name_sort ASC NULLS LAST, business_name ASC
    LIMIT 10
  `);
  console.log("A–Z sample:", sample);
  console.log("Done.");
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
