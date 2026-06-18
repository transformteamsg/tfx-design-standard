# Plan 030: Make GitHub issues the system of record for harness feedback (process + docs + labels)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **One step is side-effecting and gated.** Step 4 creates GitHub labels with
> `gh label create` — it mutates the remote repo and must run only on operator
> go-ahead. Steps 1–3 are doc edits only.
>
> **Drift check (run first)**: `git diff --stat 5f95350..HEAD -- harness/.claude/skills/tfx-design-ui/SKILL.md harness/.claude/skills/tfx-design-standards/SKILL.md harness/CONTRIBUTING.md harness/docs/loop-run/FRICTION-REPORT.md`.
> If any changed since this plan was written, compare against "Current state" before
> editing; on a mismatch, STOP. Paths relative to the harness root.

## Status

- **Priority**: P2 (issue #6)
- **Effort**: M
- **Risk**: LOW for the doc edits (Steps 1–3); MED for Step 4 (creates remote labels)
- **Depends on**: none. **Blocks**: plan 031 (the helper script implements this
  process), plan 032 (backfill uses the labels + marker defined here).
- **Category**: docs (process / governance)
- **Planned at**: commit `5f95350`, 2026-06-17

## Why this matters

Harness feedback is tracked in **markdown** today (`docs/loop-run/FRICTION-REPORT.md`
upstream; `docs/decisions/HARNESS-FEEDBACK.md` in the consumer repo). A markdown log
drifts, has no status/assignee/dedup, and needs a separate manual step to reach the
maintainer. Issue #6: **file harness feedback directly as GitHub issues and make issues
the system of record**, replacing the log. This plan lays the foundation — the process,
the docs, and the label scheme — so plan 031's helper script and plan 032's backfill
have a defined target. It changes a documented harness workflow (where feedback lives),
so it is flagged for design-lead review per `CONTRIBUTING.md` "Skill and doc edits".

**Boundary to keep clear:** harness *feedback / friction* (skill confusion, a missing
check, a process gap, an onboarding nit) → **GitHub issue**. A *control proposal* (a new
or revised catalog control) still goes through the ratchet into a **decision /
catalog-change record** (`CONTRIBUTING.md`), unchanged. A feedback issue may *spawn* a
control proposal, but the issue is the feedback tracker, the record is the control spec.
This plan must not conflate the two.

## Current state

- `.claude/skills/tfx-design-ui/SKILL.md:390-400` — Phase 6, today routing only to
  control proposals:
  ```
  ## Phase 6 — Ratchet

  After the user accepts the result, finish the decision record started in Phase 3
  (`docs/decisions/<page>.md`): chosen option, rejected options and why, waivers granted
  and by whom, and the verify verdict. Then:

  - Any failure the evaluator or user caught that no control covered → propose a new
    control or anti-pattern entry for `standards/`. Follow the "Growing the catalog"
    section of the `tfx-design-standards` skill — it is the single authoritative description
    of the proposal format.
  ```
  There is **no step here for harness friction/feedback** that is not a control gap —
  that currently goes (manually) to `FRICTION-REPORT.md`.
- `.claude/skills/tfx-design-standards/SKILL.md:76-95` — "## Growing the catalog (the
  ratchet)" governs **control proposals** (records, design-lead approval). This stays;
  it gains one clarifying line distinguishing feedback issues from control records.
- `CONTRIBUTING.md` — process doc (ratchet workflow, PR template). It has no "harness
  feedback" section; add one.
- `docs/loop-run/FRICTION-REPORT.md` — the upstream feedback log (run 004). Becomes a
  read-only historical archive with a header pointer.
- `docs/decisions/HARNESS-FEEDBACK.md` lives in the **consumer repo**, not here — out of
  scope for edits; the new doc only *names* it as the consumer-side log that is likewise
  archived in favour of issues.
- Existing repo labels (from `gh label list`): `bug, documentation, duplicate,
  enhancement, good first issue, help wanted, invalid, question, wontfix` — the standard
  GitHub defaults. **None of the severity/category labels exist yet.**
