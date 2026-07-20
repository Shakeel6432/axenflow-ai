"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PasswordField } from "@/components/auth/PasswordField";

export function ForgotPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const prefillEmail = params.get("email") || "";

  const [step, setStep] = useState<"email" | "otp" | "password" | "done">("email");
  const [email, setEmail] = useState(prefillEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
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
        setError(data.error || "Could not send reset code.");
        return;
      }
      setInfo(data.message || "If an account exists, a 6-digit code was sent to that email.");
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const goToPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.trim().length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setStep("password");
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token: otp.trim(),
          password,
          confirmPassword,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "Could not reset password.");
        return;
      }
      setStep("done");
      window.setTimeout(() => router.push("/signin"), 1600);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="glass-card w-full rounded-2xl p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto mb-3 text-teal-500" size={40} />
        <h2 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
          Password updated
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
          Redirecting you to sign in...
        </p>
      </div>
    );
  }

  if (step === "password") {
    return (
      <div className="glass-card w-full rounded-2xl p-6 sm:p-8">
        <form onSubmit={resetPassword} className="space-y-5" noValidate>
          <div>
            <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
              Code verified. Choose a new password for{" "}
              <strong style={{ color: "var(--c-heading)" }}>{email}</strong>.
            </p>
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

        <button
          type="button"
          className="mt-4 w-full text-sm font-semibold text-indigo-500 hover:text-teal-500"
          onClick={() => {
            setStep("otp");
            setPassword("");
            setConfirmPassword("");
            setError("");
          }}
        >
          Back to code
        </button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="glass-card w-full rounded-2xl p-6 sm:p-8">
        <form onSubmit={goToPassword} className="space-y-5" noValidate>
          <div>
            <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
              {info || "Enter the 6-digit security code from your email."}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--c-text-dim)" }}>
              Sent to <strong style={{ color: "var(--c-heading)" }}>{email}</strong>. Check Inbox and Spam.
              Never share this code. AxenFlow will never ask for it by chat.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wide" style={{ color: "var(--c-text-dim)" }}>
              Email
            </label>
            <input className="form-input" type="email" value={email} readOnly disabled />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wide" style={{ color: "var(--c-text-dim)" }}>
              6-digit code from email
            </label>
            <input
              className="form-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={otp.length !== 6}
            className="btn-main w-full rounded-xl px-5 py-3.5 text-sm font-semibold disabled:opacity-60"
          >
            Next
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-sm font-semibold text-indigo-500 hover:text-teal-500"
          onClick={() => {
            setStep("email");
            setOtp("");
            setError("");
            setInfo("");
          }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card w-full rounded-2xl p-6 sm:p-8">
      <form onSubmit={sendCode} className="space-y-5" noValidate>
        <div>
          <label className="mb-2 block text-xs font-semibold tracking-wide" style={{ color: "var(--c-text-dim)" }}>
            Registered email
          </label>
          <input
            className="form-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="Email you used to sign up"
          />
          <p className="mt-2 text-xs" style={{ color: "var(--c-text-dim)" }}>
            The 6-digit code is emailed only to this account address. It is not shown on screen.
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-main w-full rounded-xl px-5 py-3.5 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Sending code..." : "Send code to email"}
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
