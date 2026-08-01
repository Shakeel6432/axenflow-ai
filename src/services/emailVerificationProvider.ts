/**
 * Swappable mailbox verification provider (Phase 2).
 * Swap implementations without changing Email Finder orchestration.
 */

export type MailboxVerifyStatus = "valid" | "invalid" | "catch_all" | "unknown";

export type MailboxVerifyResult = {
  status: MailboxVerifyStatus;
  raw: Record<string, unknown>;
  provider: string;
  /** Provider billed a credit for this call (false for unknown/timeout/disabled) */
  billed: boolean;
  detail: string;
};

export interface EmailVerificationProvider {
  readonly name: string;
  isConfigured(): boolean;
  verifyMailbox(email: string): Promise<MailboxVerifyResult>;
}

function timeoutMs() {
  const n = Number(process.env.EMAIL_FINDER_API_TIMEOUT_MS || 12000);
  return Number.isFinite(n) && n > 1000 ? n : 12000;
}

/** Reoon Email Verifier — Power mode (deep SMTP / inbox-level). */
export class ReoonVerificationProvider implements EmailVerificationProvider {
  readonly name = "reoon";

  isConfigured(): boolean {
    return Boolean(process.env.REOON_API_KEY?.trim());
  }

  async verifyMailbox(email: string): Promise<MailboxVerifyResult> {
    const key = process.env.REOON_API_KEY?.trim();
    if (!key) {
      return {
        status: "unknown",
        raw: {},
        provider: this.name,
        billed: false,
        detail: "REOON_API_KEY not configured",
      };
    }

    const mode = (process.env.REOON_VERIFY_MODE || "power").toLowerCase() === "quick" ? "quick" : "power";
    const url = new URL("https://emailverifier.reoon.com/api/v1/verify");
    url.searchParams.set("email", email);
    url.searchParams.set("key", key);
    url.searchParams.set("mode", mode);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs());

    try {
      let res = await fetch(url.toString(), {
        method: "GET",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      // One short backoff on rate limit
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1500));
        res = await fetch(url.toString(), {
          method: "GET",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
      }

      const raw = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        return {
          status: "unknown",
          raw,
          provider: this.name,
          billed: false,
          detail: `Provider HTTP ${res.status}`,
        };
      }

      const mapped = mapReoonStatus(raw);
      return {
        ...mapped,
        raw,
        provider: this.name,
      };
    } catch (error) {
      const aborted = error instanceof Error && error.name === "AbortError";
      return {
        status: "unknown",
        raw: {},
        provider: this.name,
        billed: false,
        detail: aborted
          ? `Provider timeout after ${timeoutMs()}ms`
          : error instanceof Error
            ? error.message
            : "Provider error",
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

function mapReoonStatus(raw: Record<string, unknown>): Omit<
  MailboxVerifyResult,
  "raw" | "provider"
> {
  const status = String(raw.status || "").toLowerCase();
  const isCatchAll = Boolean(raw.is_catch_all) || status === "catch_all";

  if (isCatchAll) {
    return {
      status: "catch_all",
      billed: true,
      detail: "Provider marked catch-all / accept-all",
    };
  }

  if (status === "safe" || status === "valid" || status === "role_account") {
    return {
      status: "valid",
      billed: true,
      detail: status === "role_account" ? "Valid role mailbox (SMTP-level)" : "SMTP-verified deliverable",
    };
  }

  if (
    status === "invalid" ||
    status === "disabled" ||
    status === "disposable" ||
    status === "spamtrap"
  ) {
    return {
      status: "invalid",
      billed: true,
      detail: `Provider status: ${status}`,
    };
  }

  // inbox_full / unknown — treat as inconclusive for ranking
  if (status === "inbox_full") {
    return {
      status: "unknown",
      billed: true,
      detail: "Inbox full — inconclusive for Finder ranking",
    };
  }

  return {
    status: "unknown",
    billed: status !== "" && status !== "unknown" ? true : status === "unknown",
    detail: status ? `Provider status: ${status}` : "No status from provider",
  };
}

/** Resolve active provider from env (default: reoon). Easy to swap later. */
export function getEmailVerificationProvider(): EmailVerificationProvider {
  const name = (process.env.EMAIL_VERIFICATION_PROVIDER || "reoon").toLowerCase();
  switch (name) {
    case "reoon":
    default:
      return new ReoonVerificationProvider();
  }
}
