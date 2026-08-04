export const WARMUP_EVENT_TYPES = [
  "sent",
  "delivered_inbox",
  "delivered_spam",
  "rescued",
  "opened",
  "replied",
  "flagged_important",
  "bounced",
] as const;

export type WarmupEventType = (typeof WARMUP_EVENT_TYPES)[number];

export type WarmupScoreLabel =
  | "Just Starting"
  | "Warming Up"
  | "Almost Ready"
  | "Fully Warmed";

export type WarmupScoreBreakdown = {
  rampCompletion: number;
  inboxPlacementRate: number;
  engagementConsistency: number;
  score: number;
  label: WarmupScoreLabel;
};

/**
 * Warmup Score (0–100):
 * - Ramp completion: (rampDay / totalRampDays) × 40
 * - Inbox placement (last 7d): (delivered_inbox / (delivered_inbox + delivered_spam)) × 40
 * - Engagement consistency (last 14d): (activeDays / 14) × 20
 */
export function calculateWarmupScore(input: {
  rampDay: number;
  totalRampDays: number;
  deliveredInbox7d: number;
  deliveredSpam7d: number;
  activeDays14d: number;
}): WarmupScoreBreakdown {
  const totalDays = Math.max(1, input.totalRampDays);
  const rampCompletion = Math.min(1, Math.max(0, input.rampDay / totalDays)) * 40;

  const delivered = input.deliveredInbox7d + input.deliveredSpam7d;
  const inboxPlacementRate =
    delivered === 0 ? 20 : (input.deliveredInbox7d / delivered) * 40;

  const engagementConsistency =
    (Math.min(14, Math.max(0, input.activeDays14d)) / 14) * 20;

  const score = Math.round(
    Math.min(100, Math.max(0, rampCompletion + inboxPlacementRate + engagementConsistency))
  );

  let label: WarmupScoreLabel = "Just Starting";
  if (score >= 90) label = "Fully Warmed";
  else if (score >= 61) label = "Almost Ready";
  else if (score >= 26) label = "Warming Up";

  return {
    rampCompletion: Math.round(rampCompletion),
    inboxPlacementRate: Math.round(inboxPlacementRate),
    engagementConsistency: Math.round(engagementConsistency),
    score,
    label,
  };
}

/** Default ramp: day N daily send cap (conservative). */
export function rampDailyLimit(day: number): number {
  if (day <= 3) return 3;
  if (day <= 7) return 5;
  if (day <= 14) return 10;
  if (day <= 21) return 15;
  return 25;
}

export const SPAM_FOLDER_CANDIDATES = [
  "[Gmail]/Spam",
  "Junk",
  "Spam",
  "Junk Email",
  "Junk E-mail",
] as const;
