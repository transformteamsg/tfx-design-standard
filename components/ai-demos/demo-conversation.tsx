"use client";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { DemoFrame } from "./demo-frame";

export const DemoConversation = () => (
  <DemoFrame caption={["Conversation", "ConversationContent", "Message", "MessageContent", "MessageResponse", "PromptInput", "Suggestion"]}>
    <div className="flex h-[420px] flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <Conversation className="flex-1 overflow-y-auto">
        <ConversationContent>
          <Message from="user">
            <MessageContent>
              Summarise Ahmad&apos;s reading progress this term.
            </MessageContent>
          </Message>
          <Message from="assistant">
            <MessageResponse>
              {`Ahmad has made solid progress in Term 2. He moved from Band 1 to Band 2 in guided reading, completing 14 of 15 scheduled sessions. His fluency score improved from 67 to 84 words per minute, and comprehension check scores averaged 72% — up from 58% last term.\n\nHis strongest area is literal recall. Inferential questions remain a development focus, particularly when texts use unfamiliar cultural context.`}
            </MessageResponse>
          </Message>
        </ConversationContent>
      </Conversation>
      <div className="border-t border-border p-3">
        <PromptInput onSubmit={() => {}}>
          <Suggestions>
            <Suggestion suggestion="Draft a reading report" onClick={() => {}} />
            <Suggestion suggestion="Flag students below Band 2" onClick={() => {}} />
            <Suggestion suggestion="Summarise this week" onClick={() => {}} />
          </Suggestions>
          <PromptInputTextarea placeholder="Ask about your class…" />
          <PromptInputFooter>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  </DemoFrame>
);
