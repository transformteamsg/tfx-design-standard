# Plan 055: Make `onboard` a real onboarding skill — tour + per-user harness setup (agent-browser CLI + skill, gh, PyYAML)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told you
> they maintain the index.
>
> **Drift check (run first)**, from the repo root:
> `git diff --stat 34c333c..HEAD -- harness/.claude/skills/onboard harness/.claude/skills/design/verify.md harness/.claude/skills/design/critique.md harness/README.md harness/CLAUDE.md harness/docs/ONBOARDING.md harness/.claude-plugin/plugin.json harness/CHANGELOG.md harness/evals/routing/prompts.yaml`
> If any listed file changed since `34c333c`, compare the "Current state"
> excerpts below against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (a skill `description:` change — routing is the blast radius; mitigated by the mandatory full sweep in step 8)
- **Depends on**: none (047/049/052/054 have all landed on `main`)
- **Category**: dx
- **Planned at**: commit `34c333c`, 2026-07-02

## Why this matters

The `onboard` skill is a guided tour only — it orients and hands off, but sets
nothing up. Meanwhile the harness has real per-user tool dependencies that
nothing installs or verifies: the design loop's **first-preference capture
mechanism** is the `agent-browser` CLI (`design/verify.md` and
`design/critique.md` both say "if installed" and silently fall through when it
isn't), the `feedback` skill needs an authenticated `gh`, and the
`checks/*.py` scripts need Python 3 with PyYAML. A new user's first loop run
hits capture fallthrough mid-verify instead of being set up front.

Operator direction (2026-07-02): make setup part of onboarding — replace the
tour-only skill with an actual onboarding skill that also sets up the
dependencies, agent-browser (skill + CLI) being the named example. The skill
edit must follow the writing-great-skills principles inlined below.

**Naming decision (do not revisit):** the skill stays `onboard`. Plan 047 just
renamed the whole stack to single tokens after a full routing sweep; renaming
again to `onboarding` would force another consumer migration for zero routing
benefit (routing is decided by the `description:`, not the name). This plan
changes what the skill *does*, not what it is called.

## Current state

Files and their roles (paths relative to repo root unless noted):

- `harness/.claude/skills/onboard/SKILL.md` — the tour-only skill (69 lines).
  Frontmatter as of `34c333c`:

  ```yaml
  name: onboard
  description: A guided first-run tour of the TFX design harness for someone new to it. Orient them, then hand off to the real loop. Use ONLY when a person explicitly asks to be onboarded to or taught the harness itself ("onboard me", "how do I use this harness", "teach me the loop", "I'm new to the TFX design harness", "what can this harness do", or the /tfx:onboard command). NOT for designing or changing a page, screen, form, or component; those always go to design, even when phrased as "how do I…". NOT for making a product repo harness-ready; that is the team onboarding guide.
  ```

  Its step 2 ("Route by run-shape — one question") currently offers three
  shapes: (1) review/redesign an existing page → `design`; (2) new page from
  intent → `design`; (3) a single focused run → `content` / `standards` /
  `feedback`. Its boundary paragraph after step 2 reads:

  ```
  If they ask to **set up a product repo to use the harness**, that is the wrong tool:
  point them to the team onboarding guide (`../../../docs/ONBOARDING.md`, relative to
  this SKILL.md) and stop.
  ```

- `harness/.claude/skills/design/verify.md:33-40` — capture preference list:

  ```
  Capture mechanism, in order of preference: (1) the `agent-browser` CLI if
  installed (`agent-browser --help` to confirm; it has intermittently returned
  "os error 35" — if it misbehaves, fall through) — navigate to the route, set
  the viewport to the target width, screenshot; (2) Claude-in-Chrome or the
  user's installed browser agent; (3) the local Playwright fallback; (4) ask
  the user to provide the screenshot.
  ```

- `harness/.claude/skills/design/critique.md:7-13` — same preference list in
  shorter form: "(1) the `agent-browser` CLI if installed (`agent-browser
  --help` to confirm) — navigate to the route, set the viewport to the target
  width, screenshot; (2) Claude-in-Chrome …; (3) the local Playwright
  fallback; (4) ask the user…".

- `harness/.claude/skills/feedback/SKILL.md` — **the exemplar for consent
  gates and unattended honesty. Read it before writing setup.md.** Its step 4
  ("Confirm before filing — … In an unattended run, do NOT file — emit the
  dry-run output … and mark it 'queued, not filed'") is the pattern the
  install gate must mirror. It also demonstrates plugin-portable pathing:
  `../../../docs/harness-feedback.md` "(resolve relative to this SKILL.md,
  three levels up — it ships with the plugin)".

- `harness/README.md` — line 19 (architecture diagram): `├─ onboard (guided
  tour)`; line 73 (directory tree): `│   │   ├── onboard/          # guided
  first-run tour of the harness`; line 109 (Install section): "This installs
  the five skills (`design`, `standards`, `content`, `onboard`, `feedback`),
  the `evaluator` subagent …".

- `harness/CLAUDE.md` — "Where things live" table row:
  `| Onboard a new user — learn the skills and the loop | `onboard` skill (guided tour) |`

- `harness/docs/ONBOARDING.md` — the **team** onboarding guide (repo-level
  adoption: stack, manifest, record locations, L1 approver). Item 0 ("Install
  the plugin") points at the README Install commands. This doc keeps
  ownership of everything **per-repo**; this plan adds only a pointer for the
  **per-user** tools.

- `harness/.claude-plugin/plugin.json` — `"version": "0.3.0"`.

- `harness/CHANGELOG.md` — versioning tracks plugin.json; latest entry
  `## [0.3.0] — 2026-07-02`.

- `harness/evals/routing/prompts.yaml` — 38 cases. Header rule: "run the full
  sweep only when a skill's frontmatter `description:` changes — that is the
  text that decides triggering." Probe command (from the header):
  `claude -p "<prompt>" --max-turns 2 --output-format json` in a **fresh**
  session at the repo root. Current `onboard` block (3 positive cases + 2
  boundary guards) sits under the comment
  `# ── onboard: explicit "onboard / teach me the harness" intent only ──`.

### The dependency inventory (verified 2026-07-02 — this is what setup.md manages)

| Tool | Used by | Check (exit 0 = present) | Install |
|---|---|---|---|
| `agent-browser` CLI | `design` capture, first preference (verify.md, critique.md) | `agent-browser --help` | `npm i -g agent-browser && agent-browser install` (second command downloads its Chromium; needs Node ≥ 18). Post-install health check: `agent-browser doctor --offline --quick` → exit 0 |
| agent-browser **skill** (Claude Code plugin, publisher Vercel) | teaches the agent the CLI's full command set | plugin list shows `agent-browser` | user types `/plugin marketplace add vercel-labs/agent-browser` then `/plugin install agent-browser@agent-browser`, then `/reload-plugins` — these are Claude Code UI commands, not shell commands |
| `gh` CLI, authenticated | `feedback` skill → `scripts/file-feedback-issue.py` | `gh auth status` | `brew install gh` (macOS), then the **user** runs `gh auth login` (interactive; never run it for them) |
| Python 3 + PyYAML | `checks/validate.py`, `reaudit-scope.py`, `waiver-reconcile.py` (`import yaml`) | `python3 -c "import yaml"` | `python3 -m pip install --user pyyaml` |
| `tfx` plugin itself (product repos only) | everything | plugin list shows `tfx` | the two README Install commands (`/plugin marketplace add transformteamsg/tfx-design-standard`, `/plugin install tfx@tfx`) |

The CLI is the hard dependency for capture; the agent-browser *skill* is
recommended, not required (the CLI's `--help` is self-documenting).

### Writing-great-skills principles that bind this edit

The operator explicitly asked for the skill rewrite to follow the
writing-great-skills guidance. The rules that apply here, inlined because the
executor does not have that skill:

1. **Branches decide disclosure.** A branch is a distinct way a run goes
   through the skill. This skill now has two: *tour* and *setup*. Inline in
   SKILL.md only what every branch needs; push what only the setup branch
   reaches into a sibling file (`setup.md`) behind a **context pointer** —
   the pointer's *wording* decides whether the agent actually loads it, so
   phrase it as an instruction ("read `setup.md` (beside this file) and follow
   it"), not a mention.
2. **Description = triggers, one per branch.** No synonym pile-ups: one
   trigger phrase per genuinely distinct branch, boundaries kept. Every word
   of the description is always-loaded context; prune hard.
3. **Checkable completion criteria.** Each setup row ends in a command whose
   exit status tells the agent done from not-done ("`gh auth status` exits 0"),
   never "make sure it works".
4. **No no-ops, no duplication.** Do not restate the README install commands
   in setup.md prose *and* the table; the table is the single source. Do not
   restate the honesty rule beyond one line pointing at `checks/README.md`'s
   existing statement.
5. **SLP-9 binds this prose** (it is harness prose): second person, plain
   language, Singapore English, no AI-writing tells.

## Commands you will need

All run from `harness/` unless noted:

| Purpose | Command | Expected on success |
|---|---|---|
| Catalog + parity validation | `python3 checks/validate.py` | `OK: 48 controls valid` (count may be higher if the catalog grew — any `OK:` line, exit 0) |
| Plugin manifest validation | `claude plugin validate .` (or `claude plugin validate harness` from repo root) | exit 0 — one pre-existing warning about root CLAUDE.md is expected; new warnings are not |
| Routing probe (per case, from **repo root**, fresh session each) | `claude -p "<prompt>" --max-turns 2 --output-format json` | expected skill name appears in the transcript's Skill tool calls; for `expect: none`, no harness skill appears |
| Scope check | `git status --short` | only in-scope files modified |

## Scope

**In scope** (the only files you may modify):

- `harness/.claude/skills/onboard/SKILL.md`
- `harness/.claude/skills/onboard/setup.md` (create)
- `harness/.claude/skills/design/verify.md` (one line)
- `harness/.claude/skills/design/critique.md` (one line)
- `harness/README.md` (three small edits)
- `harness/CLAUDE.md` (one table row)
- `harness/docs/ONBOARDING.md` (one short subsection in item 0)
- `harness/.claude-plugin/plugin.json` (version bump)
- `harness/CHANGELOG.md` (new entry)
- `harness/evals/routing/prompts.yaml` (add cases)
- `harness/plans/README.md` (status row)

**Out of scope** (do NOT touch, even though they look related):

- The skill's **name** (`onboard`) and directory name — see the naming
  decision above. No rename, no new skill.
- `harness/docs/UPDATING.md` — no reinstall is required for a body/description
  change; the normal update flow covers it.
- `harness/docs/index.html` — its "five skills … onboarding" line stays
  accurate; do not restyle it.
- The `standards/` catalog and every `checks/*.py` — no control or check
  changes here.
- `harness/.claude/skills/design/SKILL.md` — the capture pointers live in
  verify.md/critique.md only.
- The website (`app/`, `components/`, `content/`, `lib/`) — nothing here is
  published on the site.
- Historical records (`harness/plans/0*.md` except the README row,
  `docs/decisions/`, `docs/reviews/`, `CHANGELOG` back-entries).

## Git workflow

- Branch: `advisor/055-onboard-setup` off `main`.
- Commit per logical unit; message style matches repo, e.g.
  `feat(harness): onboard skill covers per-user setup — agent-browser, gh, PyYAML (plan 055)`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `harness/.claude/skills/onboard/setup.md`

Create the file with this content (adjust only if a Current-state fact has
drifted — then STOP first):

```markdown
# Harness setup — per-user tools

Check, install, and verify the tools the harness relies on. Everything here
is per-person, per-machine. Repo-level adoption — stack, component manifest,
record locations, the named L1 approver — lives in the team onboarding guide
(`../../../docs/ONBOARDING.md`, relative to this file; it ships with the
plugin).

Two rules bind every row:

- **Ask before installing.** Show the exact command, get a yes, then run it.
  In an unattended run, install nothing — list what is missing with the
  commands a human should run, marked "missing, not installed".
- **Verify, then say so.** A tool is set up when its check command passes;
  report the actual output. Never claim more than the check shows — the same
  honesty line the checks hold (`../../../checks/README.md`).

Work the table top to bottom: run the check; if it passes, move on; if not,
offer the install, run it (or hand it to the user where marked), and re-run
the check.

| Tool | Why the harness needs it | Check (exit 0 = present) | Install |
|---|---|---|---|
| `agent-browser` CLI | First-preference screenshot capture in the design loop's critique and verify phases | `agent-browser --help` | `npm i -g agent-browser && agent-browser install` (the second command downloads its Chromium; needs Node 18+) |
| agent-browser skill | Teaches the agent the CLI's full command set (recommended; the CLI alone is enough for capture) | ask the user: `/plugin list` shows `agent-browser` | the user types `/plugin marketplace add vercel-labs/agent-browser`, then `/plugin install agent-browser@agent-browser`, then `/reload-plugins` — Claude Code commands, not shell |
| `gh` CLI, authenticated | The `feedback` skill files issues through `scripts/file-feedback-issue.py` | `gh auth status` | `brew install gh`, then the user runs `gh auth login` themselves (interactive — never run it for them) |
| Python 3 + PyYAML | The `checks/*.py` scripts import `yaml` | `python3 -c "import yaml"` | `python3 -m pip install --user pyyaml` |
| `tfx` plugin (product repos only) | The harness itself; in this repo the skills load from `.claude/skills/` with no install | ask the user: `/plugin list` shows `tfx` | the two commands in the README Install section (`../../../README.md`) |

Close with one end-to-end health check:
`agent-browser doctor --offline --quick` → exit 0. If it fails, plain
`agent-browser doctor` diagnoses; `doctor --fix` makes destructive repairs —
ask before running it.

Finish by telling the user what passed, what was installed, and what is
still missing (and why), in one short list.
```

**Verify**: `test -f .claude/skills/onboard/setup.md && grep -c "agent-browser" .claude/skills/onboard/setup.md` → file exists, count ≥ 5.

### Step 2: Rewrite the `onboard` SKILL.md frontmatter description

Replace the `description:` value with (single line in the file):

```
Onboarding to the TFX design harness: a guided first-run tour, and setup of the per-user tools the harness relies on (the agent-browser capture CLI + skill, gh for feedback issues, Python deps for checks). Use when a person asks to be onboarded to or taught the harness itself ("onboard me", "how do I use this harness", "teach me the loop", the /tfx:onboard command), or to set up, install, or fix the harness's tooling on their machine ("set up the harness", "install the harness dependencies", "agent-browser isn't installed"). NOT for designing or changing a page, screen, form, or component; those always go to design, even when phrased as "how do I…". NOT for repo-level harness adoption — stack, manifest, record locations, L1 approver; that is the team onboarding guide.
```

Keep `name: onboard` untouched.

**Verify**: `grep -c "set up the harness" .claude/skills/onboard/SKILL.md` → ≥ 1; `python3 -c "import yaml,io; yaml.safe_load(io.StringIO(open('.claude/skills/onboard/SKILL.md').read().split('---')[1]))"` → exits 0 (frontmatter still parses).

### Step 3: Add the setup branch to the SKILL.md body

Three edits, keeping the existing tour steps 1–4 otherwise intact:

1. In the intro paragraph ("Someone new wants to learn how to use this
   harness…"), extend the first sentence so the skill's two jobs are named:
   orient and hand off, **or set up their machine's harness tooling**.
2. In step 2's run-shape list, add a fourth shape after (3):

   ```
   - **(4) Set up this machine for the harness** — install or fix the tools
     the loop relies on (screenshot capture, feedback filing, checks) → read
     `setup.md` (beside this SKILL.md) and follow it, then offer the tour or
     stop as they prefer.
   ```

3. Immediately before the run-shape question, add one probe line so a broken
   environment surfaces without lecturing:

   ```
   Before asking, run `agent-browser --help` once. If it fails, say in one
   line that capture is not set up yet and that shape (4) fixes it — then ask
   the question as normal.
   ```

Also update the existing boundary paragraph ("If they ask to **set up a
product repo**…") so the line it draws is per-repo vs per-user, e.g.: repo
adoption (manifest, records, approver) → team onboarding guide; their own
machine's tools → shape (4) here. Keep it to roughly the current length.

**Verify**: `grep -c "setup.md" .claude/skills/onboard/SKILL.md` → ≥ 2 (the shape-4 pointer and any close-step mention); `grep -c "agent-browser --help" .claude/skills/onboard/SKILL.md` → 1.

### Step 4: Point the design skill's capture fallthroughs at setup.md

In `harness/.claude/skills/design/verify.md`, inside preference (1) after
"`agent-browser --help` to confirm; it has intermittently returned "os error
35" — if it misbehaves, fall through)", insert a clause so the sentence offers
setup on the *not-installed* case, e.g.:

```
(1) the `agent-browser` CLI if installed (`agent-browser --help` to confirm;
not installed → offer setup once via `../onboard/setup.md` before falling
through; it has intermittently returned "os error 35" — if it misbehaves,
fall through) — navigate to the route, …
```

Make the equivalent one-clause edit in `critique.md`'s preference (1). Do not
otherwise reflow either list.

**Verify**: `grep -c "onboard/setup.md" .claude/skills/design/verify.md .claude/skills/design/critique.md` → exactly 1 per file.

### Step 5: Update the three describing surfaces

1. `harness/README.md:19` — diagram label `├─ onboard (guided tour)` →
   `├─ onboard (tour + setup)` (shorter than the original; diagram alignment
   is safe — confirm columns still line up by eye).
2. `harness/README.md:73` — tree comment → `# first-run tour + per-user tool setup`.
3. `harness/README.md` Install section — after the "This installs the five
   skills…" paragraph, add one sentence (not a new heading):
   `The design loop captures screenshots with the agent-browser CLI — to set it and the other per-user tools up, run the onboard skill and pick setup (the checklist lives in .claude/skills/onboard/setup.md).`
4. `harness/CLAUDE.md` "Where things live" row →
   `| Onboard a new user — learn the loop, set up the tools | \`onboard\` skill (tour + setup) |`
5. `harness/docs/ONBOARDING.md` item 0 — append a short paragraph after the
   existing "If you are working on the harness itself…" paragraph:

   ```
   **Per-user tools.** The plugin install is per-repo; the capture and
   filing tools are per-person. Each teammate runs the `onboard` skill and
   picks setup (or follows `.claude/skills/onboard/setup.md` in this repo):
   the agent-browser CLI + skill for screenshots, an authenticated `gh` for
   harness feedback, Python with PyYAML for the check scripts.
   ```

Point at setup.md; do **not** restate its install commands in any of these
surfaces (single source of truth).

**Verify**: `grep -c "tour + setup" README.md CLAUDE.md` → ≥ 1 each; `grep -c "Per-user tools" docs/ONBOARDING.md` → 1.

### Step 6: Version bump + CHANGELOG

- `harness/.claude-plugin/plugin.json`: `"version": "0.3.0"` → `"0.4.0"`.
- `harness/CHANGELOG.md`: add above the 0.3.0 entry:

  ```markdown
  ## [0.4.0] — <today's date>

  Onboarding now sets up the machine, not just the mental model.

  ### Added
  - `onboard` gains a setup branch: new `setup.md` checklist installs and
    verifies the per-user tools (agent-browser CLI + skill, authenticated
    `gh`, Python + PyYAML) behind an ask-first consent gate; unattended runs
    report instead of installing (plan 055).
  - The design skill's verify/critique capture steps point at that checklist
    when agent-browser is missing, instead of silently falling through.

  ### Changed
  - `onboard`'s description now also triggers on setup intent ("set up the
    harness", "install the harness dependencies"). Routing sweep re-run —
    see plans/055.
  ```

**Verify**: `claude plugin validate .` → exit 0, no new warnings; `grep -c "0.4.0" .claude-plugin/plugin.json CHANGELOG.md` → 1 and ≥ 1.

### Step 7: Add routing cases

In `harness/evals/routing/prompts.yaml`, extend the `onboard` block with the
new-branch cases and add one trap to each boundary set:

```yaml
  # ── onboard: setup branch ──
  - prompt: "Set up the TFX design harness on my machine"
    expect: onboard
  - prompt: "Install the agent-browser CLI so the design loop can take screenshots"
    expect: onboard
  - prompt: "The harness says capture isn't set up — install what it needs"
    expect: onboard

  # ── boundary guards: setup wording must NOT capture design or generic installs ──
  - prompt: "Set up a new attendance page for Teacher Workspace"
    expect: design
  - prompt: "Install prettier and set up ESLint in this repo"
    expect: none
```

Update the header's case-count line ("a full sweep is 38 headless sessions" →
the new total, 43).

**Verify**: `python3 -c "import yaml; d=yaml.safe_load(open('evals/routing/prompts.yaml')); print(len(d['cases']))"` → 43.

### Step 8: Run the full routing sweep

The frontmatter `description:` changed, so the full sweep is mandatory (the
prompts.yaml header rule; precedent: plan 047 ran 33/33 via `--plugin-dir`).
From the **repo root**, one fresh headless session per case:

`claude -p "<prompt>" --max-turns 2 --output-format json --plugin-dir harness`

Score each case per the header's pass rule. Record the full results matrix
(case → expected → observed → pass/fail) in the plan-055 section of your
final report and in the commit message body.

**Pass bar**: 43/43. Special attention: the two pre-existing onboard boundary
guards ("How do I add a remarks field…", "How do I design a settings
screen…") must still route to `design`, and the new "Set up a new attendance
page" case must route to `design` — those prove the setup triggers did not
make `onboard` greedy.

If a case fails: you may revise the `description:` once (tighten the failing
trigger or boundary phrase), then re-run the failing case plus the five
onboard-adjacent cases. If anything still fails after that one revision, STOP
and report the matrix.

**Verify**: recorded matrix shows 43/43 pass.

### Step 9: Final gates

From `harness/`:

1. `python3 checks/validate.py` → `OK:` line, exit 0.
2. `claude plugin validate .` → exit 0, only the pre-existing root-CLAUDE.md warning.
3. `git status --short` → only in-scope files.
4. Update the 055 row in `harness/plans/README.md`.

## Test plan

There is no unit-test surface for skill prose; the tests are the eval layers
that exist for exactly this purpose:

- **Routing** (step 8): full 43-case sweep — this is the regression suite for
  the description change, including the two new negative cases.
- **Deterministic gates** (step 9): `validate.py` (catalog + parity untouched)
  and `claude plugin validate` (manifest still well-formed).
- **Content greps** (each step's Verify line): setup.md exists and is referenced
  from SKILL.md, verify.md, critique.md; single-source rule held (install
  commands appear in setup.md's table and nowhere else in the touched docs —
  check: `grep -rn "npm i -g agent-browser" README.md CLAUDE.md docs/ONBOARDING.md .claude/skills/design/` → no matches).

## Done criteria

ALL must hold (run from `harness/` unless noted):

- [ ] `test -f .claude/skills/onboard/setup.md` → exists
- [ ] `grep -c "onboard/setup.md" .claude/skills/design/verify.md .claude/skills/design/critique.md` → 1 each
- [ ] `grep -rn "npm i -g agent-browser" README.md CLAUDE.md docs/ONBOARDING.md .claude/skills/design/` → no matches (setup.md is the single source)
- [ ] `python3 checks/validate.py` → exit 0
- [ ] `claude plugin validate .` → exit 0, no new warnings
- [ ] Routing sweep matrix recorded, 43/43 pass (or the STOP report explains exactly which cases could not run and why)
- [ ] `grep '"version": "0.4.0"' .claude-plugin/plugin.json` → 1 match; CHANGELOG has the 0.4.0 entry
- [ ] `git status --short` shows only in-scope files modified
- [ ] `harness/plans/README.md` 055 row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any "Current state" excerpt no longer matches the live file (drift since `34c333c`).
- `agent-browser --help` / the vercel-labs marketplace facts can't be
  confirmed in your environment (e.g. the marketplace add command errors, the
  plugin has been renamed, or `npm i -g agent-browser` no longer exists as a
  package). Do **not** substitute a different install path — the inventory
  table is normative; report what you found.
- Your environment cannot run headless `claude -p` probes (step 8). Complete
  steps 1–7 and 9, then STOP with the sweep marked "not run — environment"
  so a human or orchestrator runs it before merge. Never report the sweep as
  passed without running it.
- Routing still fails after the single permitted description revision.
- The edit seems to require touching `design/SKILL.md`, the catalog, or any
  out-of-scope file.

## Maintenance notes

- **The inventory table in setup.md will rot fastest** — install commands and
  the marketplace path (`vercel-labs/agent-browser`) are third-party facts.
  Reviewers of future agent-browser bumps should re-check the table; a stale
  install command in an onboarding skill is worse than none.
- Plan 052's review noted the installed agent-browser build lacked a working
  viewport-resize subcommand; if capture keeps misbehaving after setup,
  `agent-browser upgrade` + `doctor` are the first moves — a future revision
  of setup.md could pin a minimum version once one is known-good.
- If a future plan ever renames `onboard` → anything else, the hardcoded
  `../onboard/setup.md` pointers in verify.md/critique.md must move with it
  (grep `onboard/setup.md`).
- Reviewer scrutiny: the description is the risk surface. Check the sweep
  matrix, not the prose — especially the three design/none boundary cases
  listed in step 8's pass bar.
- Deferred deliberately: wiring a dependency check into the design loop
  itself (e.g. a Phase-0 environment probe) — the one probe line in the
  onboard skill plus the verify.md pointer covers the observed failure mode
  at near-zero context cost; revisit only if capture fallthrough recurs
  after this lands.
