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
    slug: "bulkphonevalidation",
    title: "Bulk Phone Validation Guide: Clean CSV Lists Before You Dial",
    description:
      "Step by step guide to bulk phone validation with E.164 cleanup, Mobile vs Landline vs VoIP detection, and CSV export. Protect dialer ROI with AxenFlowAI Phone Validator.",
    publishedAt: "2026-07-23",
    updatedAt: "2026-07-28",
    keywords: [
      "bulk phone validation",
      "phone validator",
      "validate phone numbers CSV",
      "E.164 phone format",
      "lead list cleaning",
      "mobile vs landline",
      "international phone validator",
      "AxenFlowAI phone validator",
    ],
    readingMinutes: 9,
    category: "Lead Validation",
    coverImage: "/images/blog/phonevalidator-cover.png",
    coverAlt:
      "AxenFlowAI Phone Validator showing bulk phone validation summary for valid invalid and mobile counts",
    cta: {
      title: "Validate your phone list free",
      description:
        "Upload CSV, detect Mobile vs Landline vs VoIP, and export clean E.164 numbers on AxenFlowAI Phone Validator.",
      primary: { href: "/tools/phone-validator", label: "Open Phone Validator" },
      secondary: [
        { href: "/tools/email-validator", label: "Email Validator" },
        { href: "/tools/ai-outreach", label: "AI Outreach" },
      ],
    },
    faqs: [
      {
        question: "Is AxenFlowAI Phone Validator free to use?",
        answer:
          "Yes after you sign in. Run single checks or upload CSV and download cleaned results with status and type columns.",
      },
      {
        question: "How is this different from carrier lookup?",
        answer:
          "Bulk format validation confirms the number could exist and is structured correctly. Live carrier lookup confirms current network and is a separate paid layer for custom projects.",
      },
      {
        question: "Can it tell mobile from landline?",
        answer:
          "For many countries, yes. US and Canada numbers often show as Fixed or Mobile because the digits alone do not encode line type.",
      },
      {
        question: "What file formats can I upload?",
        answer:
          "CSV with a Phone or Phone Numbers column. Export includes status, type, country, region, and E.164 fields.",
      },
      {
        question: "How many numbers can I validate at once?",
        answer: "Up to 10,000 phone numbers per request on the bulk endpoint.",
      },
    ],
  },
  {
    slug: "bulkemailvalidation",
    title: "Bulk Email Validation Guide: Clean CSV Lists Before You Send",
    description:
      "Step by step guide to bulk email validation with syntax, DNS, MX, disposable, and role checks. Upload CSV, export valid emails, and protect deliverability with AxenFlowAI.",
    publishedAt: "2026-07-28",
    updatedAt: "2026-07-28",
    keywords: [
      "bulk email validation",
      "email validator",
      "validate emails CSV",
      "email list cleaning",
      "MX record check",
      "disposable email filter",
      "hard bounce estimate",
      "AxenFlowAI email validator",
      "email deliverability",
    ],
    readingMinutes: 9,
    category: "Lead Validation",
    coverImage: "/images/blog/emailvalidator-cover.png",
    coverAlt:
      "AxenFlowAI Email Validator showing bulk email validation summary for valid invalid and disposable emails",
    cta: {
      title: "Validate your email list free",
      description:
        "Run syntax, DNS, MX, disposable, and role checks. Upload CSV and download clean Valid emails on AxenFlowAI.",
      primary: { href: "/tools/email-validator", label: "Open Email Validator" },
      secondary: [
        { href: "/tools/phone-validator", label: "Phone Validator" },
        { href: "/tools/ai-outreach", label: "AI Outreach" },
      ],
    },
    faqs: [
      {
        question: "Is AxenFlowAI Email Validator free to use?",
        answer:
          "Yes after you sign in. Run single checks or upload CSV, Excel, or JSON and download cleaned results.",
      },
      {
        question: "Does this confirm the mailbox exists with a live SMTP check?",
        answer:
          "No. It validates format, DNS, MX, disposable domains, role flags, and a hard bounce estimate. Live mailbox probing is a separate paid layer for custom projects.",
      },
      {
        question: "What file formats are supported for bulk email validation?",
        answer:
          "CSV, Excel (XLSX), and JSON. CSV and Excel need an Email column. JSON can be an emails array or objects with email fields.",
      },
      {
        question: "Can I download only valid emails?",
        answer:
          "Yes. After validation, download Valid only as CSV, Excel, or JSON for CRM import or outreach.",
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
      "Learn how to use AxenFlowAI AI Outreach to build templates, personalize with placeholders, batch fill CSV or Excel, and export cold emails, phone scripts, and follow ups.",
    publishedAt: "2026-07-28",
    updatedAt: "2026-07-28",
    keywords: [
      "AI outreach",
      "cold email generator",
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
      "AxenFlowAI AI Outreach showing cold email phone script and follow up templates with CSV export",
    cta: {
      title: "Generate outreach templates free",
      description:
        "Chat to build a template, personalize with lead fields, then batch fill CSV or Excel on AxenFlowAI.",
      primary: { href: "/tools/ai-outreach", label: "Open AI Outreach" },
      secondary: [
        { href: "/tools/email-validator", label: "Email Validator" },
        { href: "/tools/phone-validator", label: "Phone Validator" },
      ],
    },
    faqs: [
      {
        question: "Is AxenFlowAI AI Outreach free to use?",
        answer:
          "Yes after you sign in. Build templates, fill sheets, and download CSV or Excel.",
      },
      {
        question: "What placeholders should I use in templates?",
        answer:
          "Use business name, category, city, and sender name placeholders so every row stays personalized.",
      },
      {
        question: "Can I save my own templates?",
        answer:
          "Yes. Chat to create a prompt, save it as a custom template, and reuse it on future uploads.",
      },
      {
        question: "What file types work for batch fill?",
        answer:
          "CSV and Excel. Include business name and related fields so templates can personalize correctly.",
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
