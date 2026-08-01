"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "lucide-react";
import { DemoFrame } from "./demo-frame";

type AttachmentData = FileUIPart & { id: string };

const MOCK_FILES: AttachmentData[] = [
  {
    id: "att-1",
    type: "file",
    mediaType: "application/pdf",
    filename: "childs-reading-log-term.pdf",
    url: "https://school.example/records/child/reading-log-term.pdf",
  },
  {
    id: "att-2",
    type: "file",
    mediaType: "text/csv",
    filename: "childs-attendance-week9.csv",
    url: "https://school.example/records/child/attendance-week9.csv",
  },
  {
    id: "att-3",
    type: "file",
    mediaType: "image/png",
    filename: "school-event-photo.png",
    url: "https://school.example/assets/school-event-photo.png",
  },
];

/* Illustrates Attachments in the "list" variant inside PromptInputHeader.
   The attach button cycles through the mock file pool so visitors can add files
   one by one; each file's remove button dismisses it from the list. */
export const DemoAttachments = ({ title, blurb }: { title?: string; blurb?: string }) => {
  const [attached, setAttached] = useState<AttachmentData[]>([MOCK_FILES[0]]);

  const remove = (id: string) =>
    setAttached((prev) => prev.filter((f) => f.id !== id));

  const attach = () => {
    const next = MOCK_FILES.find((f) => !attached.some((a) => a.id === f.id));
    if (next) setAttached((prev) => [...prev, next]);
  };

  const canAttach = attached.length < MOCK_FILES.length;

  return (
    <DemoFrame
      caption={["Attachments", "Attachment", "AttachmentPreview", "AttachmentInfo", "AttachmentRemove", "AttachmentHoverCard", "PromptInput"]}
      title={title}
      blurb={blurb}
    >
      <PromptInput onSubmit={() => {}}>
        {attached.length > 0 && (
          <PromptInputHeader>
            <Attachments variant="list">
              {attached.map((data) => (
                <AttachmentHoverCard key={data.id}>
                  <AttachmentHoverCardTrigger>
                    <Attachment
                      data={data}
                      onRemove={() => remove(data.id)}
                    >
                      <AttachmentPreview />
                      <AttachmentInfo showMediaType />
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
        )}
        <PromptInputTextarea placeholder="Ask about these records…" />
        <PromptInputFooter>
          {canAttach && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Attach file"
              onClick={attach}
            >
              <PaperclipIcon size={16} aria-hidden="true" />
            </Button>
          )}
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </DemoFrame>
  );
};
