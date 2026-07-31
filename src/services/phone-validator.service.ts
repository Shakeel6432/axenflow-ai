import {
  DEFAULT_PHONE_OPTIONS,
  validatePhoneLocal,
  type PhoneCheckOptions,
  type PhoneValidationResult,
} from "@/lib/validators/phone";

/** Shared phone validation used by bulk API and free public check. */
export function validateOnePhone(
  raw: string,
  options: PhoneCheckOptions = DEFAULT_PHONE_OPTIONS
): PhoneValidationResult {
  return validatePhoneLocal(raw, { ...DEFAULT_PHONE_OPTIONS, ...options });
}

export type PhoneDisplayBadge = "Valid" | "Invalid" | "Unknown";

export function phoneDisplayBadge(result: PhoneValidationResult): PhoneDisplayBadge {
  if (result.status === "Valid") return "Valid";
  if (result.status === "Invalid") return "Invalid";
  return "Unknown";
}
