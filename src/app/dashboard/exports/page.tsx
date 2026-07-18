import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ExportHistoryClient } from "@/components/dashboard/ExportHistoryClient";

export const metadata: Metadata = {
  title: "Export History",
  robots: { index: false, follow: false },
};

export default async function ExportHistoryPage() {
  const session = await requireUser();
  if (!session) {
    redirect(`/signin?callbackUrl=${encodeURIComponent("/dashboard/exports")}`);
  }

  return (
    <>
      <PageHero
        title="Export History"
        description="A log of CSV, Excel, and JSON downloads from your account. Files are generated in your browser."
      />
      <Section tight>
        <div className="mb-4">
          <Link href="/dashboard" className="text-sm text-indigo-500 hover:text-teal-500">
            ← Back to Dashboard
          </Link>
        </div>
        <ExportHistoryClient />
      </Section>
    </>
  );
}
