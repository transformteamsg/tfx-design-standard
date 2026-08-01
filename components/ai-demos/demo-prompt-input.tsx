"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatStatus, FileUIPart, UIMessageChunk } from "ai";
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
import { MockChatTransport } from "./mock-chat";
import { useReplay } from "./use-replay";

/* Demo attachment - an enrolment form PDF. Toggled in/out by the
   Attach button so the affordance (attach + remove) is visible. */
const DEMO_FILE: FileUIPart & { id: string } = {
  id: "att-1",
  type: "file",
  mediaType: "application/pdf",
  filename: "enrolment-forms-this-intake.pdf",
  url: "https://school.example/admin/enrolment-forms-this-intake.pdf",
};

const SUGGESTIONS = [
  "List overdue consent forms",
  "Summarise this week's absences",
  "Draft an enrolment confirmation",
] as const;

/* Canned fallback shown while streaming - the mock returns a real streamed
   response when a chip or custom message is submitted. */

/* Illustrates PromptInput + Suggestion + attachments.
   Anatomy: Suggestions render as siblings ABOVE the PromptInput.
   Attachments render inside the PromptInputHeader slot.
   On submit/chip, the user bubble appears and the assistant reply streams word-by-word. */
export function DemoPromptInput({ title, blurb }: { title?: string; blurb?: string }) {
  const [userText, setUserText] = useState<string | null>(null);
  const [streamedReply, setStreamedReply] = useState("");
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [showAttachment, setShowAttachment] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const transportRef = useRef<MockChatTransport>(new MockChatTransport());

  /* Scroll-entrance: demo auto-shows the attachment chip to illustrate the
     affordance before the user does anything. */
  const { step, replay, ref: rootRef } = useReplay({ steps: 1, stepMs: [500] });

  /* Show the attachment chip when the demo enters the viewport. */
  useEffect(() => {
    if (step >= 1) {
      setShowAttachment(true);
    }
  }, [step]);

  const handleReplay = useCallback(() => {
    abortRef.current?.abort();
    setUserText(null);
    setStreamedReply("");
    setStatus("ready");
    setShowAttachment(false);
    replay();
  }, [replay]);

  const streamReply = useCallback(async (prompt: string) => {
    abortRef.current?.abort();
    setStreamedReply("");
    setStatus("submitted");

    const ac = new AbortController();
    abortRef.current = ac;

    let stream: ReadableStream<UIMessageChunk>;
    try {
      stream = await transportRef.current.sendMessages({
        trigger: "submit-message",
        chatId: "demo-prompt-input",
        messages: [
          {
            id: "u-1",
            role: "user",
            parts: [{ type: "text", text: prompt }],
            metadata: {},
          },
        ],
        abortSignal: ac.signal,
        body: { webSearch: false },
      });
    } catch {
      if (!ac.signal.aborted) setStatus("error");
      return;
    }

    setStatus("streaming");

    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done || ac.signal.aborted) break;
        if (chunk.type === "text-delta") {
          setStreamedReply((prev) => prev + chunk.delta);
        }
      }
    } catch {
      /* aborted cleanly */
    } finally {
      reader.releaseLock();
    }

    if (!ac.signal.aborted) setStatus("ready");
    abortRef.current = null;
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setUserText(text.trim());
      setStreamedReply("");
      setShowAttachment(false);
      await streamReply(text.trim());
    },
    [streamReply]
  );

  const isStreaming = status === "submitted" || status === "streaming";
  const hasResponse = userText !== null;

  return (
    <DemoFrame
      bleed
      onReplay={handleReplay}
      rootRef={rootRef}
      title={title}
      blurb={blurb}
      caption={["PromptInput", "PromptInputHeader", "Suggestion", "Attachments", "Message"]}
    >
      <ChatShell>
        {/* Mini thread - visible after first submission */}
        {hasResponse && (
          <ChatShellMessages>
            <Message from="user">
              <MessageContent>{userText}</MessageContent>
            </Message>
            <Message from="assistant">
              <MessageResponse isAnimating={isStreaming}>
                {streamedReply}
              </MessageResponse>
            </Message>
          </ChatShellMessages>
        )}

        <ChatShellInput divider={hasResponse}>
          {/* Suggestion chips render outside / above the PromptInput */}
          {!hasResponse && (
            <div className="mb-2">
              <Suggestions>
                {SUGGESTIONS.map((s) => (
                  <Suggestion
                    key={s}
                    suggestion={s}
                    onClick={(text) => { void sendMessage(text); }}
                  />
                ))}
              </Suggestions>
            </div>
          )}

          <PromptInput
            onSubmit={({ text }) => { void sendMessage(text.trim()); }}
          >
            {/* Attachments go in the header slot - above the textarea.
                Visible when attach button is toggled on or after scroll-entrance. */}
            {showAttachment && (
              <PromptInputHeader>
                <Attachments variant="list">
                  <Attachment
                    data={DEMO_FILE}
                    onRemove={() => setShowAttachment(false)}
                  >
                    <AttachmentPreview />
                    <AttachmentInfo />
                    <AttachmentRemove />
                  </Attachment>
                </Attachments>
              </PromptInputHeader>
            )}

            <PromptInputTextarea
              disabled={isStreaming}
              placeholder={isStreaming ? "Waiting for response..." : "Ask about enrolment, forms, or records..."}
              aria-label={isStreaming ? "Prompt - disabled while streaming" : "Prompt"}
            />

            <PromptInputFooter>
              {/* Attach toggle - clicking shows the attachment chip; removing
                  via the chip's X button hides it again (visual only). */}
              <PromptInputButton
                type="button"
                variant={showAttachment ? "default" : "ghost"}
                aria-pressed={showAttachment}
                aria-label="Attach file"
                onClick={() => setShowAttachment((v) => !v)}
              >
                <Paperclip className="size-4" aria-hidden="true" />
                <span className="text-xs">Attach</span>
              </PromptInputButton>

              <PromptInputSubmit status={status} />
            </PromptInputFooter>
          </PromptInput>
        </ChatShellInput>
      </ChatShell>
    </DemoFrame>
  );
}
