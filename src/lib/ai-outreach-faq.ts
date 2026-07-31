export const AI_OUTREACH_FAQS = [
  {
    question: "Will AI-generated outreach sound generic or get flagged as spam?",
    answer:
      "Built-in cold email, follow-up, and call scripts are personalized with your lead fields (name, company, industry, city, and optional offer context). They are short and professional, but they are still templates, not a human rewrite of your unique voice. Always review before sending. We do not run a separate spam-trigger-word scanner on generated copy.",
  },
  {
    question: "Can I edit or refine the tone before sending to my whole list?",
    answer:
      "Yes after you sign in. Use chat to build or rewrite a reusable template (tone, length, CTA, placeholders), save it, then apply it to your CSV or Excel list. You can also edit the template text before batch fill.",
  },
  {
    question: "What lead fields can I personalize with?",
    answer:
      "Built-in and custom templates merge business/company name, category/industry, city/location, and sender name. Custom chat templates can use placeholders like {{business_name}}, {{category}}, {{city}}, and {{sender_name}}. The free sample also accepts recipient name and a short offer context.",
  },
  {
    question: "How many free generations do I get, and what happens after?",
    answer:
      "Guests get a small number of free single samples per browser day (also rate-limited by IP). Chat template building and CSV/Excel batch fill require a free account. Batch fill personalizes rows with the same merge engine as the free sample built-in kinds. There is no credit meter on this tool today; if chat AI is temporarily busy, wait a few seconds and retry.",
  },
  {
    question: "Can I export the results to CSV or Excel for use in my own email tool?",
    answer:
      "Yes after sign-in. Batch fill adds subject/body (or script) columns next to each lead row, then you can download CSV or Excel for your ESP, CRM, or dialer.",
  },
  {
    question: "Is this outreach copy checked for spam trigger words?",
    answer:
      "No automated spam-word filter runs on generated text today. Keep claims honest, avoid deceptive subject lines, and follow applicable email/SMS laws before you send.",
  },
  {
    question: "Do you store the leads or context I input?",
    answer:
      "Free samples and batch jobs run for the request and return results to your browser. Uploaded lists are not written into a marketing database, and we do not sell lead lists. Chat needs a signed-in session to call the template assistant. See our Privacy Policy for general data practices.",
  },
] as const;
