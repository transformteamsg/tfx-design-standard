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

export const DemoTask = () => (
  <DemoFrame caption={["Task", "TaskTrigger", "TaskContent", "TaskItem", "TaskItemFile"]}>
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <Message from="assistant">
        <Task defaultOpen>
          <TaskTrigger title="Generating end-of-term reading summaries" />
          <TaskContent>
            <TaskItem>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={13} className="shrink-0 text-success" aria-hidden="true" />
                Loaded attendance records for Class 5A
              </span>
            </TaskItem>
            <TaskItem>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={13} className="shrink-0 text-success" aria-hidden="true" />
                Retrieved running records
                <TaskItemFile>5a-running-records-t2.csv</TaskItemFile>
              </span>
            </TaskItem>
            <TaskItem>
              <span className="flex items-center gap-2">
                <Loader2 size={13} className="shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
                Drafting summaries — 18 of 32 complete
              </span>
            </TaskItem>
            <TaskItem>
              <span className="flex items-center gap-2">
                <Circle size={13} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                Queue parent notification emails
              </span>
            </TaskItem>
          </TaskContent>
        </Task>
      </Message>
    </div>
  </DemoFrame>
);
