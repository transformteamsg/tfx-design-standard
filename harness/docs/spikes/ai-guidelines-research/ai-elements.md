# Source: Vercel AI SDK Elements
Researched: 2026-07-15. URL: https://elements.ai-sdk.dev/

## Component inventory

### Chatbot (19 components)
- Attachments
- Chain of Thought
- Checkpoint
- Confirmation
- Context
- Conversation
- Inline Citation
- Message
- Model Selector
- Plan
- Prompt Input
- Queue
- Reasoning
- Shimmer
- Sources
- Suggestion
- Task
- Tool
- (Loader - redirects to shadcn Spinner)

### Code (14 components)
- Agent
- Artifact
- Code Block
- Commit
- Environment Variables
- File Tree
- JSX Preview
- Package Info
- Sandbox
- Schema Display
- Snippet
- Stack Trace
- Terminal
- Test Results
- Web Preview

### Voice (6 components)
- Audio Player
- Mic Selector
- Persona
- Speech Input
- Transcription
- Voice Selector

### Workflow (7 components)
- Canvas
- Connection
- Controls
- Edge
- Node
- Panel
- Toolbar

### Utilities (2 components)
- Image
- Open In Chat

## Installation

### Prerequisites
- Node.js 18+
- React 19
- Next.js 14+ (App Router preferred)
- AI SDK configured in the project
- shadcn/ui initialised (or let the CLI do it automatically)
- Tailwind CSS 4

Note: "If you don't have shadcn/ui installed, running any AI Elements install command will automatically set it up for you."

### Exact commands

Using the AI Elements CLI (recommended):
```bash
npx ai-elements@latest add message
```

Using the shadcn CLI:
```bash
npx shadcn@latest add @ai-elements/message
```

Substitute `message` with the component name in kebab-case (e.g. `prompt-input`, `chain-of-thought`).
Both CLIs support pnpm, yarn, and bun as alternatives to npx.

### Where files land
Components install to `@/components/ai-elements/` by default, following shadcn/ui's `components.json` path config.

### Licensing / registry notes
The library is a "custom registry built on top of shadcn/ui."
Components are copied into the local project, not installed as a versioned npm dependency.
An optional `AI_GATEWAY_API_KEY` in `.env.local` unlocks Vercel AI Gateway with $5/month free credits for experimentation.

## Key components in depth

### Conversation
Anatomy: `ConversationContent`, `ConversationEmptyState`, `ConversationScrollButton`, `ConversationDownload`.
Key behaviour: auto-scrolls to the latest message; surfaces a scroll-to-bottom button when the viewport is not at the bottom.
Extra: exports `messagesToMarkdown` for conversation export.
Pattern: persistent chat shell - the stateful outer container that wraps all messages and manages scroll position.

### Message
Anatomy: `Message`, `MessageContent`, `MessageResponse` (markdown renderer), `MessageActions`, `MessageAction`, `MessageBranch` subcomponents, `MessageToolbar`.
Key behaviour: renders GitHub Flavored Markdown with math and streaming support; supports response branching (navigate between multiple AI response versions); code blocks include copy-to-clipboard.
Requirement: add `@source "../node_modules/streamdown/dist/*.js";` to `globals.css` for `MessageResponse` to work.
Pattern: dual-role message bubble - handles both user and assistant messages with distinct styling and alignment.

### PromptInput
Anatomy: textarea, footer, header, action menus, attachment display area, model selector dropdown; exports `useAttachments` and input-state hooks.
Key props: file constraints (max files, max size, accepted types); `status` from `useChat` to toggle stop/send affordance.
Key behaviour: auto-resizing textarea; drag-and-drop file upload; screenshot capture; Web Speech API speech recognition; Enter to submit, Shift+Enter for newline.
Pattern: rich multimodal entry point - the primary user input surface for text, files, and voice.

### Suggestion
Anatomy: `Suggestions` wrapper (ScrollArea), `Suggestion` child.
Key props: `suggestion` (string, required), `onClick` callback that receives the suggestion string.
Pattern: zero-friction starter - a horizontal strip of tap-to-send chips shown before or during conversation to reduce blank-slate friction.

