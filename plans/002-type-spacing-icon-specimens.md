# Plan 002: Add rendered specimens to the Typography, Spacing & radius, and Iconography pages

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat d2fb27a..HEAD -- content/foundations/typography.mdx content/foundations/spacing-radius.mdx content/foundations/iconography.mdx components/mdx.tsx components/foundations lib/foundations`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. (Plan 001 legitimately creates
> `components/foundations/` and touches `components/mdx.tsx` — those diffs are
> expected if 001 has landed; read the live files before editing them.)

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (soft: follows plan 001's `components/foundations/` conventions if it has landed; both orders work)
- **Category**: docs
- **Planned at**: commit `d2fb27a`, 2026-07-16

## Why this matters

Three of the five Foundations pages describe visual material without showing
any of it: the type scale is a markdown table (you never see Plus Jakarta
Sans or Inter rendered at scale sizes), the spacing/radius page shows no
spacing and no radii, and the iconography page names Lucide without showing a
single icon. The maintainer wants Astryx-style foundations
(https://astryx.atmeta.com/docs/tokens): every token row carries a rendered
preview. Motion already does this right (`<MotionScale />`); this plan brings
the other three pages up to that bar.

## Current state

Relevant files:

- `content/foundations/typography.mdx` — frontmatter `status: settled`. Body:
  a two-row font table (Plus Jakarta Sans display 600 / Inter body
  400-500-600), a type-scale table, and Do/Don't prose. The scale (keep these
  values exactly — they are the standard, TYP-3):

  | Step | Size | Font |
  | --- | --- | --- |
  | Display | 120 / 96 / 72 / 48px | Plus Jakarta Sans 600 |
  | Heading 1 | 32px | Plus Jakarta Sans 600 |
  | Heading 2 | 24px | Plus Jakarta Sans 600 |
  | Heading 3 | 20px | Plus Jakarta Sans 600 |
  | Body Large | 18px | Inter 400 |
  | Body | 16px | Inter 400 |
  | Body Small | 14px | Inter 400 |
  | Caption | 12px | Inter 500 |
  | Label | 11px | Inter 600, sentence case |

- `content/foundations/spacing-radius.mdx` — `status: settled`. 18 lines. Key
  claims: spacing/radius/elevation are the **shadcn/ui default token scales,
  deliberately unmodified** (TOK-2, TOK-3); rhythm guidance (SLP-7); radius
  guidance (cards top out 12–16px, full-pill for tags/buttons, child radius ≤
  parent, concentric).

- `content/foundations/iconography.mdx` — `status: proposed`, has a `tools:`
  frontmatter block (renders a ToolCard — keep it). Claims: UI icons are
  **Lucide**, brand icons come from the internal Icon Generator, three rules
  (aria-labels, icons beside meaning not above it (SLP-5), stroke matches
  text weight).

- `components/mdx.tsx` — component registry for MDX bodies (28 lines; plan
  001 may have extended it). Add new components here.

- `components/diagrams/motion-scale.tsx` — **the exemplar** specimen:
  `<figure className="my-8 ...">` wrapper, inner
  `rounded-lg border border-border bg-surface p-4` panel, `<figcaption>` at
  12px `text-muted-foreground`, `tabular-nums` for values.

- `lucide-react@^0.460.0` is already a dependency (used in site chrome).

- Font tokens (`app/globals.css:166-167`):
  `--font-display: "Plus Jakarta Sans Variable", ...` /
  `--font-body: "Inter Variable", ...`, exposed as Tailwind `font-display` /
  `font-body`(check `@theme` mapping; `font-display` is used in
  `components/section-index.tsx:24`).

Constraints verified against the harness checkers (these shape the component
code — violating them fails `pnpm build`):

- **TYP-3/TYP-4 vs specimens**: `harness/checks/a11y-static.py` and the type
  rules apply to site chrome; a *specimen that renders the scale itself* is
  the documentation of that scale. Set specimen sizes via
  `style={{ fontSize: row.px }}` from a data array — same pattern as colour
  swatches (data, not chrome styling). Do not use off-scale Tailwind
  arbitrary text classes like `text-[19px]`.
- **TOK-2 (token-audit)**: flags `margin/padding/gap/top/left/right/bottom`
  with off-scale px/rem. The spacing specimen renders **bar widths**
  (`width` is not a flagged property) — set bar length via
  `style={{ width: px }}`; never demonstrate spacing by giving an element
  off-scale padding.
- **TOK-3 (token-audit)**: flags `border-radius` with off-scale values. The
  radius specimen only renders on-scale radii {0,2,4,6,8,12,16,24,9999}px, so
  literal `style={{ borderRadius: r }}` from the data array passes.
- **A11Y-3 territory**: decorative specimen icons get `aria-hidden`; each
  icon's name is adjacent visible text, so nothing relies on the glyph.
- 320px viewport must not overflow horizontally (rendered e2e contract
  pattern) — grids wrap, tables get `overflow-x-auto`.
- Copy rules for any prose you touch: CNT-3 (second person, active, ≤25-word
  sentences), SLP-9, sentence case.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `pnpm typecheck` | exit 0 |
| Lint | `pnpm lint` | exit 0 |
| Unit tests | `pnpm test` | all pass |
| Standards gate | `node scripts/check-standards.mjs` | exit 0 |
| Token audit | `python3 harness/checks/token-audit.py app components lib` | exit 0, silent |
| A11y static | `python3 harness/checks/a11y-static.py app components` | exit 0 |
| Full build | `pnpm build` | exit 0, no `MDX compile failed` lines |
| Rendered contract | `pnpm test:e2e` | all pass |

## Scope

**In scope**:

- `components/foundations/type-scale.tsx` (create)
- `components/foundations/spacing-scale.tsx` (create)
- `components/foundations/radius-scale.tsx` (create)
- `components/foundations/icon-set.tsx` (create)
- `lib/foundations/type-data.ts` (create — the scale rows as data)
- `components/mdx.tsx` — register the new components
- `content/foundations/typography.mdx`, `content/foundations/spacing-radius.mdx`,
  `content/foundations/iconography.mdx` — embed specimens, keep claims
- `plans/README.md` — status row

**Out of scope**:

- `content/foundations/motion.mdx` and `components/diagrams/motion-scale.tsx`
  — already at the bar; leave them alone.
- `content/foundations/colour.mdx` — plan 001's territory.
- `app/globals.css`, anything under `harness/` — read-only references.
- Adding pages, nav entries, or `content/map.json` changes — nothing is
  added or removed here, only enriched in place.
- The Icon Generator tool/repo (external).

## Git workflow

- Branch: `advisor/002-type-spacing-icon-specimens`
- Conventional commits, e.g. `feat(site): rendered type-scale specimen on the typography page`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Type-scale data + specimen

Create `lib/foundations/type-data.ts` exporting the scale table as data:
`{ step: "Heading 1", px: 32, font: "display" | "body", weight: 600, note?: string }`
— one row per scale entry from the table in Current state. For Display,
one row at 48px with `note: "Also 72 / 96 / 120px for landing surfaces."`
(rendering 120px inside a 720px column breaks layout; the note carries the
other sizes).

Create `components/foundations/type-scale.tsx` — `<TypeScale />`. One flat
panel; for each row: the rendered sample (e.g. the phrase
`Give teachers their time back`) at `style={{ fontSize: px, fontWeight,
fontFamily: var per font role }}` with `font-display`/`font-body` classes
where possible, and a metadata line under/beside it: step name, `{px}px`,
font + weight in 12px `text-muted-foreground tabular-nums`. Label row renders
in sentence case (TYP-4 — no all-caps sample). Long samples must truncate or
wrap without horizontal overflow at 320px.

Also add a small **two-font specimen** at the top of the same component or as
a second export `<FontRoles />`: Plus Jakarta Sans sample line + Inter sample
line with their role/weights — this replaces the current two-row font table's
job visually (keep the table's "Why" prose in MDX).

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 2: Spacing + radius specimens

`components/foundations/spacing-scale.tsx` — `<SpacingScale />`: the shadcn
spacing scale as labelled bars. Data inline in the component:
`[0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96]`
px (this is the scale `harness/checks/token-audit.py` enforces — its
`SPACING_SCALE_PX` set, minus the ≥112 tail; render up to 96 and say the
scale continues 112/128). Each row: Tailwind step name (`px value ÷ 4`, e.g.
16px → `4`), the px value (`tabular-nums`), and a bar of that width rendered
via `style={{ width: px }}` on a `bg-tw-blue`-tinted or `bg-muted` fill.
Skip the 0 row or render it as a hairline with a note.

`components/foundations/radius-scale.tsx` — `<RadiusScale />`: one row of
squares (~56px), each with `style={{ borderRadius: r }}` for
`[0, 2, 4, 6, 8, 12, 16, 24, 9999]` (on-scale, passes TOK-3), the value
labelled beneath in 12px `tabular-nums` (`9999` labelled `full`). Squares get
`border border-border bg-muted`; wrap on small viewports.

**Verify**: `python3 harness/checks/token-audit.py app components lib` →
exit 0, silent (proves the specimen values read as on-scale).

### Step 3: Icon specimen

`components/foundations/icon-set.tsx` — `<IconSet />`: a wrapping grid of
~12 Lucide icons that exist in `lucide-react@0.460` and are plausible in a
teacher product — e.g. `Calendar`, `ClipboardList`, `GraduationCap`,
`MessageSquare`, `Bell`, `Search`, `Settings`, `Users`, `FileText`,
`CheckCircle2`, `AlertTriangle`, `ChevronRight`. Each cell: the icon at 20px
with `aria-hidden`, its kebab-case Lucide name beneath in 11–12px
`text-muted-foreground` (visible text carries the meaning). Under the grid,
one caption line noting the standard usage: 16/20/24px sizes, stroke ~2px,
`currentColor`. Static content — no card-per-icon chrome (SLP-11): flat grid
inside the single figure panel.

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 4: Register + embed in the three MDX pages

Register `TypeScale` (+ `FontRoles` if separate), `SpacingScale`,
`RadiusScale`, `IconSet` in `components/mdx.tsx`.

- `typography.mdx`: keep frontmatter and all claims. Replace the two markdown
  tables with `<FontRoles />` + prose and `<TypeScale />` (the data now
  renders what the tables listed — do not lose the "Why" column's content;
  fold it into short prose). Keep the Usage Do/Don't section.
- `spacing-radius.mdx`: keep all prose. Insert `<SpacingScale />` after the
  shadcn-scale paragraph and `<RadiusScale />` under the Radius heading.
- `iconography.mdx`: keep frontmatter incl. `tools:` block and all rules.
  Insert `<IconSet />` under the "UI icons — Lucide" section.

**Verify**: `pnpm build` → exit 0 and no `MDX compile failed` for any
foundations page. Start `pnpm dev`, then:
`curl -s http://localhost:3000/foundations/typography | grep -c "px"` → ≥ 9;
`curl -s http://localhost:3000/foundations/iconography | grep -ci "svg"` → ≥ 12.
Kill the dev server.

