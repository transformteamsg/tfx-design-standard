"use client";

import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DemoFrame } from "./demo-frame";

/* Illustrates the inline-suggest shape: the AI lives inside another surface
   (a form field) rather than in a chat panel beside it. A ghost line of
   suggested copy sits under the textarea with Accept, Edit, and Reject
   affordances. Accept and Edit both drop the suggestion into the field and
   mark it with an AI badge; Edit also focuses the textarea for adjustment.
   As soon as the person types further, the AI label clears - once edited,
   it is theirs (SLP-11-adjacent honesty about provenance).

   Composition: Badge is variant="secondary" at default size, Button uses
   size="sm" with variant="outline" (Accept) or "ghost" (Edit, Reject).
   No className size overrides on any primitive. */

const SUGGESTION =
  "Based on Amara's essay on urban migration, try chapters 1 to 3 of Jane Jacobs' Death and Life of Great American Cities.";

export const DemoInlineSuggest = ({
  title,
  blurb,
}: {
  title?: string;
  blurb?: string;
}) => {
  const [value, setValue] = useState("");
  const [suggestionOpen, setSuggestionOpen] = useState(true);
  const [aiLabel, setAiLabel] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const accept = () => {
    setValue(SUGGESTION);
    setAiLabel(true);
    setSuggestionOpen(false);
  };

  const edit = () => {
    setValue(SUGGESTION);
    setAiLabel(true);
    setSuggestionOpen(false);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(SUGGESTION.length, SUGGESTION.length);
    });
  };

  const reject = () => {
    setSuggestionOpen(false);
  };

  const handleChange = (next: string) => {
    setValue(next);
    if (aiLabel && next !== SUGGESTION) {
      setAiLabel(false);
    }
  };

  return (
    <DemoFrame
      caption={["Textarea", "Button", "Badge"]}
      title={title}
      blurb={blurb}
    >
      <div className="flex flex-col gap-3">
        {/* Field label + AI badge (once accepted or edited) */}
        <div className="flex items-center justify-between">
          <label
            htmlFor="inline-suggest-note"
            className="text-xs font-semibold text-foreground"
          >
            Recommended next reading for Amara
          </label>
          {aiLabel && (
            <Badge variant="secondary">
              <Sparkles aria-hidden="true" />
              AI
            </Badge>
          )}
        </div>

        <Textarea
          id="inline-suggest-note"
          ref={textareaRef}
          rows={3}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write a short note for the seminar wrap-up..."
        />

        {/* Inline suggestion panel */}
        {suggestionOpen && (
          <div className="flex flex-col gap-2 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <Sparkles
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
              />
              <p className="text-sm italic leading-relaxed text-muted-foreground">
                {SUGGESTION}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button size="sm" variant="outline" onClick={accept}>
                Accept
              </Button>
              <Button size="sm" variant="ghost" onClick={edit}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={reject}>
                Reject
              </Button>
              <span className="ml-auto text-xs text-muted-foreground">
                Suggested from Amara&apos;s recent essay
              </span>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Accept drops the suggestion in as-is. Edit drops it in and puts the
          cursor in the field so you can adjust. Reject dismisses it. Typing
          after either action clears the AI label.
        </p>
      </div>
    </DemoFrame>
  );
};
