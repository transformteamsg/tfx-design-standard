"use client";

import {
  Plan,
  PlanTitle,
  PlanDescription,
  PlanHeader,
  PlanContent,
  PlanTrigger,
  PlanFooter,
} from "@/components/ai-elements/plan";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";
import { cn } from "@/lib/utils";

/* Steps:
   step 0 = nothing visible
   step 1 = step 1 revealed
   step 2 = step 2 revealed
   step 3 = step 3 revealed + footer appears */
const STEP_MS = [0, 500, 600, 600];

const STEPS = [
  {
    n: 1,
    text: "Pull attendance and running-record data for all 32 students in Class 5A from CaseSync.",
  },
  {
    n: 2,
    text: "Draft an individual progress summary for each student, flagging anyone below year-level benchmarks.",
  },
  {
    n: 3,
    text: "Queue parent emails for your review - no messages sent until you confirm.",
  },
];

export const DemoPlan = () => {
  const { step, replay, ref } = useReplay({ steps: 3, stepMs: STEP_MS });

  const visibleCount = step; // 0, 1, 2, 3

  return (
    <DemoFrame
      caption={["Plan", "PlanTitle", "PlanDescription", "PlanHeader", "PlanContent", "PlanTrigger", "PlanFooter"]}
      onReplay={replay}
      rootRef={ref}
    >
      <Message from="assistant">
        <Plan defaultOpen>
          <PlanHeader>
            <PlanTitle>End-of-term reporting plan</PlanTitle>
            <PlanDescription>3 steps - estimated 4 minutes</PlanDescription>
            <PlanTrigger />
          </PlanHeader>
          <PlanContent>
            <ol className="flex flex-col gap-3 text-sm text-foreground">
              {STEPS.map(({ n, text }) => (
                <li
                  key={n}
                  className={cn(
                    "flex gap-2 transition-all duration-300",
                    visibleCount >= n
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-1 pointer-events-none select-none"
                  )}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {n}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </PlanContent>
          {visibleCount >= 3 && (
            <PlanFooter>
              <Button variant="outline" size="sm">Edit plan</Button>
              <Button size="sm">Approve and run</Button>
            </PlanFooter>
          )}
        </Plan>
      </Message>
    </DemoFrame>
  );
};