- `git remote -v` → `origin https://github.com/transformteamsg/tfx-design-standard.git`;
  `gh auth status` → logged in as `rezailmi`. (The remote target for issues/labels.)

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` |
| New doc present | `test -f docs/harness-feedback.md && echo ok` | `ok` |
| Phase 6 routes to issues | `grep -ic "github issue\|harness-feedback" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 |
| `gh` reachable (before Step 4) | `gh auth status` | logged in |
| Labels exist (after Step 4) | `gh label list \| grep -c "L0-risk\|harness-ux\|onboarding"` | ≥ 3 |

## Scope

**Steps 1–3 — In scope** (doc edits):
- `docs/harness-feedback.md` (create) — the workflow + label scheme + dedup +
  honest-failure spec.
- `.claude/skills/tfx-design-ui/SKILL.md` — Phase 6: add the feedback→issue step.
- `.claude/skills/tfx-design-standards/SKILL.md` — one clarifying line in "Growing the
  catalog".
- `CONTRIBUTING.md` — add a "Harness feedback" section.
- `docs/loop-run/FRICTION-REPORT.md` — add an "archived" header.

**Step 4 — In scope** (gated, side-effecting):
- Remote GitHub labels via `gh label create` (no repo files).

**Out of scope**:
- Building the helper script (plan 031) or filing/backfilling any issue (plan 032).
- The consumer repo's `HARNESS-FEEDBACK.md` (different repo).
- The control-proposal ratchet mechanics (records, PR template) — only a clarifying
  cross-reference, no change to the flow.

## Git workflow

