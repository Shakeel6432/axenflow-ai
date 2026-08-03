const SENSITIVE_KEYS = /password|secret|token|credential|appPassword|app_password|authorization/i;

/** Strip credential-like fields before logging. Never log raw app passwords. */
export function redactForLog(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "string") {
    if (value.length >= 8 && /^[A-Za-z0-9\s-]+$/.test(value) && value.replace(/\s/g, "").length === 16) {
      return "[REDACTED_APP_PASSWORD]";
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(redactForLog);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.test(k) ? "[REDACTED]" : redactForLog(v);
    }
    return out;
  }
  return value;
}

export function safeErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  return msg
    .replace(/[A-Za-z0-9]{4}\s[A-Za-z0-9]{4}\s[A-Za-z0-9]{4}\s[A-Za-z0-9]{4}/g, "[REDACTED]")
    .replace(/password[=:\s][^\s,]+/gi, "password=[REDACTED]");
}
