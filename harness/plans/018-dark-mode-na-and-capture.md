# Plan 018: Establish dark-mode support before grading it — mark N/A when absent, capture it when present

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/.claude/skills/tfx-design-ui/SKILL.md harness/.claude/skills/tfx-design-review/SKILL.md harness/docs/decisions/TEMPLATE.md`.
> If Phase 5, the review-skill quality criteria, or the record template changed
> since this plan was written, compare the "Current state" excerpts against the
> live files; on a mismatch, treat it as a STOP condition. All paths below are
> relative to the harness root (`harness/` in the dev repo; the plugin root when
> installed).

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW (verify-phase prose + one template field; no code, no catalog change)
- **Depends on**: plan 013 (reuses its capture convention) — soft dependency; if
  013 has not landed, inline the capture convention here and reconcile later
- **Category**: dx
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

The verify phase has been grading "dark-mode safe" for a mode that never renders.
Forcing `.dark` on `<html>` produced no dark frame in capture across runs (the
"os error 35" family), and in at least one product it produced **no visual change
at all** — no visible theme toggle, a `.dark` token layer that may be dead or
untested. Asserting TOK-1 "dark-safe" by reading token resolution for a mode the
product never shows is verification theater: it manufactures a pass nobody can
see. This very repo is the proof case — `app/globals.css` has **no `.dark`
selector at all**; it is a light-only palette, so any dark-mode grading here
should be N/A, not pass.

The fix is small and honest: before grading anything dark, **establish whether
the product supports dark mode**. If it doesn't, record dark-mode checks as
**N/A — product has no dark mode** (a truthful outcome, not a pass). If it does,
capture a real dark frame with the proven capture convention so the grade rests
on evidence.

## Current state

- `app/globals.css:4-28` — defines a `:root` token block only; there is **no
  `.dark` selector** anywhere in the file. Light palette only. (Local proof that
  dark grading is N/A for this product.)
- `.claude/skills/tfx-design-ui/SKILL.md:240-255` — Phase 5 "Render and
  screenshot" lists width / state / journey evidence and a capture fallback, but
  **never asks whether dark mode is supported** and includes no dark frame or
  dark-capture method.
- `.claude/skills/tfx-design-review/SKILL.md:55-79` — the four design-quality
  criteria (design quality / originality / craft / functionality). No guard that
  dark mode is N/A unless the product supports it; an evaluator can currently
  treat "dark-safe" as graded when nothing dark was rendered.
- Plan 013 establishes the **capture convention** to reuse verbatim: use
  Claude-in-Chrome by default, or the user's installed browser agent of choice;
  a local Playwright script is the proven fallback; if capture keeps failing,
  ask the user to provide the screenshot. Do **not** invent a second convention.
- `docs/decisions/TEMPLATE.md:54-63` — the "## Verify verdict" section lists
  Screenshots / Token block range / Deterministic controls / Evaluator verdict,
  but has no dark-mode field.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` (run from harness root) |
| Dark-support step present | `grep -c "Dark mode: supported" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 |
| N/A wording present | `grep -c "N/A — product has no dark mode" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 |
| Review-skill guard present | `grep -c "dark mode" .claude/skills/tfx-design-review/SKILL.md` | ≥ 1 |
| Template field present | `grep -c "Dark mode" docs/decisions/TEMPLATE.md` | ≥ 1 |

## Scope

**In scope** (the only files you modify):
- `.claude/skills/tfx-design-ui/SKILL.md` — add the dark-support determination +
  dark-capture step to Phase 5.
- `.claude/skills/tfx-design-review/SKILL.md` — add the N/A guard to the
  quality criteria.
- `docs/decisions/TEMPLATE.md` — add **one** "Dark mode: supported / N/A" field
  to the Verify-verdict section (and nothing else in that file).

**Out of scope** (do NOT touch):
- `standards/catalog.yaml` and any control — this is verify-phase procedure, not
  a control change (TOK-1 stays as-is; dark correctness is a *condition* of
  grading it, not a new rule).
- Product code (`app/globals.css` etc.) — read-only proof; do not add a `.dark`
  layer.
- The rest of `docs/decisions/TEMPLATE.md` — plan 017 owns the template's
  shipping/portability work; add only the single dark-mode field here.
- The capture convention's wording — it is owned by plan 013/Phase 5; reuse, do
  not redefine.

> **Coordination**: edits `tfx-design-ui/SKILL.md` (also touched by plans
> 010/012/013/014/015/017/019), `tfx-design-review/SKILL.md` (also 014/015), and
> **one line** of `docs/decisions/TEMPLATE.md` (also plan 017). Executors of
> overlapping plans should rebase, not clobber; this plan adds only the dark-mode
> field to the template.

