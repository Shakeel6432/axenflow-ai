"use server";

import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { LEADS_DAILY_REVEAL_LIMIT, LEADS_REVEAL_WINDOW_MS } from "@/lib/leads-access";
import { getBusinessCardsByIds } from "@/services/search.service";
import { saveLeads } from "@/services/saved-leads.service";
import type { BusinessCard } from "@/types/leads";

export type RevealLeadResult =
  | { ok: true; lead: BusinessCard; remaining: number }
  | { ok: false; error: string; status: number };

export type RevealLeadsResult =
  | { ok: true; leads: BusinessCard[]; remaining: number }
  | { ok: false; error: string; status: number };

async function requireUserId(): Promise<
  { ok: true; userId: string } | { ok: false; error: string; status: number }
> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return { ok: false, error: "Sign in to reveal contact details.", status: 401 };
  }
  return { ok: true, userId };
}

/**
 * Reveal full contact fields for one lead after auth + daily credit check.
 * List HTML stays teaser-only; contacts only return from this action.
 */
export async function revealLeadContact(businessId: string): Promise<RevealLeadResult> {
  const authz = await requireUserId();
  if (!authz.ok) return authz;

  const limited = rateLimit(
    `reveal:user:${authz.userId}`,
    LEADS_DAILY_REVEAL_LIMIT,
    LEADS_REVEAL_WINDOW_MS
  );
  if (!limited.ok) {
    return {
      ok: false,
      error: "Daily reveal limit reached. Try again tomorrow or reveal fewer contacts.",
      status: 429,
    };
  }

  const id = String(businessId || "").trim();
  if (!id) return { ok: false, error: "Invalid lead.", status: 400 };

  const [lead] = await getBusinessCardsByIds([id]);
  if (!lead) return { ok: false, error: "Lead not found.", status: 404 };

  return { ok: true, lead, remaining: limited.remaining };
}

/** Reveal up to one page of leads (for bulk export after selection). */
export async function revealLeadContacts(businessIds: string[]): Promise<RevealLeadsResult> {
  const authz = await requireUserId();
  if (!authz.ok) return authz;

  const ids = [...new Set(businessIds.map((id) => String(id || "").trim()).filter(Boolean))].slice(
    0,
    20
  );
  if (!ids.length) return { ok: false, error: "No leads selected.", status: 400 };

  // Reserve one credit per id up front
  let remaining = 0;
  let allowed = 0;
  for (let i = 0; i < ids.length; i += 1) {
    const limited = rateLimit(
      `reveal:user:${authz.userId}`,
      LEADS_DAILY_REVEAL_LIMIT,
      LEADS_REVEAL_WINDOW_MS
    );
    if (!limited.ok) break;
    allowed += 1;
    remaining = limited.remaining;
  }

  if (!allowed) {
    return {
      ok: false,
      error: "Daily reveal limit reached. Try again tomorrow.",
      status: 429,
    };
  }

  const leads = await getBusinessCardsByIds(ids.slice(0, allowed));
  return { ok: true, leads, remaining };
}

/** Save lead bookmark (auth required). Does not return contact fields. */
export async function saveLeadAction(businessId: string): Promise<{
  ok: boolean;
  error?: string;
  saved?: number;
}> {
  const authz = await requireUserId();
  if (!authz.ok) return { ok: false, error: authz.error };

  const id = String(businessId || "").trim();
  if (!id) return { ok: false, error: "Invalid lead." };

  const result = await saveLeads(authz.userId, [id]);
  return { ok: true, saved: result.saved };
}
