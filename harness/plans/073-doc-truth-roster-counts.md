# Plan 073: Doc truth — fix index.html's stale skill/check surface, extend COUNT-SYNC to skill and check counts

> **Executor instructions**: Follow this plan step by step. Run every verification
> command and confirm the expected result before moving on. If anything in "STOP
> conditions" occurs, stop and report — do not improvise. Do NOT update
> `harness/plans/README.md` — your reviewer maintains the index.
>
> **Drift check (run first)**: `git diff --stat b329c0c..HEAD -- harness/docs harness/checks/validate.py harness/checks/README.md`
> Plans 068-072 may have landed (068 touches index.html:403; 069-072 touch
> validate.py). Expected. STOP only if a "Current state" excerpt below is gone.

## Status

- **Priority**: P2 · **Effort**: S (fixes) + M (guard) · **Risk**: LOW
- **Depends on**: after 072 (validate.py churn ordering only)
- **Category**: docs
- **Planned at**: commit `b329c0c`, 2026-07-16

## Why this matters

`harness/docs/index.html` is the harness's public landing page — the first thing a
newcomer reads — and it currently contradicts itself and the repo:

- The pill row (~line 327-328) says **"4 skills + 1 agent"** and **"2 checks built"**
  while the SAME file says "eleven skills" (~355, ~377) and "ten check scripts built"
  (~645).
- The per-skill table (~455-460) still describes the pre-restructure four-skill world
  (design / standards / **content** / evaluator) — seven skills missing, one renamed.
- The `content` skill was renamed to `copy` (plan 047), but ~line 526 still links to
  `../.claude/skills/content/SKILL.md` — **that path 404s** (`.claude/skills/content/`
  does not exist) — and `#content` anchors/labels persist (~311, ~459, ~522).
- Plan 064's own DONE row records the root cause: "five 'eleven skills' prose sites
  remain hand-maintained — only control counts are machine-guarded."

The `[COUNT-SYNC]` check (`validate.py`, `count_parity_errors`, ~line 345) already
guards `"<N> controls"` claims in `README.md` + `docs/index.html`. This plan fixes the
stale content and extends the same extractor to `"<N> skills"` and
`"<N> check scripts"` claims so this class can't recur.

## Current state

- `harness/docs/index.html` (verify live before editing; 068 touched only line ~403):
  - ~327: `<span class="pill">4 skills + 1 agent</span>` · ~328:
    `<span class="pill">2 checks built</span>` (and ~326 `57 controls` — guarded
    already, leave to COUNT-SYNC).
  - ~455-460: a `<table>` of four skills — rows `design`, `standards`,
    `content` (linking `#content`), `evaluator`.
  - ~522-526: `<h3 id="content">content …` with meta-line
    `copy · <a href="../.claude/skills/content/SKILL.md">…`.
  - ~311: a nav/anchor reference to `#content`.
