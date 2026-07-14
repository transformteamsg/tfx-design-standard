---
id: COL-1
source: TFX-DS
title: Primary actions and brand moments use the product's own primary brand colour (or its ramp)
tier: L1
check: hybrid
phase: [implement, verify]
applies_to: [page, component]
verify: "Deterministic half: primary-action and brand-moment colours resolve to the active product/profile primary token or its ramp (checks/token-audit). Judgment half: the evaluator confirms the view's single primary action is the resolved product primary (dovetails CMP-5), its foreground pairing clears A11Y-1, and no other product's primary appears for emphasis; see controls/col-1.md"
waiver: documented
enforced: partial
script: checks/token-audit.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Each product anchors its primary actions and brand moments in its **own** primary
brand colour and that colour's ramp. Do not import another product's primary for
emphasis on a different product's surface. Resolve the concrete token/value from the
product's `colour.primary` override, then the selected profile's
`colour.primaries[product]`. If neither declares it, the primary is unresolved; do
not substitute another domain.

## Foreground pairing (A11Y-1)

A product's primary is often a **background** for label text, so the primary and its
paired foreground must clear A11Y-1 together. Do not assume white or dark text from
hue/token naming: resolve the actual pair and measure it. A light or mid-luminance
primary commonly needs a declared dark foreground.

## Same-hue collision (A11Y-1)

Applying COL-1 can *create* an A11Y-1 failure: when the product primary would sit on a
**same-hue field**, the button's fill can lose the 3:1 boundary against its background.
Before recolouring a primary onto a same-hue tint or splash:

- change the **container** so the button sits on a neutral / near-white surface and
  regains a measurable boundary, **or**
- keep the action neutral on that surface and record the deviation.

Never recolour a primary onto a same-hue field without re-checking the 3:1
UI-component boundary; a mechanical "make it brand" that ignores this ships an
inaccessible control.

## Rationale

Independent products can carry different primaries. Hard-coding one product's colour
into this global control would mis-grade every other profile. The rule therefore owns
the behaviour while product/domain context owns the concrete token and value.

## How to verify

**Deterministic half:** the active product's primary CTA and brand-moment colours
resolve to that product's primary token (not a raw hex bypassing the token layer).
The `checks/token-audit` allowlist already knows the product's `--color-*` names
from its CSS — see plan 011 for the project-token-aware mechanism.

**Judgment half (why this control is `hybrid`, not `deterministic`):** the colour
resolving to *a* valid token passes the mechanical half trivially — the real question
is whether the view's **single primary action** (per CMP-5) carries the product
primary, or a legitimately-tokenised *neutral* is sitting where the brand belongs. The
evaluator confirms: (1) the one primary action per view resolves to the product
primary; (2) its label/background pairing clears A11Y-1 (see Foreground pairing);
(3) no *other* product's resolved primary appears for emphasis.
