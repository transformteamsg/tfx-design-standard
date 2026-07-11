# Plan 001: Rename the standard from TFX to DXD across plugin, harness, and site identity

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- harness/.claude-plugin .claude-plugin components/topbar.tsx harness/standards/catalog.yaml harness/checks harness/scripts app/layout.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: none
- **Category**: migration
- **Executor model**: Sonnet (broad but mechanical; every change is grep-verifiable)
- **Planned at**: commit `233f3be`, 2026-07-10

## Why this matters

The standard is being adopted division-wide (DXD — Digital Products & Excellence Division): Students, Parents, and Platform (EduPass) domain leads will install the plugin and read the site. Every `tfx`-branded surface — `/tfx:` skill commands, `tfx-waive` syntax, the plugin id, the site masthead — tells those teams "this is another team's tool," which undercuts adoption. After this plan, the standard's identity is DXD; "TFX" survives only where it correctly names the Teachers & School domain (its profile, its history). This is requirement R5 in `docs/brainstorms/2026-07-10-dxd-design-standard-requirements.md`.

## Current state

- `.claude-plugin/marketplace.json` — marketplace manifest: `"name": "tfx"`, one plugin entry `{"name": "tfx", "source": "./harness", ...}`.
- `harness/.claude-plugin/plugin.json` — plugin manifest: `"name": "tfx"`, `"displayName": "TFX Design Harness"`, `"version": "0.7.0"`, description mentions "Teacher & School products".
- `harness/standards/catalog.yaml` — `meta.waiver_syntax: 'tfx-waive <ID> reason="<specific reason>"'` (line ~16). 60 controls.
- `harness/docs/DESIGN-CONTEXT.md` — specifies the per-product context layer as `DESIGN.md` + **`.tfx/design.json`** (generated twin, written by `harness/scripts/generate-design-json.py`).
- `harness/checks/` — 10 Python check scripts + `validate.py`; `waiver-reconcile.py` and others parse `tfx-waive` markers; grep for the literal to find them all.
- `components/topbar.tsx:22-30` — site masthead:
  ```tsx
  <span className="... bg-tw-blue ...">tf</span>
  <span className="font-display ...">TFX Design Standard</span>
  ```
- Repo-wide `tfx` surface: 184 files mention it (168 under `harness/`, of which many are `harness/plans/*.md` and `harness/docs/` history — **historical records are out of scope**, see Scope).
- Install instructions today (`harness/README.md` ~line 110): `/plugin marketplace add transformteamsg/tfx-design-standard` then `/plugin install tfx@tfx`.
- Skill invocation names come from the plugin name: renaming the plugin to `dxd` makes skills `/dxd:start`, `/dxd:design`, etc. — no per-skill rename needed for the namespace.

Naming decisions (already made — do not relitigate):

- Plugin + marketplace name: `dxd`. Display name: "DXD Design Harness". Site name: "DXD Design Standard".
- Waiver syntax: `dxd-waive <ID> reason="..."`. **Legacy `tfx-waive` markers remain valid** — checks accept both; new waivers are written as `dxd-waive`.
- Context dir: `.dxd/design.json` is the new canonical path. **Readers fall back to `.tfx/design.json`** if `.dxd/` is absent; the generator writes `.dxd/`.
- GitHub repo rename (`tfx-design-standard` → `dxd-design-standard`) is a **human coordination step**, not yours — flag it in the migration note, do not attempt it.
- "TFX" is retained wherever it names the Teachers & School domain or quotes history (changelog entries, plans, decision records, the TFX-DS normative source link).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Full build + standards gate | `pnpm build` | exit 0 (prebuild runs catalog validation + token/a11y scans) |
| Catalog validator only | `python3 harness/checks/validate.py` | exit 0 |
| Typecheck | `pnpm typecheck` | exit 0 |
| Tests | `pnpm test` | all pass |
| Rename inventory | `grep -rn 'tfx-waive\|/tfx:\|\.tfx/' harness/.claude harness/checks harness/scripts harness/standards harness/README.md harness/CLAUDE.md harness/CONTRIBUTING.md harness/docs/ONBOARDING.md harness/docs/UPDATING.md harness/docs/SYNC.md harness/docs/DESIGN-CONTEXT.md` | (used per step below) |

## Scope

