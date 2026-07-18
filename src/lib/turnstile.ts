import { getTurnstileSecretKey, shouldBypassTurnstile } from "@/lib/turnstile-config";

export type TurnstileVerifyResult = {
  ok: boolean;
  error?: string;
  hostname?: string;
  action?: string;
  errorCodes?: string[];
};

type VerifyOptions = {
  remoteip?: string | null;
  /** Request Host header — picks local vs production secret */
  requestHostname?: string | null;
  expectedAction?: string;
  /** Soft-check hostname from Cloudflare response (optional). */
  expectedHostname?: string | string[];
};

/**
 * Server-side Turnstile validation via Siteverify API.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function verifyTurnstileToken(
  token: string | undefined | null,
  options: VerifyOptions = {}
): Promise<TurnstileVerifyResult> {
  if (shouldBypassTurnstile(options.requestHostname)) {
    return { ok: true, hostname: options.requestHostname || "localhost", action: options.expectedAction };
  }

  const secret = getTurnstileSecretKey(options.requestHostname);

  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY not set — rejecting captcha (server validation required)");
    return { ok: false, error: "Captcha is not configured on the server." };
  }

  if (!token || typeof token !== "string" || !token.trim()) {
    return { ok: false, error: "Please complete the captcha verification." };
  }

  if (token.length > 2048) {
    return { ok: false, error: "Invalid captcha token." };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    // Docs accept JSON or form-urlencoded; JSON used here.
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        ...(options.remoteip ? { remoteip: options.remoteip } : {}),
      }),
      signal: controller.signal,
    });

    const data = (await res.json()) as {
      success?: boolean;
      hostname?: string;
      action?: string;
      "error-codes"?: string[];
    };

    if (!data.success) {
      const codes = data["error-codes"] || [];
      console.error("Turnstile siteverify failed:", codes);
      return {
        ok: false,
        error: siteverifyUserMessage(codes),
        errorCodes: codes,
      };
    }

    if (options.expectedAction && data.action && data.action !== options.expectedAction) {
      return { ok: false, error: "Captcha action mismatch. Please try again." };
    }

    if (options.expectedHostname && data.hostname) {
      const allowed = Array.isArray(options.expectedHostname)
        ? options.expectedHostname
        : [options.expectedHostname];
      if (!allowed.some((h) => h.toLowerCase() === data.hostname!.toLowerCase())) {
        return { ok: false, error: "Captcha hostname mismatch. Please try again." };
      }
    }

    return {
      ok: true,
      hostname: data.hostname,
      action: data.action,
    };
  } catch (error) {
    console.error("Turnstile verify error:", error);
    return { ok: false, error: "Captcha verification failed. Please try again." };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getClientIp(req: Request): string | undefined {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf?.trim()) return cf.trim();
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded?.trim()) return forwarded.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  return undefined;
}

/** Hostname from Host / X-Forwarded-Host (for local vs production Turnstile secret). */
export function getRequestHostname(req: Request): string | undefined {
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedHost?.trim()) return forwardedHost.split(",")[0]?.trim().split(":")[0];
  const host = req.headers.get("host");
  if (host?.trim()) return host.trim().split(":")[0];
  return undefined;
}

/** Accept either our field or Cloudflare's default form field name. */
export function extractTurnstileToken(body: Record<string, unknown>): string | undefined {
  const token =
    body.turnstileToken ??
    body["cf-turnstile-response"] ??
    body.cfTurnstileResponse;
  return typeof token === "string" ? token : undefined;
}

function siteverifyUserMessage(codes: string[]): string {
  if (codes.includes("timeout-or-duplicate")) {
    return "Captcha expired or already used. Please complete it again.";
  }
  if (codes.includes("invalid-input-response") || codes.includes("missing-input-response")) {
    return "Please complete the captcha verification.";
  }
  if (codes.includes("invalid-input-secret") || codes.includes("missing-input-secret")) {
    return "Captcha server configuration error. Contact support.";
  }
  return "Captcha verification failed. Please try again.";
}
