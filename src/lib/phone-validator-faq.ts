export const PHONE_VALIDATOR_FAQS = [
  {
    question: "Is the AxenFlowAI Phone Validator free?",
    answer:
      "Yes. Format validation and bulk CSV checks are free on the tool page. Custom automation or private deployments are available as a service.",
  },
  {
    question: "Does it work for international numbers?",
    answer:
      "Yes. Numbers with a + country code are validated for that country. You can also set a default country for local formats.",
  },
  {
    question: "Can it tell mobile from landline?",
    answer:
      'For many countries, yes. US and Canada numbers often show as "Fixed or Mobile" because the digits alone do not encode line type. Carrier lookup is needed for certainty.',
  },
  {
    question: "Do you use a third party validation API?",
    answer:
      "Basic format and type detection run locally with standard numbering libraries. No per number API fee for format checks. Live carrier or porting status requires HLR services, which are not included on the free tool.",
  },
  {
    question: "What file formats can I upload?",
    answer:
      "CSV with a Phone or Phone Numbers column. Export is CSV with extended metadata columns including status, type, country, and region.",
  },
  {
    question: "What is E.164 and why does it matter?",
    answer:
      "E.164 is the global format with a plus sign, country code, and subscriber number. CRMs, Twilio, and dialers expect it for reliable routing.",
  },
  {
    question: "Can I reject toll free or VoIP numbers?",
    answer: "Yes. Enable reject filters before running validation or bulk upload.",
  },
  {
    question: "How many numbers can I validate at once?",
    answer: "Up to 10,000 phone numbers per request on the bulk endpoint.",
  },
  {
    question: "Is my data stored?",
    answer:
      "Validation is designed for session use. For enterprise retention policies, contact us about private deployments.",
  },
  {
    question: "What should I do after validating phones?",
    answer:
      "Import clean numbers into your CRM or use AI Outreach to generate call scripts and follow ups.",
  },
] as const;

export function phoneValidatorFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PHONE_VALIDATOR_FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
