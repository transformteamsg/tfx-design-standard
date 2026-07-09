# Plan 049: Slim the design skill — progressive disclosure for the loop's phase detail, pointers instead of catalog restatements

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat c42d695..HEAD -- harness/.claude/skills/ harness/checks/validate.py harness/evals/`
> Plans 046/047/048 landing first is expected drift (fold, renames, validator
> additions). This plan uses the POST-047 names (`design` skill, etc.); if 047
> has not landed, STOP — execute 047 first.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: harness/plans/047-rename-plugin-and-skills.md (hard — paths below assume the new names)
- **Category**: tech-debt
- **Planned at**: commit `c42d695`, 2026-07-02

## Why this matters

The design skill's SKILL.md is 451 lines — near the practical ceiling for a file
that loads in full on every design run. A meaningful share of it is either
verbatim restatement of catalog controls the loop already loads (the SLP-1..8 and
A11Y-6..10 enumerations in Phase 4), or phase-local procedure that is not needed
until that phase (the ~70-line Phase 5 verify procedure, the ~27-line
existing-surface critique procedure). The skill already proved the right pattern
once: `implement-craft.md` sits beside SKILL.md and is read at Phase 4. Skill
best practice (progressive disclosure) is to keep SKILL.md the map and push
procedure to reference files loaded when reached — the same shape
impeccable.style's command suite uses (small commands, shared context files).
This plan extracts the two big procedures, replaces control restatements with
pointers, and single-sources the "never overstate enforcement" rule that today
exists in five diverging copies.

## Current state

(Line numbers are pre-046/047; locate content by heading text, not line number.)

- `harness/.claude/skills/design/SKILL.md` (formerly `tfx-design-ui`) — 451
  lines. Structure: frontmatter description → role/promise → **tfx-sync:L0
  block (~lines 18–22, parity-checked by validate.py — NEVER edit its content)**
  → Load-first note → stack → judgment lens → layout note → "New page vs.
  modification" → "### Existing surfaces: critique before you polish" (~lines
  75–101, a numbered 3-step procedure) → "A flow is not a stack of pages" →
  "What actually runs today" (~lines 124–135) → Phases 1–6. Phase 4 contains,
  among its bullets, a full SLP-1..8 enumeration (~lines 306–312: "no
  purple/violet gradient palettes ... no bounce or elastic easing (SLP-8)") and
  a full A11Y-6..10 enumeration (~lines 313–317). Phase 5 (~lines 367–435) is
  the deterministic-checks + evidence + evaluator-dispatch procedure. Phase 4
  already delegates craft detail: "Apply the ones the surface calls for **from
  `implement-craft.md`** (beside this skill)".
- `harness/.claude/skills/design/implement-craft.md` — 38 lines; the exemplar
  extraction pattern to copy.
- The "never report an unbuilt check as passed / say verified manually" rule
  appears in five places with varying wording: `harness/CLAUDE.md` (always-on
  rules), design SKILL.md ("What actually runs today"), the evaluator agent
  (post-046, in its procedure text), the onboard skill ("Stay honest" section),
  and `harness/checks/README.md`. The repo's own convention (commit 11a7c55
  "single-source built-checks") is that `checks/README.md` is the single source
  of truth for what runs.
- `harness/evals/golden/*.yaml` — three golden-task files assert loop behaviour;
  they may quote skill phrases. Check before moving text.
- `harness/checks/validate.py` [L0-SYNC] reads the design SKILL.md's tfx-sync:L0
  block — the extraction must leave that block in SKILL.md.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Validate (incl. L0/SLP9 sync) | `python3 harness/checks/validate.py` | exit 0 |
| Line count | `wc -l harness/.claude/skills/design/SKILL.md` | ≤ 320 after Step 4 |
| Golden-eval phrase check | `grep -rn "<moved phrase>" harness/evals/golden/` | run per Step 5 |
| Website build | `pnpm build` | exit 0 (only if content/ files were touched — they should NOT be) |

## Scope

**In scope**:
- `harness/.claude/skills/design/SKILL.md`
- `harness/.claude/skills/design/verify.md` (create)
- `harness/.claude/skills/design/critique.md` (create)
- The four other "verified manually" sites listed above (shorten to pointer;
  do not restructure those files otherwise)
- `harness/evals/golden/*.yaml` ONLY if Step 5 finds an asserted phrase that
  moved (update the assertion's file pointer, never its meaning)

**Out of scope** (do NOT touch):
- The tfx-sync:L0 block content and the frontmatter `description:` (routing
  text — changing it triggers a full 33-case routing sweep; this plan avoids that).
- `implement-craft.md` (already extracted, correct as is).
- `harness/standards/catalog.yaml` and all control detail files.
- The `standards`, `content`, `onboard` skills' bodies (except the one
  "verified manually" pointer edit in `onboard`).
- "A flow is not a stack of pages" — it spans phases 1/3/5 and stays in SKILL.md.

## Git workflow

- Branch: `advisor/049-slim-design-skill`
- Commit style: `refactor(harness): progressive disclosure — extract verify + critique procedures from the design skill`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extract the Phase 5 procedure to `verify.md`

Create `harness/.claude/skills/design/verify.md` containing the ENTIRE current
Phase 5 body (the ordered steps 1–4: deterministic controls, render/screenshot
evidence sets, evaluator dispatch, re-run rule) verbatim, under a heading
`# Phase 5 — Verify (procedure)`. In SKILL.md, replace the Phase 5 body with a
compact skeleton (~12 lines) that preserves the load-bearing rules and delegates
the rest:

- "Run the four steps in `verify.md` (beside this skill) IN ORDER — read it now,
  before verifying anything. Do not present output to the user while a step is
  failing."
- Keep one line each for: deterministic checks first and L0-blocks/L1-loops-back;
  evidence sets are required (widths, states, journey, inventory checkoff, dark
  mode N/A rule); the evaluator verdict is written by the spawned `evaluator`
  agent, never by you, and is pasted verbatim into the decision record.
- Keep the pointer to "What actually runs today".

The moved text must not be paraphrased — cut and paste, then only fix heading
levels.

**Verify**: `grep -c "Claude-in-Chrome" harness/.claude/skills/design/SKILL.md` → `1` (the critique section still mentions it until Step 2; after Step 2 → `0`), and `grep -c "Claude-in-Chrome" harness/.claude/skills/design/verify.md` → `>= 1`.

### Step 2: Extract the existing-surface critique procedure to `critique.md`

Create `harness/.claude/skills/design/critique.md` with the current "Existing
surfaces: critique before you polish" 3-step procedure verbatim. In SKILL.md,
replace the section body with ~5 lines: when the surface already exists
(modification, restyle, polish, catalog re-audit), read and run `critique.md`
BEFORE Phase 1 — capture the current page, critique it against the in-scope
controls and Kind Utility, and let the critique's "what underperforms" list set
the scope; **preserved is not waived**. Keep the Phase 1 blockquote's
cross-reference intact (it references this section by name — keep the section
heading unchanged so the reference holds).

**Verify**: `grep -c "critique.md" harness/.claude/skills/design/SKILL.md` → `>= 1`; the section heading "Existing surfaces: critique before you polish" still exists in SKILL.md.

### Step 3: Replace catalog restatements in Phase 4 with pointers

Replace the SLP-1..8 enumeration bullet and the A11Y-6..10 enumeration bullet
with two compact bullets:

- "Anti-slop is standard (SLP-1..11) — the default AI aesthetic is a defect.
  The rules live in the catalog you loaded first; re-read the SLP block before
  styling anything. Highest-frequency traps: purple/violet gradients (SLP-1),
  nested cards (SLP-4), identical-card grids (SLP-5), bounce easing (SLP-8)."
- "Accessibility structure (A11Y-6..10, GovTech Essential tier) — apply from
  the catalog; every image/icon, heading, custom control, page title, and
  landmark is in scope."

Do NOT touch the other Phase 4 bullets (conservative defaults, CMP/COL/TYP/TOK
lines, A11Y-11 channel rule, tables, craft, copy, demo-hooks, drift rule) — they
carry procedure or calibration that is NOT in the catalog text.

**Verify**: `grep -c "no gradient text" harness/.claude/skills/design/SKILL.md` → `0` (the enumeration is gone); `python3 harness/checks/validate.py` → exit 0 (L0 block untouched).

### Step 4: Single-source the "never overstate enforcement" rule

Make `harness/checks/README.md`'s statement the canonical one (it already is,
per the repo's single-source convention). In each of the other sites — harness
CLAUDE.md always-on rule, design SKILL.md "What actually runs today", the
evaluator agent's procedure text, onboard's "Stay honest" — reduce any
re-enumeration of what the rule covers to at most two sentences plus the
pointer "the full statement and per-script coverage: `checks/README.md`". Keep
each site's one-line core ("never report an unbuilt or un-run check as passed;
say verified manually or unverified") — the sites load in different contexts
and each needs the core inline. Cut only the drift-prone elaboration.

**Verify**: `wc -l harness/.claude/skills/design/SKILL.md` → ≤ 320. `grep -rn "checks/README.md" harness/.claude/skills/design/SKILL.md harness/CLAUDE.md` → at least one pointer each.

### Step 5: Golden-eval phrase check

For each moved block (Phase 5 steps, critique steps), grep
`harness/evals/golden/` for 3–4 distinctive phrases from the moved text (e.g.
"Claude-in-Chrome", "inventory checkoff", "critique before you polish",
"verified manually"). If a golden task asserts a phrase's presence in SKILL.md
specifically, update the assertion to point at the new file; if it asserts loop
BEHAVIOUR, leave it alone.

**Verify**: list the grep hits and the action taken for each in your report (may be "none found").

### Step 6: Full verification

1. `python3 harness/checks/validate.py` → exit 0 (L0-SYNC + SLP9-SYNC still pass).
2. `wc -l harness/.claude/skills/design/SKILL.md` → ≤ 320.
3. `wc -l harness/.claude/skills/design/verify.md harness/.claude/skills/design/critique.md` → both non-trivial (verify.md ≥ 55, critique.md ≥ 20).
4. Read SKILL.md end-to-end once: every extracted section's replacement text
   explicitly says WHEN to read the extracted file ("read it now", "before
   Phase 1"). A pointer without a trigger is a silent skip.

## Test plan

No automated tests cover skill prose. The tests are: validate.py's sync checks
(Step 6), the golden-eval phrase sweep (Step 5), and a behavioural smoke check
if a live session is available — run a small modification task ("add a remarks
field to the attendance page" per `evals/golden/001-attendance-retro.yaml`'s
shape) and confirm the loop still (a) critiques before Phase 1 on an existing
surface and (b) reads verify.md at Phase 5. If no live session, state that the
smoke check is pending and recommend the operator run one golden task before the
next release.

## Done criteria

- [ ] SKILL.md ≤ 320 lines; verify.md and critique.md exist beside it
- [ ] tfx-sync:L0 block byte-identical (`git diff` shows no change inside the markers)
- [ ] Frontmatter `description:` byte-identical
- [ ] `python3 harness/checks/validate.py` exit 0
- [ ] Every extraction pointer names its read trigger
- [ ] Golden-eval sweep done and reported
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 047 has not landed (paths/names won't match).
- validate.py fails after any step — the L0 or SLP9 block was disturbed; revert
  and retry rather than editing marker content to pass.
- A golden eval asserts moved text in a way that can't be repointed without
  changing what it tests.
- You find yourself rewording (not moving) more than ~5 lines in any extraction
  — this plan moves text; editorial rewrites are out of scope.

## Maintenance notes

- The skill now has three side-files (implement-craft.md, verify.md,
  critique.md). Anyone adding a fourth should follow the same pattern: SKILL.md
  states the rule and the read trigger; the side-file carries procedure.
- Reviewer focus: diff the moved blocks against the originals (should be
  pure moves) and check the Phase 5 skeleton kept the "never grade your own
  work" and "paste the verdict verbatim" rules inline — those two must never
  live only in a side-file.
- Deferred deliberately: any change to the skill's description (routing), and
  converting the "verified manually" rule into a tfx-sync-guarded fragment —
  revisit if it drifts again despite the pointers.
