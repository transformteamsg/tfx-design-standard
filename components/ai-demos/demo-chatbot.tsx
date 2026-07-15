"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatStatus, UIMessage, UIMessageChunk } from "ai";
import { BotMessageSquare } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements/sources";
import {
  Suggestion,
  Suggestions,
} from "@/components/ai-elements/suggestion";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectValue,
} from "@/components/ai-elements/prompt-input";
import { DemoFrame } from "./demo-frame";
import {
  ChatShell,
  ChatShellInput,
  chatMessagesClass,
  chatScrollClass,
} from "./chat-shell";
import { MockChatTransport } from "./mock-chat";

/* Singleton transport per component tree — one abort scope per demo mount. */
const transport = new MockChatTransport();

const SUGGESTIONS = [
  "Summarise Ahmad's reading progress",
  "Flag students below Band 2",
  "Draft an end-of-term comment",
] as const;

const MODELS = [
  { value: "assist", label: "TFX Assist" },
  { value: "assist-mini", label: "TFX Assist Mini" },
] as const;

/* ── Local types mirroring the UIMessage shape we build up ──────────────── */

type TextPart = { type: "text"; text: string; state: "streaming" | "done" };
type ReasoningPart = { type: "reasoning"; text: string; state: "streaming" | "done" };
type SourceUrlPart = { type: "source-url"; sourceId: string; url: string; title?: string };
type MsgPart = TextPart | ReasoningPart | SourceUrlPart;

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  parts: MsgPart[];
}

/* ── Flagship chatbot demo ───────────────────────────────────────────────── */
/* Wires directly to MockChatTransport (no network calls, no useChat hook).   *
 * Renders reasoning panels and source citations when present.                 *
 * Model picker is visual-only. Height is content-driven (max-h + scroll).   */
export function DemoChatbot() {
  const [model, setModel] = useState<string>("assist");
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const abortRef = useRef<AbortController | null>(null);
  const msgCounter = useRef(0);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    /* Build a UIMessage list for the transport (it expects the full history). */
    const userMsgId = `u-${++msgCounter.current}`;
    const asstMsgId = `a-${++msgCounter.current}`;

    const userMsg: LocalMessage = {
      id: userMsgId,
      role: "user",
      parts: [{ type: "text", text: content, state: "done" }],
    };

    setMessages((prev) => [...prev, userMsg]);
    setStatus("submitted");

    /* The transport expects UIMessage[] — our LocalMessage is compatible
       because we only use the parts it reads (role + text parts). */
    const historyForTransport: UIMessage[] = [...messages, userMsg].map((m) => ({
      id: m.id,
      role: m.role,
      parts: m.parts as UIMessage["parts"],
      metadata: {},
    }));

    const ac = new AbortController();
    abortRef.current = ac;

    let stream: ReadableStream<UIMessageChunk>;
    try {
      stream = await transport.sendMessages({
        trigger: "submit-message",
        chatId: "demo",
        messages: historyForTransport,
        abortSignal: ac.signal,
      });
    } catch {
      setStatus("error");
      return;
    }

    /* Seed the assistant message slot so it appears immediately. */
    setMessages((prev) => [
      ...prev,
      { id: asstMsgId, role: "assistant", parts: [] },
    ]);
    setStatus("streaming");

    /* Read chunks and fold them into the assistant message's parts. */
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done || ac.signal.aborted) break;

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== asstMsgId) return msg;
            return { ...msg, parts: applyChunk(msg.parts, chunk) };
          })
        );
      }
    } catch {
      /* aborted or stream error — leave whatever we have */
    } finally {
      reader.releaseLock();
    }

    /* Mark all streaming parts as done. */
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== asstMsgId) return msg;
        return {
          ...msg,
          parts: msg.parts.map((p) =>
            p.type === "text" || p.type === "reasoning"
              ? { ...p, state: "done" as const }
              : p
          ),
        };
      })
    );

    setStatus(ac.signal.aborted ? "ready" : "ready");
    abortRef.current = null;
  }, [messages]);

  const isStreaming = status === "submitted" || status === "streaming";

  return (
    <DemoFrame
      bleed
      caption={[
        "Conversation",
        "ConversationEmptyState",
        "Message",
        "MessageResponse",
        "Reasoning",
        "Sources",
        "PromptInput",
        "Suggestion",
        "PromptInputSelect",
      ]}
    >
      {/* DemoFrame figure is the surface — no inner bordered box (SLP-4).
          The flagship chatbot grows unboundedly, so it keeps an internal
          scroll region; Conversation provides stick-to-bottom while streaming. */}
      <ChatShell>

        {/* Message list */}
        <Conversation className={chatScrollClass}>
          <ConversationContent className={chatMessagesClass}>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<BotMessageSquare className="size-8" aria-hidden="true" />}
                title="Ask TFX Assist"
                description="Get summaries, flag students, or draft comments — all from your class data."
              />
            ) : (
              messages.map((msg) => {
                if (msg.role === "user") {
                  const textPart = msg.parts.find((p) => p.type === "text");
                  return (
                    <Message key={msg.id} from="user">
                      <MessageContent>
                        {textPart && textPart.type === "text" ? textPart.text : ""}
                      </MessageContent>
                    </Message>
                  );
                }

                /* Assistant message — render reasoning, sources, then text. */
                const reasoningPart = msg.parts.find((p) => p.type === "reasoning");
                const sourceParts = msg.parts.filter((p) => p.type === "source-url");
                const textPart = msg.parts.find((p) => p.type === "text");

                const isReasoningStreaming =
                  reasoningPart?.type === "reasoning" &&
                  reasoningPart.state === "streaming";
                const isTextStreaming =
                  textPart?.type === "text" && textPart.state === "streaming";

                return (
                  <Message key={msg.id} from="assistant">
                    {/* Reasoning panel — auto-opens while streaming, collapses after */}
                    {reasoningPart && reasoningPart.type === "reasoning" && (
                      <Reasoning isStreaming={isReasoningStreaming}>
                        <ReasoningTrigger />
                        <ReasoningContent>
                          {reasoningPart.text}
                        </ReasoningContent>
                      </Reasoning>
                    )}

                    {/* Sources (collapsible) */}
                    {sourceParts.length > 0 && (
                      <Sources>
                        <SourcesTrigger count={sourceParts.length} />
                        <SourcesContent>
                          {sourceParts.map((src) => {
                            if (src.type !== "source-url") return null;
                            return (
                              <Source
                                key={src.sourceId}
                                href={src.url}
                                title={src.title ?? src.url}
                              />
                            );
                          })}
                        </SourcesContent>
                      </Sources>
                    )}

                    {/* Main response text */}
                    {textPart && textPart.type === "text" && (
                      <MessageResponse isAnimating={isTextStreaming}>
                        {textPart.text}
                      </MessageResponse>
                    )}
                  </Message>
                );
              })
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input area */}
        <ChatShellInput>
          {/* Suggestion chips — only shown before the first message */}
          {messages.length === 0 && (
            <Suggestions className="mb-2">
              {SUGGESTIONS.map((s) => (
                <Suggestion
                  key={s}
                  suggestion={s}
                  onClick={() => { void sendMessage(s); }}
                />
              ))}
            </Suggestions>
          )}

          <PromptInput
            onSubmit={(msg) => {
              void sendMessage(msg.text.trim());
            }}
          >
            <PromptInputTextarea
              disabled={isStreaming}
              placeholder={isStreaming ? "Waiting for response…" : "Ask about your class…"}
              aria-label={isStreaming ? "Prompt — disabled while streaming" : "Prompt"}
            />

            <PromptInputFooter>
              {/* Model picker — visual only, not wired to transport */}
              <PromptInputSelect value={model} onValueChange={(v) => setModel(String(v))}>
                <PromptInputSelectTrigger aria-label="Select model">
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {MODELS.map((m) => (
                    <PromptInputSelectItem key={m.value} value={m.value}>
                      {m.label}
                    </PromptInputSelectItem>
                  ))}
                </PromptInputSelectContent>
              </PromptInputSelect>

              {/* Submit / stop — status drives the icon automatically */}
              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
        </ChatShellInput>
      </ChatShell>
    </DemoFrame>
  );
}

