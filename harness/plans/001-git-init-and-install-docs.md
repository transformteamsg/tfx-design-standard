# Plan 001: Initialize git and document how product teams install the harness

> **Status: completed and superseded (June 2026).** Historical record. The install
> specifics below have since changed — the marketplace now lives at the repo root
> (`.claude-plugin/marketplace.json`, `source: ./harness`) and install uses the published
> repo `transformteamsg/tfx-design-standard`. See the current `README.md` install section
> for the live commands; the `<git-url-of-this-repo>` placeholders here were resolved when
> the repo was published.

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: this repo had NO git history when the plan was
> written, so there is no SHA to diff against. Instead, confirm the "Current
> state" excerpts below match the live files before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (this plan unblocks commit-stamping for all later plans)
- **Category**: dx
- **Planned at**: `no-git (pre-init)`, 2026-06-10

## Why this matters

This repo is a Claude Code plugin (`tfx-design-harness`) meant to be installed
into product repos (Teacher Workspace, CaseSync, Glow) via Claude Code's plugin
marketplace flow. Marketplace installation requires the repo to be reachable as
a git source — but the directory is not even a local git repository, and the
README contains no installation instructions at all. The documented rollout
(TW → CaseSync → Glow) cannot start. This plan creates the git baseline and
writes the missing "Installation" section.

## Current state

- `/Users/rezailmi/Developer/design-harness/` — repo root. `ls .git` →
  "No such file or directory".
- `.claude-plugin/plugin.json` — valid plugin manifest, name
  `tfx-design-harness`, version `0.1.0`, custom paths
  `"skills": "./.claude/skills/"` and
  `"agents": ["./.claude/agents/design-evaluator.md"]`.
- `.claude-plugin/marketplace.json` — marketplace named `tfx`, one plugin entry
  with `"source": "./"`.
- `README.md` — has sections "Core ideas", "Repository layout",
  "The loop (summary…)", "Status & roadmap". There is NO
  installation/getting-started section. The "Status & roadmap" section ends
  with: `Rollout order: Teacher Workspace (flagship = reference implementation) → CaseSync →`
  `Glow → TW surfaces (Posts, PG Staff Portal).`
- Validation command that must keep passing: `claude plugin validate .` →
  `✔ Validation passed`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` |
| JSON lint | `python3 -m json.tool .claude-plugin/plugin.json` | exit 0 |
| Git state | `git status --short` | runs without error after step 1 |

## Scope

**In scope** (the only files you create/modify):
- `.gitignore` (create)
- `README.md` (add one section)
- git repository initialization + one initial commit

**Out of scope** (do NOT touch):
- Any file under `.claude/`, `standards/`, `checks/`, `docs/` — no content
  changes belong in this plan.
- Pushing to any remote. Creating the remote (GitHub/internal GitLab) is an
  organizational decision; this plan prepares for it and documents a
  placeholder URL only.
- `.claude-plugin/*.json` — the manifests are valid; do not edit.

## Git workflow

- This plan CREATES the git history. Branch: work directly on the initial
  default branch (`main`).
- Commit message style: conventional commits (`chore: ...`, `docs: ...`) — the
  repo has no history to match, so this plan sets the convention.
- Do NOT push or add a remote unless the operator instructed it.

## Steps

### Step 1: Initialize the repository

Create `.gitignore` at repo root with exactly:

```
.DS_Store
node_modules/
*.log
```

Then: `git init -b main && git add -A && git commit -m "chore: initial commit — TFX design harness v0.1 (skills, catalog, plugin manifests)"`

**Verify**: `git log --oneline` → exactly one commit; `git status --short` → empty output.

### Step 2: Add the Installation section to README.md

Insert a new `## Install` section in `README.md` immediately AFTER the
"Repository layout" section (i.e., after the closing code fence of the layout
tree) and BEFORE "## The loop (summary — full procedure in `design-ui` skill)".
Content:

```markdown
## Install

The harness ships as a Claude Code plugin. In your product repo (TW, CaseSync,
Glow):

​```
/plugin marketplace add <git-url-of-this-repo>   # placeholder until hosted — see note
/plugin install tfx-design-harness@tfx
​```

This installs the four skills (`design-ui`, `design-standards`,
`content-style`, `design-review`), the `design-evaluator` subagent, and the
control catalog (`standards/`) — the catalog ships with the plugin, not with
your repo.

To work on the harness itself, just open a Claude Code session in this
repository: the skills load from `.claude/skills/` automatically; no install
step.

> **Hosting note**: until this repo is pushed to a git host, replace
> `<git-url-of-this-repo>` with the local path to a checkout. The marketplace
> source must be reachable by every installing teammate.
```

(Remove the zero-width characters around the inner code fence when writing —
they exist only to nest the fence in this plan.)

**Verify**: `grep -n "## Install" README.md` → one match, line number between the
"Repository layout" and "The loop" sections; `claude plugin validate .` →
`✔ Validation passed`.

### Step 3: Commit

`git add README.md && git commit -m "docs: add install instructions for product teams"`

**Verify**: `git log --oneline` → two commits; `git status --short` → empty.

## Test plan

No test framework exists in this repo (markdown/JSON only). Verification is the
command gates above plus: open `README.md` and confirm the Install section
renders with both commands visible.

## Done criteria

- [ ] `git log --oneline | wc -l` ≥ 2
- [ ] `git status --short` → empty
- [ ] `grep -c "plugin install tfx-design-harness@tfx" README.md` → 1
- [ ] `claude plugin validate .` → `✔ Validation passed`
- [ ] No files outside the in-scope list modified (`git show --stat HEAD` and `HEAD~1`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- A `.git` directory already exists (someone initialized it since this plan was
  written) — reconcile manually rather than re-initializing.
- `claude plugin validate .` fails at any step.
- README.md no longer contains a "Repository layout" section (drift).

## Maintenance notes

- After a remote exists, update the placeholder `<git-url-of-this-repo>` in
  README.md and consider tagging `v0.1.0` to match `plugin.json`.
- All later plans assume git exists and stamp real SHAs; once this lands,
  update the "Planned at" convention note in `plans/README.md`.
