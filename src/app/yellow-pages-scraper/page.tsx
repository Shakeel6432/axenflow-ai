import type { Metadata } from "next";
import {
  Download,
  MapPin,
  Search,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { DESKTOP_TOOLS } from "@/lib/desktop-tools";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

const tool = DESKTOP_TOOLS.find((t) => t.id === "axenflowai-yellow-pages-windows") ?? DESKTOP_TOOLS[1];

export const metadata: Metadata = {
  title: "Yellow Pages Scraper | Desktop Lead Finder",
  description:
    "AxenFlow AI Yellow Pages Scraper finds US business leads by keyword and location, scrapes detail pages, and exports CSV/JSON. Windows desktop app.",
  keywords: [
    "Yellow Pages scraper",
    "Yellow Pages lead scraper",
    "business lead generator",
    "YP scraper",
    "AxenFlow AI",
  ],
  alternates: { canonical: `${siteConfig.url}/yellow-pages-scraper` },
  openGraph: {
    title: "Yellow Pages Scraper | AxenFlow AI",
    description:
      "Scrape Yellow Pages listings by keyword and location, pull detail pages, and export clean lead sheets.",
    url: `${siteConfig.url}/yellow-pages-scraper`,
    siteName: siteConfig.name,
    type: "website",
  },
};

const features = [
  {
    icon: Search,
    title: "Keyword + location search",
    body: "Search Yellow Pages by category or business keyword and city, state, or ZIP. Control max pages, delay, and backend.",
  },
  {
    icon: MapPin,
    title: "Detail page scrape",
    body: "Pull listing cards from search results, then open each business URL for phone, website, address, and more.",
  },
  {
    icon: FileSpreadsheet,
    title: "CSV & JSON export",
    body: "Auto-save results to sheets/ as CSV and JSON. Open the folder or export a copy from the desktop app.",
  },
  {
    icon: ShieldCheck,
    title: "Cloudflare-ready cookies",
    body: "Use cookies.json with cf_clearance for stable sessions. Warm-up and Playwright options when blocks appear.",
  },
];

const faqs = [
  {
    q: "What is this app?",
    a: "A Windows desktop Yellow Pages scraper from AxenFlow AI. Enter keyword + location, scrape listings (optional detail pages), and export leads.",
  },
  {
    q: "How do I install it?",
    a: "Download the ZIP from /download, unpack it, then run AxenFlowAI_YellowPages.exe (or Run.bat). Copy cookies.example.json to cookies.json and add your Cloudflare cookies if needed.",
  },
  {
    q: "Do I need a VPN?",
    a: "Yes. Always run the desktop scraper with a VPN and fresh browser cookies to reduce blocks and keep sessions stable.",
  },
];

export default function YellowPagesScraperPage() {
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
              "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(99,102,241,0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 10%, rgba(236,72,153,0.12), transparent 50%)",
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
            Yellow Pages Scraper
          </h1>
          <p className="mt-3 max-w-xl text-base sm:text-lg" style={{ color: "var(--c-text-dim)" }}>
            Keyword + location Yellow Pages leads on Windows — scrape, detail pages, export CSV/JSON.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/download" size="lg" variant="green">
              Download desktop app <Download size={16} />
            </Button>
            <Button href={tool.downloadUrl} size="lg" variant="outline">
              Direct ZIP download
            </Button>
            <Button href="/bbb-scraper" size="lg" variant="outline">
              BBB Scraper
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
            Built for Yellow Pages lead gen
          </h2>
          <p className="mt-2 max-w-2xl text-sm sm:text-base" style={{ color: "var(--c-text-dim)" }}>
            Native desktop GUI with live log, progress, Start/Stop, and AxenFlow branding — same
            download flow as our other Windows tools.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, body }) => (
              <article key={title} className="min-w-0">
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(236,72,153,0.12)", color: "#f472b6" }}
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
          <h2
            className="font-[var(--font-space)] text-2xl font-bold"
            style={{ color: "var(--c-heading)" }}
          >
            FAQ
          </h2>
          <div className="mt-6 space-y-5">
            {faqs.map((item) => (
              <div key={item.q}>
                <h3
                  className="font-[var(--font-space)] text-base font-semibold"
                  style={{ color: "var(--c-heading)" }}
                >
                  {item.q}
                </h3>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button href="/download" size="lg">
              Get the Yellow Pages app <Download size={16} />
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
