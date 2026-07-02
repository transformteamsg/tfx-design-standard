# Plan 052: Layout taste pass — agent-browser capture first, a structured layout read, and ranked improvement suggestions in the loop

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat c42d695..HEAD -- harness/.claude/skills/ harness/.claude/agents/`
> Plans 046/047/049 landing first is EXPECTED and REQUIRED drift — this plan
> edits the files 049 creates (`critique.md`, `verify.md`) under the post-047
> names. If 049 has NOT landed, STOP — execute 047 and 049 first.

## Status

- **Priority**: P1 (direct user ask)
- **Effort**: M
- **Risk**: MED (prose changes to always-loaded skill files; no routing description changes)
- **Depends on**: 049 (hard — edits `critique.md`/`verify.md`), 047 (transitively, for names)
- **Category**: dx / direction
- **Planned at**: commit `c42d695`, 2026-07-02

## Why this matters

Today the harness *verifies* layout (LAY-2..6, SLP-4/5/7/10 at the verify gate)
but does not *improve* it: the critique step looks for control violations, and a
page can pass every control while still being a mediocre composition. The user
wants the harness to actively raise layout quality: capture the page with
agent-browser, actually understand its layout, and come back with concrete,
ranked improvement suggestions — the way impeccable.style treats critique as a
first-class step in its workflow (shape → craft → critique → polish) rather than
a pass/fail gate. This plan adds a structured **layout read** to the critique
procedure, a distilled **layout patterns** reference the read judges against,
and makes **agent-browser the first capture mechanism** (it is the tool the
team actually has installed; today the skill says "Claude-in-Chrome by default"
and mentions agent-browser only as a misbehaving daemon in a fallback note).

## Current state

(All paths assume plans 046/047/049 have landed: skills are `design`,
`standards`, `content`, `onboard`; the design skill has side-files
`implement-craft.md`, `verify.md`, `critique.md`.)

- `harness/.claude/skills/design/critique.md` — created by plan 049; carries the
  existing-surface critique procedure verbatim from the old SKILL.md, whose
  capture step reads: "Capture mechanism: use Claude-in-Chrome by default, or
  the user's installed browser agent of choice; the local Playwright fallback
  from Phase 5 applies. If capture keeps failing, ask the user to provide the
  screenshot." Its step 2 asks for "a short design critique of what is there —
  against the in-scope catalog controls *and* Kind Utility" and its step 3 makes
  "what underperforms" the scope of the change. There is no structured layout
  analysis and no requirement to *suggest* improvements beyond findings.
- `harness/.claude/skills/design/verify.md` — created by plan 049; its capture
  note reads: "Capture mechanism: **use Claude-in-Chrome by default, or the
  user's installed browser agent of choice**. If the agent-browser daemon
  misbehaves (it has intermittently returned 'os error 35'), a local Playwright
  script is the proven fallback."
- `harness/.claude/skills/design/SKILL.md` — Phase 2 carries composition
  guidance ("Compose, don't fill": one focal point, CMP-5, SLP-11, SLP-6,
  graded at verify against LAY-3/5/6); Phase 3 requires a plan; the layout
  headnote says "Layout controls (partial coverage)... Grid systems remain HIG +
  judgment until a declared product grid lands."
- `harness/.claude/agents/evaluator.md` — post-046 it carries the review
  procedure. Its "Design quality" criterion asks "hierarchy, spacing rhythm,
  alignment; does the page read in the order the task needs?" but the output
  format has no home for *improvement suggestions* that are not violations —
  only BLOCKING / ADVISORY / QUALITY GRADES / JUDGMENT CONTROL NOTES /
  VERIFICATION LEDGER / UNCOVERED.
- In-catalog layout material the read must anchor to (do not restate — cite):
  LAY-2 (reflow at 320, L1), LAY-3 (page-template fit, L2), LAY-4 (measure
  ≤ 80ch, L2), LAY-5 (density fits the task, L2), LAY-6 (edge/optical
  alignment, L2), SLP-4 (no nested cards), SLP-5 (no identical-card grids),
  SLP-6 (type-scale contrast), SLP-7 (spacing rhythm), SLP-10 (complex task =
  page not modal), SLP-11 (cards only for interactive units), CMP-5 (one
  primary action). Deferred territory: grid (LAY-1, spike
  `harness/docs/spikes/layout-category/SPEC.md`, pending a declared product
  grid — plan 053 proposes it).
- The `agent-browser` CLI is a skill available in the team's Claude Code
  environments ("Browser automation CLI for AI agents ... taking screenshots").
  The harness must not hard-require it — consumer repos may lack it — so the
  capture convention is an ordered preference, not a dependency.
- Distilled sources for the patterns file (Step 2): the composition prose
  already in SKILL.md Phase 2; HIG principles already cited by the skill
  (Simplicity, Familiarity, Craft); the LAY spike's deconfliction notes;
  impeccable.style's published concepts — restraint as the core of taste
  ("strips the AI slop tells and bad defaults"), brand-vs-product registers
  (marketing surfaces and data-dense workspaces follow different density
  rules), and deterministic anti-pattern detection. Teacher & School products
  are the "product register" — dense, calm, task-first.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Validate (sync checks) | `python3 harness/checks/validate.py` | exit 0 |
| Skill size guard | `wc -l harness/.claude/skills/design/SKILL.md` | ≤ 385 (049 landed at 371 + this plan's ~12 lines) |
| Capture smoke (optional, if agent-browser installed) | `agent-browser open http://localhost:3000 && agent-browser screenshot /tmp/lay-smoke.png` (exact subcommands per `agent-browser --help`) | a PNG exists |

