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

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      className={cn(
        "nav-header fixed inset-x-0 top-0 z-50 overflow-hidden backdrop-blur-xl",
        scrolled && "nav-header-scrolled"
      )}
      style={{
        borderBottom: scrolled ? "1px solid var(--c-nav-border)" : "1px solid transparent",
        boxShadow: scrolled ? "var(--c-nav-shadow)" : "none",
      }}
    >
      <span aria-hidden className="nav-bg-anim pointer-events-none absolute inset-0 -z-10" />
      <span aria-hidden className="nav-bg-shimmer pointer-events-none absolute inset-0 -z-10" />
      <span aria-hidden className="nav-bg-glow pointer-events-none absolute inset-0 -z-10" />
      <span aria-hidden className="nav-accent-line pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px" />

      <Container className="relative z-10">
        <div className="flex h-16 items-center justify-between lg:h-[4.25rem]">
          <Logo size="nav" />

          <nav className="hidden items-center lg:flex">
            <div className="nav-pill relative flex items-center gap-0.5 rounded-full px-1.5 py-1">
              <span aria-hidden className="nav-pill-shine pointer-events-none absolute inset-0 rounded-full" />
              {navLinks.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "nav-link relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300",
                      active ? "text-[var(--c-heading)]" : "text-[var(--c-text-dim)] hover:text-[var(--c-heading)]"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="nav-active-pill absolute inset-0 -z-10 rounded-full"
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
                        className="absolute inset-x-3 -bottom-[2px] h-[2px] rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-indigo-400"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            <ThemeToggleButton theme={theme} onToggle={toggle} />
            <NavbarAuth />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggleButton theme={theme} onToggle={toggle} />
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              className="nav-icon-btn flex h-9 w-9 items-center justify-center rounded-xl"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                  className="inline-flex"
                >
                  {open ? <X size={18} /> : <Menu size={18} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <div className="nav-mobile-panel backdrop-blur-2xl">
              <Container className="py-5">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link, i) => {
                    const active = isActivePath(pathname, link.href);
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.035 * i, duration: 0.28 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "nav-mobile-link flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                            active && "nav-mobile-link-active"
                          )}
                          style={{
                            color: active ? "var(--c-heading)" : "var(--c-text-dim)",
                          }}
                        >
                          <span>{link.label}</span>
                          {active && (
                            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-teal-400" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28, duration: 0.25 }}
                    className="mt-3 flex flex-col gap-2 pt-4"
                    style={{ borderTop: "1px solid var(--c-border)" }}
                  >
                    <NavbarAuth mobile />
                  </motion.div>
                </nav>
              </Container>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function ThemeToggleButton({
  theme,
  onToggle,
}: {
  theme: string;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94 }}
      onClick={onToggle}
      className="nav-icon-btn flex h-9 w-9 items-center justify-center rounded-xl"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -40, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 40, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
