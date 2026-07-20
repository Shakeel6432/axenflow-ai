import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your AxenFlow AI account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <>
      <PageHero
        title="Reset Password"
        description="Choose a new password to get back into your account."
      />
      <Section tight>
        <AuthShell
          title="Choose a new password"
          description="Use at least 8 characters. After updating, sign in with your new password."
        >
          <Suspense fallback={<p className="text-sm" style={{ color: "var(--c-text-muted)" }}>Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </AuthShell>
      </Section>
    </>
  );
}
