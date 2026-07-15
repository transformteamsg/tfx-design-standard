"use client";

import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import { Message, MessageResponse } from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";

/* Timing:
   step 0 = nothing visible yet
   step 1 = Reasoning opens and streams (isStreaming true → auto-opens)
   step 2 = Reasoning done streaming (isStreaming false → auto-closes after 1000ms)
   step 3 = Final response visible */
const STEP_MS = [0, 2000, 2000, 0];

const REASONING_TEXT = `First, I need to look at Ahmad's running record data for the current term.
His most recent record shows Band 3 accuracy at 94%, self-correction ratio of 1:4.

Next, the Year 5 mid-year benchmark is Band 3. Ahmad is meeting that expectation.

His comprehension average is 72% — up from 58% last term. That's a meaningful improvement.

Inferential questions are the current development area. His literal recall is strong.

Conclusion: Ahmad is on track for his year level. The reading support plan can continue as-is,
with a continued focus on text inference strategies.`;

export const DemoReasoning = () => {
  const { step, replay } = useReplay({ steps: 3, stepMs: STEP_MS });

  /* isStreaming true while step===1 → Reasoning auto-opens
     becomes false at step===2 → Reasoning auto-closes after its 1000ms delay */
  const isStreaming = step === 1;

  return (
    <DemoFrame
      caption={["Reasoning", "ReasoningTrigger", "ReasoningContent"]}
      onReplay={replay}
    >
      <Message from="assistant">
        {step >= 1 && (
          <Reasoning defaultOpen={step === 1} isStreaming={isStreaming}>
            <ReasoningTrigger />
            <ReasoningContent>{REASONING_TEXT}</ReasoningContent>
          </Reasoning>
        )}
        {step >= 3 && (
          <MessageResponse>
            {"Ahmad is on track for Year 5. His Band 3 accuracy and 72% comprehension average both meet mid-year expectations. Inferential questioning remains the development focus — I'd suggest continuing the current reading plan through Term 3."}
          </MessageResponse>
        )}
      </Message>
    </DemoFrame>
  );
};
