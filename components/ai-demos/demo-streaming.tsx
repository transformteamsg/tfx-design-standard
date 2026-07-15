"use client";

import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";

/* step 0 = nothing yet
   step 1 = partial text streaming
   step 2 = text complete, shimmer still visible
   step 3 = done (shimmer gone, submit returns to ready) */
const STEP_MS = [0, 2200, 1000, 800];

const PARTIAL_TEXT =
  "Checking attendance and submission records for Class 5A…\n\nThree students have not yet submitted:";
const FULL_TEXT =
  "Checking attendance and submission records for Class 5A…\n\nThree students have not yet submitted:\n\n- Lena K.\n- Marcus T.\n- Priya S.";

/* Illustrates the streaming state: partial assistant message + shimmer above,
   and a PromptInputSubmit locked in stop state (square icon, aria-label "Stop")
   so teachers can interrupt at any moment. The stop control is visible from the
   first token — not hidden or disabled. */
export const DemoStreaming = () => {
  const { step, replay } = useReplay({ steps: 3, stepMs: STEP_MS });

  const isStreaming = step < 3;
  const text = step === 0 ? "" : step < 3 ? PARTIAL_TEXT : FULL_TEXT;

  return (
    <DemoFrame
      caption={["MessageResponse", "Shimmer", "PromptInput (stop state)", "PromptInputSubmit"]}
      onReplay={replay}
    >
      <div className="flex flex-col gap-4">
        <Message from="user">
          <MessageContent>
            Which students in 5A haven&apos;t submitted their reading log this week?
          </MessageContent>
        </Message>

        {step > 0 && (
          <Message from="assistant">
            <MessageResponse isAnimating={step === 1}>
              {text}
            </MessageResponse>
            {isStreaming && (
              <div className="mt-2 pl-1">
                <Shimmer as="p" className="text-sm text-muted-foreground">
                  Retrieving final record from CaseSync…
                </Shimmer>
              </div>
            )}
          </Message>
        )}

        {/* Input is locked in stop state for the duration of streaming.
            The square icon and aria-label="Stop" make the affordance unambiguous. */}
        <div className="border-t border-border pt-3">
          <PromptInput onSubmit={() => {}}>
            <PromptInputTextarea
              disabled={isStreaming}
              placeholder={isStreaming ? "Waiting for response…" : "Ask about your class…"}
              aria-label={isStreaming ? "Prompt — disabled while streaming" : "Prompt"}
            />
            <PromptInputFooter>
              {isStreaming ? (
                <PromptInputSubmit status="streaming" onStop={replay} />
              ) : (
                <PromptInputSubmit />
              )}
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </DemoFrame>
  );
};
