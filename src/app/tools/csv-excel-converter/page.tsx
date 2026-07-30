import type { Metadata } from "next";
import Link from "@/components/ui/AppLink";
import { CheckCircle2, Lock, Layers, Sparkles, Zap } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ToolHubLinks } from "@/components/tools/ToolHubLinks";
import { CsvExcelConverterClient } from "@/components/tools/csv-excel/CsvExcelConverterClient";

export const metadata: Metadata = {
  title: "CSV Excel Converter | Convert CSV to XLSX Free",
  description:
    "Convert CSV to Excel and Excel to CSV in your browser. Auto-detect delimiter and encoding, multi-sheet export, styled headers, and no file uploads. Free AxenFlowAI tool.",
  keywords: [
    "csv to excel converter",
    "excel to csv",
    "convert csv to xlsx",
    "csv to spreadsheet",
    "online csv converter no upload",
  ],
  alternates: { canonical: `${siteConfig.url}/tools/csv-excel-converter` },
};

const why = [
  {
    icon: Lock,
    title: "Private by design",
    text: "Files never leave your device. Ideal for lead lists and client data.",
  },
  {
    icon: Zap,
    title: "No signup required",
    text: "Open the tool and convert immediately — free and unlimited for normal use.",
  },
  {
    icon: Layers,
    title: "Multi-file & multi-sheet",
    text: "Combine CSVs into one workbook or export selected Excel sheets to CSV/ZIP.",
  },
  {
    icon: Sparkles,
    title: "Excel that looks finished",
    text: "Frozen headers, filters, typed columns, and banded rows — not a bare dump.",
  },
] as const;

const faqs = [
  {
    q: "How do I convert CSV to Excel without losing data?",
    a: "Upload your CSV, check the live preview, force important columns (like phone or ZIP) to Text so leading zeros stay intact, then convert. Encoding and delimiter are auto-detected, with manual overrides if needed.",
  },
  {
    q: "Does this work with large files?",
    a: "Yes — files up to 50MB are supported. Very large lists may take longer; keep the tab open while the progress stages run. Everything stays in your browser.",
  },
  {
    q: "Is my data safe / does it get uploaded?",
    a: "No uploads. Parsing and conversion run entirely client-side. We do not receive your spreadsheet contents on our servers.",
  },
  {
    q: "Can I convert multiple sheets at once?",
    a: "Yes. For Excel → CSV, pick the sheets you want with checkboxes. Each sheet becomes its own CSV, packaged in a ZIP when you export more than one.",
  },
  {
    q: "What formats are supported?",
    a: "Input: .csv, .tsv, .xlsx, .xls. Output: .xlsx for CSV→Excel, and .csv/.tsv (or a ZIP) for Excel→CSV.",
  },
] as const;

export default function CsvExcelConverterPage() {
  return (
    <>
      <PageHero
        title="CSV ⇄ Excel Converter"
        description="Premium browser-only converter: auto-detect delimiter & encoding, multi-sheet Excel export, styled XLSX output, and zero uploads."
      />
      <Section tight>
        <Container>
          <ToolHubLinks current="/tools/csv-excel-converter" />
          <p className="mb-6 text-sm" style={{ color: "var(--c-text-muted)" }}>
            Pair with{" "}
            <Link href="/tools/email-validator" className="text-indigo-500 hover:text-teal-500">
              Email Validator
            </Link>{" "}
            or{" "}
            <Link href="/tools/phone-validator" className="text-indigo-500 hover:text-teal-500">
              Phone Validator
            </Link>{" "}
            after you clean and convert lead files.
          </p>

          <CsvExcelConverterClient />

          <div className="mt-14">
            <h2
              className="font-[var(--font-space)] mb-4 text-xl font-bold sm:text-2xl"
              style={{ color: "var(--c-heading)" }}
            >
              Why use this tool
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {why.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="glass-card rounded-2xl p-5"
                  style={{ border: "1px solid var(--c-border)" }}
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--c-heading)" }}>
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
            <ul className="mt-5 space-y-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
              {[
                "Free · no account wall for conversion",
                "Client-side only · nothing uploaded",
                "Handles multiple sheets and batch files",
                "Auto-formats Excel columns for readability",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14">
            <h2
              className="font-[var(--font-space)] mb-4 text-xl font-bold sm:text-2xl"
              style={{ color: "var(--c-heading)" }}
            >
              FAQ
            </h2>
            <div className="space-y-4">
              {faqs.map((item) => (
                <details
                  key={item.q}
                  className="glass-card group rounded-2xl px-5 py-4"
                  style={{ border: "1px solid var(--c-border)" }}
                >
                  <summary
                    className="cursor-pointer list-none text-sm font-semibold marker:content-none"
                    style={{ color: "var(--c-heading)" }}
                  >
                    {item.q}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
