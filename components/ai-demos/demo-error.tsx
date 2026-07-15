"use client";

import { useState } from "react";
import {
  Message,
  MessageContent,
} from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { DemoFrame } from "./demo-frame";

/* Illustrates CNT-1 failure anatomy: what happened / what it means / what to
   do next — styled as a calm inline notice, not a red alarm. No ML or model
   language anywhere. A ghost "Try again" button satisfies the "next step"
   requirement while keeping the tone boring-safe. */
export const DemoError = () => {
  const [retried, setRetried] = useState(false);

  return (
    <DemoFrame caption={["Message", "error state (CNT-1 anatomy)"]}>
      <div className="flex flex-col gap-3">
        <Message from="user">
          <MessageContent>
            Pull up the CaseSync records for 5A before the meeting.
          </MessageContent>
        </Message>

        <Message from="assistant">
          {/* CNT-1 anatomy: what happened / what it means / what to do next */}
          <div
            role="status"
            className="rounded-md border border-warning-muted bg-warning-subtle px-4 py-3"
          >
            <p className="text-sm text-warning">
              CaseSync records didn&apos;t load.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your draft is safe &mdash; nothing was sent.
            </p>
            <div className="mt-3 flex items-center gap-3">
              {!retried ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-3 text-xs"
                  onClick={() => setRetried(true)}
                >
                  Try again
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Retrying&hellip;
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                or open the records directly in CaseSync.
              </span>
            </div>
          </div>
        </Message>
      </div>
    </DemoFrame>
  );
};
