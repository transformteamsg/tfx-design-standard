"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatStatus, UIMessageChunk } from "ai";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import { DemoFrame } from "./demo-frame";
import { ChatShell, ChatShellMessages, ChatShellInput } from "./chat-shell";
import { MockChatTransport } from "./mock-chat";
import { useReplay } from "./use-replay";

/* The fixed prompt that drives the streaming demo. "haven't submitted" hits
   the mock's "below / band" keyword path, streaming the three-student list. */
const DEMO_QUESTION = "Which students in 5A haven't submitted their reading log this week?";

/* Illustrates the streaming state: a partial assistant message with a Shimmer
   status line above, and a PromptInputSubmit locked in stop mode (square icon,
   aria-label "Stop") so teachers can interrupt at any moment.
   Stop actually aborts the stream; Replay restarts it from scratch. */
export const DemoStreaming = () => {
  const [streamedText, setStreamedText] = useState("");
  const [status, setStatus] = useState<ChatStatus>("ready");
  const abortRef = useRef<AbortController | null>(null);
  const transportRef = useRef<MockChatTransport>(new MockChatTransport());

  /* useReplay drives: (1) scroll-entrance via rootRef/IntersectionObserver,
     (2) Replay button via the onReplay callback.
     steps: 1 means step goes 0 -> 1 once the element enters the viewport.
     Calling replay() resets step to 0 then back to 1, re-triggering the
     useEffect below. */
  const { step, replay, ref: rootRef } = useReplay({ steps: 1, stepMs: [400] });

  const startStream = useCallback(async () => {
    abortRef.current?.abort();
    setStreamedText("");
    setStatus("submitted");

    const ac = new AbortController();
    abortRef.current = ac;

    let stream: ReadableStream<UIMessageChunk>;
    try {
      stream = await transportRef.current.sendMessages({
        trigger: "submit-message",
        chatId: "demo-streaming",
        messages: [
          {
            id: "u-1",
            role: "user",
            parts: [{ type: "text", text: DEMO_QUESTION }],
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
          setStreamedText((prev) => prev + chunk.delta);
        }
      }
    } catch {
      /* aborted cleanly */
    } finally {
      reader.releaseLock();
    }

    /* Only mark ready if NOT aborted - stop leaves the partial text visible. */
    if (!ac.signal.aborted) {
      setStatus("ready");
    }
    abortRef.current = null;
  }, []);

  /* Auto-start when the demo enters the viewport (step: 0 -> 1).
     Replay also increments step (via useReplay's internal token -> 0 -> 1),
     so this effect fires on both entrance and Replay. */
  useEffect(() => {
    if (step >= 1) {
      void startStream();
    }
  }, [step, startStream]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStatus("ready");
  }, []);

  /* Replay: abort any running stream, reset visible text, then let useReplay
     cycle its step so the effect above re-fires startStream. */
  const handleReplay = useCallback(() => {
    stop();
    setStreamedText("");
    replay();
  }, [stop, replay]);

  const isStreaming = status === "submitted" || status === "streaming";

  return (
    <DemoFrame
      bleed
      caption={["MessageResponse", "Shimmer", "PromptInput", "PromptInputSubmit"]}
      onReplay={handleReplay}
      rootRef={rootRef}
    >
      <ChatShell>
        <ChatShellMessages>
          <Message from="user">
            <MessageContent>
              {DEMO_QUESTION}
            </MessageContent>
          </Message>

          {(streamedText || isStreaming) && (
            <Message from="assistant">
              <MessageResponse isAnimating={status === "streaming"}>
                {streamedText}
              </MessageResponse>
              {isStreaming && (
                <div className="mt-2 pl-1">
                  <Shimmer as="p">
                    Retrieving final record from CaseSync...
                  </Shimmer>
                </div>
              )}
            </Message>
          )}
        </ChatShellMessages>

        <ChatShellInput>
          <PromptInput onSubmit={() => {}}>
            <PromptInputTextarea
              disabled={isStreaming}
              placeholder={isStreaming ? "Waiting for response..." : "Ask about your class..."}
              aria-label={isStreaming ? "Prompt - disabled while streaming" : "Prompt"}
            />
            <PromptInputFooter>
              {isStreaming ? (
                <PromptInputSubmit status="streaming" onStop={stop} />
              ) : (
                <PromptInputSubmit />
              )}
            </PromptInputFooter>
          </PromptInput>
        </ChatShellInput>
      </ChatShell>
    </DemoFrame>
  );
};
