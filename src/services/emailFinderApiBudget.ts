import { prisma, isDatabaseConfigured } from "@/lib/db";

function envInt(name: string, fallback: number) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function getApiBudgetCaps() {
  return {
    daily: envInt("EMAIL_FINDER_API_DAILY_CAP", 200),
    monthly: envInt("EMAIL_FINDER_API_MONTHLY_CAP", 3000),
  };
}

export async function getApiCallCounts(): Promise<{ day: number; month: number }> {
  if (!isDatabaseConfigured()) return { day: 0, month: 0 };
  const now = new Date();
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  try {
    const [day, month] = await Promise.all([
      prisma.emailFinderApiLog.count({ where: { createdAt: { gte: dayStart } } }),
      prisma.emailFinderApiLog.count({ where: { createdAt: { gte: monthStart } } }),
    ]);
    return { day, month };
  } catch {
    return { day: 0, month: 0 };
  }
}

export async function canSpendApiCredits(amount: number): Promise<{
  ok: boolean;
  reason?: string;
  day: number;
  month: number;
  caps: { daily: number; monthly: number };
  nearLimit: boolean;
}> {
  const caps = getApiBudgetCaps();
  const { day, month } = await getApiCallCounts();
  if (day + amount > caps.daily) {
    return {
      ok: false,
      reason: `Daily API verification budget reached (${caps.daily}/day)`,
      day,
      month,
      caps,
      nearLimit: true,
    };
  }
  if (month + amount > caps.monthly) {
    return {
      ok: false,
      reason: `Monthly API verification budget reached (${caps.monthly}/month)`,
      day,
      month,
      caps,
      nearLimit: true,
    };
  }
  const nearLimit =
    day + amount >= Math.floor(caps.daily * 0.8) ||
    month + amount >= Math.floor(caps.monthly * 0.8);
  return { ok: true, day, month, caps, nearLimit };
}

export async function logApiVerification(input: {
  userId?: string | null;
  domain: string;
  email: string;
  status: string;
  provider: string;
  costCredits: number;
  raw: Record<string, unknown>;
}) {
  if (!isDatabaseConfigured()) {
    console.info("[email-finder-api]", {
      provider: input.provider,
      domain: input.domain,
      email: input.email,
      status: input.status,
      costCredits: input.costCredits,
    });
    return;
  }
  try {
    await prisma.emailFinderApiLog.create({
      data: {
        userId: input.userId || null,
        domain: input.domain,
        email: input.email,
        status: input.status,
        provider: input.provider,
        costCredits: input.costCredits,
        rawJson: JSON.stringify(input.raw).slice(0, 8000),
      },
    });
  } catch (error) {
    console.error("email_finder_api_logs write failed:", error);
  }
}

/** Soft alert when approaching budget (log; optional webhook URL). */
export async function maybeAlertApiBudget(nearLimit: boolean, day: number, month: number) {
  if (!nearLimit) return;
  const caps = getApiBudgetCaps();
  const msg = `[email-finder] API budget near limit: day ${day}/${caps.daily}, month ${month}/${caps.monthly}`;
  console.warn(msg);
  const hook = process.env.EMAIL_FINDER_BUDGET_WEBHOOK_URL?.trim();
  if (!hook) return;
  try {
    await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: msg, day, month, caps }),
    });
  } catch {
    /* ignore webhook failures */
  }
}
