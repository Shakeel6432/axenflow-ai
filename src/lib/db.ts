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

function isTransientConnectionError(error: unknown): boolean {
  const msg = error instanceof Error ? `${error.message} ${error.stack ?? ""}` : String(error);
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: string }).code ?? "")
      : "";

  return (
    code === "P1001" ||
    code === "P1017" ||
    code === "P1008" ||
    code === "P1002" ||
    /Can't reach database server/i.test(msg) ||
    /Server has closed the connection/i.test(msg) ||
    /ConnectionReset|ECONNRESET|ECONNREFUSED|ETIMEDOUT/i.test(msg) ||
    /forcibly closed by the remote host/i.test(msg) ||
    /10054|57P01|57P03|08006|08003|08001/i.test(msg) ||
    /Error in PostgreSQL connection/i.test(msg)
  );
}

/**
 * Pick the most stable URL for the current runtime:
 * - Local/dev long-lived Next server → session pooler (DIRECT_URL / :5432)
 * - Production serverless → transaction pooler (DATABASE_URL / :6543)
 */
function resolveDatabaseUrl(): string {
  const pooled = process.env.DATABASE_URL?.trim() || "";
  const direct = process.env.DIRECT_URL?.trim() || "";
  const isDev = process.env.NODE_ENV === "development";

  // Session mode is far more stable for `next dev` (idle connections stay alive).
  const raw = isDev && direct ? direct : pooled || direct;
  return normalizeDatabaseUrl(raw, {
    preferPoolerParams: !isDev || (!direct && Boolean(pooled)),
  });
}

function normalizeDatabaseUrl(
  url: string,
  opts: { preferPoolerParams: boolean }
): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    const isPoolerHost = parsed.hostname.includes("pooler.supabase.com");
    const isTransactionPort = parsed.port === "6543";

    parsed.searchParams.set("sslmode", parsed.searchParams.get("sslmode") || "require");
    parsed.searchParams.set("connect_timeout", parsed.searchParams.get("connect_timeout") || "30");

    if (opts.preferPoolerParams && (isPoolerHost || isTransactionPort)) {
      parsed.searchParams.set("pgbouncer", "true");
      // Serverless / many instances: keep Prisma's local pool tiny.
      parsed.searchParams.set(
        "connection_limit",
        parsed.searchParams.get("connection_limit") || "1"
      );
      parsed.searchParams.set("pool_timeout", parsed.searchParams.get("pool_timeout") || "30");
    } else {
      // Session / direct: small local pool, no pgbouncer flag.
      parsed.searchParams.delete("pgbouncer");
      if (!parsed.searchParams.get("connection_limit")) {
        parsed.searchParams.set("connection_limit", "5");
      }
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

async function resetPrismaClient() {
  const existing = globalForPrisma.prisma;
  globalForPrisma.prisma = undefined;
  if (existing) {
    await existing.$disconnect().catch(() => undefined);
  }
}

function createPrismaClient(): PrismaClient {
  const url = resolveDatabaseUrl();
  const base = new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Auto-retry once when Supabase/pgbouncer drops a stale socket (Windows 10054, etc.).
  const extended = base.$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (!isTransientConnectionError(error)) throw error;

          await base.$disconnect().catch(() => undefined);
          await new Promise((r) => setTimeout(r, 200));
          try {
            await base.$connect();
          } catch {
            // Fall through — second query attempt will surface the real error.
          }
          return query(args);
        }
      },
    },
  });

  return extended as unknown as PrismaClient;
}

/** Lazy Prisma accessor so pages don't crash when client/generate is mid-sync. */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/** Soft DB probe used by APIs — never throws. */
export async function pingDatabase(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return true;
  } catch {
    await resetPrismaClient();
    try {
      await getPrisma().$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Backwards-compatible export used by services.
 * Uses a Proxy so importing this module never throws during evaluation.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
