"use client";

import { useState, useEffect } from "react";
import { Square } from "lucide-react";
import { DemoFrame } from "./demo-frame";

const FULL_RESPONSE =
  "Ahmad has completed 14 of 18 required reading sessions this term. " +
  "His running record scores place him at band 3 — on track for his year level. " +
  "Comprehension responses show strong literal recall with developing inferential skill.";

/* Simulates a streaming response with a blinking cursor.
   The Stop button halts the stream mid-way — matching the PromptInput
   stop-state pattern from AI Elements (status="streaming"). */
export function DemoStreaming() {
  const [displayed, setDisplayed] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [stopped, setStopped] = useState(false);
  const intervalRef = { current: null as ReturnType<typeof setInterval> | null };

  function start() {
    setStopped(false);
    setDisplayed("");
    setStreaming(true);
  }

  useEffect(() => {
    if (!streaming) return;

    let i = displayed.length;
    intervalRef.current = setInterval(() => {
      i += 1;
      setDisplayed(FULL_RESPONSE.slice(0, i));
      if (i >= FULL_RESPONSE.length) {
        clearInterval(intervalRef.current!);
        setStreaming(false);
      }
    }, 18);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming]);

  function stop() {
    setStreaming(false);
    setStopped(true);
  }

  const idle = !streaming && displayed.length === 0;
  const done = !streaming && !stopped && displayed.length === FULL_RESPONSE.length;

  return (
    <DemoFrame
      caption={["Conversation", "Message", "Loader", "PromptInput (stop state)"]}
    >
      <div className="flex flex-col gap-4">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-tw-blue px-4 py-2.5 text-[14px] leading-relaxed text-white">
            Summarise Ahmad&apos;s reading progress this term
          </div>
        </div>

        {/* Assistant message */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            aria-hidden="true"
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
          >
            AI
          </div>

          <div className="flex-1">
            {idle ? (
              <p className="text-[14px] text-muted-foreground italic">
                Press &ldquo;Send&rdquo; to start the demo…
              </p>
            ) : (
              <div className="min-h-[3em]">
                <p className="text-[14px] leading-relaxed text-foreground">
                  {displayed}
                  {streaming && (
                    <span
                      aria-hidden="true"
                      className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-tw-blue align-middle"
                    />
                  )}
                </p>
                {stopped && (
                  <p className="mt-1.5 text-[12px] text-muted-foreground">
                    Response stopped.
                  </p>
                )}
                {done && (
                  <p className="mt-1.5 text-[12px] text-muted-foreground">
                    Response complete.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Prompt input row (stop / send state) */}
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-2.5">
          <span className="flex-1 text-[14px] text-muted-foreground">
            Ask about a student or class…
          </span>
          {streaming ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop generating"
              className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-border-strong hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
            >
              <Square size={12} aria-hidden="true" />
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              aria-label="Send message"
              className="rounded-md bg-tw-blue px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-tw-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
            >
              Send
            </button>
          )}
        </div>
      </div>
    </DemoFrame>
  );
}
