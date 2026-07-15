"use client";

import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationSource,
  InlineCitationQuote,
} from "@/components/ai-elements/inline-citation";
import { Message } from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";

const SOURCES = [
  "https://casesync.school/records/5a/running-records",
  "https://casesync.school/benchmarks/year5/literacy",
];

export const DemoInlineCitation = () => (
  <DemoFrame caption={["InlineCitation", "InlineCitationCard", "InlineCitationCardTrigger", "InlineCitationCardBody", "InlineCitationSource", "InlineCitationQuote"]}>
    <Message from="assistant">
        <p className="text-sm text-foreground leading-relaxed">
          Ahmad is currently reading at{" "}
          <InlineCitation>
            <InlineCitationCard>
              <InlineCitationText>Band 3</InlineCitationText>
              <InlineCitationCardTrigger sources={SOURCES} />
              <InlineCitationCardBody>
                <InlineCitationCarousel>
                  <InlineCitationCarouselContent>
                    <InlineCitationCarouselItem>
                      <InlineCitationCarouselHeader>
                        <InlineCitationCarouselIndex />
                        <InlineCitationCarouselPrev />
                        <InlineCitationCarouselNext />
                      </InlineCitationCarouselHeader>
                      <InlineCitationSource
                        title="Term 2 running records — Class 5A"
                        url="https://casesync.school/records/5a/running-records"
                        description="Ahmad Hassan — most recent running record placed at Band 3, 94% accuracy."
                      />
                      <InlineCitationQuote>
                        Band 3 accuracy: 94%. Self-correction ratio 1:4. Text level K.
                      </InlineCitationQuote>
                    </InlineCitationCarouselItem>
                    <InlineCitationCarouselItem>
                      <InlineCitationCarouselHeader>
                        <InlineCitationCarouselIndex />
                        <InlineCitationCarouselPrev />
                        <InlineCitationCarouselNext />
                      </InlineCitationCarouselHeader>
                      <InlineCitationSource
                        title="Year 5 literacy benchmarks"
                        url="https://casesync.school/benchmarks/year5/literacy"
                        description="End-of-year expectation for Year 5 is Band 4. Mid-year expectation is Band 3."
                      />
                      <InlineCitationQuote>
                        Mid-year milestone: Band 3. End-of-year target: Band 4.
                      </InlineCitationQuote>
                    </InlineCitationCarouselItem>
                  </InlineCitationCarouselContent>
                </InlineCitationCarousel>
              </InlineCitationCardBody>
            </InlineCitationCard>
          </InlineCitation>
          {" — meeting mid-year expectations. Comprehension scores have averaged 72% this term, up from 58% in Term 1."}
        </p>
      </Message>
  </DemoFrame>
);
