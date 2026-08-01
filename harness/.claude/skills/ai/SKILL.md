---
name: ai
description: AI and conversation design for education products - routing by feature type, the nine principles as enforceable rules, AI Elements component selection, and how a forking domain calibrates. Use when designing or changing any AI-powered feature - suggestions, generated drafts, summaries, Q&A, agent actions, or a chat/conversation surface. Also use when the user mentions AI, assistant, chatbot, LLM, or generation in a design ask. NOT for general page design - that is the design skill. NOT for copy-only work - that is copy.
---

# AI and conversation design

Route an AI feature to the right surface, then enforce the nine principles.
This skill carries the canonical routing table and rule set; the human-readable pages follow it.
The five sources behind the rules are harvested in `../../../docs/research/`, and the cut is derived in `ai-principles-derivation.md` there.

**Core stance.** Embedded AI inside the task beats conversation one step removed.
Choose the lowest-automation surface that serves the known task: inline suggestion,
then generated draft, then summarisation or Q&A panel, then - only when no structured
surface fits - an open conversation. A chat panel bolted onto a task with a known
repeatable structure is a routing failure. Route by the table below before diverging on layout.

**Who is "the person".** In education the operator (hands on the interface) is often not the
subject (bears the consequence) or the learner (whose skill is at stake). Every rule below
names which one it protects; do not collapse them into a generic "user".

## Routing table

| AI feature type | Surface | AI Elements components | Judgment call |
|---|---|---|---|
| Inline suggestion (autocomplete, chips, next action) | Embedded in the workflow; no separate panel | `Suggestion`, `PromptInput` status toggle | Does it interrupt flow or fit inside it? (Earn the AI; Set honest expectations) |
| Generated draft (write / rewrite a field or section) | Inline in the form or document; modal only for full-page replacement | `Message`, `MessageResponse`, `Shimmer` | The operator stays the author - editable, revertable, marked (Set honest expectations; Keep the human steering; AID-1) |
| Summarisation (distil a document or thread) | Inline below or beside the source | `Message`, `Sources`, `InlineCitation` | Trace every claim to evidence (Show the working; AID-1) |
| Q&A over content (RAG - answering from your own documents, not the model's general knowledge) | Embedded panel or drawer beside the source; not a new tab | `Message`, `Sources`, `InlineCitation`, `Attachments` | Scope when uncertain - ask rather than guess (Keep the human steering); sources every time (Show the working) |
| Agent that takes actions (files, sends, creates records) | Inline workflow with explicit confirmation gate; never silent | `Confirmation`, `Task`, `Plan`, `Checkpoint` | Consequential actions gated (Keep the human steering; CNV-2, CMP-2) |
| Full conversation (open-ended chat) | Last resort - only when the task cannot be scoped in advance | `Conversation`, `Message`, `PromptInput`, `Reasoning` | Document why no embedded control could serve this need |

Component recipes, install commands, and hand-built fallback guidance: `recipes.md` in this skill directory.

## The nine principles as rules

Every AI feature follows these. They are grouped by the four questions the human-readable Overview uses. Each names the role it protects.

### Is AI the right call?

**1. Earn the AI.** Choose the lowest-automation surface that serves the task (routing table). If a fixed rule gives the same result, use the rule. A chat panel on a structured task is a routing failure. *Protects: the operator.*

### Is it honest?

**2. Set honest expectations.** One sentence on what the feature does and one honest limitation before the person can act. Mark AI output at point of use - beside the content, never hidden when the parent is disabled (AID-1, L1; token label, no gradient or glow, SLP-1). An AI identity reads as a tool; the younger the operator, the more explicit and less human the cues. *Protects: the operator, and the subject when a mark reaches them.*

**3. Show the working.** Trace every claim to a source the person can open (`Sources`, `InlineCitation`). Expose the steps behind anything consequential (`Reasoning`, `Task`, `Plan`). Summaries and answers carry attribution every time. *Protects: the operator and the subject.*

**4. Fail safely, even when the failure is invisible.** No ML or model terminology in error copy: say what did not work and what to do next (AID-2, L2; CNT-1 anatomy). The failure path is never worse than the non-AI fallback. For errors the person cannot perceive, do not rely on user feedback to surface them - require a separate quality check, and the more consequential the outcome, the more oversight. *Protects: the operator and the subject.*

### Does the person stay in charge?

**5. Keep the human steering.** Outputs are editable and revertable; the mark clears on edit and returns on revert. Consequential actions - modify, send, file, delete - show plain-language consequences and wait for approve or deny (CNV-2, L1; on top of CMP-2). Streaming shows a stop control from the first token (CNV-1). Outputs the operator cannot edit carry one explicit feedback affordance instead. *Protects: the operator; guards the subject.*

**6. Keep data where it was put.** Make "used to answer now" versus "used to train the model" obvious, and offer an out-of-memory or ephemeral path. No copy implying the model "learned" from a person's data. Sharpest when the data is a minor's. *Protects: the subject.*

### Is it safe for the person it affects?

**7. In learning, help beats answer.** First: is the operator the learner? If not, answer directly - a work tool should not withhold. If yes, sort by task type: facts and procedures get answered; judgement and craft get a guiding question, a scaffold, or a reflection prompt, never a finished piece in the person's voice. Impact Bench scores `Direct Answer Provision` a failure when the person asked for guidance. *Protects: the learner.*

**8. Work for everyone.** Check performance broken down by group, not only in aggregate. Test with the range of people who will use it. Age-band the review: if under-18s use it, run it again for them. *Protects: the subject and the learner.*

**9. Protect the person's wellbeing.** No sycophancy (a model's habit of telling people what pleases them over what is true), no harmful or age-inappropriate content, no engagement-maximising (streak counters, variable-reward nudges, endless feeds), no parasocial pull. A content filter matched to the age band. Weigh hardest for the youngest. *Protects: the subject and the learner.*

