# Proposed control: CMP-N (Empty-state clarity — fills the reserved slot 4)

**Date:** 2026-07-08 · **Change type:** new control via ratchet (fills the id already
reserved for this proposal — no tier change to any existing control) · **Approved by:**
pending — design-lead approval required before the catalog commit. No approval is
recorded in this file yet.

> **Note on `CMP-N`:** placeholder, not a concrete number — `checks/validate.py`'s
> cross-ref sweep flags any `PREFIX-<digit>` id not in the live catalog. The slot itself
> is not actually contested here: `standards/catalog.yaml:397-398` already carries a
> two-line reservation comment naming this exact proposal by file path and instructing
> that the id not be reused elsewhere (see plan 065's "Current state" section for the
> full text). This record still uses the placeholder convention (per the idn-4 record
> precedent) so `validate.py` passes while this file is propose-only; only whether the
> proposal is approved as specified is open, not which slot it would take.

This record lives in `docs/catalog-changes/` per the plan-053 placement rule. Plan:
`harness/plans/065-ratchet-cmp4-empty-state-evd1-evidence.md`.

## Why this is a control candidate

Empty-state disambiguation — whether an empty state correctly signals "empty" vs "still
loading" vs "error/permissions" — was the central done-criterion of the Student Notes
loop run (contract item 1), yet no catalog control directly grades it; it currently rides
on CMP-3 (async states) and evaluator judgment alone. The catalog has carried a reserved
slot for this exact gap since 2026-06-16.

## Triggering evidence (design-evaluator UNCOVERED, verbatim)

> "No control governs empty-state disambiguation — whether an empty state correctly
> signals 'empty' vs 'still loading' vs 'error/permissions.' This page handles it well
> ('No notes yet' + explanatory subtext, no list chrome that could read as loading), and
> it is the central done-criterion (contract item 1), yet no catalog control directly
> grades it; it currently rides on CMP-3 and judgment. The generator flagged this as a
> candidate but correctly declined to self-propose. As the independent read, I confirm the
> gap: recommend a ratchet proposal for an empty-state-clarity control."

— `docs/decisions/student-notes-empty-state.md:198` (evaluator's UNCOVERED section),
transcribed faithfully into the full proposal at
`docs/decisions/student-notes-empty-state.md:208-225`.

## The proposed control

- **id:** `CMP-N` (the reserved slot — slot 4).
- **title:** "Every empty-state view unambiguously signals 'no content exists' — distinct
  from loading, error, or permissions failure — through a heading, explanatory subtext,
  and the absence of loading chrome such as skeleton rows or spinners".
- **tier:** L1 (proposed) — hybrid check.
- **check:** hybrid — deterministic sub-check (no skeleton/spinner in the DOM when the
  empty-state heading renders) + judgment sub-check (heading/subtext cannot be mistaken
  for loading or a permissions failure).
- **phase:** `[plan, implement, verify]`.
- **applies_to:** `[page, component]`.
- **waiver:** `documented` (follows L1).
- **verify:** "Deterministic: confirm the rendered DOM contains neither a skeleton-row
  element nor a loading spinner when the empty-state heading is visible (manual until a
  script exists). Judgment: evaluator reads the heading + subtext pair and answers 'could
  a first-time user mistake this for a loading state or a permissions error?' — pass = no
  plausible confusion."
- **fails_when:**
  - a skeleton row, shimmer, or loading spinner is visible in the DOM alongside the
    empty-state heading;
  - the heading/subtext pair reads as "still loading" or "you don't have access" rather
    than "nothing here yet";
  - an empty state ships with list chrome (row dividers, placeholder rows) that could be
    mistaken for a populated-but-loading list.
- **detail:** `controls/cmp-4.md`.

## Open questions for the gate

1. **Tier and check type:** confirm L1, hybrid, as proposed (vs. a lower tier or a
   judgment-only check).
2. **`phase` and `applies_to`:** confirm `[plan, implement, verify]` and
   `[page, component]` as proposed.
3. **`fails_when` bullets:** confirm the three drafted above carry into the catalog entry
   and detail file verbatim, or amend.

## Non-duplication statement

- **vs. CMP-3** (async states — loading/success/error must exist and be visible): CMP-3
  requires the states exist and are perceivable; this proposal requires the *empty* state
  specifically be legible as empty, not confusable with CMP-3's loading state. They are
  complementary — a surface can pass CMP-3 (a loading state exists and is visible) while
  still failing this proposal (the empty state, once reached, still carries leftover
  loading chrome).
- **vs. CMP-6** (table pattern — "design the empty and loading states"): CMP-6 names empty
  states as part of the table pattern's checklist without specifying what "designed"
  means; this proposal is the general, surface-agnostic rule CMP-6's bullet defers to.

## Re-audit set

To be run after the catalog commit (Step 5 of plan 065):
`python3 checks/reaudit-scope.py` against the assigned id — output pasted below once the
control is committed.

---

**Status:** propose-only, Step 1 of plan 065. Not committed to `standards/catalog.yaml`.
Awaiting design-lead approve/amend/reject, recorded by name and date in this file before
any catalog change happens.