**In scope** (the only files you should modify):
- `.claude-plugin/marketplace.json`, `harness/.claude-plugin/plugin.json`
- `harness/standards/catalog.yaml` (meta block only: `waiver_syntax`), `harness/standards/README.md`
- `harness/.claude/skills/**` and `harness/.claude/agents/evaluator.md` — command names, waiver syntax, `.tfx/` paths only (brand-language rewrites are plan 003's job, not yours)
- `harness/checks/*.py`, `harness/scripts/generate-design-json.py`
- `harness/README.md`, `harness/CLAUDE.md`, `harness/CONTRIBUTING.md`, `harness/docs/{ONBOARDING,UPDATING,SYNC,DESIGN-CONTEXT}.md`
- `components/topbar.tsx`, `app/layout.tsx` (site title metadata), `README.md`, `CLAUDE.md`, `PRODUCT.md`
- `content/**/*.mdx` where the *standard itself* is named (e.g. "TFX Design Standard" in prose) — NOT where TFX-DS is cited as the historical normative source
- `harness/docs/MIGRATION-DXD.md` (create)

**Out of scope** (do NOT touch, even though they mention tfx):
- `harness/plans/*.md`, `harness/CHANGELOG.md` existing entries, `harness/docs/decisions/`, `harness/docs/catalog-changes/`, `harness/docs/loop-run/`, `harness/docs/reviews/`, `harness/docs/spikes/` — historical records; renaming history falsifies it.
- Control ids, catalog control bodies, `refs:` URLs (the Notion TFX-DS link is the real normative source; leave it).
- The `--tw-blue` token, `products: tw/casesync/glow` vocabulary, and anything else that names Teachers & School *products* rather than the standard.
- `pnpm-lock.yaml`, `package.json` `"name"` field (repo package rename rides the GitHub repo rename, later).
- Git history, branch names, existing issue titles.

## Git workflow

- Branch: `advisor/001-dxd-rename` off `main`.
- Commit per step; message style matches repo history (e.g. `docs(harness): …`, `feat: …` — see `git log --oneline -10`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Rename plugin and marketplace manifests

In `harness/.claude-plugin/plugin.json`: `"name": "dxd"`, `"displayName": "DXD Design Harness"`, description → "The DXD Design Standard harness: design loop, control catalog, voice & tone, and evaluator agent for DXD product portfolios", keywords swap `"tfx"`/`"teacher-school"` for `"dxd"` (keep `"design-system"`, `"standards"`), bump `"version"` to `"0.8.0"`. In `.claude-plugin/marketplace.json`: `"name": "dxd"`, plugin entry `"name": "dxd"`, description updated the same way. Add a `0.8.0` entry to `harness/CHANGELOG.md` (new entry — allowed; editing old entries is not) recording the rename and the compat guarantees (legacy `tfx-waive` and `.tfx/` still read).

**Verify**: `python3 -c "import json; a=json.load(open('.claude-plugin/marketplace.json')); b=json.load(open('harness/.claude-plugin/plugin.json')); assert a['name']=='dxd' and b['name']=='dxd' and b['version']=='0.8.0'; print('ok')"` → `ok`

### Step 2: Waiver syntax — new canonical, legacy accepted

1. `harness/standards/catalog.yaml` meta: `waiver_syntax: 'dxd-waive <ID> reason="<specific reason>"'`.
2. `grep -rln 'tfx-waive' harness/checks/` — in every hit, make the parser accept **both** markers. Pattern: wherever a regex or literal contains `tfx-waive`, replace with an alternation, e.g. `r'(?:dxd|tfx)-waive'`, keeping capture groups intact. Do not change scoring/report logic.
3. `grep -rln 'tfx-waive' harness/.claude harness/README.md harness/CLAUDE.md harness/CONTRIBUTING.md harness/standards/README.md harness/docs/{ONBOARDING,SYNC}.md` — update instructional text to teach `dxd-waive`, each first mention adding "(legacy `tfx-waive` markers remain valid)".

**Verify**: `python3 harness/checks/validate.py` → exit 0. Then `grep -rn 'tfx-waive' harness/checks/ | grep -v 'dxd\|tfx)-waive\|legacy'` → no output (every remaining literal is part of an alternation or a legacy note).

### Step 3: Context dir `.dxd/` with `.tfx/` fallback

1. `harness/scripts/generate-design-json.py`: write output to `.dxd/design.json`.
2. `grep -rln '\.tfx/' harness/checks harness/.claude harness/docs/DESIGN-CONTEXT.md harness/standards/catalog.yaml` — every reader resolves `.dxd/design.json` first, then falls back to `.tfx/design.json`. In Python, factor a tiny helper in each file that needs it (the checks are stdlib-only, single-file by design — keep it that way; do not create a shared module). In skill/agent Markdown, state the rule: "read `.dxd/design.json` (fall back to `.tfx/design.json` in repos that predate the rename)".
3. `harness/docs/DESIGN-CONTEXT.md`: retitle the layer `DESIGN.md` + `.dxd/design.json`, add one "Legacy path" paragraph.

**Verify**: `cd $(mktemp -d) && printf '## Colour\n- primary: --x-blue #112233\n' > DESIGN.md && python3 <repo>/harness/scripts/generate-design-json.py && test -f .dxd/design.json && echo ok` → `ok` (use the absolute repo path; check the script's CLI signature first — if it takes a path argument, pass it).

### Step 4: Harness docs and skill text — command names and standard name

Across `harness/README.md`, `harness/CLAUDE.md`, `harness/CONTRIBUTING.md`, `harness/docs/{ONBOARDING,UPDATING}.md`, and `harness/.claude/skills/**`: `/tfx:start` → `/dxd:start` (and any other `/tfx:` commands), install snippet → `/plugin marketplace add transformteamsg/tfx-design-standard` (unchanged until the repo renames — add the note) + `/plugin install dxd@dxd`, "TFX Design Harness/Standard" → "DXD …" where it names the standard. Leave "TFX-DS" citations of the normative source intact. Do not rewrite audience/brand language ("Teacher & School product page") — that is plan 003.

**Verify**: `grep -rn '/tfx:' harness/.claude harness/README.md harness/CLAUDE.md harness/CONTRIBUTING.md harness/docs/ONBOARDING.md harness/docs/UPDATING.md` → no output. `grep -rn 'install tfx@' harness/` → no output.

### Step 5: Site identity

`components/topbar.tsx`: logo glyph `tf` → `dx`, wordmark "TFX Design Standard" → "DXD Design Standard". `app/layout.tsx`: update `<title>`/metadata strings naming the standard. Sweep `README.md`, `CLAUDE.md`, `PRODUCT.md`, and `grep -rln 'TFX Design Standard' content/ app/` for prose naming the standard itself. Keep TFX-DS-as-source citations and product names.

**Verify**: `pnpm build` → exit 0. `grep -rn 'TFX Design Standard' components/ app/ | grep -v 'TFX-DS'` → no output.

### Step 6: Write the migration note

Create `harness/docs/MIGRATION-DXD.md`: what changed (plugin id, skill prefix, waiver syntax, context dir), what still works (tfx-waive markers, `.tfx/design.json`, old marketplace path), what an existing install must do (`/plugin uninstall tfx` → `/plugin install dxd@dxd`, or equivalent verified against `harness/docs/UPDATING.md`'s current instructions), and the flagged human step: rename the GitHub repo to `dxd-design-standard` (GitHub redirects old clones; marketplace path in docs updates then). Link it from `harness/README.md` and `harness/docs/UPDATING.md`.

**Verify**: `test -f harness/docs/MIGRATION-DXD.md && grep -c 'MIGRATION-DXD' harness/README.md harness/docs/UPDATING.md` → both ≥ 1.

## Test plan

- No new unit tests (the rename is textual); the existing suites are the regression net: `pnpm test` (vitest: `lib/catalog.test.ts`, `lib/markdown-twin.test.ts`) and `pnpm build` (runs `validate.py`, `token-audit.py`, `a11y-static.py`).
- Add one fixture-level check if `harness/checks/` has a fixtures dir for waiver parsing: a file containing one `tfx-waive` and one `dxd-waive` marker, both recognised. Model it on the existing fixtures under `harness/checks/fixtures/` (inspect that dir first; if no waiver fixture pattern exists, note it in the PR instead of inventing a harness).

## Done criteria

- [ ] `pnpm build`, `pnpm typecheck`, `pnpm test` all exit 0
- [ ] `python3 harness/checks/validate.py` exits 0
- [ ] `grep -rn '/tfx:' harness/ --include='*.md' | grep -v 'harness/plans\|harness/docs/decisions\|harness/docs/catalog-changes\|harness/docs/loop-run\|harness/docs/reviews\|harness/docs/spikes\|CHANGELOG\|MIGRATION'` → no output
- [ ] Both manifests have `"name": "dxd"`; plugin version is `0.8.0`; CHANGELOG has a 0.8.0 entry
- [ ] Legacy compat proven: a `tfx-waive` marker is still parsed (step 2 verify), `.tfx/design.json` fallback documented and implemented (step 3)
- [ ] `harness/docs/MIGRATION-DXD.md` exists and is linked from README + UPDATING
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Manifest contents don't match the "Current state" excerpts (drift).
- `validate.py` fails after the catalog meta edit — the validator may pin the waiver-syntax string; report rather than editing the validator's expectations blind.
- You find `tfx-waive` parsing spread across more than ~4 check scripts with materially different regex shapes — report the inventory first.
- Renaming appears to require touching historical records to make a grep gate pass — the gate excludes them; if it doesn't, fix the grep, not the history.

## Maintenance notes

- Plans 002–007 are written rename-aware: they say `dxd-waive` / `.dxd/` assuming this plan landed. If executed out of order, those literals appear early — harmless, but this plan's grep gates then have pre-existing hits; re-run inventories.
- The human repo-rename step (GitHub `tfx-design-standard` → `dxd-design-standard`) should happen after this merges; until then docs correctly show the old marketplace path.
- Reviewer scrutiny: the regex alternations in `harness/checks/` (capture-group breakage is the likely bug) and any accidental rename inside historical docs.
