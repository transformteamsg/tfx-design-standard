# Plan 033: A faithful Markdown twin (`.md`) for every page + a curated `/llms.txt` index

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **This is a website change** (the Next.js app at the repo/worktree root), NOT a
> harness change. All paths below are from the repo root (where `package.json` lives).
> The harness lives under `harness/`; you do not touch it in this plan.
>
> **Drift check (run first)**: `git diff --stat 7629f00..HEAD -- lib/llms.ts lib/content.ts lib/catalog.ts lib/content-map.ts content/map.json next.config.mjs app/llms.txt/route.ts app/llms-full.txt/route.ts "app/guidelines/[slug]/page.tsx" content/guidelines/product-icons.mdx content/sections/for-agents.mdx`
> If any in-scope file changed materially, compare against "Current state" before building;
> on a mismatch, STOP.

## Status

- **Priority**: P1 (the user's explicit ask: switch from the llms.txt-only approach to a
  per-page `.md` twin, like Claude docs)
- **Effort**: L
- **Risk**: MED — the load-bearing risk is the **routing mechanism** (a `.md` catch-all route
  handler coexisting with the existing page routes in Next 15). The plan ships a primary
  mechanism with a built-in build-time conflict check and a deterministic fallback.
- **Depends on**: none. **Enables**: plan 036 (per-control `.md` twins reuse this infra).
- **Category**: dx / docs (agent-readable content)
- **Planned at**: commit `7629f00`, 2026-06-22

## Why this matters

Today the standard exposes exactly two machine surfaces: `/llms.txt` (which `lib/llms.ts`
builds as a **full concatenation** of every MDX body + the public catalog YAML) and
`/llms-full.txt` (that, plus per-control detail bodies). There is **no per-page Markdown twin**:
an agent that lands on `/guidelines/voice-tone` cannot fetch a clean Markdown version of just
that page — it must download the whole site or scrape HTML. Claude docs and the llms.txt
convention solve this with three layers: a curated **index** (`/llms.txt`), a full
**concatenation** (`/llms-full.txt`), and a **`.md` twin per page** (`/path.md`).

This is cheap here because `lib/content.ts`'s `getDoc()` already returns the **raw MDX body**
(`doc.content`) — the twin is "frontmatter-derived header + the raw body," no HTML→Markdown
conversion. The plan: (1) serve a faithful `.md` for every page, (2) reshape `/llms.txt` into a
proper curated index that links each page's `.md`, and (3) keep `/llms-full.txt` as the full
dump. Net: agents get fine-grained, token-cheap, faithful page content, and the index tells
them what exists.

## Current state

- **`lib/content.ts`** — `getDoc(section, slug)` returns
  `{ slug, section, title, description?, status?, answers?, illustration?, data, content }`
  where `content` is the **raw MDX body** (frontmatter stripped by `gray-matter`).
  `listDocs(section)` lists a section's docs.
- **`lib/content-map.ts`** — exports `contentMap: Record<string, {label, slugs, root?}>` from
  `content/map.json`. Sections: `principles`, `standards` (slugs: `[]`), `guidelines`,
  `foundations`, `products`, `harness`, `governance` (`root: true`).
- **`lib/catalog.ts`** — `getCatalog(): Control[]` (`{id, statement, tier, check, category,
  fails_when?}`) and `getPublicCatalogYaml(): string` (the stripped YAML served at
  `/standards/catalog.yaml`).
- **`lib/llms.ts`** — `section(label, text)` wraps a block as `\n\n## ===== LABEL =====\n\n…`;
  `llmsBody()` iterates `contentMap`, special-cases `standards` → `getPublicCatalogYaml()`, and
  for every other slug reads `content/<key>/<slug>.mdx` raw and wraps it; `controlDetails()`
  reads `harness/standards/controls/*.md`. **`llmsBody()` is the full dump.**
- **Route handlers** (the convention to copy): `app/llms.txt/route.ts` and
  `app/llms-full.txt/route.ts` both `export const dynamic = "force-static"` and `GET()` returns
  a `new Response(text, { headers: { "content-type": "text/plain; charset=utf-8" } })`.
  `app/standards/catalog.yaml/route.ts` is the same shape with `text/yaml`. **The `/llms.txt`
  route currently returns a `# …` comment header + `llmsBody()`.**
