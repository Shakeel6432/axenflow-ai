"use client";

/**
 * Explicit Turnstile rendering for Next.js.
 * @see https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
 */

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { AlertCircle, RefreshCw, Shield } from "lucide-react";
import {
  getTurnstileKeyMode,
  getTurnstileSiteKey,
  getTurnstileSiteKeyHint,
  shouldBypassTurnstile,
  TURNSTILE_DEV_BYPASS_TOKEN,
} from "@/lib/turnstile-config";
import { turnstileErrorMessage } from "@/lib/turnstile-errors";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (errorCode?: string | number) => boolean | void;
          theme?: "auto" | "light" | "dark";
          size?: "normal" | "flexible" | "compact";
          retry?: "auto" | "never";
          appearance?: "always" | "execute" | "interaction-only";
          action?: string;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type TurnstileProps = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  action?: string;
  className?: string;
};

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile?.render) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing =
      (document.getElementById(SCRIPT_ID) as HTMLScriptElement | null) ||
      (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]') as HTMLScriptElement | null);

    const waitUntilReady = () => {
      let tries = 0;
      const tick = () => {
        if (window.turnstile?.render) {
          resolve();
          return;
        }
        tries += 1;
        if (tries > 60) {
          reject(new Error("Turnstile API did not become ready"));
          return;
        }
        window.setTimeout(tick, 50);
      };
      tick();
    };

    if (existing) {
      if (window.turnstile?.render) {
        resolve();
        return;
      }
      existing.addEventListener("load", waitUntilReady, { once: true });
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed")), { once: true });
      waitUntilReady();
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => waitUntilReady();
    script.onerror = () => reject(new Error("Turnstile script failed"));
    document.head.appendChild(script);
  });
}

function detectTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function Turnstile({ onToken, onExpire, action, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);
  const reactId = useId();
  // Server snapshot must match localhost/dev bypass — otherwise SSR paints the
  // "Captcha key missing" error card, then hydrates away and the form jumps.
  const bypassed = useSyncExternalStore(
    () => () => {},
    () => shouldBypassTurnstile(),
    () => shouldBypassTurnstile()
  );
  const siteKey = useSyncExternalStore(
    () => () => {},
    getTurnstileSiteKey,
    getTurnstileSiteKey
  );
  const keyMode = useSyncExternalStore(
    () => () => {},
    getTurnstileKeyMode,
    getTurnstileKeyMode
  );
  const [mountKey, setMountKey] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    onTokenRef.current = onToken;
    onExpireRef.current = onExpire;
  }, [onToken, onExpire]);

  useEffect(() => {
    if (!bypassed) return;
    onTokenRef.current(TURNSTILE_DEV_BYPASS_TOKEN);
  }, [bypassed]);

  const teardown = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        /* ignore */
      }
      widgetIdRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
  }, []);

  useEffect(() => {
    if (bypassed) return;
    if (!siteKey) return;

    let cancelled = false;

    const mount = async () => {
      setStatus("loading");
      try {
        await loadTurnstileScript();
        await new Promise((r) => requestAnimationFrame(() => r(undefined)));
        if (cancelled || !containerRef.current || !window.turnstile?.render) return;

        teardown();

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: detectTheme(),
          size: "normal",
          retry: "never",
          appearance: "always",
          ...(action ? { action } : {}),
          callback: (value) => {
            setToken(value);
            setStatus("ready");
            onTokenRef.current(value);
          },
          "expired-callback": () => {
            setToken("");
            onExpireRef.current?.();
          },
          "error-callback": (errorCode) => {
            console.warn("[Turnstile] error-callback", errorCode);
            setToken("");
            onExpireRef.current?.();
            teardown();
            setErrorMsg(turnstileErrorMessage(errorCode));
            setStatus("error");
            setShowHelp(false);
            return true;
          },
        });
        if (!cancelled) setStatus("ready");
      } catch (error) {
        console.warn("Turnstile mount error:", error);
        if (!cancelled) {
          setToken("");
          setErrorMsg(
            error instanceof Error
              ? `Unable to load security check: ${error.message}`
              : "Unable to load security check. Please retry."
          );
          setStatus("error");
        }
      }
    };

    void mount();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [bypassed, siteKey, keyMode, reactId, mountKey, action, teardown]);

  const retry = () => {
    if (shouldBypassTurnstile()) {
      onTokenRef.current(TURNSTILE_DEV_BYPASS_TOKEN);
      setStatus("ready");
      return;
    }
    setToken("");
    onExpireRef.current?.();
    setErrorMsg("");
    setShowHelp(false);
    setStatus("loading");
    setMountKey((k) => k + 1);
  };

  const missingKey = !bypassed && !siteKey && keyMode === "missing";
  const displayStatus = missingKey ? "error" : status;
  const displayError =
    missingKey
      ? "Captcha key missing. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY in .env.local and restart npm run dev."
      : errorMsg;

  // Localhost / dev: never paint captcha UI (avoids form height flash)
  if (bypassed) {
    return (
      <input
        type="hidden"
        name="cf-turnstile-response"
        value={TURNSTILE_DEV_BYPASS_TOKEN}
        readOnly
        aria-hidden
        tabIndex={-1}
      />
    );
  }

  if (!siteKey && displayStatus !== "error") {
    return (
      <p className="text-xs" style={{ color: "var(--c-text-dim)" }}>
        Loading captcha…
      </p>
    );
  }

  if (displayStatus === "error") {
    return (
      <div
        className="glass-card rounded-xl p-4"
        style={{ border: "1px solid var(--c-border)" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
          >
            <AlertCircle size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--c-heading)" }}>
              Security check failed
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--c-text-muted)" }}>
              {displayError}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
              >
                <RefreshCw size={12} /> Retry captcha
              </button>
              <button
                type="button"
                onClick={() => setShowHelp((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{
                  border: "1px solid var(--c-border)",
                  color: "var(--c-heading)",
                  background: "var(--c-hover-bg)",
                }}
              >
                <Shield size={12} /> {showHelp ? "Hide help" : "Troubleshoot"}
              </button>
            </div>

            {showHelp && (
              <div
                className="mt-3 rounded-xl p-3 text-xs leading-relaxed"
                style={{
                  background: "var(--c-hover-bg)",
                  border: "1px solid var(--c-border)",
                  color: "var(--c-text-dim)",
                }}
              >
                <p className="font-semibold" style={{ color: "var(--c-heading)" }}>
                  How to fix
                </p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-4">
                  <li>Confirm site key matches Cloudflare Turnstile widget.</li>
                  <li>
                    Hostname Management includes this site (e.g. <code className="text-indigo-400">axenflowai.com</code>).
                  </li>
                  <li>Hard refresh (Ctrl+Shift+R), then Retry captcha.</li>
                </ol>
                <p className="mt-2 text-[11px]">Mode: {keyMode} · key {getTurnstileSiteKeyHint()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ minHeight: 65 }}>
      {status === "loading" && (
        <p className="mb-2 text-xs" style={{ color: "var(--c-text-dim)" }}>
          Loading security check…
        </p>
      )}
      <div ref={containerRef} className="w-full" />
      <input type="hidden" name="cf-turnstile-response" value={token} readOnly aria-hidden tabIndex={-1} />
    </div>
  );
}
