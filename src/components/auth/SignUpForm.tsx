"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { PasswordField } from "@/components/auth/PasswordField";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create account");
        setLoading(false);
        return;
      }
      setSuccessEmail(email.trim().toLowerCase());
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!successEmail) return;
    setResending(true);
    setResendMsg("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: successEmail }),
      });
      const data = await res.json();
      setResendMsg(data.message || data.error || "Request sent.");
    } catch {
      setResendMsg("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (successEmail) {
    return (
      <div className="glass-card w-full rounded-2xl p-6 text-center sm:p-8">
        <Mail className="mx-auto mb-3 text-indigo-400" size={40} />
        <h2 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
          Confirm your email
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
          We sent a confirmation link to <strong style={{ color: "var(--c-heading)" }}>{successEmail}</strong>.
          Open it to activate your account, then sign in.
        </p>
        <p className="mt-3 text-xs" style={{ color: "var(--c-text-dim)" }}>
          Check Inbox and Spam. The link expires in 24 hours.
        </p>
        <button
          type="button"
          disabled={resending}
          onClick={resend}
          className="mt-5 text-sm font-semibold text-indigo-500 hover:text-teal-500 disabled:opacity-60"
        >
          {resending ? "Sending..." : "Resend confirmation email"}
        </button>
        {resendMsg && (
          <p className="mt-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
            {resendMsg}
          </p>
        )}
        <div className="mt-5">
          <Link href="/signin" className="text-sm font-semibold text-indigo-500 hover:text-teal-500">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card w-full rounded-2xl p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Full Name">
          <input
            className="form-input"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Your name"
          />
        </Field>
        <Field label="Email">
          <input
            className="form-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
          />
        </Field>
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <PasswordField
          label="Confirm Password"
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
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm" style={{ color: "var(--c-text-dim)" }}>
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-indigo-500 hover:text-teal-500">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold tracking-wide" style={{ color: "var(--c-text-dim)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
