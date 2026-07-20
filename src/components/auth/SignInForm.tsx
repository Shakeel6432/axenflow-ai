"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PasswordField } from "@/components/auth/PasswordField";

const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());

export function SignInForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
      setLoading(false);
      if (res?.error) {
        setError("Invalid email or password");
        return;
      }
      window.location.href = callbackUrl;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
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
            <Link href="/forgot-password" className="text-xs font-semibold text-indigo-500 hover:text-teal-500">
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
