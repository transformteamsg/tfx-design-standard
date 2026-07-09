# Plan 064: Doc-truth sweep — index.html, ONBOARDING, checks/README — and extend [COUNT-SYNC] to index.html

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told you
> they maintain the index.
>
> **Drift check (run first)**: `git diff --stat e673294..HEAD -- harness/docs/index.html harness/docs/ONBOARDING.md harness/checks/README.md harness/checks/validate.py`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: none (coordinates with 063 on nothing — different files)
- **Category**: docs
- **Planned at**: commit `e673294`, 2026-07-08

## Why this matters

Three harness documents are actively wrong, and "actively wrong" docs are worse
than missing ones:

- `docs/index.html` (the visual explainer) says **38 controls** and **four
  skills**; the truth is **53 controls** and **eleven skills**. The
  `[COUNT-SYNC]` validator guard only scans `README.md`, so this drifted with
  nothing failing.
- `docs/ONBOARDING.md` (the product-team adoption guide) says the plugin
  installs **seven skills** including `content` — a skill renamed to `copy` in
  plan 062 — and omits the five focused passes; its §4 status claims only
  `token-audit.py` is built and "the remaining 11 check scripts are not built
  yet", while ~10 scripts ship with passing self-tests and the design skill's
  own verify phase instructs running two of the "non-existent" ones. Its
  Phase-3 walkthrough also predates the three-stage gate (expose → grill →
  Approve/Adjust, commit 0570072).
- `checks/README.md` claims stale self-test counts (validate 30 vs actual 34,
  type-scan 34 vs actual 42), says the `[SLP9-SYNC]` check targets the
  "`content`" skill (now `copy`), and credits token-audit with COL-1 coverage
  the catalog attributes to judgment.

A newcomer following ONBOARDING will verify their install against a wrong skill
list and believe the deterministic floor is unbuilt. This plan fixes the prose
and extends `[COUNT-SYNC]` so `index.html` can't silently re-drift.

## Current state

Verified 2026-07-08 at `e673294`:

- `harness/docs/index.html`:
  - `:326` — `<span class="pill">38 controls</span>`
  - `:355` — `<p>This installs the four skills, the <code>evaluator</code> subagent …`
  - `:372` — `The control catalog — 38 controls (22 TFX-DS seed + 6 GovTech accessibility ratchet additions + 10 anti-slop controls), tiered L0/L1/L2`
  - `:645` — `38-control catalog · four skills + evaluator agent · catalog validator and token-audit built · the loop piloted end-to-end twice …`
- `harness/docs/ONBOARDING.md`:
  - `:23-24` — `This installs the seven skills (`start`, `setup`, `design`, `critique`, `standards`, `content`, `feedback`), the `evaluator` subagent …`
  - `:109-110` — `**What it means:** The TFX skills (`start`, `setup`, `design`, `critique`, `standards`, `content`, `feedback`) and the `evaluator` subagent must be …`
  - `:129` — `**Status today:** The first check script is now available: checks/token-audit.py covers TOK-1 … The remaining 11 check scripts are not built yet. … Every verify verdict in this period will read "verified manually" for all deterministic controls except token-audit. …`
  - `:196-204` — the six-phase walkthrough; item 3 reads: `**Plan** — a detailed plan names the components, the controls in scope, the tradeoffs, and any proposed waivers. **You approve this before implementation begins.** In an attended session you confirm explicitly; in an unattended run the plan records proxy approval.`
- `harness/checks/README.md`:
  - `:92` — `… and [SLP9-SYNC] (the `content` buzzword summary must be a subset of the canonical list in standards/controls/slp-9.md). … A third check, [COUNT-SYNC], needs no markers: every "<N> controls" claim in README.md must equal the catalog's actual control count …`
  - `:94` — `**Self-test:** python3 checks/validate.py --self-test → SELF-TEST OK (30 cases).`
  - `:101` — token-audit coverage line credits `COL-1/COL-2 (Tailwind palette utility classes bypassing the semantic layer)`.
  - `:259` — `**Self-test:** python3 checks/type-scan.py --self-test → SELF-TEST OK (34 cases).`
- `harness/checks/validate.py:311-333` — `count_parity_errors(repo_root, catalog_count)`
  scans only `README.md` with regex `r"(\d+) controls"`; a README with no claim
  is not an error. The function is called from `collect_errors` and covered by
  `--self-test` (34 cases).
- True state to write: **53 controls**; **eleven skills** — `start`, `setup`,
  `design`, `critique`, `standards`, `copy`, `polish`, `motion`, `flow`,
  `layout`, `feedback` (list source: `harness/README.md:114`). Built check
  scripts (all with passing self-tests as of 2026-07-08): `validate.py`,
  `token-audit.py`, `a11y-static.py`, `contrast.py`, `content-lint.py`,
  `type-scan.py`, `component-manifest.py`, `audit-record.py`,
  `waiver-reconcile.py`, `reaudit-scope.py`, plus the `detect.py` unified
  front-end. Not yet built (keep honest): `targets` (A11Y-4), `reduced-motion`
  (A11Y-5), `alt-scan` (A11Y-6), `structure` (A11Y-7), title/lang (A11Y-9),
  skip-link (A11Y-10), announce (A11Y-11), destructive/async-states
  (CMP-2/3 deterministic halves), `motion` (MOT-1), `identity` (IDN-1/2),
  `slop-scan`/`slop-layout` (SLP-1..8), `layout-scan` (LAY-1/4), TYP-5
  tabular-nums subcheck.
