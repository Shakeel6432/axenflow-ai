export const EMAIL_VALIDATOR_FAQS = [
  {
    question: 'What does "catch-all" mean and why can\'t you confirm those emails?',
    answer:
      "A catch-all domain accepts mail for any local part at that domain. Confirming a real mailbox usually needs a live SMTP probe, which we do not run (it can be blocked and can look like abuse). We verify syntax, DNS, and MX instead, and clearly note that the mailbox itself is not confirmed.",
  },
  {
    question: "What's a disposable/temporary email and why should I remove them from my list?",
    answer:
      "Disposable addresses are throwaway inboxes used once and abandoned. They inflate list size, never become customers, and can hurt engagement metrics. Our disposable filter flags common temp-mail domains so you can drop them before outreach.",
  },
  {
    question: "How accurate is this email validator?",
    answer:
      "Syntax, DNS, and MX checks use live DNS lookups and are highly reliable for those layers. We do not invent a fake overall accuracy percentage. Without SMTP probing we cannot claim inbox-level certainty. Treat Valid as domain can receive mail, not mailbox guaranteed.",
  },
  {
    question: "Will validating emails hurt my sender reputation, or help it?",
    answer:
      "Our checks do not send mail to recipients, so they do not generate complaints or open tracking. Cleaning invalid and disposable addresses before you send usually protects sender reputation by reducing hard bounces.",
  },
  {
    question: 'What\'s the difference between "Invalid" and "Risky"?',
    answer:
      "Invalid means syntax failed, the domain/MX looks broken, or a disposable domain was detected. Risky (on the free check badge) usually means the address looks deliverable at the domain level but is a role account (info@, sales@) or bounce risk is uncertain. Review before cold email.",
  },
  {
    question: "How many emails can I validate for free / how does the CSV upload work?",
    answer:
      "Guests get a small number of free single checks per browser day (also rate-limited by IP). Bulk CSV / Excel / JSON upload requires a free account. After sign-in you can validate up to 5,000 emails per request (max 8MB file), then download results with status columns.",
  },
  {
    question: "Do you store or share the emails I upload?",
    answer:
      "Bulk validation runs on our servers for the request and returns results to your browser. The tool does not write uploaded lists into a marketing database, and we do not sell email lists. See our Privacy Policy for general data practices.",
  },
] as const;
