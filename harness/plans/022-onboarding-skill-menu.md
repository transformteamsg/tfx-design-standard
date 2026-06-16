# Plan 022: Onboarding lists every harness skill with a one-line explanation and asks which to run first

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/.claude/skills/tfx-design-onboarding/SKILL.md`.
> If the onboarding skill changed since this plan was written, compare against
> the "Current state" excerpts before proceeding; on a mismatch, STOP. Paths are
> relative to the harness root.

## Status

- **Priority**: P2 (direct user direction from the harness lead)
- **Effort**: S
- **Risk**: LOW (skill-prose addition; no code, no catalog change)
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

The onboarding tour orients a newcomer by the harness's *promise* (intent without
loss), the *six-phase loop*, and the *control catalog* — but it never shows them
the actual **menu of skills** available, nor asks **which one they want to run
first**. A new user can't choose from a surface they can't see. The harness lead's
direction: onboarding should **list every available skill with a one-line
explanation** and **ask the user which to run first**, so orientation starts from
the real set of tools, not an abstraction. This stays within the skill's ethos
(orient briefly, ask before explaining, hand off) — the list *is* the menu for the
ask, not a lecture.

## Current state

- `.claude/skills/tfx-design-onboarding/SKILL.md:15-23` — step 1 "Place them"
  asks one routing question (design now / understand first / set up a product
  repo) but **lists no skills and does not ask which skill to run first**:
  ```
  **1. Place them.** Ask one question: are they here to (a) design or change a
  page now, (b) understand how the harness works first, or (c) set up a product
  repo to use it?
  ```
- The user-facing harness skills and their one-line purposes (source the wording
  from each skill's own `description:` frontmatter so it does not drift; do NOT
  invent new descriptions):
  - **tfx-design-ui** — design or change a page / screen / form / flow / component
    (the full loop: intent → diverge → plan → implement → verify). The usual
    starting point.
  - **tfx-content-style** — write or review UI copy only (voice & tone, error-
    message anatomy, naming, anti-AI-writing tells / SLP-9). Enough on its own for
    copy-only edits.
  - **tfx-design-standards** — read, filter, apply, or grow the control catalog;
    waiver questions ("can I waive TOK-1?", who approves, what a tier allows).
  - **tfx-design-onboarding** — this guided tour (the one they're in).
  - **tfx-design-evaluator** (an *agent*, following the `tfx-design-review`
    skill) — grades a finished design; the loop spawns it at the verify phase.
    **Not a skill the user runs directly** — say so, to stay honest.
- `harness/CLAUDE.md` "## Where things live" table is the existing
  task→skill mapping and a good cross-check for the one-liners.
- The skill's "## Stay honest" section (`:50-57`) — the list must respect it: no
  overselling, mark `tfx-design-review`/evaluator as not-user-run, SLP-9 binds the
  prose, second person, Singapore English.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` (run from harness root) |
| Skill menu present | `grep -c "tfx-content-style\|tfx-design-standards" .claude/skills/tfx-design-onboarding/SKILL.md` | ≥ 2 |
| "Run first" ask present | `grep -c "run first\|start with" .claude/skills/tfx-design-onboarding/SKILL.md` | ≥ 1 |

## Scope

**In scope** (the only file you modify):
- `.claude/skills/tfx-design-onboarding/SKILL.md` — add the skill menu to step 1
  (or as a short step before it) and reframe the placement question to ask which
  skill to run first.

**Out of scope** (do NOT touch):
- Any other skill, the catalog, the evaluator agent, or `harness/CLAUDE.md`.
- The skill's "Orientation" (step 2), "Hand off" (step 3), "Close" (step 4), and
  "Stay honest" sections — leave their intent; you only add the menu + reframe the
  step-1 question.
- Do not auto-generate the list — it is a hand-maintained mirror (see Maintenance).

## Git workflow

