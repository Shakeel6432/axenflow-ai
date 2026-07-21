import { NextResponse } from "next/server";
import dns from "node:dns/promises";
import { parseCsv, type LeadStatus } from "@/lib/bbb-validate";
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
import { scoreEmailSyntax } from "@/lib/bbb-validate";

export const runtime = "nodejs";
export const maxDuration = 60;

const dnsCache = new Map<string, LeadStatus>();
const mxCache = new Map<string, LeadStatus>();

async function checkDns(domain: string): Promise<LeadStatus> {
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

async function checkMx(domain: string): Promise<LeadStatus> {
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

async function validateOne(
  raw: string,
  options: EmailCheckOptions
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
    const syntax = options.syntax ? scoreEmailSyntax(email) : scoreEmailSyntax(email);
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

async function mapPool<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>) {
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

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let options: EmailCheckOptions = { ...DEFAULT_EMAIL_OPTIONS };
    let emails: string[] = [];
    let rows: Record<string, string>[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const optsRaw = String(form.get("options") || "");
      if (optsRaw) {
        try {
          options = { ...DEFAULT_EMAIL_OPTIONS, ...JSON.parse(optsRaw) };
        } catch {
          /* keep defaults */
        }
      }
      const single = String(form.get("email") || "").trim();
      if (single) emails = [single];
      if (file instanceof File) {
        if (file.size > 8 * 1024 * 1024) {
          return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
        }
        rows = parseCsv(await file.text());
        emails = rows
          .map((r) => r.Emails || r.email || r.Email || "")
          .filter(Boolean);
      }
    } else {
      const body = (await req.json().catch(() => null)) as {
        email?: string;
        emails?: string[];
        csv?: string;
        options?: Partial<EmailCheckOptions>;
      } | null;
      if (body?.options) options = { ...DEFAULT_EMAIL_OPTIONS, ...body.options };
      if (body?.email) emails = [body.email];
      if (body?.emails?.length) emails = body.emails;
      if (body?.csv) {
        rows = parseCsv(body.csv);
        emails = rows.map((r) => r.Emails || r.email || r.Email || "").filter(Boolean);
      }
    }

    if (!emails.length) {
      return NextResponse.json({ error: "Provide an email or CSV with an Emails column" }, { status: 400 });
    }
    if (emails.length > 5000) {
      return NextResponse.json({ error: "Max 5000 emails per request" }, { status: 400 });
    }

    const nested = await mapPool(emails, 25, (raw) => validateOne(raw, options));
    const results = nested.flat();

    const counts = {
      total: results.length,
      valid: results.filter((r) => r.status === "Valid").length,
      invalid: results.filter((r) => r.status === "Invalid").length,
      unknown: results.filter((r) => r.status === "Unknown").length,
      disposable: results.filter((r) => r.disposable).length,
      role: results.filter((r) => r.role).length,
      hardBounceLikely: results.filter((r) => r.hardBounceEstimate === "Likely").length,
    };

    return NextResponse.json({ ok: true, options, counts, results });
  } catch (error) {
    console.error("email-validator error:", error);
    return NextResponse.json({ error: "Email validation failed" }, { status: 500 });
  }
}
