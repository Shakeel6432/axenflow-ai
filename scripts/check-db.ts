import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const url = process.env.DATABASE_URL || "";
  const safe = url.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
  console.log("DATABASE_URL =", safe || "(not set)");

  const rows = (await prisma.$queryRawUnsafe(
    "SELECT current_database() AS db, COALESCE(inet_server_addr()::text, 'local') AS host, inet_server_port() AS port"
  )) as Array<{ db: string; host: string; port: number | null }>;

  console.log("connected_db =", rows[0]?.db);
  console.log("connected_host =", rows[0]?.host);
  console.log("connected_port =", rows[0]?.port);

  const businesses = await prisma.business.count();
  console.log("businesses =", businesses);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
