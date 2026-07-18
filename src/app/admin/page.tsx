import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin | Lead Database",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session) redirect("/login?callbackUrl=/admin");
  if (role !== "ADMIN") redirect("/login?error=admin");

  return (
    <>
      <PageHero title="Admin Panel" description="Import leads, monitor growth, and manage the AxenFlowAI lead database." />
      <Section tight>
        <AdminDashboard />
      </Section>
    </>
  );
}
