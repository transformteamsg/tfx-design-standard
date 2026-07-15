"use client";

import { useState } from "react";
import { Sparkles, RotateCcw, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DemoFrame } from "./demo-frame";

/* Illustrates a TFX-native AI label pattern inspired by Carbon's AI label.
   - AI-generated content carries a small "AI" badge.
   - Clicking the badge opens an explainability popover (Base UI Portal,
     so it is never clipped by overflow-hidden containers).
   - Toggling "I've edited this" swaps the badge to a "Revert to AI" affordance.
   This pattern is NOT an AI Elements component — it is designed for TFX
   surfaces where teachers edit AI-drafted content (reports, notes, plans). */
export function DemoAiLabel() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [edited, setEdited] = useState(false);

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
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            End-of-term comment
          </span>

          {/* AI / Edited badge */}
          <div className="flex items-center gap-2">
            {edited ? (
              /* Edited state: offer to revert */
              <button
                type="button"
                onClick={() => setEdited(false)}
                className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
              >
                <RotateCcw size={11} aria-hidden="true" />
                Revert to AI draft
              </button>
            ) : (
              /* AI label: triggers explainability popover via Base UI Portal
                 — renders outside figure so it is never clipped */
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger
                  aria-label="About this AI-generated content"
                  className="flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                >
                  <Sparkles size={11} aria-hidden="true" />
                  AI
                </PopoverTrigger>

                <PopoverContent side="bottom" align="end" sideOffset={6}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      About this draft
                    </p>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setPopoverOpen(false)}
                      className="text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>

                  <dl className="mt-3 space-y-2 text-xs">
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

                  <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs leading-snug text-muted-foreground">
                    Always review AI-generated comments before sending to parents or
                    entering into official records.
                  </p>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* The AI-drafted text field */}
        <textarea
          rows={3}
          defaultValue="Ahmad has shown consistent effort in reading this term. He is meeting year-level benchmarks and has demonstrated strong literal comprehension skills."
          aria-label="End-of-term comment (AI draft)"
          onChange={() => setEdited(true)}
          className="w-full resize-none rounded-md bg-transparent text-sm leading-relaxed text-foreground focus-visible:outline-none"
        />

        <p className="text-xs text-muted-foreground">
          Click the <strong>AI</strong> badge to see what data generated this.
          Edit the text to reveal the revert affordance.
        </p>
      </div>
    </DemoFrame>
  );
}
