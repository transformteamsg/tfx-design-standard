# Proposal: a staleness axis for the anti-slop category

**Date:** 2026-07-27 · **Change type:** category-wide revision (schema field + review
cadence + one `fails_when` rewording) · **Status:** PROPOSAL, not yet committed to the
catalog. Pending design-lead interest before any file under `standards/` is touched, per
`CONTRIBUTING.md` step (a).

**Provenance:** external review of `vibedesignlab/slopslap` (MIT, read at `6b5dae1`).
Filed as gap G7 in `docs/external-harness-learnings.md` §5.6. The learning comes from
**slopslap**; the SLS review contributed nothing here.

**Nothing in `standards/` has changed.** No control, no tier, no waiver, no schema
field. This record is the specification the team reads before deciding.

## The problem

Every anti-slop control names the shape of a statistically average choice at the moment
it was written. SLP-1 names purple and violet gradient palettes, cyan-on-dark theming
and glow accents. Those were the 2024–25 tells. SLP-1..10 were consolidated on
11 June 2026 and SLP-11 was added on 17 June 2026. Since then nothing in the catalog has
recorded whether any of the eleven was re-checked against what generators actually
produce now.

The catalog has no way to notice that. `meta.updated` is one date for the whole
catalog. `status: proposed` records maturity, not freshness. A control can be settled,
valid, scoped, waivable and simultaneously describing a shape that no current model
emits.

The anti-slop category is the only one with this property. A11Y-1's contrast ratio,
TOK-1's "no raw colour values" and CNT-3's sentence length do not decay, because they
describe a requirement rather than an adversary's current output. Anti-slop controls
describe the adversary.

## Evidence

Stated plainly, because the ratchet rule is evidence in, rule out: **there is no TFX
incident behind this proposal.** The evidence is external and structural, and the design
lead may reject it on exactly that basis.

**External, from the slopslap taxonomy:**

- The taxonomy carries a `generation` field marking items that appeared as reactions to
  earlier bans. Two are recorded verbatim:
  - `safe-green-regression` — "보라/인디고를 프롬프트로 금지하면 모델이 기본 에메랄드
    그린(Safe Green)으로 회귀" (prohibit purple or indigo in the prompt and the model
    falls back to a default emerald green). Its `tell`: "한 디폴트를 막으면 다음
    디폴트로 옮겨갈 뿐, 색을 결정한 흔적은 여전히 없다" (blocking one default only moves
    it to the next; there is still no trace of a colour having been decided).
  - `tasteful-default-cream-serif` — cream background plus serif headline plus sage
    green, recorded as the new average precisely because it reads as the tasteful escape
    from purple. Promoted from `weak` to `strong` on two independent sources.
- An escape-inversion rule attached to the `generation` field: when a prescribed escape
  hardens into a formula, the item carries a warning that the escape is a principle
  rather than a recipe. The recorded case is a left-text plus right-visual plus two-pill
  composition, prescribed as the escape from a centred hero, later registered as a
  second-generation stock composition in its own right.
- The taxonomy states that `generation`-tagged items are re-verified every research
  round because of the arms-race property.

**Structural, in the TFX catalog:** SLP-1's `fails_when` reads "the default AI aesthetic
anywhere in product UI", and its title names four specific effects. A product that
avoids all four and lands on emerald, or on cream and serif, passes SLP-1 while
committing the failure SLP-1 exists to catch.

## The proposed change — three parts

### Part 1 — an optional per-control `reviewed` field

Add to `standards/schema.json` an optional field:

- `reviewed: YYYY-MM-DD` — the date the control's *description of the failure* was last
  confirmed against current generator output. Distinct from when the control was
  written, approved or last edited.

Optional and meaningful for `SLP` only. No other category needs it, and requiring it
everywhere would produce eleven real dates and fifty-nine ceremonial ones.

`validate.py` gains one rule: on a control whose id prefix is `SLP`, `reviewed` must be
present and must parse as a date. Absent on a non-SLP control is silent.

### Part 2 — a review cadence in the contributing flow

One entry in `CONTRIBUTING.md`: anti-slop controls are re-verified on a stated interval,
and the outcome is one of three:

1. the failure still describes current output → refresh `reviewed`;
2. the failure has moved → open a revision record and reword;
3. the failure no longer occurs → propose demotion or removal, recorded as evidence
   about where the bar moved.

Outcome 3 matters and the catalog currently has no path for it. The ratchet documents
how a control enters. Nothing documents how one leaves. slopslap has the equivalent, and
used it: `mesh-aurora-background` was demoted to "not a finding on its own" after its own
adversarial review rejected it as a keyword artefact.

