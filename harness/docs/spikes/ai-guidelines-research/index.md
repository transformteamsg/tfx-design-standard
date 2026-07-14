# AI guidelines research - synthesis index

Spike: 2026-07-15.
Sources: Google PAIR Guidebook, Microsoft HAX Toolkit (18 guidelines), IBM Carbon for AI, Vercel AI Elements component inventory, baseline deep-research brief.
Context: TFX design standard, products Teacher Workspace / CaseSync / Glow, brand essence Kind Utility.

---

## 1. Routing table

Use this table to choose the right surface and controls before opening a design file.
The routing rule at the bottom of this section is the most important output of this spike.

| AI feature type | Surface that fits | AI Elements components | Judgment call that matters most | Source provenance |
|---|---|---|---|---|
| Inline suggestion (autocomplete, chips, next action) | Embedded in the existing workflow; no separate panel | `Suggestion`, `PromptInput` status toggle | Does the suggestion interrupt flow or fit inside it? (G3 timing) | HAX G3, G7, G8; PAIR augment frame |
| Generated draft (write / rewrite a field or section) | Inline in the form or document; modal only if full-page replacement | `Message`, `MessageResponse`, `Shimmer` | Teacher must stay the author - editable, revertable, clearly marked (G9, revert pattern) | HAX G9, G15; Carbon revert-to-AI; PAIR feedback+control |
| Summarisation (distil a document or thread) | Inline below or beside the source content | `Message`, `Sources`, `InlineCitation` | Attribution fidelity - teachers need to trace claims back to evidence | HAX G11, G15; Carbon AI label; PAIR explainability |
| Q&A over content (RAG, ask-about-this-document) | Embedded panel or drawer beside the source; not a new tab | `Message`, `Sources`, `InlineCitation`, `Attachments` | Scope when uncertain - ask rather than guess (G10); surface sources every time | HAX G10, G11; PAIR context errors; Carbon explainability popover |
| Agent that takes actions (files, sends, creates records) | Inline workflow with explicit confirmation gate; never silent | `Confirmation`, `Task`, `Plan`, `Checkpoint` | Consequential actions require explicit approve/deny; undo must be available after | HAX G8, G9, G10; PAIR Pattern 18; TFX CMP-2 |
| Full conversation (open-ended chat) | A conversation surface is the last resort, not the first idea - see routing rule below | `Conversation`, `Message`, `PromptInput`, `Reasoning` | When does the teacher not already know what they want? Only then is chat warranted | PAIR automate-vs-augment; HAX G1, G3 |

### Routing rule: conversation is usually the wrong surface

Use an embedded, task-specific AI control when the job the teacher is doing is known.
Use a chat surface only when the task is genuinely open-ended and cannot be scoped in advance.

Rationale: PAIR's automate-vs-augment framework says to choose the lowest automation level that serves the task.
Chat requires the teacher to articulate a prompt, manage a turn-by-turn exchange, and mentally integrate a free-form response back into their workflow.
Inline suggestion, generated draft, and summarisation each remove those steps entirely.
HAX G3 (time services) and G4 (show contextually relevant information) reinforce this: AI that appears inside the task is better timed and more relevant than AI that lives one step removed from it.
If a teacher already knows what they want - mark this student's reading level, summarise this case note, suggest next steps for this goal - an embedded control is faster and less error-prone than chat.
Reserve conversation for exploration, cross-document synthesis, or novel requests that no structured surface could anticipate.

---

## 2. Always-apply rules

Every AI feature in Teacher Workspace, CaseSync, and Glow must follow all six rules below.
These are distilled from the highest-agreement points across the research sources.
Fewer, stronger rules beat a long checklist.

**R1 - Set expectations before the first interaction.**
Introduce any AI feature with a one-sentence description of what it does and at least one honest limitation ("it works best when..." or "it cannot...").
This prevents the overinflation of expectations that causes frustration and abandonment.
(HAX G1, G2; PAIR Mental Models layered onboarding template: "This is [product], it'll help you by [benefit]. Right now, it's not able to [limit].")

**R2 - Mark AI-generated content at point of use.**
Every surface that shows AI-generated content must carry a visible indicator at the content itself, not only in a header or tooltip.
The indicator must never be disabled, even when its parent element is in a read-only or disabled state.
(Carbon AI label principle; HAX G11; baseline research consensus across Google, Microsoft, IBM, Anthropic.)
TFX note: Carbon's blue gradient is Carbon's own visual language - TFX uses its own token-based treatment (no gradients, per SLP-1).

