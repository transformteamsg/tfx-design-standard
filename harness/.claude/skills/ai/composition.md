# AI Elements composition reference

Ground truth for how Vercel AI Elements components are meant to be composed, spaced, and animated. Extracted from the library's own example source, its component registry, and its `/docs/philosophy` and `/docs/usage` pages.

Build against this rather than inventing layout. Every recurring "the AI UI looks off" bug traced back to ignoring one of the rules below.

## Rule 0 - the sanctioned way to customise

In this order. Reaching for a lower option when a higher one would do is the root of most defects.

1. **Retune the design tokens.** Every component styles itself with semantic tokens (`text-muted-foreground`, `bg-secondary`, `bg-muted/50`, `text-primary`). Change the token once and all 48 components follow. This is the correct fix for "the colours look harsh", not per-component overrides.
2. **Edit the installed component source.** Explicitly sanctioned: the docs' own example is "if you'd like to remove the rounding on `Message`, go to `components/ai-elements/message.tsx` and remove `rounded-lg`". Because installs are a copy, this is the durable path for a house style.
3. **`className` for layout and positioning only.** Never to re-skin size or type.

## Rule 1 - prose isolation

Only 7 of the 48 components defend themselves with `not-prose` on their root: `reasoning`, `sources`, `tool`, `chain-of-thought`, `agent`, `sandbox`, `stack-trace`.

`Message`, `Conversation`, `PromptInput`, `Suggestion`, `Confirmation`, `Plan`, `Artifact`, `Context` and `Task` do **not**. Inside a `.prose` container they inherit prose margins, line-height and colour, and break.

**So:** the mount point must carry `not-prose`. In this repo `DemoFrame` provides it, and `app/globals.css` scopes every `.prose` rule with `:not(.not-prose *)`. Both halves are required. Do not rely on the components' own guards.

This is also the real cause of the "block element in a flex row" baseline bug. A `<p>` inside a `flex items-center` trigger is fine as a flex item; the library does it themselves. It only misaligns when prose margins land on it.

## Rule 2 - spacing lives inside the components

`ConversationContent` is the spacing engine for a chat: `flex flex-col gap-8 p-4`. Message rhythm is already correct. If messages look cramped, something overrode it or nested messages in another flex container.

`Suggestions` is a ScrollArea wrapping `flex w-max flex-nowrap items-center gap-2`. **The gap between pills is internal.** Cramped chips mean someone replaced `Suggestions` with a plain div.

**Watch for double spacing:** `Reasoning`, `Sources` and `Tool` each carry their own `mb-4`. Adding a wrapper `gap-*` around them stacks gap on top of that margin.

Padding, gap, width and positioning on a component tag are sanctioned - the library's own examples use `<Suggestions className="px-4">`, `<ConversationContent className="gap-4 p-3">`, `<PromptInputTextarea className="min-h-10" />`, `<ArtifactContent className="p-0">`. What is **not** sanctioned is re-declaring what a `size`/`variant` prop owns: a fixed `h-<n>` or a `text-<size>` on a component that sizes itself. `ConfirmationAction` hard-codes `h-8 px-3 text-sm` *before* the prop spread and does not merge it with `cn()`, so a passed `className` collides unpredictably.

## Rule 3 - use the slot that already exists

The highest-value table here. Each row is a real slot that people routinely hand-roll.

| Component | Use this slot | Instead of |
|---|---|---|
| Confirmation | `ConfirmationActions` + `ConfirmationAction` | A button row inside `ConfirmationTitle` - which is `AlertDescription`, so it breaks the alert's grid |
| Message | `MessageToolbar` > `MessageActions` > `MessageAction` | A custom footer div; loses spacing, the branch/action split, tooltips and accessible names |
| Message | `MessageBranchSelector` + `Previous`/`Page`/`Next` | Three loose buttons; loses the segmented-control joinery |
| Conversation | `ConversationEmptyState` (`icon`/`title`/`description` props) | A bespoke centred div |
| Conversation | `ConversationScrollButton`, `ConversationDownload` | Custom floating buttons anchored to the wrong parent |
| Artifact | `ArtifactActions` + `ArtifactAction` (`icon` takes a component ref) | An icon row; loses uniform hit targets and hover treatment |
| Plan | `PlanAction` / `PlanFooter` / `PlanTrigger` | Buttons crammed beside the title; a chevron with no accessible name |
| PromptInput | `PromptInputFooter` + `PromptInputTools`, with `PromptInputSubmit` a **sibling** of Tools | A custom toolbar; loses `justify-between` so submit stops right-aligning |
| PromptInput | `PromptInputHeader` | Attachments rendered outside the input box entirely |
| Tool | `ToolHeader` (`state` prop drives icon + badge) | A hand-built title row with a manually chosen status colour |
| Task | `TaskItemFile` | An inline `<code>` or ad-hoc badge |
| Suggestion | `Suggestions` wrapper | `<div className="flex gap-2">` - the cause of cramped chips |
| Sources | `SourcesTrigger` (`count` prop) | A custom "3 sources" toggle |
| ChainOfThought | `ChainOfThoughtStep` (`status`/`icon`/`description`) | Custom rows; loses the connector rail and the three-state colour ramp |
| Context | `ContextContentHeader`/`Body`/`Footer` + the four `*Usage` rows | Hand-formatted token tables |
| InlineCitation | `InlineCitationSource` (`title`/`url`/`description`) | A hand-built card body without truncation guards |
| Reasoning | `ReasoningTrigger` (self-rendering) | A custom "Thinking..." toggle |

