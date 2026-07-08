# Proposed control: CMP-9 (cross-user HTML sanitisation — recommended CMP option adopted)

**Date:** 2026-07-08 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Approved by:** Reza Ilmi (design lead), 2026-07-08 — in-session
directive ("execute all and then ship"); recommended options adopted. Committed to the
catalog as a **CMP control** (option (b) below — not SLP), at **CMP-9**, **L1**,
**hybrid**, `phase: [implement, verify]`, `applies_to: [component, flow]`,
`waiver: documented`, with the `fails_when` bullets drafted below carried verbatim into
the catalog entry and `controls/cmp-9.md`, exactly as proposed — no amendments at the
gate. The category call (option (a) SLP-N vs option (b) CMP-N) is resolved in favour of
(b), as recommended: CMP keeps SLP aesthetically coherent as the default-AI-aesthetic
family, and this rule sits in the same trust-and-safety register as CMP-1/CMP-2.

> **Note on the `CMP-N` placeholder used below:** while this proposal was open,
> `checks/validate.py`'s cross-ref sweep would have flagged a literal `CMP-9` reference
> in this file as an unknown control id (the catalog didn't carry the entry yet), so
> the body below still reads `CMP-N` in the specification sections — a drafting
> artifact of the propose-then-approve sequence, not a live open question, per the
> CMP-4 record's precedent for this same convention.

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

## Open questions for the gate — resolved

1. **Category: SLP-N vs CMP-N** — resolved **CMP-N** (option (b)), as recommended.
2. **Numbering**: this control is **CMP-9**; the draft-safety proposal in the same
   round is **CMP-8** — assigned in that order at the gate.
3. **Tier and check type:** confirmed L1, hybrid, as proposed.
4. **`fails_when` bullets:** the three drafted above carried into the catalog entry and
   detail file verbatim, unamended.
5. **Detector**: confirmed out of scope for this plan — the control lands now,
   evaluator/manual-verified in the interim, per the CMP-7 precedent. The grep detector
   is queued as a follow-up check-script plan (per plan 066's maintenance notes, behind
   plan 067's `enforced:` field).

## Notes carried into the detail file (`controls/<id>.md`, if ratified)

- Concrete anti-patterns (rule 3): teacher-authored rich text rendered to a parent
  guest view via `dangerouslySetInnerHTML` with no sanitiser call in the render path;
  an announcement composer whose output renders unsanitised to recipients; any
  "schema-constrained editor" claim used as a substitute for render-time sanitisation.
- **Do not flag:** content authored and rendered back to the *same* user (no trust
  boundary crossed); a mock-data prototype whose deferral is explicitly flagged in the
  decision record; sanitisation implemented as a render-time allowlist (e.g. DOMPurify)
  regardless of which library performs it.

## Re-audit set

Run 2026-07-08, after the catalog commit, via `python3 checks/reaudit-scope.py CMP-9`:

```
Re-audit scope for CMP-9 (category: Components & patterns)

Directly in scope (0) — these records list CMP-9; re-check each against the changed clause:
  (none)

Same-category candidates (5) — these records touch the Components & patterns domain but do NOT list CMP-9; they are candidates to confirm, not proven-affected. Confirm each actually uses the affected pattern:
  - docs/decisions/attendance.md
  - docs/decisions/broadcast-message.md
  - docs/decisions/grade-entry.md
  - docs/decisions/student-notes-empty-state.md
  - docs/decisions/submit-marks-review.md

5 record(s) to re-audit (0 direct, 5 candidate).
```

None of the five declared CMP-9 in scope — expected, since the control didn't exist
when they shipped. All five are candidates for a design-lead-directed re-audit pass:
confirm whether each surface renders one user's authored content to a different user,
and if so, whether sanitisation is enforced at the render boundary.

---

**Status:** APPROVED AS PROPOSED (as a CMP control, CMP-9) and committed to
`standards/catalog.yaml` (Step 3 of plan 066). Catalog 54 → 57 controls (with CNT-4 and
CMP-8). Re-audit set run and appended above (Step 3.5).
