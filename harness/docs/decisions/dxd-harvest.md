# Decision: cancel the DXD division standard, harvest into TFX

- Date: 2026-07-16
- Decided by: Wondo Jeong (design lead)
- Status: settled

## The decision

The division-level DXD Design Standard (PRs #25, #30–#34) is cancelled. It grew
too big and blurred what each product needs. This repo stays the TFX (Teacher &
School) design standard. CaseSync and Glow are Teacher-domain products inside
TFX. Other user-group domains — Students, Parents, Platform — will fork this
repo as separate repos and diverge freely (near-term: EduPass, Students,
Parents). `tfx-waive` stays the canonical waiver syntax.

Branch `tfx/harvest-from-dxd` (cut from `main` @ bdbcc3e) carries everything
worth keeping, re-expressed in TFX terms. The DXD branches stay as archive;
their PRs are closed, not merged.

## Harvest rule applied

Keep a change only if it strengthens the TFX harness itself. Drop anything
whose purpose is division-level generalization.

## Harvested (re-expressed on this branch)

Checker and validator hardening
- detect.py: vendor-dir pruning + extension filtering in target expansion
- detect.py: ignore rules can no longer silence L0 controls (catalog-synced
  `L0_CONTROL_IDS`, registered in validate.py L0 parity)
- content-lint.py: list/blockquote markers stripped before anchored CNT checks
- design-hook: fires on .ts/.js edits like the checkers it fronts
- evals/score.py: parse-then-validate command runner (path containment,
  no shell) replacing the lexical prefix whitelist

Catalog governance
- `status: proposed` pipeline end to end: schema → validate.py →
  check-standards.mjs build guard → catalog stamp (CNT-5/6/7) → public
  projection + tests → Proposed badge on catalog pages
- Glow pilot catalog maintenance: COL-1 hybrid + Glow primary #F76B15 +
  foreground pairing; TYP-1 per-product wordmark registry (Glow → Inria Sans);
  TOK-3 named-utility caveat
- Motion foundation: motion tokens in globals.css + lib/motion.ts mirror with
  SSR-safe `useReducedMotionSafe`; MOT-2 + MOT-3 as `status: proposed`
  (catalog 68 → 70); /foundations/motion page

CI and rendered contracts
- CI Python gate: validate.py self-test + validate + token-audit + a11y-static
- Playwright rendered contract (tests/site-contract.spec.ts): single main
  landmark, 320/360px no-overflow, 44px mobile / 24px desktop target matrix,
  reduced-motion hydration checks — now a CI step
- /llms-full.txt machine reader (README promised it; the route didn't exist)
  + catalog-meta reader so llms.txt derives version/waiver syntax from source

Site fixes (the site must pass its own standard)
- A11Y-1 (L0): --muted-foreground darkened to #67676f (≥ 4.5:1 on --muted)
- TYP-3: last off-scale type snapped on-scale (page-actions 13px → 12px)
- TYP-4: uppercase/tracking-widest removed from all site chrome
- A11Y-4/LAY-2: topbar and catalog-browser 44px mobile hit boxes; topbar fits
  320px; SidebarInset renders main (kills double landmark); .prose code and
  tables wrap/scroll at 320px; hydration-stable landing motion
- MDX fallback logged at build time; dead ToC dropped from fallback path
- .gitignore .claude/ anchored to repo root

Teaching surfaces (kept because they teach the TFX standard itself)
- OrbitLoop: the design loop drawn as a ring that pauses at the two human
  gates — landing hero + /harness/loop restructure (+ CNT-3 splits)
- SlopCompare on /standards: draggable before/after anti-slop demo; the
  "before" panel is a quarantined anti-specimen on dedicated --demo-slop-*
  tokens with six tfx-waive'd violations (decision record:
  slop-compare-demo.md)
- Catalog browsability: search, "/" shortcut, facet counts, category grouping
- Copy: stale skill names fixed (tfx:copy, tfx:start), for-agents "Wire it
  into CI" section, tools/harness micro-fixes, design skill asks the ask's
  dimension first

## Dropped (division-level; archived on the DXD branches)

- TFX→DXD identity: plugin id `dxd`, `dxd-waive` syntax, `.dxd/design.json`,
  site/metadata renames, MIGRATION-DXD.md
- Domain-profile machinery: domains registry + four profile YAMLs, `domains:`
  schema field, profile_context.py resolver, scanner de-parameterisation
  (type-scan/token-audit losing the hardcoded TFX scale — hardcoding the TFX
  stack is the point of staying TFX-only), stack-agnostic control rewrites
- Domains IA: "Domains" nav section and pages, division narrative
  (landing/overview rewrites, 7-rung ladder Domains rung, llms.txt DXD
  identity), FoundationProfile diagram (depicts the cancelled 4-domain model)
- Onboarding-for-domains: setup wizard + interview, get-started page and its
  diagram set, adoption-journey/ratchet/flow rebuilds (consumer pages dropped —
  re-introduce if a TFX page wants them), de-branded skills
- Governance for domains: domain governance model, CONTRIBUTING routing,
  EduPass pilot playbook (moves to the EduPass fork when it exists)
- "Teachers & School lens" translation notes and the "Design for One Person"
  rename (was pending approval; TFX keeps "Design for One Teacher")
- DXD plans ledger + brainstorm docs; sprint count arithmetic (60→62→70) —
  this branch's true arithmetic is 68 → 70

Already on main, no harvest needed: content controls CNT-8..14, TYP-6,
voice-tone proposed page (PR #29).

## Still proposed, pending design-lead approval

CNT-5, CNT-6, CNT-7, MOT-2, MOT-3 — stamped `status: proposed`; the catalog
test pins exactly this set. Approving any of them means removing the stamp and
re-pinning the test together.
