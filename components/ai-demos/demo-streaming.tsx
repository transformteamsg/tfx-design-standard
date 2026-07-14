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

/* Illustrates the streaming state: partial assistant message + shimmer above,
   and a PromptInputSubmit locked in stop state (square icon, aria-label "Stop")
   so teachers can interrupt at any moment. The stop control is visible from the
   first token — not hidden or disabled. */
export const DemoStreaming = () => (
  <DemoFrame caption={["MessageResponse", "Shimmer", "PromptInput (stop state)", "PromptInputSubmit"]}>
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <Message from="user">
        <MessageContent>
          Which students in 5A haven&apos;t submitted their reading log this week?
        </MessageContent>
      </Message>
      <Message from="assistant">
        <MessageResponse isAnimating>
          {"Checking attendance and submission records for Class 5A…\n\nThree students have not yet submitted:"}
        </MessageResponse>
        <div className="mt-2 pl-1">
          <Shimmer as="p" className="text-sm text-muted-foreground">
            Retrieving final record from CaseSync…
          </Shimmer>
        </div>
      </Message>
      {/* Input is locked in stop state for the duration of streaming.
          The square icon and aria-label="Stop" make the affordance unambiguous. */}
      <div className="border-t border-border pt-3">
        <PromptInput onSubmit={() => {}}>
          <PromptInputTextarea
            disabled
            placeholder="Waiting for response…"
            aria-label="Prompt — disabled while streaming"
          />
          <PromptInputFooter>
            <PromptInputSubmit status="streaming" onStop={() => {}} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  </DemoFrame>
);
