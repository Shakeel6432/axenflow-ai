/**
 * Local (no-API) phone metadata helpers:
 * - Line kind: Mobile / Landline / VoIP / ...
 * - Country display names + ISO3
 * - Likely operator from national prefix tables (not live HLR)
 */

import type { CountryCode, PhoneNumber } from "libphonenumber-js/max";
import { isNanpTollFree, lookupNanp } from "@/lib/validators/nanp-area-codes";

export type PhoneLineKind =
  | "Mobile"
  | "Landline"
  | "VoIP"
  | "Fixed or Mobile"
  | "Toll-free"
  | "Premium"
  | "Shared cost"
  | "Personal"
  | "Pager"
  | "UAN"
  | "Voicemail"
  | "Unknown";

export type PhoneLineCategory = "mobile" | "landline" | "voip" | "ambiguous" | "other" | "unknown";

/** Remove hyphens from phone display text (spaces / + kept). */
export function stripPhoneDashes(value: string): string {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ISO3: Record<string, string> = {
  US: "USA",
  CA: "CAN",
  GB: "GBR",
  PK: "PAK",
  IN: "IND",
  AE: "ARE",
  SA: "SAU",
  AU: "AUS",
  DE: "DEU",
  FR: "FRA",
  BD: "BGD",
  NG: "NGA",
  PH: "PHL",
  MX: "MEX",
  BR: "BRA",
  JP: "JPN",
  CN: "CHN",
  SG: "SGP",
  MY: "MYS",
  ID: "IDN",
  TR: "TUR",
  EG: "EGY",
  ZA: "ZAF",
  IT: "ITA",
  ES: "ESP",
  NL: "NLD",
  SE: "SWE",
  NO: "NOR",
  DK: "DNK",
  FI: "FIN",
  IE: "IRL",
  NZ: "NZL",
  KR: "KOR",
  TH: "THA",
  VN: "VNM",
  HK: "HKG",
  TW: "TWN",
  IL: "ISR",
  QA: "QAT",
  KW: "KWT",
  OM: "OMN",
  BH: "BHR",
  AF: "AFG",
  LK: "LKA",
  NP: "NPL",
};

/** Pakistan mobile: first 3 digits of national number → original operator */
const PK_MOBILE_PREFIX: Record<string, string> = {};
for (const p of [
  "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
  "320", "321", "322", "323", "324", "325", "326", "327", "328", "329",
]) {
  PK_MOBILE_PREFIX[p] = "Jazz Pakistan";
}
for (const p of [
  "310", "311", "312", "313", "314", "315", "316", "317", "318", "319",
]) {
  PK_MOBILE_PREFIX[p] = "Zong Pakistan";
}
for (const p of [
  "330", "331", "332", "333", "334", "335", "336", "337", "338", "339",
]) {
  PK_MOBILE_PREFIX[p] = "Ufone Pakistan";
}
for (const p of [
  "340", "341", "342", "343", "344", "345", "346", "347", "348", "349",
]) {
  PK_MOBILE_PREFIX[p] = "Telenor Pakistan";
}

/** India: common mobile series (simplified, 4-digit after leading 0 strip) */
const IN_MOBILE_START: { start: number; end: number; name: string }[] = [
  { start: 6000, end: 9999, name: "India mobile (series)" },
];

/** UAE mobile prefixes (national, after dropping leading 0) */
const AE_MOBILE_PREFIX: Record<string, string> = {
  "50": "Etisalat UAE",
  "52": "du UAE",
  "54": "Etisalat UAE",
  "55": "du UAE",
  "56": "du UAE",
  "58": "du UAE",
};

/** UK: 07… mobile networks (very coarse) */
const GB_MOBILE_PREFIX: Record<string, string> = {
  "740": "UK mobile",
  "741": "UK mobile",
  "742": "UK mobile",
  "743": "UK mobile",
  "744": "UK mobile",
  "745": "UK mobile",
  "746": "UK mobile",
  "747": "UK mobile",
  "748": "UK mobile",
  "749": "UK mobile",
  "750": "UK mobile",
  "770": "UK mobile",
  "771": "UK mobile",
  "772": "UK mobile",
  "773": "UK mobile",
  "774": "UK mobile",
  "775": "UK mobile",
  "776": "UK mobile",
  "777": "UK mobile",
  "778": "UK mobile",
  "779": "UK mobile",
  "780": "UK mobile",
  "781": "UK mobile",
  "782": "UK mobile",
  "783": "UK mobile",
  "784": "UK mobile",
  "785": "UK mobile",
  "786": "UK mobile",
  "787": "UK mobile",
  "788": "UK mobile",
  "789": "UK mobile",
};

export function countryDisplayName(iso2: string): string {
  if (!iso2) return "";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(iso2) || iso2;
  } catch {
    return iso2;
  }
}

export function countryIso3(iso2: string): string {
  return ISO3[iso2] || "";
}

