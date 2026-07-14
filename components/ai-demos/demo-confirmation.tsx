"use client";

import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationActions,
  ConfirmationAction,
} from "@/components/ai-elements/confirmation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";

const APPROVAL = { id: "send-parent-summaries-v1" };

export const DemoConfirmation = () => (
  <DemoFrame caption={["Confirmation", "ConfirmationTitle", "ConfirmationRequest", "ConfirmationActions", "ConfirmationAction"]}>
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <Message from="assistant">
        <MessageContent>
          I&apos;ve drafted progress summaries for all 32 students in Class 5A. Ready to send to parents.
        </MessageContent>
        <Confirmation approval={APPROVAL} state="approval-requested">
          <ConfirmationTitle>Send progress summaries to 32 parents?</ConfirmationTitle>
          <ConfirmationRequest>
            <p className="text-sm text-muted-foreground">
              One email per student will be sent to the primary contact on record.
              Emails cannot be recalled once sent — review drafts before confirming.
            </p>
          </ConfirmationRequest>
          <ConfirmationActions>
            <ConfirmationAction variant="outline">Cancel</ConfirmationAction>
            <ConfirmationAction>Confirm — send now</ConfirmationAction>
          </ConfirmationActions>
        </Confirmation>
      </Message>
    </div>
  </DemoFrame>
);
