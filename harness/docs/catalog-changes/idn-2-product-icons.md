# Proposed control: IDN-N (product icons render only from the approved icon family — the icon-level twin of IDN-1; slot 2)

**Date:** 2026-07-03 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Approved by:** pending — design-lead approval required before the
catalog commit. No approval is recorded in this file yet.

> **Note on `IDN-N`:** written as a placeholder rather than a concrete number, for the
> same reason as the plan-053 siblings `lay-1-grid.md` / `lay-7-focal-point.md` —
> `checks/validate.py`'s catalog-changes cross-ref sweep (`xref_re = \b(PREFIX)-\d+\b`,
> case-sensitive) flags any `PREFIX-<digit>` id not already in the live catalog as
> "references unknown control id". `IDN-N` (letter, not a digit) does not match, so it
> stays inert until the gate. At proposal time IDN holds exactly one control (IDN-1), so
> the next free slot is **2**; this record and its two siblings (tone calibration, slot 3;
> CaseSync sensitivity, slot 4) would take slots 2–4 in order. Confirm still free
> (`grep -n "id: IDN-"` on the live catalog) and assign the concrete id at the approval
> gate.

This record lives in `docs/catalog-changes/` per the same placement rule as the plan-053
records: it is a ratchet proposal, not a fresh loop-run decision record, so it does not go
in `docs/decisions/` (that directory is audited by `checks/audit-record.py` against the
loop-run template). Plan: `harness/plans/057-branding-controls-ratchet.md`.

## Why this is a control, not a one-off fix

