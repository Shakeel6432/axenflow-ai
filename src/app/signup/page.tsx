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
      {/*
        justify-start + compact shell: taller signup form still leaves room for
        the layout FooterCta (“Got a project in mind?”) on the first screen — same as /signin.
      */}
      <Section tight className="justify-start py-2 lg:py-3">
        <AuthShell
          title="Create your free account"
          description="Join AxenFlow AI to unlock Lead Finder, save lists, export data, and download desktop scrapers."
        >
          <SignUpForm />
        </AuthShell>
      </Section>
    </>
  );
}
