# Plan 004: Run the design loop end-to-end once and produce the first real decision record + friction report

> **Executor instructions**: Follow this plan step by step. This plan is an
> *exercise of the harness*, not a code change — its deliverables are artifacts
> and a report. Honor the STOP conditions. When done, update this plan's row in
> `plans/README.md`.
>
> **Drift check (run first)**: read `.claude/skills/design-ui/SKILL.md` in
> full — it IS the procedure you will execute. If its six phases differ
> materially from the outline below, follow the live skill and note the
> difference in the friction report.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/003-evaluator-guidance-gaps.md (the run exercises CMP-3/CNT-3 grading)
- **Category**: tests
- **Planned at**: `no-git (pre-init)`, 2026-06-10

## Why this matters

The loop (intent → diverge → plan → implement → verify → ratchet) has only ever
been smoke-tested through phase 2. Zero decision records exist
(`docs/decisions/` holds only `TEMPLATE.md`), the `design-evaluator` subagent
has never been spawned against a real artifact, and the ratchet has never
produced a control proposal. "Well-designed on paper ≠ ergonomic in practice" —
one full run surfaces template gaps, broken cross-references, and evaluator
friction before a product team hits them during the TW rollout.

## Current state

- `.claude/skills/design-ui/SKILL.md` — the loop. Key gates: Phase 3 requires
  explicit human plan approval written to `docs/decisions/<page>.md`; Phase 5
  requires manual verification of deterministic controls ("verified manually" —
  the check scripts are unbuilt), screenshots at 360/768/1280, and spawning the
  `design-evaluator` subagent with the contract, plan, screenshots, in-scope
  controls, and the absolute path to `standards/`.
- `docs/decisions/TEMPLATE.md` — the record template (product, change type,
  teacher-and-moment, sprint contract, tradeoffs, controls in scope, waivers
  table, plan approval, verify verdict, ratchet).
- `.claude/agents/design-evaluator.md` — subagent: `tools: Read, Grep, Glob,
  Bash`, `skills: design-review`, `model: opus`; returns a structured verdict
  (`VERDICT / BLOCKING / ADVISORY / QUALITY GRADES / UNCOVERED`).
- There is no product repo. The run therefore implements a **standalone HTML
  page** inside this repo under `docs/loop-run/` — acceptable for exercising
  the loop, with one honest caveat: CMP-1 (stack components) can only be judged
  as "asserted, no manifest", which is itself useful friction data.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Catalog valid before/after | `python3 checks/validate.py` (if built) | OK |
| Screenshots | `agent-browser open file://… && agent-browser screenshot <path>` (resize per breakpoint) — or any browser screenshot method available | 3 PNG files |
| Plugin valid | `claude plugin validate .` | passes |

## Scope

**In scope** (created during the run):
- `docs/loop-run/student-notes-empty-state.html` (the implemented page)
- `docs/loop-run/screenshots/` (3 breakpoint captures)
- `docs/decisions/student-notes-empty-state.md` (the decision record — from TEMPLATE.md)
- `docs/loop-run/FRICTION-REPORT.md` (the main deliverable — see step 6)
- `standards/controls/` + `standards/catalog.yaml` ONLY IF the ratchet
  legitimately proposes a control (mark it `[proposed — pending design-lead approval]`)

**Out of scope**:
- Editing any skill, the template, or existing controls during the run — record
  friction, don't fix it mid-run (fixes contaminate the test).
- The explainer `docs/index.html`.

## Git workflow

- Branch: `advisor/004-loop-run`. One commit per phase artifact is ideal
  (`chore(loop-run): phase 3 decision record`). Do NOT push.

## Steps

### Step 1: Phases 1–2 (intent + diverge)

Task: "Design an empty state for Student Notes in Teacher Workspace." Run
Phase 1 exactly per the skill (purpose, the teacher and the moment, product/
page type, done-criteria → sprint contract; CNT-2 name check). Produce 2–3
structural options. The human operator picks one (if running unattended, pick
the recommended option and record "auto-picked — unattended run" in the record).

