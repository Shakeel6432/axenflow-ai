import Link from "@/components/ui/AppLink";
import { BlogFigure } from "@/components/blog/BlogFigure";
import { generateOutreach } from "@/lib/outreach";

const SHOWCASE_COLD = generateOutreach("cold_email", {
  businessName: "Summit Roofing",
  category: "home services",
  city: "Denver",
  senderName: "Jordan Lee",
  recipientName: "Maria",
  offerContext: "a steady stream of verified local homeowner leads",
});

const SHOWCASE_FOLLOW = generateOutreach("follow_up", {
  businessName: "Northside Dental",
  category: "healthcare",
  city: "Chicago",
  senderName: "Jordan Lee",
  recipientName: "Dr. Patel",
  offerContext: "patient-acquisition outreach that stays compliant and on-brand",
});

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
        </Link>
        : start with a free sample (no signup), then sign in to chat-build reusable templates,
        personalize each CSV/Excel row, and export for your sequencer or dialer. Clean contacts first
        with the{" "}
        <Link href="/blog/bulkemailvalidation" className="text-indigo-400 hover:text-teal-400">
          email validation guide
        </Link>{" "}
        and{" "}
        <Link href="/blog/bulkphonevalidation" className="text-indigo-400 hover:text-teal-400">
          phone validation guide
        </Link>
        .
      </p>
      <p>
        <strong>Want to see the quality first?</strong> Generate a{" "}
        <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
          free sample cold email or call script
        </Link>{" "}
        (no signup required). Enter recipient name, company, industry, and outreach type, then read
        the subject, body, and <strong>Personalized using</strong> tag on the result card
        (rate-limited).
      </p>

      <BlogFigure
        src="/images/blog/aioutreach-cover.png"
        alt="AxenFlowAI AI Outreach tool showing a generated personalized cold email sample for a sample lead"
        caption="Free sample above the fold, then unlock chat templates and CSV/Excel batch fill after you create an account."
        priority
      />

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

      <h2 className="blog-h2">Example outputs (same voice as the tool)</h2>
      <p>
        These samples use the same built-in personalization engine as the free generator and batch
        fill on the tool page:
      </p>
      <h3 className="blog-h3">Cold email (Summit Roofing)</h3>
      <p>
        <strong>Subject:</strong> {SHOWCASE_COLD.subject}
      </p>
      <pre
        className="overflow-x-auto rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap"
        style={{
          background: "var(--c-hover-bg)",
          color: "var(--c-text-dim)",
          border: "1px solid var(--c-border)",
        }}
      >
        {SHOWCASE_COLD.body}
      </pre>
      <h3 className="blog-h3">Follow-up (Northside Dental)</h3>
      <p>
        <strong>Subject:</strong> {SHOWCASE_FOLLOW.subject}
      </p>
      <pre
        className="overflow-x-auto rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap"
        style={{
          background: "var(--c-hover-bg)",
          color: "var(--c-text-dim)",
          border: "1px solid var(--c-border)",
        }}
      >
        {SHOWCASE_FOLLOW.body}
      </pre>
      <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
        Try the live generator on{" "}
        <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
          /tools/ai-outreach
        </Link>{" "}
        with your own lead fields.
      </p>

      <h2 className="blog-h2">What you can generate</h2>
      <p>Built in outreach kinds cover the core sales sequence:</p>
      <ul className="blog-ul">
        <li>
          <strong>Cold email:</strong> First touch subject and body
        </li>
        <li>
          <strong>Phone script / call script:</strong> Short spoken opener for dialing
        </li>
        <li>
          <strong>Follow-up email:</strong> Second touch bump after no reply
        </li>
      </ul>
      <p>
        After sign-in you can also chat-build custom templates with placeholders, then apply those
        to a full sheet alongside the built-in kinds.
      </p>

      <h2 className="blog-h2">How it works on the current tool</h2>
      <ol className="blog-ol">
        <li>
          <strong>Free single sample (no signup):</strong> Fill recipient name, company, industry,
          outreach type, and optional offer context. You get a result card with subject (for emails)
          + body, Copy / Regenerate, and a <strong>Personalized using: …</strong> tag.
        </li>
        <li>
          <strong>Sign up for chat templates:</strong> Converse with the assistant to refine tone,
          length, CTA, and structure. Save a reusable template with placeholders.
        </li>
        <li>
          <strong>Batch CSV / Excel fill:</strong> Upload a list (up to 5,000 rows, max 12MB), select
          built-in kinds and/or saved customs, and generate personalized subject/body columns per
          row.
        </li>
        <li>
          <strong>Export:</strong> Download CSV or Excel for your ESP, CRM, or dialer.
        </li>
      </ol>

      <BlogFigure
        src="/images/blog/aioutreach-free-sample.png"
        alt="AxenFlowAI AI Outreach free sample generator with personalized cold email subject body and Personalized using tag"
        caption="What guests see: form fields, generated subject/body, and the Personalized using tag."
      />

      <BlogFigure
        src="/images/blog/aioutreach-how-it-works.png"
        alt="AxenFlowAI AI Outreach How It Works section for chat templates lead-field personalization and batch CSV Excel fill"
        caption="Chat shapes the template. Lead fields personalize each row. Batch fill scales it across your sheet."
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
        The free sample also accepts recipient name and a short “what are you offering?” context.
        Optional first line format for custom templates: <code>Subject: ...</code> so email subject
        and body stay together.
      </p>

      <h2 className="blog-h2">Chat to create a custom template</h2>
      <p>
        Chat-based template building is live after sign-in (Groq assistant when configured). Guests
        still see the How It Works explainer and signup gate; chat itself is behind the account wall.
      </p>
      <ol className="blog-ol">
        <li>
          Open{" "}
          <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
            AI Outreach
          </Link>{" "}
          and sign in (optionally try a free sample first).
        </li>
        <li>Set your sender name so Best regards stays consistent.</li>
        <li>Use the chat assistant to draft or refine a template for your offer and niche.</li>
        <li>Review placeholders, then save the custom template for reuse.</li>
        <li>Select built in kinds and/or saved customs before batch fill.</li>
      </ol>

      <BlogFigure
        src="/images/blog/aioutreach-chat.png"
        alt="AI Outreach chat assistant creating a custom cold email template with placeholders"
        caption="Describe the offer in chat, keep placeholders intact, then save the template in your browser."
      />

      <h2 className="blog-h2">Batch fill CSV or Excel</h2>
      <p>
        Bulk upload is account-gated. Guests see an informative gate with limits and a sample output
        table (name, company, generated_subject, generated_body), not a blank login wall. There is no
        credit meter on this tool today: batch personalization uses the same merge engine as the free
        sample for built-in kinds.
      </p>
      <ol className="blog-ol">
        <li>Upload a lead file (CSV or Excel) with business name and related fields.</li>
        <li>Select cold email, phone script, follow up, and any saved custom templates.</li>
        <li>Run batch fill to generate subject and body columns per row.</li>
        <li>Download the filled CSV or Excel for your sequencer or dialer workflow.</li>
      </ol>

      <BlogFigure
        src="/images/blog/aioutreach-batch-table.png"
        alt="AxenFlowAI AI Outreach batch CSV Excel output table with name company generated_subject and generated_body columns"
        caption="Sample batch shape before signup. After sign-in, full subject/body columns land next to your lead fields."
      />

      <h2 className="blog-h2">Privacy and trust (what we say on the tool)</h2>
      <p>
        Free samples and batch jobs run for the request and return results to your browser. Uploaded
        lists are not written into a marketing database, and we do not sell lead lists. Chat needs a
        signed-in session. For broader practices, see the{" "}
        <Link href="/privacy" className="text-indigo-400 hover:text-teal-400">
          Privacy Policy
        </Link>
        . We do not run an automated spam-trigger-word scanner on generated copy. Always review before
        you send.
      </p>

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
        <li>Try a free sample (or preview one row after sign-in) before batch</li>
        <li>Select only the template kinds you will use this week</li>
        <li>Download CSV or Excel</li>
        <li>Spot check 10 rows for placeholder leftovers</li>
        <li>Import to your CRM or sequencer with a batch tag</li>
      </ol>

      <h2 className="blog-h2">AI Outreach FAQ</h2>
      <p>
        <strong>Is there a free sample without signup?</strong> Yes. Use the free generator on{" "}
        <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
          AI Outreach
        </Link>
        . Guests get a small number of samples per day (also IP rate-limited). Chat templates and
        batch fill need an account.
      </p>
      <p>
        <strong>Will AI outreach sound generic or get flagged as spam?</strong> Built-in messages are
        personalized with your lead fields, but they are still templates, not a human rewrite of your
        voice. Always review before sending. There is no separate spam-word scanner today.
      </p>
      <p>
        <strong>Can I edit or refine the tone before my whole list?</strong> Yes after sign-in. Use
        chat to refine tone, length, and CTA, edit the template text, then batch-apply it.
      </p>
      <p>
        <strong>What fields can I personalize?</strong> Company/business name, category/industry,
        city, sender name, plus recipient name and offer context on the free sample. Custom templates
        use {"{{business_name}}"}, {"{{category}}"}, {"{{city}}"}, {"{{sender_name}}"}.
      </p>
      <p>
        <strong>How many free generations do I get?</strong> A small daily guest sample allowance.
        After sign-in, batch fill has no credit meter today (up to 5,000 rows / 12MB). Chat may ask
        you to retry if the AI is busy.
      </p>
      <p>
        <strong>Can I export to CSV or Excel?</strong> Yes after sign-in. Subject/body (or script)
        columns download next to your original lead fields.
      </p>
      <p>
        <strong>Do you store the leads I input?</strong> Processing is request-scoped for the tool
        response. Lists are not saved into a marketing database, and we do not sell lead lists. See
        the Privacy Policy for general practices.
      </p>
      <p>
        <strong>Should I validate contacts first?</strong> Yes. Run{" "}
        <Link href="/tools/email-validator" className="text-indigo-400 hover:text-teal-400">
          Email Validator
        </Link>{" "}
        and{" "}
        <Link href="/tools/phone-validator" className="text-indigo-400 hover:text-teal-400">
          Phone Validator
        </Link>
        , then read the{" "}
        <Link href="/blog/bulkemailvalidation" className="text-indigo-400 hover:text-teal-400">
          email guide
        </Link>{" "}
        and{" "}
        <Link href="/blog/bulkphonevalidation" className="text-indigo-400 hover:text-teal-400">
          phone guide
        </Link>
        .
      </p>

      <h2 className="blog-h2">Conclusion</h2>
      <p>
        Start with a free sample to see subject, body, and personalization tags, then sign in to
        chat-build templates and fill a full CSV or Excel list. Open{" "}
        <Link href="/tools/ai-outreach" className="text-indigo-400 hover:text-teal-400">
          AI Outreach
        </Link>{" "}
        and try a lead now.
      </p>
    </>
  );
}
