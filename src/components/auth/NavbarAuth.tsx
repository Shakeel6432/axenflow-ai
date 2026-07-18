"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

function GuestActions({ mobile }: { mobile: boolean }) {
  if (mobile) {
    return (
      <>
        <Link
          href="/signin"
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
          style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
        >
          Create Account
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/signin"
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
        style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)" }}
      >
        Sign Up
      </Link>
    </>
  );
}

function UserActions({ mobile }: { mobile: boolean }) {
  if (mobile) {
    return (
      <>
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
          style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
        >
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
        style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
      >
        Dashboard
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)" }}
      >
        Sign Out
      </button>
    </>
  );
}

export function NavbarAuth({ mobile = false }: { mobile?: boolean }) {
  const { status } = useSession();

  // Never show a spinner. While session resolves, keep guest buttons stable.
  if (status === "authenticated") {
    return <UserActions mobile={mobile} />;
  }

  return <GuestActions mobile={mobile} />;
}
