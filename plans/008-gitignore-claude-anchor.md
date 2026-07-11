# Plan 008: Anchor the `.claude/` gitignore pattern so `harness/.claude/` is tracked again

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT update `plans/README.md` — the reviewer
> maintains the index.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- .gitignore`
> If `.gitignore` changed since this plan was written, compare the
> "Current state" excerpt against the live file before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `233f3be`, 2026-07-11

## Why this matters

The unanchored pattern `.claude/` on line 9 of `.gitignore` matches a `.claude`
directory at **every** depth, not just the repo root. That swallows
`harness/.claude/` — the directory holding the Claude Code plugin's skills and
agents that `harness/.claude-plugin/plugin.json` points at. Already-tracked files
still show diffs, but any **new** file added under `harness/.claude/` (a new
skill, a new agent) is invisible to `git status` and silently never committed —
the published plugin would ship without it. Verified:
`git check-ignore -v harness/.claude/skills/copy/NEWFILE.md` → matched by
`.gitignore:9`.

## Current state

`.gitignore` lines 1–9 at commit `233f3be`:

```
node_modules/
.next/
out/
.env*
.DS_Store
*.tsbuildinfo
next-env.d.ts
.vercel
.claude/
```

The intent of line 9 is to ignore the repo-root `.claude/` directory (local
agent settings/worktrees — note `.claude/worktrees/` exists locally). A leading
slash anchors a gitignore pattern to the repo root.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Ignore check (root) | `git check-ignore -v .claude/settings.local.json` | matches `.gitignore` line with `/.claude/` |
| Ignore check (harness) | `touch harness/.claude/TESTFILE.md && git status --short harness/.claude/TESTFILE.md; rm harness/.claude/TESTFILE.md` | prints `?? harness/.claude/TESTFILE.md` |
| Tracked files intact | `git ls-files harness/.claude \| wc -l` | > 0, unchanged before/after |

## Scope

**In scope** (the only file you may modify):
- `.gitignore`

**Out of scope**:
- `harness/.gitignore` (does not exist — do not create one)
- Any file under `harness/.claude/` — this plan changes only ignore rules.

## Git workflow

- Branch: `advisor/008-gitignore-claude-anchor` from `233f3be`
- Commit style (from `git log`): conventional commits, e.g. `fix(repo): anchor .claude/ ignore to repo root so harness/.claude is tracked`
- Do NOT push or open a PR.

## Steps

### Step 1: Anchor the pattern

In `.gitignore`, change line 9 from `.claude/` to `/.claude/`.

**Verify**: `git check-ignore -v harness/.claude/skills/copy/SKILL.md; echo "exit=$?"` → no output, `exit=1` (NOT ignored).

### Step 2: Confirm the root directory is still ignored

**Verify**: `mkdir -p .claude && touch .claude/PROBE && git status --short .claude/PROBE; rm .claude/PROBE` → prints nothing (still ignored).

### Step 3: Confirm new harness skill files are visible

**Verify**: `touch harness/.claude/skills/copy/PROBE.md && git status --short harness/.claude/skills/copy/PROBE.md; rm harness/.claude/skills/copy/PROBE.md` → prints `?? harness/.claude/skills/copy/PROBE.md`.

## Test plan

No unit tests — gitignore behaviour is verified by the `git check-ignore` /
`git status` gates above.

## Done criteria

- [ ] `.gitignore` line reads `/.claude/`
- [ ] `git check-ignore harness/.claude/skills/copy/SKILL.md` exits 1
- [ ] `git check-ignore .claude` exits 0 (root still ignored)
- [ ] `git status --short` shows only the `.gitignore` change (plus any probe cleanup)

## STOP conditions

- `.gitignore` no longer contains a `.claude/` line (drifted).
- After the change, `git status` suddenly lists many files under a `.claude/`
  path you did not create — report before committing.

## Maintenance notes

- If per-directory Claude settings are ever wanted under a subdirectory, they
  will now be tracked; add a scoped ignore (e.g. `harness/.claude/settings.local.json`)
  rather than de-anchoring this pattern.
