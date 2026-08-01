"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatStatus, UIMessage, UIMessageChunk } from "ai";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { DemoFrame } from "./demo-frame";
import { ChatShell, ChatShellInput, chatMessagesClass } from "./chat-shell";
import { MockChatTransport } from "./mock-chat";
import { useReplay } from "./use-replay";

/* ── Local types (mirrors demo-chatbot shape) ────────────────────────────── */

type TextPart = { type: "text"; text: string; state: "streaming" | "done" };
type MsgPart = TextPart;

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  parts: MsgPart[];
}

const SUGGESTIONS = [
  "How is my son doing this term?",
  "What is he finding tricky?",
  "What can we practise at home?",
] as const;

/* Seed: first user message that appears when the demo enters view.
   This demo is seeded as a parent, so the assistant replies in plain
   language with no education jargon. */
const SEED_MESSAGE = "How is my daughter doing in reading this term?";

/* ── Chunk reducer (text only, no reasoning/sources in this demo) ─────────── */

function applyChunk(parts: MsgPart[], chunk: UIMessageChunk): MsgPart[] {
  switch (chunk.type) {
    case "text-start":
      return [...parts, { type: "text", text: "", state: "streaming" }];
    case "text-delta": {
      const idx = parts.findLastIndex((p) => p.type === "text");
      if (idx === -1) return parts;
      const next = [...parts];
      const p = next[idx];
      if (p.type === "text") next[idx] = { ...p, text: p.text + chunk.delta };
      return next;
    }
    case "text-end": {
      const idx = parts.findLastIndex((p) => p.type === "text");
      if (idx === -1) return parts;
      const next = [...parts];
      const p = next[idx];
      if (p.type === "text") next[idx] = { ...p, state: "done" };
      return next;
    }
    default:
      return parts;
  }
}

/* ── The conversation demo ───────────────────────────────────────────────── */
/* Streams the initial assistant reply when the demo scrolls into view.        *
 * Suggestion chips and manual submit trigger additional streamed turns.       */
export const DemoConversation = ({ title, blurb }: { title?: string; blurb?: string }) => {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const abortRef = useRef<AbortController | null>(null);
  const msgCounter = useRef(0);
  const transportRef = useRef<MockChatTransport>(new MockChatTransport());
  const autoStarted = useRef(false);

  /* Scroll-entrance trigger: fires once when the demo crosses the 0.25
     viewport threshold; steps: 1, stepMs: 600 gives a brief settle pause. */
  const { step: replayStep, replay, ref: rootRef } = useReplay({ steps: 1, stepMs: [600] });

  const streamAssistant = useCallback(async (history: LocalMessage[]) => {
    const asstId = `a-${++msgCounter.current}`;
    setStatus("submitted");

    const forTransport: UIMessage[] = history.map((m) => ({
      id: m.id,
      role: m.role,
      parts: m.parts as UIMessage["parts"],
      metadata: {},
    }));

    const ac = new AbortController();
    abortRef.current = ac;

    let stream: ReadableStream<UIMessageChunk>;
    try {
      stream = await transportRef.current.sendMessages({
        trigger: "submit-message",
        chatId: "demo-conversation",
        messages: forTransport,
        abortSignal: ac.signal,
        body: { webSearch: false },
      });
    } catch {
      setStatus("error");
      return;
    }

    setMessages((prev) => [...prev, { id: asstId, role: "assistant", parts: [] }]);
    setStatus("streaming");

    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done || ac.signal.aborted) break;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === asstId ? { ...msg, parts: applyChunk(msg.parts, chunk) } : msg
          )
        );
      }
    } catch {
      /* aborted cleanly */
    } finally {
      reader.releaseLock();
    }

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== asstId) return msg;
        return {
          ...msg,
          parts: msg.parts.map((p) =>
            p.type === "text" ? { ...p, state: "done" as const } : p
          ),
        };
      })
    );
    setStatus("ready");
    abortRef.current = null;
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      const userMsg: LocalMessage = {
        id: `u-${++msgCounter.current}`,
        role: "user",
        parts: [{ type: "text", text: content, state: "done" }],
      };
      const next = [...messages, userMsg];
      setMessages(next);
      await streamAssistant(next);
    },
    [messages, streamAssistant]
  );

  /* Auto-seed: when the demo scrolls into view, send the first turn. */
  useEffect(() => {
    if (replayStep >= 1 && messages.length === 0 && !autoStarted.current) {
      autoStarted.current = true;
      void sendMessage(SEED_MESSAGE);
    }
  }, [replayStep, messages.length, sendMessage]);

  /* Replay resets to empty state so the scroll-entrance runs again. */
  const handleReplay = useCallback(() => {
    autoStarted.current = false;
    abortRef.current?.abort();
    setMessages([]);
    setStatus("ready");
    replay();
  }, [replay]);

  const isStreaming = status === "submitted" || status === "streaming";

  /* Hide chips once a second user turn has been added - keeps the demo tidy. */
  const userTurnCount = messages.filter((m) => m.role === "user").length;
  const showSuggestions = userTurnCount <= 1 && !isStreaming;

  return (
    <DemoFrame
      bleed
      onReplay={handleReplay}
      rootRef={rootRef}
      title={title}
      blurb={blurb}
      caption={["Conversation", "ConversationContent", "Message", "MessageContent", "MessageResponse", "PromptInput", "Suggestion"]}
    >
      <ChatShell>
        <Conversation>
          <ConversationContent className={chatMessagesClass}>
            {messages.map((msg) => {
              if (msg.role === "user") {
                const textPart = msg.parts.find((p) => p.type === "text");
                return (
                  <Message key={msg.id} from="user">
                    <MessageContent>
                      {textPart?.type === "text" ? textPart.text : ""}
                    </MessageContent>
                  </Message>
                );
              }
              const textPart = msg.parts.find((p) => p.type === "text");
              const isAnimating = textPart?.type === "text" && textPart.state === "streaming";
              return (
                <Message key={msg.id} from="assistant">
                  {textPart?.type === "text" && (
                    <MessageResponse isAnimating={isAnimating}>
                      {textPart.text}
                    </MessageResponse>
                  )}
                </Message>
              );
            })}
          </ConversationContent>
        </Conversation>

        <ChatShellInput>
          {showSuggestions && (
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
            <PromptInputTextarea
              disabled={isStreaming}
              placeholder={isStreaming ? "Waiting for response..." : "Ask about your child..."}
              aria-label={isStreaming ? "Prompt - disabled while streaming" : "Prompt"}
            />
            <PromptInputFooter>
              <PromptInputSubmit status={status} />
            </PromptInputFooter>
          </PromptInput>
        </ChatShellInput>
      </ChatShell>
    </DemoFrame>
  );
};
