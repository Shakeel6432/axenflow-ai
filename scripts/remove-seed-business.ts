import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.business.deleteMany({
    where: {
      OR: [
        { slug: "bright-smile-dental-dallas" },
        { businessName: "Bright Smile Dental" },
        { source: "seed" },
      ],
    },
  });
  console.log(`Deleted ${result.count} seed business(es)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
