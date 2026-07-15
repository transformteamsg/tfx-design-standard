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
import { ChatShell, ChatShellInput, chatMessagesClass } from "./chat-shell";

/* The DemoFrame figure IS the conversation surface — no inner bordered box
   (that would nest a card, SLP-4). Natural height, so no message clip.
   Suggestions render as siblings ABOVE the PromptInput, outside it. */
export const DemoConversation = () => (
  <DemoFrame bleed caption={["Conversation", "ConversationContent", "Message", "MessageContent", "MessageResponse", "PromptInput", "Suggestion"]}>
    <ChatShell>
      <Conversation>
        {/* className override tunes the compact-demo rhythm (gap-8 → gap-4);
            AI Elements source is untouched (CMP-7 documented). */}
        <ConversationContent className={chatMessagesClass}>
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

      {/* Suggestions render above the input as siblings, not inside PromptInput */}
      <ChatShellInput>
        <Suggestions className="mb-2">
          <Suggestion suggestion="Draft a reading report" onClick={() => {}} />
          <Suggestion suggestion="Flag students below Band 2" onClick={() => {}} />
          <Suggestion suggestion="Summarise this week" onClick={() => {}} />
        </Suggestions>
        <PromptInput onSubmit={() => {}}>
          <PromptInputTextarea placeholder="Ask about your class…" />
          <PromptInputFooter>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </ChatShellInput>
    </ChatShell>
  </DemoFrame>
);
