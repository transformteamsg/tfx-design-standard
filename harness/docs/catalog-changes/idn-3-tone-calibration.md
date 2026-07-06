# Proposed control: IDN-N (per-product tone register — the verbal twin of COL-1's per-product colour; slot 3)

**Date:** 2026-07-03 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Approved by:** Reza Ilmi (design lead), 2026-07-06 — in-session approval. Assigned
**IDN-3**, L2, as proposed. The per-product register table is now normative in this
control's detail file (`controls/idn-3.md`); the `copy` skill §6 points here (SYNC parity
deferred, pointer for v1).

> **Note on `IDN-N`:** placeholder, not a concrete number — same reason as the sibling
> `idn-2-product-icons.md`: `checks/validate.py`'s cross-ref sweep flags any
> `PREFIX-<digit>` id not in the live catalog. At proposal time the next free IDN slot
> after the icon candidate (slot 2) is **3**. Confirm still free and assign the concrete
> id at the gate.

This record lives in `docs/catalog-changes/` per the plan-053 placement rule (ratchet
proposal, not a loop-run decision record). Plan:
`harness/plans/057-branding-controls-ratchet.md`.

## Why this is a control, not a one-off fix

The harness already teaches a per-product tone register — but only as prose inside the
`content` skill (`.claude/skills/content/SKILL.md` §6). It says the products share one
voice character and differ only in *weight*: Teacher Workspace steady, CaseSync reserved,
Glow warmer, TW-adjacent surfaces plain. Nothing in the catalog makes that a checkable
claim, so an evaluator has no control to cite when a product's copy drifts into another
product's register. This is the exact structure COL-1 already uses for *colour* — one
control, a per-product table in the detail file — applied to *voice*. Per
`standards/README.md` authoring rule 1, guidance that lives as prose in one skill and is
checkable-as-a-whole nowhere isn't a standard yet; this record makes it one, following the
COL-1 pattern the plan names.

## Triggering evidence — standards-derived, no incident

No incident. I did not find a loop-run record or review where a product shipped copy in the
wrong register and it cost rework. **This proposal is standards-derived from recorded
guidance, no incident** — it promotes an existing skill section into a control, it does not
respond to a caught failure. The evidence is confirmatory (the register is already written
down and applied by the content skill) rather than corrective.

Recorded facts this draft rests on (verbatim, `content/.../content/SKILL.md` §6):

- `.claude/skills/content/SKILL.md:130` — "## Per-product tone calibration (§6)".
- `.claude/skills/content/SKILL.md:132` — "Same character everywhere; calibrate weight,
  never switch systems".
- `.claude/skills/content/SKILL.md:134` — "Teacher Workspace — calm daily command centre:
  neutral, steady, quietly confident."
- `.claude/skills/content/SKILL.md:135-136` — "CaseSync — higher gravity: more reserved,
  restrained celebration, privacy-forward (sensitive casework)."
- `.claude/skills/content/SKILL.md:137` — "Glow — lighter, more encouraging: warmer
  accents, more celebratory moments."
- `.claude/skills/content/SKILL.md:138` — "Posts / PG Staff Portal — pure TW, no nuance."
- Per-product-table pattern mirrored from COL-1 (`standards/controls/col-1.md:22-32`).
- The uncheckable principle behind the register, cited but **deliberately not proposed as a
  control**: `harness/CLAUDE.md:15` "Brand essence is Kind Utility — useful first, kind at
  the surface." It is a principle, not a verifiable statement (authoring rule 1), so it
  stays a principle; this control checks the *register*, not the essence.

## The proposed control

- **id:** `IDN-N` (slot 3 at proposal time — confirm at the gate).
- **title:** "Copy on a product's surface carries that product's calibrated tone register —
  same voice character, calibrated weight, never a switched voice system".
- **tier:** L2 (proposed — a strong default with deliberate deviation allowed; register is
  judgment, not a floor).
- **check:** judgment (proposed).
- **phase:** `[implement, verify]` (proposed — register is set when copy is written and
  read again at verify; see open questions on intent/plan).
- **applies_to:** `[content]`.
- **products / audiences:** none — **global with per-product parameters in the detail
  table**, the COL-1 pattern. (One control for the whole portfolio; the per-product
  difference is the table, not separate rules — `standards/README.md` rule 5.)
- **waiver:** rationale (follows L2).
- **verify:** "Evaluator reads the surface's copy against the product's row in the
  per-product register table (detail file): does it hold the shared voice character at the
  product's calibrated weight, or has it switched systems (e.g. Glow-style celebratory copy
  on a CaseSync surface, or CaseSync-style reserve on a Glow moment)?"
