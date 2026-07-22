import { redirect } from "next/navigation";

/** Legacy BBB path - tool now lives under /tools/ai-outreach */
export default function LegacyBbbOutreachPage() {
  redirect("/tools/ai-outreach");
}
