"use client";

import {
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
} from "@/components/ai-elements/checkpoint";
import { Message, MessageResponse } from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";

export const DemoCheckpoint = () => (
  <DemoFrame caption={["Checkpoint", "CheckpointIcon", "CheckpointTrigger"]}>
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <Message from="assistant">
        <MessageResponse>
          {"I've reviewed attendance records and running records for Class 5A. All data is current as of this morning's sync."}
        </MessageResponse>
      </Message>
      <Checkpoint>
        <CheckpointIcon />
        <CheckpointTrigger tooltip="Save this point to return to later">
          Checkpoint — data loaded
        </CheckpointTrigger>
      </Checkpoint>
      <Message from="assistant">
        <MessageResponse>
          {"Here is the summary: 28 of 32 students are meeting or exceeding year-level benchmarks. Four students are flagged for support — I've drafted a note for each one."}
        </MessageResponse>
      </Message>
    </div>
  </DemoFrame>
);
