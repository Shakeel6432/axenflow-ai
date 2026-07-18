import Link from "next/link";
import { Lock } from "lucide-react";
import { Section } from "@/components/ui/Section";

type AuthRequiredProps = {
  title?: string;
  message?: string;
  callbackUrl?: string;
};

export function AuthRequired({
  title = "Account required",
  message = "You need an account to use this tool",
  callbackUrl = "/tools",
}: AuthRequiredProps) {
  const signInHref = `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <Section tight>
      <div className="glass-card mx-auto max-w-lg rounded-2xl p-8 text-center">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
        >
          <Lock size={22} />
        </div>
        <h2 className="text-xl font-semibold" style={{ color: "var(--c-heading)" }}>{title}</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-muted)" }}>{message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="btn-main inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            Create Account
          </Link>
          <Link
            href={signInHref}
            className="inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold"
            style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)", background: "var(--c-hover-bg)" }}
          >
            Login
          </Link>
        </div>
      </div>
    </Section>
  );
}
