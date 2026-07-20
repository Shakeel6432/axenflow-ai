import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/session";

const API_BOT_UA =
  /\b(scrapy|python-requests|httpx|aiohttp|wget|curl\/|go-http-client|puppeteer|playwright|selenium|bytespider|gptbot|claudebot|ccbot)\b/i;

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Early block for known scrapers on data APIs
  if (path.startsWith("/api/search") || path.startsWith("/api/businesses")) {
    const ua = request.headers.get("user-agent") || "";
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

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
