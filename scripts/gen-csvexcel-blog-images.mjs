/**
 * Generate SEO blog images for CSV Excel Converter guide.
 * Run: npx tsx scripts/gen-csvexcel-blog-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const outDir = path.resolve("public/images/blog");
fs.mkdirSync(outDir, { recursive: true });

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
  <text x="88" y="168" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="700">${escapeXml(title)}</text>
  ${subtitle ? `<text x="88" y="220" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="22">${escapeXml(subtitle)}</text>` : ""}
  ${body || ""}
</svg>`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function writePng(name, svgString) {
  const file = path.join(outDir, name);
  await sharp(Buffer.from(svgString)).png().toFile(file);
  console.log("wrote", name);
}

const uiPanel = `
  <rect x="88" y="260" width="1024" height="320" rx="18" fill="#141d2f" stroke="#6366f155" stroke-width="2"/>
  <rect x="120" y="290" width="420" height="120" rx="14" fill="#1c2740" stroke="#14b8a655" stroke-dasharray="8 6"/>
  <text x="160" y="350" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="600">Drag &amp; drop CSV / Excel</text>
  <text x="160" y="380" fill="#7b8aa3" font-family="Segoe UI, Arial, sans-serif" font-size="16">Processed in your browser · no upload</text>
  <rect x="560" y="290" width="520" height="250" rx="12" fill="#1c2740"/>
  <rect x="560" y="290" width="520" height="42" rx="12" fill="#4f46e5"/>
  <text x="580" y="318" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">Business · Phone · City · Email</text>
  <text x="580" y="370" fill="#d6dee9" font-family="Segoe UI, Arial, sans-serif" font-size="14">Acme Clinic · 0555-1200 · Miami · a@acme.com</text>
  <text x="580" y="405" fill="#d6dee9" font-family="Segoe UI, Arial, sans-serif" font-size="14">North Roofing · 0555-9911 · Dallas · n@roof.co</text>
  <text x="580" y="440" fill="#d6dee9" font-family="Segoe UI, Arial, sans-serif" font-size="14">Bay Dental · 0555-3344 · Tampa · hello@bay.io</text>
`;

const beforeBody = `
  <rect x="88" y="250" width="1024" height="340" rx="16" fill="#0b1220" stroke="#bac6da22"/>
  <text x="120" y="300" fill="#94a3b8" font-family="Consolas, monospace" font-size="18">Business,Phone,ZIP,City</text>
  <text x="120" y="340" fill="#cbd5e1" font-family="Consolas, monospace" font-size="18">"Acme Clinic",05551200,33101,Miami</text>
  <text x="120" y="380" fill="#cbd5e1" font-family="Consolas, monospace" font-size="18">"Cafe Renée",05559911,75001,Paris</text>
  <text x="120" y="420" fill="#f87171" font-family="Consolas, monospace" font-size="18">Café RenÃ©e  ← encoding garbage risk</text>
  <text x="120" y="470" fill="#7b8aa3" font-family="Segoe UI, Arial, sans-serif" font-size="18">Raw CSV · easy to break leading zeros &amp; accents</text>
`;

const afterBody = `
  <rect x="88" y="250" width="1024" height="340" rx="16" fill="#182236" stroke="#6366f144"/>
  <rect x="88" y="250" width="1024" height="56" fill="#4f46e5"/>
  <text x="120" y="285" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">Business</text>
  <text x="420" y="285" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">Phone</text>
  <text x="700" y="285" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">ZIP</text>
  <text x="900" y="285" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">City</text>
  <rect x="88" y="306" width="1024" height="48" fill="#f1f5f910"/>
  <text x="120" y="338" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="18">Acme Clinic</text>
  <text x="420" y="338" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="18">05551200</text>
  <text x="700" y="338" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="18">33101</text>
  <text x="900" y="338" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="18">Miami</text>
  <text x="120" y="390" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="18">Café Renée</text>
  <text x="420" y="390" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="18">05559911</text>
  <text x="700" y="390" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="18">75001</text>
  <text x="900" y="390" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="18">Paris</text>
  <text x="120" y="520" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="18">Styled header · filters · text-safe phone/ZIP</text>
`;

const settingsBody = `
  <rect x="88" y="250" width="480" height="340" rx="16" fill="#182236" stroke="#bac6da22"/>
  <text x="120" y="300" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700">Delimiter</text>
  <rect x="120" y="320" width="400" height="44" rx="10" fill="#141d2f" stroke="#6366f155"/>
  <text x="140" y="348" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="18">Auto-detect (comma / ; / tab / |)</text>
  <text x="120" y="410" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700">Encoding</text>
  <rect x="120" y="430" width="400" height="44" rx="10" fill="#141d2f" stroke="#14b8a655"/>
  <text x="140" y="458" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="18">UTF-8 · Windows-1252 · Latin-1</text>
  <text x="120" y="530" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="18">Header row · cleanup toggles</text>
  <rect x="620" y="250" width="492" height="340" rx="16" fill="#182236" stroke="#bac6da22"/>
  <text x="660" y="310" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700">Columns</text>
  <text x="660" y="360" fill="#cbd5e1" font-family="Segoe UI, Arial, sans-serif" font-size="18">☑ Phone → force Text</text>
  <text x="660" y="400" fill="#cbd5e1" font-family="Segoe UI, Arial, sans-serif" font-size="18">☑ ZIP → force Text</text>
  <text x="660" y="440" fill="#cbd5e1" font-family="Segoe UI, Arial, sans-serif" font-size="18">☑ Trim whitespace</text>
  <text x="660" y="480" fill="#cbd5e1" font-family="Segoe UI, Arial, sans-serif" font-size="18">☑ Remove duplicate rows</text>
`;

const sheetsBody = `
  <rect x="88" y="260" width="1024" height="320" rx="18" fill="#182236" stroke="#bac6da22"/>
  <text x="120" y="320" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700">Sheets to export</text>
  <rect x="120" y="360" width="280" height="56" rx="12" fill="#141d2f" stroke="#14b8a6"/>
  <text x="150" y="395" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="18">☑ Leads</text>
  <rect x="420" y="360" width="280" height="56" rx="12" fill="#141d2f" stroke="#6366f1"/>
  <text x="450" y="395" fill="#c7d2fe" font-family="Segoe UI, Arial, sans-serif" font-size="18">☑ Contacts</text>
  <rect x="720" y="360" width="280" height="56" rx="12" fill="#141d2f" stroke="#bac6da33"/>
  <text x="750" y="395" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="18">☐ Archive</text>
  <text x="120" y="480" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="18">Each selected sheet becomes its own CSV · multi-select → ZIP</text>
`;

const privacyBody = `
  <circle cx="600" cy="380" r="120" fill="#14b8a622" stroke="#14b8a6" stroke-width="3"/>
  <rect x="540" y="330" width="120" height="90" rx="16" fill="#182236" stroke="#818cf8" stroke-width="3"/>
  <circle cx="600" cy="360" r="14" fill="#6366f1"/>
  <path d="M570 400 h60 v20 h-60 z" fill="#5eead4"/>
  <text x="250" y="540" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700">100% client-side · files never leave your browser</text>
`;

await writePng(
  "csvexcelconverter-cover.png",
  svg({
    title: "CSV to Excel Converter",
    subtitle: "Upload · Preview · Format · Export — free in your browser",
    body: uiPanel,
  })
);

await writePng(
  "csvexcelconverter-preview.png",
  svg({
    title: "Live preview before you convert",
    subtitle: "Confirm rows, columns, and encoding first",
    body: uiPanel,
  })
);

await writePng(
  "csvexcelconverter-rawcsv.png",
  svg({
    title: "Raw CSV before conversion",
    subtitle: "Unformatted text — zeros and accents at risk",
    body: beforeBody,
  })
);

await writePng(
  "csvexcelconverter-formattedxlsx.png",
  svg({
    title: "Formatted Excel after conversion",
    subtitle: "Styled headers · autofit · text-safe columns",
    body: afterBody,
  })
);

await writePng(
  "csvexcelconverter-settings.png",
  svg({
    title: "Delimiter, encoding & column types",
    subtitle: "Override auto-detect when European CSVs or phones break",
    body: settingsBody,
  })
);

await writePng(
  "csvexcelconverter-sheets.png",
  svg({
    title: "Multi-sheet Excel to CSV",
    subtitle: "Pick sheets · download ZIP when exporting many",
    body: sheetsBody,
  })
);

await writePng(
  "csvexcelconverter-privacy.png",
  svg({
    title: "Private by design",
    subtitle: "No server upload for conversion",
    body: privacyBody,
  })
);

console.log("done");
