import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NEW = [
  "Pharmacies",
  "Hospitals",
  "Optometrists",
  "Eye Clinics",
  "Dermatologists",
  "Chiropractors",
  "Physical Therapy",
  "Psychologists",
  "Mental Health Clinics",
  "Veterinary Clinics",
];

async function main() {
  const total = await prisma.business.count();
  console.log(`Total businesses: ${total}`);
  for (const name of NEW) {
    const count = await prisma.business.count({ where: { categoryName: name } });
    console.log(`${name}: ${count}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
