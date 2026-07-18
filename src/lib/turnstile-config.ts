/**
 * Turnstile runs on production hostnames only.
 * On localhost / 127.0.0.1 the widget and Siteverify are skipped (dev bypass).
 */

export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
export const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

function isCloudflareDummySiteKey(key: string): boolean {
  return key.startsWith("1x00000000000000000000") || key.startsWith("2x00000000000000000000") || key.startsWith("3x00000000000000000000");
}

export function isTurnstileTestMode(): boolean {
  return process.env.NEXT_PUBLIC_TURNSTILE_TEST_MODE === "true";
}

export function isLocalHostname(hostname?: string | null): boolean {
  const host = (hostname || "").split(":")[0].trim().toLowerCase();
  return host === "localhost" || host === "127.0.0.1";
}

/** Skip captcha UI + verification on local dev hosts (unless FORCE is on). */
export function shouldBypassTurnstile(hostname?: string | null): boolean {
  if (process.env.NEXT_PUBLIC_TURNSTILE_FORCE === "true") return false;

  if (typeof window !== "undefined") {
    return isLocalHostname(window.location.hostname);
  }
  if (hostname != null) return isLocalHostname(hostname);
  return process.env.NODE_ENV === "development";
}

export const TURNSTILE_DEV_BYPASS_TOKEN = "localhost-bypass";

export function getTurnstileKeyMode(): "test" | "local" | "production" | "missing" {
  if (isTurnstileTestMode()) return "test";
  const key = getTurnstileSiteKey();
  if (!key) return "missing";
  if (isCloudflareDummySiteKey(key)) return "test";
  if (typeof window !== "undefined" && isLocalHostname(window.location.hostname)) {
    const local = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_LOCAL?.trim() || "";
    if (local && !isCloudflareDummySiteKey(local)) return "local";
    return "production";
  }
  return "production";
}

export function getTurnstileSiteKey(): string {
  if (isTurnstileTestMode()) return TURNSTILE_TEST_SITE_KEY;

  const production = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";
  const local = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_LOCAL?.trim() || "";
  const localReal = local && !isCloudflareDummySiteKey(local) ? local : "";

  if (typeof window !== "undefined") {
    if (isLocalHostname(window.location.hostname)) {
      // Prefer real local widget; otherwise same production widget (needs localhost hostname in CF)
      return localReal || production;
    }
    return production || localReal;
  }

  if (process.env.NODE_ENV === "development") return localReal || production;
  return production || localReal;
}

export function getTurnstileSecretKey(hostname?: string | null): string {
  if (isTurnstileTestMode()) return TURNSTILE_TEST_SECRET_KEY;

  const production = process.env.TURNSTILE_SECRET_KEY?.trim() || "";
  const local = process.env.TURNSTILE_SECRET_KEY_LOCAL?.trim() || "";
  const localIsDummy =
    local.startsWith("1x0000000000000000000000000000000") ||
    local.startsWith("2x0000000000000000000000000000000") ||
    local.startsWith("3x0000000000000000000000000000000");
  const localReal = local && !localIsDummy ? local : "";

  if (isLocalHostname(hostname) || (process.env.NODE_ENV === "development" && !hostname)) {
    return localReal || production;
  }
  return production || localReal;
}

export function getTurnstileSiteKeyHint(): string {
  const key = getTurnstileSiteKey();
  if (!key) return "(empty)";
  return `…${key.slice(-4)}`;
}
