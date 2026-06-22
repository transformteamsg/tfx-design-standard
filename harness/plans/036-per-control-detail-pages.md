# Plan 036: Browsable per-control detail pages + per-control `.md` twins

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **This is a website change** (the Next.js app at the repo root), NOT a harness change.
> It reads the harness's `standards/catalog.yaml` and `standards/controls/*.md` (as the
> site already does) but **changes nothing under `harness/`**.
>
> **Drift check (run first)**: `git diff --stat 7629f00..HEAD -- lib/catalog.ts lib/llms.ts "app/standards/catalog/page.tsx" components/catalog-browser.tsx lib/markdown-twin.ts components/doc-page.tsx`
> If any in-scope file changed materially, compare against "Current state" before building;
> on a mismatch, STOP.
>
> **Depends on plan 033** — it creates `lib/markdown-twin.ts` (`allTwins`/`resolveTwin`/
> `markdownResponse`/`mdPaths`) and the `.md` route. **If `lib/markdown-twin.ts` does not
> exist, STOP — land 033 first.** The per-control `.md` twins extend 033's registry.

## Status

- **Priority**: P2 (closes the "are the controls recorded on the website?" gap: the control
  *detail* bodies — rationale, pass/fail examples, evaluator guidance — are currently only in
  `/llms-full.txt`, with no browsable page and no per-control `.md`)
- **Effort**: M
- **Risk**: LOW — additive website routes reading existing files; no harness/catalog change
- **Depends on**: **plan 033** (the `.md` twin infrastructure)
- **Category**: docs / dx (publishing the standard)
- **Planned at**: commit `7629f00`, 2026-06-22

## Why this matters

The website already publishes the catalog as a filterable list (`/standards/catalog`, via
`getCatalog()`) and as YAML (`/standards/catalog.yaml`). But each control's **detail body** —
the Requirement / Rationale / Passes-Fails / How-to-verify / Evaluator-guidance that lives in
`harness/standards/controls/*.md` — surfaces **only** inside the giant `/llms-full.txt` dump.
There is no `/standards/catalog/<id>` page a human can read or link to, and no `<id>.md` twin an
agent can fetch for one control. So the richest part of the standard is the least accessible.

This plan adds a browsable page per control and a `.md` twin per control, reusing the exact
files the harness already owns (`controls/*.md`) and the twin infra from plan 033 — no new
source of truth, no duplication. After it lands, every control has a stable URL
(`/standards/catalog/a11y-7`) and a Markdown twin (`/standards/catalog/a11y-7.md`), and the
catalog browser links to them.

## Current state

- `lib/catalog.ts` — `getCatalog(): Control[]` returns `{ id, statement, tier, check, category,
  fails_when? }` for **every** catalog entry (47 today). `getPublicCatalogYaml()` is the stripped
  YAML.
- `lib/llms.ts` — `controlDetails()` reads `harness/standards/controls/*.md` with `gray-matter`,
  **strips the `refs` frontmatter**, sorts by control id, and concatenates. This is the existing
  reader to model `lib/control-detail.ts` on (but return *structured* per-control objects, not a
  single blob).
- `harness/standards/controls/*.md` — one file per control that has extended detail. **Not every
  catalog control has one** (e.g. `a11y-7.md` exists; the deterministic L0 controls A11Y-1/2/3
  have no detail file). Format (see `harness/standards/controls/a11y-7.md`): YAML frontmatter
  (`id, source, title, tier, check, phase, applies_to, verify, waiver, refs`) + a Markdown body
  with `## Requirement`, `## Rationale`, `## Passes when` / `## Fails when`, `## How to verify`,
  and (for judgment/hybrid) `## Evaluator guidance`. Filename = `<id-lowercased>.md`
  (`A11Y-7` → `a11y-7.md`).
- `app/standards/catalog/page.tsx` — server component: `metadata = { title: "Control catalog" }`;
  renders a `Breadcrumb` + a "Proposed seed" badge + intro + `<CatalogBrowser controls={getCatalog()} />`.
