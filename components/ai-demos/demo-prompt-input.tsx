"use client";

import type { FileUIPart } from "ai";
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentInfo,
  AttachmentRemove,
} from "@/components/ai-elements/attachments";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Paperclip } from "lucide-react";
import { DemoFrame } from "./demo-frame";

/* Static teacher-realistic attachment so the "what it can read" affordance
   is visible — a running-records PDF already loaded into the input strip. */
const ATTACHED_FILE: FileUIPart & { id: string } = {
  id: "att-1",
  type: "file",
  mediaType: "application/pdf",
  filename: "5a-running-records-t2.pdf",
  url: "https://casesync.school/records/5a/running-records-t2.pdf",
};

const SUGGESTIONS = [
  "Draft a reading report",
  "Flag students below band 2",
  "Summarise this week",
] as const;

/* Illustrates PromptInput + Suggestion + an attached-file state.
   All interactive elements are keyboard-reachable (A11Y-2).
   No network calls — all state is static. */
export function DemoPromptInput() {
  return (
    <DemoFrame caption={["PromptInput", "Suggestion", "Attachments"]}>
      <div className="flex flex-col gap-3">
        <PromptInput onSubmit={() => {}}>
          {/* Attachment strip — shows what the AI can read */}
          <Attachments variant="list">
            <Attachment data={ATTACHED_FILE}>
              <AttachmentPreview />
              <AttachmentInfo />
              <AttachmentRemove />
            </Attachment>
          </Attachments>

          {/* Suggestion chips above the textarea */}
          <Suggestions>
            {SUGGESTIONS.map((s) => (
              <Suggestion key={s} suggestion={s} onClick={() => {}} />
            ))}
          </Suggestions>

          <PromptInputTextarea placeholder="Ask about a student, class, or report…" />

          <PromptInputFooter>
            {/* Attach affordance — labelled for screen readers (A11Y-2).
                No tooltip prop: the tooltip trigger renders its own <button>,
                nesting buttons and breaking hydration on this Base UI stack. */}
            <PromptInputButton aria-label="Attach file">
              <Paperclip className="size-4" aria-hidden="true" />
              <span className="text-[12px]">Attach</span>
            </PromptInputButton>

            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </DemoFrame>
  );
}
