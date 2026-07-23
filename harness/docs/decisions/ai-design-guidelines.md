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

---

## Phase 6 update - 2026-07-15

**Stack story corrected.** The earlier framing in `harness/.claude/skills/ai/SKILL.md`
and `recipes.md` described the base-nova shadcn/ui variant as a conflict for AI Elements.
That was wrong. The TFX site's `components.json` style `"base-nova"` means shadcn/ui is
already initialised; AI Elements installs cleanly with standard `pnpm dlx` commands. The
conflict story only applies to product repos on raw Base UI without the shadcn wrappers.
Both files have been corrected.

**All non-Code AI Elements categories are now installed on the TFX site.** The installed
categories and component counts are: Chatbot (19 components), Voice (6), Workflow (7),
Utilities (2). Only components referenced in the routing table have active use cases on
teacher-facing surfaces; Voice, Workflow, and Utilities are installed but not yet routed.

**Two upstream patches were applied at install time:**
1. `prompt-input` — `DropdownMenuItem.onSelect` replaced with `onClick` +
   `closeOnClick={false}` to prevent the menu closing before state updates on base-nova.
2. `voice-selector` — two lucide-react icon imports substituted because the icons are
   absent from the version pinned by base-nova.

Future AI Elements upgrades should check whether these patches still apply and reapply
if needed. The substitutions are documented in the commit that installed the components.

**No TOK/COL waivers were needed.** The build passed all catalog gates clean — no
token, colour, or anti-slop controls were waived.

**The four proposed controls are unchanged.** CNV-1 (stoppable streaming), CNV-2
(confirmation for consequential AI actions), AID-1 (marking + revert), AID-2 (error
anatomy) remain as proposed above, pending design-lead approval via the ratchet.

**Citations are now inline on both guideline pages.** Each rule on `ai-design.mdx` and
`conversation-design.mdx` carries a per-rule inline citation plus a page-level
`> Reference:` blockquote pointing to the motivating source.

**Two new sections were added to `conversation-design.mdx`:** "Shape the assistant"
and "Handle the turn". These draw from Anthropic prompt engineering documentation,
Google Conversation Design guidelines, and Voiceflow research. They cover how to write
system prompts that produce predictable, safe assistant behaviour on teacher-facing
surfaces, and how to structure turn-level interaction patterns.

## Phase 8 update (2026-07-15)

**IA restructured to a parent page plus two child pages.** The flat two-page layout (ai-design, conversation-design) was not MECE: confirmation, scoping, expectations, and failure appeared on both pages. The new structure is:

- `ai-design.mdx` — parent and overview; owns the routing table and eight always-apply rules grouped into three h3 sections ("Be honest about the AI", "Keep the teacher in charge", "Handle doubt and failure safely"); ends with a "Go deeper" section linking both children.
- `conversation-design.mdx` — child covering what is specific to a conversation surface; seven surface-specific rules retained; three duplicate rules (consequential-actions approval, refusals/errors, scope-when-in-doubt) removed and replaced with a single pointer line back to the parent.
- `prompt-engineering.mdx` — new child covering system prompt authoring; the nine "Shape the assistant" rules moved verbatim from conversation-design.mdx to this page.

**Principles grouped under three h3 headings on the parent.** The eight always-apply rules were ungrouped before; they are now assigned to three named groups (three rules, three rules, two rules) to make the structure scannable and the intent clear.

**Duplicates removed; each rule lives on exactly one page.** MECE check confirmed: no bold rule lead-in appears on more than one page. The parent owns the principles; the children own the surface specifics.

**Citations remain inline with their rules.** Every markdown link was preserved when content moved between pages. No citation was stripped.

**Demos reassigned to match the restructure.** DemoEmptyState, DemoAiLabel, DemoConfidence, DemoConfirmation, DemoFeedback, DemoClarify, DemoError are on the parent. DemoConversation (swapped from DemoEmptyState), DemoPromptInput, DemoStreaming, DemoSources, DemoPlan, DemoTask, DemoAttachments, DemoReasoning are on the conversation child. The new prompt-engineering page carries no demos (the rules are authoring guidance, not interactive UI patterns).

