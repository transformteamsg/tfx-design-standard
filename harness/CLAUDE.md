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
  body. Teacher & School Blue `#0064FF` for primary actions and brand moments.
  Semantic tokens only — never raw colour/spacing/radius values (TOK-1..3).
- **Non-negotiables (L0) that bind even outside the loop**: AA contrast (A11Y-1),
  keyboard reach + visible focus (A11Y-2), visible labels on every field (A11Y-3),
  destructive actions show consequences and offer undo/confirm (CMP-2).
- **Anti-slop is standard, not taste** (SLP-1..10, consolidated from the TFX-DS
  site catalog 2026-06-11): no purple/violet gradient palettes, gradient text,
  side-tab card borders, nested cards, identical-card grids, flat type hierarchy,
  uniform spacing, bounce easing, buzzword copy, or multi-section modals.
- **Never edit the catalog to make a failing check pass.** Propose changes via the
  ratchet (lightweight PR + design-lead approval).
- Built `checks/` scripts: `validate.py` (catalog), `token-audit.py` (TOK-1..3,
  COL-1..2), `audit-record.py` (decision records). **All other deterministic
  checks are not built yet** — do not report an unbuilt check as "passed"; say
  "verified manually" or "unverified" and name what a human should re-check.
  Don't overstate enforcement.
- Waiver syntax: `tfx-waive <CTL-ID> reason="..."` — L0 never, L1 needs a named human
  approver, L2 needs a specific real reason.
- Singapore English spelling (British base): organise, colour, centre.

## Where things live

| Task | Use |
|---|---|
| Design or change a page / form / flow / component | `design-ui` skill (runs the loop) |
| Write or review UI copy (only) | `content-style` skill (TFX voice & tone) |
| Read, filter, apply, or grow the catalog | `design-standards` skill |
| Grade a finished design | `design-evaluator` subagent (follows `design-review`) |
| Onboard a new user — learn the skills and the loop | `design-onboarding` skill (guided tour) |

Architecture and roadmap: `README.md`. Control format: `standards/README.md`.
TFX-DS source: https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
The generator never grades its own work — grading goes to the `design-evaluator`
subagent, a rigorous second read on the same model, not a fully independent one.
