import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, userIdFromSession } from "@/lib/auth-guards";
import { isDatabaseConfigured } from "@/lib/db";
import { listSavedLeads, saveLeads } from "@/services/saved-leads.service";

const postSchema = z.object({
  businessIds: z.array(z.string().min(1).max(64)).min(1).max(100),
});

export async function GET(req: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const userId = userIdFromSession(session);
  if (!userId || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  const page = Number(req.nextUrl.searchParams.get("page") || "1");
  const pageSize = Number(req.nextUrl.searchParams.get("pageSize") || "20");

  try {
    const data = await listSavedLeads(userId, page, pageSize);
    return NextResponse.json(data);
  } catch (error) {
    console.error("List saved leads error:", error);
    return NextResponse.json({ error: "Could not load saved leads." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const userId = userIdFromSession(session);
  if (!userId || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  try {
    const parsed = postSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid business IDs." }, { status: 400 });
    }

    const result = await saveLeads(userId, parsed.data.businessIds);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Save leads error:", error);
    return NextResponse.json({ error: "Could not save leads." }, { status: 500 });
  }
}
