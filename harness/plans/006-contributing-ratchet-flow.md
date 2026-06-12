# Plan 006: Write CONTRIBUTING.md — the ratchet-PR workflow for growing the catalog

> **Executor instructions**: Follow step by step; honor STOP conditions; update
> your row in `plans/README.md` when done.
>
> **Drift check (run first)**: confirm git exists (`git log --oneline -1`
> succeeds — plan 001). Confirm the "Growing the catalog" section exists in
> `.claude/skills/design-standards/SKILL.md`. Mismatch → STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-git-init-and-install-docs.md
- **Category**: dx
- **Planned at**: `no-git (pre-init)`, 2026-06-10

## Why this matters

The harness's governance promise is "the catalog only grows through the
ratchet — new controls enter by lightweight PR with design-lead approval." The
*content* rules exist (in the `design-standards` skill) but the *workflow* does
not: no branch convention, no PR template, no statement of who approves, no
escalation. A team that hits a real defect and wants to propose a control will
stall on procedure — and procedural stalls kill ratchets.

## Current state

- `.claude/skills/design-standards/SKILL.md`, section "## Growing the catalog
  (the ratchet)" — defines WHEN to propose (defect no control covers,
  recurring waivers, standard updates) and WHAT a proposal is ("a draft detail
  file in `standards/controls/` following the format spec, with the triggering
  incident described under Rationale … New controls enter by lightweight PR
  with design-lead approval … The bar for L0/L1 is high; the bar for L2 is
  evidence. Citizen-service patterns … enter only via ratchet evidence").
- `standards/README.md` — the control format spec (schema, tiers, authoring
  rules incl. "One control = one verifiable statement" and the category
  prefixes A11Y/TOK/TYP/COL/CMP/CNT/MOT/IDN).
- No `CONTRIBUTING.md`, no `.github/` directory, no named design lead anywhere
  in the repo.
- Validator (if plan 002 landed): `python3 checks/validate.py` is the
  mechanical gate a proposal must pass.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Validator | `python3 checks/validate.py` | OK (run if it exists) |
| Plugin valid | `claude plugin validate .` | passes |

## Scope

**In scope**:
- `CONTRIBUTING.md` (create, repo root)
- `README.md` — one link line (in or near the Status & roadmap section)

**Out of scope**:
- `.github/PULL_REQUEST_TEMPLATE.md` — defer until a GitHub remote exists; the
  PR template lives INSIDE CONTRIBUTING.md as a copy-paste block for now.
- Changing the ratchet rules themselves (the skill stays authoritative for
  content; CONTRIBUTING covers process only).
- Naming the actual design lead (organizational fact the operator must supply —
  use a clearly-marked placeholder).

## Git workflow

Branch `advisor/006-contributing`; conventional commits; do NOT push.

## Steps

### Step 1: Write `CONTRIBUTING.md`

Sections, in order:

1. **What can be contributed** — controls (via ratchet), guideline/skill edits,
   check scripts. One line each; controls are the main path.
2. **The ratchet rule** — restate in two sentences and LINK to the
   `design-standards` skill section as authoritative (do not duplicate its
   lists): evidence in, rule out; if you can't check it, it's not a standard.
3. **Proposing a control — the workflow**:
   - Branch: `catalog/<id-slug>` e.g. `catalog/cmp-4-bulk-actions`.
   - The change: one new detail file in `standards/controls/` (format per
     `standards/README.md`) + its catalog entry + nothing else.
   - Gate: `python3 checks/validate.py` passes (if built).
   - PR body: copy the template block (below) — triggering incident, proposed
     tier with justification against "the bar for L0/L1 is high, the bar for
     L2 is evidence", and the verification story.
   - Approval: design lead (placeholder: `<DESIGN_LEAD — to be named>`)
     approves or rejects with reason; rejected proposals are recorded in the
     PR, not deleted from history.
4. **PR template block** (fenced markdown the contributor copies):
   `## Triggering incident` / `## Proposed control (id, tier, check)` /
   `## How it's verified` / `## Why this tier` / `## Evidence`.
5. **Waiver registry note** — L1 waivers live in decision records today;
   recurring waivers (≥2 for the same control in a quarter) should arrive here
   as a proposal to fix the standard or add an exception clause.
6. **Skill/doc edits** — same PR flow, no template; flag anything that changes
   normative meaning for design-lead review.

**Verify**: `grep -cE "^## " CONTRIBUTING.md` → ≥ 5;
`grep -c "catalog/" CONTRIBUTING.md` → ≥ 1;
`grep -c "DESIGN_LEAD" CONTRIBUTING.md` → ≥ 1.

### Step 2: Link from README

Append to the Status & roadmap section:
`Proposing a control or change? See [CONTRIBUTING.md](CONTRIBUTING.md).`

**Verify**: `grep -c "CONTRIBUTING.md" README.md` → 1.

## Test plan

Read-through: a contributor with a defect in hand can go from "I found
something no control covers" to an open PR using only CONTRIBUTING.md and the
two files it links. Every step has a concrete action; no step requires asking
"who do I talk to" except the explicitly-marked design-lead placeholder.

## Done criteria

- [ ] `CONTRIBUTING.md` exists with the six sections
- [ ] PR template block present and copy-pasteable (valid markdown when extracted)
- [ ] README links to it
- [ ] `claude plugin validate .` passes; validator passes if built
- [ ] `plans/README.md` updated

## STOP conditions

- `design-standards` skill no longer contains "Growing the catalog" (drift).
- You're tempted to move normative ratchet rules INTO CONTRIBUTING.md —
  process here, content in the skill; duplication is the failure mode this
  repo keeps fighting. STOP and re-read step 1.2.

## Maintenance notes

- When a GitHub remote exists: extract the PR template block to
  `.github/PULL_REQUEST_TEMPLATE.md` and replace the block with a pointer.
- Replace `<DESIGN_LEAD — to be named>` the moment the role is assigned;
  CONTRIBUTING with a placeholder approver is a known temporary state, not done.
