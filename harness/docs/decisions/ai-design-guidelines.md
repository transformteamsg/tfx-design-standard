# Design decision record — AI design guidelines pages

> One record per page or significant change. Started at the Phase 3 plan gate (the
> approved plan is the fixed artifact the verify phase grades against), finished at
> Phase 6. Keeps the human approval, waivers, and verdict traceable.

- **Date:** 2026-07-15
- **Product:** TW | CaseSync | Glow (cross-product — site-wide guideline pages)
- **Change type:** new page
- **Page type:** guidance content — two sibling pages on the TFX design standard site
- **Run type:** attended
- **The teacher and the moment:** not a teacher-facing surface. These pages serve designers and engineers at TransformX who are adding AI features to Teacher Workspace, CaseSync, or Glow and need to know which surface to use, what rules always apply, and how to design a conversation surface that meets the standard.

## Sprint contract (done-criteria)

1. `content/guidelines/ai-design.mdx` — routing table, six always-apply rules (R1-R6), and per-product calibration notes; status: proposed.
2. `content/guidelines/conversation-design.mdx` — conversation-specific design guidance covering prompt input, streaming, sources, confirmations, errors, scoping, and memory; status: proposed.
3. Both pages match the length, structure, and voice of sibling guideline pages (e.g. `interaction.mdx`); copy passes SLP-9 and CNT-3.

## Chosen approach

Two separate pages: a general AI design page covering the routing table and always-apply rules, and a conversation-specific page covering the controls that only apply when a conversation surface is warranted. The routing table on the AI design page links the two pages.

The site already pairs a high-level principle page with a mechanics page for different reader intents. A reader doing feature routing wants the table. A reader designing a chat surface wants the conversation-specific controls.

## Rejected options

- **Single merged page** — routing, rules, and conversation controls on one page produces a page requiring heavy progressive disclosure. Rejected: guideline pages on this site are deliberately short; length signals scope creep, not thoroughness.
- **No conversation-specific page; embed in AI design** — conversation controls are a subset of a subset. Merging them hides their specificity and implies they apply to all AI features. Rejected: misleading scope.

## Tradeoffs, named

- **Two pages require cross-linking discipline.** A reader landing on the conversation page without context could miss the routing table and reach for a conversation surface prematurely. Mitigated by the opening bullet on `conversation-design.mdx` which explicitly names the routing table and links back.
- **Status: proposed on both pages** signals that these controls are not yet settled. This is accurate — the four controls proposed in the ratchet below are new catalog entries awaiting design-lead approval. Marking them proposed prevents premature citation as normative.

## Controls in scope

These are site-content pages, not product UI. The catalog controls that bind are the content and copy controls:

| ID | Title | Tier | Rationale |
|----|-------|------|-----------|
| CNT-3 | Second person, active voice, ≤ 25 words | L2 | All prose copy on both pages |
| CNT-7 | Lead with purpose, not mechanism | L2 | Page descriptions and opening bullets |
| SLP-9 | AI-writing tells — flagged vocabulary and structures | L2 | All prose copy |
| CNT-2 | Feature/page names plain language | L1 | Page titles, control names proposed in ratchet |

## Waivers granted

None.

> L0 controls are never waivable. L1 waivers need a named human approver. L2 waivers need a specific, real reason.

## Plan approval

- **Approved by:** (pending — design lead)
- **Approved on:** (pending)

## Verify verdict

- **Screenshots:** not applicable — text content pages rendered by the site framework; layout is inherited from the site shell.
- **Dark mode:** N/A for this decision record — site dark mode is a separate concern.
- **Verification ledger:**

  | Control | Method | Evidence |
  |---------|--------|----------|
  | CNT-3 | manual | Sentences checked against 25-word ceiling; active voice throughout; second person where prose addresses the reader |
  | CNT-7 | manual | Opening bullets and descriptions lead with teacher benefit or use-case trigger, not with mechanism |
  | SLP-9 | manual | No flagged vocabulary (delve, testament, pivotal, seamless, empower); no em-dash chains; no negative-parallelism padding |
  | CNT-2 | manual | Control names proposed below use plain, function-first language |

- **Evaluator verdict:** pending

## Ratchet

The spike (index.md section 3) identified four candidate controls not yet in the catalog. They are proposed below, fully specified in catalog schema, and marked pending design-lead approval. No files are created in `standards/` and `catalog.yaml` is not touched until approval is granted.

---

### Proposed control 1: CNV-1 — Streaming AI responses are stoppable

**Proposed id:** CNV-1

**Source:** HAX G8 (support efficient dismissal)

**Title:** Streaming AI responses render a working stop control

**Tier:** L1

**Check type:** deterministic

**Phase:** [implement, verify]

**Applies to:** [component] — any surface rendering a streaming AI response

**Verify:** A stop/cancel control is present in the DOM and interactive while the response is generating. The control halts generation without clearing text already received.

**Fails when:**
- A streaming response renders with no visible stop or cancel control
- The stop control is present but disabled or non-functional during generation
- Stopping the stream clears text the teacher had already read

**Motivating evidence:**

> "Support efficient dismissal — Make it easy for the user to stop, ignore, or close AI-initiated actions or suggestions."
> — HAX G8, https://www.microsoft.com/en-us/haxtoolkit/library/ (hax.md)

`[proposed — pending design-lead approval]`

---

### Proposed control 2: CNV-2 — Consequential AI-initiated actions require confirmation

**Proposed id:** CNV-2

**Source:** HAX G8, G9; PAIR Pattern 16 (Let users supervise automation); TFX CMP-2

