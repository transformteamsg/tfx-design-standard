# Plan 072: Skill-layer dedup — one pass preamble, `[LAY-SYNC]` markers for the triplicated control list

> **Executor instructions**: Follow this plan step by step. Run every verification
> command and confirm the expected result before moving on. If anything in "STOP
> conditions" occurs, stop and report — do not improvise. Do NOT update
> `harness/plans/README.md` — your reviewer maintains the index.
>
> **Drift check (run first)**: `git diff --stat b329c0c..HEAD -- harness/.claude harness/checks/validate.py harness/docs/SYNC.md`
> Plans 069/070 are expected to have landed (validate.py sub-checks). STOP only if the
> "Current state" excerpts below no longer match the live files.

## Status

- **Priority**: P2 · **Effort**: S–M · **Risk**: LOW (bodies are non-normative pointers; skill `description:` frontmatter — the routing surface — is untouched)
- **Depends on**: after 070 (validate.py churn ordering; logic independent)
- **Category**: tech-debt
- **Planned at**: commit `b329c0c`, 2026-07-16

## Why this matters

Two duplication classes in the skill layer, both proven drift-prone:

1. **The seven-LAY-controls list is hand-copied into three files** —
   `design/SKILL.md` (~:57-64), `agents/evaluator.md` (~:136-143),
   `layout/SKILL.md` (~:15-24) — with per-file wording variants. When LAY-8 lands,
   three prose edits must happen or graders work from different rulebooks. The repo
   already has the cure: `tfx-sync` markers + a validate.py set-comparison (the `L0`
   block works exactly this way, source = catalog tier set).
2. **The four thin pass skills restate the same preamble** ("Dimension controls
   (cite these; the catalog holds the rules — load them from
   `../../../standards/catalog.yaml`, read each `detail` file…)") with wording that has
   already drifted between `polish` and `motion`. The shared procedure file
   `critique/pass.md` exists precisely to hold shared instruction text.

This plan adds a `[LAY-SYNC]` parity check (IDs-in-span == catalog LAY set, three
consumers) and moves the pass preamble into `pass.md` once. It does NOT touch skill
`description:` frontmatter (plan 063's history shows description edits trigger a full
routing sweep — deliberately avoided), and it does NOT restructure `copy` (its
embedded voice tables are load-bearing at generation time; keeping them is a recorded
decision — see Maintenance notes).

## Current state

- The `tfx-sync` mechanism: `harness/docs/SYNC.md` — open marker
  `<!-- tfx-sync:NAME -->`, close `<!-- /tfx-sync:NAME -->`, canonical copy marked
  `source`; recipe at "Adding a new restated fragment" (~lines 83-93): wrap, add a
  `<name>_parity_errors(...)` helper in `checks/validate.py` reusing
  `extract_sync_block`, call from `collect_errors`, add self-test cases, register in
  the table. The `L0` block (source = catalog `tier: L0` set, ID-set equality via the
  catalog id regex) is the exemplar to copy — find its helper via
  `grep -n "l0_parity_errors\|extract_sync_block" harness/checks/validate.py`.
- The three LAY lists (verify live line numbers before editing; post-b329c0c plans may
  have shifted them):
  - `harness/.claude/skills/design/SKILL.md` ~57-64: "**Layout controls.** Layout has
    seven controls: LAY-1 (…) … LAY-7 (…)".
  - `harness/.claude/agents/evaluator.md` ~136-143: "**Layout grading.** Seven LAY
    controls are in the catalog: LAY-1 (… controls/lay-1.md) … LAY-7 (…)".
  - `harness/.claude/skills/layout/SKILL.md` ~13-21: the bulleted "- **LAY-1** — …
    **LAY-7** — …" subset list.
- The four thin passes: `polish/SKILL.md` (27 lines), `motion/SKILL.md` (26),
  `flow/SKILL.md` (31), `layout/SKILL.md` (30). Each body = dimension paragraph +
  "**Dimension controls** (cite these; the catalog holds the rules — load them from
  `../../../standards/catalog.yaml`, read each `detail` file…)" + control bullets +
  "**Reference:**" pointer + "**Procedure:** follow `../critique/pass.md` with the
  subset above." Wording of the parenthetical drifts per file (motion says "these
  three carry their statement in the catalog, with no separate detail file").
- `critique/pass.md` step 2 already says: "Load the pass's control-id subset (named in
  the SKILL.md that sent you here) from `../../../standards/catalog.yaml`, read each
  control's `detail` file when it has one, and load the pass's named reference files".
  So the per-skill parenthetical is pure restatement of pass.md step 2.
