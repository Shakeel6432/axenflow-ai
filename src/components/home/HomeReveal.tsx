"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type HomeRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger children with the same rise motion */
  stagger?: boolean;
};

function isInView(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh * 0.92 && rect.bottom > 48;
}

/**
 * One homepage motion: fade + rise when the block enters the viewport.
 * Adds `.home-shown` so CSS can run the shared `home-rise` animation.
 */
export function HomeReveal({ children, className, stagger = false }: HomeRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => setShown(true);

    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }

    // Already on screen (e.g. tools under hero): hide one frame, then rise
    if (isInView(el)) {
      setArmed(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(reveal);
      });
      return;
    }

    // Off-screen: hide until scrolled into view
    setArmed(true);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        stagger ? "home-stagger" : "home-in-view",
        armed && "home-armed",
        shown && "home-shown",
        className
      )}
    >
      {children}
    </div>
  );
}
