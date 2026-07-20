import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyEmailClient } from "@/components/auth/VerifyEmailClient";

export const metadata: Metadata = {
  title: "Confirm Email",
  description: "Confirm your AxenFlow AI account email.",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <>
      <PageHero
        title="Confirm Email"
        description="Activate your account so you can sign in securely."
      />
      <Section tight>
        <AuthShell
          title="Email confirmation"
          description="We are verifying your email link. This only takes a moment."
        >
          <Suspense fallback={<p className="text-sm" style={{ color: "var(--c-text-muted)" }}>Loading...</p>}>
            <VerifyEmailClient />
          </Suspense>
        </AuthShell>
      </Section>
    </>
  );
}
