import type { Metadata } from "next";
import Link from "@/components/ui/AppLink";
import { redirect } from "next/navigation";
import { Flame, Link2, Shield } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
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
        description="Connect mailboxes with App Passwords. Warmup only touches emails our tool tags for warmup."
      />
      <Section tight>
        <Container>
          <div className="mx-auto max-w-3xl space-y-8">
            <div
              className="rounded-2xl p-5"
              style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold" style={{ color: "var(--c-heading)" }}>
                    <Link2 size={18} className="text-indigo-400" />
                    Connect a mailbox
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
                    Gmail, Outlook, or custom SMTP/IMAP. Live connection test required before save.
                  </p>
                </div>
                <Button href="/tools/email-warmup/connect">Connect Your Email</Button>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold" style={{ color: "var(--c-heading)" }}>
                Connected mailboxes
              </h2>
              <ConnectedMailboxesPanel />
            </div>

            <div
              className="rounded-2xl p-5 text-sm leading-relaxed"
              style={{ border: "1px solid var(--c-border)", color: "var(--c-text-dim)" }}
            >
              <p className="flex items-center gap-2 font-semibold" style={{ color: "var(--c-heading)" }}>
                <Shield size={16} className="text-teal-400" />
                Security
              </p>
              <p className="mt-2">
                Disconnect permanently deletes stored credentials from our database. We re-check credentials weekly
                and auto-disconnect if you revoke the App Password on your provider side.{" "}
                <Link href="/security/email-protection" className="text-indigo-500 hover:text-teal-500">
                  Read how we protect your email
                </Link>
              </p>
            </div>

            <div
              className="rounded-2xl p-5 text-sm"
              style={{ border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.08)" }}
            >
              <p className="flex items-center gap-2 font-semibold text-amber-400">
                <Flame size={16} />
                Warmup engine
              </p>
              <p className="mt-2" style={{ color: "var(--c-text-dim)" }}>
                Mailbox connection is ready. Automated warmup sending/scheduling can be enabled in a follow-up release.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
