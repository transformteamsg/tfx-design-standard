# Plan 070: `[SKILL-SYNC]` — machine-check that catalog controls are wired into the skill layer

> **Executor instructions**: Follow this plan step by step. Run every verification
> command and confirm the expected result before moving on. If anything in "STOP
> conditions" occurs, stop and report — do not improvise. Do NOT update
> `harness/plans/README.md` — your reviewer maintains the index.
>
> **Drift check (run first)**: `git diff --stat b329c0c..HEAD -- harness/checks/validate.py harness/.claude harness/docs/SYNC.md`
> Plans 068/069 and an upstream content-controls batch may have landed — expected.
> STOP only if the "Current state" excerpts below no longer match.

## Status

- **Priority**: P1 · **Effort**: M · **Risk**: LOW (additive check with a grandfathered allowlist)
- **Depends on**: plan 069 (both add validate.py sub-checks — land 069 first to avoid conflicts; logic is independent)
- **Category**: tech-debt (catalog→skill drift)
- **Planned at**: commit `b329c0c`, 2026-07-16

## Why this matters

When a control enters the catalog via the ratchet, a human must remember to wire it
into the consumers: `design/SKILL.md`, the evaluator agent, and the relevant focused
pass. Nothing checks this. It has already failed once, documented in
`harness/plans/063-wire-newest-controls-into-skills.md`: five controls (LAY-1, LAY-7,
IDN-2/3/4) were committed 2026-07-06 and "no skill or agent references any of the
five" for days — pages were graded "clean" against a catalog the skills didn't know.
Plan 063 itself proposed the fix (its lines ~274-281): a validate.py sub-check. This
plan builds it, following the repo's existing `tfx-sync` parity-check pattern.

Two guarantees after this plan, both machine-checked on every `validate.py` run:
(a) **no ghost ids** — every control id mentioned anywhere under `harness/.claude/`
exists in the catalog; (b) **no orphan controls** — every catalog id is mentioned in
at least one skill/agent file, or sits on an explicit grandfathered allowlist that can
only shrink.

## Current state

- `harness/checks/validate.py` — parity helpers follow one shape (see
  `count_parity_errors`, ~line 345): a pure function `<name>_parity_errors(...)`
  returning `ERROR <rel> [<TAG>]: …` strings, called from `collect_errors` (~line
  600-606), with tempdir-based self-test cases (~lines 863-897). The catalog id shape
  comes from `harness/standards/schema.json` `id_prefixes` (the validator already
  builds an id regex from it for its cross-ref sweep — reuse that regex, do not invent
  a new one; find it via `grep -n "id_prefixes\|xref_re" harness/checks/validate.py`).
- Consumers to scan: every `*.md` under `harness/.claude/skills/` and
  `harness/.claude/agents/` (11 skills incl. support files like `critique/pass.md`,
  `critique/critique.md`, `design/verify.md`; one agent `evaluator.md`).
- Known-good example of the drift class (still present, fixed separately by plan 072):
  the seven-LAY-controls list is hand-duplicated in `design/SKILL.md` (~:57-64),
  `agents/evaluator.md` (~:136-143), `layout/SKILL.md` (~:15-24).
- `harness/docs/SYNC.md` "Adding a new restated fragment" (lines ~83-93) documents the
  recipe this plan follows; its Registered blocks table is where the new check gets a
  row.
