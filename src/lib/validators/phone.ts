import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
  type PhoneNumber,
} from "libphonenumber-js/max";
import type { LeadStatus } from "@/lib/bbb-validate";
import { digitsOnly, splitContactValues } from "@/lib/bbb-validate";
import {
  classifyLineKind,
  countryDisplayName,
  countryIso3,
  disposableEstimate,
  enrichNanp,
  guessOperator,
  stripPhoneDashes,
  type PhoneLineCategory,
  type PhoneLineKind,
} from "@/lib/validators/phone-meta";

export type PhoneOutputFormat = "e164" | "international" | "national" | "original";

export type PhoneCheckOptions = {
  /** Validate with libphonenumber (all countries) */
  format: boolean;
  /** ISO country used when number has no + country code */
  defaultCountry: CountryCode | "";
  /** How to write the cleaned phone in results */
  outputFormat: PhoneOutputFormat;
  keepOneOnly: boolean;
  rejectTollFree: boolean;
  rejectShort: boolean;
  rejectPremium: boolean;
  /** Mark landline invalid (keep mobile / voip / etc.) */
  rejectLandline: boolean;
  /** Mark VoIP invalid */
  rejectVoip: boolean;
};

export const DEFAULT_PHONE_OPTIONS: PhoneCheckOptions = {
  format: true,
  defaultCountry: "",
  outputFormat: "e164",
  keepOneOnly: true,
  rejectTollFree: false,
  rejectShort: true,
  rejectPremium: false,
  rejectLandline: false,
  rejectVoip: false,
};

/** Full country list for the picker (every territory libphonenumber knows) */
export const PHONE_COUNTRY_OPTIONS: { code: CountryCode | ""; label: string }[] = [
  { code: "", label: "Auto (require +country code)" },
  ...getCountries()
    .map((code) => {
      const name = countryDisplayName(code) || code;
      let dial = "";
      try {
        dial = getCountryCallingCode(code);
      } catch {
        dial = "";
      }
      return {
        code,
        label: dial ? `${name} (+${dial})` : name,
        sortName: name,
      };
    })
    .sort((a, b) => a.sortName.localeCompare(b.sortName, "en"))
    .map(({ code, label }) => ({ code, label })),
];

function formatParsed(parsed: PhoneNumber, outputFormat: PhoneOutputFormat, original: string): string {
  let out: string;
  switch (outputFormat) {
    case "e164":
      out = parsed.format("E.164");
      break;
    case "international":
      out = parsed.formatInternational();
      break;
    case "national":
      out = parsed.formatNational();
      break;
    case "original":
    default:
      out = original.trim();
  }
  return stripPhoneDashes(out);
}

/**
 * Parse a phone for any country.
 * Prefer numbers that already include a country code (+… / 00…).
 * Otherwise use defaultCountry when set.
 */
export function parseInternationalPhone(
  raw: string,
  defaultCountry: CountryCode | "" = ""
): PhoneNumber | undefined {
  const input = String(raw || "").trim();
  if (!input) return undefined;

  const normalized = input.replace(/^\s*00/, "+");

  if (normalized.startsWith("+")) {
    return parsePhoneNumberFromString(normalized);
  }

  if (defaultCountry) {
    return parsePhoneNumberFromString(normalized, defaultCountry);
  }

  const digits = digitsOnly(normalized);
  if (digits.length >= 10 && digits.length <= 15) {
    const withPlus = parsePhoneNumberFromString(`+${digits}`);
    if (withPlus?.isValid()) return withPlus;
  }

  return undefined;
}

export function isValidInternationalPhone(
  raw: string,
  defaultCountry: CountryCode | "" = ""
): boolean {
  const parsed = parseInternationalPhone(raw, defaultCountry);
  return Boolean(parsed?.isValid());
}

export function isTollFreeNumber(parsed: PhoneNumber | undefined): boolean {
  return parsed?.getType() === "TOLL_FREE";
}

export function isShortCodeNumber(parsed: PhoneNumber | undefined, raw: string): boolean {
  const digits = digitsOnly(raw);
  if (digits.length > 0 && digits.length < 7) return true;
  if (parsed?.isValid()) return false;
  return digits.length > 0 && digits.length < 8;
}

export function isPremiumNumber(parsed: PhoneNumber | undefined): boolean {
  const t = parsed?.getType();
  return t === "PREMIUM_RATE" || t === "SHARED_COST";
}

export function pickPhoneInputs(
  raw: string,
  keepOneOnly: boolean,
  defaultCountry: CountryCode | "" = ""
): string[] {
  const values = splitContactValues(raw).filter(Boolean);
  if (!values.length) return [];
  if (!keepOneOnly) return [...new Set(values)];
  for (const v of values) {
    if (isValidInternationalPhone(v, defaultCountry)) return [v];
  }
  return [values[0]];
}