## Scope

**In scope**:
- `harness/.claude/skills/design/critique.md` (extend)
- `harness/.claude/skills/design/verify.md` (capture-order edit only)
- `harness/.claude/skills/design/layout-patterns.md` (create)
- `harness/.claude/skills/design/SKILL.md` (~10 lines: pointer to the layout
  read in the critique section + one line in Phase 2)
- `harness/.claude/agents/evaluator.md` (add the SUGGESTIONS output section)

**Out of scope** (do NOT touch):
- `harness/standards/catalog.yaml` and `standards/controls/` — no control is
  added or changed here; new-control proposals are plan 053 (ratchet-gated).
- Skill frontmatter `description:` fields (routing; would force a sweep).
- The tfx-sync:L0 block, `implement-craft.md`, and the other three skills.
- Any product-repo file.

## Git workflow

- Branch: `advisor/052-layout-taste-pass`
- Commit style: `feat(harness): layout read + ranked suggestions in critique; agent-browser first capture`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Make agent-browser the first capture mechanism

In BOTH `critique.md` and `verify.md`, replace the capture-mechanism sentences
with one shared convention (same wording in both files):

> Capture mechanism, in order of preference: (1) the `agent-browser` CLI if
> installed (`agent-browser --help` to confirm) — navigate to the route, set
> the viewport to the target width, screenshot; (2) Claude-in-Chrome or the
> user's installed browser agent; (3) the local Playwright fallback; (4) ask
> the user to provide the screenshot. Never critique a page you cannot see,
> and never fabricate what it looks like.

Keep verify.md's existing "os error 35" note as a parenthetical on option (1).
Do not change anything else in verify.md.

**Verify**: `grep -c "agent-browser" harness/.claude/skills/design/critique.md harness/.claude/skills/design/verify.md` → ≥ 1 in each; `grep -n "Claude-in-Chrome by default" harness/.claude/skills/design/critique.md harness/.claude/skills/design/verify.md` → no output.

### Step 2: Create `layout-patterns.md` — the distilled positive patterns

Create `harness/.claude/skills/design/layout-patterns.md` (~60–90 lines). It is
GUIDANCE (a judgment aid like `implement-craft.md`), not controls — open it with
exactly that framing and the line "where a pattern here conflicts with a catalog
control, the control wins." Content, distilled and specific to Teacher & School
products (dense professional tools, the product register — not marketing pages):

1. **One focal point.** The eye lands on the teacher's primary task first;
   everything else steps down. If two regions compete, demote one (ties to
   CMP-5, SLP-6).
2. **Structure from the task, not a template.** Choose the page template by
   what the moment needs (LAY-3); within it, order regions by the task's
   sequence — a marks-entry page reads entry-first, not summary-first.
3. **Group by proximity and shared edges, not boxes.** Related items sit
   closer than unrelated ones (SLP-7); shared left edges do the aligning
   (LAY-6); reach for a card only when the unit is interactive (SLP-11).
4. **Density by register.** Data-entry and comparison surfaces run dense
   (short row heights, tabular figures, minimal padding); reading and
   decision surfaces run calmer (LAY-5). Never one density everywhere.
5. **Measure and rag.** Body text ≤ 80ch, target ~66 (LAY-4); avoid centred
   running text; numbers right-aligned in tables (TYP-5).
6. **Whitespace is hierarchy.** Increase space *between* sections before
   adding dividers; a divider is the fallback, a box the last resort (SLP-4).
7. **Alignment discipline.** Every region's edges land on a small set of
   shared vertical lines; count the distinct left edges at 1280 — more than
   ~4 usually means the composition is drifting (LAY-6; grid remains
   HIG + judgment until LAY-1 lands — see the spike).
