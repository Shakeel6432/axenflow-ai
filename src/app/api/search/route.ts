import { NextResponse } from "next/server";
import { antiScrapeHeaders } from "@/lib/bot-guard";

/**
 * Public JSON lead search is retired.
 * Lead Finder uses server-rendered /leads + reveal server actions only.
 * Direct DB access happens on the server — this route must not return lead rows.
 */
export async function GET() {
  return NextResponse.json(
    {
      error:
        "Lead search JSON API is no longer available. Use the Lead Finder page at /leads.",
    },
    {
      status: 410,
      headers: antiScrapeHeaders({
        Allow: "",
      }),
    }
  );
}