- Precedent for grandfathering: plan 065's EVD-1 decision explicitly deferred an
  assertion as a "corpus-grandfathering class" — seeding an allowlist with the
  pre-existing unwired set and ratcheting forward matches house style.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py` | self-test OK; `OK: <N> controls valid` |
| Id inventory (recon) | `grep -rhoE "\b(A11Y\|TOK\|TYP\|COL\|CMP\|CNT\|MOT\|IDN\|SLP\|LAY\|EVD)[A-Z]*-[0-9]+\b" harness/.claude \| sort -u` | list of ids named in skills (prefix list: confirm against schema.json `id_prefixes`) |

## Scope

**In scope**: `harness/checks/validate.py`, `harness/docs/SYNC.md` (register the
check), `harness/checks/README.md` (one line in validate.py's rule list).

**Out of scope**: any edit to skills, agents, or the catalog — this plan only ADDS the
check; actually wiring unwired controls (or trimming stale mentions) is follow-up work
the check will surface. Do NOT "fix" ghost ids or orphans you find — allowlist or
report them.

## Git workflow

Branch `advisor/070-skill-sync-parity`. Conventional commits, e.g.
`feat(checks): [SKILL-SYNC] catalog↔skill wiring parity`.

## Steps

### Step 1: Recon the live sets

Run the id-inventory grep above and `python3 -c` over the catalog to list all ids.
Compute: ghost ids (in skills, not in catalog) and orphans (in catalog, in no skill
file). Record both lists in your report verbatim.

**Verify**: both lists produced; no guessing.

### Step 2: `skill_sync_errors(repo_root)` in validate.py

Model on `count_parity_errors`. Behaviour:

1. Build the mention set: walk `harness/.claude/skills/**/*.md` and
   `harness/.claude/agents/*.md` (paths relative to validate.py's `REPO_ROOT`, which
   is `harness/` — so `.claude/skills` etc.), regex-extract ids using the
   schema-derived id regex.
2. Ghost ids → `ERROR <rel-file> [SKILL-SYNC]: names <ID> which is not in the catalog`.
3. Orphans → error UNLESS the id is in module-level
   `SKILL_WIRING_GRANDFATHERED = {…}` seeded EXACTLY with Step 1's orphan list, each
   with a `# why` comment (`# CNT-9: content-only control, applies to prose not UI` —
   derive the reason from the control's `applies_to`/category; when unsure write
   `# unwired at introduction of SKILL-SYNC — wire or justify`).
4. An allowlisted id that is no longer an orphan (someone wired it) → NOTE (not
   ERROR) suggesting its removal from the allowlist; an allowlisted id not in the
   catalog at all → ERROR (dead entry). This makes the list shrink-only in practice.

Call from `collect_errors` after the existing parity helpers.

**Verify**: `python3 harness/checks/validate.py` → exit 0 on the live tree (by
construction of the grandfathered list).

### Step 3: Self-test cases

Tempdir fixture per the `[COUNT-SYNC]` pattern: a mini catalog + a fake
`.claude/skills/x/SKILL.md`. Cases: (1) skill names an id in the catalog → clean;
(2) skill names a ghost id → `[SKILL-SYNC]` fires; (3) catalog id absent from skills
and not grandfathered → fires; (4) grandfathered orphan → clean; (5) dead
grandfather entry → fires.

**Verify**: `python3 harness/checks/validate.py --self-test` → OK, count up ≥5.

### Step 4: Register

Add a `[SKILL-SYNC]` row to `harness/docs/SYNC.md`'s Registered blocks table (source:
catalog id set; consumers: `.claude/skills/**`, `.claude/agents/**`; rule: skills-ids ⊆
catalog, catalog ⊆ skills-ids ∪ grandfathered). Add one line to
`harness/checks/README.md`'s validate.py section.

**Verify**: `python3 harness/checks/validate.py` still exit 0; SYNC.md row present.

## Done criteria

- [ ] `validate.py --self-test` OK, ≥5 new `[SKILL-SYNC]` cases
- [ ] `validate.py` exit 0 on the live tree
- [ ] Negative test: temporarily add a fake id `ZZZ-9`… no — add `LAY-99` to a skill file, run validate → `[SKILL-SYNC]` ERROR fires; revert; report the output
- [ ] Report contains the Step 1 ghost/orphan lists and the seeded allowlist with reasons
- [ ] SYNC.md + checks/README.md rows present; `git status` clean outside scope

## STOP conditions

- Step 1 finds ghost ids that look like genuine catalog entries missing from the local
  catalog (e.g. the upstream CNT-8..14 batch not yet merged locally) — report; do not
  allowlist a merge problem.
- The schema-derived id regex can't be reused without refactoring beyond this plan's
  scope.
- The orphan list exceeds ~25 ids — the check may be mis-scoped (e.g. missing a
  consumer directory); report before seeding a giant allowlist.

## Maintenance notes

- Every future ratchet now fails validate until the new control is wired into ≥1
  skill/agent or consciously allowlisted — plan 063's recurring class is closed.
- Plan 072 (LAY-list sync markers) tightens the *content* of specific mentions; this
  plan only guarantees *existence* of a mention. They compose.
- Reviewers: watch the allowlist in PRs — additions need a reason, removals are free.
