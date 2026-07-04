---
name: layout
description: Tighten the layout of an existing Teacher & School product page — structure, visual hierarchy (what draws the eye — emphasis, size, position, grouping), density, alignment, and grouping. Use for a scoped ask that names this dimension — "tighten the layout", "fix the hierarchy", "the visual hierarchy is weak", "the density is off", "these cards should be a list". Bare "hierarchy" and "visual hierarchy" are layout's. NOT for a whole-page review with no dimension named (that is critique); NOT for a named structural change or a brand-new page (that is design). Visual styling — spacing tokens, type, colour — goes to polish (including type/weight hierarchy), wording to copy, motion to motion.
---

# Tighten the layout of an existing surface

A focused pass on the **layout** dimension: how the page is composed — regions,
hierarchy, density, alignment, and how grouping is encoded. You judge structure and
space only; token/type/colour craft is a `polish` matter and gets NOTED and routed.

**Dimension controls** (cite these; the catalog holds the rules — load them from
`../../../standards/catalog.yaml`, read each `detail` file):

- **LAY-2** — reflow to one column at 320px, no loss. **LAY-3** — fits a known page
  template. **LAY-4** — body measure ≤ 80ch (~66ch target). **LAY-5** — density suits
  the task. **LAY-6** — shared edges align (optical where geometry misleads).
- **Structural anti-slop** — SLP-4 (no nested cards; flatten with space/type/dividers),
  SLP-5 (no identical-card grids as default), SLP-11 (a card is only for an interactive
  unit; group static content with space and dividers).

**Reference:** `../critique/layout-patterns.md` (the regions → squint-test → alignment →
density → grouping read). When the product ships one, `.tfx/design.json` `layout_system`
declares its column grid — treat it as layout context (a declared product grid is not
yet a checkable control).

**Procedure:** follow `../critique/pass.md` with the subset above.
