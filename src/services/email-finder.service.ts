import { prisma, isDatabaseConfigured } from "@/lib/db";
import { checkMx, resolveMxExchanges } from "@/services/email-validator.service";
import {
  generateEmailCandidates,
  isValidPatternKey,
  normalizeDomain,
  normalizeNamePart,
  type EmailPatternCandidate,
  type PatternKey,
} from "@/lib/email-finder/patterns";
import { probeCatchAll } from "@/lib/email-finder/catchall";
import { getEmailVerificationProvider } from "@/services/emailVerificationProvider";
import {
  canSpendApiCredits,
  logApiVerification,
  maybeAlertApiBudget,
} from "@/services/emailFinderApiBudget";

export type FinderConfidence = "High" | "Medium" | "Low" | "Invalid";

export type FinderCandidateResult = {
  email: string;
  pattern: PatternKey;
  patternLabel: string;
  weight: number;
  confidence: FinderConfidence;
  reason: string;
  rank: number;
  /** True when third-party API confirmed this mailbox */
  smtpVerified?: boolean;
  apiStatus?: string;
};

export type EmailFinderResult = {
  domain: string;
  firstName: string;
  lastName: string;
  mxValid: boolean;
  isCatchAll: boolean | null;
  catchAllDetail: string;
  confirmedPattern: string | null;
  confidenceCount: number;
  phase: "pattern_mx_v1" | "api_verify_v2";
  smtpMailboxProbe: boolean;
  /** Best candidate was SMTP/API-verified as deliverable */
  smtpVerified: boolean;
  /** Guests: show signup CTA for API verification */
  smtpUpgradeAvailable: boolean;
  verificationProvider: string | null;
  apiCallsUsed: number;
  best: FinderCandidateResult | null;
  candidates: FinderCandidateResult[];
  notes: string[];
};

const API_RECHECK_DAYS = 90;

function verifyTopN(bulk: boolean) {
  const key = bulk ? "EMAIL_FINDER_VERIFY_TOP_N_BULK" : "EMAIL_FINDER_VERIFY_TOP_N";
  const fallback = bulk ? 1 : 2;
  const n = Number(process.env[key] || process.env.EMAIL_FINDER_VERIFY_TOP_N || fallback);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 3) : fallback;
}

function daysAgo(d: Date | null | undefined, days: number) {
  if (!d) return false;
  return Date.now() - d.getTime() < days * 24 * 60 * 60 * 1000;
}

async function loadDomainMemory(domain: string) {
  if (!isDatabaseConfigured()) return null;
  try {
    return await prisma.domainPattern.findUnique({ where: { domain } });
  } catch {
    return null;
  }
}

async function upsertDomainMemory(
  domain: string,
  patch: {
    isCatchAll?: boolean | null;
    confirmedPattern?: string | null;
    confidenceCount?: number;
    lastApiVerified?: Date | null;
    touchChecked?: boolean;
  }
) {
  if (!isDatabaseConfigured()) return;
  try {
    const existing = await prisma.domainPattern.findUnique({ where: { domain } });
    const data = {
      isCatchAll:
        patch.isCatchAll === undefined
          ? existing?.isCatchAll ?? null
          : patch.isCatchAll,
      confirmedPattern:
        patch.confirmedPattern === undefined
          ? existing?.confirmedPattern ?? null
          : patch.confirmedPattern,
      confidenceCount:
        patch.confidenceCount === undefined
          ? existing?.confidenceCount ?? 0
          : patch.confidenceCount,
      lastApiVerified:
        patch.lastApiVerified === undefined
          ? existing?.lastApiVerified ?? null
          : patch.lastApiVerified,
      lastChecked: patch.touchChecked === false ? existing?.lastChecked ?? null : new Date(),
    };
    await prisma.domainPattern.upsert({
      where: { domain },
      create: { domain, ...data },
      update: data,
    });
  } catch (error) {
    console.error("domain_patterns upsert failed:", error);
  }
}

