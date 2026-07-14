# AI Elements recipes

Component reference for AI features in Teacher & School products. Source:
`https://elements.ai-sdk.dev/` (researched 2026-07-15). Components install
as copied source files, not versioned npm packages.

## Prerequisites

Node.js 18+, React 19, Next.js 14+ App Router, AI SDK configured, Tailwind CSS 4.
shadcn/ui is auto-initialised if absent when you run any install command.

## Stack check first

AI Elements ships as a single shadcn/ui registry (source: `github.com/vercel/ai-elements`).
There is no headless variant, no framework-agnostic npm package, and no `--no-deps` flag.

**On the TFX site (base-nova): this is the first-class path.** The `components.json`
style `"base-nova"` means shadcn/ui is already initialised with Base UI primitives
under the hood. Run `pnpm dlx shadcn@latest add <wrapper>` for any missing primitive
wrapper, then `pnpm dlx ai-elements@latest add <component>` for the AI Elements
components. The install commands below work as written.

**On a product repo without base-nova:** if the repo uses raw Base UI without the
shadcn API wrappers, every install path cascades Radix-backed primitives via a shadcn
init that conflicts with the Base UI layer. Use the porting strategy at the bottom of
this file instead.

**Radix dependency by component** (checked against `packages/elements/src/*.tsx`).
On base-nova these are informational — the wrappers already exist. On a non-base-nova
Base UI stack, this tells you what each component reaches through and what you need to
port:

| Component | Radix primitives pulled in | On base-nova | On raw Base UI |
|---|---|---|---|
| `Shimmer` | none | Install directly | Install directly |
| `Suggestion`, `Confirmation` | `Slot` only (polymorphic `asChild`) | Install directly | Install directly |
| `Conversation` | `Slot` only | Install directly | Install directly |
| `Message` | `Tooltip` | Install directly | Port `tooltip.tsx` to Base UI `Tooltip` first |
| `PromptInput` | `Select`, `DropdownMenu`, `HoverCard`, `Tooltip` | Install directly | Port four primitives — heaviest component |
| `Sources`, `Task` | `Collapsible` | Install directly | Port `collapsible.tsx` to Base UI `Collapsible` |
| `InlineCitation`, `Attachments` | `HoverCard` | Install directly | Port `hover-card.tsx` to Base UI `Preview Card` |
| `Plan` | `Collapsible` | Install directly | Port `collapsible.tsx` |
| `Checkpoint` | `Separator`, `Tooltip` | Install directly | Port both |

## Install commands

```bash
# On base-nova (TFX site) — preferred
pnpm dlx shadcn@latest add <wrapper>        # add a missing shadcn primitive wrapper
pnpm dlx ai-elements@latest add <component> # add the AI Elements component

# On any stack — AI Elements CLI
npx ai-elements@latest add <component>

# Alternative — shadcn CLI
npx shadcn@latest add @ai-elements/<component>
```

Replace `<component>` with the kebab-case name: `message`, `prompt-input`,
`inline-citation`, `confirmation`, etc. Components land in
`@/components/ai-elements/`.

`ai`/`@ai-sdk/react` install cleanly with zero UI dependencies (verified against
their npm manifests) regardless of which stack you are on — the chat logic is never
the problem, only the component layer is.

## Key components

### Conversation
**Pattern:** persistent chat shell — stateful outer container that wraps messages and
manages scroll.
**Anatomy:** `ConversationContent`, `ConversationEmptyState`, `ConversationScrollButton`,
`ConversationDownload`.
**Notes:** auto-scrolls to latest message; exports `messagesToMarkdown` for download.
Use with `Message` and `PromptInput` as the core triad.

### Message / MessageResponse
**Pattern:** dual-role message bubble — handles both user and assistant messages.
**Anatomy:** `Message`, `MessageContent`, `MessageResponse`, `MessageActions`,
`MessageBranch`, `MessageToolbar`.
**Props:** `MessageResponse` renders GitHub Flavored Markdown with math and streaming.
**Critical:** add `@source "../node_modules/streamdown/dist/*.js"` to `globals.css`
or `MessageResponse` will not render.
**Notes:** supports response branching (navigate between AI response versions).

### PromptInput
**Pattern:** rich multimodal entry point for text, files, and voice.
**Anatomy:** textarea, footer, header, action menus, attachment display, model selector;
exports `useAttachments`.
**Props:** `status` from `useChat` toggles between send and stop affordance — wire
this or streaming has no stop control (CNV-1 failure).
**Notes:** auto-resizing; drag-and-drop upload; Web Speech API; Enter to submit.

