# Plan 013: Critique an existing page before polishing it — screenshot + design critique first

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/.claude/skills/tfx-design-ui/SKILL.md`.
> If the "New page vs. modification" section or Phase 5 changed since this plan
> was written, compare the "Current state" excerpts against the live file; on a
> mismatch, STOP. Paths are relative to the harness root.

## Status

- **Priority**: P1 (direct user direction from the harness lead)
- **Effort**: S
- **Risk**: LOW (skill-prose addition; no code, no catalog change)
- **Depends on**: none (complements plan 014's component inventory and plan 015's
  conservative-defaults rule — all three say "look at the real surface first")
- **Category**: dx
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

When `tfx-design-ui` runs against an **existing** page (a modification, a
re-audit, or an "improve / polish this" request), it jumps straight to a one-line
intent and a plan — it never *looks at what is there first*. The harness lead's
direction: treat an existing page as **improvement and polish**, and before
suggesting any change, **grab a screenshot of the current page and write a design
critique**. Polishing without seeing the current state is how a run restyles
things that were fine and misses the real problems (the same failure family as
the post-build corrections in the autonomous runs). A critique-first step grounds
the sprint contract in evidence and makes "what to polish" a finding, not a guess.

This plan also pins down **how** evidence is captured, because capture has been
unreliable across runs (the "os error 35" daemon failures): default to
Claude-in-Chrome (or the user's installed browser agent of choice); if capture
keeps failing, **ask the user to provide the screenshot** rather than proceeding
blind or fabricating a description.

## Current state

`.claude/skills/tfx-design-ui/SKILL.md` — the relevant sections (verbatim):

- The modification / re-audit entry paths (`SKILL.md:47-62`) describe a scoped
  loop but contain **no "look at the current state first" step**:
  > "**Modification** (add a field, change a layout region, restyle a component) —
  > run a scoped loop: a one-line intent, skip diverge if the structure is fixed,
  > a short plan naming the controls the *changed surface* pulls in, then
  > implement and verify the changed surface."
  > "**Catalog update re-audit** … Run each affected surface through the
  > modification loop: the 'change' is the catalog delta, the scoped plan is the
  > audit findings against the new controls only."
- Phase 1 — Intent (`SKILL.md:95-118`) establishes purpose/teacher/product/
  done-criteria but assumes a surface being designed, not one being critiqued.
- Phase 5 — Verify (`SKILL.md:240-255`) already names a capture fallback:
  > "If your screenshot tool misbehaves (the agent-browser daemon has
  > intermittently returned 'os error 35' in past runs), a local Playwright
  > script is the proven fallback — any tool is fine; the evidence set is not
  > optional."
  This plan extends that note with the default tool and the human fallback, and
  reuses the same capture convention for the new critique step.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` (run from harness root) |
| New step present | `grep -c "Critique the current state" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 |
| Capture convention present | `grep -c "Claude-in-Chrome\|browser agent of choice" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 |
| Human fallback present | `grep -c "ask the user to provide" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 |

## Scope

**In scope** (the only file you modify):
- `.claude/skills/tfx-design-ui/SKILL.md` — three edits: (1) a "Critique the
  current state first" step in the modification/re-audit path; (2) a one-line
  pointer to it from Phase 1; (3) extend the Phase 5 capture note with the
  default tool + human fallback (and reference it from the new step).

**Out of scope** (do NOT touch):
- `standards/catalog.yaml` and any control — this is loop procedure, not a new
  control.
- The evaluator agent / `tfx-design-review` skill (plan 014 covers the
  evaluator's independent enumeration).
- Phases 2/3/4/6 beyond the single Phase-1 pointer.
- `docs/decisions/TEMPLATE.md` (plan 017 owns the record/template work).

## Git workflow

- Branch: `advisor/013-critique-first`. Conventional commits
  (`docs: critique existing pages before polishing (screenshot + critique first)`).
  Do NOT push.

## Steps

### Step 1: Add the "Critique the current state first" step to the modification/re-audit path

In `.claude/skills/tfx-design-ui/SKILL.md`, immediately after the
"New page vs. modification" list (after the `Catalog update re-audit` bullet,
around `:62`), insert a new subsection:

```markdown
### Existing surfaces: critique before you polish

