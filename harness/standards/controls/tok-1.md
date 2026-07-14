---
id: TOK-1
source: TFX-DS
title: UI code contains no raw colour values — active semantic colour tokens only
tier: L1
check: deterministic
phase: [implement, verify]
applies_to: [page, component]
verify: "Scan changed files for raw hex/rgb/hsl; checks/token-audit; exit 1 on violation"
waiver: documented
enforced: script
script: checks/token-audit.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Reference colour only through the active product/domain semantic tokens. No raw hex,
rgb, hsl, or named colours in UI code. Functional colours resolve through declared
success/warning/danger/info roles (COL-2); brand moments resolve through the active
product's primary role (COL-1) — always through tokens, never literals.

## Rationale

This control stops inter-session drift: each generation must reuse the product's
declared semantic vocabulary instead of inventing a slightly different value. The
concrete token convention belongs to the active profile; the behavioural requirement
is shared by every domain.

## Passes when

- All colour in changed files resolves through the token layer
  (`var(--...)` / token-mapped utility classes).
- A genuinely missing token is raised as a finding in the plan, not improvised inline.

## Fails when

- A hex, rgb, hsl, oklch, or named-colour literal appears in component code — even
  when the value happens to equal a token.
- Tailwind palette utilities bypass the semantic layer (`bg-blue-600` instead of the
  mapped semantic class/variable).
- Functional states use ad-hoc colours instead of the declared semantic roles.

## How to verify

Run `checks/token-audit.py <path>…`; it scans changed files for raw colour patterns
and exits 1 with file/line evidence. The scan proves token use, not whether a token
has the correct semantic role; verify that role under COL-1/COL-2. Waiver:
`documented` — named approver in the decision record.
