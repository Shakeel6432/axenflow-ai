import type { LeadStatus } from "@/lib/bbb-validate";
import { scoreEmailSyntax, splitContactValues } from "@/lib/bbb-validate";

export type EmailCheckOptions = {
  syntax: boolean;
  dns: boolean;
  mx: boolean;
  disposable: boolean;
  role: boolean;
  hardBounceEstimate: boolean;
  keepOneOnly: boolean;
};

export const DEFAULT_EMAIL_OPTIONS: EmailCheckOptions = {
  syntax: true,
  dns: true,
  mx: true,
  disposable: true,
  role: true,
  hardBounceEstimate: true,
  keepOneOnly: true,
};

const ROLE_LOCALS = new Set([
  "admin",
  "info",
  "support",
  "sales",
  "contact",
  "help",
  "noreply",
  "no-reply",
  "billing",
  "office",
  "hello",
  "team",
  "mail",
]);

/** Common disposable / temp-mail domains (extend over time). */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.org",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "maildrop.cc",
  "discard.email",
  "fakeinbox.com",
  "throwaway.email",
  "mailnesia.com",
]);

export function isRoleEmail(email: string): boolean {
  const local = email.split("@")[0]?.toLowerCase() || "";
  return ROLE_LOCALS.has(local);
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  if (!domain) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  // subdomain of known disposable
  for (const d of DISPOSABLE_DOMAINS) {
    if (domain.endsWith(`.${d}`)) return true;
  }
  return false;
}

export function pickEmailInput(raw: string, keepOneOnly: boolean): string[] {
  const values = splitContactValues(raw)
    .map((v) => v.toLowerCase().trim())
    .filter(Boolean);
  if (!values.length) return [];
  if (keepOneOnly) {
    for (const v of values) {
      if (scoreEmailSyntax(v) === "Valid") return [v];
    }
    return [values[0]];
  }
  return [...new Set(values)];
}

export type EmailValidationResult = {
  email: string;
  status: LeadStatus;
  syntax: LeadStatus;
  dns: LeadStatus | "Skipped";
  mx: LeadStatus | "Skipped";
  disposable: boolean | null;
  role: boolean | null;
  hardBounceEstimate: "Likely" | "Unlikely" | "Unknown" | "Skipped";
  notes: string[];
};

export function finalizeEmailStatus(parts: {
  syntax: LeadStatus;
  dns: LeadStatus | "Skipped";
  mx: LeadStatus | "Skipped";
  disposable: boolean | null;
  role: boolean | null;
}): LeadStatus {
  if (parts.syntax === "Invalid") return "Invalid";
  if (parts.syntax === "Unknown") return "Unknown";
  if (parts.disposable) return "Invalid";
  if (parts.mx === "Invalid" || parts.dns === "Invalid") return "Invalid";
  if (parts.mx === "Valid" || (parts.dns === "Valid" && parts.mx === "Skipped")) return "Valid";
  if (parts.mx === "Unknown" || parts.dns === "Unknown") return "Unknown";
  if (parts.syntax === "Valid") return "Valid";
  return "Unknown";
}

export function estimateHardBounce(parts: {
  syntax: LeadStatus;
  dns: LeadStatus | "Skipped";
  mx: LeadStatus | "Skipped";
}): "Likely" | "Unlikely" | "Unknown" {
  if (parts.syntax === "Invalid") return "Likely";
  if (parts.mx === "Invalid" || parts.dns === "Invalid") return "Likely";
  if (parts.mx === "Valid") return "Unlikely";
  if (parts.dns === "Valid" && parts.mx === "Skipped") return "Unlikely";
  return "Unknown";
}