**Title:** Consequential AI-initiated actions require explicit confirmation showing consequences

**Tier:** L1

**Check type:** hybrid (deterministic sub-check + judgment sub-check)

**Phase:** [implement, verify]

**Applies to:** [flow] — any flow in which an AI agent or assistant initiates an action that modifies, sends, files, or deletes data

**Verify:**
1. Deterministic: a confirmation step exists between the AI proposing an action and the action executing; the confirmation element is in the DOM before any data mutation occurs.
2. Judgment: the confirmation copy states the specific consequence in plain language (names the record, the action, and the outcome) and contains no ML or model terminology.

**Fails when:**
- A data-modifying action executes without a confirmation step
- The confirmation copy is generic ("Confirm?" with no specifics) rather than consequence-specific ("This will update the student's reading level record")
- The confirmation copy uses ML or model terminology ("the model will", "AI will process")

**Motivating evidence:**

> "Consequential actions require explicit approval; everything else gets undo. Any AI-triggered action that modifies, sends, files, or deletes records must show consequences in plain language and wait for an explicit approve/deny before executing."
> — index.md, R5, citing HAX G8, G9 and TFX CMP-2

> "Let users supervise automation — Enable review and approval of automated decisions. Provides override capability and builds comfort before higher automation. Use when automating decisions that affect user work or data."
> — PAIR Pattern 16, pair.md

Note: CNV-2 extends CMP-2 (destructive actions show consequences and offer undo/confirm) to cover AI-initiated actions specifically. CMP-2 covers teacher-initiated destructive actions. CNV-2 covers AI-initiated actions that are consequential regardless of whether the teacher triggered them directly.

`[proposed — pending design-lead approval]`

---

### Proposed control 3: AID-1 — AI-generated content is visibly marked at point of use

**Proposed id:** AID-1

**Source:** IBM Carbon AI label principle; HAX G11; cross-industry consensus (index.md R2)

**Title:** AI-generated content is visibly marked at point of use with the TFX treatment; the mark clears when the teacher edits and returns on revert

**Tier:** L1

**Check type:** hybrid (deterministic sub-check + judgment sub-check)

**Phase:** [implement, verify]

**Applies to:** [page, component] — any surface that renders AI-generated content

**Verify:**
1. Deterministic: an AI-indicator element is co-located with the AI-generated content (not only in a page header or tooltip); the indicator uses TFX semantic tokens (no gradient fill, no glow — SLP-1 applies); the indicator is not hidden or disabled when the parent element is in a read-only or disabled state.
2. Deterministic: when a teacher edits the AI-generated content, the indicator is removed; when they revert to the AI version, the indicator returns.
3. Judgment: the indicator is visually distinct from the surrounding content and identifiable as an AI-origin marker without requiring the teacher to hover or expand.

**Fails when:**
- AI-generated content appears without a co-located visual indicator
- The indicator uses a gradient, glow, or Carbon-specific blue treatment (SLP-1 violation)
- The indicator is hidden, disabled, or absent when the parent element is in a disabled or read-only state
- Editing AI content does not remove the indicator
- Reverting to the AI version does not restore the indicator

**Motivating evidence:**

> "Mark AI-generated content at point of use. Every surface that shows AI-generated content must carry a visible indicator at the content itself, not only in a header or tooltip. The indicator must never be disabled, even when its parent element is in a read-only or disabled state."
> — index.md, R2, citing Carbon AI label principle, HAX G11, and baseline research consensus (index.md)

> "Carbon's blue gradient is Carbon's own visual language — TFX uses its own token-based treatment (no gradients, per SLP-1)."
> — index.md, R2 TFX note

`[proposed — pending design-lead approval]`

---

### Proposed control 4: AID-2 — AI errors and refusals follow CNT-1 anatomy with no model terminology

**Proposed id:** AID-2

**Source:** PAIR Errors chapter; TFX CNT-1; index.md R6

**Title:** AI errors and refusals follow CNT-1 anatomy and contain no model terminology

**Tier:** L2

**Check type:** hybrid (deterministic sub-check + judgment sub-check)

**Phase:** [implement, verify]

**Applies to:** [component] — any component that surfaces an AI error or refusal message

**Verify:**
1. Deterministic: error and refusal copy contains none of the following terms: "model", "neural network", "training data", "LLM", "token", "context window", "hallucination", "inference". A static string scan covers this sub-check.
2. Judgment: error and refusal copy states (a) what did not work, (b) what it means for the teacher's current task, and (c) what they can do next — matching the CNT-1 three-part anatomy. The failure experience is no worse than the non-AI fallback path.

**Fails when:**
- Error or refusal copy uses ML or model terminology in user-visible text
- Error copy omits any of the three CNT-1 parts (what happened / what it means / what to do next)
- The failure experience leaves the teacher with no recovery path
- The error is worded in a way that would alarm or confuse a teacher who has no ML background

**Motivating evidence:**

> "Make failure safe and boring — avoid making dangerous failure modes interesting or over-explaining vulnerabilities. Act with humanity in error messaging; avoid technical language."
> — PAIR Errors chapter, https://pair.withgoogle.com/chapter/errors-failing/ (pair.md)

> "AI errors must not use ML or model terminology in user-facing copy. Error messages say what did not work and what the teacher can do next. The failure experience should not be worse than the non-AI fallback."
> — index.md, R6, citing PAIR Errors chapter, HAX G12, and TFX interaction guideline

`[proposed — pending design-lead approval]`
