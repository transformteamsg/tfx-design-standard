# Plan 062: Skill-stack restructure II — five focused passes (`copy`, `polish`, `motion`, `flow`, `layout`), `content` dissolved into `copy`

> **Executor instructions**: Follow this plan step by step; run every
> verification and confirm the expected result before moving on. On any STOP
> condition, stop and report. Update the 062 row in `harness/plans/README.md`
> unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**, from repo root:
> `git diff --stat d37e7fb..HEAD -- harness/.claude/skills harness/evals/routing/prompts.yaml harness/.claude-plugin harness/CLAUDE.md harness/README.md`
> HARD-depends on 061 — LANDED at main `d37e7fb`. Base re-stamped to `d37e7fb`.
> Only NEW drift since `d37e7fb` is a STOP.
>
> **DRIFT RECONCILIATION (reviewer-verified 2026-07-04) — the `content`→`copy`
> rename has CONSEQUENTIAL edits its original scope missed. These are now
> IN-SCOPE, required, and obviously-correct consequences of the rename (NOT
> scope creep — renaming a skill that a validator hardcodes REQUIRES the path
> fix):**
> - `harness/checks/validate.py:262` hardcodes
>   `os.path.join(repo_root, ".claude", "skills", "content", "SKILL.md")` for
>   the `[SLP9-SYNC]` consumer check. Change the string `"content"` → `"copy"`
>   (that ONE path literal only — no other validate.py logic). The original
>   plan's "STOP if validate.py references the content path" guard is
>   SUPERSEDED by this instruction: make the path edit, keep `[SLP9-SYNC]`
>   green, run `validate.py --self-test` (its self-test uses a `scratch.md`
>   fixture, not the real path, so it stays green).
> - `harness/docs/SYNC.md:49` documents that same path in the slp9-buzzwords
>   row — update `.claude/skills/content/SKILL.md` → `…/copy/SKILL.md`.
> - `harness/.claude/skills/critique/SKILL.md` — 061's boundary fix added the
>   NOT-clause "…those go to content." Update its target `content` → `copy`
>   (one word; the tiebreak now points at the renamed skill).
> - `harness/.claude/skills/design/SKILL.md` — the description ("the content
>   skill is sufficient") and body (~line 341 "Copy follows the `content`
>   skill") name the skill; retarget content → copy.
> - **DO NOT TOUCH** `lib/content.ts`, `scripts/check-standards.mjs` — their
>   `content`/`contentDir` refer to the WEBSITE `content/` MDX directory at
>   the repo root, NOT the content skill. They are unaffected by this rename.
> - The `<!-- tfx-sync:slp9-buzzwords -->` consumer marker lives inside
>   content/SKILL.md — `git mv` preserves it, so it rides into copy/SKILL.md
>   automatically; the validate.py + SYNC.md path updates above are what make
>   `[SLP9-SYNC]` find it at the new location.
> - PRESERVE (never revert): 056/058's design-skill scope + DESIGN.md edits;
>   061's start/setup/critique skills, the thinned standards, the critique
>   copy NOT-clause (you update its target, don't delete it). Plugin at
>   0.5.0 (→ 0.6.0). Routing at 53 cases (re-baseline + extend from 53).

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: HIGH (five new model-invoked descriptions on one boundary surface — pass-vs-critique-vs-design routing is the whole risk)
- **Depends on**: 061 (hard). 056 (soft — scope filtering). 052/053 artifacts for `layout`.
- **Category**: dx / direction
- **Planned at**: commit `48d13dd`, 2026-07-03; re-stamped `d37e7fb` after 056–061 landed (reconciliation block above)

## Why this matters

Second half of the operator's 2026-07-03 restructure: dimension-scoped
improvement passes a user (or the agent) can fire directly — "polish the
motion", "tighten the layout" — without running the full loop or a full
critique. Operator decisions locked: **all five passes are model-invoked**
(and therefore also user-typeable); **`content` dissolves into `copy`**
(rename + relocation — copy inherits content's description/triggers so
"rewrite this error message" keeps auto-routing); passes share one
procedure, scoped by dimension, and always run through the plan gate +
verify — a pass is a small loop, not a lawless edit.

## Skill-authoring rules (bind all five pass skills + pass.md)

Same writing-great-skills discipline as plan 061 (its "Skill-authoring
rules" section applies verbatim — read it there). Pass-specific additions:

1. **A pass SKILL.md is a thin branch head**: description (one trigger for
   the dimension ask + the two NOT-clauses: whole-page → `critique`, named
   change → `design`), the control-id subset, its reference-file pointers,
   and the `pass.md` context pointer. ≤ 30 lines. Everything procedural
   lives once, in `pass.md`.
2. **Cite the catalog, never restate it** — a pass names control ids; the
   ids ARE the rules. validate.py's cross-check is the enforcement.
3. **Leading words**: each pass's dimension word (*copy*, *polish*,
   *motion*, *flow*, *layout*) is its leading word — use it consistently in
   description AND body so invocation and execution anchor on the same
   token; don't dilute with synonyms ("animation/transition/movement" —
   pick *motion*, mention synonyms once in the description trigger only).
4. **Impeccable reference (optional, skip gracefully offline)**: their
   Refine commands (https://impeccable.style/docs — quieter, bolder,
   typeset, layout, animate) are the shape model for single-quality passes:
   narrow promise, visible before/after, nothing outside the dimension.
   Structure and tone only — every encoded rule comes from the TFX catalog.

## Target stack after this plan

```
start(router) · setup · design(create) · critique(evaluate)
copy · polish · motion · flow · layout        ← this plan
feedback · standards(thin)
```

## Current state (post-061 — re-verify)

- `critique/` owns `critique.md` (capture → layout read → findings → ranked
  suggestions) and `layout-patterns.md`.
- `content/SKILL.md` — voice/tone/naming/SLP-9 body + §6 per-product tone
  calibration; `design/SKILL.md` implement phase loads it by name; routing
  has ~5 content cases.
- Catalog dimensions per pass (control-id subsets — verify against live
  catalog): `copy` → CNT-*, SLP-9 (+ content body); `polish` → TOK-*,
  TYP-*, COL-*, SLP visual subset; `motion` → MOT-*, A11Y-5, SLP bounce
  rule; `flow` → CMP-2, CMP-3, A11Y-2 traversal, flow-applies_to controls;
  `layout` → LAY-*, layout-patterns.md (+ 053's LAY-1/LAY-7 if their gate
  cleared; `.tfx/design.json` layout_system if 058 landed).
- Routing suite: post-061 count with the re-baseline header.

## Commands

Same as 061: validate.py / `claude plugin validate harness` / routing probe
(`claude -p … --plugin-dir harness`).

## Scope

**In scope**: `skills/copy/` (rename from `content/`, description reworked),
`skills/polish/`, `skills/motion/`, `skills/flow/`, `skills/layout/`
(create), one shared `skills/critique/pass.md` (the common pass procedure —
lives with critique, its owner), `design/SKILL.md` (retarget the
content-skill pointer to `copy`, description + body), `critique/SKILL.md`
(one word: NOT-clause target content→copy), `harness/checks/validate.py`
(ONE path literal at line 262: `"content"`→`"copy"` — see reconciliation
block), `harness/docs/SYNC.md` (line 49 path), `start/SKILL.md` (route menu:
passes now live), `harness/CLAUDE.md` + `README.md` (stack tables),
plugin.json (0.6.0) + CHANGELOG + UPDATING, `evals/routing/prompts.yaml`,
`plans/README.md`.

**Out of scope**: critique.md / layout-patterns.md CONTENTS (owned by 061;
passes READ them — but critique/SKILL.md's one NOT-clause word IS in scope),
the catalog, all `checks/*.py` EXCEPT the single validate.py:262 path
literal, the WEBSITE (`lib/`, `app/`, `components/`, and the repo-root
`content/` MDX dir — `lib/content.ts`/`check-standards.mjs` `content` refs
are the website dir, NOT the skill), `setup`, `feedback`, `standards`, the
evaluator agent, golden/recall evals.

## Git workflow

Branch `advisor/062-focused-passes` (stack on 061 if unmerged);
`feat(harness): five focused passes — copy/polish/motion/flow/layout; content → copy (plan 062)`.

## Steps

### Step 1: Write the shared pass procedure — `critique/pass.md`

One file all five passes point at (single source; a pass SKILL.md carries
only its dimension). Procedure: (1) capture the surface (same mechanism
order as critique.md — reference it, don't copy); (2) load ONLY the pass's
control subset + its named reference files; (3) findings + ≤5 ranked
suggestions scoped to the dimension — anything outside the dimension is
NOTED and routed ("that's a `flow` matter"), never fixed; (4) plan-gate:
user approves; (5) implement + verify per the design skill's verify.md
(reference); (6) L0 findings are never scoped out — a contrast failure
surfaces even in a `motion` pass, flagged for immediate fix or explicit
routing.

**Verify**: file exists; `grep -c "L0" harness/.claude/skills/critique/pass.md` → ≥ 1.

### Step 2: `content` → `copy`

`git mv skills/content skills/copy`; `name: copy`. Description: keep
content's trigger set VERBATIM where it works (copy-only edits, any
user-facing text, longer prose) and add the pass phrasing ("improve/polish
the copy on <page>"). Body: keep the entire voice/tone/SLP-9 body (it IS
the dimension reference), append the pass procedure pointer ("for an
improve-the-copy-on-a-page run, follow `../critique/pass.md` with the CNT/
SLP-9 subset"). Update `design/SKILL.md`'s implement-phase load to `copy`,
and every live `content`-skill reference (CLAUDE.md table, README, SYNC.md
if it names the skill — check `grep -rn "content skill" harness/docs`).

Then apply the reconciliation-block consequential edits: `validate.py:262`
`"content"`→`"copy"`, `docs/SYNC.md:49` path, and the `critique/SKILL.md`
NOT-clause target `content`→`copy`.

**Verify**: `grep -rn "skills/content\|skills/\"content\"\|\"content\", \"SKILL" harness/ --include=*.py` → no live hits; `grep -rn "skills/content" harness/.claude harness/docs` → no live hits (history/plans docs exempt); `cd harness && python3 checks/validate.py` → `OK: 48 controls valid` with `[SLP9-SYNC]` GREEN; `python3 checks/validate.py --self-test` → passes; `grep -c "those go to copy" harness/.claude/skills/critique/SKILL.md` → 1.

### Step 3: Create `polish`, `motion`, `flow`, `layout`

Each SKILL.md ≤ 30 lines: model-invoked description (one trigger per branch:
the dimension ask — "polish the spacing/type", "smooth the animations",
"improve this flow", "tighten the layout" — plus a NOT-clause pointing
whole-page asks to `critique` and named changes to `design`); body = the
dimension's control-id subset (from Current state, verified live), its
reference files (`motion` → the MOT detail files + A11Y-5; `layout` →
`../critique/layout-patterns.md` + design.json layout_system when present),
and the `pass.md` pointer. No restated catalog rules.

**Verify**: 4 new dirs each with SKILL.md; `grep -c "pass.md" harness/.claude/skills/{polish,motion,flow,layout}/SKILL.md` → 1 each; every control id named in the four files exists: `python3 harness/checks/validate.py` → OK (it cross-checks referenced ids).

### Step 4: Router + docs + version

`start` route menu: passes live (drop "coming"). CLAUDE.md "Where things
live" + README stack surfaces gain the five passes in one grouped row/line
(not five table rows — keep the table scannable). plugin.json → 0.6.0;
CHANGELOG; UPDATING note (content→copy rename; no reinstall needed, dir
scan).

**Verify**: `claude plugin validate harness` exit 0; `grep -c "copy" harness/CLAUDE.md` → ≥ 1.

### Step 5: Routing — extend + full sweep

1. Re-expect the ~5 content cases → `copy`. Add per pass ≥ 2 positives and
   the boundary set: "Polish the motion on the attendance page" → motion;
   "The animations feel janky on save" → motion; "Improve the copy on the
   marks page" → copy; "Tighten the layout of the student notes list" →
   layout; "This multi-step form loses my draft" → flow; guards: "Polish
   the attendance page" (no dimension) → critique; "Add a transition when
   the panel opens" (named change) → design; "Make the site load faster" →
   none. Update header count (~60).
2. Full sweep, 100% bar, one revision round per failing description then
   STOP with the matrix. Watch cannibalisation BOTH ways: passes stealing
   critique's whole-page asks, and critique stealing dimension asks.

**Verify**: matrix recorded, all pass.

### Step 6: Gates

validate.py OK; plugin validate exit 0; `pnpm build` exit 0; `git status`
in-scope only; index row.

## Test plan

Routing sweep (the risk lives there) + validate.py's control-id
cross-checks over the five new bodies + the grep gates.

## Done criteria

- [ ] Five pass skills exist; `content/` gone; copy inherits its body + [SLP9-SYNC] still green
- [ ] `pass.md` single-sources the procedure; no pass restates catalog rules (spot-grep a rule phrase)
- [ ] L0-never-scoped-out rule present in pass.md
- [ ] Full sweep 100% incl. all boundary guards; re-baselined content cases noted in header
- [ ] validate + plugin validate + build green; 0.6.0 + CHANGELOG + UPDATING
- [ ] `git status` in-scope only; index row updated

## STOP conditions

- 061 not landed (it has — main `d37e7fb`).
- `[SLP9-SYNC]` still fails AFTER the validate.py:262 path update + the
  git-mv marker move — that would mean the rename broke something the
  reconciliation block didn't foresee (e.g. a second hardcoded path). Report
  it. (The single documented path edit is EXPECTED and in-scope — do NOT
  STOP merely because validate.py references the content path; that is the
  thing you are fixing.)
- Any pass description can't hold its boundary after ONE revision (the
  pass-vs-critique-vs-design or pass-vs-copy cannibalisation).
- A pass body starts restating catalog rule TEXT instead of citing ids.
- You find a hardcoded content-skill path OUTSIDE the four enumerated in the
  reconciliation block (validate.py:262, SYNC.md:49, critique NOT-clause,
  design refs) — report it before editing.

## Maintenance notes

- Adding a sixth pass later = one ≤30-line SKILL.md + routing cases; the
  procedure stays in pass.md. Resist per-pass procedure forks.
- If 059's detector lands, each pass's verify step should run the curated
  profile scoped to its files — small follow-up, not wired here.
- The dimension→control-id subsets will drift as the catalog grows; the
  subsets cite ids, and validate.py's existing cross-check catches deleted
  ids but NOT new ones that should join a pass — reviewers of catalog
  ratchets should ask "which pass owns this control?"
