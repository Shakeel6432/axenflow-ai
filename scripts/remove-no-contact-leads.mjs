import { PrismaClient } from "@prisma/client";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);
const BATCH = 5000;

const noContactWhere = {
  AND: [
    { OR: [{ phone: null }, { phone: "" }] },
    { OR: [{ email: null }, { email: "" }] },
  ],
};

try {
  const total = await prisma.business.count();
  const noContact = await prisma.business.count({ where: noContactWhere });
  console.log(`Total businesses: ${total}`);
  console.log(`Without phone and email: ${noContact}`);

  let deleted = 0;
  while (true) {
    const batch = await prisma.business.findMany({
      where: noContactWhere,
      select: { id: true },
      take: BATCH,
    });
    if (!batch.length) break;

    const ids = batch.map((b) => b.id);
    const result = await prisma.business.deleteMany({ where: { id: { in: ids } } });
    deleted += result.count;
    console.log(`Deleted ${deleted}/${noContact}...`);
  }

  const remaining = await prisma.business.count();
  console.log(`Done. Deleted ${deleted}. Remaining businesses: ${remaining}`);
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
