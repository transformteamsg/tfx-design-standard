"use client";

import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements/sources";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";

const ANSWER =
  "Ahmad has attended 14 of 18 scheduled reading sessions this term. His running record places him at Band 3, on track for his year level. Comprehension responses show strong literal recall; inferential questioning is the current development focus.";

const WORDS = ANSWER.split(" ");

/* Sources appear after the assistant text finishes streaming.
   useReplay drives word-by-word streaming; Sources are shown once complete. */
export const DemoSources = () => {
  const { step, replay, ref } = useReplay({ steps: WORDS.length, stepMs: 55 });

  const displayText = WORDS.slice(0, step).join(" ");
  const isStreaming = step > 0 && step < WORDS.length;
  const isDone = step >= WORDS.length;

  return (
    <DemoFrame
      caption={["Message", "MessageResponse", "Sources", "SourcesTrigger", "SourcesContent", "Source"]}
      onReplay={replay}
      rootRef={ref}
    >
      <div className="flex flex-col gap-4">
        <Message from="user">
          <MessageContent>
            How is Ahmad tracking against year-level benchmarks?
          </MessageContent>
        </Message>

        {step > 0 && (
          <Message from="assistant">
            <MessageResponse isAnimating={isStreaming}>
              {displayText}
            </MessageResponse>

            {isDone && (
              <div className="mt-3"><Sources>
                <SourcesTrigger count={3} />
                <SourcesContent>
                  <Source
                    href="https://casesync.school/records/5a/reading"
                    title="Term 2 reading records - Class 5A"
                  />
                  <Source
                    href="https://casesync.school/students/ahmad-hassan/running-records"
                    title="Running records - Ahmad Hassan"
                  />
                  <Source
                    href="https://casesync.school/benchmarks/year5"
                    title="Year 5 literacy benchmarks"
                  />
                </SourcesContent>
              </Sources></div>
            )}
          </Message>
        )}
      </div>
    </DemoFrame>
  );
};