**Navigation updated to an AI subgroup.** `components/sidebar.tsx` now nests all three pages under a collapsible "AI" subgroup inside Guidelines, matching the existing "Content" subgroup pattern. `content/map.json` has "prompt-engineering" added after "conversation-design".

## Phase 9 update (2026-07-15)

**AI pages moved from Guidelines to a top-level AI section.**
The three AI pages were previously nested under Guidelines as a collapsible subgroup.
They now live under their own top-level section, accessible at `/ai`.

**Files moved and renamed:**

| Old path | New path | Title change |
|---|---|---|
| `content/guidelines/ai-design.mdx` | `content/ai/ai-interactions.mdx` | "AI design" → "AI interactions" |
| `content/guidelines/conversation-design.mdx` | `content/ai/conversation-ux.mdx` | "Conversation design" → "Conversation UX" |
| `content/guidelines/prompt-engineering.mdx` | `content/ai/prompt-engineering.mdx` | unchanged |

**New file added:** `content/ai/components.mdx` — a full AI Elements component reference.
Five tables (Chatbot, Voice, Workflow, Utilities, Code) map each component to the TFX routing table and TFX surfaces.
Status: proposed.

**`content/map.json`:** removed `ai-design`, `conversation-design`, and `prompt-engineering` from `guidelines.slugs`; added a new `"ai"` section with slugs `ai-interactions`, `conversation-ux`, `prompt-engineering`, `components`.

**`components/sidebar.tsx`:** removed the AI NavSubGroup from under Guidelines; added a new top-level NavGroup labelled "AI" after Guidelines with four leaf items matching the new section.

**New app routes created:** `app/ai/page.tsx` and `app/ai/[slug]/page.tsx` mirror the guidelines route pair, parameterised on `"ai"`.

**Cross-links updated:** all internal links from `/guidelines/ai-design`, `/guidelines/conversation-design`, and `/guidelines/prompt-engineering` replaced with the new `/ai/` paths inside the moved MDX files.

**Harness pointers updated:** `harness/.claude/skills/ai/SKILL.md` Pointers section updated to the four new `content/ai/` paths; `harness/.claude/skills/ai/recipes.md` has a new "Component reference" section pointing to `content/ai/components.mdx`.

## Phase 10 update (2026-07-16)

**Phase 9 reverted: AI is back UNDER Guidelines, and the content was re-segmented and rewritten.**
The top-level `/ai` section was promoted in Phase 9; the design lead asked for it to return under Guidelines (as a subgroup, like Content), and for a blind-pass MECE re-segmentation grounded in the reference links (Google PAIR primary).

**New MECE segmentation - 4 pages, big-picture first.** The old 4 pages (ai-interactions, conversation-ux, prompt-engineering, components) had overlap (principles + routing + rules all on ai-interactions). The new set:

| Slug | Title | Owns |
|---|---|---|
| `ai-principles` | Principles | Overarching commitments (the "why"). No routing table, no component tables. |
| `ai-patterns` | Patterns | The routing table + per-feature-type detail (inline suggestion, draft, summarisation, Q&A, agent, classification, transcription) + most demos. |
| `ai-conversation` | Conversation design | When conversation is warranted + designing good conversations + prompt-engineering (old conversation-ux + prompt-engineering merged). |
| `ai-components` | AI components | The AI Elements catalogue reference + flagship demo. |

Conversation stops being a silo: it is one surface in Patterns, with its deep-dive on the Conversation design page.

**Files:** `content/ai/*.mdx` and `app/ai/` (page.tsx, [slug]/page.tsx) deleted; new `content/guidelines/ai-{principles,patterns,conversation,components}.mdx` created. `content/map.json` moved the ai slugs into `guidelines.slugs` and removed the `"ai"` section. `components/sidebar.tsx` removed the top-level AI group and added an "AI" NavSubGroup under Guidelines (mirrors "Content"). Harness pointers in `harness/.claude/skills/ai/SKILL.md` and `recipes.md` repointed to the new `content/guidelines/ai-*` paths. Old `/ai/*` routes now 404; no dead `/ai/` internal links remain.

**Written by 4 parallel agents** off a shared brief (one page each), then stitched and cross-linked. Voice/mechanics held: content-lint clean (CNT-3/5/6, SLP-9), no em dashes, second person, each sentence on its own line.

