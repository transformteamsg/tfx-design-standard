"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { BookOpen } from "lucide-react";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";

/* Illustrates ConversationEmptyState. Title names the scope; description
   states one clear capability and one honest limitation. Suggestion chips
   are live - clicking one fires a short streamed mock reply so the demo
   transitions from empty state to a real conversation thread. */

interface ChatMessage {
  from: "user" | "assistant";
  text: string;
}

const REPLIES: Record<string, string> = {
  "Summarise 5A this term":
    "5A had a solid term overall. Reading bands are tracking at or above benchmark for 18 of 22 students. Writing fluency has improved across the board since the structured sentence work in weeks 3-5. Four students - Jay, Priya, Marco, and Leila - would benefit from a targeted check-in before end-of-term reports.",
  "Draft comments for Ahmad":
    "Ahmad has shown consistent effort in reading this term. He is meeting year-level benchmarks and has demonstrated strong literal comprehension skills. His next step is to build on inferential thinking - asking 'why' questions as he reads will help with this.",
  "Who needs a check-in?":
    "Based on this term's records, three students are worth a check-in before reports: Jay (reading band dropped one level in week 7), Priya (only 2 running records this term - data is thin), and Marco (strong academically but three unexplained absences in weeks 6-9).",
};

const WORD_DELAY_MS = 55;

export const DemoEmptyState = () => {
  const { ref, reduced } = useReplay({ steps: 1, stepMs: 400 });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const streamTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* Clear any in-flight timers when unmounting */
  useEffect(() => {
    return () => {
      for (const t of streamTimers.current) {
        clearTimeout(t);
      }
    };
  }, []);

  const startStream = useCallback(
    (userText: string) => {
      /* Abort if already streaming */
      if (streamingText !== null) return;

      const reply = REPLIES[userText] ?? "I don't have enough data to answer that right now.";
      const words = reply.split(" ");

      /* Add the user message immediately */
      setMessages((prev) => [...prev, { from: "user", text: userText }]);

      /* Clear old timers */
      for (const t of streamTimers.current) {
        clearTimeout(t);
      }
      streamTimers.current = [];

      if (reduced) {
        /* Skip animation - jump straight to final */
        setStreamingText(null);
        setMessages((prev) => [...prev, { from: "assistant", text: reply }]);
        return;
      }

      /* Kick off word-by-word streaming */
      setStreamingText("");

      let accumulated = "";
      words.forEach((word, i) => {
        const t = setTimeout(() => {
          accumulated += (i === 0 ? "" : " ") + word;
          setStreamingText(accumulated);

          if (i === words.length - 1) {
            /* Streaming done - promote to settled message */
            setMessages((prev) => [...prev, { from: "assistant", text: reply }]);
            setStreamingText(null);
          }
        }, i * WORD_DELAY_MS);
        streamTimers.current.push(t);
      });
    },
    [streamingText, reduced]
  );

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      startStream(suggestion);
    },
    [startStream]
  );

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const value = message.text.trim();
      if (!value) return;
      startStream(value);
    },
    [startStream]
  );

  const isStreaming = streamingText !== null;
  const hasMessages = messages.length > 0;

  return (
    <DemoFrame
      caption={["ConversationEmptyState", "Suggestion", "MessageResponse"]}
      rootRef={ref}
    >
      <div className="flex h-[420px] flex-col overflow-hidden">
        <Conversation className="flex-1">
          <ConversationContent>
            {!hasMessages && !isStreaming ? (
              <ConversationEmptyState
                icon={<BookOpen className="size-6" aria-hidden="true" />}
                title="Ask about your classes"
                description="I can summarise records and draft comments for your classes. I can't change marks or send anything without you."
              />
            ) : (
              <div className="flex flex-col gap-3 py-2">
                {messages.map((msg, i) => (
                  <Message key={i} from={msg.from}>
                    {msg.from === "user" ? (
                      <MessageContent>{msg.text}</MessageContent>
                    ) : (
                      <MessageResponse>{msg.text}</MessageResponse>
                    )}
                  </Message>
                ))}

                {isStreaming && (
                  <Message from="assistant">
                    <MessageResponse isAnimating>
                      {streamingText}
                    </MessageResponse>
                  </Message>
                )}
              </div>
            )}
          </ConversationContent>
        </Conversation>

        {/* Suggestions + input */}
        <div className="border-t border-border px-3 pb-3 pt-2">
          {!hasMessages && !isStreaming && (
            <div className="mb-2">
              <Suggestions>
                <Suggestion
                  suggestion="Summarise 5A this term"
                  onClick={handleSuggestion}
                />
                <Suggestion
                  suggestion="Draft comments for Ahmad"
                  onClick={handleSuggestion}
                />
                <Suggestion
                  suggestion="Who needs a check-in?"
                  onClick={handleSuggestion}
                />
              </Suggestions>
            </div>
          )}

          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              placeholder="Ask about a student or class..."
              disabled={isStreaming}
            />
            <PromptInputFooter>
              <PromptInputSubmit disabled={isStreaming} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </DemoFrame>
  );
};