- Branch: `advisor/030-feedback-as-issues`. Conventional commits
  (`docs: make GitHub issues the system of record for harness feedback (#6)`). Do NOT
  push. (Step 4's label creation is a remote `gh` action, independent of the branch.)

## Steps

### Step 1: Write `docs/harness-feedback.md` — the workflow spec

Create the doc. It states (issue #6's design + acceptance criteria):

- **Issues are the system of record.** When a loop run or any harness step surfaces a
  feedback item, open a GitHub issue on `transformteamsg/tfx-design-standard` — do not
  append to a markdown log.
- **One issue per feedback item** (group trivial ones from a single run into one issue),
  title marker **`[harness-feedback] <summary>`**, body = the ask + the run/source
  context (which skill/check/phase, the evidence).
- **Labels for triage**: severity — `L0-risk` / `high` / `med` / `low`; category —
  `a11y` / `tooling` / `standards` / `harness-ux` / `onboarding`. (Document the colour +
  description each will get in Step 4.)
- **Dedup before filing**: `gh issue list --search "[harness-feedback] <keywords>"` (and
  `--state all` to catch closed ones); if a match exists, comment on / reopen it instead
  of creating a duplicate. Note: GitHub `--search` is **fuzzy full-text**, so the
  `[harness-feedback]` marker is a search *term*, not an exact-match qualifier —
  re-filter the results by exact marker prefix before deciding (plan 031's helper does
  this in code).
- **Honest failure**: if `gh` is unauthenticated or the repo is unreachable, report
  clearly (print the issue body that *would* have been filed and the failure reason) —
  never silently skip. Consistent with the harness's "never overstate enforcement" rule.
- **The markdown logs are archived**: `docs/loop-run/FRICTION-REPORT.md` (upstream) and
  `docs/decisions/HARNESS-FEEDBACK.md` (consumer repo) are read-only historical
  archives. If a file view is still wanted, generate a thin index *from* issues
  (`gh issue list --label …`), never hand-maintain it.
- **Feedback vs control proposals**: a feedback issue may spawn a control proposal, but
  the proposal still lives in a decision/catalog-change record per `CONTRIBUTING.md`;
  the issue tracks the feedback, the record specs the control.
- Point at the helper script (plan 031) as the mechanism, and note the one-time backfill
  (plan 032). Until 031 lands, the `gh issue create` command shape is given inline so
  the process is runnable by hand.

### Step 2: Wire the skills

- `tfx-design-ui/SKILL.md` Phase 6 — add a second bullet after the control-proposal one:
  > - Harness friction the run surfaced that is **not** a control gap — a confusing
  >   step, a missing/!unbuilt check, a process or onboarding nit — is filed as a
  >   **GitHub issue** (the system of record), per `docs/harness-feedback.md`: title
  >   `[harness-feedback] <summary>`, severity + category labels, dedup first. Do not
  >   append to a markdown feedback log.
- `tfx-design-standards/SKILL.md` "Growing the catalog" — add one clarifying line: this
  ratchet governs *control proposals* (records + design-lead approval); general harness
  *feedback/friction* is filed as GitHub issues per `docs/harness-feedback.md` (a
  feedback issue may spawn a control proposal recorded here).

### Step 3: CONTRIBUTING + archive the friction log

- `CONTRIBUTING.md` — add a section "## Harness feedback (issues as the system of
  record)" summarising the doc and linking it; note the markdown logs are archived.
- `docs/loop-run/FRICTION-REPORT.md` — add a header block at the very top:
  > **Archived (2026-…).** Harness feedback is now filed as GitHub issues — the system
  > of record. See `docs/harness-feedback.md`. This report is a read-only historical
  > record of loop run 004; do not append new feedback here.
  Leave the body intact (it is history).

**Verify**: the four non-`gh` rows in the Commands table pass; `claude plugin validate .`
passes; `git status` shows only the five in-scope files.

### Step 4 (GATED — operator go-ahead; side-effecting): create the labels

Confirm `gh auth status` is logged in. Then create the labels (idempotent — `gh label
create … --force` updates if present, so **if a create fails midway, simply re-run
Step 4** — `--force` makes the whole sequence safe to repeat). Suggested
colours/descriptions:

- Severity: `L0-risk` (#b60205, "non-negotiable trust/safety/a11y risk"), `high`
  (#d93f0b), `med` (#fbca04), `low` (#0e8a16).
- Category: `a11y` (#1d76db), `tooling` (#5319e7), `standards` (#0052cc),
  `harness-ux` (#006b75), `onboarding` (#c5def5).

If `gh` is unauthenticated/unreachable, STOP and report (do not partially create) — the
operator runs it when `gh` is available.

**Verify**: `gh label list | grep -c "L0-risk\|harness-ux\|onboarding"` → ≥ 3.

## Test plan

No code/tests. Gates: `claude plugin validate .` passes; the doc exists and covers
marker + labels + dedup + honest-failure + archive + feedback-vs-proposal; both skills
and CONTRIBUTING reference the doc; FRICTION-REPORT carries the archived header; (gated)
the nine labels exist on the remote. A read-through confirms the feedback/proposal
boundary is stated and Singapore English / SLP-9 hold.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `docs/harness-feedback.md` exists and specifies marker, severity+category labels, dedup, honest failure, archive, and the feedback-vs-control-proposal boundary
- [ ] `grep -ic "github issue\|harness-feedback" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1
- [ ] `tfx-design-standards` "Growing the catalog" cross-references the doc; `CONTRIBUTING.md` has the new section
- [ ] `docs/loop-run/FRICTION-REPORT.md` carries the archived header; its body is otherwise unchanged
- [ ] `claude plugin validate .` passes
- [ ] (Step 4, gated) `gh label list | grep -c "L0-risk\|harness-ux\|onboarding"` → ≥ 3
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- Phase 6 / Growing-the-catalog / CONTRIBUTING differ from "Current state" (drift).
- Step 4: `gh auth status` is not logged in — STOP; the operator runs Step 4 when `gh`
  is available. (If a `gh label create` fails *mid-sequence*, that is recoverable, not a
  STOP: re-run Step 4 — `--force` makes it idempotent — and report any label that still
  won't create.)
- You find yourself changing the control-proposal ratchet flow — out of scope; only the
  clarifying cross-reference belongs here.

## Maintenance notes

- This is the foundation; plan 031 mechanizes the filing (dedup + honest failure) and
  plan 032 backfills the historical HF items. Keep the doc as the single source for the
  marker + label scheme so the script and backfill agree with it.
- If the team later wants a generated index, it reads `gh issue list --label
  '[harness-feedback]'` — never hand-maintain a list (that reintroduces the drift this
  change removes).
- A reviewer should confirm the feedback-vs-control-proposal boundary is unambiguous —
  the most likely failure mode is a contributor filing a control spec as an issue or a
  feedback nit as a catalog record.
