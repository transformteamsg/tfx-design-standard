---
id: TYP-2
source: TFX-DS
title: Body text at least 14px; labels at least 11px; body line-height 1.5-1.6
tier: L1
check: deterministic
phase: [implement, verify]
applies_to: [page, component]
verify: "Type-scale scan; checks/type-scan"
waiver: documented
enforced: partial
script: checks/type-scan.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Set body copy at 14px or larger, UI labels at 11px or larger, and body line-height
between 1.5 and 1.6. Typefaces resolve under TYP-1 and sizes also satisfy the active
product/domain `typography.scale_px` under TYP-3; this control sets the universal
readability floors.

## Rationale

Readability is kindness. People often scan product UI while busy or under pressure.
Type below these floors trades their legibility for layout convenience.

## Passes when

- All body copy is ≥ 14px (Body Small is the 14px floor; Body 16, Body Large 18).
- Labels and captions are ≥ 11px (Label 11 / Caption 12 styles).
- Body text line-height computes to 1.5–1.6.

## Fails when

- Body copy below 14px — including "just this dense table".
- UI labels below 11px.
- Line-height under 1.5 on body copy.

## How to verify

Run `checks/type-scan.py <path>…` for statically visible font sizes and unitless/em
line-heights. Verify computed styles manually where values or body/label context are
not statically resolvable.
