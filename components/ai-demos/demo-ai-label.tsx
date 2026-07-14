"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, RotateCcw, X } from "lucide-react";
import { DemoFrame } from "./demo-frame";

/* Illustrates a TFX-native AI label pattern inspired by Carbon's AI label.
   - AI-generated content carries a small "AI" badge.
   - Clicking the badge opens an explainability popover.
   - Toggling "I've edited this" swaps the badge to a "Revert to AI" affordance.
   This pattern is NOT an AI Elements component — it is designed for TFX
   surfaces where teachers edit AI-drafted content (reports, notes, plans). */
export function DemoAiLabel() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [edited, setEdited] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* Close popover on outside click */
  useEffect(() => {
    if (!popoverOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  /* Close on Escape */
  useEffect(() => {
    if (!popoverOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPopoverOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [popoverOpen]);

  return (
    <DemoFrame
      caption={[
        "AI label (TFX pattern)",
        "— inspired by Carbon AI label",
        "— not an AI Elements component",
      ]}
    >
      <div className="flex flex-col gap-4">
        {/* Content block with AI label */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              End-of-term comment
            </span>

            {/* AI / Edited badge */}
            <div className="relative flex items-center gap-2">
              {edited ? (
                /* Edited state: offer to revert */
                <button
                  type="button"
                  onClick={() => setEdited(false)}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                >
                  <RotateCcw size={11} aria-hidden="true" />
                  Revert to AI draft
                </button>
              ) : (
                /* AI label: triggers explainability popover */
                <button
                  ref={triggerRef}
                  type="button"
                  aria-expanded={popoverOpen}
                  aria-haspopup="dialog"
                  onClick={() => setPopoverOpen((v) => !v)}
                  className="flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                >
                  <Sparkles size={11} aria-hidden="true" />
                  AI
                </button>
              )}

              {/* Explainability popover */}
              {popoverOpen && !edited && (
                <div
                  ref={popoverRef}
                  role="dialog"
                  aria-label="About this AI-generated content"
                  aria-modal="true"
                  className="absolute right-0 top-full z-10 mt-2 w-72 rounded-lg border border-border bg-surface p-4 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold text-foreground">
                      About this draft
                    </p>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => {
                        setPopoverOpen(false);
                        triggerRef.current?.focus();
                      }}
                      className="text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>

                  <dl className="mt-3 space-y-2 text-[12px]">
                    <div>
                      <dt className="font-medium text-muted-foreground">Generated from</dt>
                      <dd className="mt-0.5 text-foreground">
                        Running records and attendance (Term 2, weeks 1–9)
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">How to check it</dt>
                      <dd className="mt-0.5 text-foreground">
                        Compare against the student&apos;s portfolio. Adjust tone or
                        specific details before sharing with parents.
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-3 rounded-md bg-muted px-3 py-2 text-[11px] leading-snug text-muted-foreground">
                    Always review AI-generated comments before sending to parents or
                    entering into official records.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* The AI-drafted text field */}
          <textarea
            rows={3}
            defaultValue="Ahmad has shown consistent effort in reading this term. He is meeting year-level benchmarks and has demonstrated strong literal comprehension skills."
            aria-label="End-of-term comment (AI draft)"
            onChange={() => setEdited(true)}
            className="w-full resize-none rounded-md bg-transparent text-[14px] leading-relaxed text-foreground focus-visible:outline-none"
          />
        </div>

        <p className="text-[11px] text-muted-foreground">
          Click the <strong>AI</strong> badge to see what data generated this.
          Edit the text to reveal the revert affordance.
        </p>
      </div>
    </DemoFrame>
  );
}
