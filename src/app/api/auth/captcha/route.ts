import { NextResponse } from "next/server";
import { extractTurnstileToken, getClientIp, getRequestHostname, verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const token = extractTurnstileToken(body);
    const captcha = await verifyTurnstileToken(token, {
      remoteip: getClientIp(req),
      requestHostname: getRequestHostname(req),
      expectedAction: typeof body.action === "string" ? body.action : "login",
    });
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error || "Captcha verification failed." }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Captcha verification failed." }, { status: 400 });
  }
}
