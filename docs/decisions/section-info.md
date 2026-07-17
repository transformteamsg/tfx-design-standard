# Design decision record — Section info affordance (kind help on doc sections)

> One record per page or significant change. Started at the Phase 3 plan gate (the
> approved plan is the fixed artifact the verify phase grades against), finished at
> Phase 6. Keeps the human approval, waivers, and verdict traceable.

- **Date:** 2026-07-17
- **Product:** TW surface (the TFX-DS documentation site itself)
- **Change type:** modification (site-wide, applied at one chokepoint)
- **Page type:** documentation / reference page (rendered through `DocPage` → MDX)
- **Run type:** attended
- **The teacher and the moment:** not a teacher — the *reader of the standard*. A
  product designer new to TFX, mid-task, skimming `/foundations/colour` to pick a
  functional colour. They hit `## Functional colours` and a token table, and want one
  sentence: what is this section for, and what do I do with it now?

## Sprint contract (done-criteria)

1. Each doc section heading (h2) that has an authored description shows a consistent,
   unobtrusive info affordance; sections without one look exactly as today (no empty
   icons).
2. The description is reachable by hover, keyboard focus, and tap; dismissable; never
   blocks reading the section.
3. Fully accessible: keyboard-reachable + visible focus (A11Y-2); ≥24px target / 44px
   on touch (A11Y-4); accessible name on the trigger, glyph decorative (A11Y-6/A11Y-8);
   motion 100–300ms with a reduced-motion path (MOT-1/A11Y-5/SLP-8).
4. Description copy leads with purpose before mechanism (CNT-7); second person, ≤25
   words (CNT-3); no AI-writing tells (SLP-9); plain language (CNT-2). Copy lives in
   `content/` (frontmatter), not in TSX.
5. Reuses the existing Base UI tooltip primitive; no raw hex; on-scale type/spacing
   (CMP-1, TOK-1..3, TYP-1..3).

## Chosen approach

**Option A — Tooltip on the heading, copy in frontmatter.** Each doc's MDX frontmatter
gains an optional `sections:` map (heading-slug → one-line description). `components/mdx.tsx`
becomes a `buildMdxComponents(sections)` factory; the `h2` heading component looks up its
slug and, when a description exists, renders a `SectionInfo` info-icon button after the
heading text. The button triggers the existing Base UI `Tooltip` on hover / focus / tap.
`components/doc-page.tsx` passes `doc.data.sections` to the factory. h3 headings are left
untouched (grill decision). Applies to all `DocPage`-rendered pages; descriptions authored
for the six **Foundations** docs first (this tranche), remaining sections rolled after the
voice is reviewed.

## Rejected options

- **Option B (toggletip popover)** — adds a new component (CMP-1 cost), invites longer
  copy that drifts from "one glance," and loses hover discoverability.
- **Option C (inline collapsible note)** — adds persistent vertical chrome to every
  section, competing with the content it describes; noisier, less "unobtrusive."

## Tradeoffs, named

- **Tooltip caps copy length** — deep nuance won't fit; accepted, because a purpose-first
  one-liner *is* the goal and the section body still holds the detail.
- **Coverage is staged** — only Foundations gets copy this tranche; other sections render
  unchanged (no empty icons) until their batch.
- **Navigational pages excluded (v1)** — landing, section-index card grids, and the
  standards catalog browser have no "bare label + code" problem, so they get no affordance
  now (grill decision).
- **Touch is transient** — tap opens, tap-away dismisses; not a pinned card (Option A's
  accepted constraint).

## Controls in scope

A11Y-1, A11Y-2, A11Y-4, A11Y-5, A11Y-6, A11Y-8; MOT-1, SLP-8, SLP-9; TOK-1, TOK-2, TOK-3;
TYP-1, TYP-2, TYP-3; CMP-1, CMP-5, CMP-7; CNT-2, CNT-3, CNT-7. No async or destructive
action → CMP-2/CMP-3 N/A.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| — | — | none | — | — |

## Plan approval

- **Approved by:** wondo.jeong@gt.tech.gov.sg (attended, structured Approve/Adjust)
- **Approved on:** 2026-07-17

Plan was grilled. Decisions the grill resolved:
- Affordance on **h2 only**; h3 subsections stay clean (avoids noise on nested pages).
- Navigational pages (landing, section-index card grids, catalog browser) **excluded in
  v1**; the mechanism covers doc pages with section headings, which are the surfaces with
  the cryptic-label problem.
