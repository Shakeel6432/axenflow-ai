export const siteConfig = {
  name: "AxenFlow AI",
  tagline: "Lead Database, Live Tools & AI Automation",
  description:
    "Search our free business lead database, validate emails and phones, generate AI outreach, download desktop scrapers, or hire us for custom bots and workflows.",
  email: "hello@axenflowai.com",
  fiverrUrl: "https://www.fiverr.com/shakeel644",
  url: "https://www.axenflowai.com",
};

export const contactGuidelines = {
  emailSubject: "New Project Inquiry - AxenFlow AI",
  responseTime: "Under 24 hours",
  emailDetails: [
    "Your name and company",
    "The service you need (automation, scraping, bots, etc.)",
    "What problem you want to solve",
    "Project scope, goals, and expected outcome",
    "Budget range and timeline (if available)",
  ],
  fiverrSteps: [
    "Open our Fiverr profile and choose a service or send a custom request",
    "Share your project details in the Fiverr chat",
    "Discuss scope, timeline, and pricing before we start",
    "Place your order securely through Fiverr when you are ready",
  ],
};

export function getProjectInquiryEmailText() {
  const body = [
    "Hi AxenFlow AI,",
    "",
    "I would like to discuss a new project. Here are my details:",
    "",
    "Name:",
    "Company:",
    "Service Needed:",
    "Project Details:",
    "Budget:",
    "Timeline:",
    "",
    "Thanks,",
  ].join("\n");

  return {
    email: siteConfig.email,
    subject: contactGuidelines.emailSubject,
    body,
    fullText: `To: ${siteConfig.email}\nSubject: ${contactGuidelines.emailSubject}\n\n${body}`,
  };
}

