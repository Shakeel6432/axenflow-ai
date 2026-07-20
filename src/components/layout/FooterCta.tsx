import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

/** Project CTA in page flow — shows on first screen, scrolls away with the page. */
export function FooterCta() {
  return (
    <div className="relative shrink-0" style={{ borderTop: "1px solid var(--c-border)" }}>
      <Container className="pt-3 pb-4 sm:pt-4 sm:pb-5">
        <div className="glass-card relative overflow-hidden rounded-2xl p-4 sm:p-5">
          <div className="relative flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <h3
                className="font-[var(--font-space)] text-base font-bold sm:text-lg"
                style={{ color: "var(--c-heading)" }}
              >
                Got a project in mind?
              </h3>
              <p className="mt-0.5 text-sm" style={{ color: "var(--c-text-dim)" }}>
                Tell us what you need and we&apos;ll handle the rest.
              </p>
            </div>
            <Button href="/contact" size="lg" variant="green" className="w-full shrink-0 sm:w-auto">
              Get a Free Quote <ArrowUpRight size={16} />
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
