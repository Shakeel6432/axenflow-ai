import { NextResponse } from "next/server";
import { antiScrapeHeaders } from "@/lib/bot-guard";

/**
 * Public businesses JSON listing/detail is retired for scrape resistance.
 * Use SSR Lead Finder (/leads) and authenticated reveal/save server actions.
 */
export async function GET() {
  return NextResponse.json(
    {
      error:
        "Businesses JSON API is no longer available. Use the Lead Finder page at /leads.",
    },
    { status: 410, headers: antiScrapeHeaders() }
  );
}
