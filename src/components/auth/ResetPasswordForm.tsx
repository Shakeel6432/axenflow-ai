"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PasswordField } from "@/components/auth/PasswordField";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !token) {
      setError("Reset link is incomplete. Request a new one.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password, confirmPassword }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "Could not reset password.");
        return;
      }
      setSuccess(true);
      window.setTimeout(() => router.push("/signin"), 1600);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="glass-card w-full rounded-2xl p-6 sm:p-8">
        <p className="text-sm text-red-500">This reset link is invalid. Please request a new one.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm font-semibold text-indigo-500 hover:text-teal-500">
          Forgot password
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-card w-full rounded-2xl p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto mb-3 text-teal-500" size={40} />
        <h2 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
          Password updated
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
          Redirecting you to sign in…
        </p>
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
          <input className="form-input" type="email" value={email} readOnly disabled />
        </div>

        <PasswordField
          label="New password"
          value={password}
          onChange={setPassword}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <PasswordField
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Repeat password"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-main w-full rounded-xl px-5 py-3.5 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm" style={{ color: "var(--c-text-dim)" }}>
        <Link href="/signin" className="font-semibold text-indigo-500 hover:text-teal-500">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
