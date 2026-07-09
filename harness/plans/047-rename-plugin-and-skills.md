# Plan 047: Rename the plugin to `tfx` and the skills to short single-token names

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat c42d695..HEAD -- harness/ .claude-plugin/ README.md CLAUDE.md content/harness/ content/guidelines/voice-tone.mdx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. (Plan 046 landing first is expected
> drift — it removes the tfx-design-review skill; proceed with four skills.)

## Status

- **Priority**: P1
- **Effort**: M–L
- **Risk**: MED
- **Depends on**: harness/plans/046-fold-review-skill-into-evaluator.md (soft — see fallback in Step 2)
- **Category**: dx
- **Planned at**: commit `c42d695`, 2026-07-02

## Why this matters

Installed as a plugin, the skills are namespaced by plugin name, so today's full
names read `tfx-design-harness:tfx-design-ui` — "tfx" twice, "design" twice. The
marketplace this repo publishes (`.claude-plugin/marketplace.json`) is already
named `tfx`. Renaming the plugin to `tfx` and each skill to its one
distinguishing token gives `tfx:design`, `tfx:standards`, `tfx:content`,
`tfx:onboard`, and the `tfx:evaluator` agent — short, readable, and in line with
how mature design-skill suites name commands (impeccable.style uses single
discipline words: craft, critique, polish). The rename is low-risk for routing
accuracy because skill triggering is decided by the `description:` frontmatter,
not the name (stated in `harness/evals/routing/prompts.yaml:13-15`) — the cost is
mechanical reference updates plus a routing re-check, both specified below.

## Current state

- `.claude-plugin/marketplace.json` (repo root) — marketplace `"name": "tfx"`,
  one plugin entry:

  ```json
  "plugins": [
    { "name": "tfx-design-harness", "source": "./harness", "description": "The TFX Design Standard harness: design-ui loop, control catalog, voice & tone, and evaluator agent for Teacher & School products" }
  ]
  ```

- `harness/.claude-plugin/plugin.json` — `"name": "tfx-design-harness"`,
  `"version": "0.2.0"`, `"skills": "./.claude/skills/"`,
  `"agents": ["./.claude/agents/tfx-design-evaluator.md"]`.

- Skills on disk after plan 046 (each dir name = skill name in its SKILL.md
  frontmatter): `tfx-design-ui` (451 lines + `implement-craft.md`),
  `tfx-design-standards` (101), `tfx-content-style` (144),
  `tfx-design-onboarding` (65).

- `harness/checks/validate.py` hard-codes two skill paths that break silently on
  rename (the sync checks skip missing files via `if not os.path.isfile(fpath): continue`):
  - line ~212: `os.path.join(repo_root, ".claude", "skills", "tfx-design-ui", "SKILL.md")` ([L0-SYNC])
  - line ~241: `con_path = os.path.join(repo_root, ".claude", "skills", "tfx-content-style", "SKILL.md")` ([SLP9-SYNC])

- `harness/evals/routing/prompts.yaml` — header comment enumerates the skills;
  `expect:` values use the old names; the policy line (13–15): "run the full
  sweep only when a skill's frontmatter `description:` changes — that is the
  text that decides triggering".

- Cross-references INSIDE skill files: `tfx-design-ui/SKILL.md` references
  `tfx-design-standards` (frontmatter description + Load-first note),
  `tfx-content-style` (description + Phase 4, including the relative path
  `../tfx-content-style/SKILL.md`), and `tfx-design-evaluator` (Phase 5).
  `tfx-design-onboarding/SKILL.md` references all the others by name.
  `tfx-content-style/SKILL.md` and `tfx-design-standards/SKILL.md` each
  reference `tfx-design-ui` in their descriptions. **These name mentions sit
  inside `description:` frontmatter, so descriptions DO change (name
  substitutions only) — per the prompts.yaml policy, run the FULL routing
  sweep, not just a spot-check.**

- Root-repo references: `README.md` lines ~12–30 (skill list, install command
  `/plugin install tfx-design-harness@tfx`, update command, `/tfx-design-onboarding`
  mention), `CLAUDE.md` line ~17 (`tfx-content-style` skill),
  `content/harness/skills.mdx` (skills table), `content/guidelines/voice-tone.mdx`
  line ~7 (`tfx-content-style`).

