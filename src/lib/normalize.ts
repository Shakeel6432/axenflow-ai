/** Normalize phone numbers for storage and duplicate checks. */
export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, "").trim();
  if (!cleaned) return null;
  return cleaned;
}

/** Normalize websites to absolute https URLs. */
export function normalizeWebsite(website?: string | null): string | null {
  if (!website) return null;
  let value = website.trim().toLowerCase();
  if (!value) return null;
  if (!/^https?:\/\//.test(value)) value = `https://${value}`;
  try {
    const url = new URL(value);
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function normalizeEmail(email?: string | null): string | null {
  if (!email) return null;
  const value = email.trim().toLowerCase();
  return value.includes("@") ? value : null;
}