- `components/catalog-browser.tsx` — `"use client"`. Renders each control as a card
  (`<div id={c.id} className="… rounded-lg border …">`) with a copy-ID button, tier/check/category
  badges, `c.statement`, and `c.fails_when`. **No link to a detail page today.** Tier badge styles
  live in `tierStyles`/`tierLabels` (lines 7–16).
- `components/doc-page.tsx` — shows the MDXRemote rendering pattern for Markdown bodies
  (`<MDXRemote source={…} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />` with custom
  `h2`/`h3` from `lib/toc`'s `slugify`). Reuse this pattern to render a control body.
- `scripts/check-standards.mjs` — the build guard. Its `chromeHrefs` set (`["/standards/catalog"]`,
  line 126) is consulted **only for sidebar hrefs**. Control detail pages are NOT sidebar entries
  and NOT `content/map.json` docs, so the guard does not see them — **no change to this file is
  needed** (confirm in Done criteria).
- `lib/markdown-twin.ts` (from plan 033) — `allTwins()`, `resolveTwin(segments)`,
  `markdownResponse(text, htmlPath)`, `mdPaths()`. The `.md` catch-all route serves any twin in
  `allTwins()`.

### Repo conventions to honour

- Server components read files via the `lib/*` helpers; reuse `getCatalog()` and a new
  `lib/control-detail.ts` (modeled on `controlDetails()`), not ad-hoc `fs` calls in the page.
- Control IDs are lowercased in URLs and filenames (`A11Y-7` → `a11y-7`).
- Render Markdown bodies with the same MDXRemote + remark-gfm pattern as `DocPage`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `pnpm build` | completes; `/standards/catalog/[id]` prerendered for every control |
| Detail page (has file) | `curl -s -o /dev/null -w '%{http_code}' localhost:3000/standards/catalog/a11y-7` | `200` |
| Detail page (no file) | `curl -s -o /dev/null -w '%{http_code}' localhost:3000/standards/catalog/a11y-1` | `200` (catalog fields + "no extended detail") |
| Control `.md` twin | `curl -sI localhost:3000/standards/catalog/a11y-7.md` | `200`, `text/markdown` |
| Validator unaffected (from `harness/`) | `python3 checks/validate.py` | `OK: <n> controls valid` |

## Scope

**In scope** (create/modify):
- `lib/control-detail.ts` (create) — structured per-control reader.
- `app/standards/catalog/[id]/page.tsx` (create) — the detail page.
- `components/catalog-browser.tsx` — add a "Details" link per card to `/standards/catalog/<id>`.
- `lib/markdown-twin.ts` — extend `allTwins()` to include a twin per control (reuse 033's
  response/resolver). Confirm `/standards/catalog/<id>.md` resolves via the existing route.
- `next.config.mjs` — if the new page reads `harness/standards/**` (it does), ensure tracing
  covers `/standards/catalog/[id]` (add the route key if 033 didn't already cover it).

**Out of scope** (do NOT touch):
- The harness (`harness/**`), the catalog, control detail files — read-only.
- `scripts/check-standards.mjs` — no change needed (control pages aren't sidebar/content docs).
- Adding control pages to the sidebar — they are drill-downs from the catalog browser, like the
  `/standards/catalog` chrome page; no sidebar entry.
- The `/standards/catalog` list page's filtering UX — only add the per-card link.

## Git workflow

- Branch: `advisor/036-control-detail-pages`. Conventional commits
  (`feat(site): per-control detail pages + .md twins`). Do NOT push.

## Steps

### Step 1: `lib/control-detail.ts` — structured per-control reader

Create `lib/control-detail.ts`:
- `type ControlDetail = { id: string; slug: string; data: Record<string, unknown>; body: string
  | null }` (`slug` = lowercased id; `body` = the Markdown after frontmatter, or `null` if no
  detail file).
- `getControlDetail(id): (Control & { body: string | null }) | null` — look up the control in
  `getCatalog()` (case-insensitive on id); if not a catalog control → `null`. Then read
  `harness/standards/controls/<id-lower>.md` with `gray-matter`; if present, `body` = its content
  (strip `refs` from `data` to match `controlDetails()`); if absent, `body = null`. (Equivalently,
  you may consult the catalog entry's `detail` field — present only for controls that have a file —
  to decide whether to read; trial-read or `detail`-field both work, pick one.) Return the catalog
  fields (`id, statement, tier, check, category, fails_when`) merged with `body`.
- `listControlIds(): string[]` — `getCatalog().map(c => c.id.toLowerCase())` (for
  `generateStaticParams`).
- Resolve the controls dir as `path.join(process.cwd(), "harness", "standards", "controls")`
  (same as `lib/llms.ts:42`).

**Verify**: `pnpm build` type-checks the new module. A scratch check: `getControlDetail("a11y-7")`
returns a body containing `## Requirement`; `getControlDetail("a11y-1")` returns `body === null`
with catalog fields populated; `getControlDetail("zzz-9")` returns `null`.

### Step 2: `app/standards/catalog/[id]/page.tsx` — the detail page

Create the route (server component):
- `export function generateStaticParams() { return listControlIds().map((id) => ({ id })); }`
- `export async function generateMetadata({ params })` → `{ title: `${ID} — ${statement}` }`
  (uppercase the id for display), and spread `mdAlternate("/standards/catalog/" + id)` from
  plan 033's helper so the page advertises its `.md` twin.
- The page: `const detail = getControlDetail(id); if (!detail) notFound();` Render:
  - a `Breadcrumb` back to `/standards/catalog` (model `components/doc-page.tsx`'s use of
    `Breadcrumb`; `section = { label: "Control catalog", href: "/standards/catalog" }`,
    `current = ID`);
  - a header row with the uppercase ID, a tier badge (reuse the `tierStyles`/`tierLabels`
    styling from `catalog-browser.tsx` — extract the two maps into a tiny shared module
    `lib/tier-style.ts` and import in both, OR duplicate the two short maps; prefer extracting),
    the check type, and category;
  - `detail.statement` as the headline;
  - `detail.fails_when` if present;
  - if `detail.body`: render it via `<MDXRemote source={detail.body} options={{ mdxOptions:
    { remarkPlugins: [remarkGfm] } }} components={{ h2: …, h3: … }} />` (mirror `DocPage`); else
    a muted note: "No extended detail — this control is defined by its catalog entry above. Full
    rationale and examples are added when a control needs them."
  - a link to `/standards/catalog/<id>.md` (the Markdown twin) and to `/standards/catalog.yaml`.
- `export const dynamic = "force-static"` (match the catalog page's static posture).

**Verify**: `pnpm build` prerenders one page per control. `pnpm start`, then
`curl -s -o /dev/null -w '%{http_code}' localhost:3000/standards/catalog/a11y-7` → `200`;
`…/standards/catalog/a11y-1` → `200` with the "no extended detail" note; an unknown id
(`…/standards/catalog/zzz-9`) → `404`.

### Step 3: Link the catalog browser cards to the detail pages

In `components/catalog-browser.tsx`, inside each control card (the `<div key={c.id} id={c.id}>`
block, ~lines 96–131), add an `<a href={`/standards/catalog/${c.id.toLowerCase()}`}>` styled like
the existing in-page links (e.g. the `text-tw-blue underline underline-offset-2` style used on
`app/standards/catalog/page.tsx:29`), labelled e.g. "Details →", placed near the statement or in
the badge row. Keep the copy-ID button and anchors intact (the `id={c.id}` deep-link still works).

**Verify**: load `/standards/catalog`, confirm each card shows a "Details" link that navigates to
the matching `/standards/catalog/<id>` page; the copy button and tier filters still work.

### Step 4: Per-control `.md` twins via the plan-033 registry

In `lib/markdown-twin.ts`, extend `allTwins()` to append a twin per control:
- for each id in `listControlIds()`: `htmlPath = /standards/catalog/<id>`,
  `mdPath = /standards/catalog/<id>.md`, and `render` returns the control as Markdown — reuse
  `getControlDetail(id)`: a `# <ID> — <statement>` header, a small metadata line (tier · check ·
  category), `fails_when`, then `detail.body` if present (the canonical `controls/*.md` body) or
  the "no extended detail" note. **This is the same body the page shows — one reader, two
  surfaces.**
- Because plan 033's catch-all route serves any `allTwins()` entry, `/standards/catalog/<id>.md`
  now resolves with no new route file. (If 033 shipped the per-segment fallback instead, add
  `app/standards/catalog/[id].md/route.ts` with `generateStaticParams` from `listControlIds()`,
  reusing `resolveTwin`/`markdownResponse`.)

**Verify**: `curl -sI localhost:3000/standards/catalog/a11y-7.md` → `200`, `text/markdown`;
body contains `## Requirement`. `curl -s localhost:3000/standards/catalog/a11y-1.md` → header +
"no extended detail" note (no traceback). `curl -s localhost:3000/llms.txt | grep -c
'/standards/catalog/'` → ≥ 1 (the index already links the catalog; control twins need not all be
listed in the index — that would bloat it; the catalog `.md` + page links are the entry points).

### Step 5: Tracing

If `app/standards/catalog/[id]/page.tsx` (and the extended twin) read `harness/standards/**`
(they do, via `getCatalog`/`getControlDetail`), ensure `next.config.mjs`
`outputFileTracingIncludes` covers the new page route, e.g.
`"/standards/catalog/[id]": ["./harness/standards/**/*"]`. (Plan 033 already added tracing for
the `.md` route; this covers the HTML detail page.)

**Verify**: `pnpm build` passes; a production `pnpm start` serves the detail pages (proves the
control files were traced into the build).

## Test plan

- Build + `curl` (repo convention for these server routes; no unit framework).
- Coverage: `for id in $(cd harness/standards/controls && ls *.md | sed 's/.md//'); do echo
  "$(curl -s -o /dev/null -w '%{http_code}' localhost:3000/standards/catalog/$id) $id"; done`
  → all `200` (every control with a detail file has a page).
- Plus a spot-check of a detail-less control (`a11y-1`) → `200` with the note.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm build` prerenders `/standards/catalog/<id>` for **every** catalog control (count matches `getCatalog().length`)
- [ ] `/standards/catalog/a11y-7` renders the `controls/a11y-7.md` body; `/standards/catalog/a11y-1` renders catalog fields + "no extended detail"
- [ ] `/standards/catalog/a11y-7.md` returns `200` `text/markdown` with the same body as the page
- [ ] An unknown id (`/standards/catalog/zzz-9`) → `404`
- [ ] The catalog browser links each control to its detail page; copy-ID + filters still work
- [ ] `lib/control-detail.ts` is the only new reader; no `fs` calls added in the page component
- [ ] `python3 checks/validate.py` → `OK` (unchanged); `scripts/check-standards.mjs` unmodified and `pnpm build` prebuild passes
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- `lib/markdown-twin.ts` does not exist (plan 033 not landed) — this plan extends it.
- A control body fails to render via MDXRemote (e.g. it contains a JSX-like token MDX chokes on)
  — control bodies are plain Markdown; if one breaks, fall back to rendering it as a fenced/preformatted
  block and NOTE it rather than shipping a broken page.
- `getControlDetail` would need to invent content for a detail-less control — it must NOT; show
  the catalog fields + the honest "no extended detail" note, never fabricated rationale.

## Maintenance notes

- One reader (`getControlDetail`), two surfaces (the HTML page + the `.md` twin) — keep them
  sharing it so they can't diverge. The canonical body is always `harness/standards/controls/<id>.md`.
- When a new detail file is added to the harness, its page + twin appear automatically (the route
  enumerates `getCatalog()`); no website change needed.
- A reviewer should confirm the page renders **every** catalog control (not just those with a
  detail file) and that the detail-less note is honest, never fabricated.
- Deferred: surfacing the per-control `.md` links inside `/llms.txt` (the catalog `.md` + page
  links suffice; listing all ~47 would bloat the index).
