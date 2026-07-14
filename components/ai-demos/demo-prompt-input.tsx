"use client";

import { useState, useRef } from "react";
import { Paperclip, ArrowUp } from "lucide-react";
import { DemoFrame } from "./demo-frame";

const SUGGESTIONS = [
  "Draft a reading report",
  "Flag students below band 2",
  "Summarise this week",
];

/* Illustrates PromptInput + Suggestion + Attachments patterns.
   Clicking a suggestion chip populates the textarea.
   The paperclip icon is a labelled button (keyboard reachable, A11Y-2). */
export function DemoPromptInput() {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function selectSuggestion(s: string) {
    setValue(s);
    textareaRef.current?.focus();
  }

  return (
    <DemoFrame caption={["PromptInput", "Suggestion", "Attachments"]}>
      <div className="flex flex-col gap-3">
        {/* Suggestion chips */}
        <div
          role="group"
          aria-label="Suggested prompts"
          className="flex flex-wrap gap-2"
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => selectSuggestion(s)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-border-strong hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 focus-within:border-border-strong focus-within:ring-1 focus-within:ring-(--color-ring)">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask about a student, class, or report…"
            rows={3}
            aria-label="Prompt input"
            className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
          />

          {/* Footer row */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Attach file"
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
            >
              <Paperclip size={15} aria-hidden="true" />
              <span className="text-[12px]">Attach</span>
            </button>

            <button
              type="button"
              aria-label="Send prompt"
              disabled={value.trim().length === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-tw-blue text-white transition-colors hover:bg-tw-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUp size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Click a suggestion to populate the input, then press Send.
        </p>
      </div>
    </DemoFrame>
  );
}