The portfolio's product-icon family is a fully documented brand asset with a construction
grid, a clear zone, stroke bands, export rules, and a verification tool — but nothing in
the catalog enforces that shipped icons come from it. IDN-1 covers logos and lockups;
icons are a distinct asset class the standard treats separately
(`content/guidelines/product-icons.mdx`). Per `standards/README.md` authoring rule 3
("anti-patterns are the most powerful instruction"), the guideline already states the
negative rules ("never redraw it", "no per-product background colours", "marks crossing
the clear zone") — this record turns the already-recorded guidance into a checkable
control so a regenerated or ad-hoc icon is a finding, not a matter of whoever reviews it
noticing.

## Triggering evidence — standards-derived, no incident

No incident. I did not find a loop-run record or review where a rebuilt or off-family
product icon shipped and cost rework; the guideline reports the three existing icons as
already conforming (`content/guidelines/product-icons.mdx:12`: "Teacher Workspace,
CaseSync and Glow already follow it"). **This proposal is standards-derived from recorded
guidance, no incident** — it exists because a documented brand asset lacks a catalog
control, not because a defect surfaced it. The design lead should weigh that the source
guideline is itself `status: proposed` (`content/guidelines/product-icons.mdx:4`), so this
control ratifies alongside, not ahead of, a settled guideline (see open questions).

Recorded facts this draft rests on (the only permitted source, `product-icons.mdx`):

- `content/guidelines/product-icons.mdx:12` — "The portfolio uses one icon family: a
  solid blue rounded square holding a single white script mark. … every new product icon
  should look like their sibling."
- `content/guidelines/product-icons.mdx:33` — container: "Reuse it; never redraw it."
- `content/guidelines/product-icons.mdx:34` — "Background: solid #0064FF … No gradients,
  no transparency, no per-product colour."
- `content/guidelines/product-icons.mdx:35` — "One mark, one focal point. No wordmarks,
  no photos, no shadows or gloss."
- `content/guidelines/product-icons.mdx:66` — new marks are verified through the Icon
  Generator before review.
- `content/guidelines/product-icons.mdx:85` — "Don't: … redrawing or restyling the
  container · gradients, shadows, gloss · per-product background colours."
- Shape mirrored from IDN-1 (`standards/catalog.yaml:514-525`).

## The proposed control

- **id:** `IDN-N` (slot 2 at proposal time — confirm at the gate).
- **title:** "Product icons render only from the approved product-icon family; no ad-hoc,
  redrawn, or regenerated icons".
- **tier:** L1 (proposed — matches IDN-1's L1; icon integrity is a consistency-and-quality
  rule, not a safety floor).
- **check:** deterministic (proposed).
- **phase:** `[implement, verify]`.
- **applies_to:** `[page, component]`.
- **products / audiences:** none — **global** (the icon family is portfolio-wide; all three
  products share it).
- **waiver:** documented (follows L1).
- **verify:** "Icon files resolve to the approved icon set (the `/icons/*.svg` family the
  guideline ships); no inline-drawn or regenerated marks. New marks are pre-verified via
  the Icon Generator (`content/guidelines/product-icons.mdx:66`) before entering the set."
- **fails_when:**
  - a redrawn, distorted, or regenerated product-icon mark;
  - a per-product background colour or gradient applied to the icon container
    (`product-icons.mdx:34,85`);
  - wordmarks, photos, shadows, or gloss inside the icon (`product-icons.mdx:35`).

## Non-duplication statement (why COL-1 / TYP-1 / IDN-1 don't already cover it)

- **vs. IDN-1** (the required check, and the closest neighbour): IDN-1 governs *logos and
  lockups* — the brand marks and mark+wordmark compositions ("Product lockups and logos
  render only from approved assets", `catalog.yaml:516`). This control governs the
  *product app-icon family* — the solid-blue rounded square holding a script mark — which
  the guideline documents as a **separate asset class** with its own grid and export
  rules, and which sits *next to* the lockup rather than being one ("Each lockup links to
  that product's identity page", `product-icons.mdx:12`). Same enforcement *shape*
  (approved-asset-only, no recreation), different *subject*: this is the icon-level twin of
  IDN-1, in the way TOK-1/2/3 are twins across colour/spacing/radius — not the same rule
  restated. **Open-question flag, not a duplication error:** the gate could instead prefer
  to broaden IDN-1's "approved assets" wording to name icons explicitly and *not* add a
  second control. That fold-vs-separate call is surfaced below, not wordsmithed around.
- **vs. COL-1**: COL-1 anchors each product's *primary colour* for CTAs and brand moments
  in its own ramp (per-product: TW blue, CaseSync indigo, Glow orange). The icon family is
  the deliberate exception — a single shared `#0064FF` for all three, no per-product colour
  (`product-icons.mdx:34`). So this control and COL-1 do not touch: the icon background is
  not a per-product brand-moment surface, and forbidding per-product icon colours is the
  opposite of COL-1's per-product rule (correctly, because the icon is family-level
  identity, not product-level emphasis).
- **vs. TYP-1**: TYP-1 governs *typefaces* for set text (Plus Jakarta Sans / Inter). Icon
  marks are drawn from circle arcs, not set type (`product-icons.mdx:39`) — no overlap.

## Open questions (for the gate)

1. **Fold or separate?** Add IDN-N as a distinct icon control, or broaden IDN-1's wording
   to cover icons and keep one control? (The whole reason for the gate.)
2. **Settle the source first?** `product-icons.mdx` is `status: proposed`. Should this
   control wait for the guideline to settle, or is "all three products already follow it"
   (`:12`) enough to ratify in step with it?
3. **Where is the resolvable set?** The deterministic half needs a concrete allowlist. The
   guideline points at `/icons/*.svg` and the external Icon Generator; confirm the
   check reads a checked-in asset manifest, not a live tool.
4. **`applies_to` surface**: is a bare icon a `component`? Confirm the surface dimension the
   scan targets.

## Notes carried into the detail file (`controls/idn-N.md`, if ratified)

- **How it would be verified:** icon files resolve to the approved checked-in set; no
  inline redraws or regenerated marks. The Icon Generator is an *authoring* verifier for
  new marks (`product-icons.mdx:66`), not the enforcement scan — say "verified against the
  approved set" not "passed the Icon Generator".
- **Do not flag:** a correctly referenced approved icon; a genuinely new product icon that
  passed the Icon Generator and was added to the family set through review.

---

**Status:** propose-only, Step 1 of plan 057. Not committed to `standards/catalog.yaml`.
Awaiting design-lead approve/amend/reject, recorded by name and date in this file before
any catalog change happens (per the harness's own CLAUDE.md: never edit the catalog to
make a failing check pass, and never commit without recorded approval).
