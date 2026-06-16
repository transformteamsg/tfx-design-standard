# Plan 010: Build `checks/a11y-static` — the static focus-visible + role/name scan (first a11y check)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/checks/ harness/standards/catalog.yaml harness/.claude/skills/tfx-design-ui/SKILL.md`.
> If `checks/token-audit.py`, `checks/README.md`, or the A11Y-2/3/8 catalog
> entries changed since this plan was written, compare the "Current state"
> excerpts against the live files before proceeding; on a mismatch, treat it as
> a STOP condition. All paths below are relative to the harness root
> (`harness/` in the dev repo; the plugin root when installed).

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (a noisy scanner erodes trust in the whole checks idea — same lesson as plan 007; calibration in step 3 is load-bearing)
- **Depends on**: none (models after `checks/token-audit.py`)
- **Category**: dx
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

A11Y-2 (keyboard reach + **visible focus**) and A11Y-3 (visible label on every
field) are **L0 non-negotiables**; A11Y-8 (name/role/value) is L1. None has a
built check — every accessibility control is graded by eyeball today, and
eyeballs are inconsistent: an **L0 invisible-keyboard-focus** issue (dropdown
options styled `outline-none` with no `focus-visible:` replacement) passed a
"completed" audit because the component was greped for colour but never operated.
`checks/token-audit.py` proved a pure static scanner is high-leverage and ships
without a browser. A static **focus-visible + role + accessible-name** scan
catches that exact class of L0 defect mechanically.

This check is an **honest subset**: computed contrast (A11Y-1), hit-area
(A11Y-4), live keyboard traversal, and ARIA *state-tracking* still need a
rendered DOM and stay manual/`axe` work. The plan must keep the scanner's
self-description and the SKILL.md note accurate about what it does and does not
cover — overstating enforcement is the failure mode this whole harness exists to
prevent (`tfx-design-ui/SKILL.md:86-93`).

## Current state

- `checks/token-audit.py` — **the structural exemplar. Match it exactly**:
  - stdlib + `re` only, no third-party deps;
  - `TARGET_EXTENSIONS = {".css",".html",".jsx",".tsx",".js",".ts",".vue",".svelte"}`;
  - per-line scan with a comment-stripping pass (`_strip_block_comments`,
    `re.sub(r"//.*$", …)` for JS) so commented code isn't flagged;
  - an `emit(ctl_id, found, suggest)` closure producing
    `ERROR <rel>:<lineno> [<CTL-ID>] <found> — suggest: <…>`;
  - `check_file(path) -> list[str]`, `scan_paths(paths)`, `main()` with
    `--self-test`; exit 0 silent on pass, exit 1 with ERROR lines on fail;
  - an embedded `run_self_test()` with `assert_violations(name, content, ext, [ctl_ids])`
    and `assert_clean(name, content, ext)` helpers, printing
    `SELF-TEST OK (N cases)`.
- `checks/validate.py` — the other built check; same ERROR-line + exit contract.
- `standards/controls/a11y-8.md:47-50` (verbatim) — already specs the planned
  scan: *"Deterministic half — planned `checks/nrv`: scan interactive elements
  for role + accessible-name + state attributes; native elements pass by
  default. Until built: verify manually."*
- `standards/catalog.yaml` — target controls (verbatim `fails_when`):
  - **A11Y-2** · L0 · deterministic · `fails_when: [focus ring removed without
    replacement, click handlers on non-focusable elements]` (`catalog.yaml:52-54`)
  - **A11Y-3** · L0 · deterministic · `fails_when: [placeholder used as the only
    label, icon-only button without aria-label]` (`catalog.yaml:66-68`)
  - **A11Y-8** · L1 · hybrid · `fails_when: [custom control with no role or
    accessible name, visual state change with no ARIA state update]`
    (`catalog.yaml:140-142`)
- `checks/README.md:43-66` — the "Planned for V1" table lists `focus` (A11Y-2),
  `labels` (A11Y-3), and `nrv` (A11Y-8 deterministic half) as **separate**
  planned checks. This plan delivers their **statically-detectable subset** as
  one script, `a11y-static`, and updates those three rows to point at it.
- `tfx-design-ui/SKILL.md:86-93` (v0-reality note) and `:233-239` (Phase 5
  step 1) — currently assert that *all* a11y is manual. After this lands, the
  static subset of A11Y-2/3 is script-checked; the note must say so without
  overclaiming the rest.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Self-test (after build) | `python3 checks/a11y-static.py --self-test` | `SELF-TEST OK (N cases)` |
| Run on fixtures | `python3 checks/a11y-static.py checks/fixtures/a11y-static/pass.tsx` | exit 0, no output |
| Run (fail fixtures) | `python3 checks/a11y-static.py checks/fixtures/a11y-static/fail.tsx` | exit 1, one ERROR per planted violation |
| Catalog validator | `python3 checks/validate.py` | `OK: …` (must pass before AND after) |
| False-positive stress | `python3 checks/a11y-static.py ../components ../app` | (review every hit — see step 3) |

