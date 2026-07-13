# Plan 018: SlopCompare — a draggable before/after demo of what the catalog catches, on /standards

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If any
> STOP condition occurs, stop and report — do not improvise. Do NOT update
> `plans/README.md` — your reviewer maintains the index.
>
> **Drift check (run first)**: plan 016's motion layer must be in your tree:
> `grep -c "motion-base" app/globals.css` → ≥1 AND `test -f lib/motion.ts && echo ok` → ok.
> If either fails, STOP. Then
> `git diff --stat 7fbc703..HEAD -- app/standards/page.tsx components/compare.tsx`
> — `app/standards/page.tsx` must be unchanged from the excerpt below and
> `components/compare.tsx` must not exist; otherwise STOP.

## Status

- **Priority**: P1 (the "show, don't tell" moment for the presentation)
- **Effort**: M–L
- **Risk**: MED (interactive widget; the "before" panel must stay quarantined)
- **Depends on**: plans/016-motion-foundation.md (DONE required)
- **Category**: direction (communication design)
- **Planned at**: commit `7fbc703` + plan 016's branch, 2026-07-12

## Why this matters

The site *describes* 60+ controls but demonstrates none of them — there is no
interactive moment anywhere that shows what the standard actually catches. The
strongest pattern for this (proven by impeccable.style) is a draggable
before/after: the default-AI version of a screen on the left, the same screen
on standard on the right, violation chips pinned to what's wrong. One drag
communicates the catalog's value faster than any paragraph. It lands on
`/standards`, the page whose whole job is "the must layer".

## Current state

- `app/standards/page.tsx` — the entire file today:
  ```tsx
  import { SectionIndex } from "@/components/section-index";
  import { mdAlternate } from "@/lib/markdown-twin";

  export const metadata = { title: "Standards", ...mdAlternate("/standards") };

  export default function Page() {
    return <SectionIndex sectionKey="standards" />;
  }
  ```
  `SectionIndex` renders the section title/description/illustration slot and
  topic rows from `content/sections/standards.mdx`; it takes no children.
- `components/compare.tsx` does not exist. No drag/before-after interaction
  exists anywhere on the site (audited 2026-07-12).
- `app/globals.css` `:root` holds all tokens; raw colour values are legal ONLY
  there (token-audit.py scans `app components lib` and passes the existing hex
  values in the `:root` token block — put the demo's slop colours there, never
  inline).
- `lib/motion.ts` (plan 016): `DUR`, `EASE_OUT`; CSS tokens `--motion-fast/base`.
- Relevant catalog controls (verbatim `fails_when` themes) the "before" panel
  will deliberately exhibit — and must label with chips:
  - SLP-1: purple/violet gradient palettes, glow accents
  - SLP-2: gradient text
  - SLP-4: nested cards (card inside card)
  - SLP-6: flat type hierarchy (every text the same size/weight)
  - SLP-9: buzzword copy ("seamless", "unlock", "revolutionise"…)
  - CMP-5 (one primary action per view — two competing primaries fail).
    (Plan originally said CMP-1 — wrong; CMP-1 is Base UI component reuse. The
    executor verified against the catalog and used CMP-5.)
- Waiver syntax (catalog meta): `dxd-waive <ID> reason="<specific reason>"`.
  L1 controls need a documented waiver where violated — the before panel is a
  deliberate, quarantined anti-specimen and carries waiver comments in code
  (this also demonstrates the waiver system working).
- Accessibility pattern for the slider (researched, use this): **a real
  `<input type="range">`** overlaid invisibly, driving a CSS custom property
  that clips the "after" layer —
  `clip-path: polygon(var(--exposure) 0, 100% 0, 100% 100%, var(--exposure) 100%)`.
  The browser then supplies keyboard (arrows/Home/End), touch, and
  screen-reader behaviour for free (Cloud Four `image-compare` technique). Add
  a visually-hidden label. Throttle pointer-driven updates with
  `requestAnimationFrame`.
