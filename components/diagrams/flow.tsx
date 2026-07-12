"use client";

/* Shared vertical-flow primitive for the explanatory diagrams. HTML, not SVG:
   text renders at true UI sizes, colours come straight from tokens (TOK-1),
   and connectors are plain elements that cannot mis-render. Motion is one
   short staggered reveal per row (--motion-base, ease-out — within MOT-1)
   that fires once on scroll; prefers-reduced-motion shows everything
   immediately. Values come from the motion token mirror (MOT-2). */

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { DUR, EASE_OUT, STAGGER } from "@/lib/motion";

/* Kept as an alias so existing importers still compile. */
export const FLOW_EASE = EASE_OUT;

export function useFlowReveal<T extends Element = HTMLOListElement>() {
  const ref = useRef<T | null>(null);
  // === true: hydration null must not skip the animation
  const reduced = useReducedMotion() === true;
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px", amount: 0.2 });
  return { ref, reduced, show: reduced || inView };
}

type RevealProps = {
  index: number;
  reduced: boolean;
  show: boolean;
  children: ReactNode;
  className?: string;
};

function revealMotion({ index, reduced, show }: Pick<RevealProps, "index" | "reduced" | "show">) {
  return {
    initial: reduced ? (false as const) : { opacity: 0, y: 8 },
    animate: show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    transition: reduced
      ? { duration: 0 }
      : { duration: DUR.base, ease: EASE_OUT, delay: index * STAGGER },
  };
}

export function FlowRow({ index, reduced, show, children, className }: RevealProps) {
  return (
    <motion.li className={className} {...revealMotion({ index, reduced, show })}>
      {children}
    </motion.li>
  );
}

/* Same reveal for non-list layouts (e.g. the foundation tree). */
export function Rise({ index, reduced, show, children, className }: RevealProps) {
  return (
    <motion.div className={className} {...revealMotion({ index, reduced, show })}>
      {children}
    </motion.div>
  );
}

export type FlowStep = {
  label: string;
  note?: string;
  gate?: boolean; // the human gate: filled primary, tagged
  detail?: ReactNode; // extra content under the row (e.g. the wizard's questions)
};

/* A numbered top-to-bottom flow: chip, pill, hairline connectors. */
export function Flow({ steps, caption }: { steps: FlowStep[]; caption?: ReactNode }) {
  const { ref, reduced, show } = useFlowReveal();
  return (
    <figure className="my-8 max-w-[420px]">
      <ol ref={ref} className="m-0 list-none p-0 text-foreground">
        {steps.map((s, i) => (
          <FlowRow key={s.label} index={i} reduced={reduced} show={show}>
            {i > 0 && <div aria-hidden className="ml-[23.5px] h-3.5 w-px bg-(--border-strong)" />}
            <div
              className={
                s.gate
                  ? "flex items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-primary-foreground"
                  : "flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
              }
            >
              <span
                aria-hidden
                className={
                  s.gate
                    ? "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-foreground text-[11px] font-semibold text-primary"
                    : "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-surface"
                }
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-medium leading-snug">{s.label}</span>
                {s.note && (
                  <span
                    className={
                      s.gate
                        ? "block text-[12px] leading-snug text-primary-foreground/85"
                        : "block text-[12px] leading-snug text-muted-foreground"
                    }
                  >
                    {s.note}
                  </span>
                )}
              </span>
              {s.gate && (
                <span className="ml-auto shrink-0 rounded-full border border-primary-foreground/40 px-2 py-0.5 text-[11px] font-semibold">
                  human gate
                </span>
              )}
            </div>
            {s.detail}
          </FlowRow>
        ))}
      </ol>
      {caption && (
        <figcaption className="mt-3 max-w-[52ch] text-[13px] leading-[1.6] text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
