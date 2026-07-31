# Plan 003: Add /foundations/tokens — the single all-tokens reference page

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat d2fb27a..HEAD -- content/map.json components/sidebar.tsx tests/site-contract.spec.ts content/foundations components/foundations lib/foundations components/mdx.tsx`
> Plans 001 and 002 legitimately change `content/foundations/`,
> `components/foundations/`, `lib/foundations/`, and `components/mdx.tsx` —
> those diffs are expected and REQUIRED (see Depends on). For the other
> files, compare the "Current state" excerpts before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: plans/001-colour-foundations-rebuild.md (TokenTable, colour data) AND plans/002-type-spacing-icon-specimens.md (TypeScale, SpacingScale, RadiusScale). Do not start until both show DONE in `plans/README.md`.
- **Category**: docs / direction
- **Planned at**: commit `d2fb27a`, 2026-07-16

## Why this matters

Astryx's most-used foundations surface is its "All tokens" page
(https://astryx.atmeta.com/docs/tokens): every token category on one page,
each row with a rendered preview and a copy-friendly name. The TFX site has
the token system (`app/globals.css` semantic tokens, shadcn spacing/radius
scales, the motion token set, the type scale) but no single place a builder —
human or agent — can see all of it. After plans 001/002 built the per-category
specimens, this plan composes them into one reference page and registers it
everywhere the build guard requires.

## Current state

- After plans 001/002, these MDX-registered components exist in
  `components/mdx.tsx`: `TokenTable` (semantic colour tokens, from
  `lib/foundations/colour-data.ts`), `TypeScale`, `SpacingScale`,
  `RadiusScale`, plus the pre-existing `MotionScale`. Read
  `components/mdx.tsx` and the component files to confirm names and props
  before writing MDX.

- **Adding a foundations page requires three registrations, enforced by
  `scripts/check-standards.mjs` (runs in CI and as `pnpm build` prebuild;
  build FAILS if they disagree)**:
  1. The MDX file: `content/foundations/tokens.mdx`
  2. `content/map.json` — current foundations entry:
     ```json
     "foundations": {
       "label": "Foundations",
       "slugs": ["colour", "typography", "spacing-radius", "iconography", "motion"]
     },
     ```
  3. `components/sidebar.tsx` — current foundations nav block (lines ~80-87):
     ```tsx
     href: "/foundations",
     items: [
       { href: "/foundations/colour", title: "Colour" },
       { href: "/foundations/typography", title: "Typography" },
       { href: "/foundations/spacing-radius", title: "Spacing & radius" },
       { href: "/foundations/iconography", title: "Iconography" },
       { href: "/foundations/motion", title: "Motion" },
     ],
     ```

- Routing/metadata/llms are automatic once registered:
  `app/foundations/[slug]/page.tsx` generates params from `listDocs`, and the
  llms corpus derives from the registered docs. No route file changes needed.

- `tests/site-contract.spec.ts:3-13` — the rendered-contract route list
  (single main landmark, 320/360px no-overflow). Current foundations entry:
  `{ name: "motion foundations", path: "/foundations/motion" },`

- Motion tokens for the values table (`app/globals.css:69-74`):
  `--motion-fast: 120ms; --motion-base: 200ms; --motion-slow: 300ms;
  --motion-story: 600ms; --ease-out: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);`

- Frontmatter contract (`lib/content.ts`): `title`, `description`,
  `status` ("settled" | "proposed"). This page documents the settled token
  reality but sits beside proposed colour mappings — use `status: proposed`
  (consistent with colour.mdx; the badge reads "react, don't obey").

- Copy rules: CNT-3 (second person, active voice, ≤25-word sentences),
  SLP-9, sentence case headings.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Standards gate (map/nav/file sync) | `node scripts/check-standards.mjs` | exit 0, silent |
| Typecheck / lint / tests | `pnpm typecheck && pnpm lint && pnpm test` | exit 0 |
| Full build | `pnpm build` | exit 0, no `MDX compile failed` lines |
| Rendered contract | `pnpm test:e2e` | all pass, incl. new tokens-page cases |

## Scope

**In scope**:

- `content/foundations/tokens.mdx` (create)
- `content/map.json` — add `"tokens"` to the foundations slugs
- `components/sidebar.tsx` — add the nav leaf
- `tests/site-contract.spec.ts` — add the route to the contract list
- `components/mdx.tsx`, `components/foundations/*` — ONLY if a component
  needs a small generic prop (e.g. a `compact` mode); no behavioural changes
- `plans/README.md` — status row

**Out of scope**:

- `app/globals.css`, `harness/**` — read-only sources.
- The five existing foundations pages — this page aggregates; it does not
  replace or restructure them.
- New token *categories* (elevation/shadows, z-index…): the site defines no
  such token set; documenting tokens that don't exist is invention. If the
  operator wants them, that's a globals.css change first — out of scope.
- `lib/llms.ts`, `app/foundations/[slug]/page.tsx` — automatic; don't touch.

## Git workflow

- Branch: `advisor/003-all-tokens-reference-page`
- Conventional commits, e.g. `feat(site): /foundations/tokens all-tokens reference`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Write content/foundations/tokens.mdx

Frontmatter: `title: Tokens`,
`description:` one sentence, e.g. "Every token in one place: colour, type, spacing, radius, and motion — the names code should use.",
`status: proposed`.

Body structure (short intro sentence per section, then the specimen; the
components carry the detail):

```
One page, every token. Use the token name, never the value (TOK-1).

## Colour               ← <TokenTable /> (semantic + functional site tokens)
                          + one line linking to /foundations/colour for ramps and provenance
## Type scale           ← <TypeScale />  + link to /foundations/typography
## Spacing              ← <SpacingScale /> + link to /foundations/spacing-radius
## Radius               ← <RadiusScale />
## Motion               ← markdown table of the six motion tokens + values from
                          globals.css (excerpted in Current state), a line that
                          durations/easings are never hardcoded (MOT-2 ⚑), and
                          a link to /foundations/motion for the raced specimen.
                          Do NOT embed <MotionScale /> here — one canonical home.
```

Check the actual props of `TokenTable`/`TypeScale`/`SpacingScale`/`RadiusScale`
in `components/foundations/` first and call them accordingly.

**Verify**: file exists; `node scripts/check-standards.mjs` now FAILS with an
unregistered-doc error mentioning `foundations/tokens` (proves the guard sees
it; registration comes next).

### Step 2: Register in map.json and the sidebar

- `content/map.json` foundations slugs →
  `["colour", "typography", "spacing-radius", "iconography", "motion", "tokens"]`
  (tokens last: the category pages lead, the aggregate closes the list).
- `components/sidebar.tsx` foundations items → append
  `{ href: "/foundations/tokens", title: "Tokens" },`.

**Verify**: `node scripts/check-standards.mjs` → exit 0, silent.
`pnpm typecheck && pnpm lint` → exit 0.

### Step 3: Extend the rendered contract

In `tests/site-contract.spec.ts` add to the `routes` array:
`{ name: "tokens foundations", path: "/foundations/tokens" },`
This puts the new page under the single-main-landmark and 320/360px
no-overflow gates — the page is table-heavy, exactly the overflow risk the
contract exists for.

**Verify**: `pnpm build && pnpm test:e2e` → exit 0, and the run includes
`tokens foundations` cases, all passing. If overflow fails at 320px, fix by
wrapping the offending specimen/table in `overflow-x-auto` inside the page's
components (allowed in scope), not by removing the route.

### Step 4: Full gate + index

`pnpm lint && pnpm typecheck && pnpm test && node scripts/check-standards.mjs
&& python3 harness/checks/token-audit.py app components lib &&
python3 harness/checks/a11y-static.py app components && pnpm build &&
pnpm test:e2e` — then update `plans/README.md`.

**Verify**: every command exits 0. `curl -s http://localhost:3000/foundations/tokens`
(dev server) contains "Colour", "Type scale", "Spacing", "Radius", "Motion".

## Test plan

- The extended `tests/site-contract.spec.ts` route entry IS the new test
  coverage (landmark + overflow at 320/360px for the token page).
- Everything existing stays green: `pnpm test`, `pnpm test:e2e`.

## Done criteria

ALL must hold:

- [ ] `node scripts/check-standards.mjs` exits 0 (file + map.json + sidebar in sync)
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` all exit 0
- [ ] `/foundations/tokens` renders all five sections with specimens (curl/browser check)
- [ ] `tests/site-contract.spec.ts` contains the `/foundations/tokens` route and its cases pass
- [ ] Sidebar shows "Tokens" under Foundations
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plans 001/002 are not both DONE (the components this page composes don't
  exist) — report, don't build stand-in components.
- The specimen components' props don't compose on one page without
  behavioural changes bigger than an additive optional prop.
- `check-standards.mjs` reports a sidebar/map mismatch you didn't cause
  (pre-existing drift).
- The 320px overflow failure can't be fixed with `overflow-x-auto` on the
  page's own specimens.

## Maintenance notes

- Every future token added to `app/globals.css` should appear here — the
  cheapest ratchet is extending plan 001's `SEMANTIC_TOKENS` data (the table
  reads from it). Consider (not in this plan) a completeness test that parses
  globals.css and asserts every non-demo, non-shadcn-compat token is listed.
- If MOT-2/MOT-3 or the colour proposals get settled, revisit this page's
  `status: proposed` frontmatter.
- Reviewer should scrutinize: duplicated narrative (this page should stay a
  reference — links out for the "why"), and the 320px rendering of the
  token tables.
