import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-guards";
import { parseCsv } from "@/lib/bbb-validate";
import {
  confirmDomainPattern,
  consumeMonthlyFinderUsage,
  findEmailsPhase1,
  getMonthlyFinderUsage,
} from "@/services/email-finder.service";
import { isValidPatternKey } from "@/lib/email-finder/patterns";

export const runtime = "nodejs";
export const maxDuration = 60;

const confirmSchema = z.object({
  domain: z.string().trim().min(3).max(253),
  pattern: z.string().trim().min(1).max(40),
});

const rowSchema = z.object({
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  domain: z.string().min(1),
});

/** Signed-in bulk / confirm endpoints for Email Finder Phase 1. */
export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";
  const userId = session.user.id;

  // Confirm pattern feedback
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    if (body?.action === "confirm") {
      const parsed = confirmSchema.safeParse(body);
      if (!parsed.success || !isValidPatternKey(parsed.data.pattern)) {
        return NextResponse.json({ error: "Invalid domain or pattern." }, { status: 400 });
      }
      const out = await confirmDomainPattern(parsed.data);
      return NextResponse.json(out);
    }
    if (body?.action === "usage") {
      const usage = await getMonthlyFinderUsage(userId);
      return NextResponse.json({ ok: true, usage });
    }
    if (Array.isArray(body?.rows)) {
      return runBulk(userId, body.rows);
    }
    if (typeof body?.csv === "string") {
      const rows = parseCsv(body.csv).map((r) => ({
        firstName: r.firstName || r["First Name"] || r.first || "",
        lastName: r.lastName || r["Last Name"] || r.last || "",
        domain: r.domain || r.Domain || r.website || r.Website || r.email || "",
      }));
      return runBulk(userId, rows);
    }
    // Single signed-in find (counts toward monthly)
    const one = rowSchema.safeParse(body);
    if (one.success) {
      return runBulk(userId, [one.data]);
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a CSV file" }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
    }
    const rows = parseCsv(await file.text()).map((r) => ({
      firstName: r.firstName || r["First Name"] || r.first || "",
      lastName: r.lastName || r["Last Name"] || r.last || "",
      domain: r.domain || r.Domain || r.website || r.Website || "",
    }));
    return runBulk(userId, rows);
  }

  return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
}

async function runBulk(
  userId: string,
  rawRows: unknown[]
): Promise<NextResponse> {
  const rows = rawRows
    .map((r) => rowSchema.safeParse(r))
    .filter((p) => p.success)
    .map((p) => p.data);

  if (!rows.length) {
    return NextResponse.json(
      { error: "Provide rows with firstName/lastName/domain (or CSV columns)." },
      { status: 400 }
    );
  }
  if (rows.length > 100) {
    return NextResponse.json(
      { error: "Max 100 rows per bulk request in Phase 1." },
      { status: 400 }
    );
  }

  const usage = await consumeMonthlyFinderUsage(userId, rows.length);
  if (!usage.ok) {
    return NextResponse.json(
      {
        error: `Free monthly Email Finder quota reached (${usage.limit}/month). Upgrade or wait until next month.`,
        remaining: usage.remaining,
        limit: usage.limit,
      },
      { status: 402 }
    );
  }

  const results = [];
  for (const row of rows) {
    results.push(await findEmailsPhase1(row));
  }

  return NextResponse.json({
    ok: true,
    remaining: usage.remaining,
    limit: usage.limit,
    results,
  });
}
