import { NextRequest, NextResponse } from "next/server";
import { requireUser, userIdFromSession } from "@/lib/auth-guards";
import { PROVIDER_PRESETS } from "@/lib/mailbox/constants";
import { disconnectMailbox } from "@/services/mailboxConnection.service";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireUser();
  const userId = userIdFromSession(session);
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  const out = await disconnectMailbox(userId, id);
  if (!out.ok) {
    return NextResponse.json({ error: out.error }, { status: 404 });
  }

  const revokeUrl =
    out.provider === "gmail"
      ? PROVIDER_PRESETS.gmail.revokeUrl
      : out.provider === "outlook"
        ? PROVIDER_PRESETS.outlook.revokeUrl
        : null;

  return NextResponse.json({
    ok: true,
    message:
      "Disconnected. We deleted your stored access. For extra security, revoke the App Password in your email account settings.",
    revokeUrl,
    email: out.email,
  });
}
