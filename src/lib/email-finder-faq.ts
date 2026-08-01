export const EMAIL_FINDER_FAQS = [
  {
    question: "How does Email Finder work without guessing randomly?",
    answer:
      "We generate standard name@domain patterns (first.last, flast, first, and more), rank them by industry likelihood weights, check that the domain has MX records (can receive mail), and reuse any confirmed pattern we have stored for that domain from prior confirmations.",
  },
  {
    question: "What do High / Medium / Low confidence mean in Phase 1?",
    answer:
      "High means this domain has a confirmed pattern in our memory and valid MX. Medium means valid MX plus a common statistical pattern, and the domain is not known catch-all. Low means a less common pattern guess, or the domain is catch-all (any address is accepted). Phase 1 does not live-probe each mailbox with SMTP.",
  },
  {
    question: "What is a catch-all domain and why does it lower confidence?",
    answer:
      "A catch-all mail server accepts mail for any local part at that domain. When we detect or remember catch-all, we cannot prove a specific mailbox exists, so confidence is capped and the UI explains why.",
  },
  {
    question: "Do you SMTP-probe mailboxes yet?",
    answer:
      "Not for candidate addresses in Phase 1. Optional catch-all probing (one fake address per new domain) can be enabled server-side, but full SMTP verification of real candidates is Phase 2 and needs separate infrastructure to avoid IP blacklisting.",
  },
  {
    question: "How many free searches do I get?",
    answer:
      "Guests get a small number of free single searches per day (also rate-limited by IP). Signed-in users get bulk CSV with a free monthly quota (50 finds/month in Phase 1). When the monthly quota runs out, wait for the next month or contact us about higher limits.",
  },
  {
    question: "Are found emails scraped from private databases?",
    answer:
      "No. Results are generated from the names and domain you provide, public MX/DNS information, pattern analysis, and optional domain memory from prior confirmations on this tool. You are responsible for GDPR, CAN-SPAM, and other applicable rules when using addresses for outreach.",
  },
] as const;
