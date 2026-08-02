import type { ReactNode } from "react";
import type { Doc } from "@/lib/content";
import { DocPage, type MdxComponentImporters } from "@/components/doc-page";
import { standardMdxComponentImporters } from "@/components/mdx-standard-importers";

const aiMdxComponentImporters: MdxComponentImporters = {
  ...standardMdxComponentImporters,
  DemoChatbot: async () => {
    const { DemoChatbot } = await import("@/components/ai-demos/demo-chatbot");
    return { DemoChatbot };
  },
  DemoConversation: async () => {
    const { DemoConversation } = await import("@/components/ai-demos/demo-conversation");
    return { DemoConversation };
  },
  DemoStreaming: async () => {
    const { DemoStreaming } = await import("@/components/ai-demos/demo-streaming");
    return { DemoStreaming };
  },
  DemoSources: async () => {
    const { DemoSources } = await import("@/components/ai-demos/demo-sources");
    return { DemoSources };
  },
  DemoInlineCitation: async () => {
    const { DemoInlineCitation } = await import("@/components/ai-demos/demo-inline-citation");
    return { DemoInlineCitation };
  },
  DemoConfirmation: async () => {
    const { DemoConfirmation } = await import("@/components/ai-demos/demo-confirmation");
    return { DemoConfirmation };
  },
  DemoTask: async () => {
    const { DemoTask } = await import("@/components/ai-demos/demo-task");
    return { DemoTask };
  },
  DemoPlan: async () => {
    const { DemoPlan } = await import("@/components/ai-demos/demo-plan");
    return { DemoPlan };
  },
  DemoCheckpoint: async () => {
    const { DemoCheckpoint } = await import("@/components/ai-demos/demo-checkpoint");
    return { DemoCheckpoint };
  },
  DemoAttachments: async () => {
    const { DemoAttachments } = await import("@/components/ai-demos/demo-attachments");
    return { DemoAttachments };
  },
  DemoReasoning: async () => {
    const { DemoReasoning } = await import("@/components/ai-demos/demo-reasoning");
    return { DemoReasoning };
  },
  DemoChainOfThought: async () => {
    const { DemoChainOfThought } = await import("@/components/ai-demos/demo-chain-of-thought");
    return { DemoChainOfThought };
  },
  DemoPromptInput: async () => {
    const { DemoPromptInput } = await import("@/components/ai-demos/demo-prompt-input");
    return { DemoPromptInput };
  },
  DemoAiLabel: async () => {
    const { DemoAiLabel } = await import("@/components/ai-demos/demo-ai-label");
    return { DemoAiLabel };
  },
  DemoEmptyState: async () => {
    const { DemoEmptyState } = await import("@/components/ai-demos/demo-empty-state");
    return { DemoEmptyState };
  },
  DemoConfidence: async () => {
    const { DemoConfidence } = await import("@/components/ai-demos/demo-confidence");
    return { DemoConfidence };
  },
  DemoFeedback: async () => {
    const { DemoFeedback } = await import("@/components/ai-demos/demo-feedback");
    return { DemoFeedback };
  },
  DemoClarify: async () => {
    const { DemoClarify } = await import("@/components/ai-demos/demo-clarify");
    return { DemoClarify };
  },
  DemoError: async () => {
    const { DemoError } = await import("@/components/ai-demos/demo-error");
    return { DemoError };
  },
  DemoClassifierRow: async () => {
    const { DemoClassifierRow } = await import("@/components/ai-demos/demo-classifier-row");
    return { DemoClassifierRow };
  },
  DemoInlineSuggest: async () => {
    const { DemoInlineSuggest } = await import("@/components/ai-demos/demo-inline-suggest");
    return { DemoInlineSuggest };
  },
  DemoAgentQueue: async () => {
    const { DemoAgentQueue } = await import("@/components/ai-demos/demo-agent-queue");
    return { DemoAgentQueue };
  },
};

export function AiDocPage({ doc, children }: { doc: Doc; children?: ReactNode }) {
  return (
    <DocPage
      doc={doc}
      componentImporters={aiMdxComponentImporters}
    >
      {children}
    </DocPage>
  );
}
