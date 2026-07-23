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
   pattern cleanly. The assistant sentence streams in via useReplay, then the
   citation badge appears, then the trailing clause streams in. */

const SOURCES = ["https://casesync.school/records/5a/running-records"];

const SEGMENT_A = "Ahmad is currently reading at";
const SEGMENT_B = "- meeting mid-year expectations for Year 5.";

const WORDS_A = SEGMENT_A.split(" ");
const WORDS_B = SEGMENT_B.split(" ");
const TOTAL_STEPS = WORDS_A.length + 1 + WORDS_B.length; // +1 for the citation badge

export const DemoInlineCitation = () => {
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
                    <InlineCitationText>Band 3</InlineCitationText>
                    <InlineCitationCardTrigger sources={SOURCES} />
                    <InlineCitationCardBody>
                      <div className="p-4 space-y-3">
                        <InlineCitationSource
                          title="Term 2 running records - Class 5A"
                          url="https://casesync.school/records/5a/running-records"
                          description="Ahmad Hassan - most recent running record placed at Band 3, 94% accuracy."
                        />
                        <InlineCitationQuote>
                          Band 3 accuracy: 94%. Self-correction ratio 1:4. Text level K.
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