- Branch: `advisor/022-onboarding-menu`. Conventional commits
  (`docs: onboarding lists all harness skills and asks which to run first`).
  Do NOT push.

## Steps

### Step 1: Add the skill menu and reframe the placement question

In `.claude/skills/tfx-design-onboarding/SKILL.md`, replace the step-1 block
(`:17-23`) so it (a) presents the menu, then (b) asks which to run first while
keeping the existing routing. Target shape (keep it tight — a menu, not a manual):

```markdown
**1. Show the menu, then place them.** First show what the harness offers, then
ask which they want to run first — most first-timers pick `tfx-design-ui` and
learn by doing.

The harness skills:

- **tfx-design-ui** — design or change a page, screen, form, flow, or component
  (the full loop). The usual starting point.
- **tfx-content-style** — write or review UI copy only (voice & tone, error
  messages, naming, anti-AI-writing). Enough on its own for copy-only edits.
- **tfx-design-standards** — read, filter, apply, or grow the control catalog;
  waiver questions (can I waive this? who approves?).
- **tfx-design-onboarding** — this guided tour (you're in it).
- **tfx-design-evaluator** — the grader (an agent, not a skill you run); the loop
  spawns it at the verify phase to review a finished design.

Then ask one question — which would they like to run first? Route the answer:
- "design or change a page" / picks `tfx-design-ui` → go to step 3.
- "understand the harness first" → give the step-2 orientation, then step 3.
- "write/review copy" → hand off to `tfx-content-style` and stop.
- "catalog / waiver question" → hand off to `tfx-design-standards` and stop.
- "set up a product repo" → wrong tool: point to the team onboarding guide
  (`../../../docs/ONBOARDING.md`, relative to this SKILL.md) and stop.
```

Keep the menu one line per skill; do not expand into phase detail here (that is
step 2 / the `tfx-design-ui` skill).

**Verify**: the two greps in the Commands table → `tfx-content-style|tfx-design-standards`
≥ 2; `run first|start with` ≥ 1.

### Step 2: Confirm the rest of the skill still reads coherently

Read steps 2–4 and "Stay honest" — confirm the reframed step 1 still flows into
them (step 3 hand-off to `tfx-design-ui` is still reachable; the (c)/repo-setup
and copy/standards hand-offs don't duplicate or contradict later steps).

**Verify**: `claude plugin validate .` → passes.

## Test plan

No code/tests. Gates: `claude plugin validate .` passes; the two grep checks; a
read-through confirming the menu is concise (one line per skill), marks
`tfx-design-evaluator` as not-user-run, and the placement routing still lands new
users in `tfx-design-ui` for a real run.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "tfx-content-style\|tfx-design-standards" .claude/skills/tfx-design-onboarding/SKILL.md` → ≥ 2
- [ ] `grep -c "tfx-design-ui" .claude/skills/tfx-design-onboarding/SKILL.md` → ≥ 1
- [ ] `grep -c "run first\|start with" .claude/skills/tfx-design-onboarding/SKILL.md` → ≥ 1
- [ ] `tfx-design-evaluator` is named and marked not-a-skill-you-run
- [ ] `claude plugin validate .` passes
- [ ] Only `tfx-design-onboarding/SKILL.md` modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- The step-1 block differs from the "Current state" excerpt (drift) — the menu's
  insertion point may have moved.
- The set of harness skills has changed since this plan was written (a skill added
  or removed under `.claude/skills/`) — list the live set and reconcile the menu
  to it rather than copying the excerpt blindly.

## Maintenance notes

- This menu is a **hand-maintained mirror** of the skill set — it will drift if a
  skill is added, removed, or renamed. The sources of truth are each skill's own
  `description:` frontmatter and `harness/CLAUDE.md` "Where things live" table;
  when the skill set changes, update this list (and consider whether onboarding
  should point at that table instead of restating it, to cut the drift risk).
- Keep one-liners sourced from the skills' descriptions, not freshly written, so
  the tour and the skills agree.
