"use client";

/* The six-phase design loop, with the plan step marked as the human gate. */

import { Flow } from "./flow";

export function DesignLoop() {
  return (
    <Flow
      steps={[
        { label: "Intent", note: "write what you mean as a contract" },
        { label: "Diverge", note: "2–3 options, you pick a direction" },
        { label: "Plan", note: "nothing is built until you approve", gate: true },
        { label: "Implement", note: "build exactly the approved plan" },
        { label: "Verify", note: "checks, then a separate evaluator" },
        { label: "Ratchet", note: "capture what we learn" },
      ]}
      caption="You approve the plan before anything is built. Verify runs the checks, then a separate agent grades the result against what you asked for."
    />
  );
}
