import { siteConfig } from "@/lib/constants";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type PasswordResetEmailInput = {
  name: string;
  email: string;
  otp: string;
  resetUrl: string;
  expiresMinutes: number;
  requestedAt: string;
  requestIp?: string;
  supportEmail?: string;
  logoUrl?: string;
};

export function buildPasswordResetEmail(input: PasswordResetEmailInput) {
  const support = input.supportEmail || "sales@axenflowai.com";
  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const otp = escapeHtml(input.otp);
  const resetUrl = escapeHtml(input.resetUrl);
  const requestedAt = escapeHtml(input.requestedAt);
  const requestIp = input.requestIp ? escapeHtml(input.requestIp) : "Not available";
  const brand = escapeHtml(siteConfig.name);
  const logoUrl = escapeHtml(
    input.logoUrl || `${siteConfig.url.replace(/\/$/, "")}/images/logo/new-logo.png`
  );
  const siteUrl = escapeHtml(siteConfig.url);

  const subject = `${siteConfig.name} security code - password reset`;

  const text = [
    `Hi ${input.name},`,
    "",
    `We received a request to reset the password for your ${siteConfig.name} account (${input.email}).`,
    "",
    `Your one-time security code: ${input.otp}`,
    "",
    `This code expires in ${input.expiresMinutes} minutes and can be used only once.`,
    "",
    `Or reset securely with this link:`,
    input.resetUrl,
    "",
    "Security tips:",
    "- Never share this code or link with anyone.",
    `- ${siteConfig.name} will never ask for your password by email or chat.`,
    "- If you did not request this, ignore this email. Your password stays unchanged.",
    "- For extra safety, change your password after signing in and review recent account activity.",
    "",
    `Request time: ${input.requestedAt}`,
    `Request IP: ${input.requestIp || "Not available"}`,
    "",
    `Need help? Contact ${support}`,
    "",
    `- ${siteConfig.name} Security`,
    siteConfig.url,
  ].join("\n");

  // Colors aligned with site theme: indigo #6366f1, teal #14b8a6, light surfaces
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${brand} password reset</title>
</head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;color:#334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2ff;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(99,102,241,0.12);">
          <tr>
            <td align="center" style="padding:18px 28px 6px;background:#ffffff;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <img
                  src="${logoUrl}"
                  alt="${brand}"
                  width="140"
                  height="38"
                  style="display:block;width:140px;max-width:42%;height:auto;border:0;outline:none;margin:0 auto;"
                />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 20px;background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);">
              <div style="height:3px;width:100%;border-radius:999px;background:linear-gradient(90deg,#6366f1 0%,#14b8a6 100%);"></div>
              <h1 style="margin:18px 0 6px;font-size:22px;line-height:1.3;color:#0f172a;font-weight:700;">Password reset request</h1>
              <p style="margin:0;font-size:14px;color:#64748b;">Secure one-time code for your AxenFlow AI account</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;">
              <p style="margin:0 0 14px;font-size:15px;color:#0f172a;">Hi ${name},</p>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#475569;">
                We received a request to reset the password for <strong style="color:#0f172a;">${email}</strong>.
                Use the code below or the secure button. This request expires in <strong style="color:#0f172a;">${input.expiresMinutes} minutes</strong>.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;">
                <tr>
                  <td align="center" style="padding:22px 16px;">
                    <p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;">One-time security code</p>
                    <p style="margin:0;font-size:30px;font-weight:700;letter-spacing:2px;color:#4f46e5;">${otp}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 22px;">
                <tr>
                  <td align="center" style="border-radius:12px;background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);">
                    <a href="${resetUrl}" style="display:inline-block;padding:13px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Reset password securely
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin:0 0 20px;padding:14px 16px;background:#f0fdfa;border:1px solid #99f6e4;border-left:4px solid #14b8a6;border-radius:10px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0f766e;">Security checklist</p>
                <ul style="margin:0;padding-left:18px;color:#334155;font-size:13px;line-height:1.55;">
                  <li>Do not share this code or link with anyone.</li>
                  <li>${brand} staff will never ask for your password or this code.</li>
                  <li>If you did not request a reset, ignore this email. Nothing changes.</li>
                  <li>After resetting, sign out of other devices if anything looks unusual.</li>
                  <li>Use a unique password you do not reuse on other sites.</li>
                </ul>
              </div>

              <p style="margin:0 0 6px;font-size:12px;color:#64748b;"><strong style="color:#334155;">Request time:</strong> ${requestedAt}</p>
              <p style="margin:0 0 16px;font-size:12px;color:#64748b;"><strong style="color:#334155;">Request IP:</strong> ${requestIp}</p>

              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;word-break:break-all;">
                Button not working? Paste this link into your browser:<br />
                <a href="${resetUrl}" style="color:#6366f1;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;text-align:center;">
                Need help? Contact
                <a href="mailto:${escapeHtml(support)}" style="color:#6366f1;text-decoration:none;font-weight:600;">${escapeHtml(support)}</a>
                <br />
                <a href="${siteUrl}" style="color:#14b8a6;text-decoration:none;font-weight:600;">${brand}</a> Security Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { subject, text, html };
}
