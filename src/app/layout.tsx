import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { siteConfig } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: `${siteConfig.name} | AI Bots, Web Scraping & Workflow Automation Agency`, template: `%s | ${siteConfig.name}` },
  description: "AxenFlow AI builds custom AI bots, web scrapers, WhatsApp automation, email agents, and n8n/Make workflows. 86+ projects delivered. Get a free quote today.",
  keywords: ["AI automation agency", "WhatsApp bot development", "web scraping service", "n8n automation", "Make.com workflows", "AI email agent", "business automation", "custom AI chatbot"],
  icons: {
    icon: [
      { url: "/favicon.ico?v=11", sizes: "any" },
      { url: "/favicon.png?v=11", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=11",
    apple: "/favicon.png?v=11",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "AxenFlow AI | AI Bots, Web Scraping & Workflow Automation",
    description: "We build AI bots, scrapers, and automated workflows for businesses worldwide. 86+ projects delivered. Fast turnaround, production-ready systems.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AxenFlow AI | AI Automation Agency",
    description: "Custom AI bots, web scraping, WhatsApp automation & workflows. 86+ projects delivered worldwide.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteConfig.url },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${space.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico?v=11" sizes="any" />
        <link rel="icon" href="/favicon.png?v=11" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico?v=11" />
        <link rel="apple-touch-icon" href="/favicon.png?v=11" />
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t)}catch(e){}` }} />
      </head>
      <body className="site-bg min-h-full flex flex-col antialiased font-[var(--font-inter)]">
        <ThemeProvider>
          <div aria-hidden className="grid-bg pointer-events-none fixed inset-0 -z-10" />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