- Harness docs referencing names (update all): `harness/CLAUDE.md` (Where things
  live table + always-on rules), `harness/README.md` (diagram, install, loop
  summary), `harness/CONTRIBUTING.md`, `harness/checks/README.md`,
  `harness/docs/SYNC.md`, `harness/docs/ONBOARDING.md`, `harness/docs/UPDATING.md`,
  `harness/docs/index.html`, `harness/docs/spikes/layout-category/SPEC.md`,
  `harness/docs/decisions/TEMPLATE.md`, `harness/standards/README.md`,
  `harness/standards/controls/cmp-2.md`, `cmp-7.md`, `cnt-1.md`, `slp-11.md`.

- **Historical, append-only files that must NOT be rewritten**: `harness/plans/*`
  (001–046), `harness/CHANGELOG.md` existing entries, `harness/docs/reviews/*`,
  `harness/docs/catalog-changes/*`, `harness/docs/decisions/*.md` existing
  records (including `submit-marks-review.md`), `harness/docs/loop-run/*`,
  `harness/evals/evaluator-recall/RESULTS.md`.

## The rename table (apply exactly)

| Old | New | Namespaced result |
|-----|-----|-------------------|
| plugin `tfx-design-harness` | `tfx` | — |
| skill `tfx-design-ui` | `design` | `tfx:design` |
| skill `tfx-design-standards` | `standards` | `tfx:standards` |
| skill `tfx-content-style` | `content` | `tfx:content` |
| skill `tfx-design-onboarding` | `onboard` | `tfx:onboard` |
| agent `tfx-design-evaluator` | `evaluator` | `tfx:evaluator` |
| (if 046 skipped) skill `tfx-design-review` | `review` | `tfx:review` |

Prose references change accordingly: "the `tfx-design-ui` loop" → "the
`tfx:design` loop" in installed-context docs (root README, website content),
and "the `design` skill" in harness-internal docs where the namespace is not
in play. The waiver syntax `tfx-waive`, the `tfx-sync` markers, control ids,
and the `.tfx/component-manifest.json` path are NOT part of this rename —
do not touch them.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Catalog + sync validation | `python3 harness/checks/validate.py` | `OK: 48 controls valid` + `[L0-SYNC]`/`[SLP9-SYNC]` pass, exit 0 |
| Validator self-test | `python3 harness/checks/validate.py --self-test` | `SELF-TEST OK (27 cases)` |
| Website build | `pnpm build` | exit 0 |
| Old-name sweep | `grep -rn "tfx-design-ui\|tfx-content-style\|tfx-design-standards\|tfx-design-onboarding\|tfx-design-evaluator\|tfx-design-harness" --exclude-dir=node_modules --exclude-dir=.next .` | only historical dirs (see Step 8) |
| Routing probe (per case) | `claude -p "<prompt>" --max-turns 2 --output-format json` | expected skill fires (see prompts.yaml `how_to_run`) |

## Scope

