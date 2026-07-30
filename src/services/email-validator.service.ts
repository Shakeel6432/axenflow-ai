import dns from "node:dns/promises";
import { scoreEmailSyntax, type LeadStatus } from "@/lib/bbb-validate";
import {
  DEFAULT_EMAIL_OPTIONS,
  estimateHardBounce,
  finalizeEmailStatus,
  isDisposableEmail,
  isRoleEmail,
  pickEmailInput,
  type EmailCheckOptions,
  type EmailValidationResult,
} from "@/lib/validators/email";

const dnsCache = new Map<string, LeadStatus>();
const mxCache = new Map<string, LeadStatus>();

export async function checkDns(domain: string): Promise<LeadStatus> {
  if (dnsCache.has(domain)) return dnsCache.get(domain)!;
  try {
    const a = await dns.resolve4(domain);
    if (a?.length) {
      dnsCache.set(domain, "Valid");
      return "Valid";
    }
  } catch {
    // try AAAA
  }
  try {
    await dns.resolve6(domain);
    dnsCache.set(domain, "Valid");
    return "Valid";
  } catch {
    dnsCache.set(domain, "Invalid");
    return "Invalid";
  }
}

export async function checkMx(domain: string): Promise<LeadStatus> {
  if (mxCache.has(domain)) return mxCache.get(domain)!;
  try {
    const mx = await dns.resolveMx(domain);
    if (mx?.length) {
      mxCache.set(domain, "Valid");
      return "Valid";
    }
    mxCache.set(domain, "Invalid");
    return "Invalid";
  } catch {
    mxCache.set(domain, "Invalid");
    return "Invalid";
  }
}

/** Shared single-email validation used by bulk API and free public check. */
export async function validateOneEmail(
  raw: string,
  options: EmailCheckOptions = DEFAULT_EMAIL_OPTIONS
): Promise<EmailValidationResult[]> {
  const emails = pickEmailInput(raw, options.keepOneOnly);
  if (!emails.length) {
    return [
      {
        email: "",
        status: "Unknown",
        syntax: "Unknown",
        dns: "Skipped",
        mx: "Skipped",
        disposable: null,
        role: null,
        hardBounceEstimate: "Skipped",
        notes: ["Empty email"],
      },
    ];
  }

  const out: EmailValidationResult[] = [];
  for (const email of emails) {
    const notes: string[] = [];
    const syntax = scoreEmailSyntax(email);
    let dnsStatus: LeadStatus | "Skipped" = "Skipped";
    let mxStatus: LeadStatus | "Skipped" = "Skipped";
    let disposable: boolean | null = null;
    let role: boolean | null = null;

    const domain = email.includes("@") ? email.split("@")[1] : "";

    if (syntax === "Invalid") notes.push("Invalid syntax");

    if (options.disposable && syntax !== "Invalid") {
      disposable = isDisposableEmail(email);
      if (disposable) notes.push("Disposable domain");
    }
    if (options.role && syntax !== "Invalid") {
      role = isRoleEmail(email);
      if (role) notes.push("Role account");
    }

    if (syntax === "Valid" && domain) {
      if (options.dns) dnsStatus = await checkDns(domain);
      if (options.mx) mxStatus = await checkMx(domain);
      if (dnsStatus === "Invalid") notes.push("DNS failed");
      if (mxStatus === "Invalid") notes.push("No MX record");
      if (mxStatus === "Valid") notes.push("MX found");
    }

    // Honest note: we do not SMTP-probe, so catch-all / mailbox existence is not confirmed.
    if (syntax === "Valid" && mxStatus === "Valid") {
      notes.push("Mailbox not confirmed (no SMTP / catch-all probe)");
    }

    const status = finalizeEmailStatus({
      syntax: options.syntax ? syntax : "Valid",
      dns: dnsStatus,
      mx: mxStatus,
      disposable,
      role: null, // role is flag, not auto-invalid
    });

    const hardBounceEstimate = options.hardBounceEstimate
      ? estimateHardBounce({ syntax, dns: dnsStatus, mx: mxStatus })
      : "Skipped";

    if (hardBounceEstimate === "Likely") notes.push("Hard bounce likely (estimate)");

    out.push({
      email,
      status,
      syntax,
      dns: dnsStatus,
      mx: mxStatus,
      disposable,
      role,
      hardBounceEstimate,
      notes,
    });
  }
  return out;
}

export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
) {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, Math.max(items.length, 1)) }, () => worker())
  );
  return results;
}

export function summarizeEmailResults(results: EmailValidationResult[]) {
  return {
    total: results.length,
    valid: results.filter((r) => r.status === "Valid").length,
    invalid: results.filter((r) => r.status === "Invalid").length,
    unknown: results.filter((r) => r.status === "Unknown").length,
    disposable: results.filter((r) => r.disposable).length,
    role: results.filter((r) => r.role).length,
    hardBounceLikely: results.filter((r) => r.hardBounceEstimate === "Likely").length,
  };
}

/** Display badge for free-check UI (role + valid = Risky). */
export type EmailDisplayBadge = "Valid" | "Invalid" | "Risky" | "Unknown";

export function emailDisplayBadge(result: EmailValidationResult): EmailDisplayBadge {
  if (result.status === "Invalid") return "Invalid";
  if (result.status === "Unknown") return "Unknown";
  if (result.role || result.hardBounceEstimate === "Unknown") return "Risky";
  return "Valid";
}

export function bounceRiskLabel(
  estimate: EmailValidationResult["hardBounceEstimate"]
): "Low" | "Medium" | "High" | "Unknown" {
  if (estimate === "Likely") return "High";
  if (estimate === "Unlikely") return "Low";
  if (estimate === "Unknown") return "Medium";
  return "Unknown";
}
