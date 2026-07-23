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

export const DemoConfirmation = () => {
  const { replay, ref } = useReplay({ steps: 1, stepMs: [0] });

  const [state, setState] = useState<ConfState>("approval-requested");
  const [approved, setApproved] = useState<Approved>(undefined);

  const approval =
    approved === undefined
      ? { id: "send-parent-summaries-v1" }
      : { id: "send-parent-summaries-v1", approved };

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
    >
      <Message from="assistant">
        <MessageContent>
          I&apos;ve drafted progress summaries for all 32 students in Class 5A. Ready to send to parents.
        </MessageContent>
        <Confirmation approval={approval} state={state}>
          <ConfirmationTitle>Send progress summaries to 32 parents?</ConfirmationTitle>
          <ConfirmationRequest>
            <p className="text-sm text-muted-foreground">
              One email per student will be sent to the primary contact on record.
              Emails cannot be recalled once sent - review drafts before confirming.
            </p>
          </ConfirmationRequest>
          <ConfirmationAccepted>
            <p className="text-sm text-success">
              Approved - sending 32 emails now. You will receive a delivery report once complete.
            </p>
          </ConfirmationAccepted>
          <ConfirmationRejected>
            <p className="text-sm text-muted-foreground">
              Cancelled - no emails were sent. The drafts are still available if you change your mind.
            </p>
          </ConfirmationRejected>
          <ConfirmationActions>
            <ConfirmationAction variant="outline" onClick={handleDeny}>
              Cancel
            </ConfirmationAction>
            <ConfirmationAction onClick={handleApprove}>
              Confirm - send now
            </ConfirmationAction>
          </ConfirmationActions>
        </Confirmation>
      </Message>
    </DemoFrame>
  );
};
