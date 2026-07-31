export const PHONE_VALIDATOR_FAQS = [
  {
    question: "What is E.164 format and why does it matter?",
    answer:
      "E.164 is the international phone number standard: a plus sign, country calling code, then the national number with no spaces or punctuation (for example +14155552671). SMS gateways, calling APIs, and most CRMs expect this form so the same number works across countries without local formatting ambiguity.",
  },
  {
    question: "Can this tool detect VoIP numbers used for spam/fraud?",
    answer:
      "When libphonenumber classifies a number as VoIP, we surface that line type so you can filter it. That is a numbering-plan type estimate, not a live spam or fraud score. Many legitimate businesses also use VoIP, and some spam numbers look like normal mobiles. Use VoIP flags as a filter, not as proof of abuse.",
  },
  {
    question:
      "What's the difference between a landline and mobile result, and why does it matter for SMS campaigns?",
    answer:
      "Mobile numbers can usually receive SMS. Landlines generally cannot. Filtering landlines before an SMS campaign reduces failed sends and wasted spend. Note: for US and Canada, many numbers show as Fixed or Mobile because the digits do not encode line type without a live carrier lookup.",
  },
  {
    question: "How accurate is phone number validation without actually calling or texting the number?",
    answer:
      "Format validation checks whether the number is structurally valid for its country using local libphonenumber rules. That is strong for catching typos and impossible lengths. It does not prove the line is currently active, reachable, or owned by a specific person. We do not invent an overall accuracy percentage for live connectivity.",
  },
  {
    question: "How many numbers can I validate for free?",
    answer:
      "Guests get a small number of free single checks per browser day (also rate-limited by IP). Bulk CSV upload requires a free account. After sign-in you can validate up to 10,000 phones per request (max 8MB file), then download results with status and E.164 columns. There is no credit charge on this tool today.",
  },
  {
    question: "Do you store the phone numbers I check?",
    answer:
      "Free single checks and bulk validation run on our servers for the request and return results to your browser. The tool does not write checked numbers into a marketing database, and we do not sell phone lists. See our Privacy Policy for general data practices.",
  },
  {
    question: "Does this work for international numbers outside the US?",
    answer:
      "Yes. Validation uses libphonenumber country rules for territories worldwide. Prefer numbers with a + country code, or pick a default country in the selector when the number is local-format only.",
  },
] as const;
