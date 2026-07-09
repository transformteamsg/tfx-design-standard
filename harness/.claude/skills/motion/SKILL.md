---
name: motion
description: Smooth the motion on an existing Teacher & School product page — transitions, easing, timing, and reduced-motion. Use for a scoped ask that names this dimension — "smooth the animations", "the motion feels janky", "the transitions are too slow", "fix the animation on <page>" — with no structural change named. NOT for a whole-page review with no dimension named (that is critique); NOT for a named change like adding a new transition or interaction (that is design). Styling goes to polish, layout to layout.
---

# Smooth the motion on an existing surface

A focused pass on the **motion** dimension: how the interface moves — entrances, state
and view changes, hover/press feedback. You judge motion only; styling, layout, copy,
and flow structure are out of scope and get NOTED and routed.

**Dimension controls** (cite these; the catalog holds the rules — load them from
`../../../standards/catalog.yaml`; these three carry their statement in the catalog, with
no separate detail file):

- **MOT-1** — 100–300ms, standard easing, no decorative motion on critical paths.
- **A11Y-5** — a `prefers-reduced-motion` variant disables non-essential animation.
- **SLP-8** — no bounce or elastic easing on interface elements.

**Reference:** the motion bullets of `../design/implement-craft.md` — property-scoped
interruptible transitions (`transition-property`, never `transition: all`), direction of
easing (entrances `ease-out`, exits `ease-in`, changes `ease-in-out`), press feedback
(`scale(0.96)`, never a bounce), and disciplined `will-change`. Keyboard navigation is
instant — no animation on tab/arrow movement.

**Procedure:** follow `../critique/pass.md` with the subset above.