- Repo conventions: tokens only (TOK-1); focus-visible pattern
  `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)`;
  reduced-motion via `useReducedMotion() === true` or `motion-reduce:`
  utilities; Singapore English; second person; sentence case; text contrast AA
  everywhere **including the slop panel** (L0 is never demonstrated broken —
  the demo violates only waivable style/content tiers).

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm typecheck` | exit 0 |
| Lint | `pnpm lint` | exit 0 |
| Tests | `pnpm test` | all pass |
| Full build | `pnpm build` | exit 0 (prebuild incl. token-audit must pass) |
| Dev server | `pnpm dev --port 4018` | serves http://localhost:4018 |

## Suggested executor toolkit

- Read `/Users/jeongwondo/.claude/skills/make-interfaces-feel-better/SKILL.md`
  (handle/grip affordance craft) and
  `/Users/jeongwondo/.claude/skills/web-animation-design/SKILL.md` (touch +
  reduced-motion rules).
- `agent-browser` CLI for screenshots (`~/.claude/skills/agent-browser/SKILL.md`).

## Scope

**In scope**:
- `components/compare.tsx` (create — the `SlopCompare` component)
- `app/globals.css` — **append only** a clearly-commented `--demo-slop-*` token
  block at the END of `:root`; touch nothing else in the file
- `app/standards/page.tsx` (embed)

**Out of scope** (do NOT touch):
- `components/section-index.tsx` (shared by six sections)
- `content/sections/standards.mdx` (a sibling plan owns content)
- `components/mdx.tsx` (this component is used from TSX, not MDX — no registration)
- `harness/**` (no catalog changes here)
- Any other component or page.

## Git workflow

- Worktree branch `advisor/018-slop-compare`; commit there; do not push.
- Commit style: `feat(site): before/after slop comparison on /standards`.

## Steps

### Step 1: Demo tokens (quarantined)

Append to the END of the `:root` block in `app/globals.css`:

```css
  /* ── Anti-specimen tokens — used ONLY by components/compare.tsx to draw the
     "before" (default-AI) panel of the standards demo. Never use these in
     product UI: they exist to be pointed at (SLP-1/SLP-2 exhibits). ── */
  --demo-slop-grad-a: #7c3aed;
  --demo-slop-grad-b: #c026d3;
  --demo-slop-surface: #f5f3ff;
  --demo-slop-ink: #4c1d95;
```

(Adjust exact purple values if needed for AA body-text contrast on the slop
surface — the *style* violates SLP-1, the *contrast* must still pass A11Y-1.)

**Verify**: `pnpm build`'s prebuild token-audit passes (`pnpm build` exit 0 —
you may defer the full run to Step 4 and here just run
`python3 harness/checks/token-audit.py app components lib` → exit 0).

### Step 2: `components/compare.tsx`

`"use client"`. Export `SlopCompare` (no props needed). Structure:

1. **Two stacked panels** in one aspect-stable frame (`aspect-[16/10]`,
   `max-w-[760px]`, rounded-lg, border): BEFORE underneath (full width), AFTER
   on top clipped by `clip-path: polygon(var(--exposure) 0, 100% 0, 100% 100%, var(--exposure) 100%)`.
   Both panels render the SAME task so the comparison is honest — a small
   teacher-comms card, "Term 3 broadcast" (title, one body line, recipient
   line "4 classes · 127 parents", two actions, a status row).
   - BEFORE (the default-AI version, all styling from `--demo-slop-*` +
     existing neutral tokens): gradient header band (`--demo-slop-grad-a→b`),
     gradient-clipped text title, a card nested inside a card, three identical
     icon-tile mini-cards in a row, every text the same 13px/400 (flat
     hierarchy), two solid primary buttons side by side ("Get started!",
     "Learn more"), buzzword body copy — write it with the exact tells:
     "Revolutionise your seamless communication workflow and unlock engagement
     at scale."
   - AFTER (on standard, existing tokens only): `font-display` 600 title,
     clear 16/13.5px hierarchy, one primary button ("Send to 4 classes") +
     one quiet text action ("Save draft"), hairline dividers instead of nested
     cards, purposeful spacing, plain copy: "Reaches every parent by Friday
     morning. Drafts save automatically."
   Both panels: `aria-hidden` on the one that is visually irrelevant is WRONG
   here (both are partially visible) — instead give the frame
   `role="group"` + `aria-label="Before and after: the same screen, default AI
   output versus on standard"`, and keep panel text real (screen readers read
   both; that is acceptable and honest).
2. **Violation chips** pinned over BEFORE regions (absolutely positioned,
   small `--danger-subtle` bg / `--danger` text, 11px, e.g. `SLP-1 gradient
   palette`, `SLP-2 gradient text`, `SLP-4 nested cards`, `SLP-6 flat
   hierarchy`, `SLP-9 buzzword copy`, `CMP-1 two primaries`). Chips hide as
   the divider passes them (they belong to the before layer). On the AFTER
   side, one quiet `--success-subtle` chip: "passes the catalog". Each chip is
   plain text (not a link) — keep them non-interactive and unambiguous.
3. **The slider control**: a full-height, visually hidden but focusable
   `<input type="range" min="0" max="100" step="1">` laid over the frame,
   driving `--exposure` (%) via rAF-throttled `input` events; visually-hidden
   `<label>`: "Reveal the on-standard version". `aria-valuetext`:
   `` `${value}% on standard` ``. The visible **handle**: a 1.5px vertical
   line (`--tw-blue`) at the divider with a centred circular grip (≥24px,
   white surface, border, two tiny ‹ › glyphs). The grip tracks `--exposure`.
   Under the frame, a one-line hint: "Drag the handle — or focus it and use
   arrow keys." set in 12.5px muted. Initial value 50.
