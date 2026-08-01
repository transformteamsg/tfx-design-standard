"use client";

import { useState } from "react";
import {
  Message,
  MessageContent,
} from "@/components/ai-elements/message";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle } from "lucide-react";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";

/* Illustrates CNT-1 failure anatomy - what happened, reassurance, what to do
   next - rendered through the shadcn Alert component so it looks native.
   Default variant keeps AlertDescription in muted-foreground (readable).
   The AlertCircle icon carries the semantic colour only - not the whole Alert.
   Action row is a plain wrapper div outside AlertDescription so Button
   stays at its default size="sm" variant="outline" without overrides.
   "Try again" runs a short mock retry: spinner -> resolves to a success Alert. */

type RetryState = "idle" | "retrying" | "resolved";

export const DemoError = ({ title, blurb }: { title?: string; blurb?: string }) => {
  const [retryState, setRetryState] = useState<RetryState>("idle");
  const { ref } = useReplay({ steps: 1, stepMs: 400 });

  const handleRetry = () => {
    setRetryState("retrying");
    setTimeout(() => {
      setRetryState("resolved");
    }, 1800);
  };

  const handleReset = () => {
    setRetryState("idle");
  };

  return (
    <DemoFrame
      caption={["Alert", "AlertTitle", "AlertDescription", "AlertAction", "Button"]}
      rootRef={ref}
      title={title}
      blurb={blurb}
    >
      <div className="flex flex-col gap-3">
        <Message from="user">
          <MessageContent>
            Pull up my child&apos;s progress records before the meeting.
          </MessageContent>
        </Message>

        <Message from="assistant">
          {retryState === "resolved" ? (
            <Alert>
              <AlertCircle className="text-success" aria-hidden="true" />
              <AlertTitle>Records loaded</AlertTitle>
              <AlertDescription>
                Your child&apos;s progress records are ready.{" "}
                <button
                  type="button"
                  onClick={handleReset}
                  className="underline underline-offset-2 hover:no-underline"
                >
                  Reset demo
                </button>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="text-destructive" aria-hidden="true" />
              <AlertTitle>Records did not load</AlertTitle>
              <AlertDescription>
                Nothing was sent - try again, or check back later.
              </AlertDescription>
              <AlertAction>
                {retryState === "retrying" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Spinner className="size-3" aria-hidden="true" />
                    Retrying...
                  </span>
                ) : (
                  <Button size="sm" variant="outline" onClick={handleRetry}>
                    Try again
                  </Button>
                )}
              </AlertAction>
            </Alert>
          )}
        </Message>
      </div>
    </DemoFrame>
  );
};
