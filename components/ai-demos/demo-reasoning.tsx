"use client";

import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import { Message, MessageResponse } from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";

const REASONING_TEXT = `First, I need to look at Ahmad's running record data for the current term.
His most recent record shows Band 3 accuracy at 94%, self-correction ratio of 1:4.

Next, the Year 5 mid-year benchmark is Band 3. Ahmad is meeting that expectation.

His comprehension average is 72% — up from 58% last term. That's a meaningful improvement.

Inferential questions are the current development area. His literal recall is strong.

Conclusion: Ahmad is on track for his year level. The reading support plan can continue as-is,
with a continued focus on text inference strategies.`;

export const DemoReasoning = () => (
  <DemoFrame caption={["Reasoning", "ReasoningTrigger", "ReasoningContent"]}>
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <Message from="assistant">
        <Reasoning defaultOpen>
          <ReasoningTrigger />
          <ReasoningContent>{REASONING_TEXT}</ReasoningContent>
        </Reasoning>
        <MessageResponse>
          {"Ahmad is on track for Year 5. His Band 3 accuracy and 72% comprehension average both meet mid-year expectations. Inferential questioning remains the development focus — I'd suggest continuing the current reading plan through Term 3."}
        </MessageResponse>
      </Message>
    </div>
  </DemoFrame>
);
