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

/* Each step represents one item completing:
   step 0 = idle, step 1 = item 1 done, step 2 = item 2 done,
   step 3 = item 3 active (spinner), step 4 = all done */
const STEP_MS = [0, 1000, 1200, 1400, 1600];

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
    <Circle size={13} className="shrink-0 text-muted-foreground" aria-hidden="true" />
  );
}

export const DemoTask = () => {
  const { step, replay } = useReplay({ steps: 4, stepMs: STEP_MS });

  const item1: ItemStatus = step >= 1 ? "complete" : "pending";
  const item2: ItemStatus = step >= 2 ? "complete" : "pending";
  const item3: ItemStatus = step >= 4 ? "complete" : step >= 1 ? "active" : "pending";
  const item4: ItemStatus = step >= 4 ? "complete" : "pending";

  return (
    <DemoFrame
      caption={["Task", "TaskTrigger", "TaskContent", "TaskItem", "TaskItemFile"]}
      onReplay={replay}
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
                  ? "Drafting summaries — 18 of 32 complete"
                  : item3 === "complete"
                  ? "Drafted summaries for all 32 students"
                  : "Draft summaries"}
              </span>
            </TaskItem>
            <TaskItem>
              <span className="flex items-center gap-2">
                <StatusIcon status={item4} />
                Queue parent notification emails
              </span>
            </TaskItem>
          </TaskContent>
        </Task>
      </Message>
    </DemoFrame>
  );
};