Adversarial input (prompt injection) is defended at the prompt tier, not by these nine - see `content/guidelines/ai-prompts.mdx` and the security note in `recipes.md`. A learner has a motive to attempt it.

## How a forking domain calibrates

The catalog is portfolio-wide and product-agnostic, with no per-product overlays.
A domain forking the Generic Design Harness (Edupass, Students, Parents, Platform) sets its own weighting and specifics in its own `DESIGN.md` (see `../../../docs/DESIGN-CONTEXT.md`), never by editing the shared catalog.

What a domain sets there:
- **Which principles carry most weight for its stakes.** A records or enrolment tool leans on 5, 6 and 8; a tool for young learners leans on 2, 7 and 9; a high-consequence assessment tool leans on 4 and 5.
- **Error-copy tone** within rule 4 (workmanlike, warmer, and so on).
- **Mark visibility** within rule 2 (higher gravity where an unreviewed output is a foreseeable harm).
- **Who counts as operator, subject and learner** in its context, so the role tags resolve to real people.

## Pointers

**Component recipes:** `recipes.md` (this directory) - install commands, anatomy, props, pattern, and hand-built fallback guidance for the key components.

**Composition and spacing:** `composition.md` (this directory) - the canonical AI Elements composition, slot, and motion reference. Build demos and features against it rather than inventing layout.

**Human-readable guidelines:** `content/guidelines/ai.mdx`, `ai-patterns.mdx`, `ai-components.mdx`, and `ai-prompts.mdx` present these rules for designers.
This skill is canonical for the routing table and the rules; those pages follow it.

**Candidate catalog controls:** CNV-1 (stoppable streaming), CNV-2 (confirmation for consequential AI actions), AID-1 (marking and revert), AID-2 (error anatomy) - proposed in `docs/decisions/ai-design-guidelines.md`, pending design-lead approval via the ratchet (`standards` skill). Do not treat them as settled or link them from content pages.

## Gotchas

- **The TFX site uses base-nova, which is a shadcn/ui variant - AI Elements installs
  cleanly on this stack.** The `components.json` style `"base-nova"` means the site
  already has shadcn/ui initialised with Base UI primitives under the hood. Run
  `pnpm dlx shadcn@latest add <wrapper>` for any missing primitive wrapper and
  `pnpm dlx ai-elements@latest add <component>` for the AI Elements components. The
  conflict story in `recipes.md` only applies to product repos on raw Base UI without
  the shadcn API wrappers, or on a Radix-based shadcn setup in a design system that
  bans Radix visually. `ai` and `@ai-sdk/react` have zero UI dependencies and always
  install clean - the chat logic is never the problem.

- **Marking AI output is a token label, never a gradient or glow.** A blue-gradient or
  glowing badge is another design system's visual language, and TFX bans gradients
  (SLP-1). Use the token-based label from AID-1's detail file. A gradient badge on AI
  content fails SLP-1 regardless of whether the intent was labelling.

- **Do not bolt a chat panel onto a task with a known, repeatable structure.** Mark,
  summarise, suggest next step, fill a field - these have structured surfaces in the
  routing table. Route first; if the table points to an embedded control, that is the
  answer. Chat is a deliberate, documented exception, not a default.

- **Streaming without a stop control fails the proposed CNV-1 check.** `PromptInput`
  reads `status` from `useChat` and switches between send and stop; if `status` is not
  wired, the person has no way to interrupt a long stream. Build the stop affordance
  before the feature ships (rule 5).

- **`InlineCitation` cannot be used with `MessageResponse` or Streamdown markdown.**
  It requires `experimental_useObject` with a Zod schema for structured output. If the
  design calls for inline citations and the implementation uses streaming markdown,
  that is a known incompatibility - either switch the output mode or use a `Sources`
  panel instead of inline pills.

- **"The person" is three people, not one.** A rule that protects the subject (rule 6,
  data; rule 9, wellbeing) will be applied to the wrong human if you read "the person"
  as the operator. When a rule's role tag and the surface's actual operator differ, the
  gap is the finding - a learner assessed by a tool an educator drives is the canonical
  case (rules 4, 8, 9).
