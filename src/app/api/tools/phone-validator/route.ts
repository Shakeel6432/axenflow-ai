import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guards";
import { parseCsv } from "@/lib/bbb-validate";
import {
  DEFAULT_PHONE_OPTIONS,
  validatePhoneLocal,
  type PhoneCheckOptions,
  type PhoneOutputFormat,
} from "@/lib/validators/phone";
import type { CountryCode } from "libphonenumber-js/max";

export const runtime = "nodejs";

function normalizeOptions(raw: Partial<PhoneCheckOptions> | null | undefined): PhoneCheckOptions {
  const next: PhoneCheckOptions = { ...DEFAULT_PHONE_OPTIONS, ...(raw || {}) };
  const fmt = String(next.outputFormat || "e164") as PhoneOutputFormat;
  if (fmt === "e164" || fmt === "international" || fmt === "national" || fmt === "original") {
    next.outputFormat = fmt;
  } else {
    next.outputFormat = "e164";
  }
  const legacy = raw as { normalizeUs?: boolean } | null | undefined;
  if (legacy && "normalizeUs" in legacy && !raw?.outputFormat) {
    next.outputFormat = legacy.normalizeUs ? "national" : "e164";
  }
  if (typeof next.defaultCountry !== "string") next.defaultCountry = "";
  return next;
}

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    if (!session) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let options: PhoneCheckOptions = { ...DEFAULT_PHONE_OPTIONS };
    let phones: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const optsRaw = String(form.get("options") || "");
      if (optsRaw) {
        try {
          options = normalizeOptions(JSON.parse(optsRaw));
        } catch {
          /* defaults */
        }
      }
      const single = String(form.get("phone") || "").trim();
      if (single) phones = [single];
      if (file instanceof File) {
        if (file.size > 8 * 1024 * 1024) {
          return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
        }
        const rows = parseCsv(await file.text());
        phones = rows
          .map((r) => r["Phone Numbers"] || r.phone || r.Phone || r.phones || "")
          .filter(Boolean);
      }
    } else {
      const body = (await req.json().catch(() => null)) as {
        phone?: string;
        phones?: string[];
        csv?: string;
        options?: Partial<PhoneCheckOptions> & { normalizeUs?: boolean };
        defaultCountry?: CountryCode | "";
      } | null;
      if (body?.options) options = normalizeOptions(body.options);
      if (body?.defaultCountry != null) {
        options = { ...options, defaultCountry: body.defaultCountry };
      }
      if (body?.phone) phones = [body.phone];
      if (body?.phones?.length) phones = body.phones;
      if (body?.csv) {
        const rows = parseCsv(body.csv);
        phones = rows
          .map((r) => r["Phone Numbers"] || r.phone || r.Phone || r.phones || "")
          .filter(Boolean);
      }
    }

    if (!phones.length) {
      return NextResponse.json(
        { error: "Provide a phone or CSV with a Phone / Phone Numbers column" },
        { status: 400 }
      );
    }
    if (phones.length > 10000) {
      return NextResponse.json({ error: "Max 10000 phones per request" }, { status: 400 });
    }

    const results = phones.map((raw) => validatePhoneLocal(raw, options));
    const counts = {
      total: results.length,
      valid: results.filter((r) => r.status === "Valid").length,
      invalid: results.filter((r) => r.status === "Invalid").length,
      unknown: results.filter((r) => r.status === "Unknown").length,
      collapsed: results.filter((r) => r.collapsed).length,
      tollFree: results.filter((r) => r.tollFree).length,
      mobile: results.filter((r) => r.lineCategory === "mobile").length,
      landline: results.filter((r) => r.lineCategory === "landline").length,
      voip: results.filter((r) => r.lineCategory === "voip").length,
      fixedOrMobile: results.filter((r) => r.lineCategory === "ambiguous").length,
      typeUnknown: results.filter(
        (r) => r.lineCategory === "unknown" || r.lineCategory === "other"
      ).length,
    };

    return NextResponse.json({ ok: true, options, counts, results });
  } catch (error) {
    console.error("phone-validator error:", error);
    return NextResponse.json({ error: "Phone validation failed" }, { status: 500 });
  }
}
