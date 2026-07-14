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

export const DemoPlan = () => (
  <DemoFrame caption={["Plan", "PlanTitle", "PlanDescription", "PlanHeader", "PlanContent", "PlanTrigger", "PlanFooter"]}>
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <Message from="assistant">
        <Plan defaultOpen>
          <PlanHeader>
            <PlanTitle>End-of-term reporting plan</PlanTitle>
            <PlanDescription>3 steps · estimated 4 minutes</PlanDescription>
            <PlanTrigger />
          </PlanHeader>
          <PlanContent>
            <ol className="flex flex-col gap-3 text-sm text-foreground">
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">1</span>
                <span>Pull attendance and running-record data for all 32 students in Class 5A from CaseSync.</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">2</span>
                <span>Draft an individual progress summary for each student, flagging anyone below year-level benchmarks.</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">3</span>
                <span>Queue parent emails for your review — no messages sent until you confirm.</span>
              </li>
            </ol>
          </PlanContent>
          <PlanFooter>
            <Button variant="outline" size="sm">Edit plan</Button>
            <Button size="sm">Approve and run</Button>
          </PlanFooter>
        </Plan>
      </Message>
    </div>
  </DemoFrame>
);
