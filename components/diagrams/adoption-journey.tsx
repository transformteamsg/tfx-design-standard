"use client";

/* The adoption journey: a path you travel once, left to right, five
   milestones from reading this page to your first designed screen. At sm:+
   it renders as a horizontal milestone path — one baseline, numbered dots,
   an arrowhead because the path goes somewhere. Below sm: the same content
   is a compact vertical list. In view (once), the baseline draws left→right
   and milestones pop in sequence as the line reaches them; reduced motion
   renders everything complete at once, and the numbering, labels, and
   caption carry the full order statically (MOT-3). Tokens only (TOK-1);
   nothing is interactive, so nothing looks clickable. */

import { motion } from "motion/react";
import { DUR, EASE_OUT, STAGGER } from "@/lib/motion";
import { FlowRow, useFlowReveal } from "./flow";

const milestones = [
  { label: "Read this page", note: "understand what you are adopting" },
  { label: "Decide your brand basics", note: "primary colour · typefaces · domain" },
  { label: "Install the plugin", note: "two lines in Claude Code, once" },
  { label: "Run the wizard", note: "it asks, you answer", wizard: true },
  { label: "Design your first screen", note: "through the design loop" },
];

const questions = [
  "product name → domain → audiences",
  "primary colour → typefaces → stack",
  "illustration → voice",
];

function WizardQuestions({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {questions.map((q) => (
        <li key={q} className="text-[12px] leading-snug text-muted-foreground">
          {q}
        </li>
      ))}
      <li className="text-[12px] italic leading-snug text-muted-foreground">
        skip any non-essential question for the default
      </li>
    </ul>
  );
}

export function AdoptionJourney() {
  const { ref, reduced, show } = useFlowReveal<HTMLElement>();

  /* Milestones pop with a 2px lift, staggered along the drawing line. */
  const pop = (i: number) => ({
    initial: reduced ? (false as const) : { opacity: 0, y: 2 },
    animate: reduced || show ? { opacity: 1, y: 0 } : { opacity: 0, y: 2 },
    transition: reduced
      ? { duration: 0 }
      : { duration: DUR.base, ease: EASE_OUT, delay: i * STAGGER },
  });

  return (
    <figure ref={ref} className="my-8 w-full max-w-[680px]">
      {/* sm:+ — the horizontal path. */}
      <div className="relative hidden sm:block">
        {/* The path itself: a baseline that draws once, into an arrowhead —
            the journey ends at your first screen, not back where it began. */}
        <div aria-hidden className="absolute inset-x-0 top-3 flex items-center pl-[10%]">
          <motion.span
            className="h-px flex-1 origin-left bg-(--border-strong)"
            initial={reduced ? false : { scaleX: 0 }}
            animate={reduced || show ? { scaleX: 1 } : { scaleX: 0 }}
            transition={reduced ? { duration: 0 } : { duration: DUR.story, ease: EASE_OUT }}
          />
          <motion.span
            className="h-0 w-0 shrink-0 border-y-[6px] border-l-[8px] border-y-transparent"
            style={{ borderLeftColor: "var(--border-strong)" }}
            initial={reduced ? false : { opacity: 0 }}
            animate={reduced || show ? { opacity: 1 } : { opacity: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: DUR.base, ease: EASE_OUT, delay: DUR.story * 0.7 }
            }
          />
        </div>
        <ol className="relative m-0 grid list-none grid-cols-5 p-0 text-foreground">
          {milestones.map((m, i) => (
            <motion.li key={m.label} className="px-1 text-center" {...pop(i)}>
              <span
                aria-hidden
                className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-surface"
              >
                {i + 1}
              </span>
              <span className="mt-1.5 block text-[12px] font-medium leading-snug">{m.label}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                {m.note}
              </span>
              {m.wizard && (
                <WizardQuestions className="mx-auto mt-1.5 w-fit list-none space-y-0.5 p-0 text-left" />
              )}
            </motion.li>
          ))}
        </ol>
      </div>

      {/* Below sm: — the same journey as a compact vertical list. */}
      <ol className="m-0 list-none p-0 text-foreground sm:hidden">
        {milestones.map((m, i) => (
          <FlowRow
            key={m.label}
            index={i}
            reduced={reduced}
            show={show}
            className="flex items-start gap-3 py-1.5"
          >
            <span
              aria-hidden
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-surface"
            >
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-[12px] font-medium leading-snug">{m.label}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                {m.note}
              </span>
              {m.wizard && <WizardQuestions className="mt-1 list-none space-y-0.5 p-0" />}
            </span>
          </FlowRow>
        ))}
      </ol>

      <figcaption className="mt-3 max-w-[52ch] text-[12px] leading-[1.6] text-muted-foreground">
        The wizard asks these in order and writes your product&apos;s <code>DESIGN.md</code> for
        you. Answer only what you know; skip the rest.
      </figcaption>
    </figure>
  );
}
