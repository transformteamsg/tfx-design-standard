"use client";

import { useState } from "react";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Suggestion,
  Suggestions,
} from "@/components/ai-elements/suggestion";
import { DemoFrame } from "./demo-frame";

/* Illustrates the "scope before acting" pattern. The assistant asks exactly one
   clarifying question and surfaces two Suggestion chips so the teacher can
   answer with a single tap - no free-text required for a known fork.
   Choosing an option echoes the choice as a user turn, then an assistant
   confirmation resolves the flow. */
export const DemoClarify = () => {
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <DemoFrame caption={["Message", "Suggestion", "Suggestions", "MessageResponse"]}>
      <div className="flex flex-col gap-3">
        {/* Teacher request */}
        <Message from="user">
          <MessageContent>
            Send the reading summary to the parents.
          </MessageContent>
        </Message>

        {/* Assistant scoping question */}
        <Message from="assistant">
          <MessageResponse>
            Two groups match &quot;parents&quot; - which do you mean?
          </MessageResponse>
          {chosen === null && (
            <div className="mt-3">
              <Suggestions>
                <Suggestion
                  suggestion="All 32 parents of 5A"
                  onClick={setChosen}
                />
                <Suggestion
                  suggestion="Only the 4 flagged students' parents"
                  onClick={setChosen}
                />
              </Suggestions>
            </div>
          )}
        </Message>

        {/* Confirmed choice echoed as user turn */}
        {chosen !== null && (
          <Message from="user">
            <MessageContent>{chosen}</MessageContent>
          </Message>
        )}

        {/* Assistant confirms and acts */}
        {chosen !== null && (
          <Message from="assistant">
            <MessageResponse>
              {chosen.startsWith("All")
                ? "Sending the reading summary to all 32 parents of 5A now. This may take a moment."
                : "Sending the reading summary to the 4 flagged students' parents now."}
            </MessageResponse>
          </Message>
        )}
      </div>
    </DemoFrame>
  );
};