**Evaluator verdict: pass-with-findings, then fixed.** The `tfx-design-evaluator` confirmed the MECE structure (each page owns its job, no gaps), designer usefulness, voice, and cross-links, and flagged one blocking defect: `ai-patterns.mdx` linked six proposed-control ids (AID-1/AID-2/CNV-1/CNV-2) that do not exist in `catalog.yaml`, so `/standards/catalog/<id>` 404'd; plus four imprecise PAIR chapter URLs. Both fixed - the proposed-control links were demoted to plain "(proposed)" text (they await ratchet approval), and the PAIR URLs corrected to their specific `/chapter/<name>/` anchors. Re-checked clean.

**Accompanying non-content fixes in the same session (separate concern):** dev-nav lag was fixed by lazy-loading the AI demos in `components/doc-page.tsx` (`next/dynamic` per file) so demo-free pages stop bundling the streamdown/shiki/mermaid graph. Several demo alignment nits were also fixed: `sources.tsx` block `<p>` to `<span>` + `text-primary` to `text-muted-foreground`; confidence/error demo spacing to the shadcn scale; the reasoning demo now renders content at rest; and a new `demo-chain-of-thought.tsx` was added. These are UI/perf, not content, but landed together.

## Phase 11 update (2026-07-16)

The design lead previewed Phase 10 and pushed back hard: the copy was too long, too dense, jargon in the titles (control IDs), no shared mental model, and the pages did not tell you which one to open for a situation. Plus the site still felt laggy, the reasoning component (and others) looked misaligned, and demos showed no motion. Full second pass:

**Lag (top priority) - genuinely fixed.** The earlier `next/dynamic` split was not enough; MDX was still recompiled at request time on every navigation, and dev ran on webpack. Fixes: dev now runs on **Turbopack** (`next dev --turbopack`), `compileMDX` is wrapped in a module-level memo keyed by the MDX source (`components/doc-page.tsx`), and `getDoc` is wrapped in React `cache()`. Warm navigation dropped from "a few seconds" to ~0.11-0.23s. A module-level `MockChatTransport` singleton was moved into `DemoChatbot` to stop Fast Refresh full reloads.

**Component alignment - systematic pass.** The block-element-in-a-flex-row bug was across many AI Elements components, not just reasoning. Fixed `reasoning.tsx` and `task.tsx` trigger labels (`<p>` -> `<span>`); scoped the bare global `h1,h2,h3,h4` display-font rule in `app/globals.css` to `h1,h2` global + `.prose h3,.prose h4` (with `font-display` restored on the two bare overview-page `h3`s), so AI Elements component headings render in the body font like the real components.

**Demo motion - now visible.** `use-replay.ts` was observing `document.body` (always visible), firing every animation on page load while off-screen. It now returns a ref that `DemoFrame` attaches to its `<figure>` (`rootRef`), so each demo animates once as it scrolls into view. Reduced-motion guard kept.

**Caption clutter removed.** Stripped meta chips (`- inspired by Carbon AI label`, `- not an AI Elements component`, `(TFX pattern)`, `(CNT-1 anatomy)`, `(stop state)`) from the demo `caption` arrays; only real component names show.

**Content - rewritten to 4 short, layman, sentence-case tabs** around one mental model: **fit it to the task -> make it honest -> keep the teacher in control.**

| Slug | Tab | Owns |
|---|---|---|
| `ai` | Overview | The landing: the mental model + a "what are you building?" router + a "how these pages fit together" map. |
| `ai-patterns` | AI patterns | The design/behaviour layer: one section per situation (inline suggestion, generated draft, summary, answering questions, agent actions, conversation), each with rules + a demo. Chat UX lives here. |
| `ai-components` | Using components | The parts layer: the AI Elements toolbox, each mapped to a pattern. |
| `ai-prompts` | Writing prompts | System-prompt authoring only. |

