"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export function VerifyEmailClient() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const token = params.get("token") || "";

  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setMessage("This confirmation link is incomplete. Request a new one from sign up.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Could not confirm email.");
          return;
        }
        setStatus("ok");
        setMessage(data.message || "Email confirmed. You can sign in now.");
        window.setTimeout(() => router.push("/signin"), 1800);
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Network error. Please try again.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email, token, router]);

  return (
    <div className="glass-card w-full rounded-2xl p-6 text-center sm:p-8">
      {status === "loading" && <Loader2 className="mx-auto mb-3 animate-spin text-indigo-400" size={40} />}
      {status === "ok" && <CheckCircle2 className="mx-auto mb-3 text-teal-500" size={40} />}
      {status === "error" && <XCircle className="mx-auto mb-3 text-red-400" size={40} />}

      <h2 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
        {status === "loading" ? "Confirming email" : status === "ok" ? "Email confirmed" : "Confirmation failed"}
      </h2>
      <p className="mt-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
        {message}
      </p>

      {status !== "loading" && (
        <div className="mt-5">
          <Link href="/signin" className="text-sm font-semibold text-indigo-500 hover:text-teal-500">
            Go to Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
