"use client";

import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements/sources";
import { DemoFrame } from "./demo-frame";

export const DemoSources = () => (
  <DemoFrame caption={["Message", "MessageResponse", "Sources", "SourcesTrigger", "SourcesContent", "Source"]}>
    <div className="flex flex-col gap-4">
      <Message from="user">
        <MessageContent>
          How is Ahmad tracking against year-level benchmarks?
        </MessageContent>
      </Message>
      <Message from="assistant">
        <Sources>
          <SourcesTrigger count={3} />
          <SourcesContent>
            <Source
              href="https://casesync.school/records/5a/reading"
              title="Term 2 reading records — Class 5A"
            />
            <Source
              href="https://casesync.school/students/ahmad-hassan/running-records"
              title="Running records — Ahmad Hassan"
            />
            <Source
              href="https://casesync.school/benchmarks/year5"
              title="Year 5 literacy benchmarks"
            />
          </SourcesContent>
        </Sources>
        <MessageResponse>
          {"Ahmad has attended 14 of 18 scheduled reading sessions this term. His running record places him at Band 3, on track for his year level. Comprehension responses show strong literal recall; inferential questioning is the current development focus."}
        </MessageResponse>
      </Message>
    </div>
  </DemoFrame>
);
