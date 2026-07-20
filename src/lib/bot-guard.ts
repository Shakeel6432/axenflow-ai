import { NextResponse } from "next/server";

const BLOCKED_UA =
  /\b(scrapy|httpclient|python-requests|python-urllib|aiohttp|httpx|libwww-perl|wget|curl\/|go-http-client|java\/|okhttp|phantomjs|headlesschrome|puppeteer|playwright|selenium|mechanize|nutch|ahrefs|semrush|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|ccbot|dataforseo|serpstat|screaming frog)\b/i;

const EMPTY_OR_GENERIC_UA = /^(mozilla\/4\.0|mozilla\/5\.0)$/i;

export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "anonymous";
  return headers.get("x-real-ip")?.trim() || "anonymous";
}

export type BotGuardResult =
  | { ok: true; suspicious: boolean }
  | { ok: false; response: NextResponse };

/**
 * Soft/hard checks against common scraper fingerprints on sensitive APIs.
 * Does not replace auth or rate limits — stacks on top of them.
 */
export function assertApiBotGuard(req: Request, opts?: { strict?: boolean }): BotGuardResult {
  const ua = (req.headers.get("user-agent") || "").trim();
  const accept = (req.headers.get("accept") || "").toLowerCase();
  const secFetchSite = (req.headers.get("sec-fetch-site") || "").toLowerCase();
  const secFetchMode = (req.headers.get("sec-fetch-mode") || "").toLowerCase();

  if (!ua || ua.length < 12 || EMPTY_OR_GENERIC_UA.test(ua) || BLOCKED_UA.test(ua)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Automated access is not allowed." },
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex, nofollow",
          },
        }
      ),
    };
  }

  // Real browsers almost always send Sec-Fetch-* on same-site XHR/fetch.
  const missingFetchMeta = !secFetchSite && !secFetchMode;
  const acceptsHtmlOnly =
    accept.includes("text/html") && !accept.includes("application/json") && !accept.includes("*/*");

  if (opts?.strict && (missingFetchMeta || acceptsHtmlOnly)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Automated access is not allowed." },
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex, nofollow",
          },
        }
      ),
    };
  }

  return { ok: true, suspicious: missingFetchMeta };
}

export function antiScrapeHeaders(extra?: HeadersInit): HeadersInit {
  return {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Content-Type-Options": "nosniff",
    ...extra,
  };
}
