import Link from "next/link";

export function BulkPhoneValidationGuideContent() {
  return (
    <>
      <p>
        If your team dials from a spreadsheet, you already know the pain: half the numbers are
        formatted differently, some are typos, a few are toll free main lines, and nobody can tell
        which rows are mobile until after the campaign fails.
      </p>
      <p>
        Bulk phone validation fixes that <strong>before</strong> you spend budget on dialers, SMS
        tools, or SDR hours. This guide walks through preparing your file, running validation on
        AxenFlowAI, interpreting results, and handing off clean data to outreach without needing a
        data engineer on call.
      </p>

      <h2 className="blog-h2">Why bulk validation beats spot checking</h2>
      <p>Spot checking ten numbers feels productive. It is not.</p>
      <p>Real outbound damage comes from systematic issues:</p>
      <ul className="blog-ul">
        <li>Mixed formats breaking CRM dedupe</li>
        <li>Invalid lengths that pass eye tests but fail dialers</li>
        <li>Toll free rows in B2B lists meant for direct lines</li>
        <li>International rows missing country codes</li>
        <li>Multi number cells breaking imports</li>
      </ul>
      <p>
        When only 85 to 92 percent of a list is callable, teams blame messaging or reps. Often it
        is contact data. Bulk validation gives you a measurable baseline: valid count, invalid
        count, line category, and exportable proof for clients.
      </p>
      <p>
        <strong>Pro tip:</strong> Run validation the same day you receive a lead file. Data decays
        less than reputation.
      </p>

      <h2 className="blog-h2">Preparing your CSV for validation</h2>
      <h3 className="blog-h3">Required column</h3>
      <p>AxenFlowAI Phone Validator looks for:</p>
      <ul className="blog-ul">
        <li>Phone</li>
        <li>Phone Numbers</li>
        <li>phones (normalized on import)</li>
      </ul>
      <p>
        If your export uses mobile, direct, or contact_phone, rename the column before upload. One
        phone per row is ideal. Multi value cells can be collapsed to the first valid number when
        Keep one number is enabled.
      </p>

      <h3 className="blog-h3">Encoding and delimiters</h3>
      <p>
        Save as UTF-8 CSV. Excel sometimes exports with BOM or semicolon delimiters depending on
        locale. Open in Google Sheets or LibreOffice and re export if rows look merged.
      </p>

      <h3 className="blog-h3">Strip obvious junk first</h3>
      <p>
        Remove header rows duplicated mid file, footer totals, and blank lines. Trimming whitespace
        in Excel reduces false Unknown statuses.
      </p>

      <h2 className="blog-h2">Common export sources (and what breaks)</h2>
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--c-border)" }}>
        <table className="min-w-full text-left text-sm">
          <thead style={{ background: "var(--c-hover-bg)" }}>
            <tr>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Source
              </th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Typical issue
              </th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Fix
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["CRM export", "Local format without +", "Set default country or prepend country code"],
              ["Scraper output", "Multiple numbers in one cell", "Enable keep one logic"],
              ["Purchased lists", "Toll free HQ lines", "Filter toll free after validation"],
              ["Apollo / ZoomInfo", "Mixed US/international", "Split by country column if available"],
            ].map(([source, issue, fix]) => (
              <tr key={source} style={{ borderTop: "1px solid var(--c-border)" }}>
                <td className="px-4 py-3">{source}</td>
                <td className="px-4 py-3">{issue}</td>
                <td className="px-4 py-3">{fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Pair phone validation with{" "}
        <Link href="/tools/email-validator" className="text-indigo-400 hover:text-teal-400">
          Email Validator
        </Link>{" "}
        when your file has both columns. Hygiene stacks win campaigns.
      </p>

      <h2 className="blog-h2">Running bulk validation on AxenFlowAI</h2>
      <ol className="blog-ol">
        <li>
          Open{" "}
          <Link href="/tools/phone-validator" className="text-indigo-400 hover:text-teal-400">
            Phone Validator
          </Link>
          .
        </li>
        <li>
          Configure checks: Format + country validation, default country if rows lack +, output
          format E.164, optional reject filters.
        </li>
        <li>Upload CSV.</li>
        <li>
          Review summary cards: Total, Valid, Invalid, Mobile, Landline, VoIP, Fixed/Mobile.
        </li>
        <li>Download results CSV.</li>
      </ol>
      <p>
        Processing up to 10,000 numbers per request covers most SMB batches. Larger files can be
        split or handled via{" "}
        <Link href="/contact" className="text-indigo-400 hover:text-teal-400">
          custom automation
        </Link>
        .
      </p>

      <h2 className="blog-h2">Reading your results</h2>
      <h3 className="blog-h3">Status fields</h3>
      <ul className="blog-ul">
        <li>
          <strong>Valid:</strong> Passes numbering rules for detected country
        </li>
        <li>
          <strong>Invalid:</strong> Fails format or length rules
        </li>
        <li>
          <strong>Unknown:</strong> Missing country context (add + or default country)
        </li>
      </ul>

      <h3 className="blog-h3">Type fields</h3>
      <ul className="blog-ul">
        <li>
          <strong>Mobile / Landline / VoIP:</strong> Actionable when detected
        </li>
        <li>
          <strong>Fixed or Mobile:</strong> Common for US/Canada
        </li>
        <li>
          <strong>Toll free:</strong> Usually HQ or support lines
        </li>
      </ul>

      <h3 className="blog-h3">Geography fields</h3>
      <p>
        For US/CA numbers, expect area code and region. Operator fields reflect numbering prefix
        estimates, not live porting status.
      </p>

      <h2 className="blog-h2">Filtering for your channel</h2>
      <p>
        <strong>Cold calling:</strong> Often keep Valid + Fixed/Mobile; optionally reject toll free.
      </p>
      <p>
        <strong>SMS campaigns:</strong> Prefer confirmed Mobile where available; exclude landline
        when type is known.
      </p>
      <p>
        <strong>CRM enrichment:</strong> Keep all Valid; store E.164 + type columns for
        segmentation.
      </p>

      <h2 className="blog-h2">Export and CRM import checklist</h2>
      <ol className="blog-ol">
        <li>Download validated CSV from AxenFlowAI</li>
        <li>Map E164 or Phone column to CRM phone field</li>
        <li>Map Phone Type / Line Category to custom fields</li>
        <li>Dedupe on E.164 before import</li>
        <li>Tag source batch ID for attribution</li>
        <li>
          Optional: push cleaned file to{" "}
          <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
            AI Outreach
          </Link>{" "}
          for scripts
        </li>
      </ol>
      <p>Test import with 50 rows before full load.</p>

      <h2 className="blog-h2">Measuring improvement</h2>
      <p>Track connect rate, wrong number rate, time to first call, and client QA rejection rate.</p>
      <p>
        Even a 5 point connect lift on 5,000 dials pays for hygiene tooling many times over.
      </p>

      <h2 className="blog-h2">FAQ</h2>
      <p>
        <strong>How is this different from carrier lookup?</strong> Bulk format validation confirms
        the number could exist and is structured correctly. Live carrier lookup confirms current
        network. That is a paid layer AxenFlowAI can integrate in custom projects.
      </p>
      <p>
        <strong>Will validation fix typos?</strong> It flags invalid rows; it does not guess missing
        digits.
      </p>
      <p>
        <strong>Can I validate while scraping?</strong> Yes. Many teams pipe scraper CSV through
        validators before client delivery. See{" "}
        <Link href="/download" className="text-indigo-400 hover:text-teal-400">
          Desktop Scrapers
        </Link>
        .
      </p>

      <h2 className="blog-h2">Conclusion</h2>
      <p>
        Bulk phone validation is the cheapest insurance on outbound ROI. Clean CSV in, E.164 out,
        types and regions attached, then dial with confidence.
      </p>
    </>
  );
}
