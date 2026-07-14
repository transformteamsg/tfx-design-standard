"use client";

import type { FileUIPart } from "ai";
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentInfo,
  AttachmentRemove,
} from "@/components/ai-elements/attachments";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { DemoFrame } from "./demo-frame";

type AttachmentData = (FileUIPart & { id: string });

const ATTACHMENTS: AttachmentData[] = [
  {
    id: "att-1",
    type: "file",
    mediaType: "application/pdf",
    filename: "5a-running-records-t2.pdf",
    url: "https://casesync.school/records/5a/running-records-t2.pdf",
  },
  {
    id: "att-2",
    type: "file",
    mediaType: "text/csv",
    filename: "attendance-week9.csv",
    url: "https://casesync.school/records/5a/attendance-week9.csv",
  },
];

export const DemoAttachments = () => (
  <DemoFrame caption={["Attachments", "Attachment", "AttachmentPreview", "AttachmentInfo", "AttachmentRemove"]}>
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <PromptInput onSubmit={() => {}}>
        <Attachments variant="list">
          {ATTACHMENTS.map((data) => (
            <Attachment key={data.id} data={data}>
              <AttachmentPreview />
              <AttachmentInfo />
              <AttachmentRemove />
            </Attachment>
          ))}
        </Attachments>
        <PromptInputTextarea placeholder="Ask about these records…" />
        <PromptInputFooter>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </div>
  </DemoFrame>
);
