import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { DESKTOP_TOOLS } from "@/lib/desktop-tools";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

const tool = DESKTOP_TOOLS[0];

export const metadata: Metadata = {
  title: "BBB Scraper | Find & Validate Business Leads",
  description:
    "AxenFlow AI BBB Scraper finds US business leads by keyword and state, validates emails and phones, exports CSV/Excel, and drafts AI outreach. Free and Pro plans.",
  keywords: [
    "BBB scraper",
    "BBB lead scraper",
    "business lead generator",
    "email validation",
    "cold email leads",
    "AxenFlow AI",
  ],
  alternates: { canonical: `${siteConfig.url}/bbb-scraper` },
  openGraph: {
    title: "BBB Scraper | AxenFlow AI",
    description:
      "Scrape BBB business listings, validate contacts, export leads, and generate AI outreach scripts.",
    url: `${siteConfig.url}/bbb-scraper`,
    siteName: siteConfig.name,
    type: "website",
  },
};

const features = [
  {
    icon: Search,
    title: "Keyword + location search",
    body: "Search by category keyword across all US states or pick specific states. Pagination, progress bars, pause, resume, and stop built in.",
  },
  {
    icon: ShieldCheck,
    title: "Lead validation pipeline",
    body: "Deduplicate, validate email syntax/domain, phone format, and optional website checks. Mark leads Valid, Invalid, or Unknown before outreach.",
  },
  {
    icon: Download,
    title: "CSV & Excel export",
    body: "Export full sheets from the desktop app. Free plan hard-stops at 100 leads until Pro. Validate and AI Outreach open on the website.",
  },
  {
    icon: Sparkles,
    title: "AI outreach drafts",
    body: "Generate personalized cold emails, short phone scripts, and follow-ups from business name, category, and location.",
  },
];

const faqs = [
  {
    q: "What is BBB?",
    a: "The Better Business Bureau (BBB) lists accredited and non-accredited US businesses with profiles, categories, and contact details. Scrapers use public listing pages to build prospect lists.",
  },
  {
    q: "Is this ethical lead generation?",
    a: "Use public business contact data for legitimate B2B outreach, respect CAN-SPAM/GDPR where applicable, and always validate before sending. Do not spam or misrepresent who you are.",
  },
  {
    q: "Free vs Pro?",
    a: "Free includes manual scraping with a hard limit of 100 leads until you buy Pro. Validation and AI Outreach run on the website. Pro unlocks unlimited scraping with a license key in the desktop app.",
  },
  {
    q: "Do I need a VPN?",
    a: "Yes. Always run the desktop scraper with a VPN and fresh browser cookies to reduce blocks and keep sessions stable.",
  },
];

export default function BbbScraperPage() {
  return (
    <>
      <section
        className="relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16"
        style={{ borderBottom: "1px solid var(--c-border)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(99,102,241,0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 10%, rgba(20,184,166,0.12), transparent 50%)",
          }}
        />
        <Container className="relative">
          <p
            className="font-[var(--font-space)] text-sm font-semibold tracking-wide"
            style={{ color: "#818cf8" }}
          >
            AxenFlow AI
          </p>
          <h1
            className="mt-2 max-w-3xl font-[var(--font-space)] text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: "var(--c-heading)" }}
          >
            BBB Scraper
          </h1>
          <p className="mt-3 max-w-xl text-base sm:text-lg" style={{ color: "var(--c-text-dim)" }}>
            Turn BBB search into validated sales leads: scrape, clean, export, then outreach.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/download" size="lg" variant="green">
              Download desktop app <Download size={16} />
            </Button>
            <Button href="/bbb-scraper/validate" size="lg" variant="outline">
              Validate leads
            </Button>
            <Button href="/bbb-scraper/outreach" size="lg" variant="outline">
              AI Outreach
            </Button>
          </div>
        </Container>
      </section>

      <Section tight>
        <Container>
          <h2
            className="font-[var(--font-space)] text-2xl font-bold"
            style={{ color: "var(--c-heading)" }}
          >
            Built for production lead gen
          </h2>
          <p className="mt-2 max-w-2xl text-sm sm:text-base" style={{ color: "var(--c-text-dim)" }}>
            Core scraping plus validation, Free/Pro licensing, dashboard stats, and AI drafts,
            aligned with the AxenFlow BBB scraper roadmap.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, body }) => (
              <article key={title} className="min-w-0">
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
                >
                  <Icon size={18} />
                </div>
                <h3
                  className="font-[var(--font-space)] text-lg font-semibold"
                  style={{ color: "var(--c-heading)" }}
                >
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-muted)" }}>
                  {body}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section tight>
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2
                className="font-[var(--font-space)] text-2xl font-bold"
                style={{ color: "var(--c-heading)" }}
              >
                Free vs Pro
              </h2>
              <ul className="mt-4 space-y-3 text-sm" style={{ color: "var(--c-text-dim)" }}>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-500" />
                  Free: manual scrape, basic CSV, max 100 exported leads
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-500" />
                  Pro: unlimited exports, license key unlock inside the app
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-500" />
                  Validate emails/phones before any outreach copy is used
                </li>
              </ul>
            </div>
            <div>
              <h2
                className="font-[var(--font-space)] text-2xl font-bold"
                style={{ color: "var(--c-heading)" }}
              >
                Desktop download
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
                {tool?.description}
              </p>
              <p className="mt-2 text-sm font-medium" style={{ color: "var(--c-heading)" }}>
                Platform: {tool?.platform}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button href="/download" size="md">
                  Sign in to download
                </Button>
                <Link
                  href="/tools"
                  className="inline-flex items-center text-sm font-semibold text-indigo-500 hover:text-teal-500"
                >
                  Back to Tools
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tight>
        <Container>
          <h2
            className="font-[var(--font-space)] text-2xl font-bold"
            style={{ color: "var(--c-heading)" }}
          >
            FAQ
          </h2>
          <div className="mt-6 space-y-5">
            {faqs.map((item) => (
              <div key={item.q}>
                <h3 className="text-base font-semibold" style={{ color: "var(--c-heading)" }}>
                  {item.q}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--c-text-muted)" }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tight>
        <Container>
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
          >
            <h2
              className="font-[var(--font-space)] text-xl font-bold sm:text-2xl"
              style={{ color: "var(--c-heading)" }}
            >
              Need a custom scraper?
            </h2>
            <p className="mt-2 max-w-xl text-sm sm:text-base" style={{ color: "var(--c-text-dim)" }}>
              Hire AxenFlow AI for Google Maps, Yelp, Yellow Pages, CRM sync, or private lead APIs.
              Request custom automation and we&apos;ll scope it with you.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href="/contact" size="lg" variant="green">
                Contact us <Mail size={16} />
              </Button>
              <Button href={siteConfig.fiverrUrl} size="lg" variant="outline">
                Hire on Fiverr <Phone size={16} />
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "AxenFlow AI BBB Scraper",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Windows",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "Free tier with 100 exported leads",
            },
            provider: {
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.url,
            },
          }),
        }}
      />
    </>
  );
}
