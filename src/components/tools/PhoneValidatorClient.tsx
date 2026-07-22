"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { GlassSelect } from "@/components/ui/GlassSelect";
import {
  DEFAULT_PHONE_OPTIONS,
  PHONE_COUNTRY_OPTIONS,
  type PhoneCheckOptions,
  type PhoneOutputFormat,
} from "@/lib/validators/phone";
import { rowsToCsv } from "@/lib/bbb-validate";
import type { CountryCode } from "libphonenumber-js/max";

type Result = {
  original: string;
  phone: string;
  e164: string;
  status: string;
  formatValid: boolean;
  possible: boolean;
  country: string;
  countryName: string;
  countryIso3: string;
  countryCallingCode: string;
  areaCode: string;
  region: string;
  phoneType: string;
  lineCategory: string;
  numberType: string;
  operatorName: string;
  operatorNote: string;
  disposable: string;
  digits: string;
  tollFree: boolean | null;
  shortCode: boolean | null;
  collapsed: boolean;
  notes: string[];
};

type BoolKey = keyof Pick<
  PhoneCheckOptions,
  | "format"
  | "keepOneOnly"
  | "rejectShort"
  | "rejectTollFree"
  | "rejectPremium"
  | "rejectLandline"
  | "rejectVoip"
>;

const BOOL_OPTIONS: { key: BoolKey; label: string; help: string }[] = [
  {
    key: "format",
    label: "Format + country validation",
    help: "Validate number rules for every country (local libphonenumber)",
  },
  { key: "keepOneOnly", label: "Keep one number", help: "If cell has a|b|c, keep first valid" },
  { key: "rejectShort", label: "Reject short codes", help: "Under 7 digits" },
  { key: "rejectTollFree", label: "Reject toll free", help: "800 / freephone" },
  { key: "rejectPremium", label: "Reject premium", help: "Premium rate / shared cost" },
  { key: "rejectLandline", label: "Reject landlines", help: "Only keep mobile / other non landline" },
  { key: "rejectVoip", label: "Reject VoIP", help: "Flag IP telephony numbers invalid" },
];

const OUTPUT_OPTIONS: { value: PhoneOutputFormat; label: string }[] = [
  { value: "e164", label: "E.164 (+14155552671)" },
  { value: "international", label: "International (+1 415 555 2671)" },
  { value: "national", label: "National ((415) 555 2671)" },
  { value: "original", label: "Keep original text" },
];

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      className="grid grid-cols-[minmax(140px,40%)_1fr] gap-3 border-b px-1 py-2.5 text-sm last:border-b-0"
      style={{ borderColor: "var(--c-border)" }}
    >
      <div style={{ color: "var(--c-text-muted)" }}>{label}</div>
      <div className="font-medium" style={{ color: "var(--c-heading)" }}>
        {value || "N/A"}
      </div>
    </div>
  );
}

