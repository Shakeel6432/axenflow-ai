import Link from "next/link";
import { Mail } from "lucide-react";
import { footerLinks, siteConfig } from "@/lib/constants";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";

/** Link footer — sits below the fold on short pages (scroll to see). */
export function Footer() {
  return (
    <footer
      className="relative"
      style={{ borderTop: "1px solid var(--c-border)", background: "transparent" }}
    >
      <Container className="py-10 lg:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="footer" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed" style={{ color: "var(--c-text-muted)" }}>
              {siteConfig.description}
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 text-sm text-indigo-500 transition hover:text-teal-500"
              >
                <Mail size={14} /> {siteConfig.email}
              </a>
              <a
                href="https://www.fiverr.com/shakeel644"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-teal-500 transition hover:text-teal-400"
                style={{
                  background: "rgba(20,184,166,0.08)",
                  border: "1px solid rgba(20,184,166,0.15)",
                }}
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
                  <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1" fill="none" />
                  <text x="8" y="11.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">
                    F
                  </text>
                </svg>
                Hire us on Fiverr
              </a>
            </div>
          </div>

          {[
            { title: "Quick Links", items: footerLinks.quick },
            { title: "Services", items: footerLinks.services.slice(0, 5) },
            { title: "Legal", items: footerLinks.legal },
          ].map((col) => (
            <div key={col.title}>
              <h4
                className="mb-4 text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--c-heading)" }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.items.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition hover:text-indigo-500"
                      style={{ color: "var(--c-text-muted)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 flex flex-col items-center justify-between gap-3 pt-8 sm:flex-row"
          style={{ borderTop: "1px solid var(--c-border)" }}
        >
          <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
