# Proposed control: CMP-4 (Empty-state clarity — fills the reserved slot 4)

**Date:** 2026-07-08 · **Change type:** new control via ratchet (fills the id already
reserved for this proposal — no tier change to any existing control) · **Approved by:**
Reza Ilmi (design lead), 2026-07-08 — in-session directive ("execute all and then ship");
recommended options adopted. Committed to the catalog in the reserved slot at **CMP-4**,
**L1**, **hybrid**, `phase: [plan, implement, verify]`, `applies_to: [page, component]`,
`waiver: documented`, with the `fails_when` bullets drafted below carried verbatim into
the catalog entry and `controls/cmp-4.md`, exactly as proposed — no amendments at the
gate.

> **Note on the `CMP-N` placeholder used below:** while this proposal was open,
> `checks/validate.py`'s cross-ref sweep would have flagged a literal `CMP-4` reference in
> this file as an unknown control id (the catalog didn't carry the entry yet), so the body
> below still reads `CMP-N` in the specification sections — a drafting artifact of the
> propose-then-approve sequence, not a live open question. The id was never actually
> contested: `standards/catalog.yaml:397-398` carried a reservation comment naming this
> exact proposal by file path since 2026-06-16.

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

## Open questions for the gate — resolved

1. **Tier and check type:** confirmed L1, hybrid, as proposed.
2. **`phase` and `applies_to`:** confirmed `[plan, implement, verify]` and
   `[page, component]` as proposed.
3. **`fails_when` bullets:** the three drafted above carried into the catalog entry and
   detail file verbatim, unamended.

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

Run 2026-07-08, after the catalog commit, via `python3 checks/reaudit-scope.py CMP-4`:

```
Re-audit scope for CMP-4 (category: Components & patterns)

Directly in scope (0) — these records list CMP-4; re-check each against the changed clause:
  (none)

Same-category candidates (5) — these records touch the Components & patterns domain but do NOT list CMP-4; they are candidates to confirm, not proven-affected. Confirm each actually uses the affected pattern:
  - docs/decisions/attendance.md
  - docs/decisions/broadcast-message.md
  - docs/decisions/grade-entry.md
  - docs/decisions/student-notes-empty-state.md
  - docs/decisions/submit-marks-review.md

5 record(s) to re-audit (0 direct, 5 candidate).
```

None of the four shipped surfaces (`student-notes-empty-state.md` is the triggering run
itself, listed here as a same-category candidate like the others) directly declared CMP-4
in their "Controls in scope" section — expected, since the control didn't exist when they
shipped. All five listed records are candidates for a design-lead-directed re-audit pass:
confirm whether each surface's empty state (if it has one) currently satisfies CMP-4
before treating it as compliant.

---

**Status:** APPROVED AS PROPOSED and committed to `standards/catalog.yaml` (Step 3 of
plan 065). Catalog 53 → 54 controls. Re-audit set run and appended above (Step 5).
