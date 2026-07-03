# Plan 056: Add scope dimensions to the control catalog — global default, per-product, per-audience (with student age bands)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told you
> they maintain the index.
>
> **Drift check (run first)**, from the repo root:
> `git diff --stat 48d13dd..HEAD -- harness/standards/schema.json harness/standards/catalog.yaml harness/standards/README.md harness/checks/validate.py scripts/check-standards.mjs harness/.claude/skills/standards/SKILL.md harness/.claude/skills/design/SKILL.md lib/catalog.ts lib/catalog.test.ts components/catalog-browser.tsx "app/standards/catalog/page.tsx" "app/standards/catalog/[id]/page.tsx"`
> If any listed file changed since `48d13dd`, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it
> as a STOP condition.

## Status

- **Priority**: P1 (operator-directed, 2026-07-03)
- **Effort**: M–L
- **Risk**: MED (touches the normative catalog file, both validators, and the website projection — all additive, but the blast radius is every catalog consumer)
- **Depends on**: none (055 landed)
- **Category**: direction
- **Planned at**: commit `48d13dd`, 2026-07-03

## Why this matters

The catalog today has one implicit scope: every control applies to every
product and every user. The portfolio is outgrowing that. Operator direction
(2026-07-03, confirmed interactively): restructure the catalog taxonomy into
**global standards** (all products), **per-product standards** (including
branding), and **per-audience standards** — teachers, students, parents —
with students split by age band: **primary** vs **secondary and up**. Teacher
surfaces are the only live ones today, but student- and parent-facing
surfaces are planned, so audience must be a *live* filter in the design loop
(intent phase asks who the surface serves; teachers is the default), not
dormant metadata.

The operator also confirmed the structural approach: **one `catalog.yaml`
with scope fields, not split files**. The single file is load-bearing — it is
served raw by the website, resolved by relative path inside the installed
plugin, and parsed by 12 consumers; the taxonomy becomes data on each
control, and grouped views are rendered by the website and applied by the
skills.

This plan adds the two scope dimensions end-to-end (schema → catalog meta →
validators → skills → website) and records the classification outcome for the
existing 48 controls. It authors **no new controls** — the per-product
branding set is plan 057, behind the ratchet's design-lead gate.

## The scope semantics (normative — every step below implements exactly this)

- Two new **optional** per-control fields:
  - `products:` — non-empty subset of `[tw, casesync, glow]`
  - `audiences:` — non-empty subset of `[teachers, students-primary, students-secondary, parents]`
- **Absent field = global** (applies to all products / all audiences). Never
  write an empty list — the validators must reject `products: []`.
- **Filtering is an intersection**: a control is in scope for a run when
  phase matches AND `applies_to` (the existing *surface* dimension —
  page/component/flow/content — unchanged and not to be confused with the new
  fields) matches AND (`products` absent OR contains the active product) AND
  (`audiences` absent OR contains the active audience).
- **Audience defaults to `teachers`** at the intent phase when unstated —
  today's live surfaces are teacher-facing. The design skill asks when the
  surface could plausibly serve students or parents.
- Age bands: `students-primary` = primary school; `students-secondary` =
  secondary school and up.
- **All 48 existing controls remain global — add NO scope fields to any of
  them.** Rationale (record it, do not re-litigate): stamping
  `audiences: [teachers]` onto the existing set would *exempt* future student
  and parent surfaces from the accessibility floor, anti-slop, tokens — the
  opposite of safe. The safety net travels to every audience by default;
  scoping is opt-in per control, used only when a control genuinely binds one
  product or audience.
- TW-adjacent surfaces (Posts, PG Staff Portal) count as `tw` — same rule the
  content skill's tone table already uses ("Posts / PG Staff Portal — pure
  TW, no nuance").

## Current state

Files and roles (repo-root relative). Excerpts verified at `48d13dd`.

