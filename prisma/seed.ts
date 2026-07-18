import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin123!", 10);

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@axenflowai.com" },
    update: { role: "ADMIN", password },
    create: {
      email: process.env.ADMIN_EMAIL || "admin@axenflowai.com",
      name: "AxenFlow Admin",
      role: "ADMIN",
      password,
    },
  });

  const us = await prisma.country.upsert({
    where: { code: "US" },
    update: {},
    create: { name: "United States", code: "US" },
  });

  const texas = await prisma.state.upsert({
    where: { countryId_slug: { countryId: us.id, slug: "texas" } },
    update: {},
    create: { countryId: us.id, name: "Texas", slug: "texas" },
  });

  const california = await prisma.state.upsert({
    where: { countryId_slug: { countryId: us.id, slug: "california" } },
    update: {},
    create: { countryId: us.id, name: "California", slug: "california" },
  });

  const dallas = await prisma.city.upsert({
    where: { stateId_slug: { stateId: texas.id, slug: "dallas" } },
    update: {},
    create: { stateId: texas.id, name: "Dallas", slug: "dallas" },
  });

  await prisma.city.upsert({
    where: { stateId_slug: { stateId: california.id, slug: "los-angeles" } },
    update: {},
    create: { stateId: california.id, name: "Los Angeles", slug: "los-angeles" },
  });

  const categories = ["Dentists", "Plumbers", "Restaurants", "Roofers"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { name, slug: slugify(name) },
    });
  }

  // Remove demo lead so it never reappears with a fake rating after reseed.
  await prisma.business.deleteMany({
    where: {
      OR: [{ slug: "bright-smile-dental-dallas" }, { source: "seed" }],
    },
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
