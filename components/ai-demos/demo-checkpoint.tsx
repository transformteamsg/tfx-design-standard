"use client";

import {
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
} from "@/components/ai-elements/checkpoint";
import { Message, MessageResponse } from "@/components/ai-elements/message";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";
import { cn } from "@/lib/utils";

/* Steps:
   step 0 = nothing
   step 1 = first message appears
   step 2 = checkpoint appears
   step 3 = second message appears */
const STEP_MS = [0, 600, 800, 1000];

export const DemoCheckpoint = ({ title, blurb }: { title?: string; blurb?: string }) => {
  const { step, replay, ref } = useReplay({ steps: 3, stepMs: STEP_MS });

  return (
    <DemoFrame
      caption={["Checkpoint", "CheckpointIcon", "CheckpointTrigger"]}
      onReplay={replay}
      rootRef={ref}
      title={title}
      blurb={blurb}
    >
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            "transition-all duration-300",
            step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
          )}
        >
          <Message from="assistant">
            <MessageResponse>
              {"I've reviewed attendance records and progress checks for this cohort. All data is current as of this morning's sync."}
            </MessageResponse>
          </Message>
        </div>

        <div
          className={cn(
            "transition-all duration-300",
            step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
          )}
        >
          <Checkpoint>
            <CheckpointIcon />
            <CheckpointTrigger tooltip="Save this point to return to later">
              Checkpoint - data loaded
            </CheckpointTrigger>
          </Checkpoint>
        </div>

        <div
          className={cn(
            "transition-all duration-300",
            step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
          )}
        >
          <Message from="assistant">
            <MessageResponse>
              {"Here is the summary: 28 of 32 learners are meeting or exceeding year-level benchmarks. Four learners are flagged for support - I've drafted a note for each one."}
            </MessageResponse>
          </Message>
        </div>
      </div>
    </DemoFrame>
  );
};
