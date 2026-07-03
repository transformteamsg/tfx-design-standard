# Plan 061: Skill-stack restructure I — `/tfx:start` router, `onboard`→`setup`, new `critique`, `standards` thinned

> **Executor instructions**: Follow this plan step by step; run every
> verification and confirm the expected result before moving on. On any STOP
> condition, stop and report. Update the 061 row in `harness/plans/README.md`
> unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**, from repo root:
> `git diff --stat 48d13dd..HEAD -- harness/.claude/skills harness/.claude-plugin harness/CLAUDE.md harness/README.md harness/docs/ONBOARDING.md harness/docs/UPDATING.md harness/evals/routing/prompts.yaml harness/CHANGELOG.md`
> Skills WILL have drifted if 056/058 landed (expected — their edits are
> compatible; carry them forward, never revert them). On any drift NOT
> explained by a landed plan, STOP.

## Status

- **Priority**: P1 (operator-directed restructure, 2026-07-03)
- **Effort**: L
- **Risk**: HIGH (multiple description changes = the whole routing surface moves; mitigated by the full sweep + re-baseline sign-off)
- **Depends on**: 055 (landed). **Soft**: 058 (setup's context-init step uses its template/generator — degrade gracefully if absent, see Step 3). Execute BEFORE 062.
- **Category**: dx / direction
- **Planned at**: commit `48d13dd`, 2026-07-03 — re-verify excerpts against live HEAD before executing

## Why this matters

Operator finding: the domain-named stack (design/standards/content/onboard/
feedback) is hard to navigate — "I'm confused when to use which." The decided
target (this conversation, 2026-07-03) is an intent-shaped stack:

```
/tfx:start  router + orientation (user-invoked; auto-runs setup when context missing)
setup       replaces onboard — deps + context-layer init (model-invoked, keeps 055 triggers)
design      CREATE (unchanged role)
critique    EVALUATE + POLISH (new; evaluate existing pages, ranked suggestions, gated fixes)
[five focused passes — plan 062]
feedback    only support skill (unchanged)
standards   thin rulebook shell (kept for the memory-answer guard on waiver questions)
```

Decisions locked by the operator — do not re-litigate:
- `start` is user-invoked only (`disable-model-invocation: true`) — zero
  context load; its description is human-facing.
- `setup` replaces `onboard` entirely (one week after 055 — accepted churn);
  the tour content becomes `start`'s orientation opening.
- `critique` is the new model-invoked verb; `design` keeps
  modification-phrasing asks ("add a field", "change X to Y"); `critique`
  takes evaluation/improvement asks with no specified change ("review",
  "improve", "polish", "what's wrong with", "I don't like").
- `standards` stays as a THIN shell (waiver/applicability questions must not
  be answered from memory), body slimmed to pointers at `standards/README.md`.
- `content` is NOT touched in this plan — it dissolves into the `copy` pass
  in plan 062.

## Skill-authoring rules (bind every SKILL.md this plan creates or rewrites)

The operator requires the writing-great-skills discipline, inlined here
because the executor doesn't have that skill:

1. **Invocation is a cost decision.** `start` is user-invoked
   (`disable-model-invocation: true`) — zero always-loaded context; its
   description is a one-line human summary, no trigger lists. Model-invoked
   skills (`setup`, `critique`) pay context load per description word — one
   trigger per genuinely distinct branch, no synonym pile-ups, boundaries
   (NOT-clauses) kept sharp.
2. **`start` is a textbook router skill** — its whole job is naming the
   other skills and when to reach for each; it does no work itself.
3. **Progressive disclosure.** Inline only what every run needs; push
   branch-specific material behind context pointers whose *wording* fires
   the read ("read `setup.md` (beside this file) and follow it", not a
   mention). `critique`'s procedure lives in `critique.md`, not its SKILL.md.
4. **Single source of truth — cite, never restate.** Skills reference
   catalog controls by id (`CMP-2`, `LAY-4`); restating a rule's text in a
   skill recreates the drift `docs/SYNC.md` exists to prevent. The thinned
   `standards` shell is this rule applied to itself.
5. **Checkable completion criteria** per step ("wait for the user's
   approval of the ranked list", not "make sure they're happy"). Hunt
   no-ops sentence by sentence — a line the model already obeys by default
   is paid-for noise.
6. **SLP-9 binds this prose**: second person, plain language, Singapore
   English, no AI-writing tells.

**Impeccable reference (optional, graceful skip if no web access):** before
authoring `critique`, fetch https://impeccable.style/docs/critique and
https://impeccable.style/docs/shape for the *shape* of their evaluate
commands — scoring, persona framing, review-without-changing discipline.
Reference for structure and tone only; every rule you encode must come from
the TFX catalog, never copied from impeccable's ruleset.

## Current state (verify each before editing)

- `harness/.claude/skills/` = `content design feedback onboard standards`
  (+ `onboard/setup.md` from 055). `design/` contains `critique.md`,
  `verify.md`, `implement-craft.md`, `layout-patterns.md`.
- `onboard/SKILL.md` — post-055: tour steps 1–4 + shape (4) setup + probe
  line; description covers onboarding AND setup triggers.
- `design/SKILL.md` — description ends "…For copy-only edits the content
  skill is sufficient; for questions about the catalog itself use standards."
  Body: critique-first for redesigns reads `critique.md`; Phase 5 verify
  reads `verify.md`.
- `standards/SKILL.md` — full catalog-mechanics body (~reading/filtering,
  waivers, ratchet sections); `standards/README.md` carries the same ground
  truth as the format spec.
- `harness/.claude-plugin/plugin.json` `"version": "0.4.0"`;
  `plugin.json` has `"skills": "./.claude/skills/"` (directory-scanned — a
  renamed folder is picked up automatically).
- `harness/evals/routing/prompts.yaml` — 43 cases post-055 (or 48 post-056);
  header documents probe command + sweep rule. Cases 42–43 route
  improvement-phrasing to design/standards ("I don't like the empty state on
  the student notes page" → design) — these get RE-BASELINED (Step 6).
- Docs naming surfaces: `harness/CLAUDE.md` "Where things live" table,
  `README.md` (diagram line 19, tree ~73, Install ~109), `docs/ONBOARDING.md`
  items 0/3, `docs/UPDATING.md` (migration section pattern from 0.3.0).

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Catalog + parity | `cd harness && python3 checks/validate.py` | `OK:` exit 0 |
| Plugin manifest | `claude plugin validate harness` | exit 0, pre-existing warning only |
| Routing probe | `claude -p "<prompt>" --max-turns 2 --output-format stream-json --verbose --plugin-dir harness` (fresh session each, repo root) | expected skill in Skill tool calls |

## Scope

**In scope**: `harness/.claude/skills/start/` (create), `…/setup/` (rename
from `onboard/`, rewrite SKILL.md, keep `setup.md`), `…/critique/` (create;
MOVE `design/critique.md` + `design/layout-patterns.md` into it),
`design/SKILL.md` (description + body), `standards/SKILL.md` (slim),
`harness/CLAUDE.md`, `harness/README.md`, `docs/ONBOARDING.md`,
`docs/UPDATING.md`, `.claude-plugin/plugin.json`, `CHANGELOG.md`,
`evals/routing/prompts.yaml`, `plans/README.md`.

**Out of scope**: `content/` skill (062), `feedback/` skill, the evaluator
agent, the catalog/schema/validators/checks, the website, the five focused
passes (062), historical records.

## Git workflow

Branch `advisor/061-stack-restructure`; commit per step;
`feat(harness): skill stack restructure — start/setup/critique, standards thinned (plan 061)`.
No push/PR unless instructed.

## Steps

### Step 1: Create `start` (user-invoked router)

`skills/start/SKILL.md`: frontmatter `name: start`,
`disable-model-invocation: true`, one-line human description ("Start here —
orientation, context check, and routing to the right TFX skill").
Body, in order:
1. **Orientation** — port onboard's step-1 gist (the promise, the loop, the
   catalog; ~10 lines, pointers over restatements).
2. **Context check** — run `agent-browser --help`; check the product repo for
   `DESIGN.md` and `.tfx/design.json`. Anything missing → say so in one line
   and **invoke `setup`** before routing (this is the auto-invoke the
   operator asked for).
3. **Route menu** — the run-shapes, now naming the full stack: create →
   `design`; review/improve an existing page → `critique`; focused pass →
   name the 062 passes (mark "coming" until 062 lands); copy-only →
   `content` (until 062 re-points it to `copy`); rulebook/waiver →
   `standards`; harness feedback → `feedback`. One question, wait, invoke.

**Verify**: `grep -c "disable-model-invocation: true" harness/.claude/skills/start/SKILL.md` → 1.

### Step 2: Rename `onboard` → `setup` and rewrite

1. `git mv harness/.claude/skills/onboard harness/.claude/skills/setup`;
   `setup.md` (the dependency checklist) stays as-is inside it.
2. Rewrite SKILL.md: `name: setup`. Description keeps 055's setup triggers
   AND the onboarding triggers ("onboard me", "I'm new to the harness") —
   those asks now land here; its first line for tour-seekers: orient in two
   lines, then point at `/tfx:start` for the guided menu. Body = (a) run the
   `setup.md` dependency sweep (unchanged consent rules), (b) **context-layer
   init**: if the product repo lacks `DESIGN.md` and 058's template exists
   (`harness/docs/templates/DESIGN.md`), offer to copy + fill it and run
   `scripts/generate-design-json.py`; if 058 has not landed, skip with one
   honest line. 
3. Sweep every `onboard` reference: `grep -rn "onboard" harness/ --include="*.md" -l`
   (excluding `plans/`, `docs/decisions/`, `docs/reviews/`, CHANGELOG history)
   and update live surfaces (CLAUDE.md table, README ×3, ONBOARDING.md,
   `design/verify.md` + `critique-`pointer paths `../onboard/setup.md` →
   `../setup/setup.md`).

**Verify**: `test -f harness/.claude/skills/setup/setup.md`; `grep -rn "onboard/setup.md" harness/.claude/skills/` → no matches; `grep -c "onboard me" harness/.claude/skills/setup/SKILL.md` → ≥ 1.

### Step 3: Create `critique` (the new verb)

1. `skills/critique/SKILL.md`, model-invoked. Description (draft — tune only
   via Step 6's revision rule): "Critique an existing Teacher & School
   product page — capture it, grade it against the standards catalog and
   layout patterns, and return scored, ranked improvement suggestions
   without changing anything; then, on the user's approval, execute the
   accepted suggestions through the design loop's implement and verify
   phases. Use when the user asks to review, critique, audit, improve,
   polish, or judge an existing page or says they don't like it — WITHOUT
   naming a specific change. NOT for a named change ('add a field', 'change
   the button') or a new page; those go to design. NOT for grading the
   loop's own output; that is the evaluator agent."
2. MOVE `design/critique.md` and `design/layout-patterns.md` into
   `critique/` (`git mv`); they are its procedure. Body: load catalog (+
   scope filter per the standards pointer), run the moved critique
   procedure (capture → layout read → findings → ≤5 ranked suggestions),
   present with scores, STOP for approval, then hand the approved list to
   `design` as a specified-change run (which is now modification-phrased —
   clean boundary).
3. Update `design/SKILL.md`: description drops re-audit/critique-adjacent
   wording ONLY where it collides ("review" phrasing), keeps
   create/modify/re-audit-after-catalog-change; body's critique-first
   redesign path now says "invoke `critique` first, continue when the user
   approves suggestions"; fix the moved-file references (`critique.md`,
   `layout-patterns.md` paths → `../critique/…`).
4. Add the shared standards pointer line (the operator's "bake it in") to
   BOTH design and critique bodies: "For any waiver or applicability
   question read `../../../standards/README.md` — never answer from memory."

**Verify**: `test -f harness/.claude/skills/critique/critique.md`; `grep -rn "layout-patterns" harness/.claude/skills/design/` → pointer-only (no file); `grep -c "never answer from memory" harness/.claude/skills/{design,critique}/SKILL.md` → 1 each.

### Step 4: Thin `standards`

Slim the body to: the load-and-filter rules (keep — they're operational),
and pointers at `standards/README.md` for tiers/waivers/ratchet instead of
restating them. Description unchanged EXCEPT removing any body-content it
duplicated. Target ≤ 40 lines. Do not delete the skill.

**Verify**: `wc -l harness/.claude/skills/standards/SKILL.md` → ≤ 45; `python3 harness/checks/validate.py` → OK (its control-id references survive).

### Step 5: Version + docs

plugin.json 0.4.0 → 0.5.0 (adjust from live if 056/058 bumped it);
CHANGELOG entry (rename table old→new, the new verbs, the re-baseline note);
`docs/UPDATING.md` migration section modelled on the 0.3.0 one (folder
rename `onboard`→`setup` needs no reinstall — plugin scans the skills dir —
but say what changed); CLAUDE.md "Where things live" rewritten to the new
stack; README diagram/tree/Install lines.

**Verify**: `claude plugin validate harness` → exit 0; `grep -c "0.5" harness/.claude-plugin/plugin.json` → 1.

### Step 6: Routing — re-baseline + full sweep

1. Rewrite `prompts.yaml`: update `expect:` values that legitimately move
   (list them in the file header as a dated re-baseline note): "I don't like
   the empty state…" design→critique; onboarding cases onboard→setup; setup
   cases onboard→setup. Add new cases: ≥ 4 critique positives ("Review the
   attendance page", "What's wrong with this form?", "Improve the student
   notes page", "Audit this page against the standards"), ≥ 3 boundary
   guards ("Add a remarks field…" → design stays; "Rewrite this error
   message…" → content stays; "Grade the page the loop just produced" →
   none/evaluator-not-a-skill), start is user-invoked (no cases needed).
   Update the header count.
2. **Full sweep** (multiple descriptions changed), same probe command and
   scoring as plan 055's execution. Pass bar: 100%. One revision round per
   failing description, then STOP with the matrix.
3. **Re-baseline sign-off**: the changed `expect:` values are a semantic
   decision — record in the commit body that they implement the operator's
   2026-07-03 restructure direction, and list old→new per case.

**Verify**: sweep matrix recorded, all pass; yaml case count matches header.

### Step 7: Gates

validate.py OK; plugin validate exit 0; `pnpm build` exit 0 (README/site
untouched by logic but cheap); `git status` in-scope only; index row.

## Test plan

The routing sweep IS the test (this plan is routing-risk concentrated);
plus validate.py (control-id references in moved/slimmed skills) and the
grep gates per step.

## Done criteria

- [ ] Stack on disk = `start setup design critique standards content feedback` (content untouched)
- [ ] `critique/` owns critique.md + layout-patterns.md; design references them by pointer only
- [ ] start is user-invoked; its context check invokes setup when deps/DESIGN.md missing
- [ ] standards ≤ 45 lines, still answers waiver questions from the README source
- [ ] Full routing sweep recorded, 100%, re-baseline table in commit body
- [ ] validate + plugin validate + build green; 0.5.0 + CHANGELOG + UPDATING
- [ ] `git status` in-scope only; index row updated

## STOP conditions

- Drift not explained by a landed plan (056/058/059/060).
- The critique/design boundary fails routing after one revision round.
- Any temptation to delete `standards` or `content` (062's job) outright.
- The moved files are referenced by paths this plan didn't enumerate
  (`grep -rn "critique.md\|layout-patterns" harness/` before moving — if
  hits exist outside design/, STOP and list them).

## Maintenance notes

- 062 builds directly on this: passes reuse critique's capture/read
  machinery and dissolve `content` into `copy`. Land 061 first, always.
- The re-baselined routing expectations are the new ground truth — future
  "why does 'improve X' not go to design?" questions are answered by the
  dated header note, not re-litigated.
- Golden tasks and evaluator-recall are untouched (loop internals didn't
  change) — but golden 002/003 prompts should be spot-read for old skill
  names before the next orchestrated run.
