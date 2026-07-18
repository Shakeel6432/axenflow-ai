import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  // Ignore local placeholder connection strings used before a real DB is connected.
  if (url.includes("@HOST:") || url.includes("USER:PASSWORD") || url.includes("localhost:5432/mydb")) {
    return false;
  }
  return true;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** Lazy Prisma accessor so pages don't crash when client/generate is mid-sync. */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Backwards-compatible export used by services.
 * Uses a Proxy so importing this module never throws during evaluation.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
