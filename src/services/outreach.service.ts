import {
  generateOutreach,
  type OutreachDraft,
  type OutreachInput,
  type OutreachKind,
} from "@/lib/outreach";

/** Same built-in generation used by signed-in CSV/Excel batch fill. */
export function generateOutreachSample(
  kind: OutreachKind,
  data: OutreachInput
): OutreachDraft {
  return generateOutreach(kind, data);
}
