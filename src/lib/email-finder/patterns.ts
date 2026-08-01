/**
 * Email Finder Phase 1 — candidate pattern generation + static likelihood weights.
 * Weights reflect common corporate naming conventions (not per-mailbox proof).
 */

export type PatternKey =
  | "first.last"
  | "flast"
  | "firstlast"
  | "first"
  | "f.last"
  | "first_last"
  | "f_last"
  | "last.first"
  | "last";

export type EmailPatternCandidate = {
  key: PatternKey;
  localPart: string;
  email: string;
  /** Higher = more common industry-wide for mid/large orgs */
  weight: number;
  label: string;
};

/** Ordered by prior likelihood (descending). Tunable lookup — not ad-hoc per request. */
export const PATTERN_WEIGHTS: Record<
  PatternKey,
  { weight: number; label: string; note: string }
> = {
  "first.last": {
    weight: 100,
    label: "first.last",
    note: "Most common at mid/large companies",
  },
  flast: {
    weight: 88,
    label: "flast",
    note: "Very common compact corporate pattern",
  },
  firstlast: {
    weight: 72,
    label: "firstlast",
    note: "Common when dots are avoided",
  },
  first: {
    weight: 68,
    label: "first",
    note: "Common at small companies / startups",
  },
  "f.last": {
    weight: 55,
    label: "f.last",
    note: "Initial + last name",
  },
  first_last: {
    weight: 48,
    label: "first_last",
    note: "Underscore variant",
  },
  f_last: {
    weight: 42,
    label: "f_last",
    note: "Initial + underscore + last",
  },
  "last.first": {
    weight: 36,
    label: "last.first",
    note: "Less common Western corporate style",
  },
  last: {
    weight: 28,
    label: "last",
    note: "Lowest prior; sometimes used for owners",
  },
};

export const PATTERN_KEYS_BY_WEIGHT = (
  Object.keys(PATTERN_WEIGHTS) as PatternKey[]
).sort((a, b) => PATTERN_WEIGHTS[b].weight - PATTERN_WEIGHTS[a].weight);

function stripDiacritics(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

/** Lowercase ASCII-ish token for local parts. */
export function normalizeNamePart(raw: string): string {
  return stripDiacritics(String(raw || ""))
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 64);
}

export function normalizeDomain(raw: string): string {
  let d = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/^mailto:/, "")
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:.*$/, "");
  if (d.includes("@")) d = d.split("@").pop() || d;
  if (d.startsWith("www.")) d = d.slice(4);
  return d.replace(/[^a-z0-9.-]/g, "").replace(/^\.+|\.+$/g, "");
}

function buildLocal(key: PatternKey, first: string, last: string): string | null {
  const f = first;
  const l = last;
  const fi = f.slice(0, 1);
  if (!f && !l) return null;

  switch (key) {
    case "first.last":
      return f && l ? `${f}.${l}` : null;
    case "flast":
      return fi && l ? `${fi}${l}` : null;
    case "firstlast":
      return f && l ? `${f}${l}` : null;
    case "first":
      return f || null;
    case "f.last":
      return fi && l ? `${fi}.${l}` : null;
    case "first_last":
      return f && l ? `${f}_${l}` : null;
    case "f_last":
      return fi && l ? `${fi}_${l}` : null;
    case "last.first":
      return f && l ? `${l}.${f}` : null;
    case "last":
      return l || null;
    default:
      return null;
  }
}

export function generateEmailCandidates(input: {
  firstName: string;
  lastName: string;
  domain: string;
}): EmailPatternCandidate[] {
  const first = normalizeNamePart(input.firstName);
  const last = normalizeNamePart(input.lastName);
  const domain = normalizeDomain(input.domain);
  if (!domain || !domain.includes(".")) return [];

  const out: EmailPatternCandidate[] = [];
  const seen = new Set<string>();

  for (const key of PATTERN_KEYS_BY_WEIGHT) {
    const local = buildLocal(key, first, last);
    if (!local) continue;
    const email = `${local}@${domain}`;
    if (seen.has(email)) continue;
    seen.add(email);
    const meta = PATTERN_WEIGHTS[key];
    out.push({
      key,
      localPart: local,
      email,
      weight: meta.weight,
      label: meta.label,
    });
  }

  return out;
}

export function isValidPatternKey(value: string): value is PatternKey {
  return Object.prototype.hasOwnProperty.call(PATTERN_WEIGHTS, value);
}
