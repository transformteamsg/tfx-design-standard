# Plan 014: Make surface coverage provable — a component inventory the evaluator independently spot-checks

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/.claude/skills/tfx-design-ui/SKILL.md harness/.claude/skills/tfx-design-review/SKILL.md harness/.claude/agents/tfx-design-evaluator.md`.
> If Phase 1, Phase 5, or the evaluator inputs changed since this plan was
> written, compare the "Current state" excerpts against the live files; on a
> mismatch, treat it as a STOP condition. All paths below are relative to the
> harness root (`harness/` in the dev repo; the plugin root when installed).

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW (skill/agent prose; no code, no catalog change)
- **Depends on**: none (complements plan 010's `a11y-static` and plan 013's
  critique-first step)
- **Category**: dx
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

A per-surface audit today **assumes** coverage instead of proving it. A component
declared "clean" by a colour grep hid an **L0 invisible-keyboard-focus** issue, a
hand-rolled combobox, an unlabeled search field, and visual-only selection —
because no one enumerated and *operated* the surface's interactive controls. And
the evaluator only sees the screenshots and files the builder chose, so it was
**structurally unable** to catch what the builder's audit missed: the broken
control sat one component away, un-photographed, while the build passed. Two
linked fixes: (1) Phase 1 outputs an explicit **component inventory** — the
route, every component it renders, and every interactive control with the states
to exercise; verify checks each off. (2) The evaluator receives that inventory
**and is told to independently enumerate** the surface's interactive controls and
spot-check focus/role/name/state — not merely grade the supplied evidence.

## Current state

- `.claude/skills/tfx-design-ui/SKILL.md:95-118` — Phase 1 establishes purpose /
  teacher-and-moment / product / done-criteria, but produces **no component
  inventory**. Coverage of a multi-component surface is never written down.
- `.claude/skills/tfx-design-ui/SKILL.md:240-255` — Phase 5 "Render and
  screenshot" lists width / state / journey evidence, but has **no per-component
  checkoff** — nothing forces each interactive control to be operated.
- `.claude/skills/tfx-design-review/SKILL.md:13-21` — the evaluator's "Inputs you
  should receive": sprint contract, approved plan, screenshots (+ code/DOM),
  in-scope judgment/hybrid controls. It **receives** the builder's evidence; it
  is never told to **independently enumerate** the surface's interactive elements.
- `.claude/skills/tfx-design-review/SKILL.md:27-29` (verbatim): *"Any
  deterministic violation you can see — in a screenshot or in the code — is a
  finding regardless, belt and braces."* So permission to flag is **already
  there**; the missing half is *independent enumeration* (looking past the
  supplied set).
- `.claude/agents/tfx-design-evaluator.md:4` — the evaluator has `tools: Read,
  Grep, Glob, Bash`: it CAN read the route's code and operate controls, but the
  agent prompt never tells it to enumerate them.
- `standards/controls/a11y-8.md:50` (verbatim): *"the evaluator operates the
  component in the DOM (or reads its code) and confirms the exposed state
  actually tracks the visual behavior."* — the existing hook for state spot-checks.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` (from harness root) |
| Phase-1 inventory present | `grep -c "Component inventory" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 |
| Verify checkoff present | `grep -c "inventory" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 2 (Phase 1 + Phase 5) |
| Evaluator enumeration present | `grep -c "independently enumerate" .claude/skills/tfx-design-review/SKILL.md` | ≥ 1 |

## Scope

**In scope** (the only files you modify):
- `.claude/skills/tfx-design-ui/SKILL.md` — add the Phase-1 inventory output; add
  the Phase-5 per-component checkoff; add the inventory to the evaluator-dispatch
  inputs (Phase 5 step 3).
- `.claude/skills/tfx-design-review/SKILL.md` — add the independent-enumeration +
  spot-check instruction to the evaluator's inputs/grading procedure.
- `.claude/agents/tfx-design-evaluator.md` — one line so the agent prompt states
  it independently enumerates interactive controls.

**Out of scope** (do NOT touch):
- `standards/catalog.yaml` and any control — this is loop/evaluator procedure.
- `checks/` scripts — plan 010 builds the static a11y pre-pass; this plan only
  cross-references it.
- The critique-first step itself (plan 013) — reference it, do not rewrite it.

> **Coordination**: edits `tfx-design-ui/SKILL.md` (also touched by plans
> 010/012/013/015/017/018/019), `tfx-design-review/SKILL.md` (also 018), and
> `tfx-design-evaluator.md`. Executors of overlapping plans should rebase, not
> clobber.

## Git workflow

- Branch: `advisor/014-component-inventory`. Conventional commits
  (`docs: component inventory + evaluator independent spot-check`). Do NOT push.

## Steps

### Step 1: Add the Component inventory output to Phase 1

In `.claude/skills/tfx-design-ui/SKILL.md`, add a fifth numbered item to Phase 1
(after done-criteria, around `:118`):