### Step 5: Full gate + index

`pnpm lint && pnpm typecheck && pnpm test && node scripts/check-standards.mjs
&& python3 harness/checks/token-audit.py app components lib &&
python3 harness/checks/a11y-static.py app components && pnpm build &&
pnpm test:e2e` — then update `plans/README.md`.

**Verify**: every command exits 0.

## Test plan

- No new unit tests required (the specimens are static data renders; the
  motion specimen has none either). The gates that matter: token-audit,
  a11y-static, build, and the rendered e2e contract staying green.
- If plan 001 landed first, its `lib/foundations/colour-data.test.ts` must
  still pass untouched.

## Done criteria

ALL must hold:

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` all exit 0
- [ ] `python3 harness/checks/token-audit.py app components lib` exits 0
- [ ] `python3 harness/checks/a11y-static.py app components` exits 0
- [ ] `/foundations/typography` renders every scale step at true size with metadata (curl/browser check)
- [ ] `/foundations/spacing-radius` renders the spacing bars and the radius squares
- [ ] `/foundations/iconography` renders ≥ 12 named Lucide icons
- [ ] No factual claim from the three pages was dropped (diff the MDX prose against the excerpts/claims in Current state)
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any named Lucide icon does not exist in `lucide-react@0.460` and you cannot
  find an obvious same-meaning substitute in one attempt.
- `token-audit.py` flags the specimen components after you have followed the
  width/borderRadius patterns above — do not add `tfx-waive` markers.
- The three MDX files differ materially from the claims quoted in Current
  state (drift since `d2fb27a`).
- Rendering the type specimen forces horizontal overflow at 320px that
  truncation/wrapping cannot fix inside the figure panel.
- `components/mdx.tsx` conflicts with a landed plan-001 version you cannot
  merge trivially (both plans append registrations — a trivial merge).

## Maintenance notes

- The type-scale data in `lib/foundations/type-data.ts` mirrors the TYP-3
  scale. If the catalog ever changes the scale, update data + MDX together —
  consider a sync test against `harness/standards/controls/typ-3.md` then.
- The spacing values mirror `SPACING_SCALE_PX` in
  `harness/checks/token-audit.py`; same coupling note.
- Plan 003 (`/foundations/tokens`) reuses `SpacingScale`, `RadiusScale`, and
  `TypeScale` — keep props generic.
- Reviewer should scrutinize: no lost claims in the MDX rewrite, 320px
  behaviour of the type specimen, sentence-case Label sample (TYP-4).
