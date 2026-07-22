/** Shared BBB lead validation helpers (browser + API). */

export type LeadStatus = "Valid" | "Invalid" | "Unknown";

export type ValidatedLead = {
  "Business Name": string;
  "Phone Numbers": string;
  Emails: string;
  Address: string;
  Owner: string;
  "Email Status": LeadStatus;
  "Phone Status": LeadStatus;
  "Lead Status": LeadStatus;
  [key: string]: string;
};

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,24}$/i;

const HEADER_ALIASES: Record<string, string> = {
  "business name": "Business Name",
  business_name: "Business Name",
  businessname: "Business Name",
  name: "Business Name",
  company: "Business Name",
  "company name": "Business Name",
  business: "Business Name",
  organization: "Business Name",
  organisation: "Business Name",
  lead: "Business Name",
  "lead name": "Business Name",
  "account name": "Business Name",
  category: "Category",
  industry: "Category",
  type: "Category",
  keyword: "Category",
  niche: "Category",
  city: "City",
  location: "City",
  "city / location": "City",
  "city/location": "City",
  state: "State",
  "phone numbers": "Phone Numbers",
  phone_numbers: "Phone Numbers",
  phone: "Phone Numbers",
  phones: "Phone Numbers",
  mobile: "Phone Numbers",
  "mobile phone": "Phone Numbers",
  cellphone: "Phone Numbers",
  "cell phone": "Phone Numbers",
  cell: "Phone Numbers",
  telephone: "Phone Numbers",
  tel: "Phone Numbers",
  "contact phone": "Phone Numbers",
  emails: "Emails",
  email: "Emails",
  "e-mail": "Emails",
  "e mail": "Emails",
  mail: "Emails",
  "email address": "Emails",
  "email addresses": "Emails",
  "contact email": "Emails",
  address: "Address",
  owner: "Owner",
  contact: "Owner",
  "contact name": "Owner",
};

