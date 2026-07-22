/** Shared AI outreach template helpers. */

export type OutreachKind = "cold_email" | "phone_script" | "follow_up";

export type OutreachInput = {
  businessName: string;
  category: string;
  city: string;
  senderName: string;
};

export type OutreachDraft = {
  subject: string;
  body: string;
};

export type CustomTemplate = {
  id: string;
  name: string;
  /** Full message template. Use {{business_name}}, {{category}}, {{city}}, {{sender_name}} */
  prompt: string;
};

export const PROMPT_PLACEHOLDER =
  `Subject: Quick idea for {{business_name}} in {{city}}

Hello {{business_name}} team,

I help {{category}} businesses in {{city}} get more qualified leads without adding headcount.

We built a short system that finds ready-to-buy prospects so your team can focus on closing.

Open to a 10-minute call this week?

Best regards,
{{sender_name}}`;

function clean(value: string, fallback: string) {
  const t = String(value || "").trim();
  return t || fallback;
}

export function generateOutreach(kind: OutreachKind, data: OutreachInput): OutreachDraft {
  const name = clean(data.businessName, "there");
  const category = clean(data.category, "your industry");
  const location = clean(data.city, "your area");
  const sender = clean(data.senderName, "AxenFlow AI");

  if (kind === "phone_script") {
    return {
      subject: `Call script: ${name}`,
      body:
        `Hi there, this is [Your Name] with ${sender}. ` +
        `I'll keep it brief. I work with ${category} companies around ${location}. ` +
        `We help teams like ${name} fill their pipeline with verified local leads. ` +
        `Do you have 30 seconds, or should I try you later?`,
    };
  }

  if (kind === "follow_up") {
    return {
      subject: `Following up: ${name}`,
      body:
        `Hello ${name} team,\n\n` +
        `Just bumping this in case my last note got buried. ` +
        `Happy to share a sample of verified leads for your market, no obligation.\n\n` +
        `Worth a quick reply?\n\n` +
        `Best regards,\n${sender}`,
    };
  }

  return {
    subject: `Quick idea for ${name} in ${location}`,
    body:
      `Hello ${name} team,\n\n` +
      `I help ${category} businesses in ${location} get more qualified leads without adding headcount.\n\n` +
      `We built a short system that finds ready-to-buy prospects and drafts outreach so your team can focus on closing.\n\n` +
      `Open to a 10-minute call this week to see if it's a fit?\n\n` +
      `Best regards,\n${sender}`,
  };
}

/** Fill {{placeholders}} in a custom prompt. Optional first line: Subject: ... */
export function fillCustomPrompt(prompt: string, data: OutreachInput): OutreachDraft {
  const vars: Record<string, string> = {
    business_name: clean(data.businessName, "there"),
    company: clean(data.businessName, "there"),
    name: clean(data.businessName, "there"),
    category: clean(data.category, "your industry"),
    industry: clean(data.category, "your industry"),
    city: clean(data.city, "your area"),
    location: clean(data.city, "your area"),
    sender_name: clean(data.senderName, "AxenFlow AI"),
    sender: clean(data.senderName, "AxenFlow AI"),
  };

  let filled = String(prompt || "");
  for (const [key, value] of Object.entries(vars)) {
    filled = filled.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi"), value);
  }

  const lines = filled.split(/\r?\n/);
  const subjectMatch = lines[0]?.match(/^subject\s*:\s*(.+)$/i);
  if (subjectMatch) {
    return {
      subject: subjectMatch[1].trim(),
      body: lines.slice(1).join("\n").replace(/^\n+/, ""),
    };
  }

  const name = vars.business_name;
  return {
    subject: `Message for ${name}`,
    body: filled.trim(),
  };
}

