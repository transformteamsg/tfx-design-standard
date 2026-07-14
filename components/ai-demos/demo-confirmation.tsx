"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { DemoFrame } from "./demo-frame";

type ConfirmState = "pending" | "confirmed" | "cancelled";

/* Illustrates the Confirmation pattern: human-in-the-loop gate before an
   agent executes a consequential action. The consequence text and
   confirm/cancel affordances match CMP-2 (destructive actions show
   consequences and offer undo/confirm). */
export function DemoConfirmation() {
  const [state, setState] = useState<ConfirmState>("pending");

  return (
    <DemoFrame caption={["Confirmation"]}>
      <div className="flex flex-col gap-4">
        {/* Agent intent message */}
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
          >
            AI
          </div>

          <div className="flex-1">
            <p className="text-[14px] text-foreground">
              I&apos;m ready to send the end-of-term progress summaries to parents.
            </p>

            {state === "pending" && (
              <div className="mt-3 rounded-lg border border-warning-muted bg-warning-subtle p-4">
                {/* Action header */}
                <div className="flex items-start gap-2.5">
                  <AlertTriangle
                    size={16}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-warning"
                  />
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">
                      Send progress summaries to 32 parents?
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                      This will send one email per student to their primary contact.
                      Emails cannot be recalled once sent. Check the drafts tab to
                      review individual messages before confirming.
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setState("confirmed")}
                    className="rounded-md bg-tw-blue px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-tw-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                  >
                    Confirm — send now
                  </button>
                  <button
                    type="button"
                    onClick={() => setState("cancelled")}
                    className="rounded-md border border-border bg-surface px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-border-strong hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {state === "confirmed" && (
              <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-success-muted bg-success-subtle p-4">
                <CheckCircle
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-success"
                />
                <div>
                  <p className="text-[14px] font-semibold text-success">
                    Summaries sent to 32 parents
                  </p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    Emails dispatched. Delivery receipts will appear in the Comms tab.
                  </p>
                  <button
                    type="button"
                    onClick={() => setState("pending")}
                    className="mt-2 text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                  >
                    Reset demo
                  </button>
                </div>
              </div>
            )}

            {state === "cancelled" && (
              <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-border bg-muted p-4">
                <XCircle
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-muted-foreground"
                />
                <div>
                  <p className="text-[14px] font-medium text-foreground">
                    Cancelled — no emails were sent
                  </p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    The summaries remain as drafts. You can review them in the Comms tab.
                  </p>
                  <button
                    type="button"
                    onClick={() => setState("pending")}
                    className="mt-2 text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                  >
                    Reset demo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}
