# Plan 003: Give the evaluator a rubric for CMP-1, CMP-3, CNT-3 and define the no-detail-file fallback

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: confirm the "Current state" excerpts match the
> live files; on a mismatch, STOP. If plan 002 is done, `python3
> checks/validate.py` must pass before AND after your changes.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (002 recommended first — its validator checks your frontmatter)
- **Category**: bug
- **Planned at**: `no-git (pre-init)`, 2026-06-10

## Why this matters

The harness splits verification: deterministic controls go to scripts, judgment
and hybrid controls go to a `design-evaluator` subagent. The evaluator's
instructions say a control's detail file ("Evaluator guidance" / "Do not flag"
sections) *defines its scope* — but three judgment/hybrid controls have no
detail file at all: **CMP-1** (use stack components, hybrid), **CMP-3** (async
loading/success/error states, hybrid), **CNT-3** (voice mechanics, hybrid).
The evaluator grades them with no rubric, and no skill says what to do when a
control has no `detail:` — so behavior is undefined exactly where judgment is
needed most. Deterministic index-only controls (A11Y-*, TOK-*, …) are fine by
design and are NOT in scope.

## Current state

- `standards/catalog.yaml` — the three target entries (verbatim `verify` fields):
  - `CMP-1` · L1 · hybrid · phase `[plan, implement, verify]` · applies_to
    `[page, component]` · verify: `"Component usage diffed against the product
    manifest; evaluator judges 'exists for the need' edge cases"` · waiver:
    documented · **no `detail:` field**
  - `CMP-3` · L1 · hybrid · phase `[plan, implement, verify]` · applies_to
    `[flow]` · verify: `"Script confirms the three states exist per async
    action; evaluator judges each state communicates clearly"` · waiver:
    documented · **no `detail:` field**
  - `CNT-3` · L2 · hybrid · phase `[implement, verify]` · applies_to
    `[content]` · verify: `"Lint sentence length; evaluator judges voice and
    person"` · waiver: rationale · **no `detail:` field**
- `standards/controls/` — 5 existing files. Use `standards/controls/cnt-2.md`
  as the structural exemplar for a judgment-graded control: frontmatter
  repeating the catalog entry, then `## Requirement`, `## Rationale`,
  `## Evaluator guidance` (with flag/do-not-flag lists), `## Waiver`.
  Use `standards/controls/cmp-2.md` as the exemplar for a hybrid control
  (it has `## Passes when` / `## Fails when` / `## How to verify` splitting
  the deterministic and judgment halves).
- `.claude/skills/design-review/SKILL.md` — contains: `Before grading a
  control, read its detail file` …wait, the exact sentence is in
  `.claude/agents/design-evaluator.md`: "Before grading a control, read its
  detail file in the harness's `standards/controls/` directory" and "A
  control's 'Evaluator guidance' and 'Do not flag' sections define your scope."
- `.claude/skills/design-ui/SKILL.md` — "read a control's `detail` file
  (same `standards/` directory) before applying it".
- Content sources for the rubrics (inline below so you don't need them): the
  TFX Design Standard's relevant guidance is already summarized in
  `.claude/skills/content-style/SKILL.md` (voice mechanics, tone-by-context)
  and in catalog comments. Key facts: the stack is Base UI components + Radix
  Colors + shadcn default tokens; "unwarranted novelty is flagged as readily
  as generic output — a custom pattern where a stack component exists is a
  finding"; CNT-3 mechanics are second person, active voice, sentences ≤ 25
  words; error-state copy anatomy is "what happened → what it means → what to
  do next" (that part belongs to CNT-1, which already has a detail file — do
  not duplicate it in CMP-3; cross-reference it).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Validator (if plan 002 landed) | `python3 checks/validate.py` | `OK: 22 controls valid` |
