# Scope dimensions added: products and audiences (structural, no control semantics changed)

**Date:** 2026-07-03 · **Change type:** structural — two optional per-control scope
fields plus meta display maps; no control added, removed, or reworded · **Path:**
normal PR with design-lead review, operator-directed (plan 056). Not a control
ratchet: no control's semantics changed, so the propose-only gate does not apply.

## What changed

- `standards/schema.json` gains two allowed-value lists: `products`
  (`tw | casesync | glow`) and `audiences`
  (`teachers | students-primary | students-secondary | parents`).
- Controls may now carry optional `products:` / `audiences:` fields — a non-empty
  subset of the allowed values. **Absent field = global** (all products / all
  audiences); an empty list is a validation error (omit the field instead).
- `standards/catalog.yaml` meta block gains `products` and `audiences` display-name
  maps (mirroring `categories`); `meta.updated` → 2026-07-03. TW-adjacent surfaces
  (Posts, PG Staff Portal) count as `tw`, matching the content skill's tone table.
- Both validators (`checks/validate.py`, the website's
  `scripts/check-standards.mjs`) enforce list / non-empty / subset; semantics are
  documented in `standards/README.md` §Scope; the `standards` and `design` skills
  filter by scope (audience defaults to teachers at the intent phase when
  unstated); the website projects and renders the fields.

## Why

Operator direction (2026-07-03): restructure the catalog taxonomy into global
standards, per-product standards (including branding), and per-audience standards —
teachers, students, parents — with students split by age band (`students-primary` =
primary school; `students-secondary` = secondary school and up). Teacher surfaces
are the only live ones today, but student- and parent-facing surfaces are planned,
so audience is a live filter in the design loop, not dormant metadata. The operator
confirmed the structure: one `catalog.yaml` with scope fields as data on each
control, not split files — the single file is load-bearing (served raw by the
website, resolved by relative path in the installed plugin, parsed by 12 consumers).

## Classification outcome

The outcome: **all 48 existing controls remain global — no scope fields were added
to any of them.** Rationale (recorded so it is not re-litigated): stamping
`audiences: [teachers]` onto the existing set would *exempt* future student and
parent surfaces from the accessibility floor, anti-slop, and tokens — the opposite
of safe. The safety net travels to every audience by default; scoping is opt-in per
control, used only when a control genuinely binds one product or audience.

## First consumer

Plan 057 (per-product branding controls, extending the existing IDN category) is
the first authoring consumer of the fields, behind the ratchet's design-lead gate.
