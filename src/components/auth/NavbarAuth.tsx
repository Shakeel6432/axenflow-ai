"use client";

import Link from "@/components/ui/AppLink";
import { signOut, useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";

function GuestActions({ mobile }: { mobile: boolean }) {
  if (mobile) {
    return (
      <>
        <Link
          href="/signin"
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
          style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all"
          style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5 55%, #0d9488)" }}
        >
          Create Account <ArrowRight size={14} />
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/signin"
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className="group inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #0f766e 100%)" }}
      >
        Sign Up
        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
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
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
          style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
        >
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20"
          style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5 55%, #0d9488)" }}
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
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
      >
        Dashboard
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #0f766e 100%)" }}
      >
        Sign Out
      </button>
    </>
  );
}

export function NavbarAuth({ mobile = false }: { mobile?: boolean }) {
  const { status } = useSession();

  if (status === "authenticated") {
    return <UserActions mobile={mobile} />;
  }

  return <GuestActions mobile={mobile} />;
}
