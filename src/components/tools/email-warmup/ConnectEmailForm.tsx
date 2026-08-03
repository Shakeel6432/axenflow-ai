"use client";

import { useState } from "react";
import Link from "@/components/ui/AppLink";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MailboxProvider } from "@/lib/mailbox/constants";

type ProviderGuide = {
  id: MailboxProvider;
  label: string;
  steps: { title: string; detail: string }[];
  deepLink?: { label: string; href: string };
  adminNote?: string;
};

const GUIDES: ProviderGuide[] = [
  {
    id: "gmail",
    label: "Gmail",
    steps: [
      { title: "Open Google Account security", detail: "Go to myaccount.google.com/security" },
      { title: "Enable 2-Step Verification", detail: "Turn it on if it is not already enabled (required for App Passwords)." },
      { title: "Search App Passwords", detail: "In the search bar on that page, type App Passwords." },
      { title: "Create an app password", detail: "Name it AxenFlowAI Warmup and create the password." },
      { title: "Copy the 16-character code", detail: "Paste it in the App Password field below (spaces optional)." },
    ],
    deepLink: {
      label: "Open Google App Passwords",
      href: "https://myaccount.google.com/apppasswords",
    },
  },
  {
    id: "outlook",
    label: "Outlook / Microsoft 365",
    steps: [
      { title: "Sign in to Microsoft account security", detail: "Go to account.live.com/proofs/AppPassword or your Microsoft 365 security settings." },
      { title: "Enable multi-factor authentication", detail: "App passwords require MFA on most Microsoft accounts." },
      { title: "Create an app password", detail: "Choose Mail and your device, then generate the password." },
      { title: "Copy the generated password", detail: "Paste it below as your App Password (not your normal sign-in password)." },
    ],
    deepLink: {
      label: "Open Microsoft App Passwords",
      href: "https://account.live.com/proofs/AppPassword",
    },
    adminNote:
      "Some Microsoft 365 work/school accounts disable app passwords. If you do not see the option, contact your IT admin. OAuth connect may be added later for those accounts.",
  },
  {
    id: "custom",
    label: "Custom domain (SMTP/IMAP)",
    steps: [
      { title: "Open your hosting email settings", detail: "cPanel, Plesk, or your provider's email setup page." },
      { title: "Find incoming (IMAP) server", detail: "Usually imap.yourdomain.com on port 993 with SSL/TLS." },
      { title: "Find outgoing (SMTP) server", detail: "Usually smtp.yourdomain.com on port 465 (SSL) or 587 (STARTTLS)." },
      { title: "Create or use an app-specific password", detail: "If your host supports app passwords, use one instead of your main mailbox password." },
      { title: "Enter host, port, and App Password below", detail: "We test SMTP and IMAP over TLS before saving anything." },
    ],
  },
];

const inputStyle = {
  border: "1px solid var(--c-border)",
  background: "var(--c-hover-bg)",
  color: "var(--c-heading)",
} as const;

type Props = {
  onConnected?: () => void;
};

