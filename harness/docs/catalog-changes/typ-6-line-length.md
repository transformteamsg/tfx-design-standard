# Proposed control: TYP-6 (comfortable measure / line length — the TYP family's sixth slot)

**Date:** 2026-07-09 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Status:** PROPOSAL, pending design-lead approval (Reza Ilmi).

Committed to the catalog as a proposal at **TYP-6**, **L2**, **hybrid**,
`phase: [implement, verify]`, `applies_to: [page, component]`, `waiver: rationale`, with
the `fails_when` bullets below carried into the catalog entry and `controls/typ-6.md`. The
`# TYP-6 ratchet PROPOSAL 2026-07-09` comment header sits above the entry until approval;
do not mark it settled.

This record lives in `docs/catalog-changes/` per the plan-053 placement rule. Plan:
`.context/plans/controls-for-the-check-readability-step-sentence-c.md`.

## Why this is a control candidate

Section 7 ("Check readability") of `content/guidelines/ui-text.mdx` includes a **keep line
length comfortable (40–60 characters/line)** bullet. Nothing in the catalog owned it. The
TYP family covers typeface (TYP-1), size floors and line-height (TYP-2), the type scale
(TYP-3), all-caps (TYP-4), and tabular figures (TYP-5) — but not *measure*, the number of
characters per line of running prose. Full-viewport paragraphs on a wide monitor are a real
readability failure with no home in the catalog; TYP-6 fills that gap.

Placed in TYP (typography), not CNT (content): measure is a property of how text is laid
out on the page, enforced by a `max-width` in the markup, not a property of the words.
That is why it is `applies_to: [page, component]` rather than `[content]`.

## The proposed control

- **id:** `TYP-6`.
- **title:** "Running body text is held to a comfortable measure — roughly 45–75 characters
  per line (target 40–60), via a max-width in ch, not full-viewport paragraphs".
- **tier:** L2 (a strong default with reasonable layout exceptions — a two-column reading
  layout, a deliberately narrow aside — so a deviation takes a recorded reason).
- **check:** hybrid. Deterministic half: a `checks/type-scan` measure subcheck (planned)
  that flags prose containers with no `max-width` cap in a wide parent. Judgment half:
  which blocks are genuinely running prose versus headings, tables, and data grids.
- **phase:** `[implement, verify]`.
- **applies_to:** `[page, component]`.
- **waiver:** `rationale`.
- **fails_when:**
  - a paragraph that spans the full viewport width with no measure cap;
  - body copy running well past ~75ch per line.

## Scope note — running prose only

Headings, table cells, data grids, code blocks, and short labels are **out of scope**; they
have their own layout logic and are not held to a measure. The Tailwind idiom is
`max-w-prose` (≈65ch) or an explicit `max-w-[65ch]` on the prose container.

## Non-duplication statement

- **vs. TYP-2** (size floors, line-height): TYP-2 governs vertical rhythm (font size,
  leading); TYP-6 governs horizontal measure (line length). Different axes, no overlap.
- **vs. LAY-1 / LAY-7** (grid, focal point): those govern page structure and emphasis, not
  the character-per-line measure of a prose block. No overlap.
- **vs. CNT-9** (clarity mechanics): CNT-9 grades the words and sentences; TYP-6 grades the
  width of the column they sit in. A perfectly clear paragraph can still fail TYP-6 by
  running edge to edge.

## Boundary with the sibling proposal

Landed alongside **CNT-12** (sentence case), also from §7, in the same ratchet round — see
`docs/catalog-changes/cnt-12-sentence-case.md`. TYP-6 owns measure (typography/layout);
CNT-12 owns capitalisation (content). No overlap.

---

**Status:** PROPOSAL committed to `standards/catalog.yaml` pending design-lead approval.
Catalog 64 → 66 controls (with CNT-12). `python3 checks/validate.py` passes at 66.
