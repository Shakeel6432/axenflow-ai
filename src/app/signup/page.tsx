import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a free AxenFlow AI account to access lead tools and desktop downloads.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <>
      <PageHero
        title="Create Account"
        description="Register to unlock Lead Finder, download desktop scrapers, and track your activity."
      />
      <Section tight>
        <AuthShell
          title="Create your free account"
          description="We will email a confirmation link. Confirm your address, then sign in to unlock Lead Finder and downloads."
        >
          <SignUpForm />
        </AuthShell>
      </Section>
    </>
  );
}
