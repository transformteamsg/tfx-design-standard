# Component Manifest — Recommended Resolutions to the Six Open Questions

**Status:** drafted for design-lead sign-off — these are recommendations, not decisions
**Date:** 2026-06-11
**Refers to:** `SPEC.md` §6 (open questions); friction report follow-up edit 8
(CMP-1 soft-pass form)

Each answer below favours the smallest schema that keeps CMP-1 honest. The
recurring tradeoff is maintenance burden vs. mechanical checkability; the spike's
own staleness policy ("a stale manifest fails open") sets the tone — the manifest
is a quality signal, not a gate, so v1 should not grow fields a hand-maintainer
will let rot.

## 1. Variants and sizes — keep them out of the schema for v1

`props_summary` is enough. A `variants` array is the single biggest maintenance
multiplier on the table (every DS variant change touches the manifest), and the
agent already opens source for prop detail. Where a variant is load-bearing for a
control (e.g. `destructive` on Button for CMP-2 surfaces), name it informally in
`props_summary`: "Primary action button; variants incl. destructive for
consequence-bearing actions." Revisit when `source: "generated"` exists — an
extractor makes variants free to emit, and free data can earn its place then.

## 2. Per-product manifests, no overlay for v1

Four flat manifests, each complete in itself. The shared Base UI wrapper layer is
~30 entries; duplicating it four times is an afternoon of copy-and-prune, while an
overlay model adds a merge step that no tool implements yet and that every
consumer (Phase 2 filter, CMP-1 diff, evaluator) would have to get right
identically. Put a `_note` in each product manifest naming the base layer it was
copied from, so drift is traceable. The overlay question reopens at extractor
time (V1), when a generator can emit all four from one source and duplication
stops costing humans anything.

## 3. Yes — add an optional `approver` field on `restricted` entries

Cheap, and it closes a real loop: the evaluator can mechanically check that a
`tfx-waive CMP-1` annotation names the right approver, mirroring the catalog's
L1 named-approver discipline. Optional, string, only meaningful when
`status: "restricted"`; when absent, the default approver is the design lead.
One row in the schema table, no burden on `stable` entries (the vast majority).

## 4. `.tfx/` is the right home

Keep `<product-repo>/.tfx/component-manifest.json`. The manifest is *product*
config consumed by harness tooling — it must outlive any particular agent
runtime, which rules out `.claude/` (plugin-scoped, wrong owner). A flat
`tfx.config.json` invites unrelated config to accrete into one file.
`docs/design/` misfiles machine-consumed config as documentation. `.tfx/` not
yet being a convention is not an argument against starting one — `.storybook/`
was new once — and it gives V1/V2 artifacts (extractor config, MCP cache) an
obvious home. Hard-code the path in v1; make it configurable only when someone
actually needs it.

## 5. The manifest is canonical; Storybook is an input, not a peer

Option (b) now, with (a) as the extractor story: the manifest is the canonical
source the harness reads, full stop. If a product adopts Storybook, its
`stories.json` becomes a candidate *input* to the V1 extractor (which emits the
manifest, `source: "generated"`), never a second source of truth the harness
consults directly. Manual syncing (c) is the worst of both — two files, no
machine link, guaranteed drift.

## 6. No minimum entry count — but add a `coverage` declaration

A 5-entry manifest genuinely helps Phase 2 and the `replaces` judgment, so don't
gate "active" on size. But the deterministic diff has a sharper problem than
size: it flags every import *outside* the manifest, so an honest-but-partial
manifest would drown the verdict in false positives. Recommend one schema
addendum — optional top-level `coverage: "complete" | "partial"` (default
`"partial"`):

- `"partial"` — Phase 2 filtering and evaluator `replaces`/`status` judgments
  use the entries that exist; the mechanical import diff stays **off**, and the
  evaluator's verdict line reads "verified against partial manifest
  (generated: <date>) — diff not run".
- `"complete"` — the maintainer asserts the wrapper layer is fully listed; the
  import diff activates and unknown imports are findings.

This keeps adoption incremental (start with the five most-misused components,
declare partial, grow) without ever letting a partial file masquerade as a
mechanical check.

## Friction follow-up 8 — give the no-manifest soft-pass a traceable form

Ratchet proposal (catalog edit — needs design-lead approval per
`CONTRIBUTING.md`; deliberately **not** applied in this doc's PR): amend CMP-1's
entry so the v0 no-manifest verdict has a fixed, greppable form instead of
free prose. Proposed verdict vocabulary, one of exactly three lines:

- `CMP-1: verified against .tfx/component-manifest.json (generated: <date>, coverage: <complete|partial>)`
- `CMP-1: asserted, no manifest — manifest absent for <product>` (the v0
  soft-pass, audit-grep-able, automatically retired per product once a manifest
  lands)
- `CMP-1: waived — tfx-waive CMP-1 reason="..."` (existing waiver path)

`checks/audit-record.py` can then assert that any record claiming CMP-1 in scope
carries exactly one of these forms — turning today's open verdict into a
mechanically auditable one without pretending it verifies more than it does.

## Suggested sequencing on sign-off

1. Approve/amend the six answers above; fold accepted ones into `SPEC.md` §2/§6.
2. Land the CMP-1 verdict-vocabulary ratchet PR (catalog + cmp-1.md + an
   audit-record assertion).
3. Hand-write the first real manifest for one product (Teacher Workspace,
   `coverage: "partial"`, the most-misused components first) and run one loop
   against it — that pilot, not this doc, is the test of the schema.
