/**
 * Resolves WhatsApp checker provider settings from env (and optional config file).
 * Priority: WACHECK_URL > WACHECK_BRIDGE_URL > local bridge in development.
 */

export type WhatsAppCheckerConfig = {
  urlTemplate: string;
  method: "GET" | "POST";
  apiKey: string;
  postJson: string;
  headersJson: string;
  source: "env" | "bridge" | "dev-bridge" | "file";
};

let cachedFileConfig: Partial<Record<string, string>> | null | undefined;

function readEnv(key: string): string {
  return process.env[key]?.trim() || "";
}

function loadFileConfig(): Partial<Record<string, string>> | null {
  if (cachedFileConfig !== undefined) return cachedFileConfig;

  cachedFileConfig = null;
  if (typeof process === "undefined") return null;

  try {
    const fs = require("node:fs") as typeof import("node:fs");
    const path = require("node:path") as typeof import("node:path");
    const candidates = [
      path.join(process.cwd(), "wacheck_config.json"),
      path.join(process.cwd(), "..", "Whatsapp number checker", "wacheck_config.json"),
    ];

    for (const filePath of candidates) {
      if (!fs.existsSync(filePath)) continue;
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
      const out: Partial<Record<string, string>> = {};
      for (const key of [
        "WACHECK_URL",
        "WACHECK_API_KEY",
        "WACHECK_METHOD",
        "WACHECK_POST_JSON",
        "WACHECK_HEADERS_JSON",
        "WACHECK_BRIDGE_URL",
      ]) {
        const val = raw[key];
        if (val != null && String(val).trim()) out[key] = String(val).trim();
      }
      cachedFileConfig = out;
      break;
    }
  } catch {
    cachedFileConfig = null;
  }

  return cachedFileConfig;
}

function fromFile(key: string): string {
  return loadFileConfig()?.[key] || "";
}

function buildConfig(
  urlTemplate: string,
  source: WhatsAppCheckerConfig["source"],
  overrides?: Partial<WhatsAppCheckerConfig>
): WhatsAppCheckerConfig {
  const methodRaw = (overrides?.method || readEnv("WACHECK_METHOD") || fromFile("WACHECK_METHOD") || "GET").toUpperCase();
  return {
    urlTemplate,
    method: methodRaw === "POST" ? "POST" : "GET",
    apiKey: overrides?.apiKey ?? readEnv("WACHECK_API_KEY") ?? fromFile("WACHECK_API_KEY"),
    postJson: overrides?.postJson ?? readEnv("WACHECK_POST_JSON") ?? fromFile("WACHECK_POST_JSON"),
    headersJson: overrides?.headersJson ?? readEnv("WACHECK_HEADERS_JSON") ?? fromFile("WACHECK_HEADERS_JSON"),
    source,
  };
}

export function resolveWhatsAppCheckerConfig(): WhatsAppCheckerConfig | null {
  const directUrl = readEnv("WACHECK_URL") || fromFile("WACHECK_URL");
  if (directUrl) return buildConfig(directUrl, readEnv("WACHECK_URL") ? "env" : "file");

  const apiKey = readEnv("WACHECK_API_KEY") || fromFile("WACHECK_API_KEY");
  if (apiKey) {
    const presetUrl =
      readEnv("WACHECK_PRESET_URL") ||
      "https://whatsapp-proxy.checkleaked.cc/number-simple/{phone}";
    const headersJson =
      readEnv("WACHECK_HEADERS_JSON") ||
      fromFile("WACHECK_HEADERS_JSON") ||
      JSON.stringify({ "x-rapidapi-key": apiKey });
    return buildConfig(presetUrl, "env", { apiKey: "", headersJson });
  }

  const bridgeUrl =
    readEnv("WACHECK_BRIDGE_URL") ||
    fromFile("WACHECK_BRIDGE_URL") ||
    (process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8765/check?phone={phone}"
      : "");

  if (bridgeUrl) {
    return buildConfig(
      bridgeUrl,
      readEnv("WACHECK_BRIDGE_URL") ? "bridge" : process.env.NODE_ENV === "development" ? "dev-bridge" : "bridge"
    );
  }

  return null;
}

export function isWhatsAppCheckerConfigured(): boolean {
  return resolveWhatsAppCheckerConfig() != null;
}

export function whatsAppCheckerSetupHint(): string {
  return [
    "Option 1 (same as desktop, recommended for local): run the bridge server",
    "  cd \"Whatsapp number checker\"",
    "  pip install -r requirements.txt",
    "  playwright install chrome",
    "  python whatsapp_checker_server.py",
    "Option 2 (production): set WACHECK_URL + WACHECK_API_KEY on Vercel (third-party lookup API).",
  ].join("\n");
}
