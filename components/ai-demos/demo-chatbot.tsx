"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatStatus, UIMessage, UIMessageChunk } from "ai";
import { BotMessageSquare, CheckIcon, CopyIcon, GlobeIcon, RefreshCcwIcon } from "lucide-react";
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
  MessageActions,
  MessageAction,
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
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { Loader } from "@/components/ai-elements/loader";
import { DemoFrame } from "./demo-frame";
import {
  ChatShell,
  ChatShellInput,
  chatMessagesClass,
  chatScrollClass,
} from "./chat-shell";
import { MockChatTransport } from "./mock-chat";
import { useReplay } from "./use-replay";

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
  const [webSearch, setWebSearch] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const abortRef = useRef<AbortController | null>(null);
  const msgCounter = useRef(0);
  const transportRef = useRef<MockChatTransport>(new MockChatTransport());

  /* Scroll-into-view entrance: when the demo scrolls into view (step goes to 1),
     auto-send the first suggestion so the empty state animates to life. */
  const { step: replayStep, replay, ref: rootRef } = useReplay({ steps: 1, stepMs: [800] });
  const autoStarted = useRef(false);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /* Streams one assistant turn for the given history. Shared by send and
     regenerate so the streaming logic lives in a single place. */
  const streamAssistant = useCallback(
    async (history: LocalMessage[]) => {
      const asstMsgId = `a-${++msgCounter.current}`;
      setStatus("submitted");

      const historyForTransport: UIMessage[] = history.map((m) => ({
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
          chatId: "demo",
          messages: historyForTransport,
          abortSignal: ac.signal,
          /* Model + web-search are visual toggles; the mock reads webSearch to
             decide whether to return Sources (mirrors perplexity/sonar). */
          body: { model, webSearch },
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
            prev.map((msg) =>
              msg.id === asstMsgId
                ? { ...msg, parts: applyChunk(msg.parts, chunk) }
                : msg
            )
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

      setStatus("ready");
      abortRef.current = null;
    },
    [model, webSearch]
  );

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

  /* Retry: drop the trailing assistant turn and regenerate from the last
     user message — the mock re-streams a fresh reply. */
  const regenerate = useCallback(async () => {
    const lastUserIdx = messages.map((m) => m.role).lastIndexOf("user");
    if (lastUserIdx === -1) return;
    const trimmed = messages.slice(0, lastUserIdx + 1);
    setMessages(trimmed);
    await streamAssistant(trimmed);
  }, [messages, streamAssistant]);

  /* When the demo scrolls into view for the first time, auto-send the first
     suggestion so the empty state animates to life. Guard with autoStarted so
     replay() from the header button does NOT re-trigger the auto-send. */
  useEffect(() => {
    if (replayStep >= 1 && messages.length === 0 && !autoStarted.current) {
      autoStarted.current = true;
      void sendMessage(SUGGESTIONS[0]);
    }
  }, [replayStep, messages.length, sendMessage]);

  /* Reset the auto-start guard when the user manually hits Replay so the next
     scroll-in-view can trigger again cleanly. */
  const handleReplay = useCallback(() => {
    autoStarted.current = false;
    setMessages([]);
    setStatus("ready");
    abortRef.current?.abort();
    replay();
  }, [replay]);

  const isStreaming = status === "submitted" || status === "streaming";
  const lastMessageId = messages[messages.length - 1]?.id;

  return (
    <DemoFrame
      bleed
      onReplay={handleReplay}
      rootRef={rootRef}
      caption={[
        "Conversation",
        "ConversationEmptyState",
        "Message",
        "MessageResponse",
        "MessageActions",
        "Reasoning",
        "Sources",
        "Loader",
        "PromptInput",
        "PromptInputTools",
        "PromptInputButton",
        "ModelSelector",
        "Suggestion",
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
                description="Get summaries, flag students, or draft comments - all from your class data."
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

                    {/* Copy / Retry — on the last completed assistant turn only */}
                    {msg.id === lastMessageId &&
                      !isStreaming &&
                      textPart?.type === "text" &&
                      textPart.state === "done" && (
                        <MessageActions>
                          <MessageAction onClick={() => { void regenerate(); }} label="Retry">
                            <RefreshCcwIcon className="size-3" aria-hidden="true" />
                          </MessageAction>
                          <MessageAction
                            onClick={() => navigator.clipboard.writeText(textPart.text)}
                            label="Copy"
                          >
                            <CopyIcon className="size-3" aria-hidden="true" />
                          </MessageAction>
                        </MessageActions>
                      )}
                  </Message>
                );
              })
            )}

            {/* Pending indicator — shows in the window before the first token */}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input area */}
        <ChatShellInput>
          {/* Suggestion chips — only shown before the first message */}
          {messages.length === 0 && (
            <div className="mb-2">
              <Suggestions>
                {SUGGESTIONS.map((s) => (
                  <Suggestion
                    key={s}
                    suggestion={s}
                    onClick={() => { void sendMessage(s); }}
                  />
                ))}
              </Suggestions>
            </div>
          )}

          <PromptInput
            onSubmit={(msg) => {
              void sendMessage(msg.text.trim());
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea
                disabled={isStreaming}
                placeholder={isStreaming ? "Waiting for response…" : "Ask about your class…"}
                aria-label={isStreaming ? "Prompt - disabled while streaming" : "Prompt"}
              />
            </PromptInputBody>

            <PromptInputFooter>
              <PromptInputTools>
                {/* Web-search toggle — when on, replies cite Sources (mirrors
                    a search-enabled model). Off by default. */}
                <PromptInputButton
                  type="button"
                  variant={webSearch ? "default" : "ghost"}
                  aria-pressed={webSearch}
                  aria-label="Toggle web search"
                  onClick={() => setWebSearch((v) => !v)}
                >
                  <GlobeIcon className="size-4" aria-hidden="true" />
                  <span className="text-xs">Search</span>
                </PromptInputButton>

                {/* Model picker — visual only, not wired to transport */}
                <ModelSelector>
                  <ModelSelectorTrigger
                    render={
                      <PromptInputButton type="button" aria-label="Select model">
                        <span>{MODELS.find((m) => m.value === model)?.label}</span>
                      </PromptInputButton>
                    }
                  />
                  <ModelSelectorContent title="Select model">
                    <ModelSelectorInput placeholder="Search models…" />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No model found.</ModelSelectorEmpty>
                      <ModelSelectorGroup heading="TFX models">
                        {MODELS.map((m) => (
                          <ModelSelectorItem
                            key={m.value}
                            value={m.value}
                            onSelect={() => setModel(m.value)}
                          >
                            <span className="flex-1 truncate text-left">{m.label}</span>
                            {model === m.value && (
                              <CheckIcon className="size-4" aria-hidden="true" />
                            )}
                          </ModelSelectorItem>
                        ))}
                      </ModelSelectorGroup>
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>

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