## Scope

**In scope** (the only files you create/modify):
- `checks/a11y-static.py` (create)
- `checks/fixtures/a11y-static/pass.tsx`, `.../fail.tsx`, `.../pass.html`, `.../fail.html` (create)
- `checks/README.md` — move the `focus`/`labels`/`nrv` rows into a "Built"
  subsection mirroring the token-audit entry; keep table rows with a "✅ built
  (static subset)" marker rather than deleting them
- `.claude/skills/tfx-design-ui/SKILL.md` — update the v0-reality note (`:86-93`)
  and Phase 5 step 1 (`:233-239`) so they name `a11y-static` for the static
  subset of A11Y-2/3/8 and keep the manual pass for everything it cannot see

**Out of scope** (do NOT touch):
- `checks/token-audit.py` and any other check script.
- The A11Y-1/4/5/6/7/9/10/11 controls and their detail files.
- Hook wiring (`settings.json` PostToolUse) — deferred until the script has run
  against a real product repo (same staging discipline as plan 007).
- Any change to the A11Y-2/3/8 **catalog entries** (tier, verify text). You only
  reference them; rewording is a design-lead change.
- ARIA **state-tracking** detection (aria-pressed/selected flips with visual) —
  too fuzzy for a reliable static rule; it stays in the manual pass. Name it as
  a deferred extension in the script docstring.

## Git workflow

- Branch: `advisor/010-a11y-static`. Conventional commits
  (`feat: add checks/a11y-static focus+role+name scanner`). Do NOT push.

## Steps

### Step 1: Write the detection rules into the script docstring (three rules, all high-confidence)

Keep v1 to three line-local, low-false-positive rules. Each is a regex pass over
the (comment-stripped) line, restricted to `.jsx/.tsx/.js/.ts/.html/.vue/.svelte`
(skip pure `.css` for the JSX rules; the focus rule also applies in `.css`/style
blocks via a `:focus`/`:focus-visible` check).

- **Rule FOCUS → `[A11Y-2]` (L0): outline removed without a focus-visible replacement.**
  On a single element's class string (a `className="…"`/`class="…"` value, or a
  CSS selector block), if it contains an outline-removal token —
  `outline-none`, `outline-0`, `focus:outline-none`, or CSS `outline: *none|0`
  — and the SAME class string / rule contains **no** focus-visible replacement
  (`focus-visible:outline`, `focus-visible:ring`, `focus-visible:border`,
  `focus-visible:shadow`, a `ring-*` paired with `focus:`/`focus-visible:`, or a
  CSS `:focus-visible { … outline|box-shadow|border … }`), emit:
  `ERROR … [A11Y-2] focus outline removed with no focus-visible replacement — suggest: add focus-visible:outline-2 / focus-visible:ring-2`.
  This is the rule that catches the documented L0 miss.
- **Rule KBD → `[A11Y-2]` (L0): click handler on a non-focusable element.**
  A `<div`/`<span` (or `<li`/`<p`) opening tag on the line carrying an
  `onClick`/`onMouseDown` (JSX) or `(click)`/`@click` (template) handler, with
  **no** `role=` and **no** `tabIndex`/`tabindex` attribute on the same tag,
  emits:
  `ERROR … [A11Y-2] click handler on non-focusable <div> (no role, no tabIndex) — suggest: use <button> or add role + tabIndex + key handler`.
- **Rule NAME → `[A11Y-3]` (L0): icon-only control with no accessible name.**
  A `<button`/`role="button"` opening tag with **no** `aria-label`,
  `aria-labelledby`, or `title`, whose tag is self-closing OR whose same-line
  content is only an icon (`<svg`, a `<Icon`/`*Icon` component, or an
  `aria-hidden` child) with no visible text, emits:
  `ERROR … [A11Y-3] icon-only button with no accessible name — suggest: add aria-label`.
  (Cross-line button bodies are out of static reach — do NOT guess; only flag
  the same-line/self-closing case.)

Output one ERROR line per violation; exit 1 if any; exit 0 silent otherwise.
There is **no waiver suppression** here — A11Y-2/3 are L0 (never waivable) and
A11Y-8 is L1; mirror token-audit's behaviour (an inline `tfx-waive` does not
silence the line). For v1, simply do not implement waiver parsing (L0 can't be
waived); note this in the docstring.

### Step 2: Implement `checks/a11y-static.py`

Copy the skeleton of `token-audit.py` (CLI, `check_file`, `scan_paths`, `main`,
`run_self_test`, comment stripping, the `emit` closure and ERROR format). Replace
the detection body with the three rules from step 1. Keep it stdlib-only.

**Verify**: `python3 checks/a11y-static.py --self-test` → `SELF-TEST OK (N cases)`.

### Step 3: Build fixtures and calibrate against the real product code

