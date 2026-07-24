import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";

/** Redirect guests to sign-in, then back to `callbackUrl` after login. */
export async function requireAuthPage(callbackUrl: string) {
  const session = await requireUser();
  if (!session) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}
