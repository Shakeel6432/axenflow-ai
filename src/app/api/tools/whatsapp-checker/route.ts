import { NextResponse } from "next/server";
import { parseCsv } from "@/lib/bbb-validate";
import { requireUser } from "@/lib/auth-guards";
import {
  checkWhatsAppNumbers,
  getWhatsAppCheckerStatus,
  type WhatsAppCheckResult,
} from "@/lib/validators/whatsapp-checker";

export const runtime = "nodejs";
export const maxDuration = 60;

function collectNumbers(raw: string[]): string[] {
  return raw.map((n) => n.trim()).filter(Boolean);
}

function summarize(results: WhatsAppCheckResult[]) {
  return {
    total: results.length,
    onWhatsApp: results.filter((r) => r.status === "yes").length,
    notOnWhatsApp: results.filter((r) => r.status === "no").length,
    unknown: results.filter((r) => r.status === "unknown").length,
    badNumber: results.filter((r) => r.status === "bad_number").length,
    error: results.filter((r) => r.status === "error").length,
  };
}

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const status = await getWhatsAppCheckerStatus();
  return NextResponse.json(status);
}

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    if (!session) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const providerStatus = await getWhatsAppCheckerStatus();
    if (!providerStatus.configured) {
      return NextResponse.json(
        {
          error: "WhatsApp checker is not configured on the server.",
          hint: providerStatus.hint,
        },
        { status: 503 }
      );
    }

    if (providerStatus.bridgeHealth === false) {
      return NextResponse.json(
        {
          error: "WhatsApp bridge is not running.",
          hint: providerStatus.hint,
        },
        { status: 503 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let numbers: string[] = [];
    let defaultCountryCode = "1";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const single = String(form.get("phone") || "").trim();
      defaultCountryCode = String(form.get("countryCode") || "1").trim() || "1";

      if (single) numbers = [single];
      if (file instanceof File) {
        if (file.size > 8 * 1024 * 1024) {
          return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
        }
        const rows = parseCsv(await file.text());
        numbers = collectNumbers(
          rows.map(
            (r) =>
              r.number ||
              r.Number ||
              r.phone ||
              r.Phone ||
              r["Phone Numbers"] ||
              r.phones ||
              ""
          )
        );
      }
    } else {
      const body = (await req.json().catch(() => null)) as {
        phone?: string;
        phones?: string[];
        csv?: string;
        countryCode?: string;
      } | null;

      defaultCountryCode = String(body?.countryCode || "1").trim() || "1";
      if (body?.phone) numbers = [body.phone];
      if (body?.phones?.length) numbers = collectNumbers(body.phones);
      if (body?.csv) {
        const rows = parseCsv(body.csv);
        numbers = collectNumbers(
          rows.map(
            (r) =>
              r.number ||
              r.Number ||
              r.phone ||
              r.Phone ||
              r["Phone Numbers"] ||
              r.phones ||
              ""
          )
        );
      }
    }

    if (!numbers.length) {
      return NextResponse.json(
        { error: "Provide a phone number or CSV with a number / phone column" },
        { status: 400 }
      );
    }

    if (numbers.length > 150) {
      return NextResponse.json({ error: "Max 150 numbers per request" }, { status: 400 });
    }

    const delayMs =
      providerStatus.source === "bridge" || providerStatus.source === "dev-bridge" ? 1500 : 350;
    const results = await checkWhatsAppNumbers(numbers, defaultCountryCode, delayMs);

    return NextResponse.json({
      ok: true,
      defaultCountryCode,
      provider: providerStatus.source,
      counts: summarize(results),
      results,
    });
  } catch (error) {
    console.error("whatsapp-checker error:", error);
    return NextResponse.json({ error: "WhatsApp check failed" }, { status: 500 });
  }
}