## Git workflow

- Branch: `advisor/018-dark-mode`. Conventional commits
  (`docs: establish dark-mode support before grading; mark N/A when absent`).
  Do NOT push.

## Steps

### Step 1: Add the dark-support determination + capture step to Phase 5

In `.claude/skills/tfx-design-ui/SKILL.md`, in Phase 5 "Render and screenshot"
(after the width/state/journey evidence list, around `:250`), insert:

```markdown
   - **Dark mode: supported?** Before grading anything as dark-safe, establish
     whether the product actually supports dark mode: is there a visible theme
     toggle, and does a `.dark` (or `[data-theme="dark"]`) layer re-render the
     tokens? If **not**, record dark-mode checks as **N/A — product has no dark
     mode** in the decision record — this is a truthful outcome, never a pass.
     If **yes**, capture one dark frame using the capture convention above (an
     init-script that sets `.dark` / the theme attribute *before* load, or the
     app's own toggle); a token-resolution argument alone is not evidence that
     the mode renders.
```

**Verify**: `grep -c "Dark mode: supported" .claude/skills/tfx-design-ui/SKILL.md`
→ ≥ 1 and `grep -c "N/A — product has no dark mode" …` → ≥ 1.

### Step 2: Add the N/A guard to the evaluator's quality criteria

In `.claude/skills/tfx-design-review/SKILL.md`, in the design-quality criteria
(`:55-79`), add a sentence (in the Craft criterion or as a standalone note):

```markdown
- **Dark mode** is graded only when the product supports it and a dark frame was
  captured. If the product has no dark mode (no toggle, no re-rendering `.dark`
  layer), mark dark-mode checks **N/A — product has no dark mode**; never grade
  a TOK-1 "dark-safe" pass from token resolution alone for a mode that never
  renders.
```

**Verify**: `grep -c "dark mode" .claude/skills/tfx-design-review/SKILL.md` → ≥ 1.

### Step 3: Add the dark-mode field to the record template

In `docs/decisions/TEMPLATE.md`, in the "## Verify verdict" section (`:54-63`),
add one bullet alongside the existing Screenshots / Token block / Deterministic
controls bullets:

```markdown
- **Dark mode:** supported (dark frame captured at <path>) | N/A — product has
  no dark mode
```

**Verify**: `grep -c "Dark mode" docs/decisions/TEMPLATE.md` → ≥ 1. If plan 017's
`checks/audit-record.py` work has landed, run `python3 checks/audit-record.py
--self-test` → `SELF-TEST OK` to confirm the added field doesn't break the record
auditor (it asserts on sections, not this bullet, so it should stay green).

## Test plan

No code/tests. Gates: `claude plugin validate .` passes; the four grep checks;
and `audit-record.py --self-test` stays green if that script is present. A
read-through confirms the Phase 5 step, the review guard, and the template field
agree on the exact N/A wording ("N/A — product has no dark mode").

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "Dark mode: supported" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1
- [ ] `grep -c "N/A — product has no dark mode" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1
- [ ] `grep -c "dark mode" .claude/skills/tfx-design-review/SKILL.md` → ≥ 1
- [ ] `grep -c "Dark mode" docs/decisions/TEMPLATE.md` → ≥ 1
- [ ] `claude plugin validate .` passes; `audit-record.py --self-test` still passes if present
- [ ] Only the three in-scope files modified (`git status`); `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- Phase 5, the review-skill quality criteria, or the template's Verify-verdict
  section differ from the "Current state" excerpts (drift) — the insertion points
  may have moved.
- Plan 017 has already restructured `docs/decisions/TEMPLATE.md` such that the
  Verify-verdict section looks different from the excerpt — reconcile with 017's
  version (add the field to wherever the verdict section now lives), do not
  duplicate the section.
- You discover the product *does* have a working dark mode after all (a real
  toggle + re-rendering `.dark`) — then the N/A framing is wrong for it; report
  so the wording stays "establish first," not "assume absent."

## Maintenance notes

- The proven dark-capture init-script should be documented once and shared with
  plan 013's capture convention — keep them in sync; if they drift, the capture
  step here should defer to 013's wording.
- If a product later ships real dark mode, flip its determination from N/A to
  supported and capture the frame — do not leave a stale N/A asserting a pass by
  omission.
- Reviewer should confirm the N/A wording is identical across all three files so
  a future `audit-record` assertion could grep for it if desired.