export type PhoneValidationResult = {
  original: string;
  phone: string;
  e164: string;
  status: LeadStatus;
  /** Format OK per libphonenumber */
  formatValid: boolean;
  possible: boolean;
  country: string;
  countryName: string;
  countryIso3: string;
  countryCallingCode: string;
  areaCode: string;
  region: string;
  /** Human label: Mobile / Landline / VoIP / ... */
  phoneType: PhoneLineKind;
  /** mobile | landline | voip | ambiguous | other | unknown */
  lineCategory: PhoneLineCategory;
  /** Raw libphonenumber type string */
  numberType: string;
  operatorName: string;
  operatorNote: string;
  disposable: "Unknown" | "Likely" | "Unlikely";
  digits: string;
  tollFree: boolean | null;
  shortCode: boolean | null;
  collapsed: boolean;
  notes: string[];
};

function emptyResult(
  collapsed: boolean,
  notes: string[]
): PhoneValidationResult {
  return {
    original: "",
    phone: "",
    e164: "",
    status: "Unknown",
    formatValid: false,
    possible: false,
    country: "",
    countryName: "",
    countryIso3: "",
    countryCallingCode: "",
    areaCode: "",
    region: "",
    phoneType: "Unknown",
    lineCategory: "unknown",
    numberType: "",
    operatorName: "",
    operatorNote: "",
    disposable: "Unknown",
    digits: "",
    tollFree: null,
    shortCode: null,
    collapsed,
    notes,
  };
}

export function validatePhoneLocal(
  raw: string,
  options: PhoneCheckOptions
): PhoneValidationResult {
  const all = splitContactValues(raw);
  const collapsed = all.length > 1;
  const picked = pickPhoneInputs(raw, options.keepOneOnly, options.defaultCountry);
  const original = picked[0] || "";
  const notes: string[] = [];

  if (!original) {
    return emptyResult(collapsed, ["Empty phone"]);
  }

  if (collapsed && options.keepOneOnly) {
    notes.push("Multiple numbers found; kept one");
  }

  const parsed = parseInternationalPhone(original, options.defaultCountry);
  const formatValid = Boolean(parsed?.isValid());
  const possible = Boolean(parsed?.isPossible());
  let status: LeadStatus = "Unknown";

  if (options.format) {
    if (formatValid) {
      status = "Valid";
    } else if (possible) {
      status = "Invalid";
      notes.push("Possible length, but not valid for that country");
    } else if (!original.includes("+") && !options.defaultCountry && !parsed) {
      status = "Unknown";
      notes.push("Add +country code (e.g. +14155552671) or choose a default country");
    } else {
      status = "Invalid";
      notes.push("Not a valid phone for any country");
    }
  } else {
    status = digitsOnly(original) ? "Valid" : "Unknown";
  }

  const shortCode = options.rejectShort ? isShortCodeNumber(parsed, original) : null;
  if (shortCode) {
    status = "Invalid";
    notes.push("Too short / short-code");
  }

  const detectedTollFree = parsed ? isTollFreeNumber(parsed) : null;
  if (options.rejectTollFree && detectedTollFree) {
    status = "Invalid";
    notes.push("Toll-free rejected");
  } else if (detectedTollFree) {
    notes.push("Toll-free number");
  }

  if (options.rejectPremium && isPremiumNumber(parsed)) {
    status = "Invalid";
    notes.push("Premium / shared-cost rejected");
  }

  const rawType = parsed?.getType();
  const { kind: phoneType, category: lineCategory } = classifyLineKind(rawType);

  if (options.rejectLandline && lineCategory === "landline") {
    status = "Invalid";
    notes.push("Landline rejected");
  }
  if (options.rejectVoip && lineCategory === "voip") {
    status = "Invalid";
    notes.push("VoIP rejected");
  }

  const phone = stripPhoneDashes(
    parsed ? formatParsed(parsed, options.outputFormat, original) : original.trim()
  );
  const e164 = stripPhoneDashes(formatValid && parsed ? parsed.format("E.164") : "");
  const country = parsed?.country || "";
  const countryName = country ? countryDisplayName(country) : "";
  const iso3 = country ? countryIso3(country) : "";
  const countryCallingCode = parsed?.countryCallingCode ? `+${parsed.countryCallingCode}` : "";
  const numberType = rawType || "";
  const digits = parsed?.nationalNumber
    ? String(parsed.nationalNumber)
    : digitsOnly(original);

  const nanp = enrichNanp(country, digits);
  const areaCode = nanp?.areaCode || "";
  const region = nanp?.region || "";

  const op = guessOperator(country, digits, phoneType);
  const operatorName = op?.name || "";
  const operatorNote = op?.note || "";
  const disposable = disposableEstimate(phoneType);

  if (phoneType !== "Unknown") notes.push(`Type: ${phoneType}`);
  if (countryName) notes.push(`Country: ${countryName}`);
  if (region) notes.push(`Region: ${region}`);
  if (operatorName) notes.push(`Operator: ${operatorName}`);

  return {
    original,
    phone,
    e164,
    status,
    formatValid,
    possible,
    country,
    countryName,
    countryIso3: iso3,
    countryCallingCode,
    areaCode,
    region,
    phoneType,
    lineCategory,
    numberType,
    operatorName,
    operatorNote,
    disposable,
    digits,
    tollFree: detectedTollFree,
    shortCode,
    collapsed,
    notes,
  };
}
