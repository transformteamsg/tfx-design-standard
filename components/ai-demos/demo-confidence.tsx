"use client";

import { useState } from "react";
import {
  Message,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoFrame } from "./demo-frame";
import { useReplay } from "./use-replay";

/* Illustrates categorical confidence labelling - plain-language bands (High /
   Medium / Low) with a source count, never a percentage. Two rows shown so
   you can see the contrast between high and low. Badge at default variants,
   no custom dot, no className overrides. Cycle button is shadcn Button. */

type ConfidenceLevel = "high" | "medium" | "low";

interface ConfidenceConfig {
  label: string;
  className: string;
  description: string;
  prediction: string;
}

const CONFIG: Record<ConfidenceLevel, ConfidenceConfig> = {
  high: {
    label: "High confidence",
    className: "bg-success-subtle text-success",
    description: "based on 14 progress checks",
    prediction: "Mateo's predicted reading level for next term is **level 5**.",
  },
  medium: {
    label: "Medium confidence",
    className: "bg-warning-subtle text-warning",
    description: "based on 6 checks - more data will improve accuracy",
    prediction: "Kenji's predicted reading level for next term is **level 4**.",
  },
  low: {
    label: "Low confidence",
    className: "bg-danger-subtle text-danger",
    description: "only 2 checks this term - treat as a starting point",
    prediction: "Sofia's predicted reading level for next term is **level 4**.",
  },
};

const CYCLE: ConfidenceLevel[] = ["high", "medium", "low"];

export const DemoConfidence = ({ title, blurb }: { title?: string; blurb?: string }) => {
  const [level, setLevel] = useState<ConfidenceLevel>("high");
  const { ref } = useReplay({ steps: 1, stepMs: 300 });

  const config = CONFIG[level];

  const handleCycle = () => {
    const next = CYCLE[(CYCLE.indexOf(level) + 1) % CYCLE.length];
    setLevel(next);
  };

  return (
    <DemoFrame
      caption={["Badge", "Message", "MessageResponse"]}
      rootRef={ref}
      title={title}
      blurb={blurb}
    >
      <div className="flex flex-col gap-4">
        <Message from="assistant">
          <MessageResponse>{config.prediction}</MessageResponse>
          <div className="mt-2 flex items-center gap-2">
            <Badge className={config.className} variant="secondary">
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {config.description}
            </span>
          </div>
        </Message>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleCycle}>
            Show {CYCLE[(CYCLE.indexOf(level) + 1) % CYCLE.length]} confidence
          </Button>
          <span className="text-xs text-muted-foreground">
            Cycles high / medium / low
          </span>
        </div>
      </div>
    </DemoFrame>
  );
};