- `harness/standards/catalog.yaml` (754 lines) — `meta:` block + flat
  `controls:` list of 48. Control fields today: `id, source, title, tier,
  check, phase, applies_to, verify, waiver, fails_when, refs, detail`. The
  meta block:

  ```yaml
  meta:
    version: "0.1"
    updated: "2026-06-25"
    waiver_syntax: 'tfx-waive <ID> reason="<specific reason>"'
    categories:
      A11Y: Accessibility
      ...
      LAY: Layout
  ```

- `harness/standards/schema.json` (9 lines) — shared by BOTH validators
  ("edit here, never in the validators"). Current content:

  ```json
  {
    "comment": "Catalog schema shared by harness/checks/validate.py and scripts/check-standards.mjs — edit here, never in the validators. Format prose: standards/README.md.",
    "required_fields": ["id", "source", "title", "tier", "check", "phase", "applies_to", "verify", "waiver"],
    "tier_waiver": { "L0": "none", "L1": "documented", "L2": "rationale" },
    "checks": ["deterministic", "judgment", "hybrid"],
    "phases": ["intent", "plan", "implement", "verify"],
    "applies_to": ["page", "component", "flow", "content"],
    "id_prefixes": ["A11Y", "TOK", "TYP", "COL", "CMP", "CNT", "MOT", "IDN", "SLP", "LAY"]
  }
  ```

- `harness/checks/validate.py` — loads schema.json into `schema_bits`
  (lines ~54–60: `required_fields`, `allowed_tiers`, `allowed_checks`,
  `allowed_phases`, `allowed_applies_to`, `allowed_waivers`) and validates
  each control against required fields + allowed values. Has a `--self-test`
  mode; the `[COUNT-SYNC]` cases at ~lines 739–752 are the pattern for adding
  self-test cases. Passing run prints `OK: 48 controls valid`.

