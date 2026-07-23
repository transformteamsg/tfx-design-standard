"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
} from "@/components/ai-elements/task";
import { Message } from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";

/* Steps:
   step 0 = idle (all pending)
   step 1 = item 1 complete
   step 2 = item 2 complete, item 3 becomes active
   step 3 = item 3 done (progress shown mid-way), item 4 becomes active
   step 4 = all complete */
const STEP_MS = [0, 900, 1100, 1800, 1200];

type ItemStatus = "pending" | "active" | "complete";

function StatusIcon({ status }: { status: ItemStatus }) {
  if (status === "complete") {
    return (
      <CheckCircle2
        size={13}
        className="shrink-0 text-success"
        aria-hidden="true"
      />
    );
  }
  if (status === "active") {
    return (
      <Loader2
        size={13}
        className="shrink-0 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
    );
  }
  return (
    <Circle size={13} className="shrink-0 text-muted-foreground/40" aria-hidden="true" />
  );
}

export const DemoTask = () => {
  const { step, replay, ref } = useReplay({ steps: 4, stepMs: STEP_MS });

  const item1: ItemStatus = step >= 1 ? "complete" : "pending";
  const item2: ItemStatus = step >= 2 ? "complete" : "pending";
  const item3: ItemStatus =
    step >= 3 ? "complete" : step >= 2 ? "active" : "pending";
  const item4: ItemStatus =
    step >= 4 ? "complete" : step >= 3 ? "active" : "pending";

  return (
    <DemoFrame
      caption={["Task", "TaskTrigger", "TaskContent", "TaskItem", "TaskItemFile"]}
      onReplay={replay}
      rootRef={ref}
    >
      <Message from="assistant">
        <Task defaultOpen>
          <TaskTrigger title="Generating end-of-term reading summaries" />
          <TaskContent>
            <TaskItem>
              <span className="flex items-center gap-2">
                <StatusIcon status={item1} />
                Loaded attendance records for Class 5A
              </span>
            </TaskItem>
            <TaskItem>
              <span className="flex items-center gap-2">
                <StatusIcon status={item2} />
                Retrieved running records
                <TaskItemFile>5a-running-records-t2.csv</TaskItemFile>
              </span>
            </TaskItem>
            <TaskItem>
              <span className="flex items-center gap-2">
                <StatusIcon status={item3} />
                {item3 === "active"
                  ? "Drafting summaries - 14 of 32 complete"
                  : item3 === "complete"
                  ? "Drafted summaries for all 32 students"
                  : "Draft summaries"}
              </span>
            </TaskItem>
            <TaskItem>
              <span className="flex items-center gap-2">
                <StatusIcon status={item4} />
                {item4 === "active"
                  ? "Queuing parent notification emails"
                  : item4 === "complete"
                  ? "Queued 32 parent notification emails"
                  : "Queue parent notification emails"}
              </span>
            </TaskItem>
          </TaskContent>
        </Task>
      </Message>
    </DemoFrame>
  );
};
