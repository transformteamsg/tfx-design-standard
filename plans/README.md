# Implementation Plans

Advisor ledger for the **Foundations rebuild** (improve skill, 2026-07-16/17).
This is the site-side advisor ledger; it is separate from `harness/plans/`
(the harness's own plan set). Scope: rebuild the Foundations section around
rendered specimens (Astryx-style), add brand icons + Usage/Best-practices, slim
the Tokens page, then integrate onto `origin/main`'s Tailwind type-scale ratchet.

All plans below are executed, reviewed, and **merged to `main`**.

## Status

| Plan | Title | Status |
|------|-------|--------|
| 001 | Rebuild the Colour foundations page around rendered Radix specimens | DONE — merged (`c519230`) |
| 002 | Rendered specimens on Typography, Spacing & radius, Iconography | DONE — merged (`c519230`) |
| 003 | /foundations/tokens all-tokens reference page | DONE — merged (`c519230`) |
| 004 | Surface the brand (ink) icon set beside Lucide on Iconography | DONE — in the `007` integration |
| 005 | Usage code blocks + Best-practices (Do/Don't) on all Foundations pages | DONE — in the `007` integration |
| 006 | Slim /foundations/tokens to a dense reference | DONE — in the `007` integration |
| 007 | Integrate the rebuild onto origin/main's Tailwind type-scale ratchet | DONE — merged (`35b4493`) |

## The 007 reconciliation (2026-07-17)

Mid-work, `origin/main` advanced 24 commits from a parallel line, including a
**type-scale ratchet**: TYP-2/TYP-3 now bind to the Tailwind default scale
`{128,96,72,60,48,36,30,24,20,18,16,14,12}`, enforced by
`harness/checks/type-scan.py` (prebuild + CI), with named utilities only (no
arbitrary `text-[Npx]`). Plan 007 merged the 001–006 rebuild onto that base and
adapted it: adopted origin's scale (H1 30, Display 96/72/60/48, Caption/Label
12; dropped the old 32px H1, 120px display, 11px label), converted every
`text-[Npx]` to a named utility, and rendered the `TypeScale` specimen via
named utilities so `type-scan` passes.

One standards decision surfaced and was deferred, not forced: code blocks want
monospace, but TYP-1 sanctions only Plus Jakarta Sans / Inter. Rather than edit
the checker (that's `harness/plans/045-resolve-font-mono-typ1-gap.md`'s job),
the CodeBlock renders code in the body font, matching how `origin` already
renders all code. Revisit if plan 045 sanctions a mono face.

## Decisions taken by the maintainer

- Products section: keep, but sharpen (colour facts live once on Colour).
- All-tokens reference page: yes (001–003), then slimmed to a dense reference (006).
- Usage + Best-practices treatment: roll across all five Foundations pages (005).
- Reconcile with origin: integrate — adopt origin's Tailwind type scale (007).

## Findings considered and rejected

- Dark-mode token pairs: the site is deliberately light-only. Revisit only if the standard adopts dark mode.
- Elevation/shadow token section: no shadow token set exists; adding one is a standards decision, not a docs task.
- Sanctioning a monospace code face now: deferred to `harness/plans/045` (owned by the parallel line).
