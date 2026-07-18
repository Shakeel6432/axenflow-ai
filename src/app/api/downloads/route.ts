import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireUser, userIdFromSession } from "@/lib/auth-guards";

const bodySchema = z.object({
  toolName: z.string().trim().min(1).max(200),
  toolId: z.string().trim().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const userId = userIdFromSession(session);
  if (!userId || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Unable to track download." }, { status: 503 });
  }

  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid tool." }, { status: 400 });
    }

    await prisma.download.create({
      data: {
        userId,
        toolName: parsed.data.toolName,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Download track error:", error);
    return NextResponse.json({ error: "Could not record download." }, { status: 500 });
  }
}
