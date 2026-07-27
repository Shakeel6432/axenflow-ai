import Link from "next/link";
import { BlogFigure } from "@/components/blog/BlogFigure";

export function AiOutreachGuideContent() {
  return (
    <>
      <p>
        Most teams do not lose deals because they lack leads. They lose time rewriting the same cold
        email, call opener, and follow up for every row in a spreadsheet.{" "}
        <strong>AI Outreach</strong> fixes that by turning lead fields into ready to send messages.
      </p>
      <p>
        This guide shows how to use AxenFlowAI{" "}
        <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
          AI Outreach
        </Link>{" "}
        to build templates, personalize with placeholders, fill a CSV or Excel sheet in batch, and
        export scripts for campaigns. Start from clean contacts with the{" "}
        <Link href="/blog/businessleaddatabase" className="text-indigo-400 hover:text-teal-400">
          lead database
        </Link>
        ,{" "}
        <Link href="/blog/bulkemailvalidation" className="text-indigo-400 hover:text-teal-400">
          email validator
        </Link>
        , and{" "}
        <Link href="/blog/bulkphonevalidation" className="text-indigo-400 hover:text-teal-400">
          phone validator
        </Link>{" "}
        guides first.
      </p>

      <h2 className="blog-h2">Why AI Outreach beats copy paste personalization</h2>
      <p>Manual merge fields in a notepad break at scale. Common failure modes:</p>
      <ul className="blog-ul">
        <li>Wrong city or niche left in a reused paragraph</li>
        <li>Missing subject lines when SDRs rush exports</li>
        <li>No consistent follow up after the first touch</li>
        <li>Call scripts that sound like emails when spoken aloud</li>
        <li>Templates scattered across chat logs and Google Docs</li>
      </ul>
      <p>
        AI Outreach keeps built in message types and custom prompts in one place, then fills them
        against each business row so your export sheet is campaign ready.
      </p>
      <p>
        <strong>Pro tip:</strong> Validate emails and phones before generating outreach. Clean data
        plus good scripts beats volume alone.
      </p>

      <h2 className="blog-h2">What you can generate</h2>
      <p>Built in outreach kinds cover the core sales sequence:</p>
      <ul className="blog-ul">
        <li>
          <strong>Cold email:</strong> First touch subject and body
        </li>
        <li>
          <strong>Phone script:</strong> Short spoken opener for dialing
        </li>
        <li>
          <strong>Follow up:</strong> Second touch bump after no reply
        </li>
      </ul>

      <BlogFigure
        src="/images/blog/aioutreach-templates.png"
        alt="AI Outreach built in templates for cold email phone script and follow up"
        caption="Select one or more message types, then apply them to a single lead or a full sheet."
      />

      <h2 className="blog-h2">Placeholders that personalize each row</h2>
      <p>Templates use merge fields that fill from lead data and your sender profile:</p>
      <ul className="blog-ul">
        <li>
          <strong>{"{{business_name}}"}</strong> company or listing name
        </li>
        <li>
          <strong>{"{{category}}"}</strong> niche or industry
        </li>
        <li>
          <strong>{"{{city}}"}</strong> location line
        </li>
        <li>
          <strong>{"{{sender_name}}"}</strong> your name in the sign off
        </li>
      </ul>
      <p>
        Optional first line format: <code>Subject: ...</code> so email subject and body stay
        together in one template.
      </p>

      <h2 className="blog-h2">Chat to create a custom template</h2>
      <ol className="blog-ol">
        <li>
          Open{" "}
          <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
            AI Outreach
          </Link>{" "}
          and sign in.
        </li>
        <li>Set your sender name so Best regards stays consistent.</li>
        <li>Use the chat assistant to draft a template for your offer and niche.</li>
        <li>Review placeholders, then save the custom template for reuse.</li>
        <li>Select built in kinds and/or saved customs before batch fill.</li>
      </ol>

      <BlogFigure
        src="/images/blog/aioutreach-chat.png"
        alt="AI Outreach chat assistant creating a custom cold email template with placeholders"
        caption="Describe the offer in chat, keep placeholders intact, then save the template in your browser."
      />

      <h2 className="blog-h2">Single lead preview</h2>
      <p>
        Enter Business Name, Category, and City to preview how a template reads before you touch a
        full file. This is the fastest way to catch tone issues and missing placeholders.
      </p>

      <h2 className="blog-h2">Batch fill CSV or Excel</h2>
      <ol className="blog-ol">
        <li>Upload a lead file (CSV or Excel) with business name and related fields.</li>
        <li>Select cold email, phone script, follow up, and any saved custom templates.</li>
        <li>Run batch fill to generate subject and body columns per row.</li>
        <li>Download the filled CSV or Excel for your sequencer or dialer workflow.</li>
      </ol>

      <BlogFigure
        src="/images/blog/aioutreach-batch.png"
        alt="AI Outreach batch workflow upload leads select templates and download filled sheet"
        caption="Lead file in, selected templates applied, filled sheet out for sequences and calling."
      />

      <h2 className="blog-h2">Recommended workflow with other AxenFlow tools</h2>
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--c-border)" }}>
        <table className="min-w-full text-left text-sm">
          <thead style={{ background: "var(--c-hover-bg)" }}>
            <tr>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Step
              </th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Tool
              </th>
              <th className="px-4 py-3 font-semibold" style={{ color: "var(--c-heading)" }}>
                Outcome
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Find leads", "Lead Finder", "Niche + city list exported"],
              ["Clean emails", "Email Validator", "Valid emails only"],
              ["Clean phones", "Phone Validator", "E.164 callable numbers"],
              ["Write messages", "AI Outreach", "Subjects, bodies, call scripts"],
            ].map(([step, tool, outcome]) => (
              <tr key={step} style={{ borderTop: "1px solid var(--c-border)" }}>
                <td className="px-4 py-3">{step}</td>
                <td className="px-4 py-3">{tool}</td>
                <td className="px-4 py-3">{outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="blog-h2">Export checklist</h2>
      <ol className="blog-ol">
        <li>Confirm sender name is set</li>
        <li>Preview one row before batch</li>
        <li>Select only the template kinds you will use this week</li>
        <li>Download CSV or Excel</li>
        <li>Spot check 10 rows for placeholder leftovers</li>
        <li>Import to your CRM or sequencer with a batch tag</li>
      </ol>

      <h2 className="blog-h2">AI Outreach FAQ</h2>
      <p>
        <strong>Is AxenFlowAI AI Outreach free to use?</strong> Yes after you sign in. Build
        templates, fill sheets, and download CSV or Excel.
      </p>
      <p>
        <strong>What placeholders should I use?</strong> Use business name, category, city, and
        sender name placeholders so every row stays personalized.
      </p>
      <p>
        <strong>Can I save my own templates?</strong> Yes. Chat to create a prompt, save it as a
        custom template, and reuse it on future uploads.
      </p>
      <p>
        <strong>What file types work for batch fill?</strong> CSV and Excel. Include business name
        and related fields so templates can personalize correctly.
      </p>
      <p>
        <strong>Should I validate contacts first?</strong> Yes. Run{" "}
        <Link href="/tools/email-validator" className="text-indigo-400 hover:text-teal-400">
          Email Validator
        </Link>{" "}
        and{" "}
        <Link href="/tools/phone-validator" className="text-indigo-400 hover:text-teal-400">
          Phone Validator
        </Link>{" "}
        before outreach so scripts go to usable contacts.
      </p>

      <h2 className="blog-h2">Conclusion</h2>
      <p>
        AI Outreach turns a clean lead sheet into personalized cold emails, call scripts, and follow
        ups without rewriting every row by hand. Open{" "}
        <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
          AI Outreach
        </Link>
        , save a template, and fill your next campaign list today.
      </p>
    </>
  );
}