Three components throw at runtime if you skip their parent: `Confirmation`, `ChainOfThought`, `Plan`. Hand-rolled markup there is a crash, not a style bug.

## Canonical compositions

Chat shell, from their chatbot example. Note the absence of `max-w-*`, `mx-auto`, or `space-y-*` between messages, and that separation is `divide-y` on the parent:

```tsx
<div className="relative flex size-full flex-col divide-y overflow-hidden">
  <Conversation>
    <ConversationContent>{/* messages */}</ConversationContent>
    <ConversationScrollButton />
  </Conversation>
  <div className="grid shrink-0 gap-4 pt-4">
    <Suggestions className="px-4">{/* ... */}</Suggestions>
    <div className="w-full px-4 pb-4">
      <PromptInput onSubmit={handleSubmit}>{/* ... */}</PromptInput>
    </div>
  </div>
</div>
```

`PromptInput` - submit is a sibling of Tools, not inside it:

```tsx
<PromptInput onSubmit={handleSubmit}>
  <PromptInputHeader><PromptInputAttachmentsDisplay /></PromptInputHeader>
  <PromptInputBody><PromptInputTextarea /></PromptInputBody>
  <PromptInputFooter>
    <PromptInputTools>
      <PromptInputButton><GlobeIcon size={16} /><span>Search</span></PromptInputButton>
    </PromptInputTools>
    <PromptInputSubmit status={status} />
  </PromptInputFooter>
</PromptInput>
```

`Reasoning`, `Sources`, `Task` and `ChainOfThought` all follow the same trigger-plus-content shape, with the trigger self-rendering its icon, label and chevron:

```tsx
<Reasoning className="w-full" isStreaming={isStreaming}>
  <ReasoningTrigger />
  <ReasoningContent>{content}</ReasoningContent>
</Reasoning>
```

Labels inside a `flex items-center` row are `<span>`, following the library's own convention: `<span>You approved this tool execution</span>`, `<span>Search</span>`.

## Motion defaults

12 of the 27 installed components carry motion. Preserve it; do not strip or re-invent it.

| Behaviour | Where |
|---|---|
| `data-[state=open]:animate-in` + `slide-in-from-top`, `data-[state=closed]:animate-out` + `fade-out` | Reasoning, Sources, ChainOfThought, Tool, InlineCitation |
| `transition-transform` + `data-[state=open]:rotate-` on the chevron | the same collapsibles |
| `transition-colors` hover | buttons, suggestions, attachments |
| `animate-spin` / `animate-pulse` / `animate-ping` | Loader, Shimmer, SpeechInput |

The AI-specific behaviours a demo should show: streaming text revealed progressively, a **stop control present from the first token**, the reasoning panel auto-opening while thinking then collapsing to "Thought for N seconds", staged progress on Task and Plan, Shimmer only while generating, and stick-to-bottom scrolling during streaming.

Motion is bounded by MOT-1 (100-300ms, standard easing), SLP-8 (no bounce or elastic) and A11Y-5 (a reduced-motion path). The global `prefers-reduced-motion: reduce` guard in `app/globals.css` covers vendor internals we do not fork.

## Known traps

- **There is no `Alert`-style loading component in AI Elements.** The loading affordances are `Shimmer` for streaming text and `PromptInputSubmit status={...}`, which swaps its own icon. `Loader` is installable from the registry and is used here, but check before assuming any component exists.
- **Multiple reasoning blocks.** Some models return several reasoning parts. Consolidate them into one `Reasoning` component so you do not render several "Thinking..." indicators.
- **`InlineCitation` is inline by design** (`<span>`) and must sit inside a text flow.
- **`PlanTitle` / `PlanDescription` accept `children: string` only**, because they swap in `Shimmer` while streaming.
