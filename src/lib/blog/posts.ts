export type BlogPostCta = {
  title: string;
  description: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string }[];
};

export type BlogFaqItem = {
  question: string;
  answer: string;
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  keywords: string[];
  readingMinutes: number;
  coverImage?: string;
  coverAlt?: string;
  category?: string;
  cta?: BlogPostCta;
  faqs?: BlogFaqItem[];
};

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "csvexcelconverter",
    title: "CSV to Excel Converter Guide: Convert, Format & Export Spreadsheets Free",
    description:
      "Step by step guide to converting CSV to Excel and Excel to CSV. Auto-format columns, handle multiple sheets, and export clean files free with AxenFlowAI.",
    publishedAt: "2026-07-30",
    updatedAt: "2026-07-30",
    keywords: [
      "csv to excel converter",
      "convert csv to excel free",
      "excel to csv converter",
      "csv to xlsx online",
      "bulk csv to excel conversion",
      "csv file won't open in excel correctly",
      "csv encoding issues excel",
      "how to convert excel to csv without losing data",
      "AxenFlowAI CSV Excel converter",
    ],
    readingMinutes: 9,
    category: "Data Tools",
    coverImage: "/images/blog/csvexcelconverter-cover.png",
    coverAlt:
      "AxenFlowAI CSV to Excel Converter showing file upload, sheet preview, and formatted spreadsheet export",
    cta: {
      title: "Convert CSV ⇄ Excel free",
      description:
        "Upload CSV or Excel, preview, auto-format, and download polished XLSX or clean CSV (100% in your browser on AxenFlowAI).",
      primary: {
        href: "/tools/csv-excel-converter",
        label: "Open CSV Excel Converter",
      },
      secondary: [
        { href: "/tools/email-validator", label: "Email Validator" },
        { href: "/tools/phone-validator", label: "Phone Validator" },
      ],
    },
    faqs: [
      {
        question: "Why does my phone number lose the leading zero when I open a CSV in Excel?",
        answer:
          "Excel treats the value as a number and drops leading zeros. Convert with Phone or ZIP forced to Text, or prefix with an apostrophe in Excel. AxenFlowAI can mark those columns as text on export.",
      },
      {
        question: "Can I convert multiple CSV files to one Excel workbook?",
        answer:
          "Yes. Upload several CSVs and keep combine-into-one-workbook enabled so each file becomes its own sheet.",
      },
      {
        question: "Does converting CSV to Excel keep my formulas?",
        answer:
          "No. CSV stores values only, not formulas. Excel to CSV exports calculated values, not formula strings.",
      },
      {
        question: "What's the maximum file size I can convert?",
        answer:
          "Up to 50MB per file. Larger files may take longer; keep the tab open during progress stages.",
      },
      {
        question: "Is this CSV to Excel converter really free?",
        answer:
          "Yes. The converter page does not require signup to convert files in the browser.",
      },
      {
        question: "Does this tool work on mobile?",
        answer:
          "Yes. The upload zone and preview table are responsive; use horizontal scroll on the preview on small screens.",
      },
      {
        question: "Is my data uploaded to a server or processed locally?",
        answer:
          "Processed locally in your browser. Nothing is uploaded to AxenFlowAI servers for conversion.",
      },
      {
        question: "What's the difference between .xls and .xlsx?",
        answer:
          ".xlsx is the modern Office Open XML format. .xls is the older binary format. The converter reads both; new Excel downloads use .xlsx.",
      },
    ],
  },
  {
    slug: "bulkphonevalidation",
    title: "Bulk Phone Validation Guide: Clean CSV Lists Before You Dial",
    description:
      "Step by step bulk phone validation guide: free single phone check (no signup), E.164 cleanup, Mobile vs Landline vs VoIP, CSV upload limits, and export on AxenFlowAI.",
    publishedAt: "2026-07-23",
    updatedAt: "2026-08-01",
    keywords: [
      "bulk phone validation",
      "phone validator",
      "validate phone numbers CSV",
      "E.164 phone format",
      "free phone number check",
      "lead list cleaning",
      "mobile vs landline",
      "international phone validator",
      "AxenFlowAI phone validator",
    ],
    readingMinutes: 9,
    category: "Lead Validation",
    coverImage: "/images/blog/phonevalidator-cover.png",
    coverAlt:
      "AxenFlowAI Phone Validator free single number check with Valid status badge and E.164 checklist",
    cta: {
      title: "Validate phones free",
      description:
        "Try a free single phone check (no signup), then upload CSV for bulk E.164 cleanup and Mobile vs Landline vs VoIP detection.",
      primary: { href: "/tools/phone-validator", label: "Open Phone Validator" },
      secondary: [
        { href: "/tools/email-validator", label: "Email Validator" },
        { href: "/tools/csv-excel-converter", label: "CSV Excel Converter" },
      ],
    },
    faqs: [
      {
        question: "Is there a free phone check without signup?",
        answer:
          "Yes. Use the single-number checker on the Phone Validator page with a country selector. Checks are rate-limited. Bulk CSV upload requires a free account.",
      },
      {
        question: "What is E.164 format and why does it matter?",
        answer:
          "E.164 is the international phone standard: plus sign, country calling code, then the national number (for example +14155552671). SMS gateways, calling APIs, and most CRMs expect this form.",
      },
      {
        question: "Can it tell mobile from landline?",
        answer:
          "For many countries, yes. US and Canada numbers often show as Fixed or Mobile because the digits alone do not encode line type without a live carrier lookup.",
      },
      {
        question: "Do you store the phone numbers I check?",
        answer:
          "Validation runs for the request and returns results to your browser. Numbers are not written into a marketing database, and we do not sell phone lists. See the Privacy Policy for general practices.",
      },
      {
        question: "How many numbers can I validate at once?",
        answer:
          "Guests get a small number of free single checks per day. After sign-in, up to 10,000 phone numbers per request (max 8MB CSV). No credit charge on this tool today.",
      },
    ],
  },
  {
    slug: "bulkemailvalidation",
    title: "Bulk Email Validation Guide: Clean CSV Lists Before You Send",
    description:
      "Step by step bulk email validation guide: free single email check, syntax DNS MX disposable role checks, CSV upload limits, and Valid-only export on AxenFlowAI.",
    publishedAt: "2026-07-28",
    updatedAt: "2026-07-31",
    keywords: [
      "bulk email validation",
      "email validator",
      "validate emails CSV",
      "email list cleaning",
      "MX record check",
      "disposable email filter",
      "hard bounce estimate",
      "free email checker",
      "AxenFlowAI email validator",
      "email deliverability",
    ],
    readingMinutes: 10,
    category: "Lead Validation",
    coverImage: "/images/blog/emailvalidator-cover.png",
    coverAlt:
      "AxenFlowAI Email Validator free single email check with Valid status badge and checklist",
    cta: {
      title: "Try the free email check, then clean your CSV",
      description:
        "No signup for a single check. Sign in for bulk CSV validation with syntax, DNS, MX, disposable, and role flags.",
      primary: { href: "/tools/email-validator", label: "Open Email Validator" },
      secondary: [
        { href: "/tools/phone-validator", label: "Phone Validator" },
        { href: "/tools/ai-outreach", label: "AI Outreach" },
      ],
    },
    faqs: [
      {
        question: "Is there a free email check without signup?",
        answer:
          "Yes. The Email Validator page includes a rate-limited free single-email check with a status badge and checklist. Bulk CSV upload requires an account.",
      },
      {
        question: "Does this confirm the mailbox exists with a live SMTP check?",
        answer:
          "No. It validates format, DNS, MX, disposable domains, role flags, and a bounce risk estimate. We do not SMTP-probe, so catch-all domains and individual inboxes are not confirmed.",
      },
      {
        question: "What's the difference between Invalid and Risky?",
        answer:
          "Invalid means syntax, domain/MX, or disposable failed. Risky on the free check badge usually means a role account or uncertain bounce risk that still looks deliverable at the domain layer.",
      },
      {
        question: "What file formats and limits apply to bulk email validation?",
        answer:
          "CSV, Excel (XLSX), and JSON. Up to 5,000 emails per request and max 8MB. CSV and Excel need an Email column.",
      },
      {
        question: "Do you store or sell the emails I upload?",
        answer:
          "Validation is request-scoped for the tool response. Lists are not saved into a marketing database, and we do not sell email lists. See the Privacy Policy for general practices.",
      },
      {
        question: "Should I validate phones too?",
        answer:
          "Yes when your sheet has phone numbers. Use Phone Validator alongside Email Validator before campaigns.",
      },
    ],
  },
  {
    slug: "aioutreach",
    title: "AI Outreach Guide: Cold Emails, Call Scripts & Follow Ups from CSV",
    description:
      "Step by step AI Outreach guide: free cold email or call script sample (no signup), chat templates, lead-field personalization, and CSV/Excel batch fill on AxenFlowAI.",
    publishedAt: "2026-07-28",
    updatedAt: "2026-08-01",
    keywords: [
      "AI outreach",
      "cold email generator",
      "free cold email generator",
      "phone script generator",
      "follow up email template",
      "CSV outreach templates",
      "sales email personalization",
      "AxenFlowAI AI Outreach",
      "batch cold email CSV",
    ],
    readingMinutes: 8,
    category: "Outreach",
    coverImage: "/images/blog/aioutreach-cover.png",
    coverAlt:
      "AxenFlowAI AI Outreach tool showing a generated personalized cold email sample for a sample lead",
    cta: {
      title: "Try a free outreach sample",
      description:
        "Generate a free cold email or call script (no signup), then sign in for chat templates and CSV/Excel batch fill.",
      primary: { href: "/tools/ai-outreach", label: "Open AI Outreach" },
      secondary: [
        { href: "/tools/email-validator", label: "Email Validator" },
        { href: "/tools/phone-validator", label: "Phone Validator" },
      ],
    },
    faqs: [
      {
        question: "Is there a free outreach sample without signup?",
        answer:
          "Yes. Use the free generator on the AI Outreach page for one personalized cold email, follow-up, or call script. Checks are rate-limited. Chat templates and CSV/Excel batch fill require a free account.",
      },
      {
        question: "Will AI outreach sound generic or get flagged as spam?",
        answer:
          "Built-in messages are personalized with lead fields, but they are still templates. Always review before sending. There is no automated spam-trigger-word scanner on generated copy today.",
      },
      {
        question: "What lead fields can I personalize with?",
        answer:
          "Company/business name, category/industry, city, and sender name. Custom templates use {{business_name}}, {{category}}, {{city}}, and {{sender_name}}. The free sample also accepts recipient name and a short offer context.",
      },
      {
        question: "Can I export results to CSV or Excel?",
        answer:
          "Yes after sign-in. Batch fill adds subject/body (or script) columns next to each lead row for download (up to 5,000 rows, max 12MB).",
      },
      {
        question: "Should I validate contacts before AI Outreach?",
        answer:
          "Yes. Run Email Validator and Phone Validator first so scripts go to usable contacts.",
      },
    ],
  },
  {
    slug: "bbbscraper",
    title: "BBB Scraper Guide: Download, Scrape US Leads & Export CSV",
    description:
      "Step by step guide to AxenFlow AI BBB Scraper for Windows. Search Better Business Bureau listings by keyword and state, export CSV/Excel, then validate and outreach.",
    publishedAt: "2026-07-28",
    updatedAt: "2026-07-28",
    keywords: [
      "BBB scraper",
      "Better Business Bureau scraper",
      "BBB lead scraper",
      "business lead scraper Windows",
      "scrape BBB listings",
      "AxenFlow AI BBB Scraper",
      "BBB CSV export",
    ],
    readingMinutes: 8,
    category: "Desktop Scrapers",
    coverImage: "/images/blog/bbbscraper-cover.png",
    coverAlt:
      "AxenFlow AI BBB Scraper keyword and state search with CSV Excel lead export",
    cta: {
      title: "Download BBB Scraper",
      description:
        "Get the Windows desktop app, scrape BBB listings with a VPN, then validate contacts on AxenFlowAI.",
      primary: { href: "/download", label: "Open Download Page" },
      secondary: [
        { href: "/bbb-scraper", label: "BBB Scraper Page" },
        { href: "/tools/email-validator", label: "Email Validator" },
      ],
    },
    faqs: [
      {
        question: "What is BBB?",
        answer:
          "The Better Business Bureau lists US businesses with profiles, categories, and contact details. The scraper uses public listing pages to build prospect lists.",
      },
      {
        question: "Do I need a VPN for BBB Scraper?",
        answer:
          "Yes. Always run the desktop scraper with a VPN to reduce blocks and keep sessions stable.",
      },
      {
        question: "Where do I download AxenFlow AI BBB Scraper?",
        answer:
          "Sign in and open the Download page, then choose AxenFlow AI BBB Scraper for Windows.",
      },
      {
        question: "What is Free vs Pro?",
        answer:
          "Free includes manual scraping with a hard limit of 100 leads until Pro. Validation and AI Outreach run on the website. Pro unlocks unlimited scraping with a license key.",
      },
      {
        question: "Should I validate leads after scraping BBB?",
        answer:
          "Yes. Run Email Validator and Phone Validator, then use AI Outreach for cold emails and call scripts.",
      },
    ],
  },
  {
    slug: "businessleaddatabase",
    title: "Business Lead Database Guide: Search, Filter & Export Leads Free",
    description:
      "Learn how to use the AxenFlowAI business lead database to search by keyword, category, and location, then export CSV, Excel, or JSON for outreach campaigns.",
    publishedAt: "2026-07-27",
    updatedAt: "2026-07-28",
    keywords: [
      "business lead database",
      "lead finder",
      "B2B lead search",
      "export business leads CSV",
      "free lead database",
      "search business leads by location",
      "AxenFlowAI Lead Finder",
      "sales lead list",
      "CRM lead export",
    ],
    readingMinutes: 10,
    category: "Lead Generation",
    coverImage: "/images/blog/leadfinder-cover.png",
    coverAlt:
      "AxenFlowAI business lead database Lead Finder showing search filters and export options",
    cta: {
      title: "Search the free business lead database",
      description:
        "Filter by keyword, category, and location. Sign in to select leads and export CSV, Excel, or JSON.",
      primary: { href: "/leads", label: "Open Lead Finder" },
      secondary: [
        { href: "/tools/phone-validator", label: "Phone Validator" },
        { href: "/tools/email-validator", label: "Email Validator" },
      ],
    },
    faqs: [
      {
        question: "Is the AxenFlowAI business lead database free?",
        answer:
          "Yes. Searching and previewing leads is free on AxenFlowAI. Create an account to unlock full results, CSV/Excel/JSON exports, and saved leads.",
      },
      {
        question: "How do I export business leads from the lead database?",
        answer:
          "Sign in, search with your filters, select the leads you want, then download CSV, Excel, or JSON from the bulk toolbar. You can also save leads to your dashboard.",
      },
      {
        question: "What filters does the Lead Finder support?",
        answer:
          "Keyword, main category, sub category, country, state, city, Has Phone, Has Email, and sort options including newest first, oldest first, A–Z, and Z–A.",
      },
      {
        question: "What columns are included when I export leads?",
        answer:
          "Exports include Business Name, Category, Owner, Phone, Email, Website, Address, City, State, and Country.",
      },
      {
        question: "Should I validate leads after exporting from the database?",
        answer:
          "Yes. Run Phone Validator and Email Validator on your export before dialing or mailing to improve connect rates and protect sender reputation.",
      },
    ],
  },
];

/** Old slugs permanently redirected to the clean SEO URLs */
export const BLOG_SLUG_REDIRECTS: Record<string, string> = {
  "bulk-phone-validation-csv-guide": "bulkphonevalidation",
  "lead-database-search-export-guide": "businessleaddatabase",
};

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

export function getAllBlogSlugs() {
  return BLOG_POSTS.map((p) => p.slug);
}

export function resolveBlogSlug(slug: string) {
  return BLOG_SLUG_REDIRECTS[slug] || slug;
}
