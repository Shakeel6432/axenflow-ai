/**
 * Generate updated Email Validator blog images (single check + What We Check + bulk gate).
 * Run: npx tsx scripts/gen-emailvalidator-blog-images.mjs
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
  <rect x="88" y="250" width="1024" height="56" rx="12" fill="#141d2f" stroke="#6366f155"/>
  <text x="110" y="285" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="18">alex@acme.com</text>
  <rect x="900" y="258" width="190" height="40" rx="10" fill="#4f46e5"/>
  <text x="935" y="284" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="700">Check Email</text>
  <rect x="88" y="330" width="1024" height="260" rx="16" fill="#141d2f" stroke="#14b8a644"/>
  <rect x="900" y="350" width="180" height="40" rx="10" fill="#14b8a633"/>
  <text x="955" y="376" fill="#14b8a6" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700">Valid</text>
  <text x="120" y="380" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">alex@acme.com</text>
  <text x="120" y="430" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="17">✓ Syntax valid</text>
  <text x="420" y="430" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="17">✓ DNS resolves</text>
  <text x="720" y="430" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="17">✓ MX records</text>
  <text x="120" y="475" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="17">✓ Not disposable</text>
  <text x="420" y="475" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="17">✓ Not role-based</text>
  <text x="720" y="475" fill="#f59e0b" font-family="Segoe UI, Arial, sans-serif" font-size="17">⚠ No SMTP probe</text>
  <text x="120" y="530" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="17">Estimated bounce risk: Low · Free check · no signup</text>
`;

const whatBody = `
  <rect x="88" y="250" width="320" height="140" rx="14" fill="#141d2f" stroke="#6366f144"/>
  <text x="110" y="295" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">Syntax</text>
  <text x="110" y="335" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="16">Typos &amp; bad format</text>
  <rect x="430" y="250" width="320" height="140" rx="14" fill="#141d2f" stroke="#14b8a644"/>
  <text x="452" y="295" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">MX / DNS</text>
  <text x="452" y="335" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="16">Can domain receive mail?</text>
  <rect x="772" y="250" width="340" height="140" rx="14" fill="#141d2f" stroke="#f59e0b44"/>
  <text x="794" y="295" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">Disposable / Role</text>
  <text x="794" y="335" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="16">Temp mail &amp; info@ flags</text>
  <rect x="88" y="420" width="1024" height="140" rx="14" fill="#141d2f" stroke="#bac6da22"/>
  <text x="120" y="475" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700">Bounce risk estimate + catch-all honesty</text>
  <text x="120" y="520" fill="#a8b4c7" font-family="Segoe UI, Arial, sans-serif" font-size="18">Low / Medium / High from signals — mailbox not confirmed without SMTP</text>
`;

const bulkBody = `
  <rect x="88" y="250" width="1024" height="320" rx="16" fill="#141d2f" stroke="#6366f144"/>
  <text x="120" y="300" fill="#f8fafc" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700">Bulk CSV upload · sign in · up to 5,000 emails · 8MB</text>
  <rect x="120" y="330" width="960" height="200" rx="12" fill="#182236"/>
  <rect x="120" y="330" width="960" height="44" fill="#4f46e5"/>
  <text x="140" y="358" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">original_email · status · reason · bounce_risk</text>
  <text x="140" y="410" fill="#cbd5e1" font-family="Consolas, monospace" font-size="15">alex@acme.com · Valid · MX found · Low</text>
  <text x="140" y="445" fill="#f59e0b" font-family="Consolas, monospace" font-size="15">info@acme.com · Risky · Role account · Low</text>
  <text x="140" y="480" fill="#f87171" font-family="Consolas, monospace" font-size="15">temp@mailinator.com · Invalid · Disposable · High</text>
  <text x="120" y="555" fill="#5eead4" font-family="Segoe UI, Arial, sans-serif" font-size="16">Sample preview shown before signup · free account unlocks upload</text>
`;

await writePng(
  "emailvalidator-single-check.png",
  svg({
    title: "Free single email check",
    subtitle: "No signup · status badge · checklist breakdown",
    body: singleBody,
  })
);

await writePng(
  "emailvalidator-what-we-check.png",
  svg({
    title: "What we check",
    subtitle: "Syntax · DNS · MX · disposable · role · bounce risk",
    body: whatBody,
  })
);

await writePng(
  "emailvalidator-bulk-gate.png",
  svg({
    title: "Bulk CSV validation",
    subtitle: "Sample report preview · clear limits · account for upload",
    body: bulkBody,
  })
);

// Refresh cover to mention free single check
await writePng(
  "emailvalidator-cover.png",
  svg({
    title: "Email Validator",
    subtitle: "Free single check · bulk CSV · Valid / Invalid / Risky",
    body: singleBody,
  })
);

console.log("done");
