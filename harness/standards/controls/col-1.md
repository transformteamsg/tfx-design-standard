---
id: COL-1
source: TFX-DS
title: Primary actions and brand moments use the product's own primary brand colour (or its ramp)
tier: L1
check: deterministic
phase: [implement, verify]
applies_to: [page, component]
verify: "Primary action / brand-moment colours resolve to the active product's primary token or its ramp (see controls/col-1.md for the per-product table)"
waiver: documented
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Each product anchors its primary actions and brand moments in its **own** primary
brand colour and that colour's ramp. Do not import another product's primary for
emphasis on a different product's surface. The active product is established in
Phase 1 of the design-ui loop.

## Per-product primary

| Product | Primary | Token | Value |
|---|---|---|---|
| Teacher Workspace | Teacher & School Blue | `--tw-blue` | `#0064FF` |
| CaseSync | Radix indigo-9 | `--casesync` | `#3E63DD` (proposed) |
| Glow | Radix orange-9 | `--glow` | `#F76B15` (proposed) |
| TW surfaces (Posts / PG Staff Portal) | Teacher & School Blue | `--tw-blue` | `#0064FF` |

The "(proposed)" marker mirrors `app/globals.css:14-15`; replace with the confirmed
value when the design lead settles it.

## Rationale

The portfolio is **independent products**: Glow's primary is orange, CaseSync's is
indigo. As written before this plan, COL-1 pointed every product at Teacher & School
Blue — a rule that would mark a correct Glow orange CTA as a violation. The
correction: each product's primary is its own brand colour. Teachers recognise a
product partly by its colour; forcing a single blue across the portfolio erases that
identity and mis-grades correct work.

## How to verify

**Deterministic half:** the active product's primary CTA and brand-moment colours
resolve to that product's primary token (not a raw hex bypassing the token layer).
The `checks/token-audit` allowlist already knows the product's `--color-*` names
from its CSS — see plan 011 for the project-token-aware mechanism.

**Judgment half:** the evaluator confirms no *other* product's primary appears for
emphasis on the surface. For example, Glow's orange appearing on a Teacher Workspace
screen for a brand-moment is a finding; Teacher & School Blue appearing on a Glow
CTA is a finding.
