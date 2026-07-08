# Proposed control: CNT-4 (domain fidelity — the CNT family's fourth slot)

**Date:** 2026-07-08 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Approved by:** Reza Ilmi (design lead), 2026-07-08 — in-session
directive ("execute all and then ship"); recommended options adopted. Committed to the
catalog at **CNT-4**, **L2**, **judgment**, `phase: [intent, implement, verify]`,
`applies_to: [content]`, `waiver: rationale`, with the `fails_when` bullets drafted
below carried verbatim into the catalog entry and `controls/cnt-4.md`, exactly as
proposed — no amendments at the gate. Open question 3 (where a domain-reviewer
attestation is recorded) stays **unresolved**: per the plan's maintenance note, a
decision-record template field is added only if the gate asks for one, and the gate's
directive here approved the recommended options without adding new template fields —
so `docs/decisions/TEMPLATE.md` is untouched by this control.

> **Note on the `CNT-N` placeholder used below:** while this proposal was open,
> `checks/validate.py`'s cross-ref sweep would have flagged a literal `CNT-4` reference
> in this file as an unknown control id (the catalog didn't carry the entry yet), so
> the body below still reads `CNT-N` in the specification sections — a drafting
> artifact of the propose-then-approve sequence, not a live open question, per the
> CMP-4 record's precedent for this same convention.

This record lives in `docs/catalog-changes/` per the plan-053 placement rule. Plan:
`harness/plans/066-ratchet-round-cnt4-slp12-cmp8.md`. Source: GitHub issue
[#27](https://github.com/transformteamsg/tfx-design-standard/issues/27), OPEN, "Proposed
control: domain content must match the real-world artifact it models."

## Why this is a control candidate

The CNT family covers naming (CNT-2), error anatomy (CNT-1), and voice mechanics
(CNT-3) — none of it checks whether content that models a real-world artifact is
actually faithful to that artifact. A recognisably-wrong domain detail undermines a
concept test even when every other control passes, and nothing in the catalog names
that failure mode.

## Triggering evidence — issue #27, quoted verbatim

> "## Gap
> The CNT family covers naming, voice, and tone — **not domain/factual accuracy**. When
> a surface models a real-world artifact (a curriculum, a form, a policy document),
> nothing checks that the modelled content is actually faithful to it. A
> recognisably-wrong domain detail undermines a concept test even when every other
> control passes.
>
> ## Evidence (where it surfaced)
> Teacher Workspace HDP (P1) reports. The mock P1 report graded learning outcomes for
> **Science** (starts P3 in SG, not P1) and showed a P1 Mathematics LO "Statistics &
> Probability" — both read as fake to a real P1 teacher. The Science case was caught and
> fixed; the LO-wording case remains flagged as illustrative pending HOD confirmation.
> Two evaluator passes graded this against the sprint contract directly because no
> control covered it."

— issue #27 body, retrieved 2026-07-08 via `gh issue view 27`.

## The proposed control

- **id:** `CNT-N` (expected 4 at the gate).
- **title:** "Content that models a real-world artifact is faithful to it (scope,
  terminology, structure) or explicitly labelled illustrative".
- **tier:** L2 (proposed, per issue #27's own suggestion — "judgment/quality… needs a
  domain reviewer, e.g. HOD, not mechanically checkable").
- **check:** judgment.
- **phase:** `[intent, implement, verify]`.
- **applies_to:** `[content]`.
- **waiver:** `rationale` (follows L2).
- **verify:** "Evaluator + named domain reviewer sign-off before user testing, or the
  illustrative label present in-product and in the decision record."
- **fails_when:**
  - a curriculum/subject/level detail a practitioner would recognise as wrong (e.g. a
    subject graded at a level where it isn't taught);
  - invented specifics presented as real in a user-testing surface;
  - placeholder content with no illustrative label.

## Non-duplication statement

- **vs. CNT-1** (error anatomy): different failure class — CNT-1 grades error copy's
  structure, not domain accuracy. No overlap.
- **vs. CNT-2** (naming): CNT-2 grades whether a feature/page name is plain language;
  this control grades whether the *content* a surface presents is faithful to the
  real-world thing it models. A feature could pass CNT-2 (a plain name) while still
  failing this control (invented specifics inside it read as fake).
- **vs. CNT-3** (voice mechanics): CNT-3 grades sentence mechanics and purpose-first
  framing, not factual/domain correctness. No overlap.
- **vs. IDN-3** (tone calibration): tone register, not domain fidelity. No overlap.

## Open questions for the gate — resolved

1. **Tier and check type:** confirmed L2, judgment, as proposed.
2. **`phase` and `applies_to`:** confirmed `[intent, implement, verify]` and
   `[content]` as proposed; not extended to `[page]`.
3. **Where the domain-reviewer attestation is recorded** — left open. The gate approved
   the recommended options without directing a template change, so
   `docs/decisions/TEMPLATE.md` gains no new field this round. A future run may still
   raise this if the gap is felt in practice.
4. **`fails_when` bullets:** the three drafted above carried into the catalog entry and
   detail file verbatim, unamended.

## Notes carried into the detail file (`controls/cnt-4.md`, if ratified)

- Concrete anti-patterns (rule 3): a subject graded at a school level where it is not
  taught in Singapore; a curriculum learning-outcome label that does not exist in the
  real syllabus, presented as real; a mock document with invented specifics and no
  illustrative label, used in a surface shown to real practitioners for feedback.
- **Do not flag:** content explicitly labelled illustrative/placeholder in-product and
  in the decision record; a domain reviewer's (e.g. HOD) recorded sign-off closes the
  question even where a detail looks unusual to a non-specialist reader.

## Re-audit set

Run 2026-07-08, after the catalog commit, via `python3 checks/reaudit-scope.py CNT-4`:

```
Re-audit scope for CNT-4 (category: Content & naming)

Directly in scope (0) — these records list CNT-4; re-check each against the changed clause:
  (none)

Same-category candidates (6) — these records touch the Content & naming domain but do NOT list CNT-4; they are candidates to confirm, not proven-affected. Confirm each actually uses the affected pattern:
  - docs/decisions/attendance.md
  - docs/decisions/broadcast-message.md
  - docs/decisions/grade-entry.md
  - docs/decisions/self-audit.md
  - docs/decisions/student-notes-empty-state.md
  - docs/decisions/submit-marks-review.md

6 record(s) to re-audit (0 direct, 6 candidate).
```

None of the six declared CNT-4 in scope — expected, since the control didn't exist when
they shipped. All six are candidates for a design-lead-directed re-audit pass: confirm
whether each surface presents content that models a real-world artifact, and if so,
whether that content is faithful or explicitly labelled illustrative.

---

**Status:** APPROVED AS PROPOSED and committed to `standards/catalog.yaml` (Step 3 of
plan 066). Catalog 54 → 57 controls (with CMP-8 and CMP-9). Re-audit set run and
appended above (Step 3.5).
