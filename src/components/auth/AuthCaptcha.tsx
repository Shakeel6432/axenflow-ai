"use client";

import { useCallback, useState } from "react";
import { Turnstile } from "@/components/contact/Turnstile";

/**
 * Shared Cloudflare Turnstile state for auth forms.
 *
 * Enable / show widget:
 * 1. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY in .env
 * 2. Live site shows captcha automatically
 * 3. Localhost: set NEXT_PUBLIC_TURNSTILE_FORCE=true (and restart) to test the widget
 */
export function useAuthCaptcha() {
  const [token, setToken] = useState("");

  const onToken = useCallback((value: string) => setToken(value), []);
  const onExpire = useCallback(() => setToken(""), []);
  const reset = useCallback(() => setToken(""), []);

  const requireToken = (): string | null => {
    if (token) return null;
    return "Please complete the captcha verification.";
  };

  return { token, onToken, onExpire, reset, requireToken };
}

type AuthCaptchaFieldProps = {
  action: "login" | "signup";
  onToken: (token: string) => void;
  onExpire: () => void;
};

/**
 * Dedicated captcha slot (password → captcha → submit).
 * Change Turnstile options here only — forms stay untouched.
 */
export function AuthCaptchaField({ action, onToken, onExpire }: AuthCaptchaFieldProps) {
  return (
    <div data-auth-captcha data-action={action} className="min-h-[1px]">
      <Turnstile action={action} onToken={onToken} onExpire={onExpire} className="w-full" />
    </div>
  );
}
