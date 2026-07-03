# Proposed control: IDN-N (CaseSync sensitivity register — the first product-scoped control; slot 4)

**Date:** 2026-07-03 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Approved by:** pending — design-lead approval required before the
catalog commit. No approval is recorded in this file yet.

> **Note on `IDN-N`:** placeholder, not a concrete number — `checks/validate.py`'s
> cross-ref sweep flags any `PREFIX-<digit>` id not in the live catalog. At proposal time
> the next free IDN slot after the icon (2) and tone (3) candidates is **4** — *if it
> survives the fold question below as a separate control at all* (it may become a row in
> the slot-3 table instead, taking no id). Confirm and assign at the gate.

This record lives in `docs/catalog-changes/` per the plan-053 placement rule. Plan:
`harness/plans/057-branding-controls-ratchet.md`.

## Why this is a control candidate

CaseSync handles sensitive casework, and the recorded guidance already calls for a distinct
treatment there: "higher gravity: more reserved, restrained celebration, privacy-forward
(sensitive casework)" (`.claude/skills/content/SKILL.md:135-136`). This record proposes
hardening that recorded register into a checkable prohibition — restrained celebration, no
gamified or playful elements around case data — scoped to CaseSync via the `products:`
field that plan 056 added to the schema. **This is the first control that would carry a
scope field; every future scoped control will cite whatever bar the gate sets here, so the
precedent matters more than this one control.**

## The rule-5 tension — the reason this record exists to be gated

`standards/README.md:115-116` authoring rule 5: *"One catalog for the whole portfolio. No
per-product control overlays; per-product difference is nuance calibration, never separate
rules."* A standalone `products: [casesync]` control is in direct tension with that rule.
The reconciliation the catalog itself offers is in `standards/README.md:70-75` (§Scope):
scoping is *"opt-in per control, used only when a control genuinely binds one product."*

So the gate's decision is precisely:

- **(a) Genuinely product-binding** → CaseSync's sensitivity is a real, CaseSync-specific
  constraint (privacy-forward casework), a scoped control is warranted, assign slot 4; **or**
- **(b) Nuance calibration** → this is the CaseSync *row* of the slot-3 per-product tone
  table (`idn-3-tone-calibration.md`), not a separate rule; fold it in, no id assigned.

The plan is explicit that this is the gate's call: "the design lead may fold this into the
tone table — that call is what the gate is for." This record does not decide it; it lays
both options out honestly. **This is a deliberate near-overlap with its own sibling
(slot 3), surfaced for the gate — not an accidental duplication to wordsmith around.**

## Triggering evidence — standards-derived, no incident

No incident. **Standards-derived from recorded guidance, no incident** — the CaseSync line
in §6 already states the register; this would promote and harden it. Recorded facts:

- `.claude/skills/content/SKILL.md:135-136` — "CaseSync — higher gravity: more reserved,
  restrained celebration, privacy-forward (sensitive casework)."
- `.claude/skills/content/SKILL.md:132` — the parent principle: "Same character everywhere;
  calibrate weight, never switch systems."
- Schema support for scoping: `standards/schema.json:8` (`"products": ["tw", "casesync",
  "glow"]`); scoping rules `standards/README.md:53-77`; product id `casesync`
  (`standards/catalog.yaml:30`).

## The proposed control (if kept separate — option (a))

- **id:** `IDN-N` (slot 4 at proposal time — only if not folded; confirm at the gate).
- **title:** "CaseSync surfaces treat casework as sensitive: restrained celebration, no
  gamified or playful elements around case data".
- **tier:** L2 (proposed — matches the slot-3 tone parent; **the gate may prefer L1** given
  the privacy/sensitivity stakes, see open questions).
- **check:** judgment (proposed).
- **phase:** `[implement, verify]`.
- **applies_to:** `[content, page, component]` (copy register *and* the presence of
  gamified/playful UI elements around case data).
- **products:** `[casesync]` — the scope field. (No `audiences` field; CaseSync surfaces
  are staff-facing by default.)
- **waiver:** rationale (follows L2).
- **verify:** "On CaseSync surfaces, the evaluator confirms case-data moments are treated
  with restraint — no confetti/celebration animations, streak/badge/points gamification, or
  exclamatory congratulatory copy around case outcomes; acknowledgement is calm and
  privacy-forward."
- **fails_when:**
  - celebratory or confetti-style motion on a case-closure or case-outcome moment;
  - streak / badge / points / leaderboard gamification attached to casework;
  - exclamatory congratulatory copy on a sensitive case outcome.

## Non-duplication statement (why COL-1 / TYP-1 / IDN-1 don't already cover it)

- **vs. COL-1**: colour, not treatment/tone. CaseSync's indigo primary is COL-1's concern;
  this is about celebration/gamification restraint — no overlap.
- **vs. TYP-1**: typeface — no overlap.
- **vs. IDN-1**: logo/lockup assets — no overlap.
- **vs. the slot-3 tone candidate (the real near-neighbour):** the slot-3 CaseSync row
  already says "more reserved, restrained celebration." This candidate *hardens* that into
  a concrete, CaseSync-scoped prohibition with anti-pattern bullets. That overlap is the
  fold question above — intentional, surfaced for the gate, not disguised.
- **vs. MOT-1** (motion neighbour): MOT-1 bans decorative motion on critical paths
  portfolio-wide; this candidate's "no celebratory motion" partly overlaps but is broader
  (copy tone + playful UI patterns) and CaseSync-scoped. Complementary, not duplicate — the
  gate may prefer to lean on MOT-1 for the motion half and keep this to copy/patterns.

## Open questions (for the gate)

1. **FOLD or SEPARATE** — the core call (options (a)/(b) above). If fold, this record's
   content becomes the CaseSync row of the slot-3 table and no id is assigned.
2. **Precedent bar:** as the first scoped control, does CaseSync sensitivity meet the
   "genuinely binds one product" bar of `standards/README.md:74`? Whatever answer sets the
   precedent for every future `products:`/`audiences:` control.
3. **Tier:** L2 (matching the tone parent) or L1 (given privacy/sensitivity stakes)?
4. **Motion boundary:** is celebratory motion in scope here, or delegated to MOT-1?
5. **`applies_to`:** is `[content, page, component]` right, or should this stay `[content]`
   and let a separate pattern control handle gamified UI?

## Notes carried into the detail file (`controls/idn-N.md`, if ratified separate)

- Concrete anti-patterns (rule 3): confetti/celebration animation on case closure;
  streak/badge/points gamification on casework; exclamatory congratulations on sensitive
  outcomes.
- **Do not flag:** a calm, neutral confirmation that a case action completed; a restrained
  acknowledgement. Restraint is the target, not the absence of all feedback.

---

**Status:** propose-only, Step 1 of plan 057. Not committed to `standards/catalog.yaml`.
Awaiting design-lead approve/amend/reject (including the fold-vs-separate decision),
recorded by name and date in this file before any catalog change happens.
