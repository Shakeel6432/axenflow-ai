/**
 * Generate updated AI Outreach blog images (free sample + How It Works + batch table).
 * Run: node scripts/gen-aioutreach-blog-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const outDir = path.resolve("public/images/blog");
fs.mkdirSync(outDir, { recursive: true });

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function svg({ w = 1200, h = 675, title, subtitle, body }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141d2f"/>
      <stop offset="55%" stop-color="#1c2740"/>
      <stop offset="100%" stop-color="#0f766e22"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <circle cx="1080" cy="80" r="180" fill="#6366f122"/>
  <circle cx="80" cy="620" r="140" fill="#14b8a618"/>
  <rect x="48" y="48" width="${w - 96}" height="${h - 96}" rx="28" fill="#182236" stroke="#bac6da33" stroke-width="2"/>
  <rect x="48" y="48" width="8" height="${h - 96}" rx="4" fill="url(#accent)"/>
  <text x="88" y="110" fill="#818cf8" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="2">AXENFLOWAI</text>
  <text x="88" y="168" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="36" font-weight="700">${escapeXml(title)}</text>
  ${subtitle ? `<text x="88" y="212" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="18">${escapeXml(subtitle)}</text>` : ""}
  ${body || ""}
</svg>`;
}

async function writePng(name, svgString) {
  await sharp(Buffer.from(svgString)).png().toFile(path.join(outDir, name));
  console.log("wrote", name);
}

const sampleBody = `
  <rect x="88" y="240" width="240" height="44" rx="10" fill="#141d2f" stroke="#6366f155"/>
  <text x="108" y="268" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="15">Maria</text>
  <rect x="344" y="240" width="280" height="44" rx="10" fill="#141d2f" stroke="#6366f155"/>
  <text x="364" y="268" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="15">Summit Roofing</text>
  <rect x="640" y="240" width="220" height="44" rx="10" fill="#141d2f" stroke="#6366f155"/>
  <text x="660" y="268" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="15">home services</text>
  <rect x="880" y="244" width="200" height="36" rx="10" fill="#4f46e5"/>
  <text x="910" y="268" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700">Generate sample</text>
  <rect x="88" y="310" width="1024" height="270" rx="16" fill="#141d2f" stroke="#14b8a644"/>
  <text x="120" y="350" fill="#818cf8" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="700">SUBJECT</text>
  <text x="120" y="380" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">Quick idea for Summit Roofing in Denver</text>
  <text x="120" y="430" fill="#cbd5e1" font-family="Segoe UI, Arial, sans-serif" font-size="16">Hello Maria,</text>
  <text x="120" y="460" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">I help home services businesses in Denver get more qualified leads...</text>
  <text x="120" y="490" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">For Summit Roofing, that usually looks like: a steady stream of verified local homeowner leads.</text>
  <text x="120" y="540" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="14">Personalized using: Maria, Summit Roofing, home services, Denver</text>
`;

const howBody = `
  <rect x="88" y="250" width="320" height="280" rx="14" fill="#141d2f" stroke="#6366f144"/>
  <text x="110" y="300" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">1. Chat templates</text>
  <text x="110" y="345" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">Refine tone, length,</text>
  <text x="110" y="370" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">and structure in chat</text>
  <text x="110" y="410" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">Keep placeholders like</text>
  <text x="110" y="435" fill="#818cf8" font-family="Consolas, monospace" font-size="14">{{business_name}}</text>
  <rect x="430" y="250" width="320" height="280" rx="14" fill="#141d2f" stroke="#14b8a644"/>
  <text x="452" y="300" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">2. Lead fields</text>
  <text x="452" y="345" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">Merge company,</text>
  <text x="452" y="370" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">industry, city, sender</text>
  <text x="452" y="410" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">into every message</text>
  <text x="452" y="450" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="15">Same engine as free sample</text>
  <rect x="772" y="250" width="340" height="280" rx="14" fill="#141d2f" stroke="#f59e0b44"/>
  <text x="794" y="300" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">3. Batch fill</text>
  <text x="794" y="345" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">CSV / Excel up to</text>
  <text x="794" y="370" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">5,000 rows · 12MB</text>
  <text x="794" y="410" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">Export subject + body</text>
  <text x="794" y="450" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">columns per lead</text>
`;

const batchBody = `
  <rect x="88" y="250" width="1024" height="320" rx="16" fill="#141d2f" stroke="#6366f144"/>
  <text x="120" y="295" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">Batch output preview · sign in unlocks upload</text>
  <rect x="120" y="320" width="960" height="210" rx="12" fill="#182236"/>
  <rect x="120" y="320" width="960" height="44" fill="#4f46e5"/>
  <text x="140" y="348" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700">name · company · generated_subject · generated_body</text>
  <text x="140" y="400" fill="#cbd5e1" font-family="Consolas, monospace" font-size="14">Summit Roofing · Quick idea for Summit Roofing in Denver · Hello Maria...</text>
  <text x="140" y="440" fill="#5eead4" font-family="Consolas, monospace" font-size="14">Northside Dental · Following up: Northside Dental · Hello Dr. Patel...</text>
  <text x="140" y="480" fill="#f59e0b" font-family="Consolas, monospace" font-size="14">BrightPath Tutoring · Call script: BrightPath Tutoring · Hi Sam...</text>
  <text x="120" y="555" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="15">Personalized per row · CSV / Excel export · no credit meter today</text>
`;

await writePng(
  "aioutreach-free-sample.png",
  svg({
    title: "Free outreach sample",
    subtitle: "No signup · subject + body · Personalized using tag",
    body: sampleBody,
  })
);

await writePng(
  "aioutreach-how-it-works.png",
  svg({
    title: "How it works",
    subtitle: "Chat templates · lead-field merge · batch CSV / Excel fill",
    body: howBody,
  })
);

await writePng(
  "aioutreach-batch-table.png",
  svg({
    title: "Batch CSV / Excel fill",
    subtitle: "Personalized subject and body columns per lead",
    body: batchBody,
  })
);

await writePng(
  "aioutreach-cover.png",
  svg({
    title: "AI Outreach",
    subtitle: "Free sample · chat templates · batch personalization",
    body: sampleBody,
  })
);

// Keep older filenames refreshed for any remaining references
await writePng(
  "aioutreach-templates.png",
  svg({
    title: "Cold email · Follow-up · Call script",
    subtitle: "Built-in kinds plus custom chat templates",
    body: howBody,
  })
);

await writePng(
  "aioutreach-batch.png",
  svg({
    title: "Batch fill workflow",
    subtitle: "Upload leads · apply templates · download sheet",
    body: batchBody,
  })
);

console.log("done");
