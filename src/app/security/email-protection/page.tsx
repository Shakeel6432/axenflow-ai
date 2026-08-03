import type { Metadata } from "next";
import Link from "@/components/ui/AppLink";
import { siteConfig } from "@/lib/constants";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How We Protect Your Email | AxenFlow AI",
  description:
    "Plain-language explanation of how AxenFlowAI stores App Passwords, limits IMAP access to warmup-tagged mail only, and lets you disconnect anytime.",
  alternates: { canonical: `${siteConfig.url}/security/email-protection` },
};

const SECTIONS = [
  {
    title: "App Password, not your real password",
    body:
      "We ask for an App Password generated in Google or Microsoft (or your email host), not your normal sign-in password. You can revoke that App Password anytime in your account security settings without changing your main password.",
  },
  {
    title: "Encrypted storage",
    body:
      "Your App Password is encrypted using AES-256-GCM envelope encryption: each mailbox gets its own data key, and that key is wrapped by a master key stored in our server secrets environment (Vercel encrypted env). Even our team cannot read your App Password in plain text from the database.",
  },
  {
    title: "We only touch warmup emails we created",
    body:
      "Our IMAP access searches only for messages carrying our internal warmup header (X-Warmup-Tool: axenflowai-internal). We do not read, open, move, or store your other personal or business emails. We never send your inbox content to analytics or AI systems.",
  },
  {
    title: "Disconnect anytime",
    body:
      "From your Email Warmup dashboard, Disconnect permanently deletes your stored encrypted credentials from our database (not just an inactive flag). For extra safety, revoke the App Password in Google or Microsoft too.",
  },
  {
    title: "Why App Passwords are safer than sharing your main password",
    body:
      "App Passwords are scoped to mail access only. They cannot reset your account password, cannot access unrelated Google or Microsoft services, and require two-step verification to already be enabled on your account.",
  },
  {
    title: "Automatic checks",
    body:
      "We re-verify stored credentials about once a week. If you revoke the App Password outside AxenFlowAI, we detect the auth failure and remove the stored credential on our side.",
  },
] as const;

export default function EmailProtectionPage() {
  return (
    <>
      <PageHero
        title="How We Protect Your Email"
        description="What we collect, what we encrypt, and what we never access in your inbox."
      />
      <Section tight>
        <Container>
          <div className="glass-card mx-auto max-w-3xl space-y-8 rounded-2xl p-8 sm:p-12">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="font-[var(--font-space)] text-lg font-bold" style={{ color: "var(--c-heading)" }}>
                  {s.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                  {s.body}
                </p>
              </div>
            ))}
            <div>
              <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>
                For full legal detail see our{" "}
                <Link href="/privacy" className="text-indigo-500 hover:text-teal-500">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="text-indigo-500 hover:text-teal-500">
                  Terms of Service
                </Link>
                . Handling third-party email credentials has legal weight; have counsel review before broad public launch.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/tools/email-warmup/connect">Connect Your Email</Button>
                <Button href="/dashboard/email-warmup" variant="outline">
                  Email Warmup dashboard
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
