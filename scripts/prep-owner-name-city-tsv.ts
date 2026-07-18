import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { parseUsAddress } from "../src/lib/address";

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
  const businessName = (row["Business Name"] || "").trim();
  if (!owner || !businessName) continue;
  const parsed = parseUsAddress(row.Address || "");
  const city = (parsed.city || "").toLowerCase();
  if (!city) continue;
  const key = `${businessName.toLowerCase()}\t${city}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const esc = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\t/g, " ").replace(/\n/g, " ").replace(/\r/g, "");
  lines.push(`${esc(businessName.toLowerCase())}\t${esc(city)}\t${esc(owner)}`);
}

const outPath = path.resolve(__dirname, "owner-name-city.tsv");
fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log(`Wrote ${lines.length} rows to ${outPath}`);
