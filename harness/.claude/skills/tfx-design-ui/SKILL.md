---
name: tfx-design-ui
description: Design or change a Teacher & School product UI — a new page, screen, form, flow, OR a modification to an existing one (adding a field, editing copy, restyling a component). Use whenever the user asks to design, create, build, add to, change, fix, or restyle any page, screen, form, component, or user flow — and whenever they ask to re-audit, re-check, or re-verify an existing page against the standards catalog (e.g. after the catalog gains new controls). Orchestrates the full loop — intent, diverge, plan (human gate), implement, verify — with the TFX-DS standards catalog enforced throughout. For copy-only edits the tfx-content-style skill is sufficient; for questions about the catalog itself use tfx-design-standards.
---

# Design UI

You are designing UI for the Teacher & School portfolio (Teacher Workspace, CaseSync,
Glow, and TW surfaces). The normative source is the TFX Design Standard; brand essence
is **Kind Utility** — useful first, kind at the surface. Standards compliance is not a
final check — it shapes every phase. Work through the phases in order; do not skip a
gate even if the request seems simple.

The harness's one promise: **intent without loss**. What the builder means is written
down as a contract in Phase 1; every later phase is graded against that contract;
drift from it is a defect.

**Non-negotiables (L0), binding even outside the loop:** AA contrast (A11Y-1); keyboard
reach with visible focus (A11Y-2); a visible label on every field (A11Y-3); destructive
actions show consequences and offer undo or confirm (CMP-2). These never bend — if one
seems impossible, that is a blocking question for the user, not a judgment call. (The
catalog carries the rest; these four are restated here because this SKILL.md travels in
the plugin while the harness's CLAUDE.md does not.)

**Load first:** the control catalog at `standards/catalog.yaml`. **Locating it:** the
catalog ships with this harness, not with the product repo — resolve it relative to
this SKILL.md file, three levels up: `<this-skill-dir>/../../../standards/catalog.yaml`
(the same path works in the harness dev repo and when installed as the
`tfx-design-harness` plugin; do not expect `standards/` in the project cwd). Filter
controls by `phase` as you go; read a control's `detail` file (same `standards/`
directory) before applying it. Also load the `tfx-design-standards` skill for the waiver
protocol.

**The stack** (deliberately boring, AI-legible): Base UI components, Radix Colors
scales, shadcn/ui default tokens for spacing/radius/type. Plus Jakarta Sans (600) for
display, Inter (400/500/600) for body/UI. Each product anchors primary actions and
brand moments in its **own** primary (Teacher Workspace → Teacher & School Blue
`#0064FF`; Glow → orange; CaseSync → indigo — see COL-1's detail file for the
table). Build from these by default.

**Judgment lens.** Where no control decides and Kind Utility alone is too coarse,
weigh trade-offs against Apple's HIG design principles (Purpose, Agency,
Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight —
developer.apple.com/design/human-interface-guidelines/design-principles). A
reference point like SGDS and GOV.UK, never a checkable standard: principles settle
trade-offs; they are not used to "check" work. The phase notes below name the ones
that recur in this portfolio.

## New page vs. modification

This loop covers both. Choose the entry depth by change size, never skip the gates:

- **New page or flow** — run all six phases.
- **Modification** (add a field, change a layout region, restyle a component) — run a
  scoped loop: a one-line intent, skip diverge if the structure is fixed, a short plan
  naming the controls the *changed surface* pulls in, then implement and verify the
  changed surface. A modification still binds its controls — adding a field still
  triggers A11Y-3, restyling still triggers TOK-1..3, touching an async action still
  triggers CMP-3. The common failure is treating "just add a field" as outside the
  harness; it is not.
- **Catalog update re-audit** — when controls are ADDED to the catalog, existing
  shipped surfaces are silently out of date until re-audited. Run each affected
  surface through the modification loop: the "change" is the catalog delta, the
  scoped plan is the audit findings against the new controls only.

