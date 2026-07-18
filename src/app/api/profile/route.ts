import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, userIdFromSession } from "@/lib/auth-guards";
import { isDatabaseConfigured, prisma } from "@/lib/db";

const patchSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  company: z.string().trim().max(120).optional().nullable(),
  country: z.string().trim().max(80).optional().nullable(),
  notifyProduct: z.boolean().optional(),
  notifyMarketing: z.boolean().optional(),
});

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const userId = userIdFromSession(session);
  if (!userId || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        country: true,
        notifyProduct: true,
        notifyMarketing: true,
        role: true,
        createdAt: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name || "",
      email: user.email,
      company: user.company || "",
      country: user.country || "",
      notifyProduct: user.notifyProduct,
      notifyMarketing: user.notifyMarketing,
      role: user.role,
      hasPassword: Boolean(user.password),
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Could not load profile." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const userId = userIdFromSession(session);
  if (!userId || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  try {
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
    }

    const data = parsed.data;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.company !== undefined ? { company: data.company || null } : {}),
        ...(data.country !== undefined ? { country: data.country || null } : {}),
        ...(data.notifyProduct !== undefined ? { notifyProduct: data.notifyProduct } : {}),
        ...(data.notifyMarketing !== undefined ? { notifyMarketing: data.notifyMarketing } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        country: true,
        notifyProduct: true,
        notifyMarketing: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        ...updated,
        name: updated.name || "",
        company: updated.company || "",
        country: updated.country || "",
      },
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const userId = userIdFromSession(session);
  if (!userId || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile DELETE error:", error);
    return NextResponse.json({ error: "Could not delete account." }, { status: 500 });
  }
}
