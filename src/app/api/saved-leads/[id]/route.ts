import { NextResponse } from "next/server";
import { requireUser, userIdFromSession } from "@/lib/auth-guards";
import { isDatabaseConfigured } from "@/lib/db";
import { unsaveLead } from "@/services/saved-leads.service";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const userId = userIdFromSession(session);
  if (!userId || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  const { id } = await params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  try {
    const ok = await unsaveLead(userId, id);
    if (!ok) {
      return NextResponse.json({ error: "Saved lead not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsave lead error:", error);
    return NextResponse.json({ error: "Could not remove saved lead." }, { status: 500 });
  }
}