**R3 - The teacher stays the author.**
Every AI-generated draft, fill, or suggestion must be editable and revertable.
When a teacher edits AI content, the AI marking is removed.
When they revert, it returns.
This signals the boundary between AI-generated and teacher-generated content, and keeps authorship unambiguous.
(Carbon revert-to-AI pattern; HAX G9, G15; PAIR feedback+control: "Even in cases where users may not frequently exercise the option to take back control, it can be helpful to let them know that they have that option.")

**R4 - Scope when uncertain; ask before acting on a wrong assumption.**
When an AI feature is not confident about the user's intent or the right action, it narrows its scope or asks for clarification rather than proceeding on a guess.
This applies especially to agents and Q&A features.
(HAX G10: "If the assistant is unsure whom to call, requesting clarification can be less costly than calling the wrong person"; PAIR context errors chapter.)

**R5 - Consequential actions require explicit approval; everything else gets undo.**
Any AI-triggered action that modifies, sends, or deletes records must show consequences in plain language and wait for an explicit approve/deny before executing.
For lower-stakes outputs, undo is sufficient.
(HAX G8, G9; PAIR Pattern 18: "Give control back to the user when automation fails"; existing TFX CMP-2: "destructive actions show consequences and offer undo/confirm.")

**R6 - Make failure safe and unremarkable.**
AI errors must not use ML or model terminology in user-facing copy.
Error messages say what did not work and what the teacher can do next.
The failure experience should not be worse than the non-AI fallback.
(PAIR Errors chapter: "Make failure safe and boring"; HAX G12 context memory after error; TFX interaction guideline: "Lead with the teacher's next action in... errors.")

---

## 3. Candidate controls

**Superseded.** The formal proposals live in `docs/decisions/ai-design-guidelines.md`, with different IDs and scopes: CNV-1 stoppable streaming, CNV-2 confirmation for consequential AI actions, AID-1 marking + revert, AID-2 error anatomy.
The decision record is the single source for control IDs; this section is kept as the research trail.

Four candidate controls for the TFX catalog, one per category.
Each is verifiable by a reviewer or a static scan.

**CNV-1 (tier L1) - Conversation surface justified**
Check: every chat or open-ended AI conversation surface in the product has a documented rationale showing that no task-specific embedded control could serve the same need.
Fails when: a chat surface is used for a task with a known, repeatable structure (mark, summarise, suggest next step, fill a field).
Fails when: the routing table above maps the task type to an embedded surface and no waiver exists.
(PAIR automate-vs-augment; HAX G3, G4.)

**AID-1 (tier L1) - AI content marked at point of use**
Check: every screen that renders AI-generated content carries a visible indicator co-located with that content, not only in a header or tooltip.
Fails when: AI content appears without a co-located mark.
Fails when: the indicator is hidden, disabled, or removed before the teacher has edited the content.
(Carbon AI label; R2 above; HAX G11.)

**AID-2 (tier L2) - Revert affordance present on editable AI output**
Check: every editable AI-generated field or section has a revert control that restores the AI version and its marking.
Fails when: a teacher can overwrite AI content with no path back.
Fails when: the AI mark disappears before a correction affordance exists.
(Carbon revert-to-AI; R3 above; HAX G9.)

**AID-3 (tier L1) - Consequential agent actions gated**
Check: any agent action that modifies, sends, files, or deletes data shows a plain-language summary of the consequence and requires explicit teacher approval before executing.
Fails when: a destructive or data-changing tool call is made without a confirmation step.
Fails when: the confirmation copy uses technical or ML terminology.
(AI Elements `Confirmation` component; R5 above; HAX G8, G9; TFX CMP-2.)

---

## 4. Kept / merged / cut log

