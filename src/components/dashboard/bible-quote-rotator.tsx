"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { BIBLE_QUOTES } from "@/data/bible-quotes";
import { cn } from "@/lib/utils";

const ROTATE_MS = 14_000;

export function BibleQuoteRotator() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % BIBLE_QUOTES.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + BIBLE_QUOTES.length) % BIBLE_QUOTES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, next]);

  const quote = BIBLE_QUOTES[index];

  return (
    <section
      className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-background to-background px-5 py-5 shadow-sm md:px-7 md:py-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Daily scripture"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              Scripture
            </p>
            <p className="text-[11px] text-muted-foreground">
              {BIBLE_QUOTES.length} verses · auto-advances · hover to pause
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div aria-live="polite" aria-atomic="true">
            <blockquote
              key={index}
              className={cn(
                "text-base leading-relaxed text-foreground md:text-lg",
                "animate-in fade-in slide-in-from-bottom-2 duration-500",
              )}
            >
              <span className="font-serif italic">
                &ldquo;{quote.text}&rdquo;
              </span>
              <footer className="sr-only">{quote.reference}</footer>
            </blockquote>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/10 pt-3">
            <cite className="not-italic text-sm font-bold text-primary">
              {quote.reference}
            </cite>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prev}
                className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Previous verse"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Next verse"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="ml-2 text-[10px] font-bold tabular-nums text-muted-foreground">
                {index + 1} / {BIBLE_QUOTES.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