### Suggestion
**Pattern:** zero-friction starter — horizontal strip of tap-to-send chips.
**Anatomy:** `Suggestions` (ScrollArea wrapper), `Suggestion` (child).
**Props:** `suggestion` (string, required), `onClick` receives the suggestion string.
**Notes:** show before conversation starts or after each turn to reduce blank-slate
friction. Fits the inline suggestion row in the routing table.

### Shimmer
**Pattern:** loading text reveal — indicates streamed text is still arriving.
**Props:** `children` (text), `as` (HTML element, default `p`), `duration` (seconds,
default 2), `spread` (gradient width multiplier, default 2).
**Notes:** CSS gradient sweep animated with Framer Motion. Use on titles and field
labels while a draft is arriving; replace with `MessageResponse` once stream ends.

### Sources
**Pattern:** citation panel — collapsible list of reference URLs on an assistant message.
**Anatomy:** `Sources`, `SourcesTrigger` (shows count), `SourcesContent`, `Source`.
**Notes:** filters `message.parts` for `source-url` type. Required for summarisation
and Q&A features (R2, AID-1). Use when `InlineCitation` is not feasible (see below).

### InlineCitation
**Pattern:** hover-reveal attribution — citation pills in prose that expand into source
cards on hover.
**Anatomy:** pill, carousel (prev/next), source title, URL, description, quote,
position indicator.
**Critical incompatibility:** does not work with `MessageResponse` / Streamdown
markdown. Requires `experimental_useObject` with a Zod schema for structured output.
If the feature streams markdown, use `Sources` panel instead.

### Confirmation
**Pattern:** human-in-the-loop gate — approve/deny before an agent executes a tool call.
**Anatomy:** `Confirmation`, `ConfirmationRequest`, `ConfirmationAccepted`,
`ConfirmationRejected`, `ConfirmationActions`.
**Props:** renders based on four states — `approval-requested`, `approval-responded`,
`output-denied`, `output-available`.
**Critical:** backend tools must set `requireApproval: true` for the approval-request
state to trigger. Without this, the gate never appears.
**Notes:** directly implements R5 and CNV-2. Copy in `ConfirmationRequest` must be
plain language — no ML terminology (R6).

### Task
**Pattern:** live task list — checklist that populates as an agent works through steps.
**Anatomy:** `Task` (`defaultOpen`), `TaskTrigger` (`title` required), `TaskContent`,
`TaskItem`, `TaskItemFile`.
**Props:** per-item status icons: pending, in-progress, completed, error.
**Notes:** streams in real time via `experimental_useObject`. Use alongside
`Confirmation` for agent flows that take actions.

### Plan
**Pattern:** agent plan reveal — shows a multi-step plan before or while the agent
executes.
**Anatomy:** `Plan` (`isStreaming`, `defaultOpen`), `PlanTitle`, `PlanDescription`,
`PlanTrigger`, `PlanContent`.
**Notes:** shimmer animations on title and description during streaming. Built on
shadcn Card + Collapsible. Use to set expectations (R1) before an agent acts.

### Reasoning
**Pattern:** live thought stream — self-managing disclosure widget for in-progress
reasoning.
**Anatomy:** single collapsible; `useReasoning` hook.
**Props:** `isStreaming` boolean (required for auto-open/close), `getThinkingMessage`
for custom label.
**Notes:** auto-opens during streaming, auto-closes when stream ends. For models that
emit continuous reasoning tokens (Claude extended thinking). Deferred from the TFX
routing table pending a confirmed use case.

### Attachments
**Pattern:** file stage — uploaded or referenced files shown before or alongside a message.
**Anatomy:** `Attachments` (`variant` prop), `Attachment`, `AttachmentPreview`,
`AttachmentInfo`, `AttachmentRemove`.
**Variants:** `grid` (thumbnails), `inline` (badges), `list` (rows).

## Feature type to recipe

| Feature type | Install first | Then add |
|---|---|---|
| Inline suggestion | `suggestion` | `prompt-input` (for the status toggle) |
| Generated draft | `message` | `shimmer` (for streaming title); wire `globals.css` for `MessageResponse` |
| Summarisation | `message`, `sources` | `inline-citation` only if switching to structured output |
| Q&A / RAG | `message`, `sources`, `inline-citation` | `attachments` for file context |
| Agent actions | `confirmation`, `task`, `plan` | `checkpoint` if conversation revert is needed |
| Full conversation | `conversation`, `message`, `prompt-input` | `reasoning`, `suggestion`, `attachments` as needed |

