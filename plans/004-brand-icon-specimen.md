# Plan 004: Surface the brand (ink) icon set beside Lucide on the Iconography page

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. Touch
> only the files listed as in scope. If any STOP condition occurs, stop and
> report — do not improvise. Commit your work following the git workflow
> section. SKIP updating `plans/README.md` — your reviewer maintains the index
> (plans/ may not exist in your worktree; that's expected).
>
> **Drift check (run first)**:
> `git diff --stat c519230..HEAD -- content/foundations/iconography.mdx components/mdx.tsx components/ink-icons.generated.ts components/readers.tsx components/foundations`
> If any listed file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans 001–003 (all merged into `main` @ `c519230`; your base already contains them)
- **Category**: docs
- **Planned at**: commit `c519230`, 2026-07-17

## Why this matters

The Iconography page names two icon families but only shows one. Lucide (flat,
system UI) renders via `<IconSet />`; the "Brand icons — Icon Generator"
section is prose only, so nobody can see the hand-drawn "ink" style the
standard reserves for product marketing and comms. The repo already ships that
style: `components/ink-icons.generated.ts` holds Lucide glyphs baked through
the Icon Generator's Ink preset (rough.js + feTurbulence), rendered today on
the landing page and topic thumbnails. This plan surfaces a sample on the
Iconography page as a **flat-vs-inked comparison of the same glyphs**, so the
difference — and when to use each — is visible at a glance:

- **Lucide (flat)** → system interfaces: nav bar, controls, product UI.
- **Ink (Icon Generator)** → product marketing and communications.

## Current state

- `content/foundations/iconography.mdx` — the page. Relevant slice:

  ```mdx
  ## UI icons — Lucide

  Interface icons come from **Lucide** (the shadcn/ui companion set): consistent stroke weight, predictable naming, tree-shakeable, and a vocabulary AI agents already know. Don't mix icon sets in product UI.

  <IconSet />

  ## Brand icons — Icon Generator

  Brand and feature iconography is generated with the internal **Icon Generator**, which maintains stroke weight, corner radius, and silhouette rules by construction.

  ## Rules
  ```

  `<IconSet />` (already registered) is the existing Lucide specimen in
  `components/foundations/icon-set.tsx` — read it to match its `<figure>` /
  panel / caption conventions.

- `components/ink-icons.generated.ts` — auto-generated (do NOT edit). Exports:
  - `inkIcons: Record<string, { seed: number; paths: string[] }>` keyed by
    topic path.
  - `inkStroke` (number) and `inkFilter` (`{ baseFrequency, numOctaves,
    displacementScale }`).

  The keys you will use (key → underlying Lucide glyph, confirmed in
  `scripts/generate-ink-icons.mjs`):
  | inkIcons key | Lucide glyph id | lucide-react component |
  |---|---|---|
  | `foundations/colour` | `palette` | `Palette` |
  | `foundations/typography` | `type` | `Type` |
  | `harness/skills` | `layers` | `Layers` |
  | `guidelines/voice-tone` | `message-circle` | `MessageCircle` |
  | `harness/loop` | `refresh-cw` | `RefreshCw` |
  | `guidelines/illustration` | `image` | `Image` |

- **The ink render pattern** — copied verbatim from
  `components/readers.tsx:19-52` (the repo deliberately keeps a local copy in
  each consumer; `readers.tsx` and `thumbnails.tsx` both do — match that, do
  not try to export a shared one):

  ```tsx
  function InkIcon({ artKey, size }: { artKey: string; size: number }) {
    const icon = inkIcons[artKey];
    if (!icon) return null;
    const filterId = `inkr-${artKey.replace(/[^a-zA-Z0-9]/g, "-")}`;
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency={inkFilter.baseFrequency}
              numOctaves={inkFilter.numOctaves} seed={icon.seed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={inkFilter.displacementScale} />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          {icon.paths.map((d, i) => (
            <path key={i} d={d} stroke="var(--ink)" strokeWidth={inkStroke} fill="none" />
          ))}
        </g>
      </svg>
    );
  }
  ```

- **CRITICAL — `--ink` is a scoped variable, not a global.** The ink paths
  stroke with `var(--ink)`, which is undefined unless a wrapping element sets
  it. `readers.tsx:70` sets it inline: `style={{ "--ink": "var(--tw-blue)" } as CSSProperties}`.
  Your specimen MUST set `--ink` on the panel (or per cell) the same way, or
  every inked glyph renders invisible. Use `var(--tw-blue)` (the system/brand
  ink used on the landing readers). This is TOK-1-clean: the value is a token
  reference, never a raw colour.

- `components/mdx.tsx` — registry (already imports IconSet + the plan-001/002
  specimens). You will add one more import + one registry entry.

Repo conventions:
- Specimen components follow `components/diagrams/motion-scale.tsx` /
  `components/foundations/icon-set.tsx`: a `<figure className="my-8">` with an
  inner `rounded-lg border border-border bg-surface p-4` panel and a 12px
  `text-muted-foreground` `<figcaption>`. Open the file with a short block
  comment stating its job and the controls that constrain it.
- Decorative glyphs get `aria-hidden`; the visible label carries meaning
  (A11Y-3). Flat grid, no card-per-icon chrome (SLP-11).
- No raw colour in style contexts (TOK-1) — only `var(--…)` and semantic
  classes. `harness/checks/token-audit.py` enforces this over `app components lib`.
- Copy: second person, active voice, sentence case, ≤25-word sentences
  (CNT-3), no AI-writing tells (SLP-9).

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm typecheck` | exit 0 |
| Lint | `pnpm lint` | 0 errors (4 pre-existing warnings OK) |
| Unit tests | `pnpm test` | all pass (58) |
| Standards gate | `node scripts/check-standards.mjs` | exit 0 (OK line) |
| Token audit | `python3 harness/checks/token-audit.py app components lib` | exit 0, silent |
| A11y static | `python3 harness/checks/a11y-static.py app components` | exit 0 |
| Full build | `pnpm build` | exit 0, no `MDX compile failed` |
| Rendered contract | `pnpm test:e2e` | all pass (37) |

## Scope

**In scope**:
- `components/foundations/brand-icon-set.tsx` (create)
- `components/mdx.tsx` — register `BrandIconSet`
- `content/foundations/iconography.mdx` — embed `<BrandIconSet />` and adjust
  the two section intros to state the usage split

**Out of scope** (do NOT touch):
- `components/ink-icons.generated.ts` — generated; read-only.
- `components/readers.tsx`, `components/thumbnails.tsx` — the copy of the ink
  renderer is intentional; don't refactor to share.
- `components/foundations/icon-set.tsx` — the Lucide specimen stays as is.
- `app/globals.css`, `scripts/generate-ink-icons.mjs`, `harness/**`.
- The product logo marks in `public/icons/*.svg` — not part of this plan.
- `content/map.json`, `components/sidebar.tsx` — no page added.

## Git workflow

- Branch: `advisor/004-brand-icon-specimen`
- Conventional commits, e.g. `feat(site): show the ink brand-icon set beside Lucide on the iconography page`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Build the BrandIconSet specimen

Create `components/foundations/brand-icon-set.tsx`. Server component (no
`"use client"`). Include the block comment, the local `InkIcon` copy (from
Current state), and the flat Lucide imports. Render a responsive grid of
**pairs** — for each of the six entries below, one cell showing the flat
Lucide glyph and the inked glyph side by side, with the glyph name beneath:

```tsx
const PAIRS = [
  { name: "palette",        key: "foundations/colour",       Lucide: Palette },
  { name: "type",           key: "foundations/typography",   Lucide: Type },
  { name: "layers",         key: "harness/skills",           Lucide: Layers },
  { name: "message-circle", key: "guidelines/voice-tone",    Lucide: MessageCircle },
  { name: "refresh-cw",     key: "harness/loop",             Lucide: RefreshCw },
  { name: "image",          key: "guidelines/illustration",  Lucide: Image },
] as const;
```

Each cell: a small header row with two tiny labels ("Lucide" / "Ink") OR a
single shared label per cell — your call, but the two renderings must be
visually adjacent so the difference reads. Flat glyph: `<Lucide aria-hidden size={24} strokeWidth={2} />`.
Inked glyph: `<InkIcon artKey={key} size={24} />`. Set `--ink` once on the
panel: `style={{ "--ink": "var(--tw-blue)" } as CSSProperties}` (import
`type CSSProperties` from `react`). Glyph name beneath in 11–12px
`text-muted-foreground`. Grid: `grid-cols-2 sm:grid-cols-3 gap-4`, must not
overflow at 320px. Caption: one line, e.g. "Same glyphs, two renderings: flat
Lucide for interface, inked for marketing and comms."

Before writing, verify each Lucide component exists:
`node -e "const l=require('lucide-react'); ['Palette','Type','Layers','MessageCircle','RefreshCw','Image'].forEach(n=>console.log(n, typeof l[n]))"`
→ each prints `function`. If any prints `undefined`, STOP (see STOP conditions).

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 2: Register in the MDX registry

In `components/mdx.tsx` add `import { BrandIconSet } from "@/components/foundations/brand-icon-set";`
and add `BrandIconSet` to the `mdxComponents` object.

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Embed + sharpen the section intros

In `content/foundations/iconography.mdx`:
- Under `## UI icons — Lucide`, keep the existing sentence; you may append one
  short clause naming the use ("…the vocabulary for system interfaces — nav,
  controls, product UI.") if it stays ≤25 words and sentence case.
- Under `## Brand icons — Icon Generator`, keep the existing sentence and add
  `<BrandIconSet />` after it, plus one sentence framing the use: the inked
  style is for product marketing and communications, not dense UI.

Do not remove any existing claim or the `tools:` frontmatter block.

**Verify**: `pnpm build` → exit 0 and no `MDX compile failed for foundations/iconography`
(grep the build log). Start `pnpm dev --port 3040`, then
`curl -s http://localhost:3040/foundations/iconography | grep -c "feTurbulence"` → ≥ 6
(the inked glyphs rendered), and `grep -ci "svg"` on the same page → ≥ 24
(12 Lucide from IconSet + 12 from the 6 pairs). Kill the dev server; run a
fresh `pnpm build` before any e2e.

### Step 4: Full gate

`pnpm lint && pnpm typecheck && pnpm test && node scripts/check-standards.mjs
&& python3 harness/checks/token-audit.py app components lib &&
python3 harness/checks/a11y-static.py app components && pnpm build && pnpm test:e2e`

**Verify**: every command exits 0.

## Test plan

- No new unit test (static specimen, like IconSet — which has none). The gates
  that bite: token-audit (TOK-1 on the new component), a11y-static, build, and
  the e2e rendered contract (`/foundations/iconography` is not a listed e2e
  route, so overflow there is not auto-covered — manually confirm no 320px
  horizontal scroll in Step 3's dev check by eye or by narrowing the grid).

## Done criteria

ALL must hold:
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` exit 0
- [ ] `python3 harness/checks/token-audit.py app components lib` exit 0
- [ ] `python3 harness/checks/a11y-static.py app components` exit 0
- [ ] `/foundations/iconography` shows 6 flat-vs-inked pairs; inked glyphs are visibly coloured (not blank) — confirm the `--ink` wrapper works
- [ ] Build log has no `MDX compile failed` for iconography
- [ ] `git status` clean; no files outside the in-scope list changed
- [ ] `git diff` on `components/ink-icons.generated.ts` is empty (not touched)

## STOP conditions

Stop and report (do not improvise) if:
- Any of the six Lucide components does not exist in `lucide-react@0.460`, or
  an `inkIcons` key from the table is missing — report which; do not silently
  substitute a different glyph.
- The inked glyphs render blank in the dev check — means `--ink` isn't
  resolving; report rather than hardcoding a colour (that would break TOK-1).
- `iconography.mdx` or the ink renderer differ from the excerpts (drift since `c519230`).
- token-audit flags the new component and you can't fix it by routing colour
  through `var(--…)` — do not add `tfx-waive`.

## Maintenance notes

- `brand-icon-set.tsx` carries its own copy of the ink renderer by design
  (matching readers/thumbnails). If `scripts/generate-ink-icons.mjs`'s
  `TOPIC_ICONS` mapping changes a glyph, the PAIRS table's `Lucide` component
  should change to match, or the flat/inked pair will show two different
  glyphs.
- Reviewer scrutiny: that `--ink` is actually set on the panel (the easy
  miss), 320px layout, and that the flat and inked glyph in each pair are the
  same underlying shape.
