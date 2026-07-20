"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "Could not send reset email.");
        return;
      }
      setSuccess(data.message || "Check your email for a reset link.");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-card w-full rounded-2xl p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto mb-3 text-teal-500" size={40} />
        <h2 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
          Check your email
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
          {success}
        </p>
        <Link href="/signin" className="mt-5 inline-block text-sm font-semibold text-indigo-500 hover:text-teal-500">
          Back to Sign In
        </Link>
      </div>
    );
  }

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

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-main w-full rounded-xl px-5 py-3.5 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm" style={{ color: "var(--c-text-dim)" }}>
        Remembered it?{" "}
        <Link href="/signin" className="font-semibold text-indigo-500 hover:text-teal-500">
          Sign in
        </Link>
      </p>
    </div>
  );
}