export function normalizeHeader(raw: string): string {
  const key = String(raw || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  return HEADER_ALIASES[key] || String(raw || "").replace(/^\uFEFF/, "").trim();
}

export function splitContactValues(raw: string): string[] {
  const text = String(raw || "").trim();
  if (!text) return [];
  const parts = text
    .split(/[|;]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  // Also split comma-separated phones like "a, b" but not emails (emails have one @)
  const expanded: string[] = [];
  for (const part of parts) {
    if (part.includes("@")) {
      expanded.push(part);
      continue;
    }
    if (part.includes(",") && /\d/.test(part)) {
      for (const sub of part.split(",").map((s) => s.trim()).filter(Boolean)) {
        expanded.push(sub);
      }
    } else {
      expanded.push(part);
    }
  }
  const out: string[] = [];
  for (const item of expanded) {
    if (item && !out.includes(item)) out.push(item);
  }
  return out;
}

export function digitsOnly(phone: string): string {
  return String(phone || "").replace(/\D+/g, "");
}

export function formatUsPhone(phone: string): string {
  let digits = digitsOnly(phone);
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return String(phone || "").trim();
}

export function scorePhone(phone: string): LeadStatus {
  const digits = digitsOnly(phone);
  if (!digits) return "Unknown";
  if (digits.length === 11 && digits.startsWith("1")) {
    return "Valid";
  }
  if (digits.length === 10) return "Valid";
  if (digits.length >= 7 && digits.length <= 15) return "Valid";
  return "Invalid";
}

export function pickBestPhone(raw: string): { phone: string; status: LeadStatus; collapsed: boolean } {
  const values = splitContactValues(raw);
  if (!values.length) return { phone: "", status: "Unknown", collapsed: false };
  let best = "";
  let bestStatus: LeadStatus = "Unknown";
  for (const value of values) {
    const status = scorePhone(value);
    if (status === "Valid") {
      return { phone: formatUsPhone(value), status: "Valid", collapsed: values.length > 1 };
    }
    if (!best || (status === "Unknown" && bestStatus === "Invalid")) {
      best = value;
      bestStatus = status;
    }
  }
  return {
    phone: best ? formatUsPhone(best) : "",
    status: bestStatus,
    collapsed: values.length > 1,
  };
}

export function scoreEmailSyntax(email: string): LeadStatus {
  const value = String(email || "").trim().toLowerCase();
  if (!value) return "Unknown";
  if (!EMAIL_RE.test(value)) return "Invalid";
  const domain = value.split("@")[1] || "";
  if (!domain.includes(".") || domain.startsWith(".") || domain.endsWith(".")) {
    return "Invalid";
  }
  return "Valid";
}

export function pickBestEmail(raw: string): { email: string; syntax: LeadStatus; collapsed: boolean } {
  const values = splitContactValues(raw);
  if (!values.length) return { email: "", syntax: "Unknown", collapsed: false };
  for (const value of values) {
    const email = value.toLowerCase().trim();
    if (scoreEmailSyntax(email) === "Valid") {
      return { email, syntax: "Valid", collapsed: values.length > 1 };
    }
  }
  const first = values[0].toLowerCase().trim();
  return { email: first, syntax: scoreEmailSyntax(first), collapsed: values.length > 1 };
}

export function combineLeadStatus(email: LeadStatus, phone: LeadStatus): LeadStatus {
  if (email === "Invalid" || phone === "Invalid") return "Invalid";
  if (email === "Valid" || phone === "Valid") return "Valid";
  return "Unknown";
}

export function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function parseCsv(text: string): Record<string, string>[] {
  const cleaned = String(text || "").replace(/^\uFEFF/, "");
  const lines: string[] = [];
  let buf = "";
  let inQuotes = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      buf += ch;
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && cleaned[i + 1] === "\n") i++;
      if (buf.trim()) lines.push(buf);
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) lines.push(buf);
  if (!lines.length) return [];

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (!h) return;
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

export function rowsToCsv(rows: Record<string, string>[]): string {
  if (!rows.length) return "";
  const preferred = [
    "Business Name",
    "Cold Email Subject",
    "Cold Email Body",
    "Phone Script",
    "Follow-up Subject",
    "Follow-up Body",
    "Phone Numbers",
    "Emails",
    "Address",
    "Owner",
    "Category",
    "City",
    "Email Status",
    "Phone Status",
    "Lead Status",
  ];
  const keys = new Set<string>();
  for (const row of rows) Object.keys(row).forEach((k) => keys.add(k));
  const headers = [
    ...preferred.filter((h) => keys.has(h)),
    ...[...keys].filter((k) => !preferred.includes(k)),
  ];
  const esc = (v: string) => {
    const s = String(v ?? "");
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h] || "")).join(","))].join(
    "\n"
  );
}

export function validateRowLocal(row: Record<string, string>): {
  row: ValidatedLead;
  phonesCollapsed: boolean;
  emailsCollapsed: boolean;
} {
  const name = String(row["Business Name"] || row.name || "").trim();
  const phonePick = pickBestPhone(row["Phone Numbers"] || row.phone || row.phones || "");
  const emailPick = pickBestEmail(row.Emails || row.email || row.emails || "");
  const emailStatus = emailPick.syntax;
  const phoneStatus = phonePick.status;
  const leadStatus = combineLeadStatus(emailStatus, phoneStatus);

  const out: ValidatedLead = {
    ...row,
    "Business Name": name,
    "Phone Numbers": phonePick.phone,
    Emails: emailPick.email,
    Address: String(row.Address || row.address || "").trim(),
    Owner: String(row.Owner || row.owner || "").trim(),
    "Email Status": emailStatus,
    "Phone Status": phoneStatus,
    "Lead Status": leadStatus,
  };

  return {
    row: out,
    phonesCollapsed: phonePick.collapsed,
    emailsCollapsed: emailPick.collapsed,
  };
}
