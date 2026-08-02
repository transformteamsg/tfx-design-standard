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
    text: "Pull my quiz results and reading log from this term.",
  },
  {
    n: 2,
    text: "Draft a progress summary highlighting where I'm ahead of or behind benchmark.",
  },
  {
    n: 3,
    text: "Queue it for my mentor's review - nothing sent until I approve.",
  },
];

export const DemoPlan = ({ title, blurb }: { title?: string; blurb?: string }) => {
  const { step, replay, ref } = useReplay({ steps: 3, stepMs: STEP_MS });

  const visibleCount = step; // 0, 1, 2, 3

  return (
    <DemoFrame
      caption={["Plan", "PlanTitle", "PlanDescription", "PlanHeader", "PlanContent", "PlanTrigger", "PlanFooter"]}
      onReplay={replay}
      rootRef={ref}
      title={title}
      blurb={blurb}
    >
      <Message from="assistant">
        <Plan defaultOpen>
          <PlanHeader>
            <PlanTitle>My progress summary plan</PlanTitle>
            <PlanDescription>3 steps - estimated 2 minutes</PlanDescription>
            <PlanTrigger />
          </PlanHeader>
          <PlanContent>
            <ol className="flex flex-col gap-4 text-sm text-foreground">
              {STEPS.map(({ n, text }) => (
                <li
                  key={n}
                  className={cn(
                    "flex items-start gap-3 transition-all duration-300",
                    visibleCount >= n
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-1 pointer-events-none select-none"
                  )}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {n}
                  </span>
                  <span className="leading-relaxed">{text}</span>
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
