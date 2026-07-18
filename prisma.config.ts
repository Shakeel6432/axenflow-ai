import { defineConfig } from "prisma/config";

/**
 * Build-time Prisma config for Vercel/CI.
 * DATABASE_URL may be unset during `prisma generate` — use a placeholder so generate still works.
 * Runtime queries use process.env.DATABASE_URL from the Vercel project env.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/postgres",
  },
});
