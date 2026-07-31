# Revision: TYP-2 + TYP-3 — migrate the published type scale to Tailwind defaults

**Date:** 2026-07-15 · **Change type:** revision of TYP-2 and TYP-3 (no new control,
no tier change — both stay L1) · **Approved by:** Reza Ilmi (design lead), 2026-07-15
— in-session decision (chose "Migrate to Tailwind defaults" over keeping the TFX
scale); recommended options adopted.

This record lives in `docs/catalog-changes/` per the same placement rule as
`lay-7-focal-point.md`: it is a ratchet revision, not a fresh loop-run decision record,
so it does not go in `docs/decisions/` (that directory is audited by
`checks/audit-record.py` against the loop-run template). Plan:
`harness/plans/068-typ-scale-tailwind-defaults.md`.

## What changed

- TYP-3's published scale moves from the custom TFX pixel set
  `{120,96,72,48,32,24,20,18,16,14,12,11}` to Tailwind's default type scale
  `{128,96,72,60,48,36,30,24,20,18,16,14,12}`.
- TYP-2's label floor rises from 11px to 12px, to match the new scale's smallest step.
  The 14px body floor and the 1.5–1.6 body line-height band are unchanged.
- `checks/type-scan.py` now also resolves `rem` values (converted at 16px) alongside
  `px`, and treats any fractional-pixel size as off-scale by definition, not only
  whole-px sizes outside the set.

## Why

The harness philosophy states the stack is fixed and boring on purpose: Base UI
components, Radix Colors, shadcn/ui default tokens. The custom TFX pixel scale
contradicted that on the site's own pages — every type declaration went through
Tailwind arbitrary values (`text-[32px]`, `leading-[1.6]`) instead of named utilities,
and two sizes in use (`text-[13px]`, `text-[0.8rem]`) weren't even on the custom scale
to begin with. Migrating to Tailwind's default scale lets the site use named
`text-xs`…`text-7xl` utilities everywhere, closing that gap permanently rather than
patching individual off-scale sizes.

## Consequences

- Site-wide utility migration: every component and page using an arbitrary
  `text-[Npx]` or `leading-[N]` value moves to the matching named utility.
- Visible deltas: page/section titles 32px→30px, labels/badges/eyebrows 11px→12px,
  eyebrows drop all-caps and wide tracking, body line-height 1.6→1.5, hero
  line-height 1.04→1.0.
- `checks/type-scan.py` gains rem support so arbitrary rem sizes (like the button's
  former `text-[0.8rem]`) can no longer evade the scanner.

## Re-audit note

Historical decision records and loop-run reports that cite the old 11px label floor
or the old pixel scale are grandfathered — they document the state of the standard at
the time they were written and are not rewritten. Only the live catalog, its control
detail files, `checks/type-scan.py`, `checks/README.md`, the two control-format
examples, and the published `content/foundations/typography.mdx` page reflect the new
scale going forward.
