"use client";

import type { FileUIPart } from "ai";
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentInfo,
  AttachmentRemove,
  AttachmentHoverCard,
  AttachmentHoverCardTrigger,
  AttachmentHoverCardContent,
} from "@/components/ai-elements/attachments";
import {
  PromptInput,
  PromptInputHeader,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { DemoFrame } from "./demo-frame";

type AttachmentData = FileUIPart & { id: string };

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
  {
    id: "att-3",
    type: "file",
    mediaType: "image/png",
    filename: "class-photo-5a.png",
    url: "https://casesync.school/assets/5a-class-photo.png",
  },
];

/* Illustrates Attachments in two variants:
   - "inline" badges (compact, suits toolbar context)
   - "list" rows in the PromptInputHeader slot (full detail + hover preview)
   HoverCard previews are wired up to each list item. */
export const DemoAttachments = () => (
  <DemoFrame caption={["Attachments", "Attachment", "AttachmentPreview", "AttachmentInfo", "AttachmentRemove", "AttachmentHoverCard"]}>
    <div className="flex flex-col gap-6">
      {/* Inline variant — compact badges */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Inline badges</p>
        <Attachments variant="inline">
          {ATTACHMENTS.map((data) => (
            <AttachmentHoverCard key={data.id}>
              <AttachmentHoverCardTrigger>
                <Attachment data={data}>
                  <AttachmentPreview />
                  <AttachmentInfo />
                  <AttachmentRemove />
                </Attachment>
              </AttachmentHoverCardTrigger>
              <AttachmentHoverCardContent>
                <div className="text-xs text-foreground">{data.filename}</div>
                <div className="text-xs text-muted-foreground">{data.mediaType}</div>
              </AttachmentHoverCardContent>
            </AttachmentHoverCard>
          ))}
        </Attachments>
      </div>

      {/* List variant inside PromptInputHeader */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">List rows in PromptInputHeader — hover for preview</p>
        <PromptInput onSubmit={() => {}}>
          <PromptInputHeader>
            <Attachments variant="list">
              {ATTACHMENTS.map((data) => (
                <AttachmentHoverCard key={data.id}>
                  <AttachmentHoverCardTrigger>
                    <Attachment data={data}>
                      <AttachmentPreview />
                      <AttachmentInfo />
                      <AttachmentRemove />
                    </Attachment>
                  </AttachmentHoverCardTrigger>
                  <AttachmentHoverCardContent>
                    <div className="text-xs text-foreground">{data.filename}</div>
                    <div className="text-xs text-muted-foreground">{data.mediaType}</div>
                  </AttachmentHoverCardContent>
                </AttachmentHoverCard>
              ))}
            </Attachments>
          </PromptInputHeader>
          <PromptInputTextarea placeholder="Ask about these records…" />
          <PromptInputFooter>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  </DemoFrame>
);