4. **Micro-motion** (tokens only): grip gets `transition` on box-shadow/border
   `var(--motion-fast)` on hover/focus; on first render (once, in-view) the
   divider eases from 62 → 50 over `DUR.base` with `EASE_OUT` as a "this
   moves" cue — skip entirely under `useReducedMotion() === true`. No other
   animation; dragging itself must be direct (no easing on the tracked value).
5. **Caption** below (figcaption): "The same screen twice: what defaults
   produce, and what ships under the standard. Every chip is a control ID from
   the [catalog](/standards/catalog)." (link real).
6. **Waiver comments** in the BEFORE JSX, one per exhibited violation:
   `{/* dxd-waive SLP-1 reason="quarantined anti-specimen: the before panel of the standards demo" */}`
   (repeat for SLP-2, SLP-4, SLP-6, SLP-9, CMP-1).

TypeScript strict; no raw hex outside the Step-1 token block; fonts via
existing utilities; all interactive targets ≥24px.

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 3: Embed on /standards

`app/standards/page.tsx` becomes:

```tsx
import { SectionIndex } from "@/components/section-index";
import { SlopCompare } from "@/components/compare";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Standards", ...mdAlternate("/standards") };

export default function Page() {
  return (
    <div>
      <SectionIndex sectionKey="standards" />
      <section className="mt-14 max-w-[760px]">
        <h2 className="font-display text-[24px] font-semibold tracking-tight">
          See what the catalog catches
        </h2>
        <p className="mt-2 max-w-[62ch] text-[16px] leading-[1.6] text-muted-foreground">
          Sixty-two controls read as one demo. Drag the handle.
        </p>
        <SlopCompare />
      </section>
    </div>
  );
}
```

(If the control count in your tree differs, state the number the catalog
actually holds — `grep -c "^  - id:" harness/standards/catalog.yaml`.)

**Verify**: `pnpm build` → exit 0; `/standards` renders both SectionIndex and
the demo.

### Step 4: Full gate + evidence

`pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all exit 0.
`pnpm dev --port 4018`, then agent-browser captures of `/standards`:
- 1280 default (divider at 50)
- 1280 after dragging/setting the range to ~15 and ~85 (chips visible/hidden)
- 360 (layout intact, handle reachable)
- keyboard pass: focus the slider, ArrowRight moves the divider (state in NOTES)
List capture paths in NOTES; if tooling fails twice, document and continue.

## Test plan

No new unit test is required (the component is presentation + a native input;
there is no pure logic worth extracting). Instead the machine-checkable gates
are: typecheck/lint/build green, `grep -c "dxd-waive" components/compare.tsx`
→ ≥6, and `grep -n "type=\"range\"" components/compare.tsx` → exactly 1.
If you do extract any pure helper (e.g. chip positioning), test it in
`lib/` following `lib/catalog.test.ts` style.

## Done criteria

- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0
- [ ] `python3 harness/checks/token-audit.py app components lib` → exit 0
- [ ] `grep -c "dxd-waive" components/compare.tsx` → ≥ 6
- [ ] `grep -c "demo-slop" components/compare.tsx` → ≥ 1, and
      `grep -rn "demo-slop" app components lib | grep -v "globals.css" | grep -v "compare.tsx"` → no matches (quarantine holds)
- [ ] `<input type="range">` present with a visually-hidden label and
      `aria-valuetext`
- [ ] Divider draggable by pointer AND adjustable by arrow keys (dev check)
- [ ] Reduced motion: no intro nudge (code path verified)
- [ ] No files outside scope modified (`git status`)

## STOP conditions

- Plan 016's tokens are absent (drift check).
- `app/standards/page.tsx` differs from the excerpt.
- Achieving AA contrast on the slop panel forces it to stop looking like slop
  after two attempts — report with what you tried (do not ship an L0 violation
  and do not ship an unconvincing demo).
- The clip-path approach fails in the build's browsers matrix or forces
  layout-thrashing hacks — report rather than switching to a JS-resize
  architecture.

## Maintenance notes

- The chip set is hand-pinned to the BEFORE layout — anyone editing the before
  panel must re-check chip positions at 360/768/1280.
- If the catalog count changes, the "/standards" intro line and the
  after-panel chip copy stay generic enough to survive; the one number in the
  h2 subtitle must be updated (or made dynamic via lib/catalog if a later plan
  prefers).
- A future plan may reuse SlopCompare on the landing page — keep it
  self-contained (no page assumptions).
