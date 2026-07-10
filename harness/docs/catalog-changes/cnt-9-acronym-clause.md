# Extended control: CNT-9 gains clause 6 (acronyms / technical terms have a reachable definition)

**Date:** 2026-07-10 · **Change type:** scope extension via ratchet (a sixth clause added
to an existing control; **no tier change**, CNT-9 stays L2 · `waiver: rationale`) ·
**Status:** PROPOSAL, pending design-lead approval (Reza Ilmi).

Committed to the catalog as a proposal: CNT-9's `title`, `verify`, and `fails_when` gain the
clause-6 material, with a dated `# CNT-9 extended (clause 6) ratchet PROPOSAL 2026-07-10`
comment above the entry and the matching clause in `controls/cnt-9.md`. Do not mark it
settled. Catalog count is unchanged at **66** (an extension, not a new id).

This record lives in `docs/catalog-changes/` per the plan-053 placement rule. Plan:
`.context/plans/is-there-any-control-encapsulated-abelson.md`.

## Why this is a candidate

Section 7 ("Check readability") of `content/guidelines/ui-text.mdx` has a **Use plain
language** bullet: "Choose common words, explain any acronym or technical term on first use,
and prefer clear function over clever phrasing." Its three parts were audited against the
catalog:

- *Choose common words* — owned by CNT-9 clause 5 (short/simple words) + CNT-2 (plain
  names).
- *Prefer clear function over clever phrasing* — owned by SLP-9 (buzzwords) + CNT-9
  (clarity).
- *Explain any acronym or technical term* — **unowned for body copy.** CNT-2's evaluator
  guidance already flags "technical jargon or unexplained acronyms *in navigation or page
  titles*", but CNT-2 is scoped to **names** (L1, `phase: [intent, plan, verify]`). An
  acronym inside running body copy — help text, an error, a description — fell through.

The CNT-12 change record (`cnt-12-sentence-case.md`) already recorded this as the slice to
address by extending CNT-2 or CNT-9 rather than minting a new id. This closes it.

## The extension

- **Home:** CNT-9 (prose clarity — `applies_to: [content]`, L2, hybrid). Its terminal test
  is "can a teacher parse this in one read?"; an acronym a teacher cannot decode breaks
  exactly that, so the clause bundles cleanly with the existing five.
- **Clause 6 (as approved):** *Acronyms and technical terms have a reachable definition.*
  Any acronym or unfamiliar technical term must let a teacher find out what it means without
  leaving the task. It **need not be expanded on first use** — an inline expansion
  ("Special Educational Needs (SEN)"), a tooltip or info affordance, help text, or a
  glossary link all satisfy it. The test is that the explanation is *discoverable*, not
  where it sits. Established terms teachers genuinely use — "CCE", "FAS", "MOE" — need none.
- **Check type:** judgment (no deterministic half). CNT-9 stays `hybrid` on the strength of
  its existing word-list clause. Because the definition can live in a component affordance
  (tooltip/info icon), the evaluator judges clause 6 against the **rendered surface**, not
  the copy string alone. CNT-9 stays `applies_to: [content]` — the requirement is a property
  of the term; the affordance is only the delivery mechanism.
- **New `fails_when` bullet:** "an acronym or unfamiliar technical term with no reachable
  definition anywhere — no inline expansion, tooltip, help text, or glossary (established
  teacher terms excepted)."

## Non-duplication statement

- **vs. CNT-2** (naming): CNT-2 catches jargon/unexplained acronyms in *names* (nav items,
  page titles) at intent/plan time; clause 6 catches an acronym or technical term in *body
  prose* whose definition a teacher cannot reach. A surface can pass CNT-2 (every name is
  plain) and still fail clause 6 (a body-copy acronym with no tooltip/help/glossary behind
  it). Clean, complementary split — no overlap.
- **vs. CNT-9 clause 5** (short/simple words): clause 5 swaps a long word for a plain
  synonym that already exists; clause 6 covers terms that have *no* plain synonym (SEN, a
  domain acronym) and must instead be made decodable. Different remedies.

## Considered and rejected

- **A new control id** — rejected. The failure mode is a clarity failure with the same
  "parse in one read" test as CNT-9's other clauses; a standalone id would fragment the
  clarity bundle and add a waiver surface for no gain.
- **Extending CNT-2 to body copy** — rejected. CNT-2's L1 tier and intent/plan phase depend
  on its tight *names-only* scope; broadening it to running copy would blur the deliberate
  CNT-2 ↔ CNT-10 ↔ CNT-11 boundary the catalog protects.

---

**Status:** PROPOSAL committed to `standards/catalog.yaml` pending design-lead approval.
Catalog stays at 66 controls (extension, not a new id). `python3 checks/validate.py` passes.