**Verify**: sprint contract has 3–6 done-criteria; options name only
plausible Base UI compositions.

### Step 2: Phase 3 (plan + record)

Write the plan per the skill (structure, components per region, controls in
scope with the flow-inheritance rule applied — the empty state's "Add a note"
action pulls CMP-3 — content outline, tradeoffs named, proposed waivers).
Copy `docs/decisions/TEMPLATE.md` → `docs/decisions/student-notes-empty-state.md`
and fill every section that exists at this phase. Obtain explicit approval
(operator, or record "approved by operator proxy — unattended" honestly).

**Verify**: the record file exists; no template section is left as placeholder
text without either content or an explicit `n/a — <reason>`.

### Step 3: Phase 4 (implement)

Build the page as a single self-contained HTML file at
`docs/loop-run/student-notes-empty-state.html` honoring the constraints:
semantic tokens via CSS custom properties (define a minimal `--token-*` layer
at the top — no raw hex below the token block), Inter/Plus Jakarta Sans via
Google Fonts, labels on any field, focus states, copy per the `content-style`
skill.

**Verify**: `grep -cE "#[0-9a-fA-F]{3,8}" docs/loop-run/student-notes-empty-state.html`
→ matches only within the token definition block (count and confirm manually).

### Step 4: Phase 5 (verify — the part that has never run)

1. Manually verify each in-scope deterministic control against its catalog
   entry; record each as "verified manually: pass/fail" in the decision record.
2. Capture screenshots at 360/768/1280 into `docs/loop-run/screenshots/`.
3. Spawn the `design-evaluator` subagent exactly as the skill prescribes,
   passing the contract, plan, screenshot paths, in-scope judgment/hybrid
   controls, and the absolute `standards/` path. Paste its verdict verbatim
   into the decision record.

**Verify**: the decision record contains a `VERDICT:` line that you did not
write yourself; 3 screenshots exist.

### Step 5: Phase 6 (ratchet)

Complete the decision record. If the evaluator or the run surfaced a defect no
control covers, draft the control proposal per the `design-standards` skill
("Growing the catalog") and mark it pending approval. If nothing qualifies,
record "ratchet: no proposal — nothing uncovered" (that is a valid outcome).

### Step 6: Write `docs/loop-run/FRICTION-REPORT.md`

The actual deliverable. Sections: **What worked** · **Friction** (every point
where the skill was ambiguous, a cross-reference broke, the template lacked a
field, the evaluator lacked context — with the exact file/section) ·
**Template gaps** · **Evaluator quality** (was the verdict evidence-grounded?
did it follow the design-review output format?) · **Recommended follow-up
edits** (list only — do not make them).

**Verify**: report exists with all five sections non-empty (or explicitly
"none observed").

## Test plan

This plan IS the test. Pass = all six phases completed with artifacts;
the friction report is the test output.

## Done criteria

- [ ] Decision record exists and every section is filled or explicitly n/a
- [ ] 3 screenshots exist under `docs/loop-run/screenshots/`
- [ ] Evaluator verdict pasted verbatim (structured format per design-review)
- [ ] `FRICTION-REPORT.md` exists, five sections
- [ ] `python3 checks/validate.py` still passes (if built)
- [ ] `plans/README.md` updated

## STOP conditions

- The `design-evaluator` subagent cannot be spawned in your environment (no
  subagent capability) — complete phases 1–4, record that limitation as the
  headline friction finding, and stop before fabricating a verdict. Never
  write the verdict yourself.
- The skill's gates require human input you don't have AND the operator
  prohibited proxy approval — stop at the gate and report.

## Maintenance notes

- The friction report feeds a follow-up editing pass on the skills/template —
  deliberately a separate change so the test stays uncontaminated.
- Keep `docs/loop-run/` as the worked example referenced by onboarding
  (plan 005 links to it).