The patterns-vs-components line ("AI patterns is the behaviour; Using components is the pieces") is stated in the copy, not just the plan. Old `ai-principles.mdx` + `ai-conversation.mdx` deleted; `ai-patterns` + `ai-components` fully rewritten; `ai.mdx` + `ai-prompts.mdx` new. `map.json` + `sidebar.tsx` + the `ai` skill pointers updated. Word counts cut to ~315 / 617 / 440 / 633 (from ~950-1850). Written by 3 parallel agents (Overview authored directly for the spine) off a shared brief carrying the voice bar from OPINIONS.md / VOICE.md.

**Evaluator verdict: PASS (no blocking or advisory findings).** `tfx-design-evaluator`: content-lint clean; mental model threads through; MECE with the patterns/components line explicit; every Overview router anchor resolves to a real `##` heading; openers + reciprocal cross-links present; no em dashes, no control IDs in headings, sentence case, British spelling; no dead links. One non-defect observation: a couple of `ai-prompts.mdx` Do/Don't cells run long. Live routing verified in-browser (all `/guidelines/ai*` 200, old `/guidelines/ai-principles` 404); reasoning demo confirmed aligned and animating on scroll; captions confirmed clean.

## Phase 12 update (2026-07-16)

The design lead previewed Phase 11 and pushed back: the AI Elements components still looked off (spacing / alignment / typography) even though the originals are fine; only some demos animated; the hand-rolled ones (especially the error state) "looked horrible because they don't use existing components"; and headings like "The one idea" / "All the pieces together" were too abstract. She wants every demo to emulate a real, polished AI product, to copy the AI Elements example pages, and to lean on the `ai-elements` skill rather than reinvent.

**Root cause found (the crux):** TFX's `.prose` rules in `app/globals.css` are hand-written **descendant selectors** (`.prose p`, `.prose h3`, `.prose code`, `.prose a`...), and **`.not-prose` was never defined** (TFX does not use the Tailwind typography plugin). Every AI Elements component and `DemoFrame` guards itself with `not-prose`, but the class matched nothing, so it did nothing. Since every demo renders inside `<article className="prose">`, the prose margins, `line-height: 1.6`, `--prose-body` colour, code backgrounds, and blue underlined links **bled into the components**. That is why they looked off in TFX but fine on the AI Elements site. **Fix:** every `.prose <el>` rule is now scoped `:not(.not-prose *)`, plus `.not-prose { line-height: 1.5 }` and `body { line-height: 1.5 }`. `not-prose` now truly isolates, so all 20 demos render at their true shadcn/AI-Elements default - one change, no padding touched, brand fonts kept.

**Every demo rebuilt live (maximal), via 4 parallel Sonnet agents** off a shared craft brief drawn from the AI Elements example pages (chatbot / v0 / workflow / ide): streaming ~40-80ms/word, stop from the first token, reasoning auto-open/close, clickable suggestions that stream a reply, typeable prompt inputs, approve/deny that changes state, task/plan/checkpoint steps that advance, expandable sources, attach/remove, thumbs -> acknowledgement, and entrance-on-scroll via the `use-replay` ref -> `DemoFrame rootRef` - all mock, no network, reduced-motion respected.

**Hand-rolled demos rebuilt on shadcn primitives:** `demo-error` -> shadcn `Alert` + `Button` + `Spinner` with a working retry (the "error state looks horrible" fix - it now reads as a native product alert); `demo-confidence` -> `Badge` + token dot, click-to-cycle; `demo-ai-label` -> `Badge` + `Popover` explainability. No hand-rolled markup remains where a real component exists.

**Headings** made descriptive and layman: "The one idea" -> "Three rules that always apply"; "Components" -> "What each component does"; "All the pieces together" -> "A full chatbot, built from these pieces". **The `ai-elements` skill is surfaced** on Using components (a coding agent installs and composes via it; the TFX pages add the pattern mapping and TFX adaptation on top - not reinvented).

**Verify:** `tsc --noEmit` clean across all rebuilt demos; content-lint clean; dev on Turbopack. In-browser: the error demo confirmed rendering through real `Alert`/`AlertTitle`/`AlertDescription`/`Button`; reasoning and other demos confirmed animating on scroll; typography/spacing clean after the `not-prose` fix. A stray `ai-examples-study.md` left by an explore subagent was removed. (A full `tfx-design-evaluator` pass on the interactive demos was not run read-only; the verification rests on tsc + live in-browser checks + the real-component captions.)
