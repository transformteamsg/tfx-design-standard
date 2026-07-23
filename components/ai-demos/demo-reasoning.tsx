"use client";

import { useEffect, useRef, useState } from "react";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import { Message, MessageResponse } from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";

/* Timing:
   step 0 = nothing
   step 1 = Reasoning opens, content begins streaming (isStreaming true)
   step 2 = Reasoning done - isStreaming false -> auto-collapses after 1 s
   step 3 = Final response appears */
const STEP_MS = [0, 2200, 2200, 200];

const REASONING_WORDS = `First, I need to look at Ahmad's running record data for the current term. His most recent record shows Band 3 accuracy at 94%, self-correction ratio of 1:4. Next, the Year 5 mid-year benchmark is Band 3. Ahmad is meeting that expectation. His comprehension average is 72% - up from 58% last term. That is a meaningful improvement. Inferential questions are the current development area. His literal recall is strong. Conclusion: Ahmad is on track for his year level. The reading support plan can continue as-is, with a continued focus on text inference strategies.`.split(
  " "
);

const WORD_MS = 60;

export const DemoReasoning = () => {
  const { step, replay, ref } = useReplay({ steps: 3, stepMs: STEP_MS });

  // Word-by-word streaming while step === 1
  const [wordCount, setWordCount] = useState(0);
  const tickTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (step === 1) {
      setWordCount(0);
      tickTimersRef.current = [];
      let current = 0;
      const tick = () => {
        current++;
        setWordCount(current);
        if (current < REASONING_WORDS.length) {
          const id = setTimeout(tick, WORD_MS);
          tickTimersRef.current.push(id);
        }
      };
      const id = setTimeout(tick, WORD_MS);
      tickTimersRef.current.push(id);
      return () => {
        for (const t of tickTimersRef.current) {
          clearTimeout(t);
        }
        tickTimersRef.current = [];
      };
    }
    if (step >= 2) {
      setWordCount(REASONING_WORDS.length);
    }
  }, [step]);

  const isStreaming = step === 1;
  const streamedText = REASONING_WORDS.slice(0, wordCount).join(" ");

  return (
    <DemoFrame
      caption={["Reasoning", "ReasoningTrigger", "ReasoningContent"]}
      onReplay={replay}
      rootRef={ref}
    >
      <Message from="assistant">
        {step >= 1 && (
          <Reasoning isStreaming={isStreaming}>
            <ReasoningTrigger />
            <ReasoningContent>{streamedText}</ReasoningContent>
          </Reasoning>
        )}
        {step >= 3 && (
          <MessageResponse>
            {"Ahmad is on track for Year 5. His Band 3 accuracy and 72% comprehension average both meet mid-year expectations. Inferential questioning remains the development focus - I'd suggest continuing the current reading plan through Term 3."}
          </MessageResponse>
        )}
      </Message>
    </DemoFrame>
  );
};
