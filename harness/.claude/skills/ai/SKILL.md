---
name: ai
description: AI and conversation design for Teacher & School products — routing by feature type, always-apply rules (R1-R6), AI Elements component selection, and per-product calibration. Use when designing or changing any AI-powered feature — suggestions, generated drafts, summaries, Q&A, agent actions, or a chat/conversation surface. Also use when the user mentions AI, assistant, chatbot, LLM, or generation in a design ask. NOT for general page design — that is the design skill. NOT for copy-only work — that is copy.
---

# AI and conversation design

Route AI features in Teacher & School products to the right surface, then enforce the
six always-apply rules. This skill carries the canonical routing table and rule set.
Control IDs follow `../../../docs/decisions/ai-design-guidelines.md`; the spike index at
`../../../docs/spikes/ai-guidelines-research/index.md` is the research trail behind both.

**Core stance.** Embedded AI inside the task beats conversation one step removed.
Choose the lowest-automation surface that serves the known task: inline suggestion,
then generated draft, then summarisation or Q&A panel, then — only when no structured
surface fits — an open conversation. A chat panel bolted onto a task with a known
repeatable structure is a routing failure. Route by the table below before diverging on layout.

## Routing table

| AI feature type | Surface | AI Elements components | Judgment call |
|---|---|---|---|
| Inline suggestion (autocomplete, chips, next action) | Embedded in the workflow; no separate panel | `Suggestion`, `PromptInput` status toggle | Does it interrupt flow or fit inside it? (R1 sets expectations first) |
| Generated draft (write / rewrite a field or section) | Inline in the form or document; modal only for full-page replacement | `Message`, `MessageResponse`, `Shimmer` | Teacher must stay the author — editable, revertable, marked (R2, R3, AID-1) |
| Summarisation (distil a document or thread) | Inline below or beside the source | `Message`, `Sources`, `InlineCitation` | Attribution fidelity — trace every claim to evidence (R2, AID-1) |
| Q&A over content (RAG, ask-about-this-document) | Embedded panel or drawer beside the source; not a new tab | `Message`, `Sources`, `InlineCitation`, `Attachments` | Scope when uncertain — ask rather than guess (R4); sources every time |
| Agent that takes actions (files, sends, creates records) | Inline workflow with explicit confirmation gate; never silent | `Confirmation`, `Task`, `Plan`, `Checkpoint` | Consequential actions gated (R5, CNV-2, CMP-2) |
| Full conversation (open-ended chat) | Last resort — only when the task cannot be scoped in advance | `Conversation`, `Message`, `PromptInput`, `Reasoning` | Document why no embedded control could serve this need |

Component recipes, install commands, and hand-built fallback guidance: `recipes.md`
in this skill directory.

## Always-apply rules (R1-R6)

Every AI feature in all three products follows these six rules.

**R1 - Set expectations before the first interaction.** One sentence on what the feature
does and at least one honest limitation before the teacher can act on it.

**R2 - Mark AI-generated content at point of use.** The mark lives beside the content
itself, not only in a header or tooltip; it never hides even when the parent is
disabled. TFX uses a token-based label — no Carbon gradient, no glow (SLP-1). This
is AID-1 (L1) in the candidate catalog.

**R3 - The teacher stays the author.** AI drafts and fills are editable and revertable.
The mark clears when the teacher edits; it returns on revert. This is part of AID-1 (L1).
Outputs the teacher cannot edit — summaries, answers — carry one explicit feedback
affordance instead.

**R4 - Scope when uncertain; ask before acting on a wrong assumption.** Applies
hardest to agents and Q&A — narrow scope or surface a clarifying question rather than
guess.

**R5 - Consequential actions require explicit approval; everything else gets undo.**
Agent actions that modify, send, file, or delete must show plain-language consequences
and wait for approve/deny. This is CNV-2 (L1); it layers on top of CMP-2.

**R6 - Make failure safe and boring.** No ML or model terminology in error copy.
What did not work, and what the teacher does next. The failure path is never worse
than the non-AI fallback. This is AID-2 (L2); it follows the CNT-1 anatomy.

## Per-product calibration

**Teacher Workspace** — standard weight on all six rules. Inline suggestion and
generated draft are the most likely first features. Error copy: workmanlike, no
apology or cheerfulness.

**CaseSync** — higher gravity. R3 and R5 are most important: a teacher submitting an
unreviewed AI case note is a foreseeable failure mode. AID-1 at higher visibility;
CNV-2 shows full consequence detail. No copy implying the model "learned" from
student data.

**Glow** — lighter and more experimental. R6 failure copy may be warmer. AID-1 is
still required (L1; no waiver path without a human approver).

## Pointers

**Component recipes:** `recipes.md` (this directory) — install commands, anatomy,
props, pattern, and hand-built fallback guidance for the twelve key components.

**Human-readable guidelines:** `content/guidelines/ai-design.mdx`,
`content/guidelines/conversation-design.mdx`, and
`content/guidelines/prompt-engineering.mdx` present these rules for designers.
This skill is canonical for the routing table and rules; those pages follow it.

**Candidate catalog controls:** CNV-1 (stoppable streaming), CNV-2 (confirmation for
consequential AI actions), AID-1 (marking + revert), AID-2 (error anatomy) — proposed in
`docs/decisions/ai-design-guidelines.md`, pending design-lead approval via the ratchet
(`standards` skill). Do not treat them as settled.

## Gotchas

- **The TFX site uses base-nova, which is a shadcn/ui variant — AI Elements installs
  cleanly on this stack.** The `components.json` style `"base-nova"` means the site
  already has shadcn/ui initialised with Base UI primitives under the hood. You can
  run `pnpm dlx shadcn@latest add <wrapper>` for any missing primitive wrapper and
  `pnpm dlx ai-elements@latest add <component>` for the AI Elements components. The
  conflict story in `recipes.md` only applies to product repos that are on raw Base UI
  without the shadcn API wrappers, or on a Radix-based shadcn setup in a design system
  that bans Radix visually. `ai` and `@ai-sdk/react` have zero UI dependencies and
  always install clean — the chat logic is never the problem. `recipes.md` has the
  full dependency table and the porting map for non-base-nova stacks.

- **Do not use Carbon's gradient or glow to mark AI-generated content.** Carbon's
  blue-gradient treatment is Carbon's own visual language. TFX bans gradients (SLP-1).
  Use the token-based label pattern described in AID-1's detail file. A gradient badge
  on AI content fails SLP-1 regardless of whether the intent was labelling.

- **Do not bolt a chat panel onto a task with a known, repeatable structure.** Mark,
  summarise, suggest next step, fill a field — these have structured surfaces in the
  routing table. Route first; if the table points to an embedded control, that is the
  answer. Chat is a deliberate, documented exception, not a default.

- **Streaming without a stop control fails the proposed CNV-1 check.** `PromptInput`
  reads `status` from `useChat` and switches between send and stop; if `status` is
  not wired, the teacher has no way to interrupt a long stream. Build the stop
  affordance before the feature ships.

- **`InlineCitation` cannot be used with `MessageResponse` or Streamdown markdown.**
  It requires `experimental_useObject` with a Zod schema for structured output. If
  the design calls for inline citations and the implementation uses streaming markdown,
  that is a known incompatibility — either switch the output mode or use a `Sources`
  panel instead of inline pills.