export function ConnectEmailForm({ onConnected }: Props) {
  const [provider, setProvider] = useState<MailboxProvider>("gmail");
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("465");
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testDetail, setTestDetail] = useState<{ smtpOk?: boolean; imapOk?: boolean; smtpError?: string; imapError?: string } | null>(null);

  const guide = GUIDES.find((g) => g.id === provider)!;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setTestDetail(null);
    setBusy(true);

    const payload = {
      provider,
      email: email.trim(),
      appPassword,
      ...(provider === "custom"
        ? {
            smtpHost: smtpHost.trim(),
            smtpPort: Number(smtpPort),
            smtpSecure: Number(smtpPort) === 465,
            imapHost: imapHost.trim(),
            imapPort: Number(imapPort),
            imapSecure: true,
          }
        : {}),
    };

    try {
      const res = await fetch("/api/mailbox/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestDetail({
          smtpOk: data.smtpOk,
          imapOk: data.imapOk,
          smtpError: data.smtpError,
          imapError: data.imapError,
        });
        throw new Error(data.error || "Connection failed");
      }
      setSuccess(`Connected ${data.mailbox.email}. Live SMTP and IMAP tests passed.`);
      onConnected?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-4 text-sm"
        style={{ border: "1px solid rgba(20,184,166,0.35)", background: "rgba(20,184,166,0.08)" }}
      >
        <p className="flex items-start gap-2" style={{ color: "var(--c-text-dim)" }}>
          <Shield size={16} className="mt-0.5 shrink-0 text-teal-400" />
          <span>
            We ask for an <strong>App Password</strong>, not your regular account password. We never ask for or store
            your main password.{" "}
            <Link href="/security/email-protection" className="text-indigo-500 hover:text-teal-500">
              How we protect your email
            </Link>
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {GUIDES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setProvider(g.id)}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{
              border: `1px solid ${provider === g.id ? "#818cf8" : "var(--c-border)"}`,
              background: provider === g.id ? "rgba(99,102,241,0.15)" : "var(--c-hover-bg)",
              color: "var(--c-heading)",
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div
        className="rounded-2xl p-5"
        style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
      >
        <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--c-heading)" }}>
          <Mail size={16} className="text-indigo-400" />
          How to create an App Password ({guide.label})
        </h3>
        <ol className="mt-4 space-y-3">
          {guide.steps.map((step, idx) => (
            <li key={step.title} className="flex gap-3 text-sm" style={{ color: "var(--c-text-dim)" }}>
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}
              >
                {idx + 1}
              </span>
              <div>
                <p className="font-semibold" style={{ color: "var(--c-heading)" }}>
                  {step.title}
                </p>
                <p className="mt-0.5 leading-relaxed">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        {guide.deepLink && (
          <a
            href={guide.deepLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-indigo-400 hover:text-teal-400"
            style={{ border: "1px solid var(--c-border)" }}
          >
            {guide.deepLink.label}
            <ExternalLink size={14} />
          </a>
        )}
        {guide.adminNote && (
          <p className="mt-4 flex items-start gap-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-400" />
            {guide.adminNote}
          </p>
        )}
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
            Email address
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            placeholder="you@company.com"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
            App Password
          </span>
          <input
            type="password"
            required
            autoComplete="off"
            value={appPassword}
            onChange={(e) => setAppPassword(e.target.value)}
            disabled={busy}
            placeholder="16-character app password"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
          <span className="mt-1.5 block text-xs" style={{ color: "var(--c-text-muted)" }}>
            This is NOT your regular account password.
          </span>
        </label>

        {provider === "custom" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
                SMTP host
                <span
                  className="ml-2 text-xs font-normal"
                  style={{ color: "var(--c-text-muted)" }}
                  title="Find this in your hosting provider email settings (cPanel, Plesk, etc.)"
                >
                  Where do I find this?
                </span>
              </span>
              <input
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.yourdomain.com"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
                SMTP port
              </span>
              <input
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="465 or 587"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
                IMAP host
              </span>
              <input
                value={imapHost}
                onChange={(e) => setImapHost(e.target.value)}
                placeholder="imap.yourdomain.com"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
                IMAP port
              </span>
              <input
                value={imapPort}
                onChange={(e) => setImapPort(e.target.value)}
                placeholder="993"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </label>
          </div>
        )}

        <Button type="submit" disabled={busy} className="sm:px-6">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          Test connection and save
        </Button>
      </form>

      {busy && (
        <p className="text-sm text-indigo-400">Running live SMTP login and IMAP login tests before saving...</p>
      )}
      {error && (
        <div className="rounded-xl p-4 text-sm text-red-500" style={{ border: "1px solid rgba(239,68,68,0.3)" }}>
          <p>{error}</p>
          {testDetail && (
            <ul className="mt-2 space-y-1 text-xs">
              <li>SMTP: {testDetail.smtpOk ? "OK" : testDetail.smtpError || "Failed"}</li>
              <li>IMAP: {testDetail.imapOk ? "OK" : testDetail.imapError || "Failed"}</li>
            </ul>
          )}
        </div>
      )}
      {success && (
        <div className="rounded-xl p-4 text-sm text-teal-400" style={{ border: "1px solid rgba(20,184,166,0.3)" }}>
          {success}
        </div>
      )}
    </div>
  );
}
