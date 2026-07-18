import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { importBusinessRows, type CsvBusinessRow } from "../src/services/csv-import.service";
import { prisma } from "../src/lib/db";

async function main() {
  const csvPath =
    process.argv[2] ||
    path.resolve(__dirname, "../../Leads/Dentist.csv");
  const defaultCategory = process.argv[3] || "Dentists";

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found: ${csvPath}`);
  }

  const text = fs.readFileSync(csvPath, "utf8");
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as CsvBusinessRow[];

  console.log(`Importing ${rows.length} rows from ${csvPath}...`);
  const report = await importBusinessRows(rows, { defaultCategory });
  console.log(JSON.stringify(report, null, 2));

  if (report.errors.length) {
    console.log(`First errors (up to 10):\n${report.errors.slice(0, 10).join("\n")}`);
  }

  const total = await prisma.business.count();
  console.log(`Businesses in DB: ${total}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
