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

export type FinderConfidence = "High" | "Medium" | "Low" | "Invalid";

export type FinderCandidateResult = {
  email: string;
  pattern: PatternKey;
  patternLabel: string;
  weight: number;
  confidence: FinderConfidence;
  reason: string;
  rank: number;
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
  phase: "pattern_mx_v1";
  smtpMailboxProbe: false;
  best: FinderCandidateResult | null;
  candidates: FinderCandidateResult[];
  notes: string[];
};

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
      reason: "Confirmed pattern for this domain + valid MX (Phase 1; no live mailbox SMTP probe)",
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
        "Valid MX + statistical best-guess pattern (not catch-all confirmed). Phase 1 does not SMTP-probe mailboxes.",
    };
  }

  return {
    confidence: "Low",
    reason: "Valid MX but lower-probability pattern guess (Phase 1 statistical ranking only)",
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
    return {
      domain,
      firstName,
      lastName,
      mxValid: false,
      isCatchAll: null,
      catchAllDetail: "",
      confirmedPattern: null,
      confidenceCount: 0,
      phase: "pattern_mx_v1",
      smtpMailboxProbe: false,
      best: null,
      candidates: [],
      notes: ["Enter a valid domain (e.g. company.com)"],
    };
  }
  if (!firstName && !lastName) {
    return {
      domain,
      firstName,
      lastName,
      mxValid: false,
      isCatchAll: null,
      catchAllDetail: "",
      confirmedPattern: null,
      confidenceCount: 0,
      phase: "pattern_mx_v1",
      smtpMailboxProbe: false,
      best: null,
      candidates: [],
      notes: ["Enter at least a first or last name"],
    };
  }

  const mxStatus = await checkMx(domain);
  const mxValid = mxStatus === "Valid";
  if (!mxValid) {
    notes.push("Invalid — domain cannot receive email (no MX)");
    return {
      domain,
      firstName,
      lastName,
      mxValid: false,
      isCatchAll: null,
      catchAllDetail: "Skipped — no MX",
      confirmedPattern: null,
      confidenceCount: 0,
      phase: "pattern_mx_v1",
      smtpMailboxProbe: false,
      best: null,
      candidates: [],
      notes,
    };
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
    best: candidates[0] || null,
    candidates,
    notes,
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
