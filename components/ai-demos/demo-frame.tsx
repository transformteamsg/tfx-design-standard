"use client";

import type { ReactNode, RefObject } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/* Shared wrapper for AI interaction pattern demos.
   Accepts children, an optional caption listing AI Elements components,
   and an optional onReplay callback. When onReplay is provided a ghost
   "Replay" button is rendered in the header so visitors can restart the
   animated sequence.

   `bleed` drops the content padding so a child (the ChatShell) can own its
   own p-4 inset and run an edge-to-edge divider — used by the chat demos so
   they don't nest a second bordered box inside this figure (SLP-4). */

export function DemoFrame({
  children,
  caption,
  onReplay,
  bleed = false,
  rootRef,
}: {
  children: ReactNode;
  caption?: string[];
  onReplay?: () => void;
  bleed?: boolean;
  rootRef?: RefObject<HTMLElement | null>;
}) {
  return (
    <figure ref={rootRef as RefObject<HTMLElement> | undefined} className="not-prose my-8 rounded-lg border border-border bg-surface">
      {/* Live demo label + optional replay */}
      <div className="flex items-center gap-2 rounded-t-lg border-b border-border px-4 py-2.5">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full bg-success-9 opacity-80"
        />
        <span className="text-xs font-semibold text-muted-foreground">
          Live pattern demo
        </span>
        {onReplay && (
          <button
            type="button"
            aria-label="Replay demo"
            onClick={onReplay}
            className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
          >
            <RotateCcw size={12} aria-hidden="true" />
            Replay
          </button>
        )}
      </div>

      {/* Demo content — interior canvas is page background; components carry their own surfaces.
          `bleed` removes the inset so a ChatShell child can own padding + a full-bleed divider. */}
      <div className={cn(bleed ? "p-0" : "p-5 sm:p-6")}>{children}</div>

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