- `copy/SKILL.md` (154 lines) is the fifth pass but embeds its reference content —
  OUT OF SCOPE here except that its "Procedure" line, if present, stays consistent.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py` | self-test OK; `OK: <N> controls valid` |
| Plugin sanity | `pnpm build` | exit 0 (prebuild runs validate) |
| LAY set (recon) | `grep -n "id: LAY-" harness/standards/catalog.yaml` | the live LAY ids (expect LAY-1..7) |

## Scope

**In scope**: `harness/.claude/skills/{design,layout,polish,motion,flow}/SKILL.md`
(bodies only — NEVER the YAML frontmatter `description:`), `harness/.claude/agents/evaluator.md`
(the Layout grading paragraph only), `harness/.claude/skills/critique/pass.md`,
`harness/checks/validate.py`, `harness/docs/SYNC.md`, `harness/checks/README.md` (one line).

**Out of scope**: every skill's `description:` frontmatter (routing surface — hands
off); `copy/SKILL.md` restructuring; `start/SKILL.md`; `harness/CLAUDE.md`; the
catalog; `design/SKILL.md` beyond wrapping the LAY block (the broader slim-down is
plan 049's territory).

## Git workflow

Branch `advisor/072-skills-dedup`. Conventional commits, e.g.
`feat(checks): [LAY-SYNC] markers over the three LAY-control lists`,
`refactor(skills): pass preamble lives once in pass.md`.

## Steps

### Step 1: `[LAY-SYNC]` markers + check

1. Wrap each of the three LAY lists in `<!-- tfx-sync:lay-controls -->` …
   `<!-- /tfx-sync:lay-controls -->`. Source of truth is the CATALOG (like `L0`), so
   no copy is marked `source` — the check compares each span against the catalog's
   LAY id set.
2. `lay_parity_errors(repo_root, catalog_by_id, xref_re)` in validate.py, modelled on
   `l0_parity_errors`: for each registered consumer file, the ID set inside the span
   must EQUAL the catalog's `LAY-*` id set. Missing marker in a registered consumer →
   ERROR (that's how the check resists silent deletion).
3. Self-test cases per the L0 pattern: equal set clean; span missing an id → fires;
   span with an extra/ghost id → fires; marker absent → fires.
4. Register in SYNC.md's table (source: catalog LAY set; consumers: the three files;
   rule: span set == catalog LAY set).

**Verify**: `validate.py --self-test` OK (count up ≥4); `validate.py` exit 0 on the
live tree. Negative test: temporarily delete "LAY-4" from one span → `[LAY-SYNC]`
fires; revert; report output.

### Step 2: One pass preamble

1. In `critique/pass.md`, confirm step 2 fully covers "load subset from catalog +
   read detail files + load references" (it does — strengthen wording only if a
   per-skill variant carries information pass.md lacks, e.g. motion's "no separate
   detail file" note can become a generic clause "…when it has one", which pass.md
   already says).
2. In `polish`, `motion`, `flow`, `layout` SKILL.md bodies: reduce the preamble to a
   single consistent line — `**Dimension controls** (the subset for this pass;
   procedure and loading rules: ../critique/pass.md):` — keeping each skill's control
   bullets, Reference pointer, and the one-line Procedure sentence. The four bodies
   end up structurally identical except dimension prose, bullets, and reference path.
3. Do not change any control id, reference path, or routing-relevant sentence (e.g.
   polish's "Card/nested-card composition … is a layout matter — note and route"
   stays; it is dimension guidance, not preamble).

**Verify**: `diff <(grep -c "" …)` — eyeball: each of the four bodies now contains the
identical preamble line (`grep -F "procedure and loading rules" harness/.claude/skills/{polish,motion,flow,layout}/SKILL.md`
→ 4 hits, identical text). `validate.py` exit 0 (the LAY span in layout survived the
edit). Frontmatter untouched:
`git diff -U0 -- harness/.claude/skills | grep "^[-+]description:"` → empty.

### Step 3: Docs

One line in `checks/README.md`'s validate rule list for `[LAY-SYNC]`; SYNC.md row from
Step 1.4 confirmed.

**Verify**: `pnpm build` exit 0.

## Done criteria

- [ ] `validate.py --self-test` OK with ≥4 new `[LAY-SYNC]` cases; `validate.py` exit 0
- [ ] Negative test reported (deleted id fires, reverted)
- [ ] `grep -rn "tfx-sync:lay-controls" harness/.claude` → 6 marker lines across exactly 3 files
- [ ] The four pass bodies share one identical preamble line; zero `description:` frontmatter diffs
- [ ] SYNC.md + checks/README.md registered; `pnpm build` exit 0; `git status` clean outside scope

## STOP conditions

- The live LAY set is no longer LAY-1..7 (a LAY ratchet landed) — the check design
  still holds; report and proceed only if the three spans can be updated to the live
  set without judgment calls about new-control wording.
- `extract_sync_block` / `l0_parity_errors` don't exist under those names —
  find the actual names; if the mechanism differs materially, STOP.
- Reducing a pass preamble would delete information pass.md doesn't carry (Step 2.1
  fails) — report the specific sentence instead of dropping it.

## Maintenance notes

- Recorded decision (advisor, 2026-07-16): `copy/SKILL.md` KEEPS its embedded voice
  tables and SLP-9 tells summary — they are load-bearing at generation time, the file
  already declares "slp-9.md wins if this summary drifts", and the buzzword span is
  parity-guarded. Revisit only if drift is observed in practice (SYNC.md already
  sketches a `voice-attributes` block for that case).
- The prose invariants ("verified manually" honesty rule ×6 files,
  "preserved ≠ waived" ×5) are NOT machine-checked by this plan — sentence-level
  parity checks would be brittle. They stay on the periodic human parity review
  (`docs/reviews/`); if one is refined again, consider a marker then.
- When LAY-8 lands: update the catalog, then all three spans — `[LAY-SYNC]` will hold
  the build until you do. That friction is the design working.
