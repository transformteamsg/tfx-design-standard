import type { ReactNode } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { Doc } from "@/lib/content";
import { extractHeadings } from "@/lib/toc";
import { Toc } from "@/components/toc";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageActions } from "@/components/page-actions";
import { ToolCard, type Tool } from "@/components/tool-card";
import { heading } from "@/components/mdx";
import dynamic from "next/dynamic";

/* Demos are heavy client components (streamdown + shiki-wasm + mermaid). Loading
   them lazily per-file means a page only pulls the demo chunks it actually
   renders — demo-free pages (e.g. /principles) no longer drag in the whole AI
   graph, which was the source of dev-nav lag. Import each demo's own file, not
   the barrel (the barrel would re-bundle everything and defeat the split). */
const DemoChatbot = dynamic(() => import("@/components/ai-demos/demo-chatbot").then((m) => ({ default: m.DemoChatbot })));
const DemoConversation = dynamic(() => import("@/components/ai-demos/demo-conversation").then((m) => ({ default: m.DemoConversation })));
const DemoStreaming = dynamic(() => import("@/components/ai-demos/demo-streaming").then((m) => ({ default: m.DemoStreaming })));
const DemoSources = dynamic(() => import("@/components/ai-demos/demo-sources").then((m) => ({ default: m.DemoSources })));
const DemoInlineCitation = dynamic(() => import("@/components/ai-demos/demo-inline-citation").then((m) => ({ default: m.DemoInlineCitation })));
const DemoConfirmation = dynamic(() => import("@/components/ai-demos/demo-confirmation").then((m) => ({ default: m.DemoConfirmation })));
const DemoTask = dynamic(() => import("@/components/ai-demos/demo-task").then((m) => ({ default: m.DemoTask })));
const DemoPlan = dynamic(() => import("@/components/ai-demos/demo-plan").then((m) => ({ default: m.DemoPlan })));
const DemoCheckpoint = dynamic(() => import("@/components/ai-demos/demo-checkpoint").then((m) => ({ default: m.DemoCheckpoint })));
const DemoAttachments = dynamic(() => import("@/components/ai-demos/demo-attachments").then((m) => ({ default: m.DemoAttachments })));
const DemoReasoning = dynamic(() => import("@/components/ai-demos/demo-reasoning").then((m) => ({ default: m.DemoReasoning })));
const DemoChainOfThought = dynamic(() => import("@/components/ai-demos/demo-chain-of-thought").then((m) => ({ default: m.DemoChainOfThought })));
const DemoPromptInput = dynamic(() => import("@/components/ai-demos/demo-prompt-input").then((m) => ({ default: m.DemoPromptInput })));
const DemoAiLabel = dynamic(() => import("@/components/ai-demos/demo-ai-label").then((m) => ({ default: m.DemoAiLabel })));
const DemoEmptyState = dynamic(() => import("@/components/ai-demos/demo-empty-state").then((m) => ({ default: m.DemoEmptyState })));
const DemoConfidence = dynamic(() => import("@/components/ai-demos/demo-confidence").then((m) => ({ default: m.DemoConfidence })));
const DemoFeedback = dynamic(() => import("@/components/ai-demos/demo-feedback").then((m) => ({ default: m.DemoFeedback })));
const DemoClarify = dynamic(() => import("@/components/ai-demos/demo-clarify").then((m) => ({ default: m.DemoClarify })));
const DemoError = dynamic(() => import("@/components/ai-demos/demo-error").then((m) => ({ default: m.DemoError })));

/* Sections whose docs live at /{section}/{slug} and get a breadcrumb back to
   the section root. Single-doc sections (governance) and start pages don't. */
const sectionCrumbs: Record<string, { label: string; href: string }> = {
  principles: { label: "Principles", href: "/principles" },
  standards: { label: "Standards", href: "/standards" },
  guidelines: { label: "Guidelines", href: "/guidelines" },
  foundations: { label: "Foundations", href: "/foundations" },
  products: { label: "Products", href: "/products" },
  harness: { label: "Harness", href: "/harness" },
};

/* MDX component map, built once at module scope so it isn't rebuilt per render. */
const MDX_COMPONENTS = {
  h2: heading("h2"),
  h3: heading("h3"),
  DemoChatbot,
  DemoConversation,
  DemoStreaming,
  DemoSources,
  DemoInlineCitation,
  DemoConfirmation,
  DemoTask,
  DemoPlan,
  DemoCheckpoint,
  DemoAttachments,
  DemoReasoning,
  DemoChainOfThought,
  DemoPromptInput,
  DemoAiLabel,
  DemoEmptyState,
  DemoConfidence,
  DemoFeedback,
  DemoClarify,
  DemoError,
};

/* Compiled-MDX memo. compileMDX runs at request time, so without this every
   navigation recompiles the same source — the main dev-nav lag. Keyed by the
   raw MDX string, the compiled tree is reused across navigations in a warm
   server. Editing a doc changes the source -> new key -> recompiles. */
const mdxMemo = new Map<string, ReactNode>();
async function compileDoc(source: string): Promise<ReactNode> {
  const hit = mdxMemo.get(source);
  if (hit) return hit;
  const { content } = await compileMDX({
    source,
    components: MDX_COMPONENTS,
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
  });
  mdxMemo.set(source, content);
  return content;
}

export async function DocPage({ doc, children }: { doc: Doc; children?: ReactNode }) {
  const crumb = sectionCrumbs[doc.section];
  const headings = extractHeadings(doc.content);
  const tools = (doc.data.tools ?? []) as Tool[];

  /* Doc bodies are plain Markdown, but a stray angle token outside a code
     span (e.g. "<date>" in prose) makes MDX read it as an unclosed JSX tag.
     Compile in a try/catch; on failure fall back to a preformatted block with
     a visible note rather than aborting the build with a broken page. */
  let rendered: ReactNode = null;
  let rawFallback = false;
  try {
    rendered = await compileDoc(doc.content);
  } catch {
    rawFallback = true;
  }

  return (
    <div className="flex gap-12">
      <div className="min-w-0 max-w-[720px] flex-1">
        <div className="mb-3 flex justify-end">
          <PageActions />
        </div>
        {crumb && <Breadcrumb section={crumb} current={doc.title} />}
        {doc.status === "proposed" && (
          <span className="mb-2 inline-block rounded-full border border-warning-muted bg-warning-subtle px-2 py-0.5 text-[11px] font-medium text-warning">
            ⚑ Proposed — react, don&apos;t obey
          </span>
        )}
        {doc.status === "settled" && (
          <span className="mb-2 inline-block rounded-full border border-success-muted bg-success-subtle px-2 py-0.5 text-[11px] font-medium text-success">
            Settled
          </span>
        )}
        <h1 className="font-display text-[32px] font-semibold tracking-tight">{doc.title}</h1>
        {doc.description && (
          <p className="mt-3 text-[18px] leading-[1.6] text-muted-foreground">
            {doc.description}
          </p>
        )}
        {tools.map((tool) => (
          <ToolCard key={tool.href} tool={tool} />
        ))}
        {rawFallback ? (
          <div className="mt-8">
            <p className="text-[14px] text-muted-foreground">
              Showing the raw Markdown source — this doc uses a token the renderer reads as
              markup, so it is shown verbatim below.
            </p>
            <pre className="prose mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 text-[14px]">
              {doc.content}
            </pre>
          </div>
        ) : (
          <article className="prose mt-8">{rendered}</article>
        )}
        {children}
      </div>
      {headings.length >= 2 && <Toc headings={headings} />}
    </div>
  );
}
