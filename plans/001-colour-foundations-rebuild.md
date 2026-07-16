# Plan 001: Rebuild the Colour foundations page around rendered Radix specimens

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat d2fb27a..HEAD -- content/foundations/colour.mdx content/products app/globals.css components/mdx.tsx lib/foundations components/foundations package.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (touches build-gated content and adds a dependency)
- **Depends on**: none
- **Category**: docs / direction
- **Planned at**: commit `d2fb27a`, 2026-07-16

## Why this matters

The Colour page (`content/foundations/colour.mdx`) is the weakest Foundations
page: 30 lines of prose and one markdown table, with **no rendered colour
anywhere** — a colour reference where you cannot see any colour. It also
duplicates the primaries facts that each Products page repeats. The
maintainer wants the Foundations section to work like Meta's Astryx docs
(https://astryx.atmeta.com/docs/color): token tables with rendered swatches,
12-step ramps, semantic role guidance, do/don't. This plan makes the Colour
page the single visual source of truth for colour, wires the claimed Radix
Colors provenance to the actual `@radix-ui/colors` package, and strips the
duplicated colour tables from the three Products pages (which stay, per the
maintainer's decision, as per-product *calibration* pages: identity, tone,
nuance).

## Current state

Relevant files:

- `content/foundations/colour.mdx` — the page to rebuild. Full current body:

  ```mdx
  ---
  title: Colour
  description: Colour tells teachers which product they're in and what needs their attention. Each product keeps its own primary; neutrals and status colours stay shared.
  status: proposed
  ---

  ## Product primaries

  Each destination product gets its own primary. Teacher Workspace keeps its brand blue; CaseSync and Glow draw from **Radix Colors** scales so states, tints, and dark-mode variants come for free.

  | Product | Primary | Source | Scale |
  | --- | --- | --- | --- |
  | Teacher Workspace | `#0064FF` | TW brand blue (anchor) | Custom ramp, Radix-format mapping pending |
  | CaseSync | `#3E63DD` | Radix `indigo-9` (⚑ proposed) | Radix indigo 1–12 |
  | Glow | `#F76B15` | Radix `orange-9` (⚑ proposed) | Radix orange 1–12 |
  | Posts / PG Staff Portal | TW blue | TW surfaces, no own colour | — |

  What stays shared across all products: **neutrals** (Radix `gray`/`slate`), **functional colours** (success/warning/danger from Radix `green`/`amber`/`red`, COL-2), typography, illustration style, and spacing. A product changes its accent, never its character.

  ## Why Radix scales

  Each Radix colour ships as a 12-step scale with defined roles (1–2 backgrounds, 3–5 component states, 6–8 borders, 9–10 solid, 11–12 text), automatic dark-mode pairs, and APCA-informed contrast. Picking from Radix means every product's hover, pressed, and disabled states are consistent by construction.

  ## Rules

  - Primary actions and brand moments use the product's primary (COL-1).
  - Functional colours always from the shared Radix scales, never ad-hoc (COL-2).
  - No purple/violet gradients, cyan-on-dark, glow accents, or gradient text (SLP-1, SLP-2).
  - Don't rely on colour alone: pair with text labels (accessibility baseline).
  ```

- `app/globals.css:9-114` — the real token set. Key excerpts (values you will
  surface, do not change them):

  ```css
  --tw-blue: #0064ff;        /* Teacher Workspace — brand anchor */
  --casesync: #3e63dd;       /* Radix indigo-9 (proposed) */
  --glow: #f76b15;           /* Radix orange-9 (proposed) */
  ...
  --success-9: #46a758;      /* Radix grass-9 */
  --warning-9: #ffc53d;      /* Radix amber-9 */
  --danger-9:  #e5484d;      /* Radix red-9 */
  --success: #2a7e3b;        /* Radix grass-11 — text */
  --warning: #8a5300;        /* Radix amber-11 (#ab6400) darkened → 6.1:1 on --warning-subtle. ... */
  --danger:  #ce2c31;        /* Radix red-11 — text */
  --success-subtle: color-mix(in oklab, var(--success-9) 8%, var(--surface));
  ...
  ```

  Note: the functional scales are Radix **grass/amber/red** (globals.css) while
  the MDX prose says "green/amber/red". Radix `grass` is a green scale — when
  rewriting, name the actual scales (`grass`, `amber`, `red`) and keep the
  COL-2 reference.

- `content/products/casesync.mdx`, `content/products/glow.mdx`,
  `content/products/teacher-workspace.mdx` — ~11 lines each. The duplication
  is the **Identity** line, e.g. casesync.mdx:9:

  ```
  **Identity:** own logo (the S mark) · primary from Radix `indigo` (⚑ proposed: `indigo-9` `#3E63DD`) · typography, illustration style, neutrals, and functional colours shared with the portfolio.
  ```

- `components/mdx.tsx` — the full registry of components usable in MDX bodies.
  Currently registers `MotionScale` and `OrbitLoop`. New specimen components
  must be added here (28-line file, see it before editing).

- `components/diagrams/motion-scale.tsx` — **the exemplar** for specimen
  components. Match its conventions exactly: a `<figure className="my-8 ...">`
  wrapper, an inner `rounded-lg border border-border bg-surface p-4` panel, a
  `<figcaption>` at 12px `text-muted-foreground`, values in
  `tabular-nums`, focus rings via
  `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)`.

- `lib/motion.ts` + `lib/motion.test.ts` — the exemplar for the "mirror +
  sync test" pattern: constants mirrored from `globals.css` with a unit test
  that parses the CSS and asserts the two sides match. Step 2 reuses this
  pattern for colour.

Repo conventions that apply:

- **TOK-1**: no raw colour values in style contexts. `harness/checks/token-audit.py`
  (runs in CI and `pnpm build` prebuild against `app components lib`) flags
  hex/rgb/hsl **only inside style contexts** (.css files, `css`/`styled`
  template literals) plus Tailwind palette classes (`bg-red-500`) and
  arbitrary-value utilities (`bg-[#fff]`) anywhere. The compliant specimen
  pattern is therefore: hex strings live in a **data module**
  (`lib/foundations/colour-data.ts`), components apply them via
  `style={{ background: step.value }}` (a variable, never a literal), and
  **never** via Tailwind arbitrary values. Site-chrome colours in components
  keep using semantic classes/vars as usual.
- **A11Y-1 / "don't rely on colour alone"**: every swatch renders its
  step/name and hex as visible text; colour chips themselves get `aria-hidden`
  with the information carried by adjacent text.
- **SLP-4/SLP-11**: no nested cards; specimen panels are figures, not cards in
  cards. One flat panel per figure, like MotionScale.
- **Copy rules** (CNT-3, SLP-9, `CLAUDE.md`): second person, active voice,
  sentence case, ≤25-word sentences, no AI-writing tells. Content lives in
  `content/`, page chrome in `components/` — keep prose in the MDX, keep the
  components generic.
- Comment density: files in this repo open with a short block comment stating
  the component's job and which controls constrain it. Match that.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm typecheck` | exit 0 |
| Lint | `pnpm lint` | exit 0 |
| Unit tests | `pnpm test` | all pass |
| Standards gate | `node scripts/check-standards.mjs` | exit 0, no output |
| Token audit | `python3 harness/checks/token-audit.py app components lib` | exit 0, no output |
| A11y static | `python3 harness/checks/a11y-static.py app components` | exit 0 |
| Full build (runs all prebuild gates) | `pnpm build` | exit 0 |
| Rendered contract | `pnpm test:e2e` | all pass (needs `pnpm exec playwright install chromium` once) |

## Scope

**In scope** (the only files you should modify or create):

- `package.json`, `pnpm-lock.yaml` — add `@radix-ui/colors`
- `lib/foundations/colour-data.ts` (create)
- `lib/foundations/colour-data.test.ts` (create)
- `components/foundations/color-ramp.tsx` (create)
- `components/foundations/primary-swatches.tsx` (create)
- `components/foundations/functional-colours.tsx` (create)
- `components/foundations/token-table.tsx` (create)
- `components/mdx.tsx` — register the four new components
- `content/foundations/colour.mdx` — rebuild
- `content/products/casesync.mdx`, `content/products/glow.mdx`,
  `content/products/teacher-workspace.mdx` — dedupe the Identity lines only
- `plans/README.md` — status row

**Out of scope** (do NOT touch, even though they look related):

- `app/globals.css` — you surface its values; you do not change them. Any
  mismatch you find is a STOP condition, not a fix.
- `harness/standards/catalog.yaml` and everything under `harness/` — the
  controls (COL-1/COL-2/TOK-1) are the standard; this plan documents it.
- `content/map.json`, `components/sidebar.tsx` — no pages are added or
  removed in this plan.
- `content/sections/products.mdx` — the section intro is accurate as is.
- Dark mode. The site is light-only (`app/globals.css:4-6`); do not add
  dark-mode ramp pairs even though Radix ships them.

## Git workflow

- Branch: `advisor/001-colour-foundations-rebuild` (repo convention: `advisor/NNN-slug`)
- Conventional commits, e.g. `feat(site): rendered Radix ramps on the colour foundations page` — one commit per step or logical unit.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the Radix Colors package

`pnpm add @radix-ui/colors` (runtime dependency — the data module imports it
at build time; it is plain JS objects, ~no bundle risk since only the imported
scales are bundled).

**Verify**: `node -e "const {indigo}=require('@radix-ui/colors'); console.log(indigo.indigo9)"`
→ prints `#3e63dd`. If it prints an `hsl(...)`/`oklch(...)` string or a
different hex, STOP (see STOP conditions).

### Step 2: Create the colour data module + sync test

Create `lib/foundations/colour-data.ts`. It is the **only** place specimen
colour data lives. Shape (adapt names to taste, keep the exports):

```ts
/* Colour specimen data for the Foundations pages. Hex values here are DATA
   (rendered as swatches), not UI styling — components apply them via style
   props, never as literals (TOK-1). Radix scales come from @radix-ui/colors
   so the page can never drift from the palette it claims to use; the sync
   test asserts globals.css matches. */
import { indigo, orange, grass, amber, red, gray, slate } from "@radix-ui/colors";

export type RampStep = { step: number; value: string };
export type Ramp = { name: string; steps: RampStep[] };

const toRamp = (name: string, scale: Record<string, string>): Ramp => ({
  name,
  steps: Object.entries(scale).map(([k, value]) => ({
    step: Number(k.replace(name, "")),
    value,
  })),
});

export const RAMPS = {
  indigo: toRamp("indigo", indigo),
  orange: toRamp("orange", orange),
  grass: toRamp("grass", grass),
  amber: toRamp("amber", amber),
  red: toRamp("red", red),
  gray: toRamp("gray", gray),
  slate: toRamp("slate", slate),
} as const;

/* Radix step roles — from the Radix Colors docs; also stated in colour.mdx. */
export const STEP_ROLES = [
  { steps: "1–2", role: "App and subtle backgrounds" },
  { steps: "3–5", role: "Component states: normal, hover, active" },
  { steps: "6–8", role: "Borders and separators" },
  { steps: "9–10", role: "Solid fills, primary actions" },
  { steps: "11–12", role: "Text: low-contrast and high-contrast" },
] as const;

export const PRODUCT_PRIMARIES = [
  { product: "Teacher Workspace", token: "--tw-blue", value: "#0064ff", source: "TW brand blue (anchor)", proposed: false },
  { product: "CaseSync", token: "--casesync", value: indigo.indigo9, source: "Radix indigo-9", proposed: true },
  { product: "Glow", token: "--glow", value: orange.orange9, source: "Radix orange-9", proposed: true },
] as const;
```

Also export a `SEMANTIC_TOKENS` array describing the site's own semantic
tokens for the token table (name, css var, role/description) — entries for
`--background`, `--surface`, `--foreground`, `--muted-foreground`, `--border`,
`--muted`, `--accent`, `--border-strong`, `--prose-body`, `--ring`, and the
functional set (`--success`/`--warning`/`--danger` + their `-9`, `-subtle`,
`-muted` variants). For these, the `value` field is the **var reference**
(e.g. `var(--muted-foreground)`) — the swatch chip renders the live token, so
the table can never drift from globals.css. Descriptions: paraphrase the
comments already in `app/globals.css:9-49` (they are accurate and reviewed).

Create `lib/foundations/colour-data.test.ts` modelled on `lib/motion.test.ts`
(read it first): parse `app/globals.css` with a regex per token and assert,
case-insensitively:

- `--casesync` equals `indigo.indigo9`
- `--glow` equals `orange.orange9`
- `--success-9` equals `grass.grass9`, `--warning-9` equals `amber.amber9`,
  `--danger-9` equals `red.red9`
- `--success` equals `grass.grass11`, `--danger` equals `red.red11`
- do **not** assert `--warning` against `amber.amber11` — it is deliberately
  darkened (`#8a5300`, comment at `app/globals.css:41`); instead assert it is
  exactly `#8a5300` with a comment pointing at the globals.css rationale.

**Verify**: `pnpm test` → all pass including the new file.
`pnpm typecheck` → exit 0.

### Step 3: Build the four specimen components

Create `components/foundations/` with four files. All follow the MotionScale
figure conventions (see Current state). None of them hardcodes a colour
literal — data comes in via imports from `lib/foundations/colour-data.ts` or
via CSS `var()` strings; applied with `style={{ background: ... }}`.
Server components are fine (no interactivity required); do not add
`"use client"` unless you add interactivity.

1. **`color-ramp.tsx`** — `<ColorRamp name="indigo" />` (and optional
   `caption`). Renders one Radix 12-step ramp: a single row of 12 chips
   (equal flex, ~40px tall, first/last chips rounded to match the panel,
   `aria-hidden` on the coloured chip itself), each chip with its step number
   below in 11–12px `tabular-nums` text, and the hex beneath on wider
   viewports (hide hex `max-sm:` to keep 320px overflow-free — the rendered
   e2e contract fails on horizontal overflow). Steps 1–8 are light: render
   step number in `text-muted-foreground` under the chip, not on it, so
   contrast never depends on the swatch. Under the ramp, render the
   `STEP_ROLES` bands as a small annotation row (5 spans aligned to the chip
   groups on `sm:`+, stacked list on mobile).
2. **`primary-swatches.tsx`** — `<PrimarySwatches />`. One flat panel with a
   row per `PRODUCT_PRIMARIES` entry: a large swatch (say 56×40px, rendered
   from `entry.value`), product name (500 weight), token name in `<code>`
   (e.g. `--casesync`), hex as text, source, and a `⚑ proposed` marker when
   `proposed` (match the badge treatment in `components/doc-page.tsx` —
   `border-warning-muted bg-warning-subtle text-warning` pill at 11px).
3. **`functional-colours.tsx`** — `<FunctionalColours />`. Three rows
   (success/warning/danger). Each row shows: the scale name (`Radix grass`
   etc.), the step-9 chip + hex, and a **live badge specimen** rendered with
   the site's real tokens — `bg-success-subtle border-success-muted
   text-success` (these utility classes exist via the `@theme inline` mapping
   in globals.css; check `components/doc-page.tsx` uses the warning set the
   same way) — with text like "On track" / "Needs review" / "Overdue". This
   shows the subtle/muted/text pairing doing its contrast job, which is the
   COL-2 + A11Y-1 story.
4. **`token-table.tsx`** — `<TokenTable group="core" />` (or similar prop
   selecting a slice of `SEMANTIC_TOKENS`). A table: swatch chip (24×24,
   rendered via `style={{ background: token.value }}` — for var() entries the
   browser resolves the live token), token name in `<code>` (copy-friendly),
   role text. Use a real `<table>` with a visually-hidden or plain header row;
   ensure it scrolls or wraps within 320px (wrap the table in
   `overflow-x-auto` if needed).

Register all four in `components/mdx.tsx` alongside `MotionScale`.

**Verify**: `pnpm typecheck` → exit 0. `pnpm lint` → exit 0.
`python3 harness/checks/token-audit.py app components lib` → exit 0, silent.

### Step 4: Rebuild content/foundations/colour.mdx

Rewrite the body (keep frontmatter `title` and `status: proposed`; you may
tighten `description`). Target structure — keep all existing factual claims,
now backed by rendered specimens:

```
## Product primaries          ← prose (2-3 sentences, keep existing claims) + <PrimarySwatches />
                                keep the Posts / PG Staff Portal note as one prose line
## The Radix scales           ← the "Why Radix scales" prose, tightened +
                                <ColorRamp name="indigo" caption="CaseSync — Radix indigo …" />
                                <ColorRamp name="orange" caption="Glow — Radix orange …" />
                                step-role annotation is part of the component
## Shared neutrals            ← 1-2 sentences (neutrals stay shared, Radix gray/slate) +
                                <ColorRamp name="gray" /> <ColorRamp name="slate" />
## Functional colours         ← COL-2 prose (name the real scales: grass/amber/red) +
                                <FunctionalColours />
                                one sentence on the --warning darkening (why amber-11 alone
                                fails AA on a tinted bg — source: globals.css:41 comment)
## Semantic tokens            ← 1-2 sentences ("tokens describe purpose, not appearance") +
                                <TokenTable /> for the core + functional site tokens (TOK-1)
## Rules                      ← keep the existing four bullets verbatim
```

Copy constraints: second person, active voice, sentence case headings,
≤25-word sentences (CNT-3), no buzzwords/em-dash chains (SLP-9). Where the
old page said functional colours come from "green/amber/red", write
`grass`/`amber`/`red` to match globals.css.

**Verify**: `pnpm build` → exit 0 AND the build log does **not** contain
`[doc-page] MDX compile failed for foundations/colour` (the MDX fallback
warning — grep the build output). Then `pnpm dev` in background,
`curl -s http://localhost:3000/foundations/colour | grep -c "indigo"` → ≥ 1,
and view the page if you have a browser tool: ramps, swatches, badges render;
kill the dev server after.

### Step 5: Dedupe the Products pages

Minimal edits — one line each, nothing else:

- `content/products/casesync.mdx:9` Identity line → drop the parenthetical
  colour facts, link to the colour page instead:
  `**Identity:** own logo (the S mark) · primary from Radix indigo — see [Colour](/foundations/colour) · typography, illustration style, neutrals, and functional colours shared with the portfolio.`
- `content/products/glow.mdx:9` → same treatment with Radix orange.
- `content/products/teacher-workspace.mdx` → keep its `#0064FF` claim in
  prose? No — replace `its blue (\`#0064FF\`)` with `its blue — see
  [Colour](/foundations/colour) —` so the hex lives in exactly one content
  page. Keep the rest of the sentence intact.

**Verify**: `grep -rn "3E63DD\|F76B15\|0064FF" content/products/` → no
matches. `grep -rn "foundations/colour" content/products/` → 3 matches.
`pnpm build` → exit 0.

### Step 6: Full gate + index

Run the whole battery: `pnpm lint && pnpm typecheck && pnpm test &&
node scripts/check-standards.mjs && python3 harness/checks/token-audit.py app components lib &&
python3 harness/checks/a11y-static.py app components && pnpm build && pnpm test:e2e`.

Update your row in `plans/README.md`.

**Verify**: every command exits 0.

## Test plan

- `lib/foundations/colour-data.test.ts` (new) — the globals.css ↔ Radix sync
  assertions listed in Step 2, modelled structurally on `lib/motion.test.ts`.
- Existing suites must stay green: `pnpm test`, `pnpm test:e2e` (the
  rendered contract already covers overflow at 320/360px on sampled routes;
  the colour page is not in the route list — do not add it here, plan 003
  extends that list).

## Done criteria

ALL must hold:

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` all exit 0
- [ ] `python3 harness/checks/token-audit.py app components lib` exits 0 (TOK-1 clean)
- [ ] `python3 harness/checks/a11y-static.py app components` exits 0
- [ ] Build log contains no `MDX compile failed` line for `foundations/colour`
- [ ] `/foundations/colour` renders ≥ 4 ramps, the primaries panel, the functional badges, and a semantic token table (verify via curl/browser)
- [ ] `grep -rn "3E63DD\|F76B15" content/products/` → no matches
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `@radix-ui/colors` values are not hex strings (e.g. `hsl(...)`) — the sync
  test and swatches still work, but confirm the format with the operator
  before writing comparisons, since globals.css stores hex.
- `indigo.indigo9` from the package does not equal the `#3e63dd` documented in
  globals.css, or any Step 2 assertion fails against the live globals.css — that means the site's tokens have drifted from Radix
  and the *content claim* is wrong; that is an editorial decision, not yours.
- `content/foundations/colour.mdx` or the products pages differ from the
  excerpts above (drift since `d2fb27a`).
- The token audit flags your specimen components and you cannot resolve it by
  moving data into `lib/foundations/colour-data.ts` — do not add `tfx-waive`
  markers (they fail the build by design).
- Adding the dependency changes `next build` output with warnings about
  ESM/CJS interop you cannot resolve in one attempt.

## Maintenance notes

- The sync test hard-couples `app/globals.css` to `@radix-ui/colors`. If a
  future Radix major bumps scale values, the test fails — that is the point;
  update globals.css and the catalog controls together.
- If the proposed CaseSync/Glow primaries get settled (status flag removed in
  the catalog), update `PRODUCT_PRIMARIES[].proposed` and the MDX prose.
- Plan 003 (`/foundations/tokens`) reuses `TokenTable` and the data module —
  keep their APIs generic (data in, table out).
- Reviewer should scrutinize: 320px rendering of the 12-chip ramps (the e2e
  overflow gate only samples listed routes), and that no specimen component
  ended up with a colour literal in a style context.
