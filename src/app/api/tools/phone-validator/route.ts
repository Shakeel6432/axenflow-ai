import { NextResponse } from "next/server";
import { parseCsv } from "@/lib/bbb-validate";
import {
  DEFAULT_PHONE_OPTIONS,
  validatePhoneLocal,
  type PhoneCheckOptions,
} from "@/lib/validators/phone";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let options: PhoneCheckOptions = { ...DEFAULT_PHONE_OPTIONS };
    let phones: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const optsRaw = String(form.get("options") || "");
      if (optsRaw) {
        try {
          options = { ...DEFAULT_PHONE_OPTIONS, ...JSON.parse(optsRaw) };
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
        options?: Partial<PhoneCheckOptions>;
      } | null;
      if (body?.options) options = { ...DEFAULT_PHONE_OPTIONS, ...body.options };
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
        { error: "Provide a phone or CSV with a Phone Numbers column" },
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
    };

    return NextResponse.json({ ok: true, options, counts, results });
  } catch (error) {
    console.error("phone-validator error:", error);
    return NextResponse.json({ error: "Phone validation failed" }, { status: 500 });
  }
}
