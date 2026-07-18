import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SignInForm } from "@/components/auth/SignInForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your AxenFlow AI account.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <>
      <PageHero
        title="Sign In"
        description="Access your dashboard, lead tools, and desktop downloads."
      />
      <Section tight>
        <AuthShell
          title="Welcome back"
          description="Sign in to continue where you left off. Leads, exports, and downloads are ready in your dashboard."
        >
          <Suspense fallback={<p className="text-sm" style={{ color: "var(--c-text-muted)" }}>Loading...</p>}>
            <SignInForm />
          </Suspense>
        </AuthShell>
      </Section>
    </>
  );
}
