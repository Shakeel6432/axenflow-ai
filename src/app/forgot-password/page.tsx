import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your AxenFlow AI account password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <>
      <PageHero
        title="Forgot Password"
        description="Enter your registered email. We’ll send a secure one-time code and reset link."
      />
      <Section tight>
        <AuthShell
          title="Reset your password"
          description="Security code is emailed only to your account address, expires in 15 minutes, and can be used once."
        >
          <Suspense fallback={<p className="text-sm" style={{ color: "var(--c-text-muted)" }}>Loading...</p>}>
            <ForgotPasswordForm />
          </Suspense>
        </AuthShell>
      </Section>
    </>
  );
}
