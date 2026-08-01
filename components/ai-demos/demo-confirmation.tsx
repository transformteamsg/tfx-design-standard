"use client";

import { useState } from "react";
import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationActions,
  ConfirmationAction,
  ConfirmationAccepted,
  ConfirmationRejected,
} from "@/components/ai-elements/confirmation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";

type ConfState = "approval-requested" | "approval-responded";
type Approved = boolean | undefined;

export const DemoConfirmation = ({ title, blurb }: { title?: string; blurb?: string }) => {
  const { replay, ref } = useReplay({ steps: 1, stepMs: [0] });

  const [state, setState] = useState<ConfState>("approval-requested");
  const [approved, setApproved] = useState<Approved>(undefined);

  const approval =
    approved === undefined
      ? { id: "share-progress-summaries-v1" }
      : { id: "share-progress-summaries-v1", approved };

  const handleApprove = () => {
    setApproved(true);
    setState("approval-responded");
  };

  const handleDeny = () => {
    setApproved(false);
    setState("approval-responded");
  };

  const handleReset = () => {
    setState("approval-requested");
    setApproved(undefined);
    replay();
  };

  return (
    <DemoFrame
      caption={[
        "Confirmation",
        "ConfirmationTitle",
        "ConfirmationRequest",
        "ConfirmationActions",
        "ConfirmationAction",
        "ConfirmationAccepted",
        "ConfirmationRejected",
      ]}
      onReplay={handleReset}
      rootRef={ref}
      title={title}
      blurb={blurb}
    >
      <Message from="assistant">
        <MessageContent>
          I&apos;ve drafted progress summaries for all 32 learners in this course. Ready to share with the teaching team.
        </MessageContent>
        <Confirmation approval={approval} state={state}>
          <ConfirmationTitle>Share progress summaries with the teaching team?</ConfirmationTitle>
          <ConfirmationRequest>
            <p className="text-sm text-muted-foreground">
              One summary per learner will be shared with their teacher.
              Shared summaries cannot be recalled - review drafts before confirming.
            </p>
          </ConfirmationRequest>
          <ConfirmationAccepted>
            <p className="text-sm text-success">
              Approved - sharing 32 summaries now. You will receive a confirmation once complete.
            </p>
          </ConfirmationAccepted>
          <ConfirmationRejected>
            <p className="text-sm text-muted-foreground">
              Cancelled - nothing was shared. The drafts are still available if you change your mind.
            </p>
          </ConfirmationRejected>
          <ConfirmationActions>
            <ConfirmationAction variant="outline" onClick={handleDeny}>
              Cancel
            </ConfirmationAction>
            <ConfirmationAction onClick={handleApprove}>
              Confirm - share now
            </ConfirmationAction>
          </ConfirmationActions>
        </Confirmation>
      </Message>
    </DemoFrame>
  );
};
