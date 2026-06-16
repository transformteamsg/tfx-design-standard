# Plan 019: Implement the component-manifest format — CMP-1 verdict vocabulary now (Stage A), manifest validator + loop wiring (Stage B, gated)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. **Stage B does not begin until its STOP gate
> clears.** When done, update the status row for this plan in `plans/README.md`
> — unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/docs/spikes/component-manifest/ harness/standards/controls/cmp-1.md harness/standards/catalog.yaml harness/checks/audit-record.py`.
> If any cited artifact changed since this plan was written, compare the "Current
> state" excerpts against the live files; on a mismatch, treat it as a STOP
> condition. `python3 checks/validate.py` and `python3 checks/audit-record.py
> --self-test` must pass before AND after your changes. Paths are relative to the
> harness root (`harness/` in the dev repo; the plugin root when installed).

## Status

- **Priority**: P3
- **Effort**: L (Stage A is S; Stage B is M–L and gated)
- **Risk**: MED — Stage A is safe and shippable; Stage B is gated on a design-lead
  sign-off of six open questions (recommended answers already exist), and its
  import-diff is the part most likely to produce false positives, so it ships
  behind a `coverage: "complete"` opt-in.
- **Depends on**: none (spike 008 is DONE — its outputs are the inputs here).
- **Category**: direction
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

CMP-1 ("use the stack component; don't hand-roll a one-off") is the **top agent
failure mode** on this portfolio and is currently unenforceable: a hand-rolled
combobox *and* a hand-rolled toggle recurred after the anti-pattern was "fixed"
once, because there is no manifest to diff against and no fixed verdict form to
audit. Spike 008 already produced a complete format spec and recommended answers
to its open questions. This plan turns that into enforcement in two stages:

- **Stage A (ungated, shippable now)** gives CMP-1 a fixed, greppable verdict
  vocabulary and an `audit-record` assertion — so a record claiming CMP-1 can no
  longer pass with vague prose. Cheap, and it closes the loop the spike flagged.
- **Stage B (gated)** adds the manifest **schema validator** and wires the loop
  (Phase 2/4 + evaluator) to consult `.tfx/component-manifest.json` — but only
  after the design lead signs off the six open questions, and with the
  import-diff gated behind a `coverage: "complete"` declaration so a partial
  manifest never masquerades as a mechanical check.

## Current state

All Stage-A inputs are DONE artifacts of plan 008:

- `docs/spikes/component-manifest/SPEC.md` — defines
  `<product-repo>/.tfx/component-manifest.json`: top-level keys
  `product / generated / source / components[] / _note`; per-entry
  `name / import / kind / status / props_summary / replaces? / docs?`; a
  JSON-Schema draft-07 subset (SPEC §2); the import-diff algorithm sketch (SPEC
  §3); maintenance/staleness model (SPEC §4, "a stale manifest fails open").
- `docs/spikes/component-manifest/RECOMMENDATIONS.md` — recommended answers to
  the six open questions: (1) no `variants` for v1; (2) per-product flat
  manifests, no overlay; (3) add an optional `approver` on `restricted` entries;
  (4) `.tfx/` is the home; (5) manifest canonical, Storybook an input;
  (6) no minimum size — add an optional top-level
  `coverage: "complete" | "partial"` (default `"partial"`): `partial` → the
  mechanical import-diff stays **off** and the evaluator verdict reads "verified
  against partial manifest (generated: <date>) — diff not run"; `complete` → the
  import-diff activates and unknown imports are findings.
- `docs/spikes/component-manifest/RECOMMENDATIONS.md` "Friction follow-up 8" —
  the **ungated** ratchet (Stage A): give CMP-1's verdict exactly one of three
  greppable forms (verbatim):
  - `CMP-1: verified against .tfx/component-manifest.json (generated: <date>, coverage: <complete|partial>)`
  - `CMP-1: asserted, no manifest — manifest absent for <product>`
  - `CMP-1: waived — tfx-waive CMP-1 reason="..."`
  and have `audit-record.py` assert that any record claiming CMP-1 in scope
  carries exactly one of these forms.
- `standards/controls/cmp-1.md:75-85` — the current "**v0 limit — manifest not
  yet wired**" clause and its three-surrogate fallback (reviewed the codebase /
  accepted the agent's assertion / general stack knowledge) that the verdict
  vocabulary replaces.
- `standards/catalog.yaml:315-327` — the CMP-1 entry: `tier: L1`,
  `check: hybrid`, `phase: [plan, implement, verify]`, `detail: controls/cmp-1.md`,
  verify `"Component usage diffed against the product manifest; evaluator judges
  'exists for the need' edge cases"`.
