import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SavedLeadsClient } from "@/components/dashboard/SavedLeadsClient";

export const metadata: Metadata = {
  title: "Saved Leads",
  robots: { index: false, follow: false },
};

export default async function SavedLeadsPage() {
  const session = await requireUser();
  if (!session) {
    redirect(`/signin?callbackUrl=${encodeURIComponent("/dashboard/saved")}`);
  }

  return (
    <>
      <PageHero
        title="Saved Leads"
        description="Businesses you bookmarked from Lead Finder. Remove any time, or open Tools to add more."
      />
      <Section tight>
        <div className="mb-4">
          <Link href="/dashboard" className="text-sm text-indigo-500 hover:text-teal-500">
            ← Back to Dashboard
          </Link>
        </div>
        <SavedLeadsClient />
      </Section>
    </>
  );
}