- Three-stage Phase-3 gate (commit 0570072): the plan is **exposed** in the
  turn body, then **grilled** — the agent interrogates the plan one question at
  a time (`design/grill.md`) — then approved via the structured
  **Approve/Adjust** follow-up turn.
- The `catalog breakdown` for index.html:372 that is currently true (source:
  `harness/README.md:137-142`): 22-control TFX-DS seed + 6 GovTech a11y ratchet
  additions + 10 anti-slop (SLP-1..10) + later ratchet additions
  (LAY-2/3/4/5/6, TYP-5, SLP-11, CMP-5, CMP-6, LAY-1/7, IDN-2/3/4) = 53.

## Commands you will need

| Purpose | Command (from `harness/`) | Expected on success |
|---|---|---|
| Validator | `python3 checks/validate.py` | `OK: 53 controls valid`, exit 0 |
| Validator self-test | `python3 checks/validate.py --self-test` | `SELF-TEST OK (N cases)`, N ≥ 34 (grows in Step 4) |
| Type-scan self-test | `python3 checks/type-scan.py --self-test` | `SELF-TEST OK (42 cases)` |
| Website build (repo root) | `pnpm build` | exit 0 |

## Scope

**In scope** (the only files you should modify):
- `harness/docs/index.html`
- `harness/docs/ONBOARDING.md`
- `harness/checks/README.md`
- `harness/checks/validate.py` (Step 4 only — `count_parity_errors` + its self-test)
- `harness/plans/README.md` (status row)

**Out of scope** (do NOT touch):
- `harness/README.md`, `harness/CLAUDE.md` — verified current.
- Any file under `harness/.claude/` — that's plan 063.
- `harness/standards/` — the catalog is correct.
- The website app (`app/`, `lib/`, `content/`) — it reads the catalog directly;
  nothing here to sync.
- Historical records (`harness/plans/0*.md` other than the README row,
  `docs/decisions/`, `docs/reviews/`, `docs/catalog-changes/`, `CHANGELOG.md`
  past entries) — old counts in history are history, never rewritten.

## Git workflow

- Branch: `advisor/064-doc-truth`
- Conventional commits, e.g. `docs(harness): index.html + ONBOARDING truth sweep; [COUNT-SYNC] covers index.html (plan 064)`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix `docs/index.html`

1. `:326` — `38 controls` → `53 controls`.
2. `:355` — `the four skills` → `the eleven skills`.
3. `:372` — rewrite the cell to: `The control catalog — 53 controls (22 TFX-DS
   seed + 6 GovTech accessibility ratchet additions + 10 anti-slop controls +
   15 later ratchet additions), tiered L0/L1/L2`.
4. `:645` — `38-control catalog · four skills + evaluator agent` → `53-control
   catalog · eleven skills + evaluator agent`; also update the same cell's
   `catalog validator and token-audit built` to `catalog validator + ten check
   scripts built` (keep the rest of the sentence).

**Verify**: `grep -n "38 controls\|four skills" docs/index.html` → no matches;
`grep -c "53 controls" docs/index.html` → ≥ 2.

### Step 2: Fix `docs/ONBOARDING.md`

1. `:23-24` and `:109-110` — replace both seven-skill lists with the eleven-skill
   list (`start`, `setup`, `design`, `critique`, `standards`, `copy`, `polish`,
   `motion`, `flow`, `layout`, `feedback`); adjust "the seven skills" → "the
   eleven skills".
2. `:129` (§4 status paragraph) — rewrite to the true state: name the ten built
   scripts + `detect.py` (one line each is not needed — a comma list with a
   pointer to `checks/README.md` for per-script coverage), state that
   deterministic controls **covered by a built script** are checked by running
   it, and that the genuinely unbuilt checks (list from Current state, or
   point at `checks/README.md`) are still "verified manually". Keep the honesty
   rule: never report an unbuilt or un-run check as passed.
3. Phase-3 walkthrough item (`:202-204`) — extend to mention the three-stage
   gate: the plan is exposed in full, then grilled — the agent asks you
   pointed questions about it one at a time — then you approve via a
   structured Approve/Adjust turn (attended), or the record shows proxy
   approval (unattended).

**Verify**: `grep -n "seven skills\|\`content\`" docs/ONBOARDING.md` → no matches
(historical mentions of the `content`→`copy` rename, if any exist as history
notes, may stay — only the two install/verify lists must change);
`grep -n "11 check scripts are not built" docs/ONBOARDING.md` → no matches;
`grep -c "grill" docs/ONBOARDING.md` → ≥ 1.

### Step 3: Fix `checks/README.md`

