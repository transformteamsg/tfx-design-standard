"use client";

/* The adoption journey — five steps, using the setup wizard's own question
   names. The wizard's questions sit under step 4. */

import { Flow } from "./flow";

const questions = [
  "product name → domain → audiences",
  "primary colour → typefaces → stack",
  "illustration → voice",
];

export function AdoptionJourney() {
  return (
    <Flow
      steps={[
        { label: "Read this page", note: "understand what you are adopting" },
        { label: "Decide your brand basics", note: "primary colour · typefaces · domain" },
        { label: "Install the plugin", note: "two lines in Claude Code, once" },
        {
          label: "Run the wizard",
          note: "it asks, you answer",
          detail: (
            <ul className="ml-[42px] mt-2 list-none space-y-1 p-0">
              {questions.map((q) => (
                <li key={q} className="text-[12px] leading-snug text-muted-foreground">
                  {q}
                </li>
              ))}
              <li className="text-[12px] italic leading-snug text-muted-foreground">
                skip any non-essential question for the default
              </li>
            </ul>
          ),
        },
        { label: "Design your first screen", note: "through the design loop" },
      ]}
      caption={
        <>
          The wizard asks these in order and writes your product&apos;s <code>DESIGN.md</code> for
          you. Answer only what you know; skip the rest.
        </>
      }
    />
  );
}
