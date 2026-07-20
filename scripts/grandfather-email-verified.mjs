import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const result = await prisma.user.updateMany({
  where: { emailVerified: null, password: { not: null } },
  data: { emailVerified: new Date() },
});
console.log("grandfathered", result.count);
await prisma.$disconnect();