### Existing surfaces: critique before you polish

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
   Phase 3/4), and what genuinely underperforms (control violations, hierarchy,
   friction in the teacher's task). Ground each point in the screenshot.
3. The critique's "what underperforms" list **is** the scope of the polish; it
   feeds the Phase 1 contract and the Phase 3 plan. Improvement is the goal —
   the critique keeps it targeted instead of a blanket restyle.

## A flow is not a stack of pages

The page is the unit of evidence, but the design is the journey. When the surface is
a flow — or a single page hosts a multi-step interaction — design the journey, not
just each screen:

- **Map it in Phase 1**: entry points (where does the teacher arrive from, and with
  what already known?), the done state, and every exit — back, cancel, abandon. A
  flow with only its happy path mapped is a demo, not a design.
- **Edge cases are structure, not polish.** Decide in Phase 3, not during build:
  interruption (timeout, network loss mid-flow), partial completion and resume, the
  teacher who left at step 2 and returns tomorrow, data that already exists
  elsewhere. For each, the plan says what happens to the teacher's work — "your
  draft is saved" must be a designed behaviour before it can be honest copy.
- **Interactions carry the flow.** Transitions preserve context — content and
  controls stay in predictable positions across steps (HIG: Flexibility); keyboard
  traversal works across the whole journey, not just within each screen (A11Y-2 at
  flow scope); focus lands somewhere sensible after every step change (A11Y-11
  applies at each transition, not only at async states).
- **Escapability is part of the structure** (HIG: Agency): the teacher can leave at
  any step without losing work, and the route out is visible, not discovered.

## v0 reality — what actually runs today

Most deterministic check scripts in `checks/` are **not built yet** (see
`checks/README.md`), and no product component manifest is wired in. The scripts that
ARE built:

- `checks/validate.py` — catalog schema validation.
- `checks/token-audit.py` — TOK-1..3, COL-1..2 (raw colour, off-scale spacing/radius).
- `checks/audit-record.py` — decision-record process compliance.
- `checks/a11y-static.py` — **static subset** of A11Y-2/3/8: focus-visible removal
  (FOCUS), click handlers on non-focusable elements (KBD), and icon-only buttons
  without an accessible name (NAME). Run it with
  `python3 checks/a11y-static.py <path>...`. This does NOT cover traversal order,
  computed hit-area, contrast, or ARIA state tracking — those still require a
  rendered DOM and run as the manual accessibility pass below.

Until the remaining scripts exist, the verify phase runs **manual** checks for
everything else, and you must say so. Never report a `checks/`-backed control as
"passed" when no script ran — report it as "verified manually" or "could not verify
mechanically", and list what a human should re-check. Overstating enforcement is the
failure this note exists to prevent.

## Phase 1 — Intent (sprint contract)

Establish, asking the user only what you cannot infer:

> For an **existing** surface, run "Existing surfaces: critique before you polish"
> (above) before writing the contract — the contract's done-criteria should target the
> critique's findings, not a blanket redesign. ("Critique the current state first".)

1. **Purpose**: what must the teacher accomplish on this page? One sentence. Apply
   the one test: *does this help teachers work faster with less stress?* If not,
   raise that before designing anything. Keep the scope focused (HIG: Purpose):
   prioritise the few things this moment actually needs and make those truly good —
   a page with a clear use beats one that does everything.
2. **The teacher and the moment**: anchor in a specific teacher's real workflow, not
   an abstract "user" — can you name the teacher and the moment this serves? ("Ms.
   Lim, P5 Math, entering marks the week before reports are due.") Design for the
   stressed week, not the average one.
3. **Product and page type**: which product (TW / CaseSync / Glow / TW surface — this
   sets tone calibration per `tfx-content-style`), and what kind of surface: workspace
   view, form, flow step, dashboard, settings, empty state, onboarding. Page type
   selects controls via `applies_to`. **Any surface with an async or destructive
   action inherits the `[flow]` controls** (CMP-2, CMP-3) even when it is a single
   page — do not let the page/flow split scope them out.
4. **Done-criteria**: write a short sprint contract — the 3–6 statements the evaluator
   will later grade against. Include the `intent`-phase controls (CNT-2 naming applies
   here: name the feature in plain language now, before a placeholder name spreads).
5. **Component inventory**: list the surface as a coverage checklist — the route,
   every component it renders (by import name), and every **interactive control**
   on it (buttons, inputs, dropdowns/combobox, toggles, tabs, links, menus). For
   each interactive control, name the states to exercise later: open, keyboard-tab
   (focus visible?), screen-read (role + accessible name + state?). This is the
   list Phase 5 checks off and the evaluator independently verifies — coverage is
   a provable checklist, not a vibe. (For an existing surface, build this during
   "Existing surfaces: critique before you polish".)

Output: the sprint contract, shown to the user.

## Phase 2 — Diverge

Produce 2–3 structurally different options. **No pixel code.** For each option:
layout structure, which existing components it composes, how the flow splits across
steps, and one sentence on the trade-off. Use the product's component manifest —
options may only compose components that exist (CMP-1 applies from here on).
Progressive disclosure is the default pattern: show the core path, reveal complexity
on demand. Two anti-slop controls bind at this altitude: a complex multi-section
task gets a page, never a modal (SLP-10) — if an option puts tabs, columns, or its
own scrolling inside a dialog, it is not an option; and a grid of identical cards is
not a default layout (SLP-5) — structure should come from the task's hierarchy, not
a template. Two lenses bind here too: simplicity is not minimalism (HIG: Simplicity) —
keep the important things close and let the rest fall away, never hide what the task
needs; and keep the teacher free to move (HIG: Agency) — an option that locks people
into a guided flow or mode must make it easy to skip or escape.

Output: the options with a recommendation. The user picks.

## Phase 3 — Plan (human gate)

Expand the chosen option into a plan:

- Page/step structure and the component for each region.
- Tokens/patterns used; any **missing component** surfaced explicitly with options
  (extend an existing Base UI component / request from the design system — never
  improvise a one-off without a CMP-1 waiver).
- The controls in scope for this page (filtered catalog), with any proposed waivers
  and their rationale — waivers are decided here, not improvised during implementation.
- Content outline: headings, key copy, names checked against CNT-2, error states
  (CMP-3: enumerate loading/success/error states per async action — and for each
  state, its A11Y-11 announcement channel: live region or focus move; CMP-2: every
  destructive action's consequence + undo/confirm, decided now).
- **Flow map** (when the surface is a flow or hosts a multi-step interaction): entry
  points, done state, every exit, and the edge cases from "A flow is not a stack of
  pages" — interruption, partial completion, resume — each with what happens to the
  teacher's work. A plan that covers the steps but not the journey between them is
  incomplete.
- **Tradeoffs, named**: what this design sacrifices and why that's acceptable. A plan
  without a tradeoffs section is incomplete.

**Stop. The user approves the plan before any implementation.** This is the cheapest
place for human judgment — structural mistakes caught here cost a conversation, not a
rebuild. **Present first, ask second**: the full plan goes in your message body, and
the approval ask is a plain-text question at the END of that same message — never a
modal/option dialog in the same turn as the plan, which forces a decision before the
reader has read what they're deciding on. Wait for an explicit typed answer — a vague
"continue" is not plan sign-off; confirm what they are approving. (Option dialogs are
fine for the Phase 2 pick, where the options are short enough to read inside the
dialog itself.) In an **unattended run** with no human reachable, proxy approval is
permitted only when the operator authorized it up front — record it verbatim as
"approved by operator proxy — unattended run" in the decision record, never as if a
human approved. On a team with no
dedicated designer, this gate (and the verify gate) is reviewed async by a portfolio
designer — route the plan to them rather than treating the gate as optional. Write
the approved plan to a decision record (`docs/decisions/<page>.md`, template in
`docs/decisions/TEMPLATE.md`) before implementing: the approved plan is the artifact
the verify phase grades against, so it must be fixed, not whatever you last proposed.
Any L1 waiver granted here records its named approver in that file.

## Phase 4 — Implement

Build exactly the approved plan. Constraints, non-negotiable:

- Compose only manifest components (CMP-1); semantic shadcn tokens only — no raw
  colour, off-scale spacing, or off-scale radii (TOK-1..3); Plus Jakarta Sans /
  Inter only, on-scale sizes (TYP-1..3).
- Visible label on every field (A11Y-3); keyboard reach + focus states (A11Y-2);
  AA contrast (A11Y-1); targets ≥ 24px, 44px on mobile (A11Y-4); respect reduced
  motion (A11Y-5).
- Anti-slop (SLP-1..8) — the default AI aesthetic is a defect: no purple/violet
  gradient palettes, cyan-on-dark, or glow accents (SLP-1); no gradient text
  (SLP-2); no thick side-tab accent borders on rounded cards (SLP-3); no nested
  cards — flatten with spacing, typography, dividers (SLP-4); no identical-card
  grids or icon-tile-above-heading templates (SLP-5); adjacent type-scale steps
  ≥ 1.25x apart (SLP-6); spacing has rhythm — related tighter than unrelated
  (SLP-7); no bounce or elastic easing (SLP-8).
- Accessibility structure (GovTech checklist Essential tier, A11Y-6..10): text
  alternatives or `aria-hidden` on every image/icon (A11Y-6); semantic headings/
  lists/groups, descriptive labels (A11Y-7); custom controls expose name/role/value
  (A11Y-8); descriptive `<title>` + `lang` attribute (A11Y-9); skip link or
  landmarks past repeated chrome (A11Y-10).
- Every async state change picks ONE announcement channel (A11Y-11): transient →
  live region, no focus steal; context replacement → focus moves to the revealed
  surface, no `role="alert"` on the focus target. Declare the channel per state in
  the Phase 3 plan alongside CMP-3's state enumeration.
- Destructive actions: consequence + undo/confirm before execution (CMP-2, L0).
  Build forgiveness beyond CMP-2's minimum (HIG: Agency): recovering from the
  unexpected should not cost the teacher time or work — preserve drafts, keep
  back-navigation safe, make reversal cheap.
- Consistency is a feature (HIG: Familiarity, Flexibility): once an element's
  behaviour or appearance is established, reuse it across the surface, and keep
  content and controls in predictable positions across the three widths — people
  learn faster when new interactions work the way the last one did.
- Copy follows the `tfx-content-style` skill as you write it, not as a cleanup pass
  (it ships with this harness: `../tfx-content-style/SKILL.md` relative to this skill).
  That includes the anti-slop copy rule (SLP-9): no AI-writing tells — buzzwords,
  em-dash chains, filler, chatbot artifacts, structural tells (negative
  parallelism, forced triads, copula avoidance), or label/helper pairs that
  restate each other. Canonical lists and calibration:
  `standards/controls/slp-9.md` — resolved relative to this SKILL.md (three levels up),
  as in the Load-first note above.
- **Make every asserted state reachable for evidence.** If a hybrid control claims
  loading/success/error states, the verify phase must photograph them — build a
  clearly-marked demo-only hook where needed (e.g. a `?fail=1` query param to force
  the error state) and note it in the decision record. A state that can't be
  demonstrated can't be verified.
- Structure drift from the approved plan is a defect — if implementation reveals the
  plan was wrong, go back to the user, don't silently improvise.

## Phase 5 — Verify

Run in this order; do not present output to the user while a step is failing:

1. **Deterministic controls** — all L0/L1 `deterministic` controls. Run the
   built `checks/` scripts first:
   - `python3 checks/token-audit.py <path>...` — TOK-1..3, COL-1..2.
   - `python3 checks/a11y-static.py <path>...` — static subset of A11Y-2/3/8:
     focus-visible removal, non-focusable click handlers, icon-only unnamed buttons.
     A11Y-2, A11Y-3, and A11Y-8 are **not fully mechanically verified** by this
     script — it covers the line-local static subset only. The traversal-order,
     hit-area, contrast, and ARIA-state halves of A11Y-1..8 still run as the manual
     pass below.
   - Everything else: verify by hand against the control's detail file and label it
     "verified manually" (see the v0 reality note above).
   For the manual accessibility pass, work through the catalog's A11Y controls in id
   order — they mirror the GovTech checklist's Essential tier
   (a11y.tech.gov.sg/checklist), which addresses ~96% of common web accessibility
   errors. L0 failure blocks everything; L1 failure sends you back to Phase 4.
2. **Render and screenshot.** Evidence sets, all that apply required:
   - **Width evidence**: the primary state at 360/768/1280.
   - **State evidence**: one frame per state asserted by each in-scope hybrid
     control — *including loading*, the state most often coded-but-unphotographed
     (it slipped through both pilot runs before this rule existed). Use the
     demo-only hooks built in Phase 4.
   - **Journey evidence** (flows and multi-step interactions): traverse the happy
     path end-to-end, one frame per step, **plus one recovery path** from the Phase
     3 flow map actually walked — e.g. abandon at step 2 and return, or fail
     mid-flow and resume. Per-step screenshots that never demonstrate a traversal
     are page evidence, not flow evidence.
   Check each frame's *actual* rendered viewport before naming it — a screenshot
   named `768-*.png` taken at a stale viewport is mislabeled evidence.
   Capture mechanism: **use Claude-in-Chrome by default, or the user's installed
   browser agent of choice**. If the agent-browser daemon misbehaves (it has
   intermittently returned "os error 35"), a local Playwright script is the
   proven fallback. If capture still keeps failing after a reasonable retry,
   **ask the user to provide the screenshot** — any source is fine; the evidence
   set is not optional, and unverified work is never presented as verified.
   - **Inventory checkoff**: walk the Phase-1 component inventory and tick each
     interactive control as operated — tab to it (focus visible per A11Y-2),
     activate by keyboard, confirm role + accessible name + state (A11Y-8/A11Y-3).
     Run `checks/a11y-static` (if built) as the static pre-pass, then operate what
     a static scan can't see. An un-operated control is uncovered, not clean.
3. **Evaluator review** — spawn the `tfx-design-evaluator` subagent (a genuinely separate
   agent — do not write the verdict yourself) with: the sprint contract, the approved
   plan, the screenshots, the component inventory from Phase 1, the judgment/hybrid
   controls in scope, **and the absolute path to the harness's `standards/` directory**
   (the evaluator cannot resolve it from the product cwd). **If you cannot spawn subagents** (you are yourself a
   subagent, or running unattended), stop at this step and report — the proven
   pattern is *orchestrator dispatch*: whoever orchestrates you spawns the evaluator
   and routes its verdict back to you. Never write the verdict yourself, and never
   present unverified work as verified while waiting.
   **Paste the full verdict verbatim into the decision record** — the record is the
   durable artifact; a summary in its place is a defect ("full text in the session
   log" does not survive the session). You never grade your own design work. Note
   the shared limit honestly: the evaluator runs the same model on the same
   standards, so it is a second read, not a fully independent one — treat split
   findings and any control you could not mechanically verify as candidates for
   human review.
4. Address findings; re-run from step 1 after changes.

## Phase 6 — Ratchet

After the user accepts the result, finish the decision record started in Phase 3
(`docs/decisions/<page>.md`): chosen option, rejected options and why, waivers granted
and by whom, and the verify verdict. Then:

- Any failure the evaluator or user caught that no control covered → propose a new
  control or anti-pattern entry for `standards/`. Follow the "Growing the catalog"
  section of the `tfx-design-standards` skill — it is the single authoritative description
  of the proposal format.
