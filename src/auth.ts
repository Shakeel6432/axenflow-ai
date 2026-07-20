import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma, isDatabaseConfigured } from "@/lib/db";

function resolveAuthSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (secret && secret !== "axenflow-build-placeholder") return secret;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to a strong random value in production.");
  }
  // Local/CI only — never use this string in live production.
  return secret || "axenflow-dev-only-secret-change-me";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: resolveAuthSecret(),
  adapter: isDatabaseConfigured() ? PrismaAdapter(prisma) : undefined,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  providers: [
    // Enable when GOOGLE_CLIENT_* (or AUTH_GOOGLE_*) are set.
    // Also set NEXT_PUBLIC_GOOGLE_CLIENT_ID so the Sign In button appears.
    ...((process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID) &&
    (process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET)
      ? [
          Google({
            clientId: (process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID)!,
            clientSecret: (process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET)!,
            // Prevent account takeover via same-email Google sign-in.
            allowDangerousEmailAccountLinking: false,
          }),
        ]
      : []),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!isDatabaseConfigured()) return null;
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        if (!user.emailVerified) {
          // Signal client to show verify/resend messaging
          throw new Error("EMAIL_NOT_VERIFIED");
        }
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user?.email && isDatabaseConfigured()) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        token.role = dbUser?.role ?? "USER";
        token.uid = dbUser?.id ?? user.id;
        if (dbUser?.name) token.name = dbUser.name;
      }
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        // Refresh role from DB on session.update()
        if (token.uid && isDatabaseConfigured()) {
          const dbUser = await prisma.user.findUnique({
            where: { id: String(token.uid) },
            select: { role: true, name: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            if (dbUser.name) token.name = dbUser.name;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id = String(token.uid || "");
        (session.user as { id?: string; role?: string }).role = String(token.role || "USER");
        if (typeof token.name === "string") session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
