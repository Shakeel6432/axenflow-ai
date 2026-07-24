import {
  resolveWhatsAppCheckerConfig,
  whatsAppCheckerSetupHint,
  isWhatsAppCheckerConfigured as isConfigured,
} from "./whatsapp-checker-config";

export type WhatsAppCheckStatus = "yes" | "no" | "unknown" | "bad_number" | "error";

export type WhatsAppCheckResult = {
  original: string;
  normalizedPhone: string;
  status: WhatsAppCheckStatus;
  label: string;
  snippet: string;
};

const STATUS_LABELS: Record<WhatsAppCheckStatus, string> = {
  yes: "On WhatsApp",
  no: "Not on WhatsApp",
  unknown: "Unknown",
  bad_number: "Invalid number",
  error: "Error",
};

export function whatsAppStatusLabel(status: WhatsAppCheckStatus): string {
  return STATUS_LABELS[status];
}

export function digitsOnly(value: string | number | null | undefined): string {
  if (value == null) return "";
  return String(value).replace(/\D/g, "").trim();
}

export function toWhatsAppPhone(
  raw: string | number | null | undefined,
  defaultCountryCode: string
): string | null {
  let d = digitsOnly(raw);
  if (!d) return null;
  const cc = digitsOnly(defaultCountryCode);
  if (d.length === 10 && cc) d = cc + d;
  if (d.length < 8 || d.length > 15) return null;
  return d;
}

function truthy(val: unknown): boolean | null {
  if (val == null) return null;
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return Boolean(val);
  if (typeof val === "string") {
    const v = val.trim().toLowerCase();
    if (["1", "true", "yes", "y"].includes(v)) return true;
    if (["0", "false", "no", "n", ""].includes(v)) return false;
  }
  return null;
}

export function interpretWhatsAppResponse(data: unknown): "yes" | "no" | "unknown" {
  if (typeof data === "boolean") return data ? "yes" : "no";
  if (!data || typeof data !== "object") return "unknown";

  const obj = data as Record<string, unknown>;

  const statusField = obj.status;
  if (typeof statusField === "string") {
    const s = statusField.trim().toLowerCase();
    if (s === "yes" || s === "on_whatsapp") return "yes";
    if (s === "no" || s === "not_on_whatsapp") return "no";
    if (s === "bad_number") return "no";
    if (s === "error") return "unknown";
  }

  const keys = [
    "on_whatsapp",
    "exists",
    "is_whatsapp",
    "isInWhatsapp",
    "isWAContact",
    "registered",
    "has_whatsapp",
    "whatsapp",
    "is_whatsapp_user",
  ];

  for (const key of keys) {
    if (key in obj) {
      const t = truthy(obj[key]);
      if (t != null) return t ? "yes" : "no";
    }
  }

  const nested = obj.data ?? obj.result ?? obj.contact;
  if (nested != null && nested !== data) {
    const inner = interpretWhatsAppResponse(nested);
    if (inner !== "unknown") return inner;
  }

  return "unknown";
}

function applyPhonePlaceholder(template: string, phone: string): string {
  return template.replaceAll("{phone}", phone).replaceAll("{phone_encoded}", encodeURIComponent(phone));
}

export async function callWhatsAppProvider(phone: string): Promise<{ status: WhatsAppCheckStatus; snippet: string }> {
  const config = resolveWhatsAppCheckerConfig();

  if (!config) {
    return {
      status: "error",
      snippet: `WhatsApp checker is not configured. ${whatsAppCheckerSetupHint()}`,
    };
  }

  const apiKey = config.apiKey;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  if (config.headersJson) {
    try {
      Object.assign(headers, JSON.parse(config.headersJson) as Record<string, string>);
    } catch {
      return { status: "error", snippet: "WACHECK_HEADERS_JSON invalid JSON" };
    }
  }

  try {
    let response: Response;

    if (config.method === "GET") {
      const url = applyPhonePlaceholder(config.urlTemplate, phone);
      response = await fetch(url, { headers, signal: AbortSignal.timeout(90_000) });
    } else {
      const url = config.urlTemplate.includes("{phone}")
        ? applyPhonePlaceholder(config.urlTemplate, phone)
        : config.urlTemplate;
      let body: unknown = { phone };
      if (config.postJson) {
        body = JSON.parse(applyPhonePlaceholder(config.postJson, phone));
      }
      headers["Content-Type"] = "application/json";
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(90_000),
      });
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      const hint =
        config.source === "dev-bridge" || config.source === "bridge"
          ? " Start the desktop bridge: python whatsapp_checker_server.py"
          : "";
      return {
        status: "error",
        snippet: `HTTP ${response.status}: ${text.slice(0, 350)}${hint}`,
      };
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text) as unknown;
      const snippet = JSON.stringify(data).slice(0, 500);
      const interpreted = interpretWhatsAppResponse(data);
      return { status: interpreted, snippet };
    } catch {
      return { status: "unknown", snippet: text.slice(0, 500) };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    const hint =
      config.source === "dev-bridge" || config.source === "bridge"
        ? " Run: cd \"Whatsapp number checker\" && python whatsapp_checker_server.py"
        : "";
    return { status: "error", snippet: `${message.slice(0, 400)}${hint}` };
  }
}

export async function checkWhatsAppNumbers(
  numbers: string[],
  defaultCountryCode: string,
  delayMs = 400
): Promise<WhatsAppCheckResult[]> {
  const results: WhatsAppCheckResult[] = [];

  for (let i = 0; i < numbers.length; i++) {
    const original = numbers[i] ?? "";
    const normalized = toWhatsAppPhone(original, defaultCountryCode);

    if (!normalized) {
      results.push({
        original,
        normalizedPhone: "",
        status: "bad_number",
        label: whatsAppStatusLabel("bad_number"),
        snippet: "",
      });
    } else {
      const { status, snippet } = await callWhatsAppProvider(normalized);
      results.push({
        original,
        normalizedPhone: normalized,
        status,
        label: whatsAppStatusLabel(status),
        snippet,
      });
    }

    if (i < numbers.length - 1 && delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return results;
}

export async function isWhatsAppCheckerConfigured(): Promise<boolean> {
  return isConfigured();
}

export async function getWhatsAppCheckerStatus(): Promise<{
  configured: boolean;
  source: string | null;
  bridgeHealth: boolean | null;
  hint: string;
}> {
  const config = resolveWhatsAppCheckerConfig();
  if (!config) {
    return {
      configured: false,
      source: null,
      bridgeHealth: null,
      hint: whatsAppCheckerSetupHint(),
    };
  }

  let bridgeHealth: boolean | null = null;
  if (config.source === "bridge" || config.source === "dev-bridge") {
    try {
      const healthUrl = config.urlTemplate.includes("/check")
        ? `${config.urlTemplate.split("/check")[0]}/health`
        : "http://127.0.0.1:8765/health";
      const res = await fetch(healthUrl, { signal: AbortSignal.timeout(5000) });
      bridgeHealth = res.ok;
    } catch {
      bridgeHealth = false;
    }
  }

  return {
    configured: isConfigured(),
    source: config.source,
    bridgeHealth,
    hint: bridgeHealth === false ? whatsAppCheckerSetupHint() : "",
  };
}
