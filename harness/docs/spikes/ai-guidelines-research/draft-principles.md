# Draft principles — pending Tasha's placement

**Status: draft. Do not add to the principles pages without Tasha's review.**
These are candidate additions to `/principles`, written in the format used by product-design-principles.mdx and brand-principles.mdx.
Tasha decides placement, numbering, and whether both earn their place.

Neither existing principles page cites external sources — this is a deliberate addition for these two only, since they are new and directly grounded in outside research rather than internal precedent.
Each principle below carries a **Grounded in** line naming the exact guideline, chapter, or pattern it traces to, plus the research file where the full quote lives.
Drop the line (or fold it into a footnote) if it reads as out of place once placed alongside the settled principles.

- Candidate 1 anchors R3 (the teacher stays the author) from the AI guidelines always-apply rules.
- Candidate 2 anchors R1 + R2 (set expectations; mark AI content at point of use).

---

## 08 — The teacher stays the author

AI can draft, suggest, and summarise. The teacher decides what is true, what is sent, and what goes on record. Every AI-generated output must be editable, revertable, and clearly marked until the teacher claims it as their own.

**Grounded in:** Microsoft HAX G9 (support efficient correction) and G15 (encourage granular feedback); IBM Carbon for AI's revert-to-AI pattern (the AI label is replaced by a revert control the moment a person edits AI output); Google PAIR's Feedback + Control chapter ("even in cases where users may not frequently exercise the option to take back control, it can be helpful to let them know that they have that option"). See `harness/docs/spikes/ai-guidelines-research/hax.md`, `carbon-for-ai.md`, `pair.md`.

| Prioritise | Deprioritise |
| --- | --- |
| Editable, revertable AI output with clear authorship marking | AI content that locks, sends, or files without review |
| Removing the AI mark only when the teacher edits the content | Permanent or irremovable AI labels that erode teacher ownership |
| Confirmation gates with plain-language consequences before agent actions | Silent automation that teachers discover after the fact |
| Explicit approve or deny before any consequential action runs | "Smart" defaults that act on the teacher's behalf without asking |

---

## 09 — Show your seams

Teachers trust tools that are honest about what they are. Every AI feature introduces itself accurately: what it does, what it cannot do, and where its output came from. Hidden limitations become the frustration teachers hit when the feature falls short.

**Grounded in:** Microsoft HAX G1 (make clear what the system can do) and G2 (make clear how well it does it) — "over-inflated user expectations have been shown to cause frustration and even product abandonment"; Google PAIR's Mental Models chapter and its layered onboarding template ("this is [product], it'll help you by [benefit]; right now, it's not able to [limit]"); IBM Carbon for AI's AI label and explainability popover (visible marking plus on-demand explanation is "the first layer of explainability"). See `harness/docs/spikes/ai-guidelines-research/hax.md`, `pair.md`, `carbon-for-ai.md`.

| Prioritise | Deprioritise |
| --- | --- |
| A one-sentence description of what the feature does before first use | Launching AI features without any introduction or scope statement |
| At least one honest limitation alongside every AI introduction | Capability claims that the feature cannot reliably deliver |
| Source attribution on every summarisation or Q&A output | AI responses that present synthesised content without traceability |
| Error messages that say what did not work and what to do next | ML or model terminology in user-facing error states |
