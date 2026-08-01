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
  "You've completed 14 of 18 scheduled reading sessions this term. Your latest progress check places you at level 4, on track for your year level. Your comprehension answers show strong literal recall - inferential questioning is your current development focus.";

const WORDS = ANSWER.split(" ");

/* Sources appear after the assistant text finishes streaming.
   useReplay drives word-by-word streaming; Sources are shown once complete. */
export const DemoSources = ({ title, blurb }: { title?: string; blurb?: string }) => {
  const { step, replay, ref } = useReplay({ steps: WORDS.length, stepMs: 55 });

  const displayText = WORDS.slice(0, step).join(" ");
  const isStreaming = step > 0 && step < WORDS.length;
  const isDone = step >= WORDS.length;

  return (
    <DemoFrame
      caption={["Message", "MessageResponse", "Sources", "SourcesTrigger", "SourcesContent", "Source"]}
      onReplay={replay}
      rootRef={ref}
      title={title}
      blurb={blurb}
    >
      <div className="flex flex-col gap-4">
        <Message from="user">
          <MessageContent>
            How am I tracking against year-level benchmarks?
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
                    href="https://school.example/records/class/reading"
                    title="This term's reading records - your class"
                  />
                  <Source
                    href="https://school.example/students/me/progress-checks"
                    title="Your progress checks"
                  />
                  <Source
                    href="https://school.example/benchmarks/year5"
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
