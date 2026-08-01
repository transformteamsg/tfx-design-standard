"use client";

import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationSource,
  InlineCitationQuote,
} from "@/components/ai-elements/inline-citation";
import { Message } from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";

/* One InlineCitation with a single source + quote stacked directly in
   InlineCitationCardBody. No carousel - one source is enough to show the
   pattern cleanly. A parent asks about their child's reading level; the
   assistant sentence streams in via useReplay, then the citation badge
   appears, then the trailing clause streams in. */

const SOURCES = ["https://school.example/records/class/progress-checks"];

const SEGMENT_A = "Sofia is currently reading at";
const SEGMENT_B = "- meeting mid-year expectations for Year 5.";

const WORDS_A = SEGMENT_A.split(" ");
const WORDS_B = SEGMENT_B.split(" ");
const TOTAL_STEPS = WORDS_A.length + 1 + WORDS_B.length; // +1 for the citation badge

export const DemoInlineCitation = ({ title, blurb }: { title?: string; blurb?: string }) => {
  const { step, replay, ref } = useReplay({ steps: TOTAL_STEPS, stepMs: 60 });

  const segAWords = Math.min(step, WORDS_A.length);
  const showCitation = step > WORDS_A.length;
  const segBWords = Math.max(0, step - WORDS_A.length - 1);

  const textA = WORDS_A.slice(0, segAWords).join(" ");
  const textB = WORDS_B.slice(0, segBWords).join(" ");

  return (
    <DemoFrame
      caption={["InlineCitation", "InlineCitationCard", "InlineCitationCardTrigger", "InlineCitationCardBody", "InlineCitationSource", "InlineCitationQuote"]}
      onReplay={replay}
      rootRef={ref}
      title={title}
      blurb={blurb}
    >
      <Message from="assistant">
        {step > 0 && (
          <p className="text-sm leading-relaxed text-foreground">
            {textA}
            {showCitation && (
              <>
                {" "}
                <InlineCitation>
                  <InlineCitationCard>
                    <InlineCitationText>level 4</InlineCitationText>
                    <InlineCitationCardTrigger sources={SOURCES} />
                    <InlineCitationCardBody>
                      <div className="p-4 space-y-3">
                        <InlineCitationSource
                          title="This term's progress checks - your class"
                          url="https://school.example/records/class/progress-checks"
                          description="Sofia Larsen - most recent progress check placed her at level 4, 94% accuracy."
                        />
                        <InlineCitationQuote>
                          Level 4 accuracy: 94%. Self-correction ratio 1:4. Text level K.
                        </InlineCitationQuote>
                      </div>
                    </InlineCitationCardBody>
                  </InlineCitationCard>
                </InlineCitation>
              </>
            )}
            {segBWords > 0 && ` ${textB}`}
          </p>
        )}
      </Message>
    </DemoFrame>
  );
};