- Trigger accessible name includes the heading text ("About this section: <heading>") for
  screen-reader context (resolved by author, best-practice).
- Rest-state icon contrast (muted-foreground as a UI graphic → 3:1) is a verify-time
  check; `--muted-foreground` #67676f already clears 4.5:1 on the muted fill, so it clears
  3:1 on the page background.

## Verify verdict

- **Screenshots:** scratchpad — `1280-rest.png`, `768-rest.png`, `360-rest.png` (widths /
  LAY-2 reflow); `1280-hover-open.png` (hover, 14px prose); `1280-focus.png` (visible
  focus ring + open on focus); `1280-click-open.png` (click); `360-tap-open.png` (mobile
  tap/click, stays in viewport); `1280-reduced-motion.png` (open under reduced motion).
- **Token block line range:** N/A (no `tfx-tokens` exempt region added).
- **Dark mode:** N/A — no user-reachable dark mode (partial `.dark` layer in globals.css,
  no theme toggle in topbar/sidebar/layout). The change adds no mode-specific colour; the
  tooltip uses semantic tokens (`bg-foreground`/`text-background`) that resolve per mode by
  construction.
- **Deterministic checks:** `token-audit.py`, `a11y-static.py`, `type-scan.py` clean on the
  changed components; `content-lint.py` clean on the new frontmatter; `pnpm typecheck`
  clean; `pnpm build` clean (225 static pages).
- **Post-evaluator fixes applied (verify-driven, re-verified):**
  1. Touch/click gap — a pure ARIA tooltip does not reveal on tap (`tooltip-content` count 0
     after tap). Made the trigger controlled; `onClick` opens it. Click + mobile tap now
     open it (screenshots). Not a toggle-close: a naive toggle would break desktop click
     (focus opens, click would immediately re-close); dismissal via Escape / outside / mouse-leave.
  2. TYP-2 advisory — bumped description text from the tooltip's 12px default to 14px
     (`text-sm`) so reading prose is kinder (justified CMP-7 deviation, recorded in-code).
  3. A11Y-8 — Base UI did not wire `aria-describedby` (DOM-confirmed null). Added explicit
     `aria-describedby` → an always-present `sr-only` copy of the description; now
     DOM-confirmed to resolve to the description text, so a screen reader announces it on
     focus regardless of popup state.
- **Verification ledger** (one row per in-scope control):

  | Control | Method | Evidence |
  |---------|--------|----------|
  | A11Y-1  | manual | icon rest `--muted-foreground` #67676f on #fff ≈ 5.4:1 (> 3:1 UI floor); tooltip text-background on bg-foreground ≈ 16:1 |
  | A11Y-2  | script + manual | `a11y-static.py` clean; `1280-focus.png` shows `focus-visible:ring-3` ring; keyboard-reachable button |
  | A11Y-4  | manual | `size-6` = 24px visual; `before:-inset-2.5` = +10px/side → ~44px hit area |
  | A11Y-5  | manual | globals.css reduced-motion rule kills tooltip animation; `1280-reduced-motion.png` open without transform |
  | A11Y-6  | script | `a11y-static.py` clean; glyph `aria-hidden`, trigger `aria-label` |
  | A11Y-8  | manual | real `<button>` + `aria-label`; `aria-describedby` → sr-only description **DOM-confirmed to resolve** |
  | MOT-1   | manual | tw-animate default 150ms `ease`; `transition-colors` 150ms hover; within 100–300ms |
  | SLP-8   | manual | default `ease`, no bounce/overshoot/spring |
  | SLP-9   | script + manual | `content-lint.py` clean; read all ~30 descriptions — no tells |
  | TOK-1/2/3 | script | `token-audit.py` clean; all utilities on scale, `rounded-md` |
  | TYP-1/2/3 | script | `type-scan.py` clean; 14px description on scale (raised for readability) |
  | CMP-1   | manual | reuses `ui/tooltip.tsx` (Base UI); no manifest in repo (asserted) |
  | CMP-5   | manual | trigger is a tertiary ghost icon; no new primary action |
  | CMP-7   | manual | tooltip defaults reused; 14px + describedby are recorded, justified deviations |
  | CNT-2/3/7 | script + manual | plain section names; ≤25 words; purpose-first throughout |

