"use client";

import { useState } from "react";
import {
  Plan,
  PlanContent,
  PlanFooter,
} from "@/components/ai-elements/plan";
import {
  Confirmation,
  ConfirmationActions,
  ConfirmationAction,
  ConfirmationAccepted,
  ConfirmationRejected,
} from "@/components/ai-elements/confirmation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { DemoFrame } from "./demo-frame";
import { cn } from "@/lib/utils";

/* Agentic-outside-chat demo.
   The Plan and Confirmation primitives normally live inside a Message bubble.
   Here they live in a standalone approval queue - a work surface, not a
   conversation. Each row is one agent run awaiting review; Approve or Deny
   resolves that row in place without touching the others. */

type Status = "pending" | "approved" | "denied";

type QueueItem = {
  id: string;
  title: string;
  meta: string;
  steps: string[];
  approvedLine: string;
};

const ITEMS: QueueItem[] = [
  {
    id: "reminder",
    title: "Send progress-note reminder to 4 parents",
    meta: "Estimated 30 seconds",
    steps: [
      "Compile the list of parents with unread notes from this week",
      "Draft a short reminder with the link to open the note",
      "Send from your school inbox",
    ],
    approvedLine: "Sent 4 reminders",
  },
  {
    id: "transcript",
    title: "Update transcript record for 2 late submissions",
    meta: "Estimated 45 seconds",
    steps: [
      "Mark both submissions as late in the gradebook",
      "Apply the 10 percent late penalty",
      "Notify the two students so they can see the revised grade",
    ],
    approvedLine: "Records updated",
  },
  {
    id: "rooms",
    title: "Book meeting rooms for parent conferences",
    meta: "Estimated 1 minute",
    steps: [
      "Find open rooms across Thursday afternoon",
      "Reserve six rooms in your name",
      "Send confirmations to the attending staff",
    ],
    approvedLine: "Six rooms booked",
  },
];

export const DemoAgentQueue = ({
  title,
  blurb,
}: {
  title?: string;
  blurb?: string;
}) => {
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  const setStatus = (id: string, next: Status) =>
    setStatuses((prev) => ({ ...prev, [id]: next }));

  return (
    <DemoFrame
      title={title}
      blurb={blurb}
      caption={[
        "Card",
        "Plan",
        "PlanContent",
        "PlanFooter",
        "Confirmation",
        "ConfirmationActions",
        "ConfirmationAction",
      ]}
    >
      <div className="flex flex-col gap-3">
        {ITEMS.map((item) => {
          const status: Status = statuses[item.id] ?? "pending";

          if (status !== "pending") {
            return (
              <Card key={item.id} size="sm">
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "inline-block h-2 w-2 shrink-0 rounded-full",
                        status === "approved"
                          ? "bg-success-9"
                          : "bg-danger-9"
                      )}
                    />
                    <span className="font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="text-muted-foreground">
                      -{" "}
                      {status === "approved"
                        ? item.approvedLine
                        : "Denied, nothing sent"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          }

          const approval = { id: item.id };

          return (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.meta}</CardDescription>
              </CardHeader>
              <CardContent>
                <Plan defaultOpen className="ring-0">
                  <PlanContent className="px-0">
                    <ol className="flex flex-col gap-2 text-sm text-foreground">
                      {item.steps.map((step, idx) => (
                        <li key={step} className="flex gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </PlanContent>
                  <PlanFooter className="mt-3 border-t-0 bg-transparent px-0 pb-0">
                    <Confirmation
                      approval={approval}
                      state="approval-requested"
                      className="w-full"
                    >
                      <ConfirmationAccepted>
                        <p className="text-sm text-success">Approved</p>
                      </ConfirmationAccepted>
                      <ConfirmationRejected>
                        <p className="text-sm text-muted-foreground">Denied</p>
                      </ConfirmationRejected>
                      <ConfirmationActions>
                        <ConfirmationAction
                          variant="outline"
                          onClick={() => setStatus(item.id, "denied")}
                        >
                          Deny
                        </ConfirmationAction>
                        <ConfirmationAction
                          onClick={() => setStatus(item.id, "approved")}
                        >
                          Approve
                        </ConfirmationAction>
                      </ConfirmationActions>
                    </Confirmation>
                  </PlanFooter>
                </Plan>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DemoFrame>
  );
};
