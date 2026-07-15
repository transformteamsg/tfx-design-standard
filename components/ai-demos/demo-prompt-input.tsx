"use client";

import { useState } from "react";
import type { FileUIPart } from "ai";
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentInfo,
  AttachmentRemove,
} from "@/components/ai-elements/attachments";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputHeader,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Paperclip } from "lucide-react";
import { DemoFrame } from "./demo-frame";
import { ChatShell, ChatShellMessages, ChatShellInput } from "./chat-shell";

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

/* Canned reply shown after the first submission — keeps the demo
   self-contained with no network calls. */
const CANNED_REPLY =
  "Got it. I'll look at the running records and summarise the key patterns for you.";

/* Illustrates PromptInput + Suggestion + an attached-file state.
   Anatomy: Suggestions render as siblings ABOVE the PromptInput.
   Attachments render inside the PromptInputHeader slot (above the textarea).
   On submit, the prompt appears as a user bubble and a canned assistant reply
   appears below — showing the mini-thread pattern. */
export function DemoPromptInput() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  function handleSubmit({ text }: { text: string }) {
    if (text.trim()) {
      setSubmitted(text.trim());
    }
  }

  return (
    <DemoFrame bleed caption={["PromptInput", "PromptInputHeader", "Suggestion", "Attachments", "Message"]}>
      <ChatShell>
        {/* Mini thread — visible after first submission */}
        {submitted && (
          <ChatShellMessages>
            <Message from="user">
              <MessageContent>{submitted}</MessageContent>
            </Message>
            <Message from="assistant">
              <MessageResponse>{CANNED_REPLY}</MessageResponse>
            </Message>
          </ChatShellMessages>
        )}

        {/* Divider only once a thread sits above the input. */}
        <ChatShellInput divider={submitted !== null}>
          {/* Suggestion chips render outside / above the PromptInput */}
          {!submitted && (
            <Suggestions className="mb-2">
              {SUGGESTIONS.map((s) => (
                <Suggestion
                  key={s}
                  suggestion={s}
                  onClick={() => setSubmitted(s)}
                />
              ))}
            </Suggestions>
          )}

          <PromptInput onSubmit={handleSubmit}>
            {/* Attachments go in the header slot — above the textarea */}
            {!submitted && (
              <PromptInputHeader>
                <Attachments variant="list">
                  <Attachment data={ATTACHED_FILE}>
                    <AttachmentPreview />
                    <AttachmentInfo />
                    <AttachmentRemove />
                  </Attachment>
                </Attachments>
              </PromptInputHeader>
            )}

            <PromptInputTextarea placeholder="Ask about a student, class, or report…" />

            <PromptInputFooter>
              {/* Attach affordance — labelled for screen readers (A11Y-2).
                  No tooltip prop: the tooltip trigger renders its own <button>,
                  nesting buttons and breaking hydration on this Base UI stack. */}
              <PromptInputButton aria-label="Attach file">
                <Paperclip className="size-4" aria-hidden="true" />
                <span className="text-xs">Attach</span>
              </PromptInputButton>

              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInput>
        </ChatShellInput>
      </ChatShell>
    </DemoFrame>
  );
}