```markdown
5. **Component inventory**: list the surface as a coverage checklist — the route,
   every component it renders (by import name), and every **interactive control**
   on it (buttons, inputs, dropdowns/combobox, toggles, tabs, links, menus). For
   each interactive control, name the states to exercise later: open, keyboard-tab
   (focus visible?), screen-read (role + accessible name + state?). This is the
   list Phase 5 checks off and the evaluator independently verifies — coverage is
   a provable checklist, not a vibe. (For an existing surface, build this during
   "Critique the current state first".)
```

**Verify**: `grep -c "Component inventory" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1.

### Step 2: Add a per-component checkoff to Phase 5

In Phase 5 — Verify, add a step (or extend step 1) requiring that **every item in
the Phase-1 inventory is operated, not just photographed**: each interactive
control is tabbed to (focus visible), activated by keyboard, and checked for role
+ accessible name + state. Cross-reference plan 010: run `checks/a11y-static` as
the static focus/role/name pre-pass over the route's source, then operate what it
cannot see (computed focus, live state).

```markdown
   - **Inventory checkoff**: walk the Phase-1 component inventory and tick each
     interactive control as operated — tab to it (focus visible per A11Y-2),
     activate by keyboard, confirm role + accessible name + state (A11Y-8/A11Y-3).
     Run `checks/a11y-static` (if built) as the static pre-pass, then operate what
     a static scan can't see. An un-operated control is uncovered, not clean.
```

**Verify**: `grep -c "inventory" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 2.

### Step 3: Hand the inventory to the evaluator

In Phase 5 step 3 (the evaluator-dispatch list, `:256-264`), add the component
inventory to the inputs passed to `tfx-design-evaluator` (alongside the sprint
contract, plan, screenshots, in-scope controls, and the `standards/` path).

**Verify**: `grep -c "inventory" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 3.

### Step 4: Tell the evaluator to independently enumerate and spot-check

In `.claude/skills/tfx-design-review/SKILL.md`, in "Inputs you should receive"
(`:13-21`) add the inventory as input #5, and in the grading procedure add:

```markdown
**Independently enumerate the surface's interactive controls** — from the
component inventory **and** from reading the route's code (you have Read/Grep/
Glob/Bash). Do not grade only the screenshots you were handed: a control that was
never photographed is still in scope. Spot-check each interactive control for a
visible focus state (A11Y-2), role + accessible name (A11Y-8/A11Y-3), and that
its ARIA state tracks the visual (A11Y-8, per controls/a11y-8.md). A control the
builder's evidence omits, found this way, is a finding — not an excuse.
```

Then add one line to `.claude/agents/tfx-design-evaluator.md` (after the
"Ground every finding in evidence" paragraph): *"Independently enumerate the
surface's interactive controls from the inventory and the route's code; do not
limit your review to the screenshots supplied."*

**Verify**: `grep -c "independently enumerate" .claude/skills/tfx-design-review/SKILL.md` → ≥ 1; `grep -c "independently enumerate" .claude/agents/tfx-design-evaluator.md` → ≥ 1.

## Test plan

No code/tests. Gates: `claude plugin validate .` passes; the grep checks; a
read-through confirming the inventory flows Phase 1 → Phase 5 checkoff → evaluator
input → evaluator independent enumeration without contradiction or duplicated
headings.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "Component inventory" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1
- [ ] `grep -c "inventory" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 3 (Phase 1 output, Phase 5 checkoff, evaluator input)
- [ ] `grep -c "independently enumerate" .claude/skills/tfx-design-review/SKILL.md` → ≥ 1
- [ ] `grep -c "independently enumerate" .claude/agents/tfx-design-evaluator.md` → ≥ 1
- [ ] `claude plugin validate .` passes
- [ ] Only in-scope files modified (`git status`); `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- Phase 1, Phase 5, the review skill, or the evaluator agent differ from the
  "Current state" excerpts (drift) — insertion points may have moved.
- A component-inventory or critique step was already added by plan 013 (or
  another plan) — reconcile by cross-referencing/extending the existing step, do
  not create a second inventory location.
- Adding independent enumeration would contradict the evaluator's "second read,
  not fully independent" caveat (`tfx-design-review` calibration) — it does not
  (enumeration is about coverage, not model independence), but if the prose
  collides, STOP and report.

## Maintenance notes

- On **existing** surfaces the inventory belongs inside plan 013's "Critique the
  current state first" step (same "look at the real thing first" moment) — when
  both have landed, the inventory should be built once, there, and referenced
  from Phase 1.
- When `checks/a11y-static` (plan 010) and a future `checks/component-manifest`
  (plan 019) exist, the inventory becomes the spine they hang off — the manifest
  diff and the a11y pre-pass both consume "what's on this surface."
- Reviewer should confirm the inventory requirement is proportionate for tiny
  modifications (a one-field change lists one control, not the whole page) — it
  scales with the changed surface, like the rest of the modification loop.