export function PhoneValidatorClient() {
  const [options, setOptions] = useState<PhoneCheckOptions>({ ...DEFAULT_PHONE_OPTIONS });
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  function toggle(key: BoolKey) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function run(payload: FormData | object) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/tools/phone-validator", {
        method: "POST",
        ...(payload instanceof FormData
          ? { body: payload }
          : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");
      setResults(data.results || []);
      setCounts(data.counts || null);
      setMsg(`Validated ${data.counts?.total || 0} phone(s)`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Validation failed");
      setResults([]);
      setCounts(null);
    } finally {
      setBusy(false);
    }
  }

  async function onSingle() {
    if (!phone.trim()) {
      setMsg("Enter a phone number");
      return;
    }
    await run({ phone: phone.trim(), options });
  }

  async function onFile(file: File | null) {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("options", JSON.stringify(options));
    await run(form);
  }

  function download() {
    if (!results.length) return;
    const rows = results.map((r) => ({
      Original: r.original,
      Phone: r.phone,
      E164: r.e164 || "",
      Status: r.status,
      "Format Valid": String(!!r.formatValid),
      "Phone Type": r.phoneType || "",
      "Line Category": r.lineCategory || "",
      Country: r.countryName || r.country || "",
      "Country ISO": r.country || "",
      "Country ISO3": r.countryIso3 || "",
      "Country Prefix": r.countryCallingCode || "",
      "Area Code": r.areaCode || "",
      Region: r.region || "",
      Operator: r.operatorName || "",
      "Operator Note": r.operatorNote || "",
      Disposable: r.disposable || "",
      Digits: r.digits,
      Notes: (r.notes || []).join("; "),
    }));
    const blob = new Blob(["\uFEFF" + rowsToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "phone-validated.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const preview = results.slice(0, 8);
  const focus = results.length === 1 ? results[0] : null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {busy && (
        <div
          className="fixed inset-0 z-50 grid place-items-center"
          style={{ background: "rgba(5,5,9,0.72)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="rounded-2xl px-8 py-6 text-center"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-card, #12101c)" }}
          >
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
            <p className="font-semibold" style={{ color: "var(--c-heading)" }}>
              Validating phones
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
              Format, type (mobile / landline / VoIP), country, operator...
            </p>
          </div>
        </div>
      )}

      <section className="rounded-2xl p-5" style={{ border: "1px solid var(--c-border)" }}>
        <h2 className="text-base font-semibold" style={{ color: "var(--c-heading)" }}>
          Checks to run
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--c-text-dim)" }}>
          Built locally (no third-party API). Detects Mobile vs Landline vs VoIP, country, and
          likely operator from number prefixes where known.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {BOOL_OPTIONS.map((opt) => (
            <label key={opt.key} className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={!!options[opt.key]}
                onChange={() => toggle(opt.key)}
              />
              <span>
                <span className="font-medium" style={{ color: "var(--c-heading)" }}>
                  {opt.label}
                </span>
                <span className="mt-0.5 block" style={{ color: "var(--c-text-muted)" }}>
                  {opt.help}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
              Default country (for numbers without +)
            </span>
            <GlassSelect
              aria-label="Default country"
              searchable
              value={options.defaultCountry}
              onChange={(v) =>
                setOptions((prev) => ({
                  ...prev,
                  defaultCountry: v as CountryCode | "",
                }))
              }
              options={PHONE_COUNTRY_OPTIONS.map((c) => ({
                value: c.code,
                label: c.label,
              }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium" style={{ color: "var(--c-heading)" }}>
              Output format
            </span>
            <GlassSelect
              aria-label="Output format"
              value={options.outputFormat}
              onChange={(v) =>
                setOptions((prev) => ({
                  ...prev,
                  outputFormat: v as PhoneOutputFormat,
                }))
              }
              options={OUTPUT_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl p-5" style={{ border: "1px solid var(--c-border)" }}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--c-heading)" }}>
            Single phone
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+14155552671 | +442079460958 | +971501234567"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              border: "1px solid var(--c-border)",
              background: "var(--c-hover-bg)",
              color: "var(--c-heading)",
            }}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="green" onClick={() => void onSingle()}>
            Validate phone
          </Button>
          <label
            className="inline-flex cursor-pointer items-center rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
          >
            Upload CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                void onFile(e.target.files?.[0] || null);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>
          Prefer +country code. Example: +14155552671 → Fixed or Mobile, United States.
        </p>
      </section>

      {msg && (
        <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>
          {msg}
        </p>
      )}

      {counts && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[
            ["Total", counts.total],
            ["Valid", counts.valid],
            ["Invalid", counts.invalid],
            ["Mobile", counts.mobile],
            ["Landline", counts.landline],
            ["VoIP", counts.voip],
            ["Fixed/Mobile", counts.fixedOrMobile],
            ["Other", counts.typeUnknown],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-xl p-3"
              style={{ border: "1px solid var(--c-border)" }}
            >
              <div
                className="text-xs uppercase tracking-wide"
                style={{ color: "var(--c-text-muted)" }}
              >
                {label}
              </div>
              <div className="mt-1 text-xl font-bold" style={{ color: "var(--c-heading)" }}>
                {value ?? 0}
              </div>
            </div>
          ))}
        </div>
      )}

      {focus && (
        <section className="overflow-hidden rounded-2xl" style={{ border: "1px solid var(--c-border)" }}>
          <div
            className="px-4 py-3 text-sm font-semibold"
            style={{
              background:
                focus.formatValid && focus.status === "Valid"
                  ? "rgba(20,184,166,0.15)"
                  : "rgba(248,113,113,0.12)",
              color:
                focus.formatValid && focus.status === "Valid" ? "#14b8a6" : "#f87171",
            }}
          >
            {focus.formatValid && focus.status === "Valid"
              ? "Number format validated. Type and country detected locally."
              : "Number could not be fully verified from format rules."}
          </div>
          <div className="p-4">
            <DetailRow label="Phone Number" value={focus.e164 || focus.phone} />
            <DetailRow
              label="Status"
              value={
                <span
                  style={{
                    color:
                      focus.status === "Valid"
                        ? "#14b8a6"
                        : focus.status === "Invalid"
                          ? "#f87171"
                          : "inherit",
                  }}
                >
                  {focus.status}
                  {focus.formatValid ? " (format OK)" : ""}
                </span>
              }
            />
            <DetailRow label="Phone Type" value={focus.phoneType} />
            <DetailRow
              label="Line category"
              value={
                focus.lineCategory === "mobile"
                  ? "Mobile phone"
                  : focus.lineCategory === "landline"
                    ? "Landline"
                    : focus.lineCategory === "voip"
                      ? "VoIP"
                      : focus.lineCategory === "ambiguous"
                        ? "Could be landline or mobile (common for US/CA)"
                        : focus.phoneType || "Unknown"
              }
            />
            <DetailRow label="Disposable number?" value={focus.disposable} />
            <DetailRow label="Operator name" value={focus.operatorName || "Unknown"} />
            <DetailRow
              label="Operator note"
              value={focus.operatorNote || "No prefix match (or needs live HLR for ported numbers)"}
            />
            <DetailRow label="Area code" value={focus.areaCode} />
            <DetailRow label="Region" value={focus.region} />
            <DetailRow label="Country prefix" value={focus.countryCallingCode} />
            <DetailRow label="Country name" value={focus.countryName} />
            <DetailRow label="Country ISO" value={focus.country} />
            <DetailRow label="Country ISO3" value={focus.countryIso3} />
            <DetailRow label="National digits" value={focus.digits} />
          </div>
          <p className="px-4 pb-4 text-xs" style={{ color: "var(--c-text-muted)" }}>
            US/CA numbers usually show as Fixed or Mobile because the digits do not encode line
            type. Region comes from the area code. Live carrier / porting needs an HLR API (not
            used here).
          </p>
        </section>
      )}

      {results.length > 0 && (
        <>
          <Button type="button" variant="outline" onClick={download}>
            Download results CSV
          </Button>
          <div
            className="overflow-x-auto rounded-2xl"
            style={{ border: "1px solid var(--c-border)" }}
          >
            <table className="min-w-full text-left text-sm">
              <thead style={{ background: "var(--c-hover-bg)" }}>
                <tr>
                  {["Phone", "Type", "Country", "Operator", "Status"].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-3 py-2 font-semibold"
                      style={{ color: "var(--c-heading)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={`${r.phone}-${i}`} style={{ borderTop: "1px solid var(--c-border)" }}>
                    <td
                      className="whitespace-nowrap px-3 py-2"
                      style={{ color: "var(--c-heading)" }}
                    >
                      {r.e164 || r.phone || "N/A"}
                    </td>
                    <td className="px-3 py-2 font-medium">{r.phoneType || "N/A"}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {r.countryName
                        ? `${r.countryName}${r.countryCallingCode ? ` (${r.countryCallingCode})` : ""}${r.region ? ` · ${r.region}` : ""}`
                        : "N/A"}
                    </td>
                    <td
                      className="max-w-[160px] truncate px-3 py-2"
                      style={{ color: "var(--c-text-dim)" }}
                    >
                      {r.operatorName || "N/A"}
                    </td>
                    <td
                      className="px-3 py-2 font-medium"
                      style={{
                        color:
                          r.status === "Valid"
                            ? "#14b8a6"
                            : r.status === "Invalid"
                              ? "#f87171"
                              : "var(--c-heading)",
                      }}
                    >
                      {r.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length > preview.length && (
              <p className="px-3 py-2 text-xs" style={{ color: "var(--c-text-muted)" }}>
                Showing first {preview.length} of {results.length}. Download CSV for full results.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