Whenever the surface **already exists** (a modification, a restyle, an
"improve / polish this", or a catalog re-audit), do not propose changes before
you have seen and judged the current state. Before Phase 1's contract:

1. **Capture the current page.** Take a screenshot of the live surface at 1280
   (and 360 if the change is responsive). Capture mechanism: use Claude-in-Chrome
   by default, or the user's installed browser agent of choice; the local
   Playwright fallback from Phase 5 applies. **If capture keeps failing, ask the
   user to provide the screenshot** — never critique a page you cannot see, and
   never fabricate what it looks like.
2. **Write a short design critique of what is there** — against the in-scope
   catalog controls *and* Kind Utility: what works and should be preserved
   (call out established iconography, radius, layout, and copy that are
   deliberate — do not "fix" them, cf. the conservative-defaults rule in
   Phase 3/4), and what genuinely underperforms (control violations, hierarchy,
   friction in the teacher's task). Ground each point in the screenshot.
3. The critique's "what underperforms" list **is** the scope of the polish; it
   feeds the Phase 1 contract and the Phase 3 plan. Improvement is the goal —
   the critique keeps it targeted instead of a blanket restyle.
```

**Verify**: `grep -c "Critique the current state\|critique before you polish" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1.

### Step 2: Point Phase 1 at the critique for existing surfaces

In Phase 1 — Intent, add one sentence near the top (after the
"Establish, asking the user only what you cannot infer:" line at `:97`):

```markdown
> For an **existing** surface, run "Critique the current state first" (above)
> before writing the contract — the contract's done-criteria should target the
> critique's findings, not a blanket redesign.
```

**Verify**: `grep -c "Critique the current state first" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1.

### Step 3: Extend the Phase 5 capture note with the default tool and the human fallback

In Phase 5 — Verify, find the capture-fallback sentence (`:251-255`, "If your
screenshot tool misbehaves …"). Replace it with:

```markdown
   Capture mechanism: **use Claude-in-Chrome by default, or the user's installed
   browser agent of choice**. If the agent-browser daemon misbehaves (it has
   intermittently returned "os error 35"), a local Playwright script is the
   proven fallback. If capture still keeps failing after a reasonable retry,
   **ask the user to provide the screenshot** — any source is fine; the evidence
   set is not optional, and unverified work is never presented as verified.
```

**Verify**: the three capture greps in the Commands table all return ≥ 1.

## Test plan

No code/tests. Gates: `claude plugin validate .` passes, the three grep checks,
and a read-through confirming the new step reads coherently with the existing
"New page vs. modification" and Phase 1 prose (no contradiction, no duplicated
heading levels).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "Critique the current state first" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1 (the Phase 1 pointer references the step by name)
- [ ] `grep -c "critique before you polish" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1 (the step heading)
- [ ] `grep -c "Claude-in-Chrome" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1
- [ ] `grep -c "ask the user to provide" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1
- [ ] `claude plugin validate .` passes
- [ ] Only `.claude/skills/tfx-design-ui/SKILL.md` modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- The "New page vs. modification" section or Phase 5 differs from the "Current
  state" excerpts (drift) — STOP; the insertion points may have moved.
- Adding the critique step would duplicate an existing instruction already added
  by another plan (e.g. a component-inventory step from plan 014) — reconcile by
  cross-referencing, not duplicating; if unsure, STOP and report.

## Maintenance notes

- This step is the natural home for plan 014's component inventory on existing
  surfaces (critique + inventory are the same "look at the real thing first"
  moment) — when 014 lands, the executor should fold the inventory into this
  step rather than creating a third place.
- The capture convention here and in Phase 5 should stay in sync; if a future
  plan adds a dark-mode capture step (plan 018), it must reuse this same
  default-tool + human-fallback language.
- Reviewer should check the new prose doesn't accidentally turn every run into a
  critique — it is gated on "the surface already exists."
