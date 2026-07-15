# Design decision record — SlopCompare (the /standards "show, don't tell" demo)

> Site component (`components/compare.tsx`), rendered on `/standards`. Not a
> golden-eval loop run — this record exists to carry the anti-specimen's
> deliberate, waived violations so they reconcile against `waiver-reconcile.py`.

- **Date:** 2026-07-13
- **Product:** TFX Design Standard site (foundation)
- **Component:** `components/compare.tsx` — the before/after image-compare slider

## What it is

The BEFORE panel is a quarantined **anti-specimen**: it deliberately exhibits
default-AI slop — a purple/violet gradient, gradient text, nested cards, two
competing primaries, buzzword copy, and a flat type hierarchy — each violation
chipped with its control ID so a reader sees exactly what the standard rejects.
The AFTER panel renders the same task on-standard. The slop is the teaching
content; the deliberate violations live only in the before panel and are the
waivers recorded below.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| SLP-1 | L1 | Quarantined anti-specimen — the before panel deliberately shows a purple/violet gradient palette as the slop the standard rejects; confined to the demo, never in product UI | Wondo Jeong (design lead) | this record + inline `tfx-waive SLP-1` in compare.tsx |
| SLP-2 | L1 | Quarantined anti-specimen — deliberate gradient text in the before panel | Wondo Jeong (design lead) | this record + inline `tfx-waive SLP-2` in compare.tsx |
| SLP-4 | L1 | Quarantined anti-specimen — deliberate nested cards in the before panel | Wondo Jeong (design lead) | this record + inline `tfx-waive SLP-4` in compare.tsx |
| SLP-6 | L2 | Quarantined anti-specimen — deliberate flat type hierarchy in the before panel | Wondo Jeong (design lead) | this record + inline `tfx-waive SLP-6` in compare.tsx |
| SLP-9 | L2 | Quarantined anti-specimen — deliberate buzzword copy ("Revolutionise… seamless… at scale") in the before panel | Wondo Jeong (design lead) | this record + inline `tfx-waive SLP-9` in compare.tsx |
| CMP-5 | L2 | Quarantined anti-specimen — two competing filled primaries in the before panel | Wondo Jeong (design lead) | this record + inline `tfx-waive CMP-5` in compare.tsx |

## Notes

- The **after panel and the figure caption carry no waivers** — they are held to
  the full catalog like any on-standard surface, and were snapped onto the type
  scale in the 2026-07-13 conformance sweep.
- Every text/background pair in **both** panels passes WCAG AA against the
  `--demo-slop-*` tokens in `globals.css` (tightest ≈ 4.6:1) — L0 (A11Y-1) is
  never demonstrated broken.
- The before panel also shows un-chipped icon-tile and static-card patterns
  (SLP-5 / SLP-11); these are part of the same illustrative exhibit and are
  covered by the anti-specimen framing, not separate escaped defects.