### Reasoning
Anatomy: single collapsible component; `useReasoning` hook available to children.
Key props: `isStreaming` boolean; `getThinkingMessage` function for custom trigger label.
Key behaviour: auto-opens during streaming, auto-closes when the stream ends; collapses multiple reasoning parts into one block to avoid repeated "Thinking..." indicators.
Use case: models that emit continuous reasoning tokens (Deepseek R1, Claude extended thinking).
Pattern: live thought stream - a self-managing disclosure widget for in-progress reasoning.

### Chain of Thought
Anatomy: `ChainOfThought` (root, controlled/uncontrolled open state), `ChainOfThoughtHeader`, `ChainOfThoughtStep` (with status: complete/active/pending), `ChainOfThoughtSearchResults`, `ChainOfThoughtResult`, `ChainOfThoughtContent`, `ChainOfThoughtImage`.
Key behaviour: collapsible with smooth animations; step-level status indicators; embedded search results and image captions.
Use case: models that return discrete labelled reasoning steps rather than a continuous token stream.
Pattern: structured reasoning trace - a timeline of named steps with per-step status for agent workflows.

### Sources
Anatomy: `Sources` wrapper, `SourcesTrigger` (shows count), `SourcesContent` (collapsible), `Source` (individual link).
Key behaviour: filters `message.parts` for `source-url` type; integrates with models like Perplexity Sonar that return source metadata.
Pattern: citation panel - a collapsible list of reference URLs attached to an assistant message.

### InlineCitation
Anatomy: compound subcomponents for the pill, carousel (prev/next), source title, URL, description, quote, and position indicator.
Key behaviour: hover-triggered; carousel navigation when a single inline marker references multiple citations; uses `experimental_useObject` to generate structured citation data.
Limitation: "Currently, there is no official support for inline citations with Streamdown or the Response component" - use object generation with Zod schemas rather than markdown.
Pattern: hover-reveal attribution - citation pills embedded in prose that expand into source cards on hover.

### Confirmation
Anatomy: `Confirmation` (wrapper), `ConfirmationTitle`, `ConfirmationRequest`, `ConfirmationAccepted`, `ConfirmationRejected`, `ConfirmationActions`, `ConfirmationAction` (verified against installed source `components/ai-elements/confirmation.tsx`).
Key behaviour: renders based on four tool-call states - `approval-requested`, `approval-responded`, `output-denied`, `output-available`; backend tools configured with `requireApproval: true`.
Pattern: human-in-the-loop gate - surfaces approve/deny controls before an agent executes a potentially destructive tool call.

### Task
Anatomy: `Task` (container, `defaultOpen` prop), `TaskTrigger` (`title` string required), `TaskContent`, `TaskItem`, `TaskItemFile`.
Key behaviour: collapsible container; `TaskItem` is a plain `<div>` with no built-in status prop (verified against installed source `components/ai-elements/task.tsx`). Author wires per-item status icons manually - the "pending / in-progress / completed / error" states are convention, not a component API. Streams in real time via `experimental_useObject`.
Pattern: live task list - a checklist that populates and updates as an agent works through subtasks.

### Plan
Anatomy: `Plan` (`isStreaming`, `defaultOpen`), `PlanTitle`, `PlanDescription`, `PlanTrigger`, `PlanContent`.
Key behaviour: shimmer animations on title and description during streaming; built on shadcn Card + Collapsible; dark mode automatic.
Pattern: agent plan reveal - shows a structured multi-step plan before or while the agent executes, with shimmer indicating that content is still arriving.

### Checkpoint
Anatomy: `Checkpoint` (wrapper), `CheckpointIcon` (defaults to BookmarkIcon), `CheckpointTrigger` (variant "ghost", size "sm" by default).
Key behaviour: marks a point in chat history so users can revert to it; supports manual, automatic (e.g. every N messages), and branching use cases; integrates with `useChat` for state persistence.
Pattern: conversation save point - a visual marker in the thread that lets users restore or branch from an earlier state.

