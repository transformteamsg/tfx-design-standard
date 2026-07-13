"use client";

/* The seven-layer ladder from "How to read this": each layer answers one
   question and carries a different authority. Every row links to its section;
   Standards — the only machine-enforced layer — is marked. */

import Link from "next/link";
import { FlowRow, useFlowReveal } from "./flow";

const layers = [
  { href: "/principles", label: "Principles", answers: "why", note: "used to decide, not to check" },
  {
    href: "/standards",
    label: "Standards",
    answers: "must",
    note: "required; L0 blocks, L1 needs a documented waiver",
    enforced: true,
  },
  { href: "/guidelines", label: "Guidelines", answers: "should", note: "judgement applies; deviation needs a reason" },
  { href: "/foundations", label: "Foundations", answers: "with what", note: "build from these by default" },
  { href: "/domains", label: "Domains", answers: "who for", note: "brand per domain; adds, never overrides" },
  { href: "/products", label: "Products", answers: "where", note: "one character, calibrated per product" },
  { href: "/harness", label: "Harness", answers: "how, fast", note: "use the skills and tools; improve them" },
];

export function Ladder() {
  const { ref, reduced, show } = useFlowReveal<HTMLUListElement>();
  return (
    <figure className="my-8 max-w-[520px]">
      <ul ref={ref} className="m-0 list-none space-y-2 p-0">
        {layers.map((l, i) => (
          <FlowRow key={l.label} index={i} reduced={reduced} show={show}>
            <div className="flex items-center gap-3">
              <Link
                href={l.href}
                className={
                  l.enforced
                    ? "flex w-[190px] shrink-0 items-baseline justify-between gap-2 rounded-lg bg-primary px-3.5 py-2 text-primary-foreground no-underline transition-colors duration-150 hover:bg-tw-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                    : "flex w-[190px] shrink-0 items-baseline justify-between gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-foreground no-underline transition-colors duration-150 hover:border-(--border-strong) hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                }
              >
                <span className="text-[14px] font-medium">{l.label}</span>
                <span
                  className={
                    l.enforced
                      ? "text-[12px] italic text-primary-foreground"
                      : "text-[12px] italic text-muted-foreground"
                  }
                >
                  {l.answers}
                </span>
              </Link>
              <span aria-hidden className="h-px w-3 shrink-0 bg-border" />
              <span className="min-w-0 text-[12px] leading-snug text-muted-foreground">
                {l.note}
                {l.enforced && (
                  <span className="block font-semibold text-tw-blue">
                    the only machine-enforced layer
                  </span>
                )}
              </span>
            </div>
          </FlowRow>
        ))}
      </ul>
      <figcaption className="mt-3 max-w-[52ch] text-[12px] leading-[1.6] text-muted-foreground">
        The litmus test: if you can&apos;t check it, it&apos;s a principle or a guideline, not a
        standard.
      </figcaption>
    </figure>
  );
}
