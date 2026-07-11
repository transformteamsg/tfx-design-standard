"use client";

/* The ratchet: how the catalog grows — only from observed failures, through a
   design-lead gate, into a control that is checked on every future run. */

import { Flow } from "./flow";

export function Ratchet() {
  return (
    <Flow
      steps={[
        { label: "A defect escapes to a shipped surface", note: "observed, not speculated" },
        { label: "It becomes a control proposal", note: "with evidence attached" },
        { label: "A design lead approves it", note: "or rejects it, in writing", gate: true },
        { label: "The control enters the catalog", note: "one verifiable statement" },
        { label: "Every future run checks it", note: "the same defect can't escape twice" },
      ]}
      caption="The catalog only tightens. A control is never weakened or removed by a domain; recurring waivers mean fix the standard or fix the system."
    />
  );
}