### Attachments
Anatomy: `Attachments` (container, `variant` prop), `Attachment` (accepts FileUIPart or SourceDocumentUIPart), `AttachmentPreview`, `AttachmentInfo`, `AttachmentRemove`.
Variants: `grid` (thumbnails), `inline` (badges), `list` (rows).
Utility exports: `getMediaCategory()` (image/video/audio/document/source), `getAttachmentLabel()`.
Pattern: file stage - displays uploaded or referenced files before or alongside a message, with optional remove controls.

### Shimmer
Key props: `children` (text), `as` (HTML element, default `p`), `duration` (seconds, default 2), `spread` (gradient width multiplier, default 2), `className`.
Key behaviour: CSS gradient sweep animated with Framer Motion; uses `text-transparent` with `background-clip` for crisp rendering; loops infinitely.
Pattern: loading text reveal - indicates that streamed text is still arriving without a spinner.

## Feature-type to component mapping

| AI feature type | Primary components | Supporting components | Notes |
|---|---|---|---|
| Inline suggestion (autocomplete, next-action chips) | Suggestion | PromptInput | Suggestion chips appear before conversation starts or after each turn |
| Generated draft (write/rewrite) | Message, MessageResponse | Shimmer, Conversation | MessageResponse streams markdown; Shimmer on title while draft arrives |
| Summarisation | Message, Sources | InlineCitation, Attachments | Sources shows reference URLs; InlineCitation pins attribution to prose |
| Q&A over documents (RAG) | Message, Sources, InlineCitation | Attachments, Context | Context shows token usage; InlineCitation attributes specific passages |
| Agent that takes actions | Confirmation, Task, Plan, Tool | ChainOfThought, Checkpoint | Confirmation gates destructive calls; Task shows live progress; Checkpoint lets users revert |
| Full chat conversation | Conversation, Message, PromptInput | Reasoning, Suggestion, Attachments, Queue, Checkpoint | Core triad is Conversation + Message + PromptInput; others layer in as needed |
| Voice interaction | Speech Input, Transcription, Persona | Audio Player, Mic Selector, Voice Selector | Voice category handles full audio round-trip |
| Code / IDE workflows | Artifact, Code Block, Terminal, Sandbox | File Tree, Agent, Stack Trace, Test Results | Code category is a self-contained IDE toolkit |
| Workflow visualisation | Canvas, Node, Edge, Connection | Controls, Panel, Toolbar | Workflow category maps to node-graph UIs |

## Checkable (candidate machine-verifiable rules)

- Streaming responses must render a stop affordance: `PromptInput` reads `status` from `useChat` and switches between send and stop based on that value.
- `MessageResponse` requires `@source "../node_modules/streamdown/dist/*.js"` in `globals.css` or markdown will not render.
- `Reasoning` must receive `isStreaming` prop to auto-open/close correctly during token streaming.
- `Confirmation` requires backend tools to set `requireApproval: true` for the approval-request state to trigger.
- `InlineCitation` requires `experimental_useObject` (not `useChat`) to generate structured citation data; it does not work with `MessageResponse`/Streamdown markdown.
- All components install to `@/components/ai-elements/` and are copied into the local project (not versioned npm packages).

## Quotes and links

- "A component library and custom registry built on top of shadcn/ui to help you build AI-native applications faster." - https://elements.ai-sdk.dev/
- "Every component is a building block. Combine small, focused pieces to create exactly the UI you need." - https://elements.ai-sdk.dev/
- "Currently, there is no official support for inline citations with Streamdown or the Response component." - https://elements.ai-sdk.dev/components/inline-citation
- "If you don't have shadcn/ui installed, running any AI Elements install command will automatically set it up for you." - https://elements.ai-sdk.dev/docs/setup
- Reasoning: "automatically opens during streaming and closes when finished" - https://elements.ai-sdk.dev/components/reasoning
- Confirmation: requires user approval "before executing potentially dangerous operations" - https://elements.ai-sdk.dev/components/confirmation
- Checkpoint: "inspired by VSCode's Copilot feature" - https://elements.ai-sdk.dev/components/checkpoint
