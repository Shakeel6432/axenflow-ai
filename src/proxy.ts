import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/session";
import { rateLimit } from "./lib/rate-limit";
import { getClientIpFromHeaders } from "./lib/bot-guard";

const API_BOT_UA =
  /\b(scrapy|python-requests|httpx|aiohttp|wget|curl\/|go-http-client|puppeteer|playwright|selenium|bytespider|gptbot|claudebot|ccbot|ahrefs|semrush|dataforseo)\b/i;

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = getClientIpFromHeaders(request.headers);
  const ua = request.headers.get("user-agent") || "";

  // Early block for known scrapers on retired data APIs + lead SSR route
  if (path.startsWith("/api/search") || path.startsWith("/api/businesses") || path === "/leads") {
    if (!ua || API_BOT_UA.test(ua)) {
      return NextResponse.json(
        { error: "Automated access is not allowed." },
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex, nofollow",
          },
        }
      );
    }
  }

  // Page-level rate limit for Lead Finder HTML (scraping via repeated document loads)
  if (path === "/leads") {
    const limited = rateLimit(`proxy-leads:${ip}`, 40, 60_000);
    if (!limited.ok) {
      return new NextResponse("Too many requests. Please try again shortly.", {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": "60",
        },
      });
    }

    const page = Number(request.nextUrl.searchParams.get("page") || "1");
    if (page >= 5) {
      console.warn("[proxy] sequential leads pagination", { ip, page, ua: ua.slice(0, 80) });
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
