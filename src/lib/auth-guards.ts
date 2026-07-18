import { auth } from "@/auth";
import type { Session } from "next-auth";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return session;
}

/** Returns session for any logged-in user, or null. */
export async function requireUser(): Promise<Session | null> {
  return getSessionUser();
}

export function userIdFromSession(session: Session | null | undefined): string | null {
  const id = (session?.user as { id?: string } | undefined)?.id;
  return id || null;
}