- **Evaluator verdict** (verbatim):

  > VERDICT: pass-with-findings
  >
  > The section-info affordance is a clean, well-scoped composition of the existing Base UI tooltip. All in-scope L0/L1 controls pass; the copy is genuinely strong (purpose-first, no AI tells). Findings are advisory only — no blockers.
  >
  > BLOCKING (must fix before ship): None.
  >
  > ADVISORY (should fix):
  > - TYP-2 (L1) close call — tooltip description text renders at `text-xs` (12px) inherited from the shared `components/ui/tooltip.tsx` default. That is fine for a terse label, but these descriptions run up to ~25 words of *reading* prose. 12px reading copy sits at the small end of comfortable, and the sprint's own goal is to make the docs "kinder for designers." Not a clear violation — 12px is the sanctioned tooltip default, it clears the ≥11px label floor, and `type-scan.py` passed — so I am not blocking it, but a human should decide whether help-prose at 12px meets the intent. If judged as body copy rather than a label, this becomes an L1 fail.
  > - A11Y-8 (L1) — pass, but the `aria-describedby` trigger→popup association could not be DOM-confirmed in the open state (client-only state; not curl-inspectable, and the open tooltip was not in the static DOM `a11y-static.py` scanned). Recommend one screen-reader/DevTools spot check that the description is announced on focus. Code + Base UI semantics indicate it is wired; evidence is behavioral, not DOM-verified.
  >
  > SUGGESTIONS (not violations):
  > - The `onClick` handler always calls `setOpen(true)` — a second tap/click on an already-open trigger does not toggle it closed. Dismiss still works (Escape, outside tap, mouse-leave), so the contract's "dismissable" holds, but a toggle would be a more expected tap affordance on touch. Serves contract criterion 2; low impact.
  > - Consider `aria-expanded` on the trigger to reflect open/closed for AT — optional, since tooltip semantics carry the description via `aria-describedby`; not required by A11Y-8 for a tooltip pattern.
  >
  > QUALITY GRADES:
  > - Design quality — strong: the icon sits unobtrusively inline after the heading at muted weight, resolving to foreground on hover; hierarchy of the heading is preserved and the affordance reads as secondary.
  > - Originality — strong (appropriately restrained): reuses the stack tooltip rather than inventing a popover; exactly the warranted-restraint CMP-1 wants, no novelty.
  > - Craft — strong: rest/hover/focus/click/tap/reduced-motion states are all designed and evidenced across three widths; the `before:` hit-area expansion and `-translate-y-px` optical nudge are deliberate touches.
  > - Functionality — strong: the affordance completes its task (reveal help) on every input modality shown, stays in-viewport at 360, and never traps the reader (dismissable, transient).
  > - Dark mode — N/A: no dark frame captured and the change adds no mode-specific styling.
  >
  > (Full per-control judgment notes and verification ledger reproduced in the ledger above.)
  >
  > UNCOVERED (defects no control covers): None. Contract criteria 1–5 all met.

  *Post-verdict:* the two advisories (TYP-2 12px, A11Y-8 DOM-confirmation) and the touch-tap
  suggestion were all addressed and re-verified — see "Post-evaluator fixes applied" above.
  The evaluator is a second read on the same model/standards, not a fully independent one;
  the A11Y-8 announcement is DOM-confirmed but a human screen-reader spot check is still
  worth one pass before wide rollout.

## Ratchet

Ratchet: no proposal — nothing uncovered. Every finding mapped to an existing control
(TYP-2, A11Y-8) or was a UX suggestion, not a control gap. One process note worth keeping:
Base UI's `Tooltip` does **not** auto-wire `aria-describedby` (unlike Radix), and does not
reveal on touch — any future tooltip-as-help usage should wire describedby explicitly and
add a click path, as `SectionInfo` now does. Not a catalog control; captured here and in
the component's comments so the next author inherits it.

Rollout (complete): after the Foundations voice was approved, the same `sections:`
frontmatter treatment was applied to Guidelines (9 docs), Principles (2 docs), Harness
(3 docs), Governance (`governance.mdx`), and the two `sections/` docs (`for-agents`,
`how-to-read`) — 58 further descriptions, all authored through the `tfx:copy` improve
pass and `content-lint`-clean. `governance/changes.mdx` was deliberately skipped: it is a
dated changelog, not conceptual sections a designer applies. Total site coverage: ~88
section descriptions across 23 docs. Build clean (225 pages), frontmatter parses.
