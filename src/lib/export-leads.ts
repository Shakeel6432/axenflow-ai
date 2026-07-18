import type { BusinessCard } from "@/types/leads";

export type ExportLeadRow = {
  businessName: string;
  category: string;
  owner: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
};

const HEADERS = [
  "Business Name",
  "Category",
  "Owner",
  "Phone",
  "Email",
  "Website",
  "Address",
  "City",
  "State",
  "Country",
] as const;

export function businessToExportRow(b: BusinessCard): ExportLeadRow {
  return {
    businessName: b.businessName || "",
    category: b.category || "",
    owner: b.owner || "",
    phone: b.phone || "",
    email: b.email || "",
    website: b.website || "",
    address: b.address || "",
    city: b.city || "",
    state: b.state || "",
    country: b.country || "",
  };
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function leadsToCsv(leads: BusinessCard[]): string {
  const rows = leads.map(businessToExportRow);
  const lines = [
    HEADERS.join(","),
    ...rows.map((r) =>
      [
        r.businessName,
        r.category,
        r.owner,
        r.phone,
        r.email,
        r.website,
        r.address,
        r.city,
        r.state,
        r.country,
      ]
        .map(escapeCsvCell)
        .join(",")
    ),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}

export function leadsToJson(leads: BusinessCard[]): string {
  return JSON.stringify(
    leads.map((b) => ({
      id: b.id,
      slug: b.slug,
      ...businessToExportRow(b),
    })),
    null,
    2
  );
}

export async function leadsToXlsxBuffer(leads: BusinessCard[]): Promise<ArrayBuffer> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AxenFlow AI";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Leads", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Business Name", key: "businessName", width: 28 },
    { header: "Category", key: "category", width: 22 },
    { header: "Owner", key: "owner", width: 18 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Email", key: "email", width: 28 },
    { header: "Website", key: "website", width: 28 },
    { header: "Address", key: "address", width: 36 },
    { header: "City", key: "city", width: 16 },
    { header: "State", key: "state", width: 14 },
    { header: "Country", key: "country", width: 14 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8EAF6" },
  };

  for (const lead of leads) {
    sheet.addRow(businessToExportRow(lead));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportFilename(format: "csv" | "xlsx" | "json", prefix = "axenflow-leads") {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `${prefix}-${stamp}.${format}`;
}

export function copyUniqueField(leads: BusinessCard[], field: "phone" | "email"): string {
  const values = leads
    .map((l) => l[field]?.trim())
    .filter((v): v is string => Boolean(v));
  return [...new Set(values)].join("\n");
}
