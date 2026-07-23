import Link from "next/link";

const LINKS = [
  { href: "/leads", label: "Lead Finder" },
  { href: "/tools/email-validator", label: "Email Validator" },
  { href: "/tools/ai-outreach", label: "AI Outreach" },
  { href: "/tools/phone-validator", label: "Phone Validator" },
  { href: "/blog", label: "Blog" },
  { href: "/tools", label: "All tools" },
] as const;

type ToolHubLinksProps = {
  /** Hide the current page link */
  current?: string;
};

export function ToolHubLinks({ current }: ToolHubLinksProps) {
  const links = LINKS.filter((l) => l.href !== current);

  return (
    <div className="mb-6 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="text-indigo-500 hover:text-teal-500">
          {link.label}
        </Link>
      ))}
    </div>
  );
}