- Live rosters (recompute at execution time — do NOT hardcode this plan's numbers):
  - Skills: `ls -d harness/.claude/skills/*/ | wc -l` → 11 today
    (copy, critique, design, feedback, flow, layout, motion, polish, setup, standards,
    start) + 1 agent (`harness/.claude/agents/evaluator.md`).
  - Check scripts: `ls harness/checks/*.py` → 11 files today; the repo's own prose
    convention ("catalog validator + ten check scripts", index.html ~645) counts
    validate.py separately, so **check scripts = all `checks/*.py` minus
    `validate.py`** (= 10 today, detect.py included as the runner). Use this
    definition consistently.
- `validate.py` `count_parity_errors(repo_root, catalog_count, relpaths=COUNT_SYNC_PATHS)`:
  regex `r"(\d+) controls"` over `README.md` + `docs/index.html`, emits
  `ERROR <rel> [COUNT-SYNC]: says {n} controls, catalog has {catalog_count}`.
  Self-test cases at ~863-897 build tempdirs with doctored counts.
- `docs/ONBOARDING.md` lists skills at ~:23 and ~:110 — verify wording; it survived
  plan 064's sweep so likely already says eleven/by-name, but the rename check
  (`content` → `copy`) must cover it too.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py` | self-test OK; exit 0 |
| Dead-link sweep | `grep -rn "skills/content" harness/docs docs 2>/dev/null` | 0 matches when done |
| Build | `pnpm build` | exit 0 |

## Scope

**In scope**: `harness/docs/index.html`, `harness/docs/ONBOARDING.md` (only if the
rename/roster sweep finds stale text), `harness/checks/validate.py`,
`harness/checks/README.md` (the `[COUNT-SYNC]` description line), `harness/docs/SYNC.md`
(update the COUNT-SYNC row's rule).

**Out of scope**: skill files; `harness/CLAUDE.md`'s "Where things live" table (it is
name-based prose, verified current — routing authority, hands off); `README.md` control
counts (already guarded); generating the roster from disk into the HTML (nice idea,
rejected for now — index.html is a hand-authored static doc; the guard is the fix).

## Git workflow

Branch `advisor/073-doc-truth-counts`. E.g. `docs(harness): index.html reflects the
eleven-skill stack`, `feat(checks): [COUNT-SYNC] covers skill and check-script counts`.

## Steps

### Step 1: Fix index.html content

1. Pills: `4 skills + 1 agent` → `<live skill count> skills + 1 agent`; `2 checks
   built` → `<live check count> checks built` (counts from the Commands recon,
   written as DIGITS — the new guard matches digits).
2. Replace the four-row skill table (~455-460) with the full live roster, one row per
   skill, each "In one line" description derived from that skill's own
   `description:` frontmatter first sentence (read each SKILL.md — do not invent).
   Keep the existing table markup style.
3. Rename sweep: `#content` anchor → `#copy`, heading/label `content` → `copy`,
   meta-line link → `../.claude/skills/copy/SKILL.md`. Update every in-file reference
   (`grep -n "content\b" harness/docs/index.html` and judge each hit — only
   skill-name uses change; the English word "content" elsewhere stays).
4. Word-number counts → digits where they state roster sizes ("eleven skills" →
   "11 skills", "ten check scripts" → "10 check scripts") so the Step 2 guard sees
   them. Sweep `docs/ONBOARDING.md` for the same two classes (stale `content` skill
   name, word-number roster counts) and fix if present.

**Verify**: dead-link sweep → 0; `grep -n "4 skills\|2 checks" harness/docs/index.html`
→ 0; open-file review of the new table against `ls harness/.claude/skills/`.

### Step 2: Extend `[COUNT-SYNC]`

Generalise `count_parity_errors` (keep name and the existing controls behaviour):

1. Compute `skills_count` = dirs under `REPO_ROOT/.claude/skills` containing a
   `SKILL.md`; `checks_count` = `len(glob REPO_ROOT/checks/*.py) - 1` (minus
   validate.py — document this convention in the docstring).
2. Add regexes `r"(\d+) skills"` and `r"(\d+) check(?: scripts)?s?\b"`… keep it
   simple and unambiguous: match `r"(\d+) skills"` and `r"(\d+) check scripts"` plus
   `r"(\d+) checks built"` — the three phrasings the docs actually use (verify by
   grepping first; add a phrasing only if it exists).
3. Same relpaths (`README.md`, `docs/index.html`); same one-ERROR-per-wrong-number
   dedup; message names the claim type:
   `… [COUNT-SYNC]: says {n} skills, stack has {skills_count}`.
4. Self-test: tempdir cases per the existing ~863-897 pattern — correct counts clean;
   wrong skills count fires; wrong checks count fires; a file with no claims clean.
   (The tempdir must contain fake `.claude/skills/x/SKILL.md` and `checks/*.py` trees
   for the computed counts — follow how existing cases fabricate the catalog.)
5. Update the `[COUNT-SYNC]` row in `docs/SYNC.md` and its line in `checks/README.md`.

**Verify**: `validate.py --self-test` OK (count up ≥3); `validate.py` exit 0 on the
live tree (Step 1 made the docs true first). Negative test: temporarily change
"11 skills" to "12 skills" in index.html → fires; revert; report.

## Done criteria

- [ ] `grep -rn "skills/content" harness/docs docs` → 0; `#content` anchor gone
- [ ] index.html pill row + skill table match the live roster; roster counts in digits
- [ ] `validate.py --self-test` OK with ≥3 new cases; `validate.py` exit 0; negative test reported
- [ ] SYNC.md + checks/README.md rows updated
- [ ] `pnpm build` exit 0; `git status` clean outside scope

## STOP conditions

- The skill roster on disk disagrees with what `harness/CLAUDE.md`'s table names
  (a skill exists in one but not the other) — that's a deeper drift than doc text;
  report it instead of picking a side.
- ONBOARDING.md's roster text is structured differently than expected and a mechanical
  fix isn't obvious — report the excerpt.
- The count-phrasing grep (Step 2.2) finds roster claims in files OUTSIDE the two
  guarded relpaths — list them; extending relpaths is a judgment the reviewer makes.

## Maintenance notes

- Adding/renaming a skill or check now fails validate until README.md/index.html
  counts follow — the plan-064 leftover class ("only control counts are
  machine-guarded") is closed for counts. NAME-level roster drift (a stale skill name
  in prose) is still hand-maintained; the periodic human parity review covers it.
- If index.html is ever generated from data (the website already reads the catalog via
  `lib/catalog.ts`), the skill table should join that pipeline and this guard shrinks.
