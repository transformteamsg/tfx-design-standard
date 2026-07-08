# Proposed control: cross-user HTML sanitisation (category and id open — SLP-N vs CMP-N)

**Date:** 2026-07-08 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Approved by:** — pending.

> **Note on the placeholder id:** this record deliberately does not fix a prefix yet —
> see "Category — the gate question" below. Whichever prefix is chosen, `checks/validate.py`'s
> cross-ref sweep flags any `PREFIX-<digit>` id not in the live catalog, so the body below
> uses `CMP-N` (the recommended prefix) as its working placeholder. Confirm and assign at
> the gate.

This record lives in `docs/catalog-changes/` per the plan-053 placement rule. Plan:
`harness/plans/066-ratchet-round-cnt4-slp12-cmp8.md`. Source: GitHub issue
[#26](https://github.com/transformteamsg/tfx-design-standard/issues/26), OPEN, "Proposed
anti-pattern: sanitise user-authored HTML rendered to another user."

## Why this is a control candidate

No control covers untrusted-HTML rendering across a trust boundary — one user's
authored content rendered to a different user. This is a ship-blocking security gap,
not a style preference, and the catalog is currently silent on it.

## Triggering evidence — issue #26, quoted verbatim

> "## Gap
> No current control covers **HTML-injection safety of content authored by one user and
> rendered to another**. The CMP and A11Y families cover component composition and
> accessibility; nothing covers untrusted-HTML rendering across a trust boundary.
>
> ## Evidence (where it surfaced)
> Teacher Workspace HDP report builder + parent guest view. Teacher-authored rich-text
> comments are rendered to **parents** via `dangerouslySetInnerHTML`
> (`src/components/reports/report-preview.tsx`), labelled in-code "schema-constrained
> Tiptap output (prototype)." Also noted for `announcements.new`. Surfaced across two
> evaluator passes (report-builder.md, reports-cycle-hub.md) as an UNCOVERED finding
> both times."

— issue #26 body, retrieved 2026-07-08 via `gh issue view 26`.

## Category — the gate question

Issue #26 calls this an "anti-pattern entry" and files it as a proposed SLP addition.
But SLP's charter is the default-AI-aesthetic ("slop") — purple gradients, nested cards,
buzzword copy — not security. This rule is a component/render-boundary pattern
(sanitise at the point where untrusted content crosses a trust boundary), which reads
as a **CMP** fit, or arguably a **CNT** fit (content safety). Present both options
honestly:

- **(a) SLP-N** — matches the issue's own filing as an "anti-pattern," and SLP already
  hosts several structural/pattern rules (SLP-10 modal-vs-page, SLP-11 card misuse).
  Risk: dilutes SLP's aesthetic-coherence charter with a security rule that has nothing
  to do with the generic-AI look.
- **(b) CMP-N — recommended.** This is a component/render-boundary pattern rule (where
  and how a component renders content across a trust boundary), the same register as
  CMP-1 (component sourcing) and CMP-2 (destructive-action safety). Keeps SLP
  aesthetically coherent; keeps security-safety rules in the same family as CMP-2's
  trust-and-safety precedent.

**Recommendation: CMP-N.** The gate decides.

## The proposed control (assuming CMP-N)

- **id:** `CMP-N` (expected 9 at the gate, after this round's other CMP proposal —
  confirm the live catalog's next free CMP slot at commit time).
- **title:** "Content authored by one user and rendered to another is sanitised at the
  render boundary; author-time schema constraints are not sufficient".
- **tier:** L1 (proposed, per issue #26's own suggestion — "blocks ship for cross-user
  surfaces; waivable for isolated prototypes with a recorded note").
- **check:** hybrid — deterministic sub-check (grep `dangerouslySetInnerHTML` / `v-html`
  on surfaces rendering another user's authored content + confirm a sanitiser sits in
  the render path) + judgment sub-check (evaluator reads the render boundary and
  confirms the guarantee holds there, not only at author time).
- **phase:** `[implement, verify]`.
- **applies_to:** `[component, flow]`.
- **waiver:** `documented` (follows L1).
- **verify:** "Deterministic: grep detector (planned — not built this round) finds
  `dangerouslySetInnerHTML`/`v-html` on any surface rendering another user's authored
  content, and checks whether a sanitiser call sits in the render path. Judgment:
  evaluator reads the render boundary and confirms sanitisation holds there, not only at
  author/editor time; a mock-data prototype deferral is acceptable only if explicitly
  flagged in the decision record."
- **fails_when:**
  - `dangerouslySetInnerHTML`/`v-html` renders another user's authored content with no
    sanitiser in the render path;
  - sanitisation is claimed at editor time only ("schema-constrained output") with
    nothing enforced at render;
  - a prototype defers sanitisation with no recorded flag noting the deferral.

## Non-duplication statement

- **vs. A11Y family**: accessibility of markup structure, not content-safety of markup
  origin. No overlap.
- **vs. CMP-1** (component sourcing): CMP-1 governs whether a stack component is used;
  this control governs what happens to *content rendered inside* a component at a
  trust boundary. Complementary, not duplicate.
- **vs. CMP-2** (destructive actions): different failure class — CMP-2 is about
  consequence/undo for actions, not render-time content safety. Same trust-and-safety
  register, no rule overlap.
- **vs. CNT family**: CNT governs copy quality (naming, voice, error anatomy, domain
  fidelity per this same round's CNT proposal); none of it governs HTML
  injection safety. No overlap.

## Open questions (for the gate)

1. **Category: SLP-N vs CMP-N** — the core call above. Recommendation: CMP-N.
2. **Numbering**: if both this round's draft-safety CMP proposal and this control
   land in the same round, which takes the earlier number? No dependency either
   way — order by whichever the gate approves first.
3. **Tier and check type:** L1, hybrid — confirm as proposed.
4. **`fails_when` bullets:** the three drafted above — confirm as proposed or amend.
5. **Detector**: the grep detector is explicitly out of scope for this plan (a
   follow-up check-script plan) — confirm the control still lands now, evaluator/manual-
   verified in the interim, like CMP-7 did before its deterministic half existed.

## Notes carried into the detail file (`controls/<id>.md`, if ratified)

- Concrete anti-patterns (rule 3): teacher-authored rich text rendered to a parent
  guest view via `dangerouslySetInnerHTML` with no sanitiser call in the render path;
  an announcement composer whose output renders unsanitised to recipients; any
  "schema-constrained editor" claim used as a substitute for render-time sanitisation.
- **Do not flag:** content authored and rendered back to the *same* user (no trust
  boundary crossed); a mock-data prototype whose deferral is explicitly flagged in the
  decision record; sanitisation implemented as a render-time allowlist (e.g. DOMPurify)
  regardless of which library performs it.

---

**Status:** propose-only, Step 1 of plan 066. Not committed to `standards/catalog.yaml`.
Awaiting design-lead approve/amend/reject (including the category call), recorded by
name and date in this file before any catalog change happens.
