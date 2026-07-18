/** Fields guests must not see until they sign in. */
const CONTACT_KEYS = ["phone", "email", "website", "address", "googleMapsUrl"] as const;

type ContactFields = Partial<Record<(typeof CONTACT_KEYS)[number], string | null | undefined>>;

/** Strip phone/email/website/address for unauthenticated responses. */
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
