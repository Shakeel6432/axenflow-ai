/**
 * Generate updated Phone Validator blog images (single check + What We Check + bulk gate).
 * Run: node scripts/gen-phonevalidator-blog-images.mjs
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
  <text x="88" y="168" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="38" font-weight="700">${escapeXml(title)}</text>
  ${subtitle ? `<text x="88" y="215" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="20">${escapeXml(subtitle)}</text>` : ""}
  ${body || ""}
</svg>`;
}

async function writePng(name, svgString) {
  await sharp(Buffer.from(svgString)).png().toFile(path.join(outDir, name));
  console.log("wrote", name);
}

const singleBody = `
  <rect x="88" y="250" width="240" height="56" rx="12" fill="#141d2f" stroke="#6366f155"/>
  <text x="110" y="285" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="16">United States (+1)</text>
  <rect x="348" y="250" width="560" height="56" rx="12" fill="#141d2f" stroke="#6366f155"/>
  <text x="370" y="285" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="18">4155552671</text>
  <rect x="928" y="258" width="184" height="40" rx="10" fill="#4f46e5"/>
  <text x="955" y="284" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">Check Number</text>
  <rect x="88" y="330" width="1024" height="260" rx="16" fill="#141d2f" stroke="#14b8a644"/>
  <rect x="880" y="350" width="200" height="40" rx="10" fill="#14b8a633"/>
  <text x="940" y="376" fill="#14b8a6" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700">Valid</text>
  <text x="120" y="380" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">4155552671</text>
  <text x="120" y="430" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="17">✓ Valid format for United States</text>
  <text x="120" y="475" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="17">✓ Normalized to E.164: +14155552671</text>
  <text x="120" y="520" fill="#f59e0b" font-family="Segoe UI, Arial, sans-serif" font-size="17">⚠ Line type: Fixed or Mobile · Likely carrier from prefixes when known</text>
`;

const whatBody = `
  <rect x="88" y="250" width="500" height="140" rx="14" fill="#141d2f" stroke="#6366f144"/>
  <text x="110" y="295" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">Format validation</text>
  <text x="110" y="335" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="16">Structurally valid for country</text>
  <rect x="612" y="250" width="500" height="140" rx="14" fill="#141d2f" stroke="#14b8a644"/>
  <text x="634" y="295" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">E.164 normalization</text>
  <text x="634" y="335" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="16">+countrycode for SMS / CRM APIs</text>
  <rect x="88" y="420" width="500" height="140" rx="14" fill="#141d2f" stroke="#f59e0b44"/>
  <text x="110" y="465" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">Line type</text>
  <text x="110" y="505" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="16">Mobile / Landline / VoIP</text>
  <rect x="612" y="420" width="500" height="140" rx="14" fill="#141d2f" stroke="#bac6da22"/>
  <text x="634" y="465" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">Likely carrier</text>
  <text x="634" y="505" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="16">Prefix estimates · not live HLR</text>
`;

const bulkBody = `
  <rect x="88" y="250" width="1024" height="320" rx="16" fill="#141d2f" stroke="#6366f144"/>
  <text x="120" y="300" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700">Bulk CSV upload · sign in · up to 10,000 phones · 8MB</text>
  <rect x="120" y="330" width="960" height="200" rx="12" fill="#182236"/>
  <rect x="120" y="330" width="960" height="44" fill="#4f46e5"/>
  <text x="140" y="358" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">original_number · valid · e164_format · line_type · country</text>
  <text x="140" y="410" fill="#cbd5e1" font-family="Consolas, monospace" font-size="15">+1 (415) 555-2671 · Valid · +14155552671 · Fixed or Mobile · US</text>
  <text x="140" y="445" fill="#5eead4" font-family="Consolas, monospace" font-size="15">03001234567 · Valid · +923001234567 · Mobile · Pakistan</text>
  <text x="140" y="480" fill="#f87171" font-family="Consolas, monospace" font-size="15">123 · Invalid · · Unknown ·</text>
  <text x="120" y="555" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="16">Sample preview shown before signup · free account unlocks upload</text>
`;

await writePng(
  "phonevalidator-single-check.png",
  svg({
    title: "Free single phone check",
    subtitle: "No signup · country selector · Valid badge · checklist",
    body: singleBody,
  })
);

await writePng(
  "phonevalidator-what-we-check.png",
  svg({
    title: "What we check",
    subtitle: "Format · E.164 · line type · likely carrier prefixes",
    body: whatBody,
  })
);

await writePng(
  "phonevalidator-bulk-gate.png",
  svg({
    title: "Bulk CSV phone validation",
    subtitle: "Sample report preview · clear limits · account for upload",
    body: bulkBody,
  })
);

await writePng(
  "phonevalidator-cover.png",
  svg({
    title: "Phone Validator",
    subtitle: "Free single check · bulk CSV · Mobile / Landline / VoIP · E.164",
    body: singleBody,
  })
);

// Keep results image aligned with current export columns
await writePng(
  "phonevalidator-results.png",
  svg({
    title: "Phone validation results",
    subtitle: "E.164 · status · line type · country · operator columns",
    body: `
  <rect x="88" y="250" width="1024" height="320" rx="16" fill="#141d2f" stroke="#14b8a644"/>
  <rect x="120" y="290" width="960" height="44" fill="#4f46e5"/>
  <text x="140" y="318" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">Phone · Type · Country · Operator · Status</text>
  <text x="140" y="380" fill="#cbd5e1" font-family="Consolas, monospace" font-size="16">+14155552671 · Fixed or Mobile · United States · Valid</text>
  <text x="140" y="425" fill="#5eead4" font-family="Consolas, monospace" font-size="16">+923001234567 · Mobile · Pakistan · Jazz Pakistan · Valid</text>
  <text x="140" y="470" fill="#f59e0b" font-family="Consolas, monospace" font-size="16">+442079460958 · Landline · United Kingdom · Valid</text>
  <text x="140" y="515" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="16">Filter Valid + Mobile for SMS. Keep all Valid E.164 for CRM.</text>
`,
  })
);

console.log("done");
