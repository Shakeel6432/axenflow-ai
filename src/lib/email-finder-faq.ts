export const EMAIL_FINDER_FAQS = [
  {
    question: "How does Email Finder work without guessing randomly?",
    answer:
      "We generate standard name@domain patterns (first.last, flast, first, and more), rank them by industry likelihood weights, check that the domain has MX records (can receive mail), and reuse any confirmed pattern we have stored for that domain. Signed-in searches also verify the top candidates with a third-party mailbox API.",
  },
  {
    question: "What do High / Medium / Low confidence mean?",
    answer:
      "High — SMTP-verified means a third-party API confirmed the mailbox (signed-in). High from pattern memory alone means a confirmed domain pattern + valid MX without a fresh API check. Medium — pattern match, not SMTP-verified means valid MX plus a common statistical pattern. Low means a less common guess, or the domain is catch-all. Invalid means no MX or the API rejected the address.",
  },
  {
    question: "What is a catch-all domain and why does it lower confidence?",
    answer:
      "A catch-all mail server accepts mail for any local part at that domain. When we detect or remember catch-all, we cannot prove a specific mailbox exists, so confidence is capped and the UI explains why.",
  },
  {
    question: "Do you SMTP-probe mailboxes on your own server IP?",
    answer:
      "No. Guest searches stay on pattern + MX only. Signed-in searches use an abstracted third-party verification provider (Reoon Power mode by default) so we do not run live RCPT probes from the app IP. If the provider times out or budget is exhausted, we fall back to Phase 1 confidence.",
  },
  {
    question: "How many free searches do I get?",
    answer:
      "Guests get a small number of free Phase 1 single searches per day (also rate-limited by IP). Signed-in users get SMTP/API verification on top candidates plus bulk CSV with a free monthly quota (50 finds/month). When the monthly quota runs out, wait for the next month or contact us about higher limits.",
  },
  {
    question: "Are found emails scraped from private databases?",
    answer:
      "No. Results are generated from the names and domain you provide, public MX/DNS information, pattern analysis, optional domain memory, and (for signed-in users) third-party mailbox verification. You are responsible for GDPR, CAN-SPAM, and other applicable rules when using addresses for outreach.",
  },
] as const;