- **fails_when:**
  - copy adopts another product's register (a switched voice system, not calibrated weight);
  - a TW-adjacent surface (Posts / PG Staff Portal) carries nuance instead of plain TW
    voice (`SKILL.md:138`).

## Non-duplication statement (why COL-1 / TYP-1 / IDN-1 don't already cover it)

- **vs. COL-1** (the required check, and the structural template): COL-1 is the per-product
  *colour* register — one control, a per-product table (TW blue / CaseSync indigo / Glow
  orange). This is the per-product *tone* register — the verbal twin, one control, a
  per-product table. Parallel structure, orthogonal dimension (colour vs. voice); a surface
  can pass COL-1 (correct product colour) and fail this (wrong product's voice), and vice
  versa. Not a duplicate — the sibling.
- **vs. TYP-1**: TYP-1 governs *typeface and weight* (Plus Jakarta Sans / Inter). This
  governs *verbal register*, not letterforms — no overlap.
- **vs. IDN-1**: IDN-1 governs *logo/lockup assets*. This governs *copy tone* — no overlap.
- **vs. CNT-2 / CNT-3** (content neighbours — not in the required trio, deconflicted for
  completeness): CNT-2 is plain-language naming and CNT-3 is lead-with-purpose / second
  person / active voice / ≤25 words — both portfolio-wide *voice mechanics* that are the
  *same everywhere*. This control is the layer above: the per-product *weighting* of that
  one voice ("calibrate weight, never switch systems", `SKILL.md:132`). Copy can pass CNT-3
  (active, second person, short) and still miss this (correct mechanics, wrong product
  register). It does not restate CNT-2/3; it depends on them.

## The SYNC.md choice for the per-product table (read before choosing — required by the plan)

The register table currently lives in exactly one place, the content skill §6
(`SKILL.md:130-138`). If ratified, the detail file `controls/idn-N.md` would carry the
same table — a fragment restated in two contexts, which is what `docs/SYNC.md` governs.

**Choice: POINT, do not build a sync check (defer parity), for v1.** Reasoning from
`docs/SYNC.md`:

- Its content-guidance model (`SYNC.md` §"Source of truth — content guidance") says voice/
  tone guidance is *normative in the catalog controls*, and the skill "points at it rather
  than restating it." So on ratification the **normative home of the register table becomes
  `controls/idn-N.md`**, and the content skill §6 becomes a pointer/consumer.
- Its explicit precedent: the voice-attribute and tone-by-context tables are *already*
  duplicated skill ↔ `voice-tone.mdx` with the automated parity check **deferred** —
  "the drift cost is low and pointers suffice for v1 … If they drift in practice, add a
  `tfx-sync:voice-attributes` block … and a website-optional sub-check." Mirror that
  exactly: **defer** the automated parity check for the register table; use a pointer for
  v1.
- Building a `tfx-sync` parity check would touch `checks/validate.py` and the skill, both
  **out of scope** for this propose-only run. So the record only *recommends* the mechanism,
  it does not build it.

**Recommended escalation (if it later drifts):** add a `tfx-sync:idn-register` block with
`source = controls/idn-N.md` and consumer = content skill §6, plus a set-comparison
sub-check in `validate.py` — the standard `docs/SYNC.md` "add a block when it drifts" path.

## Open questions (for the gate)

1. **Phase:** `[implement, verify]` proposed. Should `intent` / `plan` be included, since a
   product's register is partly *chosen* upstream of writing individual strings?
2. **Fold the CaseSync sensitivity candidate in?** The sibling record
   (`idn-4-casesync-sensitivity.md`, slot 4) proposes a CaseSync-scoped control that could
   instead be the CaseSync *row* of this table (rule 5: nuance calibration, not a separate
   rule). That fold-vs-separate call is the gate's — see that record.
3. **judgment vs hybrid:** register is fundamentally judgment, but a lint could flag
   celebratory-token / exclamation density as a narrowing signal. Worth a hybrid half?

## Notes carried into the detail file (`controls/idn-N.md`, if ratified)

- Carry the per-product register table (TW / CaseSync / Glow / TW-adjacent) verbatim from
  `SKILL.md:130-138`, and mark this file the normative source per the SYNC.md choice above.
- **Evaluator guidance:** same character, calibrated weight. Do **not** flag a product for
  using the shared voice; flag a product *switching systems* — Glow adopting CaseSync's
  reserve for a celebration, CaseSync adopting Glow's celebratory warmth around case data,
  or a Posts / PG Staff Portal surface carrying product nuance it should not.

---

**Status:** propose-only, Step 1 of plan 057. Not committed to `standards/catalog.yaml`.
Awaiting design-lead approve/amend/reject, recorded by name and date in this file before
any catalog change happens.
