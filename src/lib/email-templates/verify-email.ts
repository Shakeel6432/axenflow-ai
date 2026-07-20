import { siteConfig } from "@/lib/constants";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type VerifyEmailInput = {
  name: string;
  email: string;
  verifyUrl: string;
  expiresHours: number;
  supportEmail?: string;
  logoUrl?: string;
};

export function buildVerifyEmail(input: VerifyEmailInput) {
  const support = input.supportEmail || "sales@axenflowai.com";
  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const verifyUrl = escapeHtml(input.verifyUrl);
  const brand = escapeHtml(siteConfig.name);
  const logoUrl = escapeHtml(
    input.logoUrl || `${siteConfig.url.replace(/\/$/, "")}/images/logo/new-logo.png`
  );
  const siteUrl = escapeHtml(siteConfig.url);

  const subject = `Confirm your ${siteConfig.name} account`;

  const text = [
    `Hi ${input.name},`,
    "",
    `Welcome to ${siteConfig.name}. Confirm your email address to activate your account (${input.email}).`,
    "",
    `Confirm here (expires in ${input.expiresHours} hours):`,
    input.verifyUrl,
    "",
    "Until you confirm, you will not be able to sign in.",
    "",
    "If you did not create this account, ignore this email.",
    "",
    `Need help? Contact ${support}`,
    "",
    `- ${siteConfig.name}`,
    siteConfig.url,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${brand} email confirmation</title>
</head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:Segoe UI,Arial,Helvetica,sans-serif;color:#334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2ff;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(99,102,241,0.12);">
          <tr>
            <td align="center" style="padding:18px 28px 6px;background:#ffffff;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <img src="${logoUrl}" alt="${brand}" width="140" height="38" style="display:block;width:140px;max-width:42%;height:auto;border:0;margin:0 auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 20px;background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);">
              <div style="height:3px;width:100%;border-radius:999px;background:linear-gradient(90deg,#6366f1 0%,#14b8a6 100%);"></div>
              <h1 style="margin:18px 0 6px;font-size:22px;line-height:1.3;color:#0f172a;font-weight:700;">Confirm your email</h1>
              <p style="margin:0;font-size:14px;color:#64748b;">Activate your ${brand} account to start signing in</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;">
              <p style="margin:0 0 14px;font-size:15px;color:#0f172a;">Hi ${name},</p>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#475569;">
                Thanks for signing up. Please confirm <strong style="color:#0f172a;">${email}</strong> to finish creating your account.
                This link expires in <strong style="color:#0f172a;">${input.expiresHours} hours</strong>.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 22px;">
                <tr>
                  <td align="center" style="border-radius:12px;background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);">
                    <a href="${verifyUrl}" style="display:inline-block;padding:13px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Confirm email address
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin:0 0 20px;padding:14px 16px;background:#f0fdfa;border:1px solid #99f6e4;border-left:4px solid #14b8a6;border-radius:10px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0f766e;">Security note</p>
                <ul style="margin:0;padding-left:18px;color:#334155;font-size:13px;line-height:1.55;">
                  <li>You cannot sign in until this email is confirmed.</li>
                  <li>${brand} will never ask for your password by email or chat.</li>
                  <li>If you did not create this account, ignore this message.</li>
                </ul>
              </div>

              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;word-break:break-all;">
                Button not working? Paste this link into your browser:<br />
                <a href="${verifyUrl}" style="color:#6366f1;">${verifyUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;text-align:center;">
                Need help? Contact
                <a href="mailto:${escapeHtml(support)}" style="color:#6366f1;text-decoration:none;font-weight:600;">${escapeHtml(support)}</a>
                <br />
                <a href="${siteUrl}" style="color:#14b8a6;text-decoration:none;font-weight:600;">${brand}</a>
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
