# Plan 008: Spike — define the minimal component-manifest format that unblocks CMP-1

> **Executor instructions**: This is a DESIGN SPIKE, not a build-everything
> plan. The deliverable is a specification document + one example manifest +
> a list of open questions for the design lead. Honor STOP conditions; update
> your row in `plans/README.md` when done.
>
> **Drift check (run first)**: confirm `.claude/skills/design-ui/SKILL.md`
> still says no component manifest is wired (the "v0 reality" section) and
> that CMP-1 in `standards/catalog.yaml` still reads "Component usage diffed
> against the product manifest". Mismatch → STOP (someone may have built this).

## Status

- **Priority**: P3
- **Effort**: M (spike: ~a day)
- **Risk**: MED — a format that doesn't survive contact with TW's real component
  reality creates rework; that's why this is a spike with open questions, not a standard
- **Depends on**: none (informs V2; useful before plan 004's friction report is acted on)
- **Category**: direction
- **Planned at**: `no-git (pre-init)`, 2026-06-10

## Why this matters

Three load-bearing instructions in the harness reference a "product component
manifest" that nothing defines: Phase 2 ("options may only compose components
that exist… Use the product's component manifest"), Phase 4 ("compose only
manifest components (CMP-1)"), and CMP-1's own verify field ("Component usage
diffed against the product manifest"). The roadmap defers a manifest to "V2 —
component manifest via MCP", but the *format* doesn't need MCP — a plain
committed JSON file unblocks CMP-1 verification and Phase 2 filtering now, and
whatever MCP serves later should serve THIS format. The spike defines it.

## Current state

- `.claude/skills/design-ui/SKILL.md` — "v0 reality" section: "no product
  component manifest is wired in"; Phase 2 and Phase 4 text as quoted above.
- `standards/catalog.yaml` — CMP-1: L1, hybrid, `verify: "Component usage
  diffed against the product manifest; evaluator judges 'exists for the need'
  edge cases"`.
- `standards/controls/cmp-1.md` — exists only if plan 003 landed; if so, its
  "How to verify" section must stay consistent with what you specify.
- `README.md` roadmap: "V2 — later: component manifest via MCP…".
- Stack facts the format must fit: Base UI (headless components wrapped per
  product), Radix Colors, shadcn-style conventions; products are React-family
  web apps (TW flagship). No product repo is reachable from here — the example
  manifest uses plausible TW components and is clearly labeled as illustrative.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| JSON validity of the example | `python3 -m json.tool docs/spikes/component-manifest/example-manifest.json` | exit 0 |
| Validator/plugin still pass | `python3 checks/validate.py` (if built); `claude plugin validate .` | OK / passed |

## Scope

**In scope**:
- `docs/spikes/component-manifest/SPEC.md` (create — the deliverable)
- `docs/spikes/component-manifest/example-manifest.json` (create)
- Nothing else. (Skill/catalog updates happen AFTER the design lead accepts the
  spec — explicitly out of scope here.)

**Out of scope**:
- Implementing a generator, MCP server, or any tooling.
- Editing `design-ui`, CMP-1, or the README roadmap.
- Storybook integration (note it as an open question instead).

## Git workflow

Branch `advisor/008-manifest-spike`; one commit; do NOT push.

## Steps

### Step 1: Write `SPEC.md`

Required sections:

1. **Problem** — the three dangling references (quote them, file-exact).
2. **Proposed format** — JSON, one file per product at an agreed path
   (propose `<product-repo>/.tfx/component-manifest.json`). Schema per entry:
   `name` (the importable component name), `import` (module path),
   `kind` (`base-ui-wrapper | composite | layout | pattern`),
   `status` (`stable | deprecated | restricted`), `props_summary` (one line,
   not a full API dump — the agent reads source for details), `replaces`
   (optional — what NOT to hand-roll because this exists, e.g.
   `"replaces": ["custom modals", "confirm dialogs"]` on `Dialog`), `docs`
   (optional Storybook/url). Top-level: `product`, `generated` (ISO date),
   `source` (`hand-maintained | generated`), `components[]`.
   Justify each field against a consumer: Phase 2 filtering needs
   `name/kind/status`; CMP-1 diffing needs `name/replaces`; the evaluator
   needs `status` (deprecated/restricted usage is a finding).
3. **How each consumer uses it** — concrete: Phase 2 (compose only
   `status: stable` entries), Phase 4 / future `checks/component-audit`
   (imports diffed against `name`+`import`), evaluator (CMP-1 "exists for the
   need" judged against `replaces`).
4. **Maintenance model** — hand-maintained first (a 30-component product is an
   afternoon); `generated` reserved for a later extractor; staleness is
   detectable (`generated` date + CI reminder), and a stale manifest fails
   open (agent says "manifest may be stale" rather than blocking).
5. **Migration to V2/MCP** — the MCP tool serves this same schema per entry;
   the file is the offline/source-of-truth representation.
6. **Open questions for the design lead** — at minimum: variants/sizes in the
   manifest or in source? per-product or shared-base+overlay manifests? does
   `restricted` need an approver field? is `.tfx/` the right home? how does
   Storybook's component manifest (if adopted later) reconcile?

### Step 2: Write the illustrative example

`example-manifest.json`: `product: "teacher-workspace"`, 10–15 plausible
entries (Button, Dialog, Toast, EmptyState, PageHeader, DataTable, FormField,
DatePicker, Tabs, Banner…), at least one `deprecated` and one `restricted`,
at least three with `replaces`. Header comment is impossible in JSON — put the
"illustrative, not TW's real inventory" disclaimer in `SPEC.md` §2 and in a
`"_note"` top-level string field.

**Verify**: `python3 -m json.tool docs/spikes/component-manifest/example-manifest.json` → exit 0.

### Step 3: Sanity-check the spec against the harness's own loop

Walk CMP-1's verify sentence and Phase 2's filtering instruction against the
schema and confirm every needed datum exists in the format. Record the walk in
SPEC.md as a short "Self-check" section — if a consumer needs a field the
schema lacks, fix the schema, don't note it as a gap.

**Verify**: SPEC.md contains a "Self-check" section covering Phase 2, CMP-1
diffing, and the evaluator; `grep -c "Self-check" docs/spikes/component-manifest/SPEC.md` → 1.

## Test plan

Spike test = the self-check walk (step 3) + JSON validity. Acceptance is the
design lead's review of the open questions — out of band.

## Done criteria

- [ ] `SPEC.md` with all six sections + Self-check
- [ ] `example-manifest.json` valid JSON, 10–15 entries, statuses and `replaces` exercised
- [ ] No files outside `docs/spikes/component-manifest/` modified
- [ ] `claude plugin validate .` passes
- [ ] `plans/README.md` updated

## STOP conditions

- A manifest format/implementation already exists anywhere in the repo (drift
  check) — reconcile instead of duplicating.
- The spike starts growing tooling (a generator, a checker) — that's a
  follow-up plan after the spec is accepted; STOP at the spec.

## Maintenance notes

- After design-lead acceptance: follow-up changes land in `design-ui`
  (Phase 2 manifest loading), `cmp-1.md` ("How to verify"), `ONBOARDING.md`
  item 2, and a future `checks/component-audit` — one plan, touching all four
  consistently.
- The README's V2 line should then change from "component manifest via MCP" to
  "manifest MCP serving the .tfx format".