Interval is an open question (§Open questions).

### Part 3 — reword SLP-1's `fails_when`

The only part that touches a control's text. Current:

```yaml
fails_when:
  - the default AI aesthetic anywhere in product UI
```

Proposed: describe the failure as an undecided palette, and carry the named hues as
examples rather than as the definition. Draft wording for the team to edit:

```yaml
fails_when:
  - a palette no one decided — accent hues that resolve to no product token and to no
    functional role, whatever the hues happen to be
  - the current examples: purple/violet gradient palettes, cyan-on-dark theming, glow
    accents, and the successor defaults that replace them once those are avoided
    (emerald as the post-indigo fallback; cream plus serif plus sage as the post-purple
    "tasteful" default)
```

Title and tier stay as they are. The rewording clarifies scope rather than broadening it:
an undecided palette was always the target, and the current wording lets a narrower
reading pass.

## Why this is not a new control

It adds no control, changes no tier and creates no new waiver. Part 3 is a `fails_when`
rewording on one existing control. Parts 1 and 2 are a schema field and a process entry.
A control that said "anti-slop controls must be fresh" would be a control about the
catalog rather than about a product surface, which is the wrong object.

## Non-duplication

- **vs `meta.updated`** — one catalog-level date. It moves whenever any control changes
  and says nothing about any individual control's freshness.
- **vs `status: proposed`** — maturity of approval, not currency of the description. A
  settled control can be stale; a proposed control can be current.
- **vs the `enforced` field** — whether a script exists, unrelated to whether the rule
  still describes reality.
- **vs `refs`** — where the control came from, not when it was last confirmed.

## Re-audit scope

Parts 1 and 2 change no clause and therefore trigger no re-audit. Part 3 does, and
`python3 checks/reaudit-scope.py SLP-1` reports:

```
Directly in scope (3): docs/decisions/broadcast-message.md
                       docs/decisions/self-audit.md
                       docs/decisions/submit-marks-review.md
Same-category candidates (0)
```

Three records list SLP-1 and would need re-checking against the reworded clause. In
practice the reworded clause is broader in wording and identical in intent, so the
expected outcome for all three is unchanged, but they must be re-checked rather than
assumed. Same-category candidates are zero.

## Cost

- Part 1: one schema field, one `validate.py` rule, eleven dates on first fill.
- Part 2: one section in `CONTRIBUTING.md`, then one review per interval.
- Part 3: one catalog entry, one detail file, three record re-audits.

Cheapest of the seven gaps in `docs/external-harness-learnings.md` §5.6, and the only one
whose absence quietly degrades the other ten controls in the category.

## Open questions for the team

1. **Interval.** Quarterly, half-yearly, or "whenever the category is touched"? An
   interval too short becomes ceremony; too long defeats the purpose. Recommendation:
   half-yearly, since the two recorded regressions took roughly that long to appear.
2. **Is structural evidence enough?** No TFX surface has failed because SLP-1 aged. A
   consistent reading of the ratchet rule could reject all three parts and wait for an
   incident. The counter-argument: the incident this prevents is invisible by
   construction, since it looks like a passing check.
3. **Should `generation` be imported as well as `reviewed`?** slopslap distinguishes
   original tells from successor-default tells. TFX could record the same, or could fold
   successors into the parent control's examples as Part 3 does. Part 3 takes the simpler
   route deliberately.
4. **Who owns the review?** The design lead, or whoever runs the parity review in
   `docs/reviews/`? The parity review already has a repeatable procedure and a dated
   record, so attaching the anti-slop freshness check to it would avoid a second cadence.
5. **Does removal need its own record type?** Part 2 outcome 3 has no template. A
   demotion or removal record is arguably a different artefact from a ratchet proposal.

## Sources

- `docs/external-harness-learnings.md` §4 (M6, M9), §5.3(b), §5.6 G7 — the full review.
- `vibedesignlab/slopslap` at `6b5dae1`: `src/data/aiSlopTaxonomyData.js`
  (`generation` field, `safe-green-regression`, `tasteful-default-cream-serif`,
  `mesh-aurora-background` demotion note).
- `standards/catalog.yaml` SLP-1..11 · `standards/schema.json` · `CONTRIBUTING.md`.

---

**Status:** PROPOSAL. Nothing under `standards/` has been created or edited. Catalog
remains at 70 controls; `python3 checks/validate.py` passes unchanged.