Create `checks/fixtures/a11y-static/`:
- `fail.tsx` — one planted violation per rule, each on a comment naming the
  expected control id: a button `className="… outline-none …"` with no
  focus-visible (A11Y-2 FOCUS); a `<div onClick={…}>` with no role/tabIndex
  (A11Y-2 KBD); an icon-only `<button><SearchIcon /></button>` with no aria-label
  (A11Y-3 NAME).
- `pass.tsx` — the corrected forms: `focus-visible:ring-2` present; a real
  `<button>` or a div with `role="button" tabIndex={0}` + key handler; a button
  with `aria-label="Search"`.
- `pass.html` / `fail.html` — the same three in HTML (`class=`, `onclick=`).

Then the calibration gate — run the scanner over THIS repo's product components,
which are NOT subject to the harness's catalog but exercise real JSX:
`python3 checks/a11y-static.py ../components ../app`. **Review every hit by hand**
and confirm each is a true positive (a real focus/role/name gap) — the test is
attribution accuracy, not a clean pass. If the scanner produces hits you judge
false (e.g. a focus-visible style applied in a shared CSS file the line-local
rule can't see), tighten the rule or add the pattern to a documented exemption,
and record the case in the docstring. A scanner that cries wolf will be ignored.

**Verify**: `… pass.tsx pass.html` → exit 0, no output; `… fail.tsx fail.html`
→ exit 1, one ERROR per planted violation with control ids matching the fixture
comments exactly.

### Step 4: Update docs honestly

- `checks/README.md`: add a "Built" subsection for `a11y-static` (command, the
  three rules, the explicit *static-subset* caveat — it does not verify computed
  contrast, hit-area, traversal, or ARIA state). Mark the `focus`/`labels`/`nrv`
  table rows "✅ built (static subset)".
- `.claude/skills/tfx-design-ui/SKILL.md`: in the v0-reality note (`:86-93`) and
  Phase 5 step 1 (`:233-239`), state that `checks/a11y-static` now covers the
  static subset of A11Y-2/3/8 (focus-visible removal, non-focusable click
  handlers, icon-only unnamed controls) and that everything else in A11Y still
  runs the manual pass. Do not claim A11Y-2/3/8 are fully mechanically verified.

**Verify**: `grep -c "a11y-static" checks/README.md` → ≥ 2;
`grep -c "a11y-static" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1.

## Test plan

The self-test + fixtures ARE the tests (no test framework in this repo):
- self-test embeds ≥ 8 cases — at least two per rule (one violating, one clean)
  plus the comment-stripping case (a commented-out `outline-none` line must NOT
  flag) and a native-element pass (`<button>Save</button>` with no extra attrs
  is clean).
- fail fixtures exit 1 with exact control-id attribution; pass fixtures exit 0.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python3 checks/a11y-static.py --self-test` → `SELF-TEST OK (N cases)`, N ≥ 8
- [ ] `python3 checks/a11y-static.py checks/fixtures/a11y-static/pass.tsx checks/fixtures/a11y-static/pass.html` → exit 0, no output
- [ ] `python3 checks/a11y-static.py checks/fixtures/a11y-static/fail.tsx checks/fixtures/a11y-static/fail.html` → exit 1, one ERROR per planted violation, ids match the fixture comments
- [ ] `python3 checks/validate.py` passes (catalog untouched)
- [ ] `grep -c "a11y-static" checks/README.md` → ≥ 2 and the static-subset caveat is present
- [ ] Only in-scope files modified (`git status`); `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- The calibration run (step 3) produces false positives you cannot eliminate
  without making a rule so narrow it misses the planted fixture case — report the
  conflict; a noisy scanner must not ship.
- Making the FOCUS rule reliable would require resolving CSS across files (the
  focus style lives in a shared stylesheet, not the element's class string) —
  report it; cross-file CSS resolution is a browser/axe job, out of scope here.
- You find yourself wanting to add ARIA state-tracking detection to hit more of
  A11Y-8 — that's the deferred fuzzy rule; STOP and leave it to the manual pass.
- The A11Y-2/3/8 catalog entries differ from the "Current state" excerpts (drift).

## Maintenance notes

- First run against the real Teacher Workspace product repo is the true
  calibration; budget a tuning pass before wiring any PostToolUse hook (same as
  token-audit, `checks/README.md:68-70`).
- When a browser-based a11y check (`axe`) is later added for A11Y-1/4 and live
  traversal, `a11y-static` stays as the fast, no-render pre-filter — keep its
  runtime under ~1s per changed file.
- The ARIA state-tracking half of A11Y-8 remains manual/evaluator work; the
  component-inventory plan (014) is what makes sure the evaluator actually
  operates each interactive control to catch it.
- Reviewer should scrutinise the FOCUS rule's replacement-token list against the
  product's real focus convention (it may use `data-focus-visible` or a Base UI
  built-in ring) and widen the allowlist if so.
