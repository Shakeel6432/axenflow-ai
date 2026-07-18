import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";
import { firstContactValue } from "../src/lib/address";
import { normalizePhone } from "../src/lib/normalize";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

type Row = Record<string, string>;

async function withRetry<T>(fn: () => Promise<T>, attempts = 6): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw last;
}

async function main() {
  const csvPath =
    process.argv[2] ||
    path.resolve(__dirname, "../../Leads/Dentist.csv");

  const rows = parse(fs.readFileSync(csvPath, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Row[];

  const byPhone = new Map<string, string>();
  for (const row of rows) {
    const owner = (row.Owner || "").trim();
    if (!owner) continue;
    const phone = normalizePhone(firstContactValue(row["Phone Numbers"]));
    if (phone && !byPhone.has(phone)) byPhone.set(phone, owner);
  }
  console.log(`CSV owners by phone: ${byPhone.size}`);

  const missing = await withRetry(() =>
    prisma.business.findMany({
      where: { OR: [{ owner: null }, { owner: "" }] },
      select: { id: true, phone: true },
    })
  );
  console.log(`Missing owner: ${missing.length}`);

  const updates = missing
    .map((b) => {
      const owner = b.phone ? byPhone.get(b.phone) : undefined;
      return owner ? { id: b.id, owner } : null;
    })
    .filter(Boolean) as { id: string; owner: string }[];
  console.log(`Matched: ${updates.length}`);

  for (let i = 0; i < updates.length; i += 10) {
    const chunk = updates.slice(i, i + 10);
    await withRetry(async () => {
      await Promise.all(
        chunk.map((u) =>
          prisma.business.update({ where: { id: u.id }, data: { owner: u.owner } })
        )
      );
    });
    if (i % 100 === 0) console.log(`updated ${Math.min(i + 10, updates.length)}/${updates.length}`);
  }

  const withOwner = await withRetry(() =>
    prisma.business.count({
      where: { AND: [{ owner: { not: null } }, { NOT: { owner: "" } }] },
    })
  );
  console.log(`Done. withOwner=${withOwner}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
