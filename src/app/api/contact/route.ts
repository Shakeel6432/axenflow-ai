import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const required = ["fullName", "email", "company", "country", "industry", "requiredService", "currentProblem", "projectDetails", "expectedGoal"];
    for (const field of required) {
      if (!body[field]?.trim()) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Log for now — replace with email service (Resend, SendGrid, etc.) later
    console.log("=== New Contact Inquiry ===");
    console.log(JSON.stringify(body, null, 2));
    console.log("===========================");

    return NextResponse.json({ success: true, message: "Inquiry received successfully" });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
