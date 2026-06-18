# Plan 024: Onboarding leads with the explanation and routes by run-shape

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 5f95350..HEAD -- harness/.claude/skills/tfx-design-onboarding/SKILL.md`.
> If the onboarding skill changed since this plan was written, compare against
> the "Current state" excerpts before proceeding; on a mismatch, STOP. Paths are
> relative to the harness root (`harness/`), where `python3 checks/...` and
> `claude plugin validate .` are run.

## Status

- **Priority**: P2 (harness-lead direction, GitHub issue #5 / HF-17)
- **Effort**: S
- **Risk**: LOW (skill-prose reorder; no code, no catalog change)
- **Depends on**: none (revises the output of plan 022, which is DONE)
- **Category**: dx
- **Planned at**: commit `5f95350`, 2026-06-17

## Why this matters

HF-17 (issue #5): the onboarding tour `tfx-design-onboarding` opens with a **flat
5-skill menu** (added by plan 022) and gates the orientation behind a skill choice.
A first-timer is asked to pick a tool before they have been told what the harness is
or how a run is shaped. The harness lead's ask: **lead with the explanation**, then
ask **one** question that routes by **run-shape**, not by skill name:

1. review & redesign an existing page (the full loop),
2. a new page / feature from the user's intent and goal (the full loop),
3. a single, focused run — then drill into the dedicated flows
   (`tfx-content-style`, `tfx-design-standards`) instead of listing them flat.

This orients from *what the person is trying to do* (the run-shape they already have
in mind) rather than from a menu of tools they can't yet choose between. It keeps the
skill's ethos — orient briefly, ask before explaining, hand off — and still lands
most first-timers in `tfx-design-ui` for a real run.

## Current state

- `.claude/skills/tfx-design-onboarding/SKILL.md` — the whole skill is ~74 lines.
  The run sequence is "one step at a time, wait for the reply". Two blocks change.
- **Block A — step 1 (lines 17–39), the flat menu + skill-keyed routing** (this is
  what plan 022 produced; HF-17 replaces it):
  ```
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
- **Block B — step 2 (lines 41–53), the orientation that currently comes *after*
  the menu** (HF-17 moves this *before* the routing question, so the explanation
  leads):
  ```
  **2. Orientation — the gist, not the manual.** A few lines only; for depth, point to the
  canonical source rather than reproducing it here (reproduced text drifts):

  - **The one promise: intent without loss.** What they mean is written down as a contract
    in phase 1 and graded against at every later phase.
  - **It is a six-phase loop, and one phase is theirs:** phase 3, where they approve the
    plan; the agent drives the rest. The full procedure lives in the `tfx-design-ui` skill
    — send them there for phase detail instead of restating it.
  - **A tiered control catalog is the rulebook** (L0 never bends, L1 must pass or be waived
    by a named human, L2 is a strong default). They never memorise it; the agent loads and
    applies it. Mechanics and waivers live in `tfx-design-standards`.

  That is enough to start. Resist giving more — the loop itself is the lesson.
  ```
- **Unchanged blocks** (do NOT edit beyond renumbering their step labels if needed):
  step "3. Hand off to a real run" (lines 55–59), step "4. Close" (lines 61–64),
  and "## Stay honest" (lines 66–74). The hand-off step already invokes
  `tfx-design-ui`; it remains the destination for run-shapes (1) and (2).
- `harness/CLAUDE.md` "## Where things live" table is the existing task→skill mapping
  and a good cross-check for the routing destinations (do not edit it).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` (run from harness root) |
| **Edit landed** (load-bearing — 0 pre-edit) | `grep -ic "run-shape\|existing page\|new page\|single run" .claude/skills/tfx-design-onboarding/SKILL.md` | ≥ 3 — this string is **absent before the edit**, so it is the real proof the rewrite happened |
| **Lead text present** (load-bearing — 0 pre-edit) | `grep -ic "Lead with what the harness is\|before any question" .claude/skills/tfx-design-onboarding/SKILL.md` | ≥ 1 — absent before the edit |
| Orientation survived the reorder (GUARD ONLY — returns 3 pre-edit) | `grep -c "intent without loss\|six-phase\|tiered control catalog" .claude/skills/tfx-design-onboarding/SKILL.md` | ≥ 2 — *unchanged* by the move; confirms you didn't drop the orientation, does NOT prove the rewrite |
| Drill-down names survived (GUARD ONLY — returns 5 pre-edit) | `grep -c "tfx-content-style\|tfx-design-standards" .claude/skills/tfx-design-onboarding/SKILL.md` | ≥ 2 — confirms you didn't delete the names, does NOT prove the flat menu was replaced |

## Scope

**In scope** (the only file you modify):
- `.claude/skills/tfx-design-onboarding/SKILL.md` — reorder so the orientation
  (Block B) leads, then a single run-shape routing question replaces the flat menu
  (Block A).

**Out of scope** (do NOT touch):
- Any other skill, the catalog, the evaluator agent, `harness/CLAUDE.md`, or
  `docs/ONBOARDING.md`.
- The "Hand off", "Close", and "Stay honest" sections — keep their intent and wording;
  only renumber step labels if your reorder changes the numbering.
- Do not delete the skill names entirely — run-shape (3) still drills into
  `tfx-content-style` / `tfx-design-standards` by name; the change is that they are
  no longer the *primary* menu.

## Git workflow

- Branch: `advisor/024-onboarding-runshape`. Conventional commits
  (`docs: onboarding leads with explanation and routes by run-shape (HF-17)`).
  Do NOT push or open a PR unless the operator instructs it.

## Steps

### Step 1: Lead with the explanation, then route by run-shape

In `.claude/skills/tfx-design-onboarding/SKILL.md`, restructure the
"## Run it in order" sequence so step 1 is the orientation (moved up from the current
step 2) and step 2 is a single run-shape routing question (replacing the flat menu).
Target shape — keep it tight, this is orientation, not a manual:

```markdown
**1. Lead with what the harness is — the gist, not the manual.** A few lines, before
any question; for depth, point to the canonical source rather than reproducing it
here (reproduced text drifts):

