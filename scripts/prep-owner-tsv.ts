import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { firstContactValue } from "../src/lib/address";
import { normalizePhone } from "../src/lib/normalize";

type Row = Record<string, string>;

const csvPath =
  process.argv[2] ||
  path.resolve(__dirname, "../../Leads/Dentist.csv");

const rows = parse(fs.readFileSync(csvPath, "utf8"), {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true,
}) as Row[];

const lines: string[] = [];
const seen = new Set<string>();

for (const row of rows) {
  const owner = (row.Owner || "").trim();
  if (!owner) continue;
  const phone = normalizePhone(firstContactValue(row["Phone Numbers"]));
  if (!phone || seen.has(phone)) continue;
  seen.add(phone);
  const esc = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\t/g, " ").replace(/\n/g, " ").replace(/\r/g, "");
  lines.push(`${esc(phone)}\t${esc(owner)}`);
}

const outPath = path.resolve(__dirname, "owner-phone.tsv");
fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log(`Wrote ${lines.length} phone->owner rows`);
