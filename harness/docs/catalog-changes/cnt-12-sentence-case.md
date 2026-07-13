# Proposed control: CNT-12 (sentence case — the CNT family's twelfth slot)

**Date:** 2026-07-09 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Status:** PROPOSAL, pending design-lead approval (Reza Ilmi).

Committed to the catalog as a proposal at **CNT-12**, **L2**, **hybrid**,
`phase: [implement, verify]`, `applies_to: [content]`, `waiver: rationale`,
`enforced: partial`, `script: checks/content-lint.py`, with the `fails_when` bullets below
carried into the catalog entry and `controls/cnt-12.md`. The `# CNT-12 ratchet PROPOSAL
2026-07-09` comment header sits above the entry until approval; do not mark it settled.

This record lives in `docs/catalog-changes/` per the plan-053 placement rule. Plan:
`.context/plans/controls-for-the-check-readability-step-sentence-c.md`.

## Why this is a control candidate

Section 7 ("Check readability") of `content/guidelines/ui-text.mdx` was rewritten from the
writing guide's readability step into four bullets: use sentence case; write short
sentences (CNT-3) / one idea each (CNT-9); keep line length comfortable (→ TYP-6); use
plain language. Two of the four already mapped to controls (CNT-3, CNT-9). Sentence case
did not.

Sentence case is stated as a rule in `grammar-mechanics.mdx` ("Sentence case everywhere —
headings, buttons, labels") but no control enforced it. TYP-4 bans only *all-caps* text —
Title Case ("Submit Your Marks") passes TYP-4 (it uses no uppercase transform) yet still
breaks sentence case. That leaves the most common capitalisation failure in UI copy —
Title Case on headings, labels, and buttons — unowned. CNT-12 closes that gap and makes the
`grammar-mechanics.mdx` sentence-case rule enforceable.

## The proposed control

- **id:** `CNT-12`.
- **title:** "Copy uses sentence case — capitalise the first word and proper or branded
  nouns only".
- **tier:** L2 (a strong default with narrow, well-defined exceptions — proper nouns,
  branded names, genuine acronyms — so a deviation takes a recorded reason, not a block).
- **check:** hybrid. Deterministic half: a Title-Case heading/label/button heuristic in
  `checks/content-lint.py` (planned). Judgment half: the proper-noun and branded-term
  exemptions. Ships judgment-first; the script half follows.
- **phase:** `[implement, verify]`.
- **applies_to:** `[content]`.
- **waiver:** `rationale`.
- **enforced:** `partial` · **script:** `checks/content-lint.py`.
- **fails_when:**
  - Title Case in a heading, label, or button ("Submit Your Marks", "View Class
    Details");
  - a non-proper mid-sentence word capitalised for emphasis.

## Non-duplication statement

- **vs. TYP-4** (all-caps): different failure class. TYP-4 catches `SUBMIT` (an uppercase
  transform or a shouted string); CNT-12 catches `Submit Your Marks` (Title Case), which
  passes TYP-4. The two are neighbouring capitalisation rules, not overlapping ones.
- **vs. CNT-9** (clarity mechanics): CNT-9 grades sentence structure and word choice, not
  capitalisation. No overlap.
- **vs. CNT-2** (naming): CNT-2 grades whether a name is plain language; CNT-12 grades the
  case of the words, whatever they are. A plain name in Title Case passes CNT-2 and fails
  CNT-12.

## Considered and rejected — plain language

The fourth §7 bullet, **use plain language**, was evaluated as a candidate control in the
same pass and **rejected**. Its substance is already owned: CNT-2 (names use plain
language) plus CNT-9 (short and simple words, clause 5). Only the narrow "unexplained
acronyms / technical terms in body copy" slice is unowned, and minting a new id for it
would reintroduce exactly the ambiguous-findings / waiver overlap that the CNT-6 ↔ SLP-9
and CNT-2 ↔ CNT-10 ↔ CNT-11 boundary notes exist to prevent. If that slice later needs
teeth, extend CNT-2 (names → body jargon) or CNT-9 (clarity → unexplained acronyms) rather
than add a control.

## Boundary with the sibling proposal

Landed alongside **TYP-6** (comfortable line length), the fourth §7 bullet, in the same
ratchet round — see `docs/catalog-changes/typ-6-line-length.md`. CNT-12 owns
capitalisation (content); TYP-6 owns measure (typography/layout). No overlap.

---

**Status:** PROPOSAL committed to `standards/catalog.yaml` pending design-lead approval.
Catalog 64 → 66 controls (with TYP-6). `python3 checks/validate.py` passes at 66.
