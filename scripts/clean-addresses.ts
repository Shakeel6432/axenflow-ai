import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Strip leading commas/spaces: ", City, ST ZIP" → "City, ST ZIP"
  const result = await prisma.$executeRawUnsafe(`
    UPDATE businesses
    SET address = TRIM(BOTH FROM REGEXP_REPLACE(address, '^(\\s*,\\s*)+', ''))
    WHERE address IS NOT NULL AND address ~ '^\\s*,'
  `);

  console.log(`Cleaned ${result} addresses`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
