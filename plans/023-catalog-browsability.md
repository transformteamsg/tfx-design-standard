# Plan 023: Catalog browsability — search, facet counts, and category grouping for the control catalog

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If any
> STOP condition occurs, stop and report — do not improvise. Do NOT update
> `plans/README.md` — your reviewer maintains the index.
>
> **Drift check (run first)**:
> `git diff --stat 7fbc703..HEAD -- components/catalog-browser.tsx app/standards/catalog/page.tsx`
> Expect no output; on drift compare the excerpts below, mismatch = STOP.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW (one client component; data flow unchanged)
- **Depends on**: none
- **Category**: dx/direction (the catalog is the standard's primary artefact)
- **Planned at**: commit `7fbc703`, 2026-07-12

## Why this matters

The control catalog is the heart of the standard — the thing tomorrow's
audience is being asked to adopt — and today its 60+ controls render as one
flat unlabelled scroll, filterable only by chips, with no way to type "SLP-3"
or "contrast" and land on the rule. Reviewers cite control IDs in reviews;
they need to find them in two keystrokes.

## Current state (verbatim excerpts from components/catalog-browser.tsx)

- `"use client"`; props `{ controls, productNames, audienceNames }`; filter
  state: `tier/category/check/product/audience` (each `string | null`),
  `copied`.
- Filtering (lines 29–37): a single `controls.filter(...)` combining the five
  facets; absent scope fields = global.
- Chips (lines 45–66): local `Chip` component, `aria-pressed`, active =
  `border-foreground bg-foreground text-white`.
- Count line (lines 114–116): `{filtered.length} of {controls.length} controls`
  — already dynamic, keep it.
- Result list (lines 118–174): one flat `flex flex-col gap-3` of bordered
  cards; each card has copy-ID button, tier/check/category/status/scope
  badges, `Details →` link to `/standards/catalog/${id}`, statement,
  `Fails when: …` line.
- `Control` type comes from `@/lib/catalog` (fields used here: `id`, `tier`,
  `category`, `check`, `status`, `products`, `audiences`, `statement`,
  `fails_when`).
- Conventions: tokens only; the focus-visible pattern
  (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)`)
  is already used on chips/buttons — reuse it; `transition-colors` only;
  Singapore English; inputs need visible or aria labels (A11Y-3).

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck / Lint / Tests | `pnpm typecheck && pnpm lint && pnpm test` | exit 0 |
| Full build | `pnpm build` | exit 0 |
| Dev | `pnpm dev --port 4023` | serves |

## Scope

**In scope**: `components/catalog-browser.tsx`. Plus `lib/catalog-filter.ts` +
`lib/catalog-filter.test.ts` (create) for the pure matching logic.

**Out of scope**: `lib/catalog.ts` (loader), `app/standards/catalog/page.tsx`
(server wiring — only touch if a prop must pass through; prefer not),
`app/standards/catalog/[id]/page.tsx`, everything else.

## Git workflow

- Worktree branch `advisor/023-catalog-browsability`; style `feat(site): …`;
  do not push.

## Steps

### Step 1: Extract pure matching — `lib/catalog-filter.ts`

Move the facet predicate into a pure function and add text matching:

```ts
export type CatalogQuery = {
  q: string;            // free text
  tier: string | null; category: string | null; check: string | null;
  product: string | null; audience: string | null;
};
export function matchesControl(c: ControlLike, query: CatalogQuery): boolean
```

Text match (case-insensitive): `q` matches when every whitespace-separated
term appears in `id`, `statement`, `category`, or any `fails_when` entry.
Empty `q` matches all. Keep the existing facet semantics byte-identical
(absent scope fields = global).

`lib/catalog-filter.test.ts` (model on `lib/catalog.test.ts`): ≥8 cases —
empty query matches; id exact + lowercase ("slp-3"); statement substring;
fails_when substring; multi-term AND; facet + text combined; global-scope
product behaviour preserved; no-match case.

**Verify**: `pnpm test` → all pass.

### Step 2: Search input + "/" shortcut

In `CatalogBrowser`: add `q` state; render above the chips a search row —
`<input type="search">` with visible placeholder `Search controls — id, rule,
fail condition`, an `aria-label="Search controls"`, width `max-w-[360px]`,
existing input styling conventions (`rounded-md border border-border
bg-surface px-3 py-1.5 text-[14px]` + the focus-visible pattern), and a clear
affordance (the native search clear is acceptable). Global "/" shortcut:
`useEffect` keydown listener — when key is `/` and the event target is not an
input/textarea/contenteditable, focus the search input and preventDefault.
Show the hint inside the row: a small `kbd`-styled `/` chip
(`rounded border border-border bg-muted px-1.5 text-[11px]`).

Filtering: `controls.filter((c) => matchesControl(c, query))`.

**Verify**: dev server — typing `slp` narrows; `/` focuses from anywhere;
typing `/` inside the input types a slash.

### Step 3: Facet counts + category grouping

1. Chip counts: each chip shows `label (n)` where `n` = controls matching the
   CURRENT query with that chip applied and its own facet dimension otherwise
   cleared (standard faceted-count semantics). Muted style when `n === 0`
   (still clickable to clear). Compute with `useMemo` over `matchesControl`.
2. Grouping: when `category === null` AND `q === ""`, render results grouped
   by category — an `h3` per category (`text-[13px] font-semibold
   text-muted-foreground` + count) above its cards, categories in catalog
   order. When searching or a category chip is active, keep today's flat list
   (relevance beats taxonomy mid-search). Card markup itself: unchanged.

**Verify**: dev — unfiltered view shows grouped sections totalling all
controls; chip counts sum correctly; zero-count chips render muted.

### Step 4: Full gate

`pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all exit 0.
agent-browser captures (`pnpm dev --port 4023`): `/standards/catalog` at 1280
(grouped), same page mid-search (`q=slp`), 360 width. Paths in NOTES.

## Test plan

`lib/catalog-filter.test.ts` per Step 1 (≥8 cases). The component itself needs
no DOM test — its render paths are exercised by the build, and all logic lives
in the tested pure function.

## Done criteria

- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0
- [ ] `lib/catalog-filter.test.ts` exists with ≥8 passing cases
- [ ] Search input labelled; `/` shortcut guarded against typing contexts
- [ ] Chip counts render; grouped view when unfiltered; flat when searching
- [ ] `{filtered.length} of {controls.length}` line still present and correct
- [ ] Card markup unchanged (diff shows no card-internal edits)
- [ ] Only in-scope files modified (`git status`)

## STOP conditions

- The excerpts don't match the live component (drift).
- The `Control` type lacks a field this plan assumes (check `lib/catalog.ts`
  read-only first; report, don't extend the loader).
- Facet-count semantics turn out ambiguous against the existing chip
  behaviour after one honest attempt — ship counts only on category chips and
  report.

## Maintenance notes

- `matchesControl` is now the single filtering truth — future facets extend
  `CatalogQuery`, not the component.
- If the catalog grows past ~100 controls, virtualise the list then (not now).
- Grouping order = catalog file order; a deliberate re-order in catalog.yaml
  will re-order the page (that is a feature, note it in review).
