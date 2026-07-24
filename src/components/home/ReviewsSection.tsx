"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { createPortal } from "react-dom";
import { clientReviews, type ClientReview } from "@/lib/reviews";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const AVATAR_COLORS = [
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#0ea5e9",
];

const FEATURED_PREVIEW_CHARS = 180;
const CARD_PREVIEW_CHARS = 110;

function initials(name: string) {
  return name.charAt(0).toUpperCase();
}

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * 17) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function Stars({ size = 16 }: { size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className="fill-amber-400 text-amber-400"
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

function Avatar({ review, size = 56 }: { review: ClientReview; size?: number }) {
  const [broken, setBroken] = useState(false);
  const bg = colorFor(review.name);

  if (review.avatar && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={review.avatar}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-white/80 shadow-md"
        style={{ width: size, height: size, flexShrink: 0 }}
        loading="lazy"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-md ring-2 ring-white/80"
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: size * 0.38,
        fontFamily: "var(--font-space)",
      }}
      aria-hidden
    >
      {initials(review.name)}
    </div>
  );
}

function ReviewModal({
  review,
  onClose,
}: {
  review: ClientReview;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <button
          type="button"
          aria-label="Close review"
          className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          onClick={onClose}
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card relative z-10 flex max-h-[min(88vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-2xl"
            style={{ background: "var(--c-accent, #6366f1)" }}
          />

          <div className="relative mb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar review={review} size={56} />
              <div className="min-w-0">
                <p
                  id="review-modal-title"
                  className="font-[var(--font-space)] text-base font-bold"
                  style={{ color: "var(--c-heading)" }}
                >
                  {review.name}
                </p>
                <p className="text-sm" style={{ color: "var(--c-text-dim)" }}>
                  {review.country}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition hover:opacity-80"
              style={{
                borderColor: "color-mix(in srgb, var(--c-heading) 12%, transparent)",
                background: "var(--c-bg)",
                color: "var(--c-heading)",
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div className="relative mb-4 flex items-center gap-2">
            <Stars size={16} />
            {review.repeat && (
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  background: "color-mix(in srgb, var(--c-accent, #6366f1) 12%, transparent)",
                  color: "var(--c-accent, #6366f1)",
                }}
              >
                Repeat client
              </span>
            )}
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto pr-1">
            <p
              className="font-[var(--font-space)] text-base leading-relaxed sm:text-lg"
              style={{ color: "var(--c-heading)" }}
            >
              {review.text}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function ReviewCard({
  review,
  featured = false,
  onOpen,
}: {
  review: ClientReview;
  featured?: boolean;
  onOpen: (review: ClientReview) => void;
}) {
  const previewChars = featured ? FEATURED_PREVIEW_CHARS : CARD_PREVIEW_CHARS;
  const preview =
    review.text.length > previewChars
      ? `${review.text.slice(0, previewChars).trimEnd()}…`
      : review.text;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(review)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(review);
        }
      }}
      aria-label={`Read full feedback from ${review.name}`}
      className={
        featured
          ? "glass-card relative flex min-h-[280px] cursor-pointer flex-col overflow-hidden rounded-2xl p-7 transition hover:brightness-[1.02] sm:min-h-[300px] sm:p-9"
          : "glass-card flex h-[260px] w-[280px] shrink-0 cursor-pointer flex-col rounded-2xl p-5 opacity-90 transition hover:opacity-100 hover:brightness-[1.02]"
      }
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-2xl"
        style={{ background: "var(--c-accent, #6366f1)" }}
      />
      <div className="relative flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex shrink-0 items-start justify-between gap-3">
          <Stars size={featured ? 18 : 14} />
          {review.repeat && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                background: "color-mix(in srgb, var(--c-accent, #6366f1) 12%, transparent)",
                color: "var(--c-accent, #6366f1)",
              }}
            >
              Repeat client
            </span>
          )}
        </div>

        <div
          className={
            featured
              ? "flex min-h-[7.5rem] flex-1 flex-col sm:min-h-[8.25rem]"
              : "flex min-h-[5.5rem] flex-1 flex-col"
          }
        >
          <p
            className={
              featured
                ? "font-[var(--font-space)] text-base leading-relaxed sm:text-lg"
                : "text-sm leading-relaxed"
            }
            style={{ color: "var(--c-heading)" }}
          >
            {preview}
          </p>
        </div>

        <div className="mt-auto flex shrink-0 items-center gap-3 pt-2">
          <Avatar review={review} size={featured ? 52 : 40} />
          <div className="min-w-0">
            <p
              className="truncate font-[var(--font-space)] text-sm font-bold"
              style={{ color: "var(--c-heading)" }}
            >
              {review.name}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--c-text-dim)" }}>
              {review.country}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function MarqueeRow({
  items,
  direction = "left",
  duration = 55,
  onOpen,
}: {
  items: ClientReview[];
  direction?: "left" | "right";
  duration?: number;
  onOpen: (review: ClientReview) => void;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-2">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24"
        style={{
          background: "linear-gradient(to right, var(--c-bg-alt), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24"
        style={{
          background: "linear-gradient(to left, var(--c-bg-alt), transparent)",
        }}
      />
      <motion.div
        className="flex w-max gap-4"
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((r, i) => (
          <ReviewCard key={`${r.id}-m-${i}`} review={r} onOpen={onOpen} />
        ))}
      </motion.div>
    </div>
  );
}

export function ReviewsSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const [activeReview, setActiveReview] = useState<ClientReview | null>(null);
  const total = clientReviews.length;

  const go = useCallback(
    (next: number, d: number) => {
      setDir(d);
      setIndex(((next % total) + total) % total);
    },
    [total]
  );

  const openReview = useCallback((review: ClientReview) => {
    setActiveReview(review);
    setPaused(true);
  }, []);

  const closeReview = useCallback(() => {
    setActiveReview(null);
  }, []);

  useEffect(() => {
    if (paused || activeReview) return;
    const t = setInterval(() => go(index + 1, 1), 5500);
    return () => clearInterval(t);
  }, [index, paused, activeReview, go]);

  const current = clientReviews[index];
  const half = Math.ceil(clientReviews.length / 2);
  const rowA = clientReviews.slice(0, half);
  const rowB = clientReviews.slice(half);

  return (
    <Section id="reviews" style={{ background: "var(--c-bg-alt)" }} divider>
      <SectionHeading
        title="What Clients Say"
        description="Client testimonials on web scraping, data automation, lead generation, and custom software delivery with AxenFlow AI."
        className="mb-10"
      />

      <div
        className="relative mx-auto mb-12 max-w-2xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          if (!activeReview) setPaused(false);
        }}
      >
        <div className="relative">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={current.id}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: dir * -40, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <ReviewCard review={current} featured onOpen={openReview} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous review"
            onClick={() => go(index - 1, -1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:scale-105"
            style={{
              borderColor: "color-mix(in srgb, var(--c-heading) 12%, transparent)",
              background: "var(--c-bg)",
              color: "var(--c-heading)",
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1.5">
            {clientReviews.map((r, i) => (
              <button
                key={r.id}
                type="button"
                aria-label={`Show client feedback ${i + 1}`}
                onClick={() => go(i, i > index ? 1 : -1)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 22 : 6,
                  background:
                    i === index
                      ? "var(--c-accent, #6366f1)"
                      : "color-mix(in srgb, var(--c-heading) 18%, transparent)",
                }}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next review"
            onClick={() => go(index + 1, 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:scale-105"
            style={{
              borderColor: "color-mix(in srgb, var(--c-heading) 12%, transparent)",
              background: "var(--c-bg)",
              color: "var(--c-heading)",
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <MarqueeRow items={rowA} direction="left" duration={50} onOpen={openReview} />
        <MarqueeRow items={rowB} direction="right" duration={58} onOpen={openReview} />
      </div>

      {activeReview && (
        <ReviewModal review={activeReview} onClose={closeReview} />
      )}
    </Section>
  );
}
