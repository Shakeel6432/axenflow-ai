import Link from "next/link";
import { Mail, MessageSquare, CheckCircle2, ExternalLink, Clock } from "lucide-react";
import { contactGuidelines, getProjectInquiryMailtoLink, siteConfig } from "@/lib/constants";
import { EmailInquiryButton } from "@/components/contact/EmailInquiryButton";
import { cn } from "@/lib/utils";

const mailtoLink = getProjectInquiryMailtoLink();

type ContactGuidelinesProps = {
  compact?: boolean;
  /** Single-column stack for contact page sidebar */
  sidebar?: boolean;
};

export function ContactGuidelines({ compact = false, sidebar = false }: ContactGuidelinesProps) {
  return (
    <div className={cn(compact || sidebar ? "space-y-3" : "space-y-8")}>
      <div className={cn("grid gap-3", sidebar ? "grid-cols-1" : "gap-6 lg:grid-cols-2")}>
        <div className={cn("glass-card rounded-2xl", sidebar ? "p-4" : "p-7 sm:p-8")}>
          <div
            className={cn(
              "mb-4 flex items-center justify-center rounded-xl",
              sidebar ? "mb-2.5 h-8 w-8" : "mb-5 h-12 w-12"
            )}
            style={{ background: "rgba(99, 102, 241, 0.12)" }}
          >
            <Mail size={sidebar ? 15 : 22} className="text-indigo-500" />
          </div>
          <h3
            className={cn("font-[var(--font-space)] font-bold", sidebar ? "text-base" : "text-xl")}
            style={{ color: "var(--c-heading)" }}
          >
            Contact by Email
          </h3>
          <p
            className={cn("mt-2 leading-relaxed", sidebar ? "text-xs" : "mt-3 text-sm")}
            style={{ color: "var(--c-text-dim)" }}
          >
            {sidebar
              ? "Email your project details and we will reply with next steps."
              : "Email us your project details and we will review your requirements, reply with questions if needed, and discuss the best solution for your business."}
          </p>

          <div
            className={cn("mt-3 rounded-xl p-3", !sidebar && "mt-5 p-4")}
            style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--c-text-muted)" }}>
              Send your email to
            </p>
            <a
              href={mailtoLink}
              className={cn(
                "mt-1 block cursor-pointer font-semibold text-indigo-500 transition hover:text-teal-500",
                sidebar ? "truncate text-sm" : "text-base"
              )}
            >
              {siteConfig.email}
            </a>
          </div>

          {!sidebar && (
            <ul className="mt-5 space-y-2.5">
              {contactGuidelines.emailDetails.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--c-text-dim)" }}>
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-500" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className={cn("relative z-10 flex flex-wrap items-center gap-2.5", sidebar ? "mt-3" : "mt-6 gap-4")}>
            <EmailInquiryButton className={sidebar ? "px-3.5 py-2 text-sm sm:w-auto" : undefined} />
            <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--c-text-muted)" }}>
              <Clock size={13} /> {contactGuidelines.responseTime}
            </span>
          </div>
        </div>

        <div className={cn("glass-card rounded-2xl", sidebar ? "p-4" : "p-7 sm:p-8")}>
          <div
            className={cn(
              "mb-4 flex items-center justify-center rounded-xl",
              sidebar ? "mb-2.5 h-8 w-8" : "mb-5 h-12 w-12"
            )}
            style={{ background: "rgba(20, 184, 166, 0.12)" }}
          >
            <MessageSquare size={sidebar ? 15 : 22} className="text-teal-500" />
          </div>
          <h3
            className={cn("font-[var(--font-space)] font-bold", sidebar ? "text-base" : "text-xl")}
            style={{ color: "var(--c-heading)" }}
          >
            Contact on Fiverr
          </h3>
          <p
            className={cn("mt-2 leading-relaxed", sidebar ? "text-xs" : "mt-3 text-sm")}
            style={{ color: "var(--c-text-dim)" }}
          >
            {sidebar
              ? "Chat on Fiverr, discuss scope, then place an order securely."
              : "Prefer working through Fiverr? Visit our profile, share your requirements in chat, and discuss your project before placing an order."}
          </p>

          {sidebar && (
            <div
              className="mt-3 rounded-xl p-3"
              style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--c-text-muted)" }}>
                Fiverr profile
              </p>
              <a
                href={siteConfig.fiverrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block truncate text-sm font-semibold text-teal-500 transition hover:text-indigo-500"
              >
                {siteConfig.fiverrUrl.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </div>
          )}

          {!sidebar && (
            <>
              <div
                className="mt-5 rounded-xl p-4"
                style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
              >
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--c-text-muted)" }}>
                  Best for
                </p>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--c-heading)" }}>
                  Quick discussions, package-based work, and secure payments through Fiverr.
                </p>
              </div>

              <ol className="mt-5 space-y-3">
                {contactGuidelines.fiverrSteps.map((step, index) => (
                  <li key={step} className="flex items-start gap-3 text-sm" style={{ color: "var(--c-text-dim)" }}>
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: "rgba(20, 184, 166, 0.12)", color: "#14b8a6" }}
                    >
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </>
          )}

          <div className={sidebar ? "mt-3" : "mt-6"}>
            <Link
              href={siteConfig.fiverrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5",
                sidebar ? "px-3.5 py-2" : "px-6 py-3"
              )}
              style={{
                background: "rgba(20, 184, 166, 0.1)",
                border: "1px solid rgba(20, 184, 166, 0.25)",
                color: "#14b8a6",
              }}
            >
              Visit Fiverr Profile <ExternalLink size={sidebar ? 14 : 16} />
            </Link>
          </div>
        </div>
      </div>

      {!compact && !sidebar && (
        <div className="glass-card rounded-2xl p-7 sm:p-8">
          <h3 className="font-[var(--font-space)] text-lg font-bold" style={{ color: "var(--c-heading)" }}>
            What Happens Next?
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { step: "1", title: "Share Details", text: "Send your project info by email or Fiverr message." },
              { step: "2", title: "We Discuss", text: "We review your needs, ask questions, and suggest the right approach." },
              { step: "3", title: "Start Building", text: "Once scope and timeline are clear, we begin your automation project." },
            ].map(({ step, title, text }) => (
              <div
                key={step}
                className="rounded-xl p-4"
                style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Step {step}</span>
                <p className="mt-2 font-semibold" style={{ color: "var(--c-heading)" }}>{title}</p>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
