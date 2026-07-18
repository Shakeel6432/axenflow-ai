import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";

export const metadata: Metadata = {
  title: "Account Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await requireUser();
  if (!session) {
    redirect(`/signin?callbackUrl=${encodeURIComponent("/dashboard/settings")}`);
  }

  return (
    <>
      <PageHero
        title="Account Settings"
        description="Manage your profile, password, and notification preferences."
      />
      <Section tight>
        <div className="mb-4">
          <Link href="/dashboard" className="text-sm font-semibold text-indigo-500 hover:text-teal-500">
            ← Back to dashboard
          </Link>
        </div>
        <ProfileSettingsForm />
      </Section>
    </>
  );
}