| Frontmatter sanity (always) | `python3 -c "import yaml; [yaml.safe_load(open(f'standards/controls/{f}').read().split('---')[1]) for f in ['cmp-1.md','cmp-3.md','cnt-3.md']]"` | exit 0 |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` |

## Scope

**In scope**:
- `standards/controls/cmp-1.md` (create)
- `standards/controls/cmp-3.md` (create)
- `standards/controls/cnt-3.md` (create)
- `standards/catalog.yaml` — add `detail: controls/cmp-1.md` (etc.) to exactly
  those three entries; change nothing else in the file
- `.claude/skills/design-standards/SKILL.md` — add the fallback rule (step 3)

**Out of scope**:
- Detail files for any OTHER control (the deterministic index-only entries are
  self-sufficient by design; revisit only after a real loop run shows agents
  struggling).
- `design-ui`, `design-review`, `content-style` skill bodies and the
  evaluator agent definition.
- Rewording any existing control.

## Git workflow

- Branch: `advisor/003-evaluator-guidance`. Conventional commits
  (`docs: add detail files for CMP-1/CMP-3/CNT-3`). Do NOT push.

## Steps

### Step 1: Write the three detail files

Each file: frontmatter repeating its catalog entry verbatim (every field,
same values — plan 002's validator will enforce this), then sections following
the `cmp-2.md` exemplar. Required content per control:

- **cmp-1.md** — Requirement: compose from existing Base UI-based components;
  a one-off needs a documented waiver. Rationale: hallucinated/duplicate
  components are the top agent failure mode; consistency is portfolio trust.
  Evaluator guidance must cover the "exists for the need" edge cases: flag a
  custom-built element when a stack component covers ≥90% of the need (the gap
  belongs in a waiver or a DS request, not a fork); flag copy-pasted variants
  of an existing component; do NOT flag composition (arranging existing
  components in a new layout) or a one-off carrying a documented
  `tfx-waive CMP-1` with a named approver. Note the v0 limit honestly: with no
  component manifest wired, "exists" is judged from the product codebase or
  asserted — say which one you used in the verdict.
- **cmp-3.md** — Requirement: every async action shows loading, success, and
  error states. Hybrid split: the script half (planned `checks/async-states`)
  proves the three states exist and are reachable; the evaluator half judges
  that each state communicates clearly. Evaluator guidance: loading states
  must indicate what is happening (not a bare spinner on a full-page overlay
  for a row-level action); success must be perceivable but proportionate
  (quiet feedback; reserve interruptions for blocking moments); error copy is
  graded under CNT-1's anatomy — cross-reference `controls/cnt-1.md`, do not
  restate it. Do NOT flag: instant (<~100ms) local operations with no
  perceivable pending state.
- **cnt-3.md** — Requirement: UI copy uses second person and active voice;
  sentences ≤ 25 words. Hybrid split: sentence length is lintable (planned
  `checks/content-lint`); person and voice are judged. Evaluator guidance:
  quote the offending sentence; flag passive instructions ("The form should be
  submitted"), third-person references to the user, sentences > 25 words. Do
  NOT flag: settled product names, quoted ministry/programme text carrying a
  `tfx-waive CNT-3` rationale, or labels/fragments (sentence rules apply to
  sentences). Waiver: `rationale` (L2) — inline `tfx-waive CNT-3 reason="..."`.

**Verify**: the frontmatter-sanity python command from the table → exit 0; each
file contains the headings `## Requirement`, `## Rationale`, `## Evaluator
guidance` (and `## How to verify` for the two hybrid CMP files).

### Step 2: Point the catalog at the new files

In `standards/catalog.yaml`, add to the three entries (matching the existing
indentation and field order used by CMP-2 — `detail:` sits after `verify:`/
`waiver:` block, exactly as in entries that already have it):
`detail: controls/cmp-1.md`, `detail: controls/cmp-3.md`,
`detail: controls/cnt-3.md`.

**Verify**: `grep -c "detail: controls/" standards/catalog.yaml` → 8 (was 5);
if plan 002 landed: `python3 checks/validate.py` → OK.

### Step 3: Define the fallback for controls without a detail file

In `.claude/skills/design-standards/SKILL.md`, in the "Reading and filtering"
section, append one bullet:

```markdown
- A control without a `detail:` field is self-sufficient: its `title` and
  `verify` line are the whole rule — apply them as written. Only `judgment`
  and `hybrid` controls carry detail files (evaluator guidance lives there);
  if you find a judgment/hybrid control without one, treat that as a catalog
  defect and raise it, don't improvise a rubric.
```

**Verify**: `grep -c "self-sufficient" .claude/skills/design-standards/SKILL.md` → ≥ 1.

## Test plan

No test framework. Gates: validator pass (if present), frontmatter parse, the
three grep checks above, and a read-through confirming cmp-1/cmp-3/cnt-3 follow
the cmp-2/cnt-2 section structure.

## Done criteria

- [ ] `ls standards/controls/ | wc -l` → 8
- [ ] `grep -c "detail: controls/" standards/catalog.yaml` → 8
- [ ] Frontmatter of all three new files parses and matches catalog values
- [ ] Fallback bullet present in design-standards SKILL.md
- [ ] `claude plugin validate .` passes; `python3 checks/validate.py` passes if it exists
- [ ] Only in-scope files modified; `plans/README.md` updated

## STOP conditions

- The catalog entries for CMP-1/CMP-3/CNT-3 differ from the "Current state"
  excerpts (drift) — STOP, the rubrics may need different content.
- You find yourself wanting to change a control's tier/verify text to make the
  rubric easier to write — that's a catalog change requiring design-lead
  approval; STOP and report.

## Maintenance notes

- These rubrics are pre-pilot drafts: after plan 004's end-to-end run, revise
  them against what the evaluator actually struggled with.
- When `checks/async-states` and `checks/content-lint` are built (plan 007
  direction), their detail files' "How to verify" sections must be updated
  from "planned" to the real command.
