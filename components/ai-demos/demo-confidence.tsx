"use client";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";

/* Illustrates categorical confidence labelling — plain-language bands (High /
   Low) with a source count, never a percentage. Two side-by-side examples show
   the full range: a well-evidenced prediction and a data-thin one. */
export const DemoConfidence = () => (
  <DemoFrame
    caption={["Message", "MessageResponse", "confidence label (TFX pattern)"]}
  >
    <div className="flex flex-col gap-4">
      {/* Example 1 — High confidence */}
      <Message from="assistant">
        <MessageResponse>
          {"Ahmad's predicted reading band for Term 3 is **Band 4**."}
        </MessageResponse>
        <div className="mt-2 flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 shrink-0 rounded-full bg-success-9"
          />
          <span className="text-xs text-success">
            High confidence &mdash; based on 14 running records
          </span>
        </div>
      </Message>

      {/* Example 2 — Low confidence */}
      <Message from="assistant">
        <MessageResponse>
          {"Priya's predicted reading band for Term 3 is **Band 3**."}
        </MessageResponse>
        <div className="mt-2 flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 shrink-0 rounded-full bg-warning-muted"
          />
          <span className="text-xs text-warning">
            Low confidence &mdash; only 2 records this term; treat as a starting point
          </span>
        </div>
      </Message>
    </div>
  </DemoFrame>
);