| Source item | Fate | Notes |
|---|---|---|
| HAX G1 - Make clear what the system can do | kept as R1 | Merged with G2 into single "set expectations" rule |
| HAX G2 - Make clear how well the system can do it | merged into R1 | G1 + G2 together = set expectations |
| HAX G3 - Time services based on context | routed to table | Informs inline-vs-chat routing rule; too context-specific to be a standalone rule |
| HAX G4 - Show contextually relevant information | routed to table | Same; underpins routing rule; judgment call per feature |
| HAX G5 - Match relevant social norms | cut | Correct in general; not specific enough to TFX to differentiate; already implicit in TFX voice and tone |
| HAX G6 - Mitigate social biases | cut | Critical for implementation; belongs in data/model guidelines, not UI design controls |
| HAX G7 - Support efficient invocation | routed to table | Inline suggestion and embedded controls directly serve this; no separate rule needed |
| HAX G8 - Support efficient dismissal | merged into R5 | Dismissal is the non-consequential side of the approve/undo rule |
| HAX G9 - Support efficient correction | kept as R3 + AID-2 | Core to "teacher stays the author" |
| HAX G10 - Scope when in doubt | kept as R4 | Directly applicable to RAG and agent features |
| HAX G11 - Make clear why the system did what it did | merged into R2 + AID-1 | Explainability = mark + explain; the label is the first layer |
| HAX G12 - Remember recent interactions | cut | Implementation/engineering concern, not a design control |
| HAX G13 - Learn from user behavior | cut | Product strategy decision; not a UI design control |
| HAX G14 - Update and adapt cautiously | cut | Platform/model concern; not actionable at the feature level |
| HAX G15 - Encourage granular feedback | merged into R3 | Correction = feedback; editable output is the TFX mechanism |
| HAX G16 - Convey consequences of user actions | merged into R5 | Consequences visible before approval = the confirmation pattern |
| HAX G17 - Provide global controls | cut | Valid; deferred to a future settings/preferences spike |
| HAX G18 - Notify users about changes | cut | Platform-level; not a per-feature design control |
| PAIR: automate-vs-augment | kept as routing rule | The single most load-bearing idea from the entire spike |
| PAIR: layered onboarding template | merged into R1 | Template language informs the rule; not a separate control |
| PAIR: co-learning plan | cut | Implementation concern; not a design control |
| PAIR: implicit vs explicit feedback | cut | Worth revisiting for feedback UI; not actionable now |
| PAIR: feedback acknowledgement | cut | Good microcopy guidance; subsumed by R3 (teacher stays author) |
| PAIR: make failure safe and boring | kept as R6 | Exact framing preserved |
| PAIR: context errors (wrong intent assumption) | merged into R4 | Context errors are the main risk in Q&A and agent features |
| PAIR: progressive disclosure of explanation | routed to table | Informs summarisation and Q&A rows; too specific to be a global rule |
| PAIR: go beyond in-the-moment explanations | cut | Help docs / marketing concern; not a UI control |
| Carbon: AI label component | merged into R2 + AID-1 | The principle transfers; Carbon's gradient treatment does not |
| Carbon: revert-to-AI pattern | kept as R3 + AID-2 | Direct fit; adapted to TFX token system |
| Carbon: explainability popover | routed to table | Relevant to Q&A and summarisation; implementation detail |
| Carbon: placement rules (component vs section vs page) | routed to table | Judgment call per feature type; not a checkable rule at this stage |
| Carbon: AI presence styling (gradient/glow) | cut | Carbon-specific visual language; TFX bans gradients (SLP-1); TFX uses its own treatment |
| Carbon: AI label always active | merged into R2 | "Never disabled" is the checkable version of this |
| AI Elements: full component inventory | routed to table | Components listed per feature type; no guidelines content per se |
| AI Elements: Confirmation component | merged into R5 + AID-3 | Confirmation pattern directly implements the consequential-actions rule |
| AI Elements: Checkpoint component | cut for now | Conversation revert; useful if chat surfaces are approved; deferred |
| AI Elements: Reasoning / Chain of Thought | cut for now | Relevant when model reasoning is exposed; no current TFX use case confirmed |
| Baseline deep research: consensus on labelling | merged into R2 | Confirms the labelling rule is the broadest point of cross-industry agreement |
| Baseline deep research: anthropomorphism risks | cut | Relevant to conversation surfaces; revisit if CNV-1 is waived for a feature |

---

## 5. Per-product calibration notes

**Teacher Workspace** is the calm, neutral home base.
Rules R1-R6 apply at standard weight.
Inline suggestion and generated draft are the most likely first AI features.
Tone in AI error messages should be workmanlike - no apology language, no cheerfulness, just the next step.

**CaseSync** carries higher gravity because records feed assessments and may affect student placement.
R3 (teacher stays the author) and R5 (consequential actions gated) are especially important here - a teacher submitting an AI-generated case note without reviewing it is a foreseeable failure mode.
Summaries should surface sources every time (R2 + AID-1 at higher visibility).
The confirmation gate (CNV-2 in the decision record) should show more consequence detail than the minimum: "This will update the student's reading level record" is better than "Confirm."
Privacy-forward framing: avoid any copy that implies the model has "learned" from a student's data.

**Glow** is lighter and more experimental.
The routing rule still applies, but the tone of R6 (failure) can be warmer here - Glow's users are likely more comfortable with AI experimentation.
Inline suggestion fits the goal-setting and reflection surfaces.
Lower-stakes outputs may use a lighter marking treatment than CaseSync, but the mark must still be present (AID-1 is L1, no waiver path without human approver).

---

*End of spike index.*
*Next steps: proposals filed in docs/decisions/ai-design-guidelines.md as CNV-1, CNV-2, AID-1, AID-2 (see supersession note in section 3); assign token treatment for AI marking to the next design token sprint.*
