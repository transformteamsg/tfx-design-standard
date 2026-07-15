"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { BookOpen } from "lucide-react";
import { DemoFrame } from "./demo-frame";

/* Illustrates ConversationEmptyState — the first thing a teacher sees before
   any messages exist. Title names the scope; description states one clear
   capability and one honest limitation so expectations are set up front.
   Suggestions render as siblings ABOVE the PromptInput, outside it. */
export const DemoEmptyState = () => (
  <DemoFrame caption={["ConversationEmptyState", "Suggestion"]}>
    <div className="flex h-[420px] flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <Conversation className="flex-1 overflow-y-auto">
        <ConversationContent>
          <ConversationEmptyState
            icon={<BookOpen className="size-6" aria-hidden="true" />}
            title="Ask about your classes"
            description="I can summarise records and draft comments for your classes. I can't change marks or send anything without you."
          />
        </ConversationContent>
      </Conversation>

      {/* Suggestions render above the input as siblings, not inside PromptInput */}
      <div className="border-t border-border px-3 pb-3 pt-2">
        <Suggestions className="mb-2">
          <Suggestion suggestion="Summarise 5A this term" onClick={() => {}} />
          <Suggestion suggestion="Draft comments for Ahmad" onClick={() => {}} />
          <Suggestion suggestion="Who needs a check-in?" onClick={() => {}} />
        </Suggestions>
        <PromptInput onSubmit={() => {}}>
          <PromptInputTextarea placeholder="Ask about a student or class…" />
          <PromptInputFooter>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  </DemoFrame>
);