function scoreCandidate(
  candidate: EmailPatternCandidate,
  opts: {
    mxValid: boolean;
    isCatchAll: boolean | null;
    confirmedPattern: string | null;
  }
): { confidence: FinderConfidence; reason: string } {
  if (!opts.mxValid) {
    return {
      confidence: "Invalid",
      reason: "Domain has no valid MX records and cannot receive email",
    };
  }

  const isConfirmed = opts.confirmedPattern === candidate.key;

  if (isConfirmed && opts.isCatchAll !== true) {
    return {
      confidence: "High",
      reason: "Confirmed pattern for this domain + valid MX (pattern memory; not SMTP-verified yet)",
    };
  }

  if (opts.isCatchAll === true) {
    return {
      confidence: "Low",
      reason:
        "This domain accepts all email addresses (catch-all), so we cannot fully confirm this specific mailbox exists",
    };
  }

  if (candidate.weight >= 65) {
    return {
      confidence: "Medium",
      reason:
        "Valid MX + statistical best-guess pattern (not catch-all). Pattern match, not SMTP-verified.",
    };
  }

  return {
    confidence: "Low",
    reason: "Valid MX but lower-probability pattern guess (statistical ranking only)",
  };
}

function emptyFinderResult(
  partial: Partial<EmailFinderResult> & Pick<EmailFinderResult, "domain" | "firstName" | "lastName" | "notes">
): EmailFinderResult {
  return {
    mxValid: false,
    isCatchAll: null,
    catchAllDetail: "",
    confirmedPattern: null,
    confidenceCount: 0,
    phase: "pattern_mx_v1",
    smtpMailboxProbe: false,
    smtpVerified: false,
    smtpUpgradeAvailable: false,
    verificationProvider: null,
    apiCallsUsed: 0,
    best: null,
    candidates: [],
    ...partial,
  };
}

/**
 * Phase 1 Email Finder: patterns + MX (+ optional catch-all probe) + domain memory.
 * Does NOT SMTP-probe candidate mailboxes (that is Phase 2).
 */