**In scope**:
- `.claude-plugin/marketplace.json`, `harness/.claude-plugin/plugin.json`
- `harness/.claude/skills/*` (directory renames + frontmatter + cross-references)
- `harness/.claude/agents/tfx-design-evaluator.md` → renamed file + frontmatter
- `harness/checks/validate.py` (two path strings only)
- `harness/evals/routing/prompts.yaml`
- The live docs listed in "Current state" (harness docs + root README/CLAUDE.md + the two content/*.mdx files)
- `harness/CHANGELOG.md` (new 0.3.0 entry), `harness/docs/UPDATING.md` (migration section)

**Out of scope** (do NOT touch):
- Historical/append-only files listed above.
- `harness/standards/catalog.yaml` content other than nothing — the catalog does
  not reference skill names; leave it alone.
- Skill `description:` wording beyond substituting the renamed skill/agent names.
  Changing the descriptive text itself would change routing behaviour and is
  plan-049 territory at most.
- `tfx-waive`, `tfx-sync`, `.tfx/` — different namespaces, same prefix.

## Git workflow

- Branch: `advisor/047-rename-skill-stack`
- Commits: one per step group; style `refactor(harness): rename plugin to tfx, skills to design/standards/content/onboard`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Rename the plugin and agent

1. `harness/.claude-plugin/plugin.json`: `"name": "tfx"`, `"version": "0.3.0"`,
   `"agents": ["./.claude/agents/evaluator.md"]`. Leave `displayName`
   ("TFX Design Harness"), keywords, etc. unchanged.
2. `.claude-plugin/marketplace.json`: plugin entry `"name": "tfx"` (source and
   description unchanged, but update the description's "design-ui loop" phrase to
   "design loop").
3. `git mv harness/.claude/agents/tfx-design-evaluator.md harness/.claude/agents/evaluator.md`
   and set its frontmatter `name: evaluator`. In its description, replace
   "verify phase of tfx-design-ui" with "verify phase of the design skill".

**Verify**: `python3 -c "import json; p=json.load(open('harness/.claude-plugin/plugin.json')); print(p['name'], p['version'], p['agents'])"` → `tfx 0.3.0 ['./.claude/agents/evaluator.md']`.

### Step 2: Rename the four skill directories and their frontmatter

```
git mv harness/.claude/skills/tfx-design-ui        harness/.claude/skills/design
git mv harness/.claude/skills/tfx-design-standards harness/.claude/skills/standards
git mv harness/.claude/skills/tfx-content-style    harness/.claude/skills/content
git mv harness/.claude/skills/tfx-design-onboarding harness/.claude/skills/onboard
```

In each SKILL.md set `name:` to the new name. If plan 046 did NOT land and
`tfx-design-review` still exists, also `git mv` it to `review` with `name: review`.

Then fix intra-skill references:
- `design/SKILL.md`: description mentions of `tfx-content-style` → `content`
  skill, `tfx-design-standards` → `standards` skill; body references likewise;
  the relative path `../tfx-content-style/SKILL.md` → `../content/SKILL.md`;
  Phase 5's `tfx-design-evaluator` → `evaluator` agent. Do NOT alter the
  `tfx-sync:L0` block content (lines ~18–22) beyond nothing — it is
  parity-checked.
- `standards/SKILL.md`: `tfx-design-ui` → `design`; `tfx-content-style` →
  `content`; the installed-plugin phrase "installed as the `tfx-design-harness`
  plugin" → "installed as the `tfx` plugin".
- `content/SKILL.md`: `tfx-design-ui` → `design`; same installed-plugin phrase
  fix. Do NOT alter the `tfx-sync:slp9-buzzwords` block.
- `onboard/SKILL.md`: all four names + the agent; the description's
  "/tfx-design-onboarding command" → "/tfx:onboard command".
- `design/implement-craft.md`: check with grep for old names; update if present.

**Verify**: `ls harness/.claude/skills/` → `content design onboard standards` (plus `review` only in the 046-skipped fallback), and `grep -rn "name:" harness/.claude/skills/*/SKILL.md` shows the new names.

### Step 3: Update validate.py's two hard-coded paths

Line ~212: `"tfx-design-ui"` → `"design"`. Line ~241: `"tfx-content-style"` →
`"content"`.

**Verify**: `python3 harness/checks/validate.py` → exit 0 AND the output includes
the sync checks passing (it must NOT silently skip them — to prove the paths
resolve, temporarily corrupt one marker and confirm the check FIRES, then revert:
edit `harness/.claude/skills/design/SKILL.md`'s L0 block to remove `A11Y-1`, run
validate, expect `[L0-SYNC]` ERROR and exit 1, then `git checkout -- harness/.claude/skills/design/SKILL.md`).

### Step 4: Update the routing eval file

`harness/evals/routing/prompts.yaml`: header comment skill enumeration → new
names; every `expect: tfx-design-ui` → `expect: design`, `tfx-content-style` →
`content`, `tfx-design-standards` → `standards`, `tfx-design-onboarding` →
`onboard`. `expect: none` semantics unchanged.

**Verify**: `grep -c "expect: tfx-" harness/evals/routing/prompts.yaml` → `0`.

### Step 5: Update harness docs

Apply the rename table across: `harness/CLAUDE.md`, `harness/README.md`
(including the install commands → `/plugin install tfx@tfx`, `/plugin update
tfx@tfx`), `harness/CONTRIBUTING.md`, `harness/checks/README.md`,
`harness/docs/SYNC.md` (it names the two consumer files by path — update the
paths), `harness/docs/ONBOARDING.md`, `harness/docs/UPDATING.md`,
`harness/docs/index.html`, `harness/docs/spikes/layout-category/SPEC.md`,
`harness/docs/decisions/TEMPLATE.md`, `harness/standards/README.md`,
`harness/standards/controls/cmp-2.md`, `cmp-7.md`, `cnt-1.md`, `slp-11.md`.

**Verify**: the old-name sweep (Commands table) over `harness/` returns hits ONLY
under `harness/plans/`, `harness/CHANGELOG.md`, `harness/docs/reviews/`,
`harness/docs/catalog-changes/`, `harness/docs/decisions/` (existing records),
`harness/docs/loop-run/`, `harness/evals/evaluator-recall/`.

### Step 6: Update root-repo and website references

- `README.md`: skill list, `/plugin install tfx@tfx`, `/plugin update tfx@tfx`,
  `/tfx-design-onboarding` → `/tfx:onboard`, "look for `tfx-design-harness`" →
  "look for `tfx`", "the `tfx-design-ui` loop" → "the `tfx:design` loop".
- `CLAUDE.md`: "the tfx-content-style skill" → "the `tfx:content` skill".
- `content/harness/skills.mdx`: table rows → new names (keep old name in
  parentheses on first mention, e.g. "`design` (formerly `tfx-design-ui`)" —
  the site documents the harness for humans who may have the old version).
- `content/guidelines/voice-tone.mdx`: "`tfx-content-style` skill" →
  "`tfx:content` skill".

**Verify**: `pnpm build` → exit 0.

### Step 7: Changelog + migration doc

- `harness/CHANGELOG.md`: add a `0.3.0` entry (date it) listing: plugin renamed
  `tfx-design-harness` → `tfx`; skills renamed per the table; review skill folded
  into the evaluator agent (fold the 046 Unreleased note into this entry);
  consumers must reinstall.
- `harness/docs/UPDATING.md`: add a migration section: `/plugin uninstall
  tfx-design-harness` (or remove via `/plugin`), `/plugin marketplace update tfx`,
  `/plugin install tfx@tfx`, restart or `/reload-plugins`. State plainly that
  0.2.x and 0.3.0 cannot coexist and that decision records referencing old skill
  names stay valid as history.

**Verify**: `grep -n "0.3.0" harness/CHANGELOG.md` → at least one hit.

### Step 8: Full-repo old-name sweep

Run the old-name sweep from the Commands table over the whole repo.

**Verify**: every remaining hit is inside `harness/plans/`,
`harness/CHANGELOG.md`, `harness/docs/reviews/`, `harness/docs/catalog-changes/`,
`harness/docs/decisions/` (pre-existing records), `harness/docs/loop-run/`,
`harness/evals/evaluator-recall/`, or `content/harness/skills.mdx`'s deliberate
"formerly" mentions. Anything else is an unfinished rename — fix it.

### Step 9: Routing sweep (descriptions changed → full sweep)

Because skill names inside `description:` frontmatter changed, run the FULL
routing sweep per `harness/evals/routing/prompts.yaml`'s `how_to_run`: for each
of the 33 cases, `claude -p "<prompt>" --max-turns 2 --output-format json` in a
FRESH session at the repo root; pass = the expected (new-name) skill appears in
the transcript's tool calls. Record results (pass count per skill) in the plan's
status row. If headless runs are unavailable in your environment, STOP after
Step 8 and report that the sweep is pending — do not mark this plan DONE.

**Verify**: 33/33 expected outcomes (or a report of specific failures).

## Test plan

The routing sweep (Step 9) IS the behavioural test. Static checks: validate.py
(with the fire-then-revert negative test in Step 3), the old-name sweeps, and
`pnpm build`. No unit-test framework applies to skills.

## Done criteria

- [ ] `ls harness/.claude/skills/` → `content design onboard standards`
- [ ] plugin.json name `tfx`, version `0.3.0`; marketplace.json plugin entry `tfx`
- [ ] `python3 harness/checks/validate.py` exits 0 AND the Step-3 negative test proved [L0-SYNC] still fires
- [ ] Old-name sweep returns hits only in the historical set (+ deliberate "formerly" mentions)
- [ ] `pnpm build` exits 0
- [ ] Routing sweep 33/33 (or failures reported and triaged)
- [ ] CHANGELOG 0.3.0 + UPDATING.md migration section exist
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- A bare new name collides with another skill or agent already installed in the
  dev environment (check the session's available-skills list for standalone
  `design`, `content`, `standards`, `onboard`, `evaluator` from other sources) —
  report; the fallback scheme is `design-ui` / `design-standards` /
  `content-style` / `onboard` (dropping only the `tfx-` prefix).
- The routing sweep shows ANY case routing to a wrong skill (not just failing to
  fire) — that means a description edit changed semantics; revert that
  description to the old wording apart from pure name substitution and re-run.
- Plugin tooling rejects `"name": "tfx"` (e.g. name-format or uniqueness rule).
- validate.py's sync checks silently skip after the path edit (Step 3 negative
  test does not fire) — the parity guard would be dead.

## Maintenance notes

- Consumer repos (TW, CaseSync, Glow) must reinstall the plugin under the new
  name; until they do, they run 0.2.0 with old names. The UPDATING.md migration
  section is the communication vehicle — a reviewer should check it reads
  clearly for someone who has never edited a plugin.
- Any future skill added to the plugin should follow the single-token convention
  (`tfx:<discipline>`).
- Plans 048/049 assume the new names; if this plan is rejected, they must be
  re-read and their skill paths adjusted before execution.
- Decision records in product repos reference `tfx-design-ui` etc. as history —
  never rewrite them.