/* ── Chunk reducer ───────────────────────────────────────────────────────── */
/* Folds one UIMessageChunk into the existing parts array.                    */

function applyChunk(parts: MsgPart[], chunk: UIMessageChunk): MsgPart[] {
  switch (chunk.type) {
    case "reasoning-start":
      return [...parts, { type: "reasoning", text: "", state: "streaming" }];

    case "reasoning-delta": {
      const idx = parts.findLastIndex((p) => p.type === "reasoning");
      if (idx === -1) return parts;
      const next = [...parts];
      const p = next[idx];
      if (p.type === "reasoning") {
        next[idx] = { ...p, text: p.text + chunk.delta };
      }
      return next;
    }

    case "reasoning-end": {
      const idx = parts.findLastIndex((p) => p.type === "reasoning");
      if (idx === -1) return parts;
      const next = [...parts];
      const p = next[idx];
      if (p.type === "reasoning") {
        next[idx] = { ...p, state: "done" };
      }
      return next;
    }

    case "source-url":
      return [
        ...parts,
        {
          type: "source-url",
          sourceId: chunk.sourceId,
          url: chunk.url,
          title: chunk.title,
        },
      ];

    case "text-start":
      return [...parts, { type: "text", text: "", state: "streaming" }];

    case "text-delta": {
      const idx = parts.findLastIndex((p) => p.type === "text");
      if (idx === -1) return parts;
      const next = [...parts];
      const p = next[idx];
      if (p.type === "text") {
        next[idx] = { ...p, text: p.text + chunk.delta };
      }
      return next;
    }

    case "text-end": {
      const idx = parts.findLastIndex((p) => p.type === "text");
      if (idx === -1) return parts;
      const next = [...parts];
      const p = next[idx];
      if (p.type === "text") {
        next[idx] = { ...p, state: "done" };
      }
      return next;
    }

    default:
      return parts;
  }
}
