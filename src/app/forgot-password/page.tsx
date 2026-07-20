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
        description="Enter your email and we’ll send a secure link to reset your password."
      />
      <Section tight>
        <AuthShell
          title="Reset your password"
          description="We’ll email you a one-hour reset link. For security, the link can only be used once."
        >
          <ForgotPasswordForm />
        </AuthShell>
      </Section>
    </>
  );
}
