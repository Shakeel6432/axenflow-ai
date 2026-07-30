"use server";

import { auth } from "@/auth";
import { saveLeads } from "@/services/saved-leads.service";

/** Save lead bookmark (auth required). */
export async function saveLeadAction(businessId: string): Promise<{
  ok: boolean;
  error?: string;
  saved?: number;
}> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { ok: false, error: "Sign in to save leads." };

  const id = String(businessId || "").trim();
  if (!id) return { ok: false, error: "Invalid lead." };

  const result = await saveLeads(userId, [id]);
  return { ok: true, saved: result.saved };
}
