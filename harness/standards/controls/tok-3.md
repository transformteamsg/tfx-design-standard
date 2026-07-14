---
id: TOK-3
source: TFX-DS
title: Corner radii come from the resolved product/domain radius scale and stay consistent across peers
tier: L1
check: deterministic
phase: [implement, verify]
applies_to: [component]
verify: "No values outside the resolved product/domain radius_px scale; evaluator checks concentric nesting and peer consistency; checks/token-audit"
waiver: documented
enforced: partial
script: checks/token-audit.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Corner radii must resolve to `stack.radius_px` from the active product/domain profile,
and nesting must be concentric (child radius ≤ parent radius). Use
`inner radius = outer radius − padding`, then snap to the nearest declared step.
Peer containers of the same kind (cards, sections, tiles) share one radius, anchored
to the active product's declared Card/base-radius token.

## Rationale

Two on-scale radii can still read as careless when peers disagree. A `rounded-lg`
(8px) section beside `rounded-3xl` (24px) cards — both on scale, both valid in
isolation — looks inconsistent side by side. Consistency across peers is what makes a
surface feel deliberate rather than assembled from independent parts. The product's
Card radius is the natural anchor because cards are the most common peer container.

## Fails when

- Ad-hoc radius values outside the resolved `radius_px` scale.
- Child radius larger than parent (non-concentric nesting).
- Peer containers of the same kind using different corner radii on the same surface
  with no deliberate hierarchy reason (e.g. a profile section at `rounded-lg` beside
  metric cards at `rounded-3xl`).

## How to verify

**Deterministic half (static, per element):** run `checks/token-audit.py <path>…` —
the scanner flags raw values outside the resolved scale. Concentric nesting requires
rendered parent/child context and remains evaluator-judged.

> **Coverage caveat (utility-first / Tailwind products).** `token-audit` resolves
> raw `border-radius` in CSS properties, arbitrary utilities (`rounded-[10px]`), and
> palette-bypass classes — but it does **not** map *named* Tailwind radius utilities
> to px, so an off-scale named class can **pass the deterministic check**. Until a
> Tailwind-class→value resolver lands, treat off-scale named radius utilities as an
> evaluator-judged item, not a covered-by-gate one — and do not report TOK-3 as
> "mechanically clean" for a Tailwind product without eyeballing the named classes.
> The same blind spot applies to TYP-3 (named size utilities) and TOK-2 (named
> spacing utilities).

**Peer-consistency (evaluator-judged — no cross-element static check):** there is no
script that compares two different elements' radii. The evaluator compares peer
containers visible in the screenshots against the active product's Card/base-radius
anchor.

## Evaluator guidance

**Flag:** peer cards, sections, or tiles on the same surface that use visibly
different corner radii without a deliberate hierarchy purpose.

**Do not flag:** a deliberately different radius that signals a different element
*class* — e.g. a full-bleed hero image (no radius or `rounded-none`) beside inset
cards (standard card radius). Hierarchy is a reason; unexplained drift is not.
