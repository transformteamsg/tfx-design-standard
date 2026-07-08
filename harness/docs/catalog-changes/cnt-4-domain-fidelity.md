# Proposed control: CNT-N (domain fidelity — the CNT family's fourth slot)

**Date:** 2026-07-08 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Approved by:** — pending.

> **Note on `CNT-N`:** placeholder, not a concrete number — `checks/validate.py`'s
> cross-ref sweep flags any `PREFIX-<digit>` id not in the live catalog. At proposal
> time the next free CNT slot is **4** (CNT-1..3 exist). Confirm and assign at the gate.

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

## Open questions (for the gate)

1. **Tier and check type:** L2, judgment, as proposed by the issue — confirm.
2. **`phase` and `applies_to`:** `[intent, implement, verify]` and `[content]` —
   confirm, or should `applies_to` extend to `[page]` for whole-surface domain framing
   (e.g. an entire mock dashboard modeling a school term)?
3. **Where the domain-reviewer attestation is recorded** — the decision-record evidence
   ledger row is the natural place, but no template field exists yet for it. Per the
   plan's maintenance note, a template field is added only if the gate asks for one —
   this record does not add one speculatively.
4. **`fails_when` bullets:** the three drafted above — confirm as proposed or amend.

## Notes carried into the detail file (`controls/cnt-4.md`, if ratified)

- Concrete anti-patterns (rule 3): a subject graded at a school level where it is not
  taught in Singapore; a curriculum learning-outcome label that does not exist in the
  real syllabus, presented as real; a mock document with invented specifics and no
  illustrative label, used in a surface shown to real practitioners for feedback.
- **Do not flag:** content explicitly labelled illustrative/placeholder in-product and
  in the decision record; a domain reviewer's (e.g. HOD) recorded sign-off closes the
  question even where a detail looks unusual to a non-specialist reader.

---

**Status:** propose-only, Step 1 of plan 066. Not committed to `standards/catalog.yaml`.
Awaiting design-lead approve/amend/reject, recorded by name and date in this file before
any catalog change happens.
