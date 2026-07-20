import { auth } from "@/auth";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export async function requireAdmin() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session?.user || !userId) return null;

  if (!isDatabaseConfigured()) {
    const role = (session.user as { role?: string }).role;
    return role === "ADMIN" ? session : null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (dbUser?.role !== "ADMIN") return null;
  return session;
}
