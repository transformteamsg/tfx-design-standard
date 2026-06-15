---
name: tfx-design-standards
description: How to read, filter, apply, and grow the design standards control catalog. Use when applying controls from standards/catalog.yaml, answering any waiver question about a specific control ("can I waive TOK-1?", who must approve, what the tier allows), deciding whether a control applies to a given case, writing a tfx-waive line, or proposing a new control after a failure. Do not answer waiver or applicability questions from memory or summaries — load this skill. Not needed for plain definition lookups (e.g. what a tier name means) that the always-on project rules already answer. This is the catalog-mechanics reference, not the design loop — to design or change a page use tfx-design-ui (which loads this skill itself).
---

# Working with the control catalog

The catalog (`standards/catalog.yaml`) is the normative layer of this harness — it
carries the standards tier of the TFX Design Standard (TFX-DS §3). Every entry is a
control: a single verifiable rule with an id, tier, and check type. The format spec is
`standards/README.md`.

**Locating the catalog:** it ships with the harness, not the product repo. Resolve
`standards/` relative to this SKILL.md, three levels up
(`<this-skill-dir>/../../../standards/`) — works both in the harness dev repo and when
installed as the `tfx-design-harness` plugin.

The litmus test: **if you can't check it, it's a principle or a guideline — not a
standard.** Principles (Kind Utility, the brand and product principles, Apple's HIG
design principles) settle trade-offs and are never used to "check" work; guidelines
are recommended practice where deviation needs a reason. Only standards live in the
catalog, because only standards can be enforced. This is why Apple's principles
appear in the skills as judgment lenses but never as catalog entries — "create
defining moments" cannot fail a check.

## Reading and filtering

- Load the index once per session. Read a control's `detail` file only when the
  control is in scope — details carry rationale, pass/fail examples, and evaluator
  guidance.
- Filter by `phase` (where you are in the loop) and `applies_to` (what you're
  producing). A content-only change pulls `applies_to: [content]` controls, not the
  whole catalog.
- A control without a `detail:` field is self-sufficient: its `title` and
  `verify` line are the whole rule — apply them as written. Only `judgment`
  and `hybrid` controls carry detail files (evaluator guidance lives there);
  if you find a judgment/hybrid control without one, treat that as a catalog
  defect and raise it, don't improvise a rubric.
- The catalog is **portfolio-wide** — one set of controls for Teacher Workspace,
  CaseSync, Glow, and TW surfaces. Products do not get their own control overlays;
  per-product difference is *nuance calibration* (accent, illustration, tone
  weighting — see TFX-DS §6 and the `tfx-content-style` skill), never separate rules or
  separate systems.

## Applying tiers

The tier → enforcement → waiver table is defined once in `standards/README.md`; that
is the source of truth. The agent-facing behavior:

- **L0** — never deviate, never waive, never rationalize. If satisfying an L0 control
  seems impossible, that is a blocking question for the user, not a judgment call.
- **L1** — must pass verification. You may *propose* a waiver in the plan phase; you
  may **not grant one** — it needs a named human approver, recorded in the decision
  record (`docs/decisions/<page>.md`) and the waiver registry. Recurring L1 waivers
  are a signal: fix the standard or fix the system.
- **L2** — you may deviate deliberately, but every deviation carries a specific
  reason. A waiver without a real reason is a violation, not a waiver — "looks better"
  is not a reason; a tested, documented, or evidence-grounded constraint is.

**Where the waiver lives.** Default to an inline comment at the deviation site, e.g.
`<!-- tfx-waive CNT-3 reason="ministry programme name must appear verbatim" -->` —
like an eslint-disable. When the deviation is in content that cannot host a comment
(JSON/YAML strings, i18n bundles, CMS copy), record the waiver in the decision record
keyed to the string id instead — the rule is that every waiver is traceable, not that
it is always an HTML comment.

## When a control seems wrong

Controls trace to the TFX Design Standard (with WCAG 2.2 AA as the self-imposed
accessibility floor; SGDS, GOV.UK, and Apple's HIG are reference points, not rules). If a control
seems wrong for the situation, the order of operations is: check the detail file's
"Do not flag" exceptions → propose a waiver at the right gate → surface the conflict
to the user. Never silently ignore a control, and never edit the catalog to make a
failing check pass.

## Growing the catalog (the ratchet)

The catalog only grows from evidence. Propose a new control when:

- The evaluator or the user caught a defect no existing control covers.
- A waiver pattern recurs — recurring waivers mean the control needs an exception
  clause, or the standard itself needs fixing.
- A standard updates (e.g. TFX-DS revision, WCAG version bump).

A proposal is a draft detail file in `standards/controls/` following the format spec,
with the triggering incident described under Rationale. A ratified addition must also
name the **re-audit set**: which already-shipped surfaces the new control affects —
they are silently non-compliant until run through the modification loop (see
`tfx-design-ui`, "Catalog update re-audit"). One control = one verifiable
statement; if you can't state how it's verified, it isn't a control yet. New controls
enter by lightweight PR with design-lead approval — same rule as L1 waivers: you
propose, the human decides. The bar for L0/L1 is high; the bar for L2 is evidence.
Citizen-service patterns (one-thing-per-page, government banners) enter only via
ratchet evidence — these products are professional daily-use workspaces, not
transactional citizen services.
