"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { navLinks } from "@/lib/constants";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { useTheme } from "@/components/ThemeProvider";
import { NavbarAuth } from "@/components/auth/NavbarAuth";
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
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      className="nav-header fixed inset-x-0 top-0 z-50 overflow-hidden backdrop-blur-xl"
      style={{
        borderBottom: "1px solid var(--c-nav-border)",
        boxShadow: scrolled ? "var(--c-nav-shadow)" : "none",
      }}
    >
      {/* Animated background: floating orbs + light sweep */}
      <span aria-hidden className="nav-bg-anim pointer-events-none absolute inset-0 -z-10" />
      <span aria-hidden className="nav-bg-shimmer pointer-events-none absolute inset-0 -z-10" />
      <span aria-hidden className="nav-accent-line pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px" />

      <Container className="relative z-10">
        <div className="flex h-16 items-center justify-between lg:h-[4.25rem]">
          <Logo size="nav" />

          <nav className="hidden items-center lg:flex">
            <div
              className="relative flex items-center gap-0.5 rounded-full px-1.5 py-1"
              style={{
                background: "var(--c-nav-pill)",
                border: "1px solid var(--c-nav-pill-border)",
              }}
            >
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300",
                      active ? "text-[var(--c-heading)]" : "text-[var(--c-text-dim)] hover:text-[var(--c-heading)]"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 -z-10 rounded-full"
                        style={{
                          background: "var(--c-surface-solid)",
                          border: "1px solid var(--c-border)",
                          boxShadow: "0 2px 10px rgba(99,102,241,0.15)",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <motion.span
                      className="relative inline-block"
                      whileHover={{ y: -1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    >
                      {link.label}
                    </motion.span>
                    {active && (
                      <motion.span
                        layoutId="nav-active-underline"
                        className="absolute inset-x-3 -bottom-[2px] h-[2px] rounded-full bg-gradient-to-r from-indigo-500 to-teal-400"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            <button
              type="button"
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20"
              style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-text-dim)" }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <NavbarAuth />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20"
              style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-text-dim)" }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-all"
              style={{ border: "1px solid var(--c-border)", color: "var(--c-text-dim)", background: "var(--c-hover-bg)" }}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <div
              className="backdrop-blur-2xl"
              style={{ borderTop: "1px solid var(--c-border)", background: "var(--c-nav-mob)" }}
            >
              <Container className="py-5">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link, i) => {
                    const active = pathname === link.href;
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i, duration: 0.25 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
                          style={{
                            color: active ? "var(--c-heading)" : "var(--c-text-dim)",
                            background: active ? "var(--c-active-bg)" : undefined,
                          }}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                  <div className="mt-3 flex flex-col gap-2 pt-4" style={{ borderTop: "1px solid var(--c-border)" }}>
                    <NavbarAuth mobile />
                  </div>
                </nav>
              </Container>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
