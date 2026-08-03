import type { Metadata } from "next";
import Link from "@/components/ui/AppLink";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { ConnectEmailForm } from "@/components/tools/email-warmup/ConnectEmailForm";

export const metadata: Metadata = {
  title: "Connect Your Email | Email Warmup",
  description: "Connect your mailbox to AxenFlowAI Email Warmup using an App Password. Step-by-step guides for Gmail, Outlook, and custom SMTP/IMAP.",
  robots: { index: false, follow: false },
};

export default async function ConnectEmailPage() {
  const session = await requireUser();
  if (!session) {
    redirect(`/signin?callbackUrl=${encodeURIComponent("/tools/email-warmup/connect")}`);
  }

  return (
    <>
      <PageHero
        title="Connect Your Email"
        description="Use an App Password (not your regular password). We test SMTP and IMAP over TLS before saving anything."
      />
      <Section tight>
        <Container>
          <div className="mx-auto max-w-2xl">
            <ConnectEmailForm />
            <p className="mt-6 text-center text-sm" style={{ color: "var(--c-text-muted)" }}>
              <Link href="/dashboard/email-warmup" className="text-indigo-500 hover:text-teal-500">
                Back to Email Warmup dashboard
              </Link>
              {" · "}
              <Link href="/security/email-protection" className="text-indigo-500 hover:text-teal-500">
                How we protect your email
              </Link>
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
