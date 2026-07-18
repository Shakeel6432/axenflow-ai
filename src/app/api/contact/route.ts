import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { isSmtpConfigured, sendContactEmail, type MailAttachment } from "@/lib/smtp";

export const runtime = "nodejs";

function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim();
  return req.headers.get("x-real-ip")?.trim() || undefined;
}

const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = new Set([".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".zip"]);
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
]);

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeFilename(name: string) {
  const base = name.replace(/[/\\?%*:|"<>]/g, "_").replace(/\s+/g, " ").trim();
  return base.slice(0, 120) || "attachment";
}

function getExtension(filename: string) {
  const i = filename.lastIndexOf(".");
  return i < 0 ? "" : filename.slice(i).toLowerCase();
}

function isAllowedFile(file: File) {
  const ext = getExtension(file.name);
  if (!ALLOWED_EXT.has(ext)) return false;
  const mime = (file.type || "").toLowerCase();
  if (!mime) return true;
  if (mime.startsWith("text/html") || mime.includes("javascript")) return false;
  if (mime === "application/octet-stream") return true;
  return ALLOWED_MIME.has(mime);
}

function field(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v : "";
}

function buildBodies(data: {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
  attachmentNames: string[];
  extra?: Record<string, string>;
}) {
  const rows: [string, string][] = [
    ["Name", data.fullName],
    ["Email", data.email],
    ["Phone", data.phone || "—"],
    ["Message", data.message],
    ["Submitted", data.submittedAt],
  ];
  if (data.attachmentNames.length) {
    rows.push(["Attachments", data.attachmentNames.join(", ")]);
  }
  if (data.extra) {
    for (const [k, v] of Object.entries(data.extra)) {
      if (v?.trim()) rows.push([k, v]);
    }
  }

  const html = `
    <h2 style="color:#111;margin:0 0 16px;font-family:sans-serif;">New Contact Message</h2>
    <table style="border-collapse:collapse;width:100%;max-width:640px;font-family:sans-serif;font-size:14px;">
      ${rows
        .map(
          ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:140px;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0;white-space:pre-wrap;">${escapeHtml(value)}</td>
        </tr>`
        )
        .join("")}
    </table>
  `;
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  return { html, text };
}

async function parseAttachments(form: FormData): Promise<{ ok: true; files: MailAttachment[] } | { ok: false; error: string }> {
  const collected = [
    ...form.getAll("attachments"),
    ...form.getAll("attachment"),
  ].filter((x): x is File => typeof File !== "undefined" && x instanceof File && x.size > 0);

  if (collected.length > MAX_FILES) {
    return { ok: false, error: `Maximum ${MAX_FILES} files allowed.` };
  }

  const out: MailAttachment[] = [];
  for (const file of collected) {
    if (file.size > MAX_FILE_BYTES) {
      return { ok: false, error: `Each file must be under 5MB (${file.name} is too large).` };
    }
    if (!isAllowedFile(file)) {
      return { ok: false, error: `Unsupported file type: ${file.name}. Allowed: PDF, DOC, DOCX, PNG, JPG, ZIP.` };
    }
    out.push({
      filename: sanitizeFilename(file.name),
      content: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || undefined,
    });
  }
  return { ok: true, files: out };
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req) || "anonymous";
    const limited = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
    }

    if (!isSmtpConfigured()) {
      console.error("SMTP env missing: SMTP_HOST, SMTP_USER, SMTP_PASS, CONTACT_TO");
      return NextResponse.json({ error: "Email is not configured on the server." }, { status: 500 });
    }

    const contentType = req.headers.get("content-type") || "";
    let fullName = "";
    let email = "";
    let phone = "";
    let message = "";
    let attachments: MailAttachment[] = [];
    const extra: Record<string, string> = {};

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      // Honeypot for contact page (hidden "website" field)
      if (field(form, "website").trim() || field(form, "company_url").trim()) {
        return NextResponse.json({ success: true });
      }

      fullName = field(form, "fullName").trim();
      email = field(form, "email").trim();
      phone = field(form, "phone").trim();
      message = field(form, "message").trim();

      const parsed = await parseAttachments(form);
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      attachments = parsed.files;
    } else {
      const body = (await req.json()) as Record<string, unknown>;

      // JSON honeypot only (do not treat real "website" inquiry field as spam)
      if (String(body.company_url || "").trim()) {
        return NextResponse.json({ success: true });
      }

      fullName = String(body.fullName || "").trim();
      email = String(body.email || "").trim();
      phone = String(body.phone || "").trim();
      message = String(body.message || "").trim();

      const maybe = [
        ["Company", body.company],
        ["Website", body.website],
        ["Country", body.country],
        ["Industry", body.industry],
        ["Required Service", body.requiredService],
        ["Current Problem", body.currentProblem],
        ["Project Details", body.projectDetails],
        ["Expected Goal", body.expectedGoal],
        ["Budget", body.budget],
        ["Deadline", body.deadline],
      ] as const;

      for (const [label, value] of maybe) {
        if (typeof value === "string" && value.trim()) extra[label] = value.trim();
      }
      if (Array.isArray(body.services) && body.services.length) {
        extra.Services = body.services.map(String).join(", ");
      }
    }

    if (!fullName || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const submittedAt = new Date().toISOString();
    const { html, text } = buildBodies({
      fullName,
      email,
      phone,
      message,
      submittedAt,
      attachmentNames: attachments.map((a) => a.filename),
      extra: Object.keys(extra).length ? extra : undefined,
    });

    await sendContactEmail({
      subject: `New Contact — ${fullName}`.slice(0, 200),
      html,
      text,
      replyTo: email,
      replyToName: fullName,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    const message =
      error instanceof Error && error.message.includes("SMTP login failed")
        ? error.message
        : "Failed to send message. Please try again or email us directly.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
