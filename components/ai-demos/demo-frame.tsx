import type { ReactNode } from "react";

/* Shared wrapper for AI interaction pattern demos.
   Static — no client-side state needed. Accepts children and an optional
   caption listing the AI Elements components being illustrated. */

export function DemoFrame({
  children,
  caption,
}: {
  children: ReactNode;
  caption?: string[];
}) {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-border bg-surface">
      {/* Live demo label */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full bg-success-9 opacity-80"
        />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Live pattern demo
        </span>
      </div>

      {/* Demo content */}
      <div className="p-5">{children}</div>

      {/* Caption: component name chips */}
      {caption && caption.length > 0 && (
        <figcaption className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
          <span className="text-[11px] text-muted-foreground">Components:</span>
          {caption.map((name) => (
            <span
              key={name}
              className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground"
            >
              {name}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
