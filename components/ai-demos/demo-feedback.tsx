"use client";

import { useState } from "react";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { DemoFrame } from "./demo-frame";

/* Illustrates point-of-feedback acknowledgement. Thumbs-down reveals an
   inline notice that confirms receipt without over-promising - the model does
   not silently adapt, so the copy says "flagged" not "we'll improve". */
export const DemoFeedback = () => {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(
    null
  );

  return (
    <DemoFrame
      caption={[
        "Message",
        "MessageResponse",
        "MessageActions",
        "MessageAction",
      ]}
    >
      <div className="flex flex-col gap-3">
        <Message from="assistant">
          <MessageResponse>
            {`Term 2 summary for Priya Nair: strong growth in inferential comprehension, moving from Band 2 to Band 3. Fluency is consolidating - 78 words per minute against a class average of 82. Recommend continued small-group guided reading with a focus on vocabulary in context.`}
          </MessageResponse>

          {feedback === null && (
            <div className="mt-2"><MessageActions>
              <MessageAction
                tooltip="Helpful"
                label="Mark as helpful"
                onClick={() => setFeedback("positive")}
              >
                <ThumbsUp size={14} aria-hidden="true" />
              </MessageAction>
              <MessageAction
                tooltip="Not helpful"
                label="Flag this summary"
                onClick={() => setFeedback("negative")}
              >
                <ThumbsDown size={14} aria-hidden="true" />
              </MessageAction>
            </MessageActions></div>
          )}

          {feedback === "positive" && (
            <p className="mt-2 text-xs text-success">
              Thanks - glad that was useful.
            </p>
          )}

          {feedback === "negative" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Noted - this summary was flagged. It won&apos;t change what
              the model does today.
            </p>
          )}
        </Message>
      </div>
    </DemoFrame>
  );
};
