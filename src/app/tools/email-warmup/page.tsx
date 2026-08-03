import type { Metadata } from "next";
import Link from "@/components/ui/AppLink";
import { siteConfig } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth-guards";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";
import { Button } from "@/components/ui/Button";
import { Shield, Flame, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Email Warmup | Improve Inbox Reputation",
  description:
    "Connect your mailbox with an App Password for email warmup on AxenFlowAI. Gmail, Outlook, and custom SMTP/IMAP with encrypted credential storage.",
  alternates: { canonical: `${siteConfig.url}/tools/email-warmup` },
};

export default async function EmailWarmupPage() {
  const session = await getSessionUser();
  const isAuthed = Boolean(session);

  return (
    <>
      <PageHero
        title="Email Warmup"
        description="Connect your sending mailbox safely with App Passwords. We only access warmup-tagged messages we create, never your full inbox."
      />
      <Section tight>
        <Container>
          <ToolHubLinks current="/tools/email-warmup" />
          <div className="mx-auto mt-6 max-w-3xl space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Lock, label: "App Password only" },
                { icon: Shield, label: "Encrypted at rest" },
                { icon: Flame, label: "Warmup-tagged IMAP only" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl p-4 text-sm font-semibold"
                  style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                >
                  <Icon size={16} className="text-teal-400" />
                  {label}
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-6"
              style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
            >
              <h2 className="text-xl font-bold" style={{ color: "var(--c-heading)" }}>
                Connect Your Email
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                Step-by-step guides for Gmail, Outlook/Microsoft 365, and custom domains. We run live SMTP and IMAP
                tests before saving credentials.{" "}
                <Link href="/security/email-protection" className="text-indigo-500 hover:text-teal-500">
                  How we protect your email
                </Link>
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {isAuthed ? (
                  <>
                    <Button href="/tools/email-warmup/connect">Connect Your Email</Button>
                    <Button href="/dashboard/email-warmup" variant="outline">
                      Manage connected mailboxes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button href={`/signin?callbackUrl=${encodeURIComponent("/tools/email-warmup/connect")}`}>
                      Sign in to connect
                    </Button>
                    <Button href={`/signup?callbackUrl=${encodeURIComponent("/tools/email-warmup/connect")}`} variant="outline">
                      Create account
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
