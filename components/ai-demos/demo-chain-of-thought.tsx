"use client";

import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
  ChainOfThoughtContent,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
} from "@/components/ai-elements/chain-of-thought";
import { Message, MessageResponse } from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";
import { BookOpen, FileText, Search } from "lucide-react";
import { useReplay } from "./use-replay";

/* Steps:
   step 0 = header visible, panel open, no steps yet
   step 1 = first ChainOfThoughtStep (search) appears
   step 2 = second step (running records + results) appears
   step 3 = third step (benchmarks) appears
   step 4 = panel stays open but final response appears below */
const STEP_MS = [0, 700, 900, 900, 800];

export const DemoChainOfThought = () => {
  const { step, replay, ref } = useReplay({ steps: 4, stepMs: STEP_MS });

  // Panel stays open while steps are streaming (steps 0-3); close hint on final state
  const isOpen = step < 4 ? true : undefined;

  return (
    <DemoFrame
      caption={[
        "ChainOfThought",
        "ChainOfThoughtHeader",
        "ChainOfThoughtStep",
        "ChainOfThoughtContent",
        "ChainOfThoughtSearchResults",
        "ChainOfThoughtSearchResult",
      ]}
      onReplay={replay}
      rootRef={ref}
    >
      <Message from="assistant">
        <ChainOfThought open={isOpen} defaultOpen>
          <ChainOfThoughtHeader>Checking reading records for 5A</ChainOfThoughtHeader>
          <ChainOfThoughtContent>
            {step >= 1 && (
              <ChainOfThoughtStep
                icon={Search}
                label="Looked up current enrolment for Class 5A"
                description="Found 32 students active this term."
                status={step >= 2 ? "complete" : "active"}
              />
            )}
            {step >= 2 && (
              <ChainOfThoughtStep
                icon={BookOpen}
                label="Retrieved running records from CaseSync"
                description="28 of 32 students have at least one record this term."
                status={step >= 3 ? "complete" : "active"}
              >
                <ChainOfThoughtSearchResults>
                  <ChainOfThoughtSearchResult>5a-running-records-t3.csv</ChainOfThoughtSearchResult>
                  <ChainOfThoughtSearchResult>5a-running-records-t2.csv</ChainOfThoughtSearchResult>
                </ChainOfThoughtSearchResults>
              </ChainOfThoughtStep>
            )}
            {step >= 3 && (
              <ChainOfThoughtStep
                icon={FileText}
                label="Checked year-level benchmarks"
                description="Mid-year Band 3 is the expected standard. 6 students are reading below benchmark."
                status="complete"
              />
            )}
          </ChainOfThoughtContent>
        </ChainOfThought>
        {step >= 4 && (
          <MessageResponse>
            {"28 of 32 students in Class 5A have running records this term. 6 students are reading below the mid-year Band 3 benchmark - I've flagged them for follow-up. Would you like a breakdown by student?"}
          </MessageResponse>
        )}
      </Message>
    </DemoFrame>
  );
};
