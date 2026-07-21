export const siteConfig = {
  name: "AxenFlow AI",
  tagline: "AI Automation Agency | Bots, Scraping & Workflows",
  description:
    "We build AI bots, web scrapers, AI WhatsApp agents, and workflow systems that run your business on autopilot. 86+ projects delivered worldwide.",
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
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const services = [
  {
    title: "AI Automation",
    description:
      "Connect your tools, cut out repetitive tasks, and let your operations run around the clock without manual effort.",
    icon: "/images/v1/icon-s1.svg",
    image: "/images/service/img1.png",
  },
  {
    title: "AI WhatsApp Agents",
    description:
      "Deploy AI WhatsApp agents that handle leads, answer questions, book appointments, and follow up with customers automatically.",
    icon: "/images/v1/icon-s2.svg",
    image: "/images/service/img2.png",
  },
  {
    title: "AI Email Agents",
    description:
      "Stop wasting hours on emails. Our AI reads, sorts, replies, and forwards messages so you don't have to.",
    icon: "/images/v1/icon-s3.svg",
    image: "/images/service/img3.png",
  },
  {
    title: "Web Scraping",
    description:
      "Get the data you need like competitor prices, leads, and market trends, pulled automatically and delivered to your tools.",
    icon: "/images/v1/icon-s4.svg",
    image: "/images/portfolio/img1.png",
  },
  {
    title: "Workflow Automation",
    description:
      "We wire up your CRM, spreadsheets, Slack, and APIs using n8n or Make so everything talks to each other.",
    icon: "/images/v2/Icon1.svg",
    image: "/images/v2/Services.png",
  },
  {
    title: "Custom AI Solutions",
    description:
      "Need something specific? We build custom chatbots, internal AI tools, and automated pipelines for your exact use case.",
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
  "OpenAI",
  "Claude",
  "n8n",
  "Make",
  "Python",
  "Node.js",
  "WhatsApp API",
  "Slack",
  "Google Sheets",
  "Airtable",
] as const;

export const trustedPartners = [
  { name: "OpenAI", abbr: "AI" },
  { name: "Claude", abbr: "CL" },
  { name: "n8n", abbr: "n8" },
  { name: "Make", abbr: "Mk" },
  { name: "Python", abbr: "Py" },
  { name: "Node.js", abbr: "JS" },
  { name: "WhatsApp", abbr: "WA" },
  { name: "Slack", abbr: "Sl" },
] as const;

export const processSteps = [
  {
    step: "01",
    title: "Discovery",
    description: "We jump on a call, understand your workflows, and figure out where automation will save you the most time.",
  },
  {
    step: "02",
    title: "Strategy",
    description: "You get a clear plan with what we'll build, which tools we'll use, and how long it'll take.",
  },
  {
    step: "03",
    title: "Build",
    description: "We build and test everything, connect it to your existing tools, and make sure it works properly.",
  },
  {
    step: "04",
    title: "Launch & Support",
    description: "We go live, keep an eye on things, and fix anything that comes up. You're never left hanging.",
  },
] as const;

export const whyChooseUs = [
  {
    title: "86+ Projects Done",
    description: "Real businesses, real results. We've delivered automation for clients across 15+ countries.",
    icon: "/images/about-us/icon1.svg",
  },
  {
    title: "Built to Last",
    description: "No quick hacks or demos. We ship systems that actually work in production, day after day.",
    icon: "/images/about-us/icon2.svg",
  },
  {
    title: "Quick Delivery",
    description: "Most projects go live in under a week. Complex builds take 2–3 weeks max.",
    icon: "/images/about-us/icon3.svg",
  },
  {
    title: "One Team, Full Stack",
    description: "Scraping, bots, email AI, workflows. You don't need to hire five different freelancers.",
    icon: "/images/v3/icon2.svg",
  },
] as const;

export const portfolioItems = [
  {
    title: "B2B Lead Scraper",
    category: "Web Scraping",
    description: "Built a scraper that pulls 500+ verified leads per week from LinkedIn and Google Maps for a sales team.",
    image: "/images/portfolio/img1.png",
  },
  {
    title: "WhatsApp Booking Bot",
    category: "AI WhatsApp Agents",
    description: "A clinic in Dubai uses this AI WhatsApp agent to handle appointment bookings, reminders, and patient follow-ups.",
    image: "/images/portfolio/img2.png",
  },
  {
    title: "Smart Email Sorter",
    category: "AI Email Agents",
    description: "An e-commerce brand gets 200+ emails/day. Our AI sorts, replies to common ones, and flags urgent issues.",
    image: "/images/portfolio/img3.png",
  },
  {
    title: "CRM Sync System",
    category: "Workflow Automation",
    description: "Connected HubSpot, Google Sheets, and Slack for a real estate agency so nothing falls through the cracks.",
    image: "/images/portfolio/img4.png",
  },
  {
    title: "Price Tracker",
    category: "Web Scraping",
    description: "Monitors competitor prices across 50+ product categories daily and alerts the team when prices change.",
    image: "/images/portfolio/img5.png",
  },
  {
    title: "Internal AI Assistant",
    category: "Custom AI Solutions",
    description: "A marketing agency uses this tool to generate reports, draft social posts, and summarize meeting notes.",
    image: "/images/portfolio/img6.png",
  },
] as const;

export const faqs = [
  {
    question: "What exactly do you automate?",
    answer:
      "Pretty much anything repetitive like WhatsApp replies, email handling, data scraping, CRM updates, report generation, and lead follow-ups. If it can be automated, we'll find a way.",
  },
  {
    question: "How fast can you deliver?",
    answer:
      "Simple bots and scrapers are done in 2–5 days. Bigger projects with multiple integrations usually take 1–3 weeks. We'll give you a clear timeline before we start.",
  },
  {
    question: "Do you work with clients worldwide?",
    answer:
      "Yes — most of our clients are international. We've worked with businesses in the US, UK, UAE, Australia, and across Europe. Everything is done remotely.",
  },
  {
    question: "What tools do you work with?",
    answer:
      "OpenAI, Claude, n8n, Make.com, Python, Node.js, WhatsApp Business API, Slack, Google Sheets, Airtable, and more. We pick whatever fits your setup best.",
  },
  {
    question: "What if something breaks after launch?",
    answer:
      "We don't disappear after delivery. Every project comes with post-launch support. If something breaks or needs a tweak, we handle it.",
  },
  {
    question: "How do I start a project?",
    answer:
      "Just fill out the form on this page or drop us an email. Tell us what you need, and we'll get back to you within 24 hours with a plan and quote.",
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
    { label: "Email Validator", href: "/tools/email-validator" },
    { label: "Phone Validator", href: "/tools/phone-validator" },
    { label: "BBB Scraper", href: "/bbb-scraper" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  services: services.map((s) => ({ label: s.title, href: "/services" })),
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;