- **Page routes** — dynamic doc sections at `app/{principles,guidelines,foundations,products,
  harness}/[slug]/page.tsx` (each: `generateStaticParams` from `listDocs`, `generateMetadata`
  returning `{ title }`, render `<DocPage doc={…} />`); section index pages
  `app/{…}/page.tsx`; singletons `app/page.tsx` (landing, `content/sections/landing.mdx`),
  `app/overview/page.tsx` (`content/sections/home.mdx`), `app/how-to-read/page.tsx`,
  `app/for-agents/page.tsx`, `app/governance/page.tsx`, `app/standards/page.tsx`,
  `app/standards/catalog/page.tsx`. **There is no `app/[...]` catch-all today.**
- **Section MDX sources** live in `content/sections/<name>.mdx`: `landing`, `home`,
  `how-to-read`, `for-agents`, `foundations`, `guidelines`, `harness`, `principles`, `products`,
  `standards`. (So a section index's twin reads `content/sections/<section>.mdx`.)
- **MDX faithfulness reality** (verified by grep over `content/**/*.mdx`): the **only** file
  with real JSX/HTML in its body is `content/guidelines/product-icons.mdx` — a
  `<div style={{…}}>` of `<a>/<img>/<span>` product-icon lockups (lines ~14–27) and a
  `<figure><svg …>…</svg></figure>` construction grid (lines ~41–52), both with `style={{…}}`
  JSX-expression attributes. Every other `<…>` hit in content (`<ID>`, `<Link>`, `<button>`,
  `<specific …>`) is **inside backtick code spans** — literal text to preserve verbatim.
  `<Illo>` never appears in a body (pages inject it from frontmatter), so `doc.content` never
  contains it.
- **`components/doc-page.tsx`** renders `doc.content` via `MDXRemote` with custom `h2`/`h3` and
  a `tools` frontmatter array → `ToolCard`. (Relevant only so you know the HTML page is
  unaffected; the `.md` twin serves `doc.content` directly, not through MDXRemote.)
- **`next.config.mjs`** — `outputFileTracingIncludes` lists `/llms.txt`, `/llms-full.txt`,
  `/standards/catalog.yaml` → `["./content/**/*", "./harness/standards/**/*"]`. New fs-reading
  routes must be added here or their files won't bundle on deploy.
- **`content/sections/for-agents.mdx`** — the `/for-agents` page. It currently says "/llms.txt …
  the whole standard, flattened for context windows" and "Paste `/llms.txt` into your AI tool's
  context." This framing changes (see Step 5).

### Repo conventions to honour

- Route handlers: `export const dynamic = "force-static"`; `GET` returns a `Response` with an
  explicit `content-type`. TypeScript, `@/`-aliased imports.
- Reuse `getDoc`/`getCatalog`/`getPublicCatalogYaml`/`contentMap` — do not re-read files ad hoc.
- The twin must be **honest**: agents must never see broken JSX, and a page with little prose
  yields a thin (but truthful) twin.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build (prebuild + static gen) | `pnpm build` | completes; `.md` routes appear as prerendered, not ƒ/dynamic |
| Serve the build | `pnpm start` (after build) | server on `localhost:3000` |
| Twin reachable | `curl -sI localhost:3000/guidelines/voice-tone.md` | `200`, `content-type: text/markdown; charset=utf-8` |
| Index valid | `curl -s localhost:3000/llms.txt \| head -5` | starts with one `# ` H1 + a `> ` blockquote |
| HTML route intact | `curl -s -o /dev/null -w '%{http_code}' localhost:3000/guidelines/voice-tone` | `200` (still HTML) |

## Scope

**In scope** (create/modify):
- `lib/markdown-twin.ts` (create) — the twin registry + renderer + resolver + response helper.
- `app/[...path]/route.ts` (create) — the `.md` catch-all route handler (primary mechanism).
  *(Fallback: per-segment `.md` route folders — see Step 2.)*
- `lib/llms.ts` — add `llmsIndex()`; keep `llmsBody()`/`controlDetails()`.
- `app/llms.txt/route.ts` — return `llmsIndex()` as `text/markdown`.
- The page metadata files (add `alternates` markdown link) — see Step 4.
- `content/sections/for-agents.mdx` — document the `.md` convention + the index/full split.
- `next.config.mjs` — add tracing for the new route(s) (+ sitemap if added).
- `app/sitemap.ts` (create, recommended) — HTML URLs only.

**Out of scope** (do NOT touch):
- `app/llms-full.txt/route.ts` — its full-dump behavior stays; verify only.
- The harness (`harness/**`) — this is website-only.
- The MDX→HTML rendering in `components/doc-page.tsx` — the HTML pages are unchanged.
- Per-control `.md` twins (`/standards/catalog/<id>.md`) — that is **plan 036**, which reuses
  this plan's `lib/markdown-twin.ts`. Add a hook comment, but do not build control pages here.
- Content-negotiation via the `Accept` header — deferred; the `.md` suffix is the v1 surface.

## Git workflow

- Branch: `advisor/033-markdown-twins`. Conventional commits
  (`feat(site): per-page .md twins + curated llms.txt index`). Do NOT push.

## Steps

### Step 1: Build `lib/markdown-twin.ts` — the twin registry, renderer, resolver

Create `lib/markdown-twin.ts` as the **single source** of which `.md` URLs exist and how each
renders, so the route, `generateStaticParams`, the llms index, and the sitemap all agree.

- `type Twin = { mdPath: string; htmlPath: string; title: string; description?: string;
  render: () => string }`.
- `allTwins(): Twin[]` — assemble from:
  - **Dynamic docs**: for each non-`root` section in `contentMap` with slugs, each slug →
    `getDoc(section, slug)`; `htmlPath = /${section}/${slug}`, `mdPath = ${htmlPath}.md`.
  - **Section indexes**: each section key (incl. `standards`) → `getDoc("sections", section)` if
    that MDX exists; `htmlPath = /${section}`, `mdPath = /${section}.md`.
  - **Singletons** (a small explicit table mapping html path → sections-mdx slug):
    `/` → `landing` (`mdPath = /index.md`), `/overview` → `home`, `/how-to-read` →
    `how-to-read`, `/for-agents` → `for-agents`, `/governance` → `getDoc("governance",
    "governance")`.
  - **Catalog**: `htmlPath = /standards/catalog`, `mdPath = /standards/catalog.md`,
    `render` = the catalog markdown from Step 3.
- `toMarkdown(title, description, body): string` →
  `` `# ${title}\n\n` `` + (description ? `> ${description}\n\n` : "") + `stripJsx(body)`.
- `stripJsx(body): string` — **code-span/fence-aware** block stripper (see Step 2 detail):
  outside fenced code blocks and inline-code spans, replace any JSX/HTML element block (a line
  beginning with `<Tag` through its matching close, incl. self-closing) with a single honest
  placeholder line, and convert informative `<img … alt="…" src="…">` to `![alt](src)` where
  trivially possible. Inside code fences/spans, leave bytes untouched.
- `resolveTwin(segments: string[]): Twin | null` — join segments, require a trailing `.md`,
  strip it, match against `allTwins()` by `mdPath` (compare with and without the `.md`).
- `mdPaths(): string[]` — every `mdPath` (for `generateStaticParams` + sitemap).
- `markdownResponse(text): Response` — `new Response(text, { headers })` with
  `content-type: text/markdown; charset=utf-8`, `vary: Accept`, `x-robots-tag: noindex`,
  `cache-control: public, max-age=3600, stale-while-revalidate=86400`, and a `link:
  <${htmlPath}>; rel="canonical"` (pass the html path in).

**Verify**: `pnpm build` compiles `lib/markdown-twin.ts` with no type errors (it's imported in
Step 2). A scratch unit check (Node REPL or a temporary test route) that `allTwins()` includes
`/guidelines/voice-tone.md` and `/standards/catalog.md` and that `mdPaths().length` ≥ the number
of registered docs + sections + singletons + 1.

### Step 2: Add the `.md` route (it must bypass the section page routes)

**The routing reality you MUST design around (this is the load-bearing risk — verified by
review):** the existing dynamic page routes `app/{section}/[slug]/page.tsx` match a *single*
segment, so a request to `/guidelines/voice-tone.md` matches `[slug]` with `slug="voice-tone.md"`,
is **claimed by that page route** (it's more specific than a root catch-all), finds no such doc,
and returns **404** — the root catch-all never runs. Critically, **this produces NO build error**;
it fails as a *silent runtime 404* on section paths. So a bare root `app/[...path]/route.ts`
catch-all is **NOT reliable** here. Use a mechanism that runs **before** page-route matching, and
gate on a runtime test of a *section* `.md` (below), not on the build passing.

**Primary — `middleware.ts` rewrite into a namespace with no page routes** (middleware runs
before routing, so it cannot be shadowed):
```ts
// middleware.ts (repo root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.endsWith(".md")) {
    const url = req.nextUrl.clone();
    url.pathname = "/_md" + pathname;        // route into /_md/**, which has no page.tsx
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}
export const config = { matcher: "/((?!_next|_md|favicon).*)" };
```
and the handler `app/_md/[...path]/route.ts` (force-static; `generateStaticParams` from
`mdPaths()`, but producing the path *after* the `/_md` prefix so the right set prerenders):
```ts
import { notFound } from "next/navigation";
import { resolveTwin, mdPaths, markdownResponse } from "@/lib/markdown-twin";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return mdPaths().map((p) => ({ path: p.replace(/^\//, "").split("/") }));
}
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;            // e.g. ["guidelines","voice-tone.md"]
  const twin = resolveTwin(path);
  if (!twin) notFound();
  return markdownResponse(twin.render(), twin.htmlPath);
}
```
Because `/_md/**` has no `page.tsx`, nothing shadows it; the middleware sends every `*.md` request
there. (If the prerender params don't line up with the rewritten path, the runtime gate below will
catch it — adjust the slice and re-test.)

**Robust alternative — generate static `.md` into `public/` at build** (zero routing logic, most
bulletproof): a `scripts/generate-md-twins.mjs` (plain Node + `gray-matter`, already a dep; model
on `scripts/check-standards.mjs`) reads `content/**` + `harness/standards/**`, renders each twin
(the same `toMarkdown` header + `stripJsx(body)` + the catalog table), and writes
`public/<path>.md`; add it to `package.json` `prebuild`. A file at `public/guidelines/voice-tone.md`
is served verbatim at `/guidelines/voice-tone.md`. This duplicates the render logic in JS (so you
may skip `lib/markdown-twin.ts`'s route role) — pick it if the middleware route proves fiddly.

**Explicit literal route handlers** work for the **singletons** that have no competing `[slug]`
page (e.g. `app/overview.md/route.ts`, `app/standards/catalog.md/route.ts` — the existing
`app/llms.txt/route.ts` proves a literal-extension folder routes). They do **not** solve the
*section* twins: a folder named `app/{section}/[slug].md/` is not a valid dynamic segment, and
`app/{section}/[slug]/route.ts` collides with the existing `page.tsx`. That is why sections need
the middleware (or `public/`) mechanism.

**Decisive gate (a build pass is NOT enough — run this):** after `pnpm build && pnpm start`,
`curl -s -o /dev/null -w '%{http_code}' localhost:3000/guidelines/voice-tone.md` MUST be `200`
with `content-type: text/markdown` — a *section* path, the exact case the precedence bug breaks.
If it returns `404` or HTML, the mechanism is being shadowed → switch to another mechanism above
and re-test. **Do not proceed until a section `.md` serves correctly.**

**stripJsx detail** — the only body JSX in the corpus is `content/guidelines/product-icons.mdx`
(a `<div>` of `<a><img/><span>` lockups and a `<figure><svg>…</svg></figure>` grid). The
stripper must: (a) never alter text inside ```` ``` ```` fences or `` `…` `` inline code (the
`<ID>`/`<Link>`/`<button>` literals must survive); (b) turn the icon `<img alt="…" src="…">`
into `![alt](src)`; (c) replace the `<svg>` construction grid with
`*(diagram omitted — view at <htmlPath>)*`. Keep it conservative: if a block can't be safely
converted, emit the placeholder, never raw JSX.

**Verify**: `pnpm build` succeeds; in the build output the `.md` routes are **prerendered**
(static), not dynamic. `pnpm start`, then:
- `curl -s localhost:3000/guidelines/product-icons.md | grep -nE '<(div|svg|figure|span|img)\b'`
  → **no matches** (no raw JSX leaked).
- `curl -s localhost:3000/guidelines/web-interface.md | grep -F '<button>'` → still matches
  (code-span literal preserved).
- `curl -s -o /dev/null -w '%{http_code}' localhost:3000/nonsense.md` → `404`.

### Step 3: `/standards/catalog.md` content

In `lib/markdown-twin.ts`, the catalog twin's `render` returns a faithful, readable Markdown
document (not a bare YAML dump under a `.md` name): a Markdown **table** built from `getCatalog()`
with the exact header `| ID | Tier | Check | Category | Statement |` (one row per control, sorted
by category then id; escape any `|` in `statement`). Render `fails_when` **not** as a table column
(it's a list and would bloat the table) but as a short line under the table or omit when absent —
e.g. after the table, a "Fails when" sub-list grouped by id for controls that have one; controls
with no `fails_when` simply don't appear there. **Follow the table** with a fenced ```` ```yaml ````
block containing `getPublicCatalogYaml()` and a line linking `/standards/catalog.yaml` as the
machine source. Header via `toMarkdown("Control catalog", "<one-line desc>", …)`.

**Verify**: `curl -s localhost:3000/standards/catalog.md` contains both a `| ID |` table row and
a ```` ```yaml ```` fence and a link to `/standards/catalog.yaml`.

### Step 4: Restructure `/llms.txt` into a curated index; keep `/llms-full.txt`

- In `lib/llms.ts`, add `llmsIndex(): string` — an llmstxt.org index generated from
  `contentMap` + `getDoc` titles/descriptions + the singleton table (import it from
  `lib/markdown-twin.ts` to avoid a second source). Shape:
  ```
  # TFX Design Standard

  > Make the quality bar independent of staffing. Kind Utility — useful first, kind at the
  > surface. Every page below is also available as Markdown by appending `.md`.

  ## Start here
  - [Overview](/overview.md)
  - [How to read this standard](/how-to-read.md)
  - [For agents](/for-agents.md)

  ## Principles
  - [Brand principles](/principles/brand-principles.md): <description>
  - …

  ## Standards
  - [Standards overview](/standards.md): <description>
  - [Control catalog](/standards/catalog.md): readable controls + embedded YAML
  - [Control catalog (YAML)](/standards/catalog.yaml): machine source

  ## Guidelines / Foundations / Products / Harness / Governance
  - … (iterate contentMap, link each slug's .md twin)

  ## Optional
  - [Full text](/llms-full.txt): every page concatenated, plus control rationale & examples
  ```
  Fold the essential lines of the old `/llms.txt` header (mission, tiers, waiver syntax) into
  the blockquote + a short "## About" section so no context is lost.
- `app/llms.txt/route.ts` → `return new Response(llmsIndex(), { headers: { "content-type":
  "text/markdown; charset=utf-8" } });` keep `export const dynamic = "force-static"`.
- Leave `app/llms-full.txt/route.ts` unchanged — it stays the full dump (`llmsBody()` +
  `controlDetails()`). This preserves the "paste the whole standard" path; the index now points
  agents there explicitly.
- Add the per-page **discovery link**: in each page's metadata, add a markdown alternate. Add a
  tiny helper (e.g. in `lib/markdown-twin.ts`) `mdAlternate(htmlPath: string)` returning
  `{ alternates: { types: { "text/markdown": `${htmlPath}.md` } } }`, and spread it into:
  - the dynamic `generateMetadata` in each `app/{section}/[slug]/page.tsx` (5 files),
  - the static `metadata` in each section index `page.tsx` and the singleton pages
    (`overview`, `how-to-read`, `for-agents`, `governance`, `standards`, `standards/catalog`),
  - `app/page.tsx` (add a `metadata` export — it has none today).

**Verify**: `curl -s localhost:3000/llms.txt` starts with a single `# ` H1 then a `> `
blockquote; every list item is `[text](/….md)` or links `/standards/catalog.yaml`; it no longer
contains the giant dump (`curl -s localhost:3000/llms.txt | grep -c '## ===== '` → `0`).
`curl -s localhost:3000/llms-full.txt | grep -c '## ===== '` → `> 0` and includes
`CONTROL DETAILS`. `curl -s localhost:3000/guidelines/voice-tone | grep -i 'rel="alternate"'`
shows the `text/markdown` link.

### Step 5: Document the convention + wire tracing (+ sitemap)

- `content/sections/for-agents.mdx` — update the machine-surface paragraph: every page is
  available as Markdown by appending `.md`; `/llms.txt` is now the **curated index**;
  `/llms-full.txt` is the full concatenation (paste this for whole-standard context);
  `/standards/catalog.yaml` is the control source. (Keep the human/skill/contract framing; only
  the "/llms.txt = flattened whole standard / paste it" lines change.) Apply tfx-content-style
  (no buzzwords; say what each surface is).
- `next.config.mjs` — add to `outputFileTracingIncludes` for whichever mechanism you shipped:
  - middleware route: `"/_md/[...path]": ["./content/**/*", "./harness/standards/**/*"]`;
  - `public/` generation: nothing to trace (the `.md` are emitted static files), but ensure the
    `scripts/generate-md-twins.mjs` prebuild step runs before `next build`.
  Keep the existing `/llms.txt`, `/llms-full.txt`, `/standards/catalog.yaml` entries.
- `app/sitemap.ts` (recommended) — `export default function sitemap()` returning the **HTML**
  URLs (from `allTwins().map(t => t.htmlPath)`), NOT the `.md` (which are `noindex`). If added
  and it imports `lib/markdown-twin` (which reads `content/`), add `"/sitemap.xml"` to
  `outputFileTracingIncludes` too.

**Verify**: `pnpm build` passes (prebuild + static gen); `git status` shows only in-scope files;
the for-agents page renders with the new wording.

## Test plan

- No unit-test framework exists in this repo; verification is build + `curl` (the repo's
  convention for these routes — `llms.txt` etc. have no tests, only build-time generation).
- Coverage loop — after `pnpm build && pnpm start`:
  `for u in $(curl -s localhost:3000/llms.txt | grep -oE '/[A-Za-z0-9/._-]+\.md'); do echo "$(curl -s -o /dev/null -w '%{http_code}' localhost:3000$u) $u"; done`
  → every line is `200`.
- Faithfulness: the `product-icons.md` no-raw-JSX grep (Step 2) and the code-span-preserved grep.
- Regression: HTML routes still `200` and still HTML (Step 2 verify).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm build` succeeds AND the decisive gate passes: a **section** `.md` (`/guidelines/voice-tone.md`) returns `200` `text/markdown` at runtime (a build pass alone is NOT sufficient — the catch-all failure mode is a silent runtime 404)
- [ ] Every link in `/llms.txt` resolves `200` (the coverage loop above), section `.md` paths included
- [ ] `/llms.txt` is a curated index (one `# ` H1, a `> ` blockquote, `.md`-linked items, and `grep -c '## ====='` → 0); `content-type: text/markdown`
- [ ] `/llms-full.txt` unchanged (still the full dump, `grep -c '## ====='` → > 0)
- [ ] `/guidelines/voice-tone.md` returns `200` `text/markdown` with `x-robots-tag: noindex` + `vary: Accept`; body = title + description + raw MDX
- [ ] `/guidelines/product-icons.md` contains no raw `<div>/<svg>/<figure>`; code-span literals (e.g. `<button>`) survive in their pages
- [ ] `/standards/catalog.md` has a Markdown table + a fenced YAML block + a link to `/standards/catalog.yaml`
- [ ] Each page's HTML `<head>` has a `rel="alternate" type="text/markdown"` link to its `.md`
- [ ] `app/llms-full.txt/route.ts` unchanged; HTML routes unregressed; only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- The decisive gate fails — a **section** `.md` (`/guidelines/voice-tone.md`) returns `404` or
  HTML after build (the section page route shadowed it). This is the expected failure of a bare
  root catch-all and does **not** show as a build error — switch to another Step-2 mechanism
  (middleware route, or `public/` generation) and re-test until the section `.md` serves `200`
  `text/markdown`. Do not disable the existing page routes to force a catch-all to win.
- A `.md` twin would require rendering MDX/JSX to be faithful (i.e. a page's meaning lives in a
  component, not the prose) — for a corpus page beyond `product-icons.mdx`, emit the placeholder
  and NOTE it; do not pull in a headless renderer.
- Changing `/llms.txt` to the index would break a known consumer that depends on the old full
  dump — the full dump still lives at `/llms-full.txt`; point the consumer there and proceed
  (this is the intended migration), but flag it in your report.

## Maintenance notes

- `lib/markdown-twin.ts` is the **one place** that knows the page↔`.md` mapping. Plan 036 adds
  per-control twins by extending `allTwins()` (or a sibling registry) — keep `resolveTwin` and
  `markdownResponse` reusable; do not fork the response/header logic.
- If a new page/section is added, it flows into the twins automatically via `contentMap` —
  except **singletons**, which are an explicit table; a new singleton needs a row there (and the
  build guard `scripts/check-standards.mjs` already enforces map/sidebar consistency for docs).
- A reviewer should scrutinize: (a) `dynamicParams = false` + complete `generateStaticParams`
  (so the catch-all can't shadow 404s), (b) the stripper's code-span awareness (no false
  changes to code literals, no leaked JSX), and (c) that `/llms.txt`'s links all resolve.
- Deferred (not in this plan): `Accept: text/markdown` content negotiation; a remark round-trip
  stripper (overkill for one file); a visible "Copy page as Markdown" button (nice-to-have).
