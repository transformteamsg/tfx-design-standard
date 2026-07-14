---
id: COL-2
source: TFX-DS
title: Functional colours use declared semantic roles, never ad-hoc values; small functional-colour text on a tint clears the 4.5:1 AA floor (A11Y-1)
tier: L1
check: deterministic
phase: [implement, verify]
applies_to: [page, component]
verify: "Success/warning/danger/info colours resolve to the active semantic tokens; small functional-colour text (≤12px) on a tint computes to at least 4.5:1 via checks/contrast or is verified manually"
waiver: documented
fails_when:
  - custom functional-colour values outside the declared semantic roles
  - red used decoratively
  - small functional-colour text (≤12px) on a tint falls below 4.5:1
enforced: partial
script: [checks/token-audit.py, checks/contrast.py]
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Functional colours — success, warning, danger, and info — resolve through the active
product/domain profile's declared semantic roles, never ad-hoc literals or palette
utilities. Small functional-colour text (≤12px) on a tinted background must compute
to at least 4.5:1 contrast. Profiles may use different colour systems and naming
conventions; the semantic roles and AA outcome are universal.

## Rationale

The triggering evidence was a small status chip whose nominal text token passed on a
plain surface but fell below AA on its tint. A semantic token name is not proof of
contrast: resolve the active tokens and measure the actual foreground/background pair.

## Passes when

- Functional colours resolve to the active semantic role tokens.
- Small functional-colour text (≤12px) on a tinted background clears 4.5:1.
- Red is reserved for danger/error, not decoration.

## Fails when

- Custom functional-colour values replace declared semantic roles.
- Red is used decoratively.
- Small functional-colour text (≤12px) on a tint falls below 4.5:1.

## Evaluator guidance

For functional chips, badges, and labels with small text on a tinted background,
resolve the active semantic tokens and compute the pair with `checks/contrast.py`, or
verify manually and record the measured ratio. This enforces A11Y-1 inside every
profile's functional palette.

## Do not flag

Semantic colour-coding itself is fine, and neutralising the colour system is never the
fix. The finding is an ad-hoc role or a measured contrast failure; choose a stronger
declared role token while keeping the semantic colour.
