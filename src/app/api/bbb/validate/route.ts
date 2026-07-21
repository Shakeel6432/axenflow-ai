import { NextResponse } from "next/server";
import dns from "node:dns/promises";
import {
  combineLeadStatus,
  parseCsv,
  pickBestEmail,
  pickBestPhone,
  scoreEmailSyntax,
  type LeadStatus,
  type ValidatedLead,
} from "@/lib/bbb-validate";

export const runtime = "nodejs";
export const maxDuration = 60;

const domainCache = new Map<string, LeadStatus>();

async function checkEmailDomain(email: string): Promise<LeadStatus> {
  const syntax = scoreEmailSyntax(email);
  if (syntax !== "Valid") return syntax;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return "Invalid";
  if (domainCache.has(domain)) return domainCache.get(domain)!;

  try {
    const mx = await dns.resolveMx(domain);
    if (mx?.length) {
      domainCache.set(domain, "Valid");
      return "Valid";
    }
  } catch {
    // try A/AAAA as soft fallback
  }

  try {
    const a = await dns.resolve4(domain);
    if (a?.length) {
      domainCache.set(domain, "Valid");
      return "Valid";
    }
  } catch {
    // ignore
  }

  try {
    await dns.resolve6(domain);
    domainCache.set(domain, "Valid");
    return "Valid";
  } catch {
    domainCache.set(domain, "Unknown");
    return "Unknown";
  }
}

async function mapPool<T, R>(items: T[], concurrency: number, fn: (item: T, i: number) => Promise<R>) {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length || 1) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let rawRows: Record<string, string>[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
      }
      if (file.size > 8 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
      }
      const text = await file.text();
      rawRows = parseCsv(text);
    } else {
      const body = (await req.json().catch(() => null)) as
        | { csv?: string; rows?: Record<string, string>[] }
        | null;
      if (body?.rows?.length) rawRows = body.rows;
      else if (body?.csv) rawRows = parseCsv(body.csv);
    }

    if (!rawRows.length) {
      return NextResponse.json({ error: "No rows found in CSV" }, { status: 400 });
    }
    if (rawRows.length > 5000) {
      return NextResponse.json(
        { error: "Too many rows (max 5000). Split the file and try again." },
        { status: 400 }
      );
    }

    let phonesCollapsed = 0;
    let emailsCollapsed = 0;

    const validated = await mapPool(rawRows, 20, async (row) => {
      const phonePick = pickBestPhone(row["Phone Numbers"] || row.phone || row.phones || "");
      const emailPick = pickBestEmail(row.Emails || row.email || row.emails || "");

      const emailStatus = emailPick.email
        ? await checkEmailDomain(emailPick.email)
        : ("Unknown" as LeadStatus);
      const phoneStatus = phonePick.status;
      const leadStatus = combineLeadStatus(emailStatus, phoneStatus);

      const out: ValidatedLead & { _phonesCollapsed?: boolean; _emailsCollapsed?: boolean } = {
        ...row,
        "Business Name": String(row["Business Name"] || row.name || "").trim(),
        "Phone Numbers": phonePick.phone,
        Emails: emailPick.email,
        Address: String(row.Address || row.address || "").trim(),
        Owner: String(row.Owner || row.owner || "").trim(),
        "Email Status": emailStatus,
        "Phone Status": phoneStatus,
        "Lead Status": leadStatus,
        _phonesCollapsed: phonePick.collapsed,
        _emailsCollapsed: emailPick.collapsed,
      };
      return out;
    });

    const cleanedRows: ValidatedLead[] = validated.map((row) => {
      if (row._phonesCollapsed) phonesCollapsed += 1;
      if (row._emailsCollapsed) emailsCollapsed += 1;
      const { _phonesCollapsed: _p, _emailsCollapsed: _e, ...rest } = row;
      return rest;
    });

    const counts = { Valid: 0, Invalid: 0, Unknown: 0, emails_valid: 0, phones_valid: 0 };
    for (const row of cleanedRows) {
      counts[row["Lead Status"]] += 1;
      if (row["Email Status"] === "Valid") counts.emails_valid += 1;
      if (row["Phone Status"] === "Valid") counts.phones_valid += 1;
    }

    return NextResponse.json({
      ok: true,
      total: cleanedRows.length,
      valid: counts.Valid,
      invalid: counts.Invalid,
      unknown: counts.Unknown,
      emails_valid: counts.emails_valid,
      phones_valid: counts.phones_valid,
      phones_collapsed: phonesCollapsed,
      emails_collapsed: emailsCollapsed,
      rows: cleanedRows,
    });
  } catch (error) {
    console.error("BBB validate error:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