1. `:92` — `the \`content\` buzzword summary` → `the \`copy\` buzzword summary`.
   In the same paragraph, extend the `[COUNT-SYNC]` sentence: `every "<N>
   controls" claim in README.md **and docs/index.html** must equal the
   catalog's actual control count` (matches Step 4).
2. `:94` — `SELF-TEST OK (30 cases)` → the actual current count (run
   `python3 checks/validate.py --self-test`; it prints 34 before Step 4 —
   write the post-Step-4 number, so do Step 4 first or come back).
3. `:101` — reword token-audit's coverage credit to:
   `COL-2 (Tailwind palette utility classes bypassing the semantic layer;
   COL-1 partial — palette bypass only, product-primary resolution is
   judgment)`.
4. `:259` — `SELF-TEST OK (34 cases)` → `SELF-TEST OK (42 cases)`.

**Verify**: `grep -n "30 cases" checks/README.md` → no matches;
`grep -n "(34 cases)" checks/README.md` → only the validate line if 34 is its
post-Step-4 count is WRONG — confirm the type-scan line says 42 and the
validate line says the number the self-test actually prints.

### Step 4: Extend `[COUNT-SYNC]` to `docs/index.html`

In `harness/checks/validate.py`, generalise `count_parity_errors` to scan a
list of files — `README.md` (existing) plus `docs/index.html` — with the same
`r"(\d+) controls"` regex and the same "file with no claim is fine" rule. Keep
the error format: `ERROR <relpath> [COUNT-SYNC]: says N controls, catalog has M`.

Add self-test case(s) mirroring the existing COUNT-SYNC cases (find them in the
self-test section — grep `COUNT-SYNC` in validate.py) for the index.html path:
one passing (claim equals count), one failing (stale claim detected). Follow
the existing self-test fixture pattern in the same file exactly.

**Note the interlock**: after Step 1, index.html contains `53 controls` (must
match the catalog count) and phrases like `10 anti-slop controls`. The regex
`(\d+) controls` requires the digits to sit immediately before the word
`controls`, so `10 anti-slop controls` does NOT match — but confirm this with a
quick `python3 -c "import re; print(re.findall(r'(\d+) controls', '10 anti-slop controls'))"`
before relying on it. If any legitimate `<N> controls` phrase in index.html
must state a non-catalog number, rephrase that prose (the hyphenated
`53-control catalog` form does not match the regex — acceptable), never weaken
the check.

**Verify**: `python3 checks/validate.py --self-test` → `SELF-TEST OK (N cases)`
with N ≥ 36 (two new cases); `python3 checks/validate.py` → `OK: 53 controls
valid`, exit 0. Negative test: temporarily change one `53 controls` in
index.html to `52 controls`, run validate, confirm it exits non-zero with a
`[COUNT-SYNC]` error naming `docs/index.html`, then revert.

### Step 5: Gates

From `harness/`: `python3 checks/validate.py` → `OK: 53 controls valid`.
`python3 checks/validate.py --self-test` → OK. From repo root: `pnpm build` →
exit 0 (index.html is served from `docs/`; the build must not break).

## Test plan

- Two new validate.py self-test cases (Step 4): index.html count-parity pass +
  fail. Pattern: the existing COUNT-SYNC self-test cases in `validate.py`.
- One manual negative test (Step 4 verify) — run and then revert; record the
  observed error line in the commit message or plan report.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -rn "38 controls\|four skills" harness/docs/index.html` → no matches
- [ ] `grep -rn "seven skills" harness/docs/ONBOARDING.md` → no matches
- [ ] `grep -rn "11 check scripts are not built" harness/docs/ONBOARDING.md` → no matches
- [ ] `grep -n "grill" harness/docs/ONBOARDING.md` → ≥ 1 match
- [ ] `grep -n "30 cases" harness/checks/README.md` → no matches; type-scan line says `(42 cases)`
- [ ] `python3 checks/validate.py --self-test` → OK with ≥ 36 cases; README's
      validate self-test count line equals the printed number
- [ ] Negative COUNT-SYNC test on index.html fired and was reverted (report it)
- [ ] `python3 checks/validate.py` → `OK: 53 controls valid`
- [ ] `pnpm build` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The line numbers/excerpts in "Current state" don't match (drift).
- The `(\d+) controls` regex DOES match a legitimate non-catalog number in the
  rewritten index.html and you cannot rephrase that prose without changing its
  meaning — report the conflict instead of weakening the regex.
- `validate.py --self-test` fails for a reason unrelated to your two new cases.
- Any edit would touch a `tfx-sync` marked fragment.

## Maintenance notes

- checks/README's self-test counts remain hand-maintained for the other ten
  scripts. A future validator sub-check could assert every `SELF-TEST OK (N
  cases)` claim in checks/README.md against the scripts' actual output —
  deferred here to keep this plan doc-shaped; note it in your report if the
  counts have drifted again by execution time.
- Plan 065/066 (catalog ratchets) will bump 53 → 54+; the extended COUNT-SYNC
  now forces index.html to be updated with README.md in the same commit —
  that is the point.