8. **Restraint is the taste.** When in doubt remove: decoration that doesn't
   encode hierarchy or state is a cost. (The impeccable principle; also
   SLP-1..11's positive restatement.)

Each pattern: 2–4 lines, naming its control anchors as above. Close with a
"reading a screenshot" mini-procedure: squint test (what reads first?), edge
count, density map (which regions are dense/calm and does that match the
task?), grouping check (do gaps encode relationships?).

**Verify**: `wc -l harness/.claude/skills/design/layout-patterns.md` → 55–100; `grep -c "LAY-\|SLP-\|CMP-5\|TYP-5" harness/.claude/skills/design/layout-patterns.md` → ≥ 10 (patterns are anchored, not vibes).

### Step 3: Add the layout read + suggestions to `critique.md`

Extend the critique procedure with a new step between the current "capture" and
"write the critique" steps:

> **Layout read (do this before judging).** Read `layout-patterns.md` (beside
> this file). From the 1280 frame (and 360 when responsive behaviour is in
> scope), write down — in this order, before any judgment: (a) the page's
> regions and what each is for; (b) where the eye lands first, second, third
> (squint test) and whether that matches the task's priority; (c) the distinct
> left/top alignment edges; (d) a density map — which regions are dense, which
> calm, and whether that fits the task; (e) how grouping is encoded (space /
> divider / box). THEN judge: violations go to the critique's "what
> underperforms" list as before; everything else that would make the layout
> better becomes a **suggestion**.

And extend the critique's output contract: after "what works" and "what
underperforms", add a third section —

> **Layout suggestions (ranked).** Up to 5, ordered by impact on the teacher's
> task. Each names: the concrete change ("merge the two summary cards into one
> calm header row"), the pattern or control it serves (layout-patterns.md #4,
> LAY-5), and the cost (S/M). Suggestions are OFFERS for the Phase 1 contract
> and Phase 3 plan — the user picks; unpicked suggestions are recorded in the
> decision record as "considered", not silently dropped. A suggestion never
> bypasses the plan gate.

Add one pointer line to SKILL.md's critique section ("the critique includes a
structured layout read and ranked suggestions — critique.md carries the
procedure") and one line to Phase 2 ("when diverging on an existing surface,
the critique's layout suggestions seed the options").

**Verify**: `grep -c "Layout read\|Layout suggestions" harness/.claude/skills/design/critique.md` → ≥ 2; `grep -c "layout-patterns.md" harness/.claude/skills/design/critique.md harness/.claude/skills/design/SKILL.md` → ≥ 1 each; `wc -l harness/.claude/skills/design/SKILL.md` → ≤ 385.

### Step 4: Give suggestions a home in the evaluator's verdict

In `harness/.claude/agents/evaluator.md`, in the output format, add ONE section
between ADVISORY and QUALITY GRADES:

```
SUGGESTIONS (not violations — layout/pattern improvements the builder may take):
- concrete change — pattern/control it serves — impact on the task (one line each, max 5)
```

And one calibration line beside it: "A suggestion is never a finding: do not
put a passing surface's improvement ideas in BLOCKING/ADVISORY, and do not
withhold a suggestion because everything passed." Do NOT touch the
BLOCKING/ADVISORY mechanical rule, the LEDGER format (audit-record.py validates
it), or the JUDGMENT CONTROL NOTES.

**Verify**: `grep -c "SUGGESTIONS" harness/.claude/agents/evaluator.md` → ≥ 1; `python3 harness/checks/audit-record.py --self-test` → `SELF-TEST OK (21 cases)` (ledger untouched).

### Step 5: Full verification

1. `python3 harness/checks/validate.py` → exit 0.
2. Line counts per the guards above.
3. Read critique.md end-to-end: capture → layout read → critique (works /
   underperforms / suggestions) → scope feeds Phase 1. The order must be
   unambiguous.
4. Optional live smoke: if `agent-browser` is installed and the site runs
   (`pnpm dev`), capture `http://localhost:3000` at 1280 and run the layout
   read yourself against the landing page; attach the output to your report.
   Skip cleanly if unavailable.

## Test plan

No automated tests cover skill prose. Behavioural check for the operator (record
as pending if no live session): run one modification task on an existing page
("improve the layout of the attendance page") and confirm (a) capture attempts
agent-browser first, (b) the critique contains the five-part layout read, (c)
suggestions arrive ranked and gated through the plan, and (d) the evaluator
verdict carries a SUGGESTIONS section. Consider adding this as a golden eval
case in a follow-up (see Maintenance).

## Done criteria

- [ ] `layout-patterns.md` exists, 55–100 lines, ≥ 10 control anchors
- [ ] critique.md has the layout read + ranked-suggestions output; capture order starts with agent-browser in both critique.md and verify.md
- [ ] evaluator.md has the SUGGESTIONS section; ledger format untouched (`audit-record.py --self-test` green)
- [ ] SKILL.md grew by ≤ 12 lines; frontmatter description byte-identical
- [ ] `python3 harness/checks/validate.py` exit 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 049 has not landed (critique.md/verify.md absent) — do not re-inline
  into SKILL.md.
- You are tempted to add or reword a catalog control — that is plan 053's
  ratchet, gated on the design lead.
- The evaluator output change collides with `checks/audit-record.py`'s
  assertions (run its self-test; if adding SUGGESTIONS breaks record parsing,
  report — the record template may need a coordinated change).
- Any verify shows SKILL.md growing past 385 lines — the addition belongs in
  the side-files, trim the pointers.

## Maintenance notes

- The suggestions channel is deliberately capped (5, ranked) — reviewers should
  push back on suggestion sprawl; the harness's voice is restraint.
- When plan 053's ratchet lands (grid/focal-point controls), layout-patterns.md
  items 1 and 7 should be re-anchored to the new control ids — the file says
  "control wins" so it must track the catalog.
- Follow-up candidates (not in this plan): a golden eval asserting the layout
  read happens on modification runs; extending `docs/decisions/TEMPLATE.md`
  with a "suggestions considered" row if records prove inconsistent about
  recording unpicked suggestions.
