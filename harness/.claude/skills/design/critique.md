# Existing surfaces: critique before you polish (procedure)

Whenever the surface **already exists** (a modification, a restyle, an
"improve / polish this", or a catalog re-audit), do not propose changes before
you have seen and judged the current state. Before Phase 1's contract:

1. **Capture the current page.** Take a screenshot of the live surface at 1280
   (and 360 if the change is responsive). Capture mechanism: use Claude-in-Chrome
   by default, or the user's installed browser agent of choice; the local
   Playwright fallback from Phase 5 applies. **If capture keeps failing, ask the
   user to provide the screenshot** — never critique a page you cannot see, and
   never fabricate what it looks like.
2. **Write a short design critique of what is there** — against the in-scope
   catalog controls *and* Kind Utility: what works and should be preserved
   (call out established iconography, radius, layout, and copy that are
   deliberate — do not "fix" them, cf. the conservative-defaults rule in
   Phase 3/4) — **but verify, do not assume: every element you list as
   "preserve" stays in scope for its controls, so check it against the L0 floor
   (A11Y-1 contrast especially) before calling it good. Preserved is not waived:
   "preserve" means do not restyle a deliberate choice, it never means skip the
   check** — and what
   genuinely underperforms (control violations, hierarchy,
   friction in the teacher's task). Ground each point in the screenshot.
3. The critique's "what underperforms" list **is** the scope of the polish; it
   feeds the Phase 1 contract and the Phase 3 plan. Improvement is the goal —
   the critique keeps it targeted instead of a blanket restyle.
