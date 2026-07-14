---
id: CMP-1
source: TFX-DS
title: Where the product's declared component foundation has a component for the need, it is used; one-offs require a waiver
tier: L1
check: hybrid
phase: [plan, implement, verify]
applies_to: [page, component]
verify: "Component usage diffed against the product manifest; evaluator judges 'exists for the need' edge cases; record carries one of the three fixed CMP-1 verdict forms (see controls/cmp-1.md)"
waiver: documented
enforced: partial
script: checks/component-manifest.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Compose UI from the active product's declared component foundation and manifest.
When no declared component covers a need, the first response is a documented waiver
or a design-system request — not a one-off custom implementation.

## Rationale

Hallucinated and duplicate components are a common agent failure mode. Every custom
element an agent invents is an untested surface that deviates from the declared
system, introduces its own accessibility characteristics, and corrodes product
consistency. Familiar patterns let people transfer learning between surfaces instead
of starting over.

## Passes when

- Each interactive or display need is served by a declared component, possibly
  composed with other declared components into a new layout.
- A one-off element carries a recorded `dxd-waive CMP-1` with a named approver and
  a stated reason.
- Composition — arranging existing components in a new layout — is present and
  unremarkable.

## Fails when

- A custom-built element replicates ≥ 90% of an existing declared component's
  function with no waiver.
- A component is copy-pasted and locally modified instead of using the declared
  component and overriding through supported props or tokens.
- A one-off exists and no `dxd-waive CMP-1` annotation can be found.

## How to verify

Deterministic half — `checks/component-manifest.py`: diff component usage in changed
files against the active product's declared component manifest; surface any element
that resolves outside it. Judgment half — the evaluator grades the "exists for the
need" edge cases below.

## Evaluator guidance

**Flag** (quoting the element and location):

- A custom-built element when a declared component covers ≥ 90% of the need. The
  residual gap belongs in a waiver or a design-system request, not a fork.
- Copy-pasted variants of an existing component, such as a button with an inlined
  hover colour or a dialog with a hand-rolled close gesture.
- Any one-off without a traceable `dxd-waive CMP-1` annotation carrying a named
  approver.

**Do not flag**:

- Composition: arranging existing components in a new layout is not a custom
  component. Wrapping a Button and Dialog into a composed row is fine.
- A one-off that carries `dxd-waive CMP-1` with a named approver — record the waiver
  is present; do not re-flag the approved deviation.

**CMP-1 verdict vocabulary.** Any record that lists CMP-1 in scope must carry
exactly one of these three fixed forms in its Verify verdict section:

- `CMP-1: verified against .tfx/component-manifest.json (generated: <date>, coverage: <complete|partial>)`
- `CMP-1: asserted, no manifest — manifest absent for <product>`
- `CMP-1: waived — dxd-waive CMP-1 reason="..."`

Zero forms or two or more forms are errors. `audit-record.py` checks this vocabulary;
a paraphrase fails.

**Products with a manifest.** Use the "verified against …" verdict form, including
its generated date and coverage. With `coverage: "complete"`, the import diff runs;
with `coverage: "partial"`, the diff stays off and the verdict records that limit.

**Absent a manifest.** Use the "asserted, no manifest" verdict and name the evidence
source: direct product-code review, an accepted agent assertion, or documented
knowledge of the product's declared component foundation. This soft pass remains
available for products that have not authored a manifest.

## Waiver

`documented` (L1) — one-offs that pass design-lead review enter the waiver registry
with a named approver. Inline:
`<!-- dxd-waive CMP-1 approver="..." reason="..." -->` (legacy markers remain valid).