- **The one promise: intent without loss.** What they mean is written down as a
  contract in phase 1 and graded against at every later phase.
- **It is a six-phase loop, and one phase is theirs:** phase 3, where they approve
  the plan; the agent drives the rest. The full procedure lives in `tfx-design-ui`.
- **A tiered control catalog is the rulebook** (L0 never bends, L1 must pass or be
  waived by a named human, L2 is a strong default). They never memorise it; the
  agent loads and applies it. Mechanics and waivers live in `tfx-design-standards`.

**2. Route by run-shape — one question.** Ask what they want to do, framed by the
shape of the run, not a list of tools:

- **(1) Review and redesign an existing page** — critique the current surface, then
  improve it through the full loop → start `tfx-design-ui` (it captures the page and
  critiques it before Phase 1). Go to step 3.
- **(2) A new page or feature, from your intent and goal** — the full loop from a
  blank start → start `tfx-design-ui`. Go to step 3.
- **(3) A single, focused run** — not a full page. Ask which:
  - write or review UI copy only → hand off to `tfx-content-style` and stop.
  - a catalog or waiver question (can I waive this? who approves?) → hand off to
    `tfx-design-standards` and stop.

If they ask to **set up a product repo to use the harness**, that is the wrong tool:
point them to the team onboarding guide (`../../../docs/ONBOARDING.md`, relative to
this SKILL.md) and stop. (The grader, `tfx-design-evaluator`, is an agent the loop
spawns at verify — not something they run; mention it only if asked.)
```

Then renumber the existing "Hand off" / "Close" steps to **3** and **4** if they are
not already, so the sequence reads 1→2→3→4.

**Verify**: the four greps in the Commands table return their expected counts.

### Step 2: Confirm the rest of the skill still reads coherently

Read the (renumbered) hand-off, close, and "## Stay honest" sections. Confirm:
run-shapes (1) and (2) both reach the `tfx-design-ui` hand-off in step 3; the
single-run drill-downs and the repo-setup redirect do not duplicate or contradict
later steps; the `tfx-design-evaluator` is still marked as not-a-skill-you-run.

**Verify**: `claude plugin validate .` → passes.

## Test plan

No code/tests. Gates: `claude plugin validate .` passes; the four grep checks; a
read-through confirming (a) the explanation now precedes the question, (b) the
question routes by run-shape with the single-run case drilling into the two
dedicated flows, (c) `tfx-design-ui` remains the destination for both full-loop
shapes, (d) Singapore English and no AI-writing tells (SLP-9 binds this prose).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] **(load-bearing, 0 pre-edit — the real proof)** `grep -ic "run-shape\|existing page\|new page\|single run" .claude/skills/tfx-design-onboarding/SKILL.md` → ≥ 3
- [ ] **(load-bearing, 0 pre-edit)** `grep -ic "Lead with what the harness is\|before any question" .claude/skills/tfx-design-onboarding/SKILL.md` → ≥ 1
- [ ] (guard only — returns 3 pre-edit; proves you didn't drop the orientation, NOT that you rewrote) `grep -c "intent without loss\|six-phase\|tiered control catalog" .claude/skills/tfx-design-onboarding/SKILL.md` → ≥ 2
- [ ] (guard only — returns 5 pre-edit; proves you didn't delete the names) `grep -c "tfx-content-style\|tfx-design-standards" .claude/skills/tfx-design-onboarding/SKILL.md` → ≥ 2
- [ ] The orientation block appears *before* the routing question (read-through)
- [ ] `claude plugin validate .` passes
- [ ] Only `tfx-design-onboarding/SKILL.md` modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- Block A or Block B differs from the "Current state" excerpt (drift) — the structure
  may have moved; reconcile against the live file before reordering.
- The set of harness skills changed since this plan was written (a skill added or
  removed under `.claude/skills/`) — the run-shape (3) drill-down names a specific
  pair; reconcile to the live set.

## Maintenance notes

- This supersedes plan 022's step-1 menu. If a future change re-introduces a flat
  skill menu, check it against HF-17 first — the run-shape framing is the decided form.
- The skill names in run-shape (3) are a hand-maintained reference; the sources of
  truth are each skill's `description:` frontmatter and `harness/CLAUDE.md`
  "Where things live". Update here if the skill set changes.
- A reviewer should confirm the tour still hands a first-timer to a *real run*
  quickly (the loop is the lesson) rather than lecturing.
