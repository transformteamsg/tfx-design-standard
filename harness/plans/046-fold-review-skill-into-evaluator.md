# Plan 046: Fold the `tfx-design-review` skill into the evaluator agent

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat c42d695..HEAD -- harness/.claude/ harness/CLAUDE.md harness/README.md content/harness/skills.mdx harness/evals/routing/prompts.yaml`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: MED
- **Depends on**: none (but must land BEFORE plan 047 — it removes one skill from 047's rename surface)
- **Category**: tech-debt
- **Planned at**: commit `c42d695`, 2026-07-02

## Why this matters

The harness ships five skills, but one of them — `tfx-design-review` — is never
routed to by users. Its only consumer is the `tfx-design-evaluator` agent, which
preloads it via a frontmatter `skills:` line; its own description explicitly says
"Used by the tfx-design-evaluator subagent ... not by the agent that produced the
design." A skill with exactly one programmatic consumer and a defensive
anti-routing description adds a name to the skill namespace, a row in every skill
list, and a routing surface, for zero routing benefit. Folding its content into the
agent definition keeps the generator/evaluator split fully intact (that split is
about the *agent* being separate, not about the rubric being a *skill*) and shrinks
the user-facing stack from five skills to four. The user has asked for exactly this
kind of stack simplification.

## Current state

- `harness/.claude/agents/tfx-design-evaluator.md` — 25 lines. Frontmatter:

  ```yaml
  name: tfx-design-evaluator
  description: Reviews a designed page or flow against the sprint contract, judgment controls, and design quality criteria. Spawn during the verify phase of tfx-design-ui — always as a separate agent from the one that produced the design. Pass it the sprint contract, approved plan, screenshots, and in-scope controls.
  tools: Read, Grep, Glob, Bash
  skills: tfx-design-review
  model: opus
  ```

  Body (abridged): "Your rubric is the `tfx-design-review` skill, preloaded into
  your context. Follow it exactly ... Two things only the spawn can tell you, not
  the skill: [the standards/ path passed by the spawner; final message IS the
  verdict]."

- `harness/.claude/skills/tfx-design-review/SKILL.md` — 183 lines. Frontmatter
  `name: tfx-design-review`, then the full evaluator procedure: inputs, "preserved
  is not waived", finding-sorting rules, grading (contract compliance, plan
  fidelity, judgment controls, four quality criteria), and the fixed output format
  including the VERIFICATION LEDGER table that `harness/checks/audit-record.py`
  validates.

- `harness/.claude-plugin/plugin.json` — `"skills": "./.claude/skills/"` (a
  directory glob; removing a skill directory needs no manifest edit) and
  `"agents": ["./.claude/agents/tfx-design-evaluator.md"]`.

- References to `tfx-design-review` in **live** (non-historical) files:
  - `harness/.claude/agents/tfx-design-evaluator.md` (frontmatter + body)
  - `harness/CLAUDE.md` — "Where things live" table, grading row: "`tfx-design-evaluator` subagent (follows `tfx-design-review`)"
  - `harness/README.md` — line ~19 (enforcement column), line ~69 (layout diagram), line ~92 (install text listing five skills)
  - `harness/evals/routing/prompts.yaml` — header comment enumerating harness skills for `expect: none` cases (line ~9–10)
  - `content/harness/skills.mdx` — line 11, the skills table row for `tfx-design-review`
  - `README.md` (repo root) — line ~13 lists it among the five skills
  - `harness/.claude/skills/tfx-design-ui/SKILL.md` — check with grep; Phase 5 references the *agent*, but confirm no skill-name references remain
  - Possibly `harness/CONTRIBUTING.md`, `harness/docs/ONBOARDING.md`, `harness/docs/UPDATING.md`, `harness/docs/SYNC.md`, `harness/docs/index.html`, `harness/standards/README.md`, `harness/standards/controls/*.md` — find them all with the grep in Step 3.

- **Historical, append-only files that must NOT be rewritten** (they record what
  was named what, when): `harness/plans/*.md` (001–045), `harness/CHANGELOG.md`
  (existing entries), `harness/docs/reviews/*`, `harness/docs/catalog-changes/*`,
  `harness/docs/decisions/*.md` (existing records), `harness/docs/loop-run/*`,
  `harness/evals/evaluator-recall/RESULTS.md`.

- Repo conventions: Singapore English in prose; harness docs use plain-language
  second-person style; validate before claiming pass (`python3 harness/checks/validate.py`).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Catalog + sync validation | `python3 harness/checks/validate.py` | `OK: 48 controls valid` (plus sync-check OK lines), exit 0 |
| Validator self-test | `python3 harness/checks/validate.py --self-test` | `SELF-TEST OK (27 cases)` |
| Record audit self-test | `python3 harness/checks/audit-record.py --self-test` | `SELF-TEST OK (21 cases)` |
| Website build | `pnpm build` | exit 0 |
| Reference sweep | `grep -rn "tfx-design-review" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=plans .` | see per-step expectations |

## Scope

**In scope** (the only files you should modify):
- `harness/.claude/agents/tfx-design-evaluator.md`
- `harness/.claude/skills/tfx-design-review/` (delete the directory)
- The live reference files listed in "Current state" (as found by Step 3's grep)
- `harness/CHANGELOG.md` (append an Unreleased note only)

**Out of scope** (do NOT touch):
- The historical/append-only files listed above — a rename/removal must not
  falsify the record.
- `harness/standards/catalog.yaml` — no catalog change is part of this plan.
- The other four skills' content (plan 047/049 handle renames and slimming).
- `harness/checks/validate.py` — its two hard-coded skill paths point at
  `tfx-design-ui` and `tfx-content-style`, not the review skill.

## Git workflow

- Branch: `advisor/046-fold-review-skill`
- Commit style (match `git log`): `refactor(harness): fold tfx-design-review skill into the evaluator agent`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Move the review procedure into the agent definition

Edit `harness/.claude/agents/tfx-design-evaluator.md`:

1. Remove the `skills: tfx-design-review` line from the frontmatter. Keep
   `name`, `description`, `tools`, `model` unchanged.
2. Keep the existing body preamble (the role statement and the two
   "only the spawn can tell you" notes), but change the sentence
   "Your rubric is the `tfx-design-review` skill, preloaded into your context."
   to "Your rubric follows below."
3. Append the ENTIRE body of `harness/.claude/skills/tfx-design-review/SKILL.md`
   (everything below its frontmatter, from the `# Design review (evaluator
   procedure)` heading to the end) after the preamble. Do not paraphrase,
   trim, or reformat it — the VERIFICATION LEDGER format in that text is
   validated by `checks/audit-record.py` and must survive verbatim.

**Verify**: `grep -c "VERIFICATION LEDGER" harness/.claude/agents/tfx-design-evaluator.md` → `1` (or more), and `grep -n "skills:" harness/.claude/agents/tfx-design-evaluator.md` → no output.

### Step 2: Delete the skill directory

`git rm -r harness/.claude/skills/tfx-design-review`

**Verify**: `ls harness/.claude/skills/` → exactly `tfx-content-style tfx-design-onboarding tfx-design-standards tfx-design-ui`.

### Step 3: Update every live reference

Run: `grep -rln "tfx-design-review" --exclude-dir=node_modules --exclude-dir=.next .`

For each hit that is NOT in the historical set (harness/plans/, harness/CHANGELOG.md
existing entries, harness/docs/reviews/, harness/docs/catalog-changes/,
harness/docs/decisions/ existing records, harness/docs/loop-run/,
harness/evals/evaluator-recall/RESULTS.md), rewrite the reference so it describes
the new shape: the evaluator procedure lives in the `tfx-design-evaluator` agent
definition. Specifically:

- `harness/CLAUDE.md` grading row → "`tfx-design-evaluator` subagent (its agent
  definition carries the review procedure)".
- `harness/README.md`: the enforcement diagram line, the repository-layout
  diagram entry, and the install sentence change from five skills to four
  (drop `tfx-design-review` from the list; keep the evaluator agent mentioned).
- `harness/evals/routing/prompts.yaml` header comment: remove
  `tfx-design-review` from the "no harness skill" enumeration (it can no longer
  fire as a skill). Do not change any `expect:` values — none reference it.
- `content/harness/skills.mdx`: keep the table row but change its first cell to
  the evaluator agent (e.g. "`tfx-design-evaluator` (agent)") and its status/
  description to say the grading procedure ships inside the agent definition,
  not as a separately loadable skill.
- Root `README.md` line ~13: reduce the five-skill list to four and mention the
  evaluator agent carries its own procedure.

**Verify**: `grep -rln "tfx-design-review" --exclude-dir=node_modules --exclude-dir=.next . | grep -v -e '^./harness/plans/' -e '^./harness/CHANGELOG.md' -e '^./harness/docs/reviews/' -e '^./harness/docs/catalog-changes/' -e '^./harness/docs/decisions/' -e '^./harness/docs/loop-run/' -e '^./harness/evals/evaluator-recall/'` → no output.

### Step 4: Changelog note

Append an "Unreleased" entry to `harness/CHANGELOG.md` (create the section if
absent, above the 0.2.0 entry): one line recording that the review skill's
procedure moved into the evaluator agent and the skill was removed, and that
plan 047 will carry the version bump.

**Verify**: `grep -n "Unreleased" harness/CHANGELOG.md` → one hit.

### Step 5: Full verification pass

Run, in order:

1. `python3 harness/checks/validate.py` → `OK: 48 controls valid`, exit 0.
2. `python3 harness/checks/validate.py --self-test` → `SELF-TEST OK (27 cases)`.
3. `python3 harness/checks/audit-record.py --self-test` → `SELF-TEST OK (21 cases)`.
4. `pnpm build` → exit 0 (the `content/harness/skills.mdx` edit must compile).

## Test plan

No unit tests exist for skills/agents. The verification is: the greps in Steps
1–3, the four commands in Step 5, and a manual smoke check — start a fresh Claude
Code session in the repo, ask it to "grade the attendance page against the
standard" and confirm the `tfx-design-evaluator` agent (not a missing skill)
would be the vehicle. If a live session is unavailable, note that the smoke
check was skipped.

## Done criteria

- [ ] `harness/.claude/skills/tfx-design-review/` no longer exists
- [ ] Agent file contains the full procedure (VERIFICATION LEDGER text present) and no `skills:` frontmatter line
- [ ] Live-reference grep (Step 3 verify) returns no output
- [ ] `python3 harness/checks/validate.py` exits 0
- [ ] `pnpm build` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any consumer OTHER than the agent frontmatter loads `tfx-design-review` as a
  skill (e.g. a `Skill` invocation or a `skills:` list in another agent) — the
  fold would break it.
- Removing the `skills:` line appears to break plugin validation (if a
  `claude plugin validate` command is available and fails on the manifest).
- The agent file after the merge exceeds ~260 lines and something in the plugin
  tooling rejects it — report rather than trimming the procedure.
- Current-state excerpts don't match the live files (drift).

## Maintenance notes

- Plan 047 renames the remaining skills and the agent; it assumes this plan
  landed (four skills, procedure inside the agent). If this plan is skipped,
  047's fallback is to rename the skill to `review`.
- Future rubric edits now happen in the agent file. `harness/docs/SYNC.md`
  documents fragment-sync conventions; the VERIFICATION LEDGER format is also
  asserted by `checks/audit-record.py` — a reviewer should scrutinise any diff
  that touches the ledger table format.
- Deferred deliberately: renaming (047) and any content edits to the procedure
  itself — this plan is a pure move.
