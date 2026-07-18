import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { redactBusinessList } from "@/lib/redact-business";
import { searchBusinesses } from "@/services/search.service";

/** Query-string booleans: only "true"/"1" are true. "false" must stay false (z.coerce.boolean treats any non-empty string as true). */
const queryBoolean = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return undefined;
}, z.boolean().optional());

const schema = z.object({
  keyword: z.string().optional(),
  mainCategory: z.string().optional(),
  category: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  hasWebsite: queryBoolean,
  hasPhone: queryBoolean,
  hasEmail: queryBoolean,
  sort: z.enum(["newest", "rating", "reviews", "alphabetical"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
});

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const limited = rateLimit(`search:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search parameters", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const data = await searchBusinesses({
      ...parsed.data,
      userId: userId || undefined,
    });

    // Guests see owner + location teaser; phone/email/website only after sign-in
    const results = userId ? data.results : redactBusinessList(data.results);

    return NextResponse.json(
      { ...data, results },
      {
        headers: {
          "Cache-Control": userId
            ? "private, no-store"
            : "public, s-maxage=30, stale-while-revalidate=120",
          "X-RateLimit-Remaining": String(limited.remaining),
        },
      }
    );
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed. Check database configuration." }, { status: 500 });
  }
}
