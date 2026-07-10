# Proposed control: CNT-13 (spelling & proofreading — the CNT family's thirteenth slot)

**Date:** 2026-07-10 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Status:** PROPOSAL, pending design-lead approval (Reza Ilmi).

Committed to the catalog as a proposal at **CNT-13**, **L2**, **hybrid**,
`phase: [implement, verify]`, `applies_to: [content]`, `waiver: rationale`,
`enforced: partial`, `script: checks/content-lint.py`, with the `fails_when` bullets below
carried into the catalog entry and `controls/cnt-13.md`. The `# CNT-13 ratchet PROPOSAL
2026-07-10` comment header sits above the entry until approval; do not mark it settled.

This record lives in `docs/catalog-changes/` per the plan-053 placement rule.

## Why this is a control candidate

Section 10 ("Check for grammar and spelling") of `content/guidelines/ui-text.mdx` is the
**only** step in the writing guide with no owning control — every other section links to at
least one CNT/TYP/A11Y control. Its rule text ("proofread the final text… Use Singapore
English spelling (British base): organise, colour, centre") was therefore unenforceable.

Auditing §10 against the catalog, the **grammar** half is already owned:

- *Short sentences, active voice, second person* — CNT-3.
- *Nominalisations / "to be" constructions* — CNT-8.
- *One idea per sentence, tense, double negatives, noun stacks, plain words, acronyms* —
  CNT-9.
- *Sentence case* — CNT-12.

What was left **unowned** is **spelling and proofreading**: misspellings, US-vs-British
spelling, and proofreading artifacts (doubled words, leftover placeholders). The
Singapore-English rule is restated in `harness/CLAUDE.md` and the copy skill but had no
control and no tooling behind it. CNT-13 closes that gap and makes §10 enforceable — the
same ratchet move that produced CNT-12 (§7 sentence case) and CNT-9's acronym clause.

## The proposed control

- **id:** `CNT-13`.
- **title:** "Copy is free of spelling and proofreading errors and uses Singapore English
  spelling (British base)".
- **tier:** L2 (a strong default with narrow, legitimate exceptions — a branded or ministry
  term with a fixed spelling — so a deviation takes a recorded reason, not a block).
- **check:** hybrid. Deterministic half: a curated US→British spelling map plus a
  common-misspelling map in `checks/content-lint.py`, read at runtime from the
  `<!-- tfx-sync:cnt13-usuk -->` / `<!-- tfx-sync:cnt13-typos -->` spans of `cnt-13.md`
  (the same pattern as CNT-5/6 and SLP-9). A word-boundaried hit flags the token and
  suggests the correct spelling. Scoped to multi-word user-facing copy, so a one-word code
  identifier is not flagged. Judgment half: contextual typos, homophones (their/there,
  form/from), doubled words, and wrong-word slips that are themselves valid words.
- **phase:** `[implement, verify]`.
- **applies_to:** `[content]`.
- **waiver:** `rationale`.
- **enforced:** `partial` · **script:** `checks/content-lint.py` (built, not planned —
  ships with the deterministic half live; the self-test covers it).
- **fails_when:**
  - a misspelling or typo in user-facing copy ("recieve", "seperate", "teh");
  - US spelling where British is house style ("color", "organize", "center");
  - a doubled word or copy-paste artifact left in shipped text ("the the", "TODO").

## Non-duplication statement

- **vs. CNT-9** (clarity mechanics): CNT-9 grades sentence structure and word *choice*;
  CNT-13 grades *orthography* — whether each word is spelled correctly and in the house
  dialect. A correctly-structured sentence with a US spelling passes CNT-9 and fails CNT-13.
- **vs. CNT-12** (sentence case): capitalisation, not spelling. No overlap.
- **vs. CNT-3 / CNT-8** (voice, length, nominalisations): grammar and phrasing, not
  spelling. No overlap.
- **vs. SLP-9 / CNT-6** (buzzword / filler-word lists): different token sets entirely. The
  CNT-13 spelling and typo lists share no token with those lists, so one word never fires
  two controls (the CNT-6 ↔ SLP-9 boundary rule).

## Considered and rejected

- **A real dictionary spell-checker** (`codespell`, `cspell`, or a full-dictionary checker)
  — rejected. The `checks/` scripts are deliberately pure-stdlib (Vercel's build does not
  even provision PyYAML), and the stack is "fixed and boring on purpose". `codespell` would
  add a dependency and a maintained allow-list; a full-dictionary checker floods false
  positives on product names and domain jargon. The curated word-list half matches every
  other content control and carries zero dependency; arbitrary typos stay the evaluator's.
- **Extending CNT-9** (clarity) to cover spelling — rejected. Spelling is a distinct failure
  mode from clarity; folding it into CNT-9 would blur that control's scope and its
  clause-numbered evaluator guidance. A dedicated id keeps the boundary clean.

## Ambiguous entries deliberately left off the lint map

Two classes are omitted from the US→British map to keep the lint low-false-positive; both
stay the evaluator's call:

- **Valid British words with a split meaning:** `license`, `program`, `meter`, `practise` —
  each is a legitimate British spelling with a different sense or a verb/noun split (a
  parking "meter", a software "program", to "license").
- **Established technical / product terms in this repo:** `catalog` (the literal
  `catalog.yaml` and `/standards/catalog/` routes this whole system is built on) and
  `dialog` (the UI component / `<dialog>` element). Flagging these would fire on the
  domain's own vocabulary, not on a copy defect — the same reason branded terms (e.g.
  "Radix Colors") are an evaluator exemption, not a lint hit.

---

**Status:** PROPOSAL committed to `standards/catalog.yaml` pending design-lead approval.
Catalog 66 → 67 controls. `python3 checks/validate.py` passes at 67; `content-lint.py
--self-test` passes with the CNT-13 cases.
