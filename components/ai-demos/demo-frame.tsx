"use client";

import type { ReactNode, RefObject } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/* Shared wrapper for AI interaction pattern demos.
   Accepts children, an optional caption listing AI Elements components,
   and an optional onReplay callback. When onReplay is provided a ghost
   "Replay" button is rendered in the header so visitors can restart the
   animated sequence.

   `title` is a short, specific label for this demo (e.g. "Agent plan,
   awaiting approval"); `blurb` is one muted line on what it shows or when
   you'd reach for it. Both are optional - when `title` is omitted the
   header falls back to the generic "Live pattern demo" text so nothing
   breaks for demos that haven't been given one yet.

   `bleed` drops the content padding so a child (the ChatShell) can own its
   own p-4 inset and run an edge-to-edge divider - used by the chat demos so
   they don't nest a second bordered box inside this figure (SLP-4).

   `minHeight` reserves vertical space on the content wrapper so demos that
   progressively mount elements ({step >= N && ...}) or grow streaming text
   do not shift the page below them once the animation starts. Pass the
   measured final-state height in pixels (e.g. 480) - not a magic number,
   observed at desktop width in the browser. Only needed for animated demos
   whose height changes after the observer fires; static demos leave it off. */

export function DemoFrame({
  children,
  caption,
  onReplay,
  bleed = false,
  rootRef,
  title,
  blurb,
  minHeight,
}: {
  children: ReactNode;
  caption?: string[];
  onReplay?: () => void;
  bleed?: boolean;
  rootRef?: RefObject<HTMLElement | null>;
  title?: string;
  blurb?: string;
  minHeight?: number;
}) {
  return (
    <figure ref={rootRef as RefObject<HTMLElement> | undefined} className="not-prose my-8 rounded-lg border border-border bg-surface">
      {/* Section header - clearly labelled so a scanner knows this is a demo block */}
      <div className="flex items-start gap-3 rounded-t-lg border-b border-border bg-muted/30 px-5 py-3">
        <div className="flex flex-1 flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-success-9"
            />
            Live demo
          </span>
          <span className="text-base font-semibold leading-tight text-foreground">
            {title ?? "Live pattern demo"}
          </span>
          {blurb && (
            <span className="text-sm text-muted-foreground">{blurb}</span>
          )}
        </div>
        {onReplay && (
          <button
            type="button"
            aria-label="Replay demo"
            onClick={onReplay}
            className="mt-0.5 flex shrink-0 cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
          >
            <RotateCcw size={12} aria-hidden="true" />
            Replay
          </button>
        )}
      </div>

      {/* Demo content - interior canvas is page background; components carry their own surfaces.
          `bleed` removes the inset so a ChatShell child can own padding + a full-bleed divider.
          `minHeight` reserves space so animated demos do not shift content below them. */}
      <div
        className={cn(bleed ? "p-0" : "p-5 sm:p-6")}
        style={minHeight ? { minHeight: `${minHeight}px` } : undefined}
      >
        {children}
      </div>

      {/* Caption: component name chips */}
      {caption && caption.length > 0 && (
        <figcaption className="flex flex-wrap items-center gap-2 rounded-b-lg border-t border-border px-4 py-3">
          <span className="text-xs text-muted-foreground">Components:</span>
          {caption.map((name) => (
            <span
              key={name}
              className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs text-foreground"
            >
              {name}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
