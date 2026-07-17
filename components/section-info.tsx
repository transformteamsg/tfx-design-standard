"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* An unobtrusive help affordance for a doc section heading: an info icon that,
   on hover / keyboard focus / tap, reveals a plain-language description of what
   the section is for. Rendered by the h2 heading component (components/mdx.tsx)
   only when the doc's frontmatter `sections` map has a description for that
   heading's slug — so sections without one stay exactly as they were.

   Accessibility: the trigger is a real <button> named for the section; the
   glyph is decorative (aria-hidden). The description is associated with the
   trigger via aria-describedby → an always-present visually-hidden copy, so a
   screen reader reads it on focus whether or not the (portalled) tooltip popup
   is open. Reduced motion is honoured in globals.css. */
export function SectionInfo({
  heading,
  description,
}: {
  heading: string;
  description: string;
}) {
  /* Controlled so the affordance opens on tap/click too, not only hover and
     keyboard focus: ARIA tooltips don't reveal on touch, and this doc site is
     read on tablets and phones as well as laptops. Base UI still drives
     hover/focus open+close through onOpenChange; the click handler adds the
     tap/click path. */
  const [open, setOpen] = useState(false);
  const descId = useId();
  return (
    <TooltipProvider delay={200}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger
          aria-label={`About this section: ${heading}`}
          aria-describedby={descId}
          onClick={() => setOpen(true)}
          /* Visual target 24px; a pseudo-element expands the tap area to ~44px
             on all sides (A11Y-4 touch) without inflating the heading line. */
          className="relative ml-1.5 inline-flex size-6 shrink-0 -translate-y-px items-center justify-center rounded-md align-middle text-muted-foreground outline-none transition-colors before:absolute before:-inset-2.5 before:content-[''] hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Info aria-hidden className="size-4" />
          <span id={descId} className="sr-only">
            {description}
          </span>
        </TooltipTrigger>
        {/* 14px, not the tooltip's 12px default: these are reading sentences,
           not a terse label, so body-small reads kinder (justified CMP-7
           deviation; TYP-2). */}
        <TooltipContent className="max-w-xs text-sm text-pretty">
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