export async function findEmailsPhase1(input: {
  firstName: string;
  lastName: string;
  domain: string;
}): Promise<EmailFinderResult> {
  const firstName = normalizeNamePart(input.firstName);
  const lastName = normalizeNamePart(input.lastName);
  const domain = normalizeDomain(input.domain);
  const notes: string[] = [];

  if (!domain || !domain.includes(".")) {
    return emptyFinderResult({
      domain,
      firstName,
      lastName,
      notes: ["Enter a valid domain (e.g. company.com)"],
    });
  }
  if (!firstName && !lastName) {
    return emptyFinderResult({
      domain,
      firstName,
      lastName,
      notes: ["Enter at least a first or last name"],
    });
  }

  const mxStatus = await checkMx(domain);
  const mxValid = mxStatus === "Valid";
  if (!mxValid) {
    notes.push("Invalid — domain cannot receive email (no MX)");
    return emptyFinderResult({
      domain,
      firstName,
      lastName,
      mxValid: false,
      catchAllDetail: "Skipped — no MX",
      notes,
    });
  }

  const memory = await loadDomainMemory(domain);
  let isCatchAll = memory?.isCatchAll ?? null;
  let catchAllDetail = "";
  let confirmedPattern = memory?.confirmedPattern ?? null;
  let confidenceCount = memory?.confidenceCount ?? 0;

  // Catch-all: reuse cached value; only probe when unknown and probe enabled.
  if (isCatchAll === null) {
    const mxHosts = await resolveMxExchanges(domain);
    const probe = await probeCatchAll(domain, mxHosts);
    isCatchAll = probe.isCatchAll;
    catchAllDetail = probe.detail;
    if (probe.probed && probe.isCatchAll !== null) {
      await upsertDomainMemory(domain, {
        isCatchAll: probe.isCatchAll,
        touchChecked: true,
      });
      notes.push(
        probe.isCatchAll
          ? "Catch-all detected and cached for this domain"
          : "Not catch-all (cached for this domain)"
      );
    } else if (!probe.probed) {
      catchAllDetail = probe.detail;
      notes.push("Catch-all status unknown (probe disabled or skipped)");
    } else {
      catchAllDetail = probe.detail;
      notes.push(`Catch-all inconclusive: ${probe.detail}`);
      await upsertDomainMemory(domain, { touchChecked: true });
    }
  } else {
    catchAllDetail = isCatchAll
      ? "Cached: domain is catch-all"
      : "Cached: domain is not catch-all";
    notes.push("Reused catch-all result from domain_patterns");
  }

  if (confirmedPattern) {
    notes.push(`Reused confirmed pattern "${confirmedPattern}" from domain_patterns`);
  }

  const generated = generateEmailCandidates({ firstName, lastName, domain });

  // Prefer confirmed pattern first in ranking
  const ranked = [...generated].sort((a, b) => {
    const aConf = confirmedPattern === a.key ? 1 : 0;
    const bConf = confirmedPattern === b.key ? 1 : 0;
    if (aConf !== bConf) return bConf - aConf;
    return b.weight - a.weight;
  });

  const candidates: FinderCandidateResult[] = ranked.map((c, idx) => {
    const scored = scoreCandidate(c, { mxValid, isCatchAll, confirmedPattern });
    // Cap High → Medium when catch-all (safety)
    let confidence = scored.confidence;
    let reason = scored.reason;
    if (isCatchAll === true && confidence === "High") {
      confidence = "Medium";
      reason =
        "Confirmed pattern on a catch-all domain — capped at Medium because any address is accepted";
    }
    return {
      email: c.email,
      pattern: c.key,
      patternLabel: c.label,
      weight: c.weight,
      confidence,
      reason,
      rank: idx + 1,
    };
  });

  // Touch last_checked even when reusing memory
  await upsertDomainMemory(domain, {
    isCatchAll,
    confirmedPattern,
    confidenceCount,
    touchChecked: true,
  });

  return {
    domain,
    firstName,
    lastName,
    mxValid: true,
    isCatchAll,
    catchAllDetail,
    confirmedPattern,
    confidenceCount,
    phase: "pattern_mx_v1",
    smtpMailboxProbe: false,
    smtpVerified: false,
    smtpUpgradeAvailable: false,
    verificationProvider: null,
    apiCallsUsed: 0,
    best: candidates[0] || null,
    candidates,
    notes,
  };
}

/**
 * Phase 2: Phase 1 ranking, then verify top candidates via third-party API (signed-in only).
 * Fails soft to Phase 1 confidence on timeout / budget / provider errors.
 */