export function getProjectInquiryMailtoLink() {
  const { email, subject, body } = getProjectInquiryEmailText();

  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${email}?${params.toString()}`;
}

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Leads", href: "/leads" },
  { label: "Tools", href: "/tools" },
  { label: "Blog", href: "/blog" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const services = [
  {
    title: "AI Automation",
    description:
      "Connect Lead Finder exports, validators, CRMs, and your apps so lead handling and follow-ups run without manual work.",
    icon: "/images/v1/icon-s1.svg",
    image: "/images/service/img1.png",
  },
  {
    title: "AI WhatsApp Agents",
    description:
      "Build WhatsApp agents that qualify leads, answer FAQs, book appointments, and follow up automatically.",
    icon: "/images/v1/icon-s2.svg",
    image: "/images/service/img2.png",
  },
  {
    title: "AI Email Agents",
    description:
      "AI that reads, sorts, replies, and forwards inbox mail. Works alongside Email Validator and AI Outreach for cleaner outbound and inbound flows.",
    icon: "/images/v1/icon-s3.svg",
    image: "/images/service/img3.png",
  },
  {
    title: "Web Scraping",
    description:
      "Custom scrapers for leads, prices, and market data. Use our desktop scrapers for fresh lists, or hire us for a scraper built around your sources.",
    icon: "/images/v1/icon-s4.svg",
    image: "/images/portfolio/img1.png",
  },
  {
    title: "Workflow Automation",
    description:
      "Wire Lead Finder, Google Sheets, Slack, Airtable, and CRMs with n8n or Make so validated leads and outreach stay in sync.",
    icon: "/images/v2/Icon1.svg",
    image: "/images/v2/Services.png",
  },
  {
    title: "Custom AI Solutions",
    description:
      "Internal tools, chatbots, enrichment pipelines, and automations that plug into our lead database and live tools stack.",
    icon: "/images/v3/icon1.svg",
    image: "/images/v3/about-us.png",
  },
] as const;

export const industries = [
  "Healthcare",
  "Real Estate",
  "E-commerce",
  "Finance",
  "Marketing",
  "Education",
  "Logistics",
  "Startups",
] as const;

export const technologies = [
  "Lead Finder",
  "Email Validator",
  "Phone Validator",
  "AI Outreach",
  "Desktop Scrapers",
  "OpenAI",
  "Claude",
  "n8n",
  "Make",
  "Python",
  "Node.js",
] as const;

export const trustedPartners = [
  { name: "Lead Finder", abbr: "LF" },
  { name: "Email", abbr: "Em" },
  { name: "Phone", abbr: "Ph" },
  { name: "Outreach", abbr: "AI" },
  { name: "Scrapers", abbr: "Sc" },
  { name: "OpenAI", abbr: "AI" },
  { name: "n8n", abbr: "n8" },
  { name: "Make", abbr: "Mk" },
] as const;

export const processSteps = [
  {
    step: "01",
    title: "Start with the platform",
    description:
      "Search Lead Finder, clean lists with email and phone validators, or try AI Outreach. Tell us what still needs custom work.",
  },
  {
    step: "02",
    title: "Strategy",
    description:
      "You get a clear plan: which live tools to use, what we will build (scraper, bot, workflow), and how long it will take.",
  },
  {
    step: "03",
    title: "Build",
    description:
      "We build and test scrapers, WhatsApp or email agents, and n8n/Make workflows, then connect them to your stack.",
  },
  {
    step: "04",
    title: "Launch & Support",
    description:
      "We go live, watch the system, and fix issues. You keep using the lead database and tools on AxenFlow anytime.",
  },
] as const;

export const whyChooseUs = [
  {
    title: "86+ Projects Done",
    description:
      "Real businesses, real results. Lead scrapers, validators, WhatsApp agents, and workflows delivered across 15+ countries.",
    icon: "/images/about-us/icon1.svg",
  },
  {
    title: "Platform + Custom Work",
    description:
      "Free lead database and live tools on the site, plus custom scrapers, bots, and automations when you need more.",
    icon: "/images/about-us/icon2.svg",
  },
  {
    title: "Quick Delivery",
    description:
      "Most bots and scrapers go live in under a week. Complex multi-tool builds usually take 2 to 3 weeks.",
    icon: "/images/about-us/icon3.svg",
  },
  {
    title: "One Team, Full Stack",
    description:
      "Leads, validation, outreach, scraping, WhatsApp, email AI, and workflows. You do not need five freelancers.",
    icon: "/images/v3/icon2.svg",
  },
] as const;

export const faqs = [
  {
    question: "What can I use on AxenFlow for free?",
    answer:
      "Lead Finder (business lead database), Email Validator, Phone Validator, and AI Outreach. Sign in to run the tools. Desktop scrapers are available on the download page.",
  },
  {
    question: "What do you build as custom services?",
    answer:
      "AI automation, WhatsApp agents, email agents, web scrapers, n8n/Make workflows, and custom AI tools. We often connect them to Lead Finder exports and your CRM.",
  },
  {
    question: "How fast can you deliver?",
    answer:
      "Simple bots and scrapers are done in 2 to 5 days. Bigger projects with multiple integrations usually take 1 to 3 weeks. We give a clear timeline before we start.",
  },
  {
    question: "Do you work with clients worldwide?",
    answer:
      "Yes. Most of our clients are international. We have worked with businesses in the US, UK, UAE, Australia, and across Europe. Everything is remote.",
  },
  {
    question: "What if something breaks after launch?",
    answer:
      "We do not disappear after delivery. Every custom project includes post-launch support. If something breaks or needs a tweak, we handle it.",
  },
  {
    question: "How do I start?",
    answer:
      "Try Lead Finder or any live tool today, or fill out the form on this page. Tell us what you need and we reply within 24 hours with a plan and quote.",
  },
] as const;

export const serviceOptions = [
  "AI Automation",
  "AI WhatsApp Agents",
  "Web Scraping",
  "AI Email Agent",
  "Workflow Automation",
  "Custom Solution",
] as const;

export const footerLinks = {
  quick: [
    { label: "Home", href: "/" },
    { label: "Leads", href: "/leads" },
    { label: "Blog", href: "/blog" },
    { label: "Email Validator", href: "/tools/email-validator" },
    { label: "Phone Validator", href: "/tools/phone-validator" },
    { label: "AI Outreach", href: "/tools/ai-outreach" },
    { label: "BBB Scraper", href: "/bbb-scraper" },
    { label: "Yellow Pages Scraper", href: "/yellow-pages-scraper" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  services: services.map((s) => ({ label: s.title, href: "/services" })),
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;