## Install strategy on a non-base-nova Base UI stack

Use this path only when the product repo is on raw Base UI without the shadcn API
wrappers. On the TFX site (base-nova), use the install commands above instead.

AI Elements source is plain, MIT/Apache-licensed `.tsx` — the shadcn model is
copy-paste, not a package, so cherry-picking and porting is a supported way to use
it, not a hack. In priority order:

1. **Install `ai` and `@ai-sdk/react` directly** (`npm install ai @ai-sdk/react`).
   No UI dependency, no conflict, `useChat` works exactly as documented.
2. **Copy the dependency-light components as-is** from
   `raw.githubusercontent.com/vercel/ai-elements/main/packages/elements/src/<name>.tsx`:
   `shimmer.tsx`, `suggestion.tsx`, `confirmation.tsx`, `conversation.tsx`. These need
   no primitive porting — at most a `Slot`-to-render-prop swap on `Button`.
3. **Port only the Radix primitives the remaining components need**, targeting Base UI
   with matching names so the copied AI Elements files need only an import-path change:

   | Radix primitive | Base UI equivalent | Used by |
   |---|---|---|
   | `Tooltip` | `Tooltip` | Message, PromptInput, Checkpoint |
   | `Select` | `Select` | PromptInput |
   | `Collapsible` | `Collapsible` | Sources, Task, Plan |
   | `HoverCard` | `Preview Card` | InlineCitation, Attachments, PromptInput |
   | `DropdownMenu` | `Menu` | PromptInput |
   | `Separator` | `Separator` | Checkpoint |
   | `Slot` (`asChild`) | render prop (`render={(props) => <button {...props} />}`) | Button-based components |

   `cmdk` (in PromptInput) and `embla-carousel-react` (in InlineCitation) are neither
   Radix nor Base UI — leave them as-is regardless of which primitive layer is chosen.
4. **Never run `npx shadcn@latest init`** on a raw Base UI product — it scaffolds a
   second, conflicting component layer. Track upstream AI Elements changes manually
   once ported, since forked source doesn't pull registry updates.

If porting is out of scope for the current task, fall back to a from-scratch component
that mirrors the anatomy with TFX-native primitives — e.g. a `Confirmation` built on
Base UI `Dialog` with two `Button` variants (primary approve, ghost deny), matching the
four Confirmation states. Name it to match the AI Elements anatomy (`<Confirmation>`,
`<ConfirmationRequest>`) so the routing table stays readable. Use semantic tokens only —
no raw hex or off-scale spacing (TOK-1..3).

## Voice, Workflow, Utilities — installed on the TFX site but not in the routing table

All non-Code AI Elements categories are installed on the TFX site: Chatbot (19
components), Voice (6), Workflow (7), Utilities (2). Voice, Workflow, and Utilities do
not appear in the routing table because teacher-facing use cases are speculative at this
stage.

- **Voice** — may fit dictation for CaseSync case notes or accessibility-driven input on
  any product. Worth evaluating when a user-research finding points to hands-free or
  low-vision use cases.
- **Workflow / Canvas** — fits admin and ops pipelines (for example, an attendance sync
  visualisation or a CaseSync case-progression board), not classroom surfaces. Route here
  only when the task is clearly internal-tooling or admin.
- **Utilities (Image, Open-In-Chat)** — situational. Use when an existing surface
  already has an image-heavy or chat-handoff context; don't add for novelty.

## Known upstream patches required for base-nova compatibility

Two AI Elements components needed source-level fixes at install time. If you upgrade
AI Elements in future, check whether these are still needed and reapply if so.

**`prompt-input` — DropdownMenuItem interaction fix:**
The upstream `DropdownMenuItem` uses `onSelect` to handle model selection. On base-nova
the select event fires and immediately closes the menu before state can update.
Fix: replace `onSelect` with `onClick` and add `closeOnClick={false}` to the item.

**`voice-selector` — lucide icon substitutions:**
The upstream component imports two lucide-react icons that are not present in the
version pinned by base-nova. Fix: substitute with the nearest available lucide icons
(or inline the SVG paths) — the exact substitutions are in the commit that installed
this component.