export async function findEmailsWithVerification(input: {
  firstName: string;
  lastName: string;
  domain: string;
  userId?: string | null;
  /** Bulk rows use a lower top-N to control cost */
  bulk?: boolean;
}): Promise<EmailFinderResult> {
  const base = await findEmailsPhase1(input);
  const provider = getEmailVerificationProvider();

  if (!base.mxValid || !base.candidates.length) {
    return { ...base, smtpUpgradeAvailable: false };
  }

  if (!provider.isConfigured()) {
    base.notes.push("API verification unavailable (provider not configured) — Phase 1 ranking only");
    return {
      ...base,
      phase: "api_verify_v2",
      smtpMailboxProbe: false,
      verificationProvider: provider.name,
    };
  }

  const topN = verifyTopN(Boolean(input.bulk));
  const memory = await loadDomainMemory(base.domain);
  const recentApi =
    Boolean(memory?.confirmedPattern) && daysAgo(memory?.lastApiVerified ?? null, API_RECHECK_DAYS);

  // Fresh API confirmation for this domain's pattern — skip re-bill within 90 days
  if (recentApi && memory?.confirmedPattern) {
    const confirmed = memory.confirmedPattern;
    const candidates = base.candidates.map((c, idx) => {
      if (c.pattern !== confirmed) {
        return { ...c, rank: idx + 1, smtpVerified: false };
      }
      return {
        ...c,
        rank: idx + 1,
        confidence: (base.isCatchAll === true ? "Medium" : "High") as FinderConfidence,
        smtpVerified: base.isCatchAll !== true,
        reason:
          base.isCatchAll === true
            ? "Confirmed pattern on catch-all domain — API recheck skipped (cached <90 days); capped at Medium"
            : "High — SMTP-verified (cached API confirmation within 90 days)",
        apiStatus: "cached",
      };
    });
    // Put confirmed first
    candidates.sort((a, b) => {
      if (a.pattern === confirmed && b.pattern !== confirmed) return -1;
      if (b.pattern === confirmed && a.pattern !== confirmed) return 1;
      return a.rank - b.rank;
    });
    candidates.forEach((c, i) => {
      c.rank = i + 1;
    });
    base.notes.push(
      `Skipped API recheck — last_api_verified within ${API_RECHECK_DAYS} days for pattern "${confirmed}"`
    );
    return {
      ...base,
      phase: "api_verify_v2",
      smtpMailboxProbe: false,
      smtpVerified: base.isCatchAll !== true,
      verificationProvider: provider.name,
      apiCallsUsed: 0,
      confirmedPattern: confirmed,
      confidenceCount: memory?.confidenceCount ?? base.confidenceCount,
      candidates,
      best: candidates[0] || null,
    };
  }

  const budget = await canSpendApiCredits(1);
  if (!budget.ok) {
    base.notes.push(`${budget.reason} — falling back to Phase 1 confidence`);
    await maybeAlertApiBudget(true, budget.day, budget.month);
    return {
      ...base,
      phase: "api_verify_v2",
      smtpMailboxProbe: false,
      verificationProvider: provider.name,
    };
  }
  if (budget.nearLimit) {
    await maybeAlertApiBudget(true, budget.day, budget.month);
  }

  let isCatchAll = base.isCatchAll;
  let confirmedPattern = base.confirmedPattern;
  let confidenceCount = base.confidenceCount;
  let smtpVerified = false;
  let apiCallsUsed = 0;
  let apiAttempted = false;
  const candidates = base.candidates.map((c) => ({ ...c, smtpVerified: false as boolean }));
  const toVerify = candidates.slice(0, topN);

  for (const candidate of toVerify) {
    const spend = await canSpendApiCredits(1);
    if (!spend.ok) {
      base.notes.push(spend.reason || "API budget exhausted mid-search");
      break;
    }

    apiAttempted = true;
    const verified = await provider.verifyMailbox(candidate.email);
    apiCallsUsed += verified.billed ? 1 : 0;

    await logApiVerification({
      userId: input.userId,
      domain: base.domain,
      email: candidate.email,
      status: verified.status,
      provider: verified.provider,
      costCredits: verified.billed ? 1 : 0,
      raw: verified.raw,
    });

    candidate.apiStatus = verified.status;

    if (verified.status === "catch_all") {
      isCatchAll = true;
      candidate.confidence = "Low";
      candidate.smtpVerified = false;
      candidate.reason =
        "Provider marked domain catch-all — cannot confirm this specific mailbox via SMTP";
      base.notes.push(`API: catch-all for ${candidate.email}`);
      await upsertDomainMemory(base.domain, {
        isCatchAll: true,
        touchChecked: true,
      });
      // Further verifies on same domain are low-value
      break;
    }

    if (verified.status === "valid") {
      smtpVerified = true;
      candidate.confidence = "High";
      candidate.smtpVerified = true;
      candidate.reason = `High — SMTP-verified (${verified.detail})`;
      confirmedPattern = candidate.pattern;
      const same = memory?.confirmedPattern === candidate.pattern;
      confidenceCount = same ? (memory?.confidenceCount || 0) + 1 : 1;
      await upsertDomainMemory(base.domain, {
        confirmedPattern: candidate.pattern,
        confidenceCount,
        isCatchAll: false,
        lastApiVerified: new Date(),
        touchChecked: true,
      });
      base.notes.push(`API verified deliverable: ${candidate.email}`);
      // Stop after first valid — top hit is enough
      break;
    }

    if (verified.status === "invalid") {
      candidate.confidence = "Invalid";
      candidate.smtpVerified = false;
      candidate.reason = `API rejected mailbox (${verified.detail})`;
      base.notes.push(`API invalid: ${candidate.email}`);
      continue;
    }

    // unknown — keep Phase 1 score
    candidate.reason = `${candidate.reason} · API inconclusive (${verified.detail})`;
    base.notes.push(`API unknown/timeout for ${candidate.email}: ${verified.detail}`);
  }

  // Re-rank: SMTP-valid first, then non-invalid, preserve relative order
  candidates.sort((a, b) => {
    const rank = (c: FinderCandidateResult) => {
      if (c.smtpVerified) return 0;
      if (c.confidence === "Invalid") return 3;
      if (c.confidence === "High") return 1;
      return 2;
    };
    const d = rank(a) - rank(b);
    if (d !== 0) return d;
    return b.weight - a.weight;
  });
  candidates.forEach((c, i) => {
    c.rank = i + 1;
  });

  // Soften Medium labels when not SMTP-verified
  for (const c of candidates) {
    if (c.confidence === "Medium" && !c.smtpVerified) {
      c.reason = c.reason.includes("not SMTP-verified")
        ? c.reason
        : "Medium — pattern match, not SMTP-verified";
    }
  }

  return {
    ...base,
    phase: "api_verify_v2",
    smtpMailboxProbe: apiAttempted,
    smtpVerified,
    smtpUpgradeAvailable: false,
    verificationProvider: provider.name,
    apiCallsUsed,
    isCatchAll,
    confirmedPattern,
    confidenceCount,
    candidates,
    best: candidates.find((c) => c.confidence !== "Invalid") || candidates[0] || null,
  };
}

