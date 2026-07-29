import type { Metadata } from "next";
import Link from "@/components/ui/AppLink";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { DESKTOP_TOOLS } from "@/lib/desktop-tools";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { DownloadToolCard } from "@/components/download/DownloadToolCard";

export const metadata: Metadata = {
  title: "Download Desktop Tools",
  robots: { index: false, follow: false },
};

export default async function DownloadPage() {
  const session = await requireUser();
  if (!session) {
    redirect(`/signin?callbackUrl=${encodeURIComponent("/download")}`);
  }

  return (
    <>
      <PageHero
        title="Desktop Scrapers"
        description="Download AxenFlow AI BBB Scraper and Yellow Pages Scraper for Windows. Always use with a VPN. Unpack, then run the app."
      />
      <Section tight>
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Link href="/tools" className="text-sm text-indigo-500 hover:text-teal-500">
              ← Back to Tools
            </Link>
            <Link href="/blog/bbbscraper" className="text-sm text-indigo-500 hover:text-teal-500">
              BBB Scraper guide
            </Link>
            <Link href="/bbb-scraper" className="text-sm text-indigo-500 hover:text-teal-500">
              BBB Scraper page
            </Link>
          </div>
          <div className="grid gap-4">
            {DESKTOP_TOOLS.map((tool) => (
              <DownloadToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