/** Insert change notes into the prompt body (before Best regards when present). */
export function applyChangeNotes(basePrompt: string, changeNotes: string): string {
  const notes = changeNotes.trim();
  if (!notes) return basePrompt;
  const cleaned = String(basePrompt || "")
    .replace(/\n\n\[Edit notes:[\s\S]*$/i, "")
    .trim();
  if (/best regards,/i.test(cleaned)) {
    return cleaned.replace(/(best regards,)/i, `${notes}\n\n$1`);
  }
  return `${cleaned}\n\n${notes}`;
}

export function draftToPrompt(draft: OutreachDraft): string {
  return `Subject: ${draft.subject}\n\n${draft.body}`;
}

/** Normalize AI/template text so Subject + body show with readable line breaks. */
export function formatOutreachTemplate(raw: string): string {
  let text = String(raw || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
  if (!text) return "";

  // If subject is jammed into one line with body, split it
  if (!text.includes("\n") && /^subject\s*:/i.test(text)) {
    text = text.replace(/^(subject\s*:\s*.+?)(\s+)(dear\b|hi\b|hello\b|hey\b)/i, "$1\n\n$3");
  }

  const lines = text.split("\n");
  const subjectLine = lines[0]?.match(/^subject\s*:\s*(.+)$/i);
  if (subjectLine) {
    let body = lines.slice(1).join("\n").trim();
    // Soft-wrap long single-paragraph bodies into readable chunks
    if (body && !body.includes("\n") && body.length > 120) {
      body = body
        .replace(/\s+(Dear\b|Hi\b|Hello\b|Hey\b)/g, "\n\n$1")
        .replace(/([.!?])\s+(?=[A-Z{])/g, "$1\n\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }
    return `Subject: ${subjectLine[1].trim()}\n\n${body}`.trim();
  }

  if (!text.includes("\n") && text.length > 120) {
    return text
      .replace(/([.!?])\s+(?=[A-Z{])/g, "$1\n\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  return text;
}

export function pickBusinessName(row: Record<string, string>): string {
  const preferredKeys = [
    "Business Name",
    "Company Name",
    "Company",
    "Organization",
    "Organisation",
    "Account Name",
    "Lead Name",
    "Lead",
    "Business",
    "Name",
  ];
  for (const key of preferredKeys) {
    const val = String(row[key] || "").trim();
    if (val) return val;
  }

  for (const [key, raw] of Object.entries(row)) {
    const val = String(raw || "").trim();
    if (!val) continue;
    const k = key.toLowerCase();
    if (/(email|phone|mobile|address|status|owner|website|url|zip|postal)/.test(k)) continue;
    if (/(business|company|organization|organisation|account|lead)/.test(k) && /name/.test(k)) {
      return val;
    }
    if (/^(business|company|organization|organisation|account|lead|name)$/.test(k)) {
      return val;
    }
  }

  for (const [key, raw] of Object.entries(row)) {
    const val = String(raw || "").trim();
    if (!val) continue;
    if (/^(business\s*name|company(\s*name)?|name)$/i.test(key.trim())) return val;
  }

  return "";
}

export function pickCategory(row: Record<string, string>, fallback = ""): string {
  for (const [key, raw] of Object.entries(row)) {
    const val = String(raw || "").trim();
    if (!val) continue;
    if (/^(category|industry|type|keyword|niche)$/i.test(key.trim())) return val;
  }
  return fallback;
}

export function pickCity(row: Record<string, string>, fallback = ""): string {
  for (const [key, raw] of Object.entries(row)) {
    const val = String(raw || "").trim();
    if (!val) continue;
    if (/^(city|location|city\s*\/\s*location)$/i.test(key.trim())) return val;
  }
  const address = String(row.Address || row.address || "").trim();
  if (!address) return fallback;
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 2] || fallback;
  return fallback;
}

function safeColumnName(name: string): string {
  return String(name || "Custom")
    .replace(/[\r\n,]/g, " ")
    .trim()
    .slice(0, 40) || "Custom";
}

export type EnrichOptions = {
  senderName: string;
  defaultCategory?: string;
  defaultCity?: string;
  kinds?: OutreachKind[];
  customTemplates?: CustomTemplate[];
};

/** Add selected outreach columns next to each business row. */
export function enrichRowsWithOutreach(
  rows: Record<string, string>[],
  opts: EnrichOptions
): { rows: Record<string, string>[]; filled: number; skipped: number } {
  const kinds = opts.kinds || [];
  const customs = opts.customTemplates || [];
  let filled = 0;
  let skipped = 0;

  const out = rows.map((row) => {
    const businessName = pickBusinessName(row);
    if (!businessName) {
      skipped += 1;
      return { ...row };
    }
    filled += 1;
    const next: Record<string, string> = { ...row };
    if (!next["Business Name"]) next["Business Name"] = businessName;

    const input: OutreachInput = {
      businessName,
      category: pickCategory(row, opts.defaultCategory || ""),
      city: pickCity(row, opts.defaultCity || ""),
      senderName: opts.senderName,
    };

    for (const kind of kinds) {
      const draft = generateOutreach(kind, input);
      if (kind === "cold_email") {
        next["Cold Email Subject"] = draft.subject;
        next["Cold Email Body"] = draft.body;
      } else if (kind === "phone_script") {
        next["Phone Script"] = draft.body;
      } else {
        next["Follow-up Subject"] = draft.subject;
        next["Follow-up Body"] = draft.body;
      }
    }

    for (const tpl of customs) {
      if (!tpl.prompt?.trim()) continue;
      const draft = fillCustomPrompt(tpl.prompt, input);
      const label = safeColumnName(tpl.name);
      next[`${label} Subject`] = draft.subject;
      next[`${label} Body`] = draft.body;
    }

    return next;
  });

  return { rows: out, filled, skipped };
}