- `checks/audit-record.py:33-41` — `REQUIRED_SECTIONS` (includes "Controls in
  scope" and "Verify verdict"); `:114-216` `audit_record()`; `:144-156` the
  verbatim-verdict heuristic (`VERDICT:` line AND `QUALITY GRADES` block) — model
  the new CMP-1-form assertion on this. `find_section(sections, title)` (`:75-81`)
  already fetches a section body by substring; reuse it. Self-test at `:312-471`
  is currently **14 cases** and must stay green.
- `checks/validate.py` — the catalog/schema validator; a Stage-B manifest
  validator must follow its conventions (stdlib + `json`/`pyyaml`, ERROR-line
  output, exit 0 silent on pass / exit 1 on violation).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Catalog validator | `python3 checks/validate.py` | `OK: …` (before AND after) |
| Record audit self-test | `python3 checks/audit-record.py --self-test` | `SELF-TEST OK (N cases)`, N > 14 after Stage A |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` (from harness root) |
| Stage B: manifest validator | `python3 checks/component-manifest.py --self-test` | `SELF-TEST OK (N cases)` (Stage B only) |

## Scope

**In scope** (the only files you modify/create):

- Stage A: `standards/controls/cmp-1.md` (verdict vocabulary), `standards/catalog.yaml`
  (minimal CMP-1 `verify` reword), `checks/audit-record.py` (the assertion + self-test cases).
- Stage B (after the gate): `docs/spikes/component-manifest/SPEC.md` (fold in the
  accepted answers: `coverage`, optional `approver`), `checks/component-manifest.py`
  (create) + a fixture manifest, `.claude/skills/tfx-design-ui/SKILL.md` (Phase 2/4
  wiring), `standards/controls/cmp-1.md` (retire the three-surrogate fallback for
  adopted products).

**Out of scope** (do NOT touch):
- The extractor (`source: "generated"`) and the V2 MCP server — explicitly future
  work per SPEC §4–5.
- Writing an actual product manifest — that is the product team's pilot (per
  RECOMMENDATIONS "Suggested sequencing" step 3), not this plan.
- Any control other than CMP-1.

## Git workflow

- Branch: `advisor/019-component-manifest`. Conventional commits
  (`feat: CMP-1 verdict vocabulary + manifest enforcement`). Do NOT push.

## Steps

### Stage A — ungated, do this first

#### Step A1: Give CMP-1 a fixed verdict vocabulary

In `standards/controls/cmp-1.md`, replace the free-prose part of the "v0 limit"
clause (`:75-85`) with the three fixed verdict forms from RECOMMENDATIONS
"Friction follow-up 8" (verbatim, as a list the evaluator must choose exactly one
from). Keep the three-surrogate *evidence-source* note for now (it still explains
how "asserted, no manifest" is judged) — Stage B retires it. In
`standards/catalog.yaml`, reword the CMP-1 `verify` field minimally to reference
the verdict vocabulary in the detail file; change nothing else in the entry, and
keep `detail: controls/cmp-1.md`.

**Verify**: `grep -c "CMP-1: asserted, no manifest" standards/controls/cmp-1.md`
→ ≥ 1; `python3 checks/validate.py` → OK (frontmatter ↔ catalog still consistent).

#### Step A2: Assert the verdict form in `audit-record.py`

Add an assertion in `audit_record()` (model on the verbatim-verdict heuristic at
`:144-156`, using `find_section`): if the "Controls in scope" section names
`CMP-1`, then the "Verify verdict" section must contain **exactly one** of the
three CMP-1 forms. Zero forms → error ("record claims CMP-1 but carries no
CMP-1 verdict line — use one of the three fixed forms"); two or more → error
("record carries multiple CMP-1 verdict forms — exactly one"). Add ≥ 2 self-test
cases: a passing record with one form; a failing record that claims CMP-1 but has
no form (and/or has two). Keep all 14 existing cases green.

**Verify**: `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (N)`,
N ≥ 16.

### Stage B — GATED. Do not start until the gate clears.

> **STOP GATE (Stage B)**: Confirm the design lead has **accepted (or amended)**
> the six recommended answers in `docs/spikes/component-manifest/RECOMMENDATIONS.md`
> §1–6. If that sign-off is not recorded, STOP and report — do not implement the
> validator on assumed answers. The whole point of the spike was to get these
> decided first.
>
> **✅ GATE CLEARED (2026-06-16):** the harness lead (Reza Ilmi) approved the six
> recommended answers **as-is**, grounded in a standards review (WCAG, SGDS, and
> the Custom Elements Manifest community standard). Proceed with Stage B.

#### Step B1: Fold the accepted answers into the SPEC

In `docs/spikes/component-manifest/SPEC.md`, update §2 and §6 to reflect the
signed-off answers: add the optional top-level `coverage: "complete" | "partial"`
(default `"partial"`) and the optional `approver` field on `restricted` entries.
Update the JSON-Schema subset accordingly.

**Standards-review amendments (2026-06-16):** (a) in `SPEC.md`, add a short
"Prior art" note referencing the **Custom Elements Manifest** (the community
JSON-Schema standard for describing components, discoverable via a `customElements`
field in `package.json`) and **Storybook CSF/index** — state that the TFX manifest
stays **distinct** because it carries the enforcement fields CMP-1 needs
(`replaces`, `status`, `coverage`) that CEM lacks, and that TFX is React/Base UI
(not custom elements), with CEM noted as the eventual interop target if TFX ever
ships web components; (b) add a **discoverability pointer** — the manifest path is
referenced from the product repo's `package.json` via a `tfxComponentManifest`
field (mirroring CEM's `customElements` convention) so tooling can locate it
without hard-coding `.tfx/`.

**Verify**: `grep -c "coverage" docs/spikes/component-manifest/SPEC.md` → ≥ 1.

#### Step B2: Build `checks/component-manifest.py`

A validator that (a) validates a `.tfx/component-manifest.json` against the SPEC
schema (required keys, enum values for `kind`/`status`/`source`/`coverage`,
date format), and (b) **only when `coverage: "complete"`** runs the import-diff
(SPEC §3): flag any component import in the changed files that resolves outside
the manifest. When `coverage: "partial"` (or absent), the diff stays OFF and the
script reports "partial manifest — diff not run". Follow `validate.py`'s
conventions; embed a self-test with a fixture manifest (one valid `complete`, one
valid `partial`, one schema-invalid).

**Verify**: `python3 checks/component-manifest.py --self-test` → `SELF-TEST OK`;
a `complete` fixture with an unknown import → exit 1 with a CMP-1 finding; the
same with `partial` → exit 0 with the "diff not run" note.

#### Step B3: Wire the loop and retire the v0 fallback for adopted products

In `.claude/skills/tfx-design-ui/SKILL.md`, Phase 2 (Diverge) and Phase 4
(Implement) already reference "the product's component manifest" — point those at
`.tfx/component-manifest.json` and the `status: "stable"` filter (SPEC §3). In
`standards/controls/cmp-1.md`, state that for a product that has adopted a
manifest, the evaluator uses the "verified against …" verdict form and the
three-surrogate fallback is retired; absent a manifest, "asserted, no manifest"
remains the soft-pass.

**Verify**: `grep -c ".tfx/component-manifest.json" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1;
`python3 checks/validate.py` → OK.

## Test plan

- Stage A: the `audit-record.py` self-test is the test surface — new cases in
  Step A2; the 14 existing cases must remain green (no regression).
- Stage B: `checks/component-manifest.py --self-test` with fixture manifests
  (valid complete, valid partial, schema-invalid, complete-with-unknown-import).
  No product manifest is written here; the real pilot manifest (Teacher
  Workspace, `coverage: "partial"`) is the product team's follow-up.

## Done criteria

**Stage A (required):**
- [ ] `standards/controls/cmp-1.md` carries the three fixed CMP-1 verdict forms
- [ ] `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (N)`, N ≥ 16
- [ ] `python3 checks/validate.py` → OK; `claude plugin validate .` passes
- [ ] Only Stage-A in-scope files modified; `plans/README.md` row updated to note Stage A done / Stage B gated

**Stage B (only after the gate clears):**
- [ ] SPEC §2/§6 updated with `coverage` + `approver`
- [ ] `python3 checks/component-manifest.py --self-test` passes; fixtures behave as specified
- [ ] Phase 2/4 of the design-ui skill reference `.tfx/component-manifest.json`
- [ ] `python3 checks/validate.py` still OK

## STOP conditions

Stop and report (do not improvise) if:

- **Stage B gate not cleared** — the six recommended answers are not signed off.
- Any cited artifact (SPEC, RECOMMENDATIONS, cmp-1.md, the CMP-1 catalog entry,
  audit-record.py) differs from the "Current state" excerpts (drift).
- The `audit-record.py` self-test can't keep its 14 cases green alongside the new
  CMP-1 assertion — report rather than weakening an existing case.
- Stage B's import-diff produces false positives on re-exports/barrel files that
  you cannot resolve via the `import` path matching in SPEC §3 — report; do not
  ship a noisy CMP-1 check (the same trust lesson as token-audit / plan 007).

## Maintenance notes

- **Coordination**: this plan edits `checks/audit-record.py` (also plan **017**,
  which adds a `--repo-root` flag and a self-test case) — **sequence 017 before
  019** or rebase the audit-record self-test so both sets of cases coexist. It
  also edits `standards/catalog.yaml` (also plans 012/016 — CMP-1 entry is
  distinct from COL-1/TOK-3, so low collision) and `.claude/skills/tfx-design-ui/SKILL.md`
  (Stage B only; many plans touch this file — rebase).
- The extractor (`source: "generated"`) and MCP (V2) remain out of scope per
  SPEC §4–5; the file-first manifest is the source of truth they will later emit.
- A reviewer should scrutinise the import-diff's re-export handling and confirm
  the `partial` default genuinely keeps the diff off — a partial manifest that
  silently ran the diff would drown verdicts in false positives.