/** Record a user-confirmed working email → strengthens domain pattern memory. */
export async function confirmDomainPattern(input: {
  domain: string;
  pattern: string;
}): Promise<{ ok: boolean; confidenceCount: number; confirmedPattern: string | null }> {
  const domain = normalizeDomain(input.domain);
  if (!domain || !isValidPatternKey(input.pattern)) {
    return { ok: false, confidenceCount: 0, confirmedPattern: null };
  }
  if (!isDatabaseConfigured()) {
    return { ok: false, confidenceCount: 0, confirmedPattern: null };
  }

  const existing = await prisma.domainPattern.findUnique({ where: { domain } });
  const same = existing?.confirmedPattern === input.pattern;
  const nextCount = same ? (existing?.confidenceCount || 0) + 1 : 1;

  await prisma.domainPattern.upsert({
    where: { domain },
    create: {
      domain,
      confirmedPattern: input.pattern,
      confidenceCount: 1,
      lastChecked: new Date(),
    },
    update: {
      confirmedPattern: input.pattern,
      confidenceCount: nextCount,
      lastChecked: new Date(),
    },
  });

  return { ok: true, confidenceCount: nextCount, confirmedPattern: input.pattern };
}

export async function getMonthlyFinderUsage(userId: string): Promise<{
  monthKey: string;
  count: number;
  limit: number;
  remaining: number;
}> {
  const limit = 50;
  const monthKey = new Date().toISOString().slice(0, 7);
  if (!isDatabaseConfigured()) {
    return { monthKey, count: 0, limit, remaining: limit };
  }
  const row = await prisma.emailFinderUsage.findUnique({
    where: { userId_monthKey: { userId, monthKey } },
  });
  const count = row?.count ?? 0;
  return { monthKey, count, limit, remaining: Math.max(0, limit - count) };
}

export async function consumeMonthlyFinderUsage(
  userId: string,
  amount: number
): Promise<{ ok: boolean; remaining: number; limit: number }> {
  const { monthKey, count, limit } = await getMonthlyFinderUsage(userId);
  if (count + amount > limit) {
    return { ok: false, remaining: Math.max(0, limit - count), limit };
  }
  if (!isDatabaseConfigured()) {
    return { ok: true, remaining: limit - amount, limit };
  }
  await prisma.emailFinderUsage.upsert({
    where: { userId_monthKey: { userId, monthKey } },
    create: { userId, monthKey, count: amount },
    update: { count: { increment: amount } },
  });
  return { ok: true, remaining: Math.max(0, limit - count - amount), limit };
}
