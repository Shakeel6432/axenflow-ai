"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon, ArrowRight } from "lucide-react";
import { navLinks } from "@/lib/constants";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 backdrop-blur-2xl transition-shadow duration-300"
      style={{
        background: "var(--c-nav)",
        borderBottom: scrolled ? "1px solid var(--c-border)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
      }}
    >
      <Container>
        <div className="flex h-20 items-center justify-between lg:h-[5.5rem]">
          <Logo size="nav" />

          <nav className="hidden items-center lg:flex">
            <div className="flex items-center gap-0.5 rounded-2xl px-2 py-1.5" style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}>
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative rounded-xl px-5 py-2 text-sm font-medium transition-all duration-300",
                      active && "shadow-sm"
                    )}
                    style={{
                      color: active ? "var(--c-heading)" : "var(--c-text-dim)",
                      background: active ? "var(--c-surface-solid)" : undefined,
                      border: active ? "1px solid var(--c-border)" : "1px solid transparent",
                    }}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-[3px] h-[2px] rounded-full bg-gradient-to-r from-indigo-500 to-teal-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-105"
              style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-text-dim)" }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <a
              href="https://www.fiverr.com/shakeel644"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
              style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
            >
              Fiverr Profile
            </a>

            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)" }}
            >
              Get Started
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all"
              style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-text-dim)" }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all"
              style={{ border: "1px solid var(--c-border)", color: "var(--c-text-dim)", background: "var(--c-hover-bg)" }}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </Container>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 lg:hidden",
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div
          className="backdrop-blur-2xl"
          style={{ borderTop: "1px solid var(--c-border)", background: "var(--c-nav-mob)" }}
        >
          <Container className="py-5">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
                    style={{
                      color: active ? "var(--c-heading)" : "var(--c-text-dim)",
                      background: active ? "var(--c-active-bg)" : undefined,
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-3 flex flex-col gap-2 pt-4" style={{ borderTop: "1px solid var(--c-border)" }}>
                <a
                  href="https://www.fiverr.com/shakeel644"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
                  style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-heading)" }}
                >
                  Fiverr Profile
                </a>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
                >
                  Get Started <ArrowRight size={14} />
                </Link>
              </div>
            </nav>
          </Container>
        </div>
      </div>
    </header>
  );
}
