/** Sensitive fields never included in public list HTML / teaser payloads. */
const CONTACT_KEYS = ["phone", "email", "website", "address", "googleMapsUrl", "owner"] as const;

type ContactFields = Partial<Record<(typeof CONTACT_KEYS)[number], string | null | undefined>>;

/** Strip phone/email/website/address/owner for list/teaser responses. */
export function redactBusinessContact<T extends ContactFields>(business: T): T {
  const next = { ...business };
  for (const key of CONTACT_KEYS) {
    if (key in next) {
      (next as ContactFields)[key] = null;
    }
  }
  return next;
}

export function redactBusinessList<T extends ContactFields>(list: T[]): T[] {
  return list.map(redactBusinessContact);
}
