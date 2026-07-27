import Link from "next/link";
import { BlogFigure } from "@/components/blog/BlogFigure";

export function LeadDatabaseGuideContent() {
  return (
    <>
      <p>
        Looking for a free <strong>business lead database</strong> you can actually search and
        export? Most sales teams do not need more random contacts. They need the right businesses,
        filtered by niche and location, with phone and email fields ready for outreach.
      </p>
      <p>
        The AxenFlowAI{" "}
        <Link href="/leads" className="text-indigo-400 hover:text-teal-400">
          Lead Finder
        </Link>{" "}
        is a searchable B2B lead database built for that job: keyword, category, and geography
        filters, then select rows and export CSV, Excel, or JSON. This guide shows how to search
        business leads, build clean lists, and hand them off to validators and outreach tools.
      </p>

      <h2 className="blog-h2">Why a searchable lead database beats raw CSV dumps</h2>
      <p>Raw files force you to clean before you can think. A live business lead database flips that:</p>
      <ul className="blog-ul">
        <li>You start from a question (dentists in Miami with phone)</li>
        <li>Filters remove dead weight before you download anything</li>
        <li>Pagination and sorting help you prioritize quality</li>
        <li>Export only what you selected, not the entire dump</li>
        <li>Saved leads keep a working set inside your dashboard</li>
      </ul>
      <p>
        When agencies deliver lists to clients, measurable filters are proof of process. When SDRs
        prospect, narrower queries beat spray and pray dialing.
      </p>
      <p>
        <strong>Pro tip:</strong> Treat every export as a campaign batch. Name files with niche,
        city, and date so attribution stays clean in your CRM.
      </p>

      <h2 className="blog-h2">Lead Finder filters for B2B lead search</h2>
      <p>AxenFlowAI Lead Finder supports the filters sales ops actually use:</p>
      <ul className="blog-ul">
        <li>
          <strong>Keyword:</strong> Business name or free text niche terms
        </li>
        <li>
          <strong>Main category and sub category:</strong> Taxonomy groups (for example Dental to
          Orthodontists)
        </li>
        <li>
          <strong>Country, state, city:</strong> Cascading location filters for local lead lists
        </li>
        <li>
          <strong>Has Phone / Has Email:</strong> Contact ready subsets for calling or mailing
        </li>
        <li>
          <strong>Sort:</strong> Newest, highest rating, most reviews, alphabetical
        </li>
      </ul>

      <BlogFigure
        src="/images/blog/leadfinder-filters.png"
        alt="AxenFlowAI Lead Finder filters for business lead database search by keyword category and location"
        caption="Start broad, then lock country, state, city and require phone or email before exporting."
      />

      <h3 className="blog-h3">Preview vs full access</h3>
      <p>
        Public visitors can search the lead database and see a short preview of matches. Sign in to
        unlock full results, multi select, CSV Excel JSON exports, and save to dashboard. That keeps
        discovery open while protecting bulk export for accounts.
      </p>

      <h2 className="blog-h2">How to search and export business leads step by step</h2>
      <ol className="blog-ol">
        <li>
          Open{" "}
          <Link href="/leads" className="text-indigo-400 hover:text-teal-400">
            Lead Finder
          </Link>
          .
        </li>
        <li>Pick a main category, or type a keyword if you know the niche term.</li>
        <li>Set country, then state, then city when you need geo focus.</li>
        <li>Enable Has Phone for calling, Has Email for mail sequences, or both.</li>
        <li>Sort by rating or reviews when you want higher signal local businesses.</li>
        <li>Click Search Leads and review the result cards.</li>
      </ol>
      <p>
        If volume is too low, drop city first, then sub category. If volume is too high, require
        phone plus email and tighten geography before you start selecting.
      </p>

      <h2 className="blog-h2">Reading lead result cards</h2>
      <p>Each card is a business record with the fields you need for outbound:</p>
      <ul className="blog-ul">
        <li>Business name and category</li>
        <li>Owner (when available)</li>
        <li>Phone, email, website</li>
        <li>Address, city, state, country</li>
        <li>Rating and review count (when present)</li>
      </ul>

      <BlogFigure
        src="/images/blog/leadfinder-results.png"
        alt="Business lead database results grid with selectable lead cards for CSV export"
        caption="Select individual cards or use Select all on page, then export only the chosen rows."
      />

      <p>
        Click phone or email copy actions when you need a quick paste into a dialer or CRM note.
        For campaigns, prefer bulk export so formatting stays consistent.
      </p>

      <h2 className="blog-h2">Select leads and export CSV, Excel, or JSON</h2>
      <ol className="blog-ol">
        <li>Sign in if you are still in preview mode.</li>
        <li>Select leads on the page (or Select all on page).</li>
        <li>
          Use the bulk toolbar: download CSV, Excel, or JSON; copy unique phones or emails; or Save
          Leads to your dashboard.
        </li>
        <li>Repeat across pages until your batch size matches the campaign.</li>
      </ol>

      <BlogFigure
        src="/images/blog/leadfinder-export.png"
        alt="Export business leads from AxenFlowAI lead database as CSV Excel or JSON"
        caption="Export columns include Business Name, Category, Owner, Phone, Email, Website, and location fields."
      />

      <h3 className="blog-h3">Export columns for CRM import</h3>
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--c-border)" }}>
        <table className="min-w-full text-left text-sm">
          <thead style={{ background: "var(--c-hover-bg)" }}>
            <tr>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Column
              </th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Use it for
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Business Name", "CRM account name / company field"],
              ["Category", "Segment tags and offer matching"],
              ["Owner", "Personalized first line outreach"],
              ["Phone", "Dialer import (validate first)"],
              ["Email", "Mail sequences (validate first)"],
              ["Website", "Research and domain based enrichment"],
              ["Address / City / State / Country", "Territory routing and local scripts"],
            ].map(([col, use]) => (
              <tr key={col} style={{ borderTop: "1px solid var(--c-border)" }}>
                <td className="px-4 py-3">{col}</td>
                <td className="px-4 py-3">{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="blog-h2">Common lead search patterns (and what breaks)</h2>
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--c-border)" }}>
        <table className="min-w-full text-left text-sm">
          <thead style={{ background: "var(--c-hover-bg)" }}>
            <tr>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Goal
              </th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Typical mistake
              </th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Better approach
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Local calling list",
                "Export whole state with no contact filter",
                "City + Has Phone, then validate E.164",
              ],
              [
                "Email campaign",
                "Skipping Has Email then wondering about blanks",
                "Enable Has Email before select/export",
              ],
              [
                "Agency client delivery",
                "One giant unsorted dump",
                "Batch by city/niche; include filter notes in file name",
              ],
              [
                "High intent locals",
                "Ignoring rating/reviews sort",
                "Sort by rating or reviews after niche + city",
              ],
            ].map(([goal, mistake, better]) => (
              <tr key={goal} style={{ borderTop: "1px solid var(--c-border)" }}>
                <td className="px-4 py-3">{goal}</td>
                <td className="px-4 py-3">{mistake}</td>
                <td className="px-4 py-3">{better}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="blog-h2">Validate leads after export</h2>
      <p>
        Database search gets you relevant businesses. Validation keeps your dialer and inbox from
        burning reputation.
      </p>
      <ol className="blog-ol">
        <li>
          Run phones through{" "}
          <Link href="/tools/phone-validator" className="text-indigo-400 hover:text-teal-400">
            Phone Validator
          </Link>{" "}
          (
          <Link href="/blog/bulkphonevalidation" className="text-indigo-400 hover:text-teal-400">
            bulk phone validation guide
          </Link>
          ).
        </li>
        <li>
          Run emails through{" "}
          <Link href="/tools/email-validator" className="text-indigo-400 hover:text-teal-400">
            Email Validator
          </Link>
          .
        </li>
        <li>Dedupe on phone/email before CRM import.</li>
        <li>
          Optional: generate scripts in{" "}
          <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
            AI Outreach
          </Link>
          .
        </li>
      </ol>
      <p>
        Need niche coverage you do not see yet? Use{" "}
        <Link href="/download" className="text-indigo-400 hover:text-teal-400">
          desktop scrapers
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="text-indigo-400 hover:text-teal-400">
          custom scraping
        </Link>
        , then validate and import.
      </p>

      <h2 className="blog-h2">CRM import checklist</h2>
      <ol className="blog-ol">
        <li>Export selected leads from AxenFlowAI (CSV or Excel)</li>
        <li>Map Business Name to Company / Account</li>
        <li>Map Phone / Email to primary contact fields</li>
        <li>Map Category + City/State to tags or custom fields</li>
        <li>Tag source as AxenFlowAI + batch date</li>
        <li>Import a 50 row test before the full load</li>
      </ol>

      <h2 className="blog-h2">Measuring lead list quality</h2>
      <p>
        Track connect rate, bounce rate, meetings booked per 100 leads, and time from search to
        first dial. If connect rates stay low after validation, revisit niche definition or city
        targeting, not just scripts.
      </p>

      <h2 className="blog-h2">Business lead database FAQ</h2>
      <p>
        <strong>Is the AxenFlowAI business lead database free?</strong> Searching and previewing is
        free on AxenFlowAI. Create an account to unlock full results, CSV/Excel/JSON exports, and
        saved leads.
      </p>
      <p>
        <strong>How do I export business leads from the lead database?</strong> Sign in, search with
        your filters, select the leads you want, then download CSV, Excel, or JSON from the bulk
        toolbar. You can also save leads to your dashboard.
      </p>
      <p>
        <strong>What filters does the Lead Finder support?</strong> Keyword, main category, sub
        category, country, state, city, Has Phone, Has Email, and sort options including newest,
        highest rating, most reviews, and alphabetical.
      </p>
      <p>
        <strong>What columns are included when I export leads?</strong> Exports include Business
        Name, Category, Owner, Phone, Email, Website, Address, City, State, and Country.
      </p>
      <p>
        <strong>Should I validate leads after exporting from the database?</strong> Yes. Run Phone
        Validator and Email Validator on your export before dialing or mailing to improve connect
        rates and protect sender reputation.
      </p>

      <h2 className="blog-h2">Conclusion</h2>
      <p>
        A usable outbound list is a filtered question answered quickly: niche, place, contact
        fields, then export. AxenFlowAI Lead Finder gives you that loop (search, select, download)
        so validation and outreach start from cleaner inputs. Open the{" "}
        <Link href="/leads" className="text-indigo-400 hover:text-teal-400">
          free business lead database
        </Link>{" "}
        and build your next campaign list today.
      </p>
    </>
  );
}
