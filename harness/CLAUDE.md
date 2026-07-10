# Design Harness — project memory

This repo is the **TFX design harness**: the control catalog plus Claude Code skills
that make an agent follow the TFX Design Standard (TFX-DS) when designing or changing
UI for the Teacher & School portfolio (Teacher Workspace, CaseSync, Glow, TW
surfaces). These facts apply to every session, whether or not the full design loop is
triggered.

## Always-on rules

- **TFX-DS is the normative source**; `standards/catalog.yaml` carries its standards
  tier. WCAG 2.2 AA is the self-imposed accessibility floor; SGDS, GOV.UK, and
  Apple's HIG design principles are reference points, not rules. Consult the catalog for any design or content change —
  "just a small change" is still in scope.
- **Brand essence is Kind Utility** — useful first, kind at the surface. The one
  test: does this help teachers work faster with less stress? If not, don't build it.
- **The stack is fixed and boring on purpose**: Base UI components, Radix Colors,
  shadcn/ui default tokens. Plus Jakarta Sans (600) display, Inter (400/500/600)
  body. Each product's **own** primary for primary actions and brand moments (TW →
  T&S Blue `#0064FF`; Glow → orange; CaseSync → indigo; COL-1).
  Semantic tokens only — never raw colour/spacing/radius values (TOK-1..3).
<!-- tfx-sync:L0 source=catalog -->
- **Non-negotiables (L0) that bind even outside the loop**: AA contrast (A11Y-1),
  keyboard reach + visible focus (A11Y-2), visible labels on every field (A11Y-3),
  destructive actions show consequences and offer undo/confirm (CMP-2).
<!-- /tfx-sync:L0 -->
- **Anti-slop is standard, not taste** (SLP-1..11; SLP-1..10 consolidated from the
  TFX-DS site catalog 2026-06-11, SLP-11 added 2026-06-17): no purple/violet gradient
  palettes, gradient text, side-tab card borders, nested cards, identical-card grids,
  cards around static content, flat type hierarchy, uniform spacing, bounce easing,
  buzzword copy, or multi-section modals.
- **Never edit the catalog to make a failing check pass.** Propose changes via the
  ratchet (lightweight PR + design-lead approval).
- **`checks/` scripts enforce only a static subset of the deterministic controls, and
  not every control has a script yet.** Never report an unbuilt or un-run check as
  "passed"; say "verified manually" or "unverified" and name what a human should
  re-check. Full statement and per-script coverage: `checks/README.md`.
- Waiver syntax: `dxd-waive <CTL-ID> reason="..."` (legacy `tfx-waive` markers remain
  valid) — L0 never, L1 needs a named human approver, L2 needs a specific real reason.
- Singapore English spelling (British base): organise, colour, centre.

## Where things live

| Task | Use |
|---|---|
| Orient, check the machine/repo, and route to the right skill | `start` skill (user-invoked: `/tfx:start`) |
| Create a page / form / flow, or make a named change to one | `design` skill (runs the loop) |
| Review, improve, or polish an existing page (no specific change named) | `critique` skill (evaluate → gated fixes) |
| Improve one named dimension of an existing page | a focused pass — `copy` · `polish` · `motion` · `flow` · `layout` (each captures → ranks → gates → verifies) |
| Write or review UI copy (only) | `copy` skill (TFX voice & tone) |
| Read, filter, apply, or grow the catalog; any waiver question | `standards` skill |
| Grade a finished design | `evaluator` subagent (its agent definition carries the review procedure) |
| Set up a machine for the harness, or onboard a new user | `setup` skill (per-user tools + context) |
| Report harness friction/feedback | `feedback` skill (files the GitHub issue) |

Architecture and roadmap: `README.md`. Control format: `standards/README.md`.
TFX-DS source: https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
The generator never grades its own work — grading goes to the `evaluator`
subagent, a rigorous second read on the same model, not a fully independent one.
