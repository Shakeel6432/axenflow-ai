"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PasswordField } from "@/components/auth/PasswordField";
import { safeCallbackUrl } from "@/lib/safe-callback-url";

const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());

export function SignInForm() {
  const params = useSearchParams();
  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerify, setNeedsVerify] = useState(false);
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setNeedsVerify(false);
    setLoading(true);

    try {
      const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
      setLoading(false);
      if (res?.error) {
        const code = String(res.error || "");
        if (code.includes("EMAIL_NOT_VERIFIED") || code === "email_not_verified") {
          setNeedsVerify(true);
          setError("Please confirm your email before signing in.");
          return;
        }

        // Auth.js often maps thrown errors to CredentialsSignin — check account status
        const statusRes = await fetch("/api/auth/email-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const status = await statusRes.json().catch(() => ({}));
        if (status?.code === "EMAIL_NOT_VERIFIED") {
          setNeedsVerify(true);
          setError("Please confirm your email before signing in.");
          return;
        }

        setError("Invalid email or password");
        return;
      }
      window.location.href = callbackUrl;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setInfo("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setInfo(data.message || data.error || "If needed, a confirmation email was sent.");
    } catch {
      setInfo("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="glass-card w-full rounded-2xl p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div>
          <label className="mb-2 block text-xs font-semibold tracking-wide" style={{ color: "var(--c-text-dim)" }}>
            Email
          </label>
          <input
            className="form-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--c-text-dim)" }}>
              Password
            </label>
            <Link
              href={email.trim() ? `/forgot-password?email=${encodeURIComponent(email.trim())}` : "/forgot-password"}
              className="text-xs font-semibold text-indigo-500 hover:text-teal-500"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordField
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
            placeholder="Your password"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {info && <p className="text-sm text-teal-500">{info}</p>}
        {needsVerify && (
          <button
            type="button"
            disabled={resending || !email.trim()}
            onClick={resend}
            className="text-sm font-semibold text-indigo-500 hover:text-teal-500 disabled:opacity-60"
          >
            {resending ? "Sending..." : "Resend confirmation email"}
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-main w-full rounded-xl px-5 py-3.5 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {googleEnabled && (
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="mt-3 w-full rounded-xl px-5 py-3.5 text-sm font-semibold transition hover:opacity-90"
          style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)", background: "var(--c-hover-bg)" }}
        >
          Continue with Google
        </button>
      )}

      <p className="mt-5 text-center text-sm" style={{ color: "var(--c-text-dim)" }}>
        New here?{" "}
        <Link href="/signup" className="font-semibold text-indigo-500 hover:text-teal-500">
          Create an account
        </Link>
      </p>
    </div>
  );
}