export function classifyLineKind(
  type: ReturnType<PhoneNumber["getType"]>
): { kind: PhoneLineKind; category: PhoneLineCategory } {
  switch (type) {
    case "MOBILE":
      return { kind: "Mobile", category: "mobile" };
    case "FIXED_LINE":
      return { kind: "Landline", category: "landline" };
    case "VOIP":
      return { kind: "VoIP", category: "voip" };
    case "FIXED_LINE_OR_MOBILE":
      return { kind: "Fixed or Mobile", category: "ambiguous" };
    case "TOLL_FREE":
      return { kind: "Toll-free", category: "other" };
    case "PREMIUM_RATE":
      return { kind: "Premium", category: "other" };
    case "SHARED_COST":
      return { kind: "Shared cost", category: "other" };
    case "PERSONAL_NUMBER":
      return { kind: "Personal", category: "other" };
    case "PAGER":
      return { kind: "Pager", category: "other" };
    case "UAN":
      return { kind: "UAN", category: "other" };
    case "VOICEMAIL":
      return { kind: "Voicemail", category: "other" };
    default:
      return { kind: "Unknown", category: "unknown" };
  }
}

export type OperatorGuess = {
  name: string;
  confidence: "high" | "medium" | "low";
  note: string;
};

export type NanpExtras = {
  areaCode: string;
  region: string;
};

export function enrichNanp(
  country: string | undefined,
  nationalNumber: string
): NanpExtras | null {
  if (country !== "US" && country !== "CA") return null;
  const hit = lookupNanp(nationalNumber);
  if (!hit) return null;
  return { areaCode: hit.areaCode, region: hit.region };
}

/**
 * Estimate original operator from national number prefixes.
 * Not live HLR — number portability may mean current operator differs.
 */
export function guessOperator(
  country: CountryCode | string | undefined,
  nationalNumber: string,
  lineKind: PhoneLineKind
): OperatorGuess | null {
  if (!country || !nationalNumber) return null;
  const n = nationalNumber.replace(/\D/g, "");

  if (country === "US" || country === "CA") {
    if (isNanpTollFree(n) || lineKind === "Toll-free") {
      return {
        name: "Toll free service",
        confidence: "high",
        note: "NANP toll free numbering range",
      };
    }
    const nanp = lookupNanp(n);
    if (nanp) {
      return {
        name: `${nanp.region} local carrier`,
        confidence: "medium",
        note:
          "US/CA numbers do not encode Mobile vs Landline in the digits. Region from area code. Carrier needs live lookup after number portability.",
      };
    }
    return {
      name: "NANP local carrier",
      confidence: "low",
      note: "Valid North American number. Mobile vs landline needs carrier lookup.",
    };
  }

  if (country === "PK") {
    if (lineKind === "Mobile" || lineKind === "Fixed or Mobile") {
      const pref = n.slice(0, 3);
      const name = PK_MOBILE_PREFIX[pref];
      if (name) {
        return {
          name,
          confidence: "high",
          note: "Estimated from Pakistan mobile prefix (not live network lookup)",
        };
      }
    }
    if (lineKind === "Landline") {
      const area = n.slice(0, 2);
      const areas: Record<string, string> = {
        "21": "Karachi landline",
        "22": "Hyderabad landline",
        "41": "Faisalabad landline",
        "42": "Lahore landline",
        "51": "Islamabad / Rawalpindi landline",
        "61": "Multan landline",
        "91": "Peshawar landline",
      };
      if (areas[area]) {
        return {
          name: areas[area],
          confidence: "medium",
          note: "Estimated from Pakistan area code",
        };
      }
    }
  }

  if (country === "AE" && (lineKind === "Mobile" || lineKind === "Fixed or Mobile")) {
    const pref = n.slice(0, 2);
    const name = AE_MOBILE_PREFIX[pref];
    if (name) {
      return {
        name,
        confidence: "medium",
        note: "Estimated from UAE mobile prefix",
      };
    }
  }

  if (country === "GB" && lineKind === "Mobile") {
    const pref = n.slice(0, 3);
    if (GB_MOBILE_PREFIX[pref] || n.startsWith("7")) {
      return {
        name: "UK mobile network",
        confidence: "low",
        note: "UK mobiles are portable; specific MNO needs live lookup",
      };
    }
  }

  if (country === "IN" && (lineKind === "Mobile" || lineKind === "Fixed or Mobile")) {
    const four = Number(n.slice(0, 4));
    for (const row of IN_MOBILE_START) {
      if (four >= row.start && four <= row.end) {
        return {
          name: row.name,
          confidence: "low",
          note: "India numbers are heavily ported; operator needs live lookup",
        };
      }
    }
  }

  if (lineKind === "VoIP") {
    return {
      name: "VoIP / IP telephony",
      confidence: "medium",
      note: "Detected as VoIP from number pattern (not a mobile/landline line)",
    };
  }

  if (lineKind === "Toll-free") {
    return {
      name: "Toll free service",
      confidence: "high",
      note: "Toll free numbering range",
    };
  }

  return null;
}

/** Disposable / virtual — without HLR we only flag clear VoIP style types */
export function disposableEstimate(lineKind: PhoneLineKind): "Unknown" | "Likely" | "Unlikely" {
  if (lineKind === "VoIP") return "Likely";
  if (
    lineKind === "Mobile" ||
    lineKind === "Landline" ||
    lineKind === "Fixed or Mobile" ||
    lineKind === "Toll-free"
  ) {
    return "Unlikely";
  }
  return "Unknown";
}
