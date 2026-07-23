"use client";

import { useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";

/* Illustrates a TFX-native AI label pattern.
   - AI-generated content carries a shadcn Badge (variant="secondary") labelled "AI".
   - Clicking the badge opens a shadcn Popover for explainability.
   - Editing the textarea swaps the badge to a "Revert to AI draft" Button.
   Badge has NO className overrides - secondary variant at default size.
   Button (revert) is size="sm" variant="outline" with NO className overrides.
   PopoverContent is at default width (w-72 from the component itself).
   PopoverTrigger wraps the Badge directly - no extra className on Trigger. */

export function DemoAiLabel() {
  const [edited, setEdited] = useState(false);
  const { ref } = useReplay({ steps: 1, stepMs: 300 });

  return (
    <DemoFrame
      caption={["Badge", "Popover", "PopoverContent", "Button"]}
      rootRef={ref}
    >
      <div className="flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            End-of-term comment
          </span>

          {/* AI badge / edited state */}
          <div className="flex items-center gap-2">
            {edited ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEdited(false)}
              >
                <RotateCcw aria-hidden="true" />
                Revert to AI draft
              </Button>
            ) : (
              <Popover>
                <PopoverTrigger aria-label="About this AI-generated content">
                  <Badge variant="secondary">
                    <Sparkles aria-hidden="true" />
                    AI
                  </Badge>
                </PopoverTrigger>

                <PopoverContent side="bottom" align="end">
                  <p className="text-sm font-semibold text-foreground">
                    About this draft
                  </p>

                  <dl className="mt-3 space-y-2 text-xs">
                    <div>
                      <dt className="font-medium text-muted-foreground">Generated from</dt>
                      <dd className="mt-0.5 text-foreground">
                        Running records and attendance (Term 2, weeks 1-9)
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
