import type { Metadata } from "next";
import Link from "@/components/ui/AppLink";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { WarmupAnalyticsDashboard } from "@/components/tools/email-warmup/WarmupAnalyticsDashboard";
import { ConnectedMailboxesPanel } from "@/components/tools/email-warmup/ConnectedMailboxesPanel";

export const metadata: Metadata = {
  title: "Email Warmup Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardEmailWarmupPage() {
  const session = await requireUser();
  if (!session) {
    redirect(`/signin?callbackUrl=${encodeURIComponent("/dashboard/email-warmup")}`);
  }

  return (
    <>
      <PageHero
        title="Email Warmup"
        description="Track warmup score, inbox placement, and spam-to-inbox rescues. Connect mailboxes with App Passwords — we only touch warmup-tagged messages."
      />
      <Section tight>
        <Container>
          <div className="mx-auto max-w-5xl space-y-10">
            <WarmupAnalyticsDashboard />

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold" style={{ color: "var(--c-heading)" }}>
                  Connected mailboxes
                </h2>
                <Button href="/tools/email-warmup/connect" variant="outline">
                  Connect Your Email
                </Button>
              </div>
              <ConnectedMailboxesPanel />
              <p className="mt-3 text-sm" style={{ color: "var(--c-text-muted)" }}>
                <Link href="/security/email-protection" className="text-indigo-500 hover:text-teal-500">
                  How we protect your email
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
