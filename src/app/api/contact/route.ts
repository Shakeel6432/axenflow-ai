import { NextResponse } from "next/server";

const ZEPTO_API_URL = "https://api.zeptomail.com/v1.1/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { fullName, email, phone, message, company, website, country, industry, requiredService, services, currentProblem, projectDetails, expectedGoal, budget, deadline } = body;

    if (!fullName?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.ZEPTO_FROM_EMAIL;
    const toEmail = process.env.ZEPTO_TO_EMAIL;

    if (!apiKey || !fromEmail || !toEmail) {
      console.error("Missing ZeptoMail env variables");
      return NextResponse.json({ error: "Server configuration error. Please contact us directly." }, { status: 500 });
    }

    const isDetailedForm = !!(company || requiredService || currentProblem);

    let htmlBody: string;

    if (isDetailedForm) {
      htmlBody = `
        <h2 style="color:#333;margin-bottom:20px;">New Project Inquiry</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif;">
          <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:160px;">Name</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${fullName}</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Email</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${email}</td></tr>
          ${phone ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Phone</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${phone}</td></tr>` : ""}
          ${company ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Company</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${company}</td></tr>` : ""}
          ${website ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Website</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${website}</td></tr>` : ""}
          ${country ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Country</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${country}</td></tr>` : ""}
          ${industry ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Industry</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${industry}</td></tr>` : ""}
          ${requiredService ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Required Service</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${requiredService}</td></tr>` : ""}
          ${services?.length ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Services Interested</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${services.join(", ")}</td></tr>` : ""}
          ${currentProblem ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Current Problem</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${currentProblem}</td></tr>` : ""}
          ${projectDetails ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Project Details</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${projectDetails}</td></tr>` : ""}
          ${expectedGoal ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Expected Goal</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${expectedGoal}</td></tr>` : ""}
          ${budget ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Budget</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${budget}</td></tr>` : ""}
          ${deadline ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Deadline</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${deadline}</td></tr>` : ""}
          <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Message</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${message}</td></tr>
        </table>
      `;
    } else {
      htmlBody = `
        <h2 style="color:#333;margin-bottom:20px;">New Contact Message</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif;">
          <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:120px;">Name</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${fullName}</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Email</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${email}</td></tr>
          ${phone ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Phone</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${phone}</td></tr>` : ""}
          <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Message</td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${message}</td></tr>
        </table>
      `;
    }

    const subject = isDetailedForm
      ? `New Inquiry: ${requiredService || "General"} - ${fullName}`
      : `Contact Form: ${fullName}`;

    const zeptoPayload = {
      from: { address: fromEmail, name: "AxenFlow AI Website" },
      to: [{ email_address: { address: toEmail, name: "AxenFlow AI" } }],
      reply_to: [{ address: email, name: fullName }],
      subject,
      htmlbody: htmlBody,
    };

    const zeptoRes = await fetch(ZEPTO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify(zeptoPayload),
    });

    if (!zeptoRes.ok) {
      const errData = await zeptoRes.text();
      console.error("ZeptoMail error:", zeptoRes.status, errData);
      return NextResponse.json({ error: "Failed to send email. Please try again or contact us directly." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Inquiry sent successfully" });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
