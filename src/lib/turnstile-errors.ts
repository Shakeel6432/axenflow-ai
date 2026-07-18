/** Human-readable messages for Cloudflare Turnstile client error codes. */
export function turnstileErrorMessage(code?: string | number | null): string {
  const c = String(code ?? "").trim();
  if (!c) {
    return "Captcha could not start. Restart npm run dev after changing .env.local, then hard-refresh.";
  }
  if (c === "110200" || c.includes("110200")) {
    return "This domain is not authorized. Cloudflare Turnstile → your widget → Hostname Management → add this domain → Save.";
  }
  if (c === "110100" || c === "110110" || c.includes("110100") || c.includes("110110") || c === "400020" || c.includes("400020")) {
    return "Invalid captcha site key (or widget config). Re-copy NEXT_PUBLIC_TURNSTILE_SITE_KEY_LOCAL from Cloudflare Widget Keys, ensure localhost is on that widget, then restart npm run dev.";
  }
  if (c.startsWith("200") || c.startsWith("300") || c.startsWith("600")) {
    return "Security check could not finish. Please try again.";
  }
  return `Unable to load security check (error ${c}). Please retry.`;
}
