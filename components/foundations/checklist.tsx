import { Check as CheckIcon } from "lucide-react";
import type { ReactNode } from "react";

/* Checklist - a DoDont-style rowed card for items to confirm are in place (e.g.
   the Step 0 guardrails). Unlike DoDont (plain-string items), each Check takes
   MDX children, so inline bold/italics/links render. The green check pill reuses
   the success tokens that already clear AA (A11Y-1). Fill sits on the figure so
   it follows the rounded border with no corner clip; rows are grouped, not
   carded (SLP-11). Mirrors do-dont.tsx's row structure on purpose. */
export function Checklist({ children }: { children?: ReactNode }) {
  return (
    <figure className="my-8 overflow-hidden rounded-lg border border-border bg-surface">
      <ul className="divide-y divide-border">{children}</ul>
    </figure>
  );
}

export function Check({ children }: { children?: ReactNode }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-success-muted bg-success-subtle text-success">
        <CheckIcon className="size-3" aria-hidden />
      </span>
      <span className="text-sm leading-[1.6] text-(--prose-body)">{children}</span>
    </li>
  );
}
