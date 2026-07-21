import type { LeadStatus } from "@/lib/bbb-validate";
import { digitsOnly, formatUsPhone, scorePhone, splitContactValues } from "@/lib/bbb-validate";

export type PhoneCheckOptions = {
  format: boolean;
  normalizeUs: boolean;
  keepOneOnly: boolean;
  rejectTollFree: boolean;
  rejectShort: boolean;
};

export const DEFAULT_PHONE_OPTIONS: PhoneCheckOptions = {
  format: true,
  normalizeUs: true,
  keepOneOnly: true,
  rejectTollFree: false,
  rejectShort: true,
};

const TOLL_FREE_PREFIXES = new Set(["800", "888", "877", "866", "855", "844", "833"]);

export function isTollFree(phone: string): boolean {
  let digits = digitsOnly(phone);
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length < 10) return false;
  return TOLL_FREE_PREFIXES.has(digits.slice(0, 3));
}

export function isShortCode(phone: string): boolean {
  const digits = digitsOnly(phone);
  return digits.length > 0 && digits.length < 7;
}

export function pickPhoneInputs(raw: string, keepOneOnly: boolean): string[] {
  const values = splitContactValues(raw).filter(Boolean);
  if (!values.length) return [];
  if (!keepOneOnly) return [...new Set(values)];
  for (const v of values) {
    if (scorePhone(v) === "Valid") return [v];
  }
  return [values[0]];
}

export type PhoneValidationResult = {
  original: string;
  phone: string;
  status: LeadStatus;
  digits: string;
  tollFree: boolean | null;
  shortCode: boolean | null;
  collapsed: boolean;
  notes: string[];
};

export function validatePhoneLocal(
  raw: string,
  options: PhoneCheckOptions
): PhoneValidationResult {
  const all = splitContactValues(raw);
  const collapsed = all.length > 1;
  const picked = pickPhoneInputs(raw, options.keepOneOnly);
  const original = picked[0] || "";
  const notes: string[] = [];

  if (!original) {
    return {
      original: "",
      phone: "",
      status: "Unknown",
      digits: "",
      tollFree: null,
      shortCode: null,
      collapsed,
      notes: ["Empty phone"],
    };
  }

  if (collapsed && options.keepOneOnly) {
    notes.push("Multiple numbers found; kept one");
  }

  let status: LeadStatus = "Unknown";
  if (options.format) {
    status = scorePhone(original);
  } else {
    status = digitsOnly(original) ? "Valid" : "Unknown";
  }

  const shortCode = options.rejectShort ? isShortCode(original) : null;
  if (shortCode) {
    status = "Invalid";
    notes.push("Too short / short-code");
  }

  const tollFree = options.rejectTollFree ? isTollFree(original) : null;
  if (tollFree) {
    status = "Invalid";
    notes.push("Toll-free rejected");
  }

  const phone = options.normalizeUs ? formatUsPhone(original) : original.trim();
  let digits = digitsOnly(phone);
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);

  return {
    original,
    phone,
    status,
    digits,
    tollFree,
    shortCode,
    collapsed,
    notes,
  };
}
