/** US state abbreviations + full names for CSV address parsing. */
export const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

export type ParsedUsAddress = {
  street: string | null;
  city: string | null;
  state: string | null;
  stateCode: string | null;
  postalCode: string | null;
  country: string;
};

/**
 * Parse addresses like:
 * "3330 Cedar Bluff Rd, Centre, AL 35960-2528"
 */
export function parseUsAddress(raw?: string | null): ParsedUsAddress {
  const empty: ParsedUsAddress = {
    street: null,
    city: null,
    state: null,
    stateCode: null,
    postalCode: null,
    country: "United States",
  };
  if (!raw?.trim()) return empty;

  const address = raw.trim();
  const match = address.match(
    /^(.*?),\s*([^,]+),\s*([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)\s*$/
  );

  if (!match) {
    return { ...empty, street: address };
  }

  const stateCode = match[3].toUpperCase();
  return {
    street: match[1].trim() || null,
    city: match[2].trim() || null,
    stateCode,
    state: US_STATE_NAMES[stateCode] || stateCode,
    postalCode: match[4],
    country: "United States",
  };
}

/** First non-empty value from pipe/semicolon/comma separated list. */
export function firstContactValue(raw?: string | null): string | null {
  if (!raw?.trim()) return null;
  const parts = raw
    .split(/[|;,]/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts[0] || null;
}

/** Drop empty street segments so ", City, ST ZIP" becomes "City, ST ZIP". */
export function formatDisplayAddress(raw?: string | null): string | null {
  if (!raw?.trim()) return null;
  const cleaned = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .join(", ");
  return cleaned || null;
}