- `scripts/check-standards.mjs` — website-side validator, reads the same
  schema.json (its header comment: "The schema lives in
  harness/standards/schema.json, shared with…"). Runs in prebuild.

- `harness/standards/README.md` (106 lines) — the format spec: schema example
  (`- id: TYP-2 …` with `applies_to: [page, component]  # page | component |
  flow | content`), Tiers table, Check types table, Authoring rules.

- `harness/.claude/skills/standards/SKILL.md` — "## Reading and filtering"
  section, current filter bullet (lines ~31–33):

  ```
  - Filter by `phase` (where you are in the loop) and `applies_to` (what you're
    producing). A content-only change pulls `applies_to: [content]` controls, not the
    whole catalog.
  ```

- `harness/.claude/skills/design/SKILL.md` — two relevant regions:
  - Lines ~28–35 ("Load first… Filter controls by `phase` as you go…").
  - Intent step 3 (lines ~133–141): "**Product and page type**: which product
    (TW / CaseSync / Glow / TW surface — this sets tone calibration per
    `content`), and what kind of surface… Page type selects controls via
    `applies_to`."

- `lib/catalog.ts` — deny-by-default projection:

  ```ts
  const PUBLIC_FIELDS = [
    "id", "source", "title", "tier", "check", "phase",
    "applies_to", "verify", "waiver", "fails_when",
  ] as const;
  /* meta keys the public routes expose — deny-by-default, like PUBLIC_FIELDS. */
  const PUBLIC_META = ["version", "updated", "waiver_syntax", "categories"] as const;
  ```

- `lib/catalog.test.ts` — characterization tests (plan 051) that **mirror
  those allowlists locally** (lines ~12–13: `PUBLIC_META_ALLOWLIST`,
  `PUBLIC_FIELDS_ALLOWLIST`) and assert deny-by-default projection. Any
  allowlist change must update the test mirrors in lockstep.

- `components/catalog-browser.tsx` — client filter component. Existing facet
  pattern: `useState` per facet (`tier`, `category`, `check`), values derived
  or passed in, `filtered = controls.filter(c => (!tier || c.tier === tier) && …)`,
  rendered as `<Chip active={…} onClick={…}>` rows, count line
  `{filtered.length} of {controls.length} controls`.

- `app/standards/catalog/page.tsx` — server page that feeds the browser.
  `app/standards/catalog/[id]/page.tsx` — per-control page (renders tier
  badge, `fails_when` bullets). `.md` twins and `/llms.txt` derive from the
  same `lib/catalog.ts` projection (`lib/markdown-twin.ts`, `lib/llms.ts`) —
  they pick up new fields automatically once projected.

- Governance: the catalog **ratchet** (docs/catalog-changes/ propose-only →
  design-lead approval) applies to control semantics. This plan changes NO
  control's semantics — it is schema/tooling plus meta, on the normal PR path
  with design-lead review (the batch-4 governance precedent), and the
  operator directed it explicitly. It still writes a structural record
  (step 10) so history explains the dimension change.

## Commands you will need

| Purpose | Command (from repo root unless noted) | Expected on success |
|---|---|---|
| Catalog validation + self-test | `cd harness && python3 checks/validate.py && python3 checks/validate.py --self-test` | `OK: 48 controls valid`; self-test all cases pass, exit 0 |
| Website-side catalog check | `node scripts/check-standards.mjs` | exit 0 |
| Unit tests | `pnpm vitest run` | all pass (17 existing + new) |
| Site build | `pnpm build` | exit 0 |
| Routing spot-check (per case, fresh session) | `claude -p "<prompt>" --max-turns 2 --output-format stream-json --verbose --plugin-dir harness` | expected skill fires (see step 11) |

## Scope

**In scope** (the only files you may modify):

- `harness/standards/schema.json`
- `harness/standards/catalog.yaml` (meta block + header comment ONLY — zero control entries)
- `harness/standards/README.md`
- `harness/checks/validate.py`
- `scripts/check-standards.mjs`
- `harness/.claude/skills/standards/SKILL.md` (body only — NOT the description)
- `harness/.claude/skills/design/SKILL.md` (body only — NOT the description)
- `lib/catalog.ts`, `lib/catalog.test.ts`
- `components/catalog-browser.tsx`, `app/standards/catalog/page.tsx`, `app/standards/catalog/[id]/page.tsx`
- `harness/docs/catalog-changes/2026-07-03-scope-dimensions.md` (create)
- `harness/plans/README.md` (status row)

**Out of scope** (do NOT touch):

- **Any control entry in catalog.yaml** — no scope fields on the existing 48,
  no reordering, no wording changes. `applies_to` keeps its name and meaning.
- **Skill `description:` frontmatter** (both skills) — a description change
  triggers the mandatory full routing sweep; this plan's edits are body-only.
  If you believe a description must change, STOP.
- No new controls, no new category prefix (BRD is deliberately NOT added —
  plan 057 extends the existing IDN category instead).
- `harness/CLAUDE.md`, `content/` (website prose), `harness/docs/ONBOARDING.md`,
  `lib/markdown-twin.ts`, `lib/llms.ts` (twins inherit the projection change
  automatically).
- `checks/reaudit-scope.py`, `type-scan.py`, `waiver-reconcile.py` — they
  read catalog.yaml but not the new fields; their self-tests in step 11
  prove non-breakage without edits.

## Git workflow

- Branch: `advisor/056-catalog-scope` off `main`.
- Commit per logical unit; e.g. `feat(standards): products/audiences scope dimensions — schema, validators, meta (plan 056)`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extend `schema.json`

Add two allowed-value keys (full new file — replaces the current 9 lines):

```json
{
  "comment": "Catalog schema shared by harness/checks/validate.py and scripts/check-standards.mjs — edit here, never in the validators. Format prose: standards/README.md.",
  "required_fields": ["id", "source", "title", "tier", "check", "phase", "applies_to", "verify", "waiver"],
  "tier_waiver": { "L0": "none", "L1": "documented", "L2": "rationale" },
  "checks": ["deterministic", "judgment", "hybrid"],
  "phases": ["intent", "plan", "implement", "verify"],
  "applies_to": ["page", "component", "flow", "content"],
  "products": ["tw", "casesync", "glow"],
  "audiences": ["teachers", "students-primary", "students-secondary", "parents"],
  "id_prefixes": ["A11Y", "TOK", "TYP", "COL", "CMP", "CNT", "MOT", "IDN", "SLP", "LAY"]
}
```

`products`/`audiences` stay OPTIONAL per control (not in `required_fields`).

**Verify**: `python3 -c "import json; s=json.load(open('harness/standards/schema.json')); print(s['products'], s['audiences'])"` → both lists print.

### Step 2: Extend the catalog `meta:` block (controls untouched)

In `harness/standards/catalog.yaml`:

1. Set `updated: "2026-07-03"`.
2. After the `categories:` map, add two display maps (mirroring its pattern):

   ```yaml
     products:
       tw: Teacher Workspace   # TW-adjacent surfaces (Posts, PG Staff Portal) count as tw
       casesync: CaseSync
       glow: Glow
     audiences:
       teachers: Teachers & school staff
       students-primary: Students — primary
       students-secondary: Students — secondary and up
       parents: Parents & guardians
   ```

3. In the header comment block, add one line after the Format line:
   `# Scope: optional per-control products:/audiences: fields — absent = global (all). See standards/README.md §Scope.`

**Verify**: `cd harness && python3 checks/validate.py` → `OK: 48 controls valid`, exit 0 (the meta addition must not break anything); `python3 -c "import yaml; m=yaml.safe_load(open('standards/catalog.yaml'))['meta']; print(sorted(m['products']), sorted(m['audiences']))"` → the keys print.

### Step 3: Teach `validate.py` the scope fields

1. Extend the schema loading (the block at ~lines 54–60) with
   `"allowed_products": set(schema["products"])` and
   `"allowed_audiences": set(schema["audiences"])`.
2. In the per-control validation, add for each of `products` / `audiences`:
   if the field is present it must be (a) a list, (b) non-empty — an empty
   list is an ERROR with the message telling the author to omit the field for
   global — and (c) a subset of the allowed values.
3. Add self-test cases modelled on the `[COUNT-SYNC]` cases (~739–752):
   scoped control with valid values → passes; unknown product value → ERROR;
   `products: []` → ERROR; `audiences` as a string not a list → ERROR.

**Verify**: `cd harness && python3 checks/validate.py --self-test` → all cases pass (count grows by 4), exit 0; `python3 checks/validate.py` → `OK: 48 controls valid`.

### Step 4: Mirror the validation in `scripts/check-standards.mjs`

Add the same three checks (list / non-empty / subset of schema `products`
and `audiences`) following the file's existing per-control validation style.

**Verify**: `node scripts/check-standards.mjs` → exit 0. Negative check: temporarily append `products: [nope]` to any control in a COPY of the catalog is not practical here — instead confirm the code path by grep: `grep -n "audiences" scripts/check-standards.mjs` → ≥ 2 hits.

### Step 5: Document the semantics in `standards/README.md`

1. In the Schema example, after the `applies_to:` line, add:

   ```yaml
     products: [glow]              # OPTIONAL — subset of tw | casesync | glow.
                                   # Absent = global (all products). Never [].
     audiences: [students-primary] # OPTIONAL — teachers | students-primary |
                                   # students-secondary | parents. Absent = global.
   ```

2. Add a `## Scope` section after the Schema section carrying the full
   semantics from "The scope semantics" block above — verbatim in meaning:
   absent = global; intersection filtering; audience defaults to teachers at
   intent; age-band definitions; the do-not-stamp rule and its rationale
   (scoping existing floor controls to teachers would exempt future student/
   parent surfaces); TW-adjacent surfaces count as `tw`.

**Verify**: `grep -c "Scope" harness/standards/README.md` → ≥ 2; `grep -c "students-primary" harness/standards/README.md` → ≥ 2.

### Step 6: Extend the `standards` skill's filter rule (body only)

Replace the "Filter by `phase` … whole catalog." bullet (quoted in Current
state) with one that names all four filter dimensions and the global default:

```
- Filter by `phase` (where you are in the loop), `applies_to` (what you're
  producing), and scope: `products` / `audiences` — a control without those
  fields is global and always in scope; a scoped control applies only when
  the run's product/audience is listed. Audience defaults to teachers when
  the intent phase didn't establish one. A content-only change pulls
  `applies_to: [content]` controls, not the whole catalog.
```

**Verify**: `grep -c "global and always in scope" harness/.claude/skills/standards/SKILL.md` → 1; `git diff harness/.claude/skills/standards/SKILL.md | grep "^[-+]description:"` → no output (description untouched).

### Step 7: Extend the `design` skill (body only)

1. In the "Load first" paragraph (~lines 28–35), extend "Filter controls by
   `phase` as you go" to "…by `phase` and scope (`products`/`audiences` —
   absent = global) as you go".
2. In intent step 3 ("Product and page type"), after the product sentence,
   add the audience ask:

   ```
   **Audience**: who does this surface serve — teachers (the default; assume
   it when unstated), students (ask which band: primary, or secondary and
   up), or parents? Record it in the sprint contract; it scopes
   `audiences:`-scoped controls for the rest of the loop.
   ```

**Verify**: `grep -c "students (ask which band" harness/.claude/skills/design/SKILL.md` → 1; `git diff harness/.claude/skills/design/SKILL.md | grep "^[-+]description:"` → no output.

### Step 8: Expose the fields in the website projection + tests

1. `lib/catalog.ts`: `PUBLIC_FIELDS` += `"products", "audiences"`;
   `PUBLIC_META` += `"products", "audiences"`.
2. `lib/catalog.test.ts`: update the two local mirror allowlists
   (`PUBLIC_FIELDS_ALLOWLIST`, `PUBLIC_META_ALLOWLIST`) identically, and add
   one test: a control WITHOUT scope fields projects without them (absent
   stays absent — no default injection).

**Verify**: `pnpm vitest run` → all pass including the new case.

### Step 9: Render scope on the website

1. `app/standards/catalog/page.tsx`: pass the meta `products` and
   `audiences` display maps into `CatalogBrowser` as props.
2. `components/catalog-browser.tsx`: add two facet chip rows following the
   existing tier/category/check pattern exactly (`useState`, `Chip`,
   filter predicate). Filter semantics per the normative block: a control
   with the field ABSENT matches every selection —
   `(!product || !c.products || c.products.includes(product))`, same for
   audience. On scoped controls only, render a small scope badge (e.g.
   `glow` / `students-primary`) next to the existing chips; global controls
   get no badge (global is the default, not a label).
3. `app/standards/catalog/[id]/page.tsx`: when `detail.products` or
   `detail.audiences` is present, render one "Scope:" line using the meta
   display names; absent → render nothing.

Match the surrounding component idiom and tokens (no raw hex — TOK-1 binds
this site; reuse existing chip/badge styles, e.g. the `tierStyles` pattern).
Today zero controls carry the fields, so the facets filter nothing away —
build the UI against a TEMPORARY local scoped control to see it work, then
revert the catalog before committing (`git diff harness/standards/catalog.yaml`
must be meta-only at commit time).

**Verify**: `pnpm build` → exit 0; `git diff harness/standards/catalog.yaml | grep "^+.*- id:"` → no output (no control added).

### Step 10: Write the structural record

Create `harness/docs/catalog-changes/2026-07-03-scope-dimensions.md` (follow
the format of the existing records in that directory — read one first):
what changed (two optional scope dimensions + meta maps), why
(operator-directed portfolio taxonomy: global / per-product / per-audience,
students split primary vs secondary+), the classification outcome (**all 48
existing controls remain global**, with the do-not-stamp rationale), and
that no control semantics changed (structural, normal PR path, not a
control ratchet). Note plan 057 as the first consumer of the fields.

**Verify**: file exists; `grep -c "all 48" harness/docs/catalog-changes/2026-07-03-scope-dimensions.md` → ≥ 1.

### Step 11: Final gates

1. `cd harness && python3 checks/validate.py && python3 checks/validate.py --self-test` → OK + all self-test cases.
2. `cd harness && python3 checks/reaudit-scope.py COL-1 >/dev/null && python3 checks/waiver-reconcile.py >/dev/null && python3 checks/type-scan.py --self-test >/dev/null` → exit 0 each (proves the other catalog readers didn't break; run each with its normal invocation — check `checks/README.md` if a flag differs).
3. `node scripts/check-standards.mjs` → exit 0.
4. `pnpm vitest run` → all pass. `pnpm build` → exit 0.
5. Routing spot-check, 5 cases (body-only skill edits per the prompts.yaml
   cost-cap rule — full sweep NOT required): "Design an attendance-taking
   page for Teacher Workspace" → design; "How do I add a remarks field to
   the attendance page?" → design; "Can I waive TOK-1 here?" → standards;
   "What does L1 mean?" → none; "Rewrite this error message: 'Submission
   failed (code 0x1F4)'" → content.
6. `git status --short` → only in-scope files. Update the 056 row in
   `harness/plans/README.md`.

## Test plan

- **validate.py self-test** grows by 4 scope cases (step 3) — the regression
  suite for catalog authoring mistakes.
- **lib/catalog.test.ts** grows by 1 projection case (step 8); the existing
  17 characterization tests must keep passing unmodified except the two
  mirror allowlists.
- **Deterministic gates**: both validators, vitest, build (step 11).
- **Routing**: 5-case spot-check (step 11.5) — descriptions unchanged, so no
  full sweep.

## Done criteria

ALL must hold:

- [ ] `python3 harness/checks/validate.py` → `OK: 48 controls valid` (still 48 — this plan adds none)
- [ ] `python3 harness/checks/validate.py --self-test` → exit 0, includes the 4 new scope cases
- [ ] `node scripts/check-standards.mjs` → exit 0
- [ ] `pnpm vitest run` → exit 0
- [ ] `pnpm build` → exit 0
- [ ] `git diff 48d13dd..HEAD -- harness/standards/catalog.yaml` shows ONLY meta-block + header-comment changes (no `- id:` lines added or modified)
- [ ] `grep -rn '"products"' harness/standards/schema.json lib/catalog.ts` → present in both
- [ ] Routing spot-check 5/5 recorded
- [ ] Structural record exists in `harness/docs/catalog-changes/`
- [ ] `git status --short` → only in-scope files; `plans/README.md` row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any Current-state excerpt has drifted since `48d13dd`.
- Implementing the skill edits seems to require changing a `description:`
  (that triggers the full 43-case routing sweep — a scope decision for the
  reviewer, not you).
- `validate.py`'s structure doesn't match the described shape (schema_bits /
  self-test pattern) closely enough to add the checks without refactoring.
- Any existing test in `lib/catalog.test.ts` needs its ASSERTION weakened
  (mirror-list updates are expected; assertion changes are not).
- You find yourself adding `products:` or `audiences:` to ANY control entry.
- The reaudit-scope / waiver-reconcile / type-scan invocations in step 11.2
  fail — that means a catalog reader made assumptions this plan missed.

## Maintenance notes

- **The do-not-stamp rule is the long-term risk**: a future author scoping a
  floor control (A11Y, SLP) to one audience quietly exempts everyone else.
  Reviewers of any PR that ADDS scope fields to an existing control should
  demand the same rigour as a tier change (ratchet record).
- The `audiences` allowed values will grow (e.g. finer student bands). That
  is a one-line schema.json change + meta map entry; the validators pick it
  up automatically.
- Plan 057 (branding controls) is the first real consumer of `products:`;
  the direction finding "per-product DESIGN.md" (plans/README.md batch 6)
  is the complement on the product-repo side — scope fields say *which*
  controls bind; DESIGN.md carries per-product *parameters*.
- The design loop's evaluator prompt is NOT changed by this plan — the
  evaluator receives in-scope controls from the loop, which now pre-filters
  by scope. If evaluator drift appears (grading out-of-scope controls), that
  is a follow-up, not a bug in this plan.
