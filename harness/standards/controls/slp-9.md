---
id: SLP-9
source: TFX-DS
title: Copy carries no marketing buzzwords, em-dash chains, or redundant label/helper pairs
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [content]
verify: "Lint for the buzzword list and em-dash chains; evaluator judges redundant label/helper pairs and marketing tone"
waiver: rationale
fails_when:
  - streamline/empower/supercharge/world-class
  - label, sublabel, and helper saying the same thing
refs:
  - https://github.com/transformteamsg/tfx-design-standard
---

## Requirement

Write UI copy that says what the thing does, once. No marketing buzzwords, no
chains of em-dash clauses standing in for structure, no label/sublabel/helper
triplets that restate each other.

## Rationale

Buzzword copy is the written form of AI slop: it reads as generated, erodes
trust, and tells the teacher nothing. Kind Utility means the copy works —
"Save marks" beats "Effortlessly streamline your assessment workflow" every
time. Redundant helper text is not kindness; it is noise the teacher must scan
past between classes.

## Passes when / Fails when

**Passes:**

- Button: "Save marks". Helper (only if needed): "Marks are saved as a draft
  until you submit."
- A field label that names the field; helper text that adds something the label
  cannot ("DD/MM/YYYY").

**Fails:**

- "Empower your teaching with streamlined, world-class mark entry."
- "Supercharge productivity — effortlessly — seamlessly — at scale."
  (em-dash chain doing the work sentence structure should)
- Label "Class notes", sublabel "Notes for your class", helper "Add notes about
  your class here" — three lines, one meaning.

## How to verify

**Deterministic half (lint):** case-insensitive scan of user-facing strings for
the buzzword list — streamline(d), empower, supercharge, effortless(ly),
seamless(ly), world-class, revolutionise, leverage, unlock, elevate — and for
two or more em dashes inside one sentence. Each hit is a finding.

**Evaluator half:** for each labelled control, read label + sublabel + helper
as a set — if removing one loses no information, flag the redundancy. Judge
overall register: copy should describe function in a teacher's vocabulary, not
sell. Close calls (e.g. "unlock" used literally about a locked record) are
advisories, not blocks; this is L2 — deviation needs an inline rationale, not
a rewrite war.
