/** Custom header set on warmup emails we send. IMAP scans MUST filter on this only. */
export const WARMUP_HEADER = "X-Warmup-Tool";
export const WARMUP_HEADER_VALUE = "axenflowai-internal";

export type MailboxProvider = "gmail" | "outlook" | "custom";

export type MailboxServerConfig = {
  host: string;
  port: number;
  secure: boolean;
};

export type MailboxCredentialPayload = {
  email: string;
  appPassword: string;
  smtp: MailboxServerConfig;
  imap: MailboxServerConfig;
};

export type ProviderPreset = {
  id: MailboxProvider;
  label: string;
  smtp: MailboxServerConfig;
  imap: MailboxServerConfig;
  revokeUrl: string;
};

export const PROVIDER_PRESETS: Record<Exclude<MailboxProvider, "custom">, ProviderPreset> = {
  gmail: {
    id: "gmail",
    label: "Gmail",
    smtp: { host: "smtp.gmail.com", port: 465, secure: true },
    imap: { host: "imap.gmail.com", port: 993, secure: true },
    revokeUrl: "https://myaccount.google.com/apppasswords",
  },
  outlook: {
    id: "outlook",
    label: "Outlook / Microsoft 365",
    smtp: { host: "smtp.office365.com", port: 587, secure: false },
    imap: { host: "outlook.office365.com", port: 993, secure: true },
    revokeUrl: "https://account.live.com/proofs/AppPassword",
  },
};
