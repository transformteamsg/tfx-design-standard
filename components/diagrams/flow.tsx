"use client";

/* Shared vertical-flow primitive for the explanatory diagrams. HTML, not SVG:
   text renders at true UI sizes, colours come straight from tokens (TOK-1),
   and connectors are plain elements that cannot mis-render. Content is
   server-visible and remains static so reduced-motion preferences
   cannot produce a different first client render. */

import { useRef, type ReactNode } from "react";

export function useFlowReveal<T extends Element = HTMLOListElement>() {
  const ref = useRef<T | null>(null);
  return { ref, reduced: true, show: true };
}

type RevealProps = {
  index: number;
  reduced: boolean;
  show: boolean;
  children: ReactNode;
  className?: string;
};

export function FlowRow({ children, className }: RevealProps) {
  return <li className={className}>{children}</li>;
}

/* Same reveal for non-list layouts (e.g. the foundation tree). */
export function Rise({ children, className }: RevealProps) {
  return <div className={className}>{children}</div>;
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
