import Link from "@/components/ui/AppLink";
import { BlogFigure } from "@/components/blog/BlogFigure";

export function BbbScraperGuideContent() {
  return (
    <>
      <p>
        Sales teams need fresh local businesses, not stale purchased lists. The{" "}
        <strong>BBB Scraper</strong> from AxenFlow AI turns Better Business Bureau search into
        exportable lead sheets you can validate and use for outreach.
      </p>
      <p>
        This guide covers download and setup, keyword + state search, CSV/Excel export, and how to
        connect scraped leads to website tools:{" "}
        <Link href="/tools/email-validator" className="text-indigo-400 hover:text-teal-400">
          Email Validator
        </Link>
        ,{" "}
        <Link href="/tools/phone-validator" className="text-indigo-400 hover:text-teal-400">
          Phone Validator
        </Link>
        , and{" "}
        <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
          AI Outreach
        </Link>
        . Product overview also lives on the{" "}
        <Link href="/bbb-scraper" className="text-indigo-400 hover:text-teal-400">
          BBB Scraper page
        </Link>
        .
      </p>

      <h2 className="blog-h2">What the BBB Scraper does</h2>
      <ul className="blog-ul">
        <li>Search BBB listings by keyword and US state</li>
        <li>Collect business names and contact fields from public profiles</li>
        <li>Pause, resume, and stop long scrapes with progress feedback</li>
        <li>Export leads to CSV or Excel from the Windows desktop app</li>
      </ul>
      <p>
        <strong>Pro tip:</strong> Always run the desktop app with a VPN and keep browser cookies
        fresh to reduce blocks.
      </p>

      <BlogFigure
        src="/images/blog/bbbscraper-cover.png"
        alt="AxenFlow AI BBB Scraper keyword and state search with CSV Excel export"
        caption="Keyword + state targeting, then export BBB leads for validation and outreach."
      />

      <h2 className="blog-h2">Download and install on Windows</h2>
      <ol className="blog-ol">
        <li>
          Sign in and open{" "}
          <Link href="/download" className="text-indigo-400 hover:text-teal-400">
            Desktop Scrapers
          </Link>
          .
        </li>
        <li>Download <strong>AxenFlow AI BBB Scraper</strong> for Windows.</li>
        <li>Unpack the RAR package.</li>
        <li>Connect a VPN, then run the app.</li>
        <li>Enter your search keyword and target states.</li>
      </ol>

      <BlogFigure
        src="/images/blog/bbbscraper-workflow.png"
        alt="BBB Scraper workflow download scrape then validate and outreach"
        caption="Download the Windows app, scrape BBB listings, then clean contacts on the website."
      />

      <h2 className="blog-h2">Search controls that matter</h2>
      <p>Use the desktop controls to keep runs stable:</p>
      <ul className="blog-ul">
        <li>
          <strong>Keyword:</strong> Niche or category terms such as plumbers or roofers
        </li>
        <li>
          <strong>States:</strong> One or more US states for geo focus
        </li>
        <li>
          <strong>Pause / Resume:</strong> Control long jobs without losing progress
        </li>
        <li>
          <strong>Stop:</strong> Cancel safely when you have enough leads
        </li>
      </ul>

      <BlogFigure
        src="/images/blog/bbbscraper-search.png"
        alt="BBB Scraper search controls for keyword states pause resume and progress"
        caption="Start with one niche and a few states, then expand after you confirm export quality."
      />

      <h2 className="blog-h2">Free vs Pro</h2>
      <p>
        Free includes manual scraping with a hard limit of 100 leads until you unlock Pro. Validation
        and AI Outreach run on the website. Pro unlocks unlimited scraping with a license key in the
        desktop app.
      </p>

      <h2 className="blog-h2">Validate BBB leads before you send</h2>
      <p>
        Scraped contact fields still need hygiene. After export, pipe the sheet through website
        validators:
      </p>
      <ol className="blog-ol">
        <li>
          Clean emails with{" "}
          <Link href="/blog/bulkemailvalidation" className="text-indigo-400 hover:text-teal-400">
            bulk email validation
          </Link>
          .
        </li>
        <li>
          Normalize phones with{" "}
          <Link href="/blog/bulkphonevalidation" className="text-indigo-400 hover:text-teal-400">
            bulk phone validation
          </Link>
          .
        </li>
        <li>
          Generate scripts with the{" "}
          <Link href="/blog/aioutreach" className="text-indigo-400 hover:text-teal-400">
            AI Outreach guide
          </Link>
          .
        </li>
      </ol>

      <BlogFigure
        src="/images/blog/bbbscraper-validate.png"
        alt="Validate BBB scraper leads with Email Validator Phone Validator and AI Outreach"
        caption="Scrape on desktop, then validate and draft outreach on AxenFlowAI tools."
      />

      <h2 className="blog-h2">Recommended BBB lead workflow</h2>
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--c-border)" }}>
        <table className="min-w-full text-left text-sm">
          <thead style={{ background: "var(--c-hover-bg)" }}>
            <tr>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Step
              </th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Where
              </th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Outcome
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Download BBB Scraper", "Download page", "Windows app installed"],
              ["Scrape keyword + state", "Desktop app", "CSV / Excel lead sheet"],
              ["Validate email + phone", "Website tools", "Callable and mailable rows"],
              ["Generate outreach", "AI Outreach", "Cold email and call scripts"],
            ].map(([step, where, outcome]) => (
              <tr key={step} style={{ borderTop: "1px solid var(--c-border)" }}>
                <td className="px-4 py-3">{step}</td>
                <td className="px-4 py-3">{where}</td>
                <td className="px-4 py-3">{outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="blog-h2">BBB Scraper FAQ</h2>
      <p>
        <strong>What is BBB?</strong> The Better Business Bureau lists US businesses with profiles,
        categories, and contact details. The scraper uses public listing pages to build prospect
        lists.
      </p>
      <p>
        <strong>Do I need a VPN?</strong> Yes. Always run the desktop scraper with a VPN to reduce
        blocks and keep sessions stable.
      </p>
      <p>
        <strong>Where do I download it?</strong> Sign in and open the{" "}
        <Link href="/download" className="text-indigo-400 hover:text-teal-400">
          Download
        </Link>{" "}
        page, then choose AxenFlow AI BBB Scraper.
      </p>
      <p>
        <strong>Is lead generation ethical?</strong> Use public business contact data for legitimate
        B2B outreach, respect applicable laws, validate before sending, and do not spam.
      </p>
      <p>
        <strong>What about Yellow Pages?</strong> AxenFlow AI also offers a{" "}
        <Link href="/yellow-pages-scraper" className="text-indigo-400 hover:text-teal-400">
          Yellow Pages Scraper
        </Link>{" "}
        on the same download page.
      </p>

      <h2 className="blog-h2">Conclusion</h2>
      <p>
        BBB Scraper gives you a clear Windows path from keyword + state search to an exportable lead
        sheet. Download it, scrape with a VPN, validate contacts, then outreach. Start on the{" "}
        <Link href="/download" className="text-indigo-400 hover:text-teal-400">
          download page
        </Link>{" "}
        today.
      </p>
    </>
  );
}
