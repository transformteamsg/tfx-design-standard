# Proposed control: CMP-N (draft safety / escapability — closes the flow-pass gap)

**Date:** 2026-07-08 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Approved by:** — pending.

> **Note on `CMP-N`:** placeholder, not a concrete number — `checks/validate.py`'s
> cross-ref sweep flags any `PREFIX-<digit>` id not in the live catalog. At proposal
> time the next free CMP slot is **8** (CMP-1..7 exist; CMP-4 filled its reserved slot
> via plan 065). Confirm and assign at the gate.

This record lives in `docs/catalog-changes/` per the plan-053 placement rule. Plan:
`harness/plans/066-ratchet-round-cnt4-slp12-cmp8.md`. Source: a harness-internal audit
finding — not a GitHub issue.

## Why this is a control candidate

The `flow` pass's own description advertises grading "escapability, and draft safety"
(`.claude/skills/flow/SKILL.md:3`), but its dimension-controls list cites only CMP-2,
CMP-3, A11Y-2, A11Y-11, SLP-10 — none of which governs unsaved-work protection or a
non-destructive exit per step. This is a pass claiming to grade a dimension the catalog
does not cover.

## Triggering evidence — quoted verbatim

**`flow/SKILL.md` description** (front matter, line 3):

> "Improve the flow of an existing Teacher & School multi-step task or interaction —
> step traversal, async states, **escapability, and draft safety**."

**`flow/SKILL.md` dimension-controls list** (lines 13-20), the pass's actual grading
surface:

> "- **CMP-2** — destructive actions show consequences and offer undo/confirm (L0).
> - **CMP-3** — every async transaction has loading, success, and error states.
> - **A11Y-2** — keyboard traversal works across the whole journey, not just per screen.
> - **A11Y-11** — each transition announces its change and manages focus.
> - **SLP-10** — a complex multi-section task gets a page, not a modal."

CMP-2 (`catalog.yaml`, ~line 367) covers *destructive-action* consequence + undo/confirm
only. CMP-3 (~line 382) covers async loading/success/error states. Neither covers
draft preservation on interruption or a non-destructive exit at a given step — the gap
the pass's own description names but its control list does not back.

**Corroborating finding, `docs/decisions/student-notes-empty-state.md:174`**
(evaluator ADVISORY, quoted verbatim):

> "**CNT-1 — error copy omits the draft-preservation reassurance.** … The code does
> preserve the draft on failure (line 684 does not clear `noteContent.value`, unlike the
> success path at line 673), so the reassurance would be truthful and is currently
> unstated. Adding it would close the gap between behaviour and copy."

The evaluator observed the code preserves the draft on save-error, but no control was
cited for the preservation itself — it rode entirely on CNT-1 (copy), not a structural
guarantee.

**Corroborating plant, `evals/golden/003-broadcast-message.yaml`**: the golden eval
plants `"draft is (saved|preserved)"` copy expectations, asserting the *copy claim*
while the *structural guarantee* behind it is ungoverned by any control.

## The proposed control

- **id:** `CMP-N` (expected 8 at the gate).
- **title:** "A multi-step or data-entry task offers a non-destructive exit at every
  step, and in-progress work is preserved or explicitly discarded on interruption —
  never silently lost".
- **tier:** L1 (proposed). Open question below: L1 vs L2.
- **check:** hybrid — deterministic sub-check (every step in a mapped flow has a
  reachable cancel/back affordance; planned) + judgment sub-check (evaluator walks the
  flow map, interrupts it, and confirms in-progress work survives or is explicitly,
  confirmably discarded).
- **phase:** `[plan, implement, verify]`.
- **applies_to:** `[flow]`.
- **waiver:** `documented` (follows L1).
- **fails_when:**
  - a wizard/dialog with no cancel/back at some step;
  - navigation away silently drops typed content;
  - an interrupted flow resumes from zero with no warning at exit time;
  - escape/close discards a draft with no confirm (ties to CMP-2's mechanics).

## Deconfliction (mandatory — this is the MED-risk overlap area)

This control sits close to three existing controls. Each keeps a distinct, non-
overlapping clause:

- **CMP-2 (destructive actions, L0)** keeps the *destructive-action* consequence/undo
  clause — deleting a thing, sending something irreversible. This proposal covers *the user's
  in-progress work* (drafts, wizard state) and *the ability to leave a flow at all*. The
  two meet at one seam: an explicit-discard confirmation ("Discard draft?") is **this
  proposal's surface** (it is the thing this control requires exist), but its confirm mechanics —
  naming the object, stating the consequence, sober tone — **follow CMP-2**. Neither
  control is complete alone at that seam; together they are non-overlapping: this proposal says
  "a discard action must exist and be confirmable, not silent"; CMP-2 says "the
  confirmation, once it exists, must be built correctly."
- **A11Y-11 (transition focus/announcement)** keeps focus movement and live-region
  announcement per transition. This proposal does not grade *how* an exit is announced — only
  that an exit and a preservation/discard behaviour *exist* structurally.
- **SLP-10 (page vs. modal)** keeps the structural-container question (does a complex
  multi-section task get a page, not a modal). This proposal does not grade container choice —
  a page-based flow and a modal-based flow are equally in scope for "can the user leave
  without losing work."

No clause in this proposal restates a clause already owned by CMP-2, A11Y-11, or
SLP-10. The gate should read this section and confirm the boundary is a real seam, not
a blur, before approving.

## Non-duplication statement (summary of the above)

- **vs. CMP-2**: destructive-action mechanics vs. draft/exit structure — see
  Deconfliction.
- **vs. CMP-3** (async states): CMP-3 requires loading/success/error states exist per
  async action; it says nothing about what happens to *in-progress input* when an
  interruption (not an async failure) occurs mid-flow. Complementary.
- **vs. A11Y-2** (keyboard traversal): reachability, not draft preservation. No overlap.
- **vs. A11Y-11**: see Deconfliction.
- **vs. SLP-10**: see Deconfliction.

## Open questions (for the gate)

1. **Tier: L1 vs L2.** Recommend **L1** — losing a teacher's typed work is a trust
   breach, the same class as CMP-2's rationale for L0, but recoverable (the flow can be
   redesigned or a draft restored after the fact) rather than catastrophic, hence L1 not
   L0.
2. **`fails_when` bullets:** the four drafted above — confirm as proposed or amend.
3. **Deterministic sub-check**: "every step in a mapped flow has a reachable
   cancel/back affordance" is asserted as planned, not built this round — confirm the
   control still lands now with the judgment half doing the work in the interim, per
   the CMP-4/CMP-7 precedent for controls whose deterministic half ships later.

## Notes carried into the detail file (`controls/cmp-8.md`, if ratified)

- Concrete anti-patterns (rule 3): a multi-step form with no way back from step 2; a
  browser back-navigation that silently clears a partially-filled form with no warning;
  a wizard that, resumed after a session timeout, restarts from step 1 with the
  teacher's earlier input gone and no notice this happened; a close/escape gesture on a
  draft that discards it with no "Discard draft?" confirmation.
- **Do not flag:** a single-step, non-destructive form with an obvious cancel (this
  control targets *multi-step or data-entry* tasks specifically, not every form); an
  explicit, confirmed discard the user chose (this control requires the *option* to preserve or
  explicitly discard — not that discarding is always wrong).

---

**Status:** propose-only, Step 1 of plan 066. Not committed to `standards/catalog.yaml`.
Awaiting design-lead approve/amend/reject, recorded by name and date in this file before
any catalog change happens.
