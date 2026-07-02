# Plan 050: App hygiene — MDX compile fallback in DocPage, drop the `shadcn` runtime dep, delete the stale tracing entry

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat c42d695..HEAD -- components/doc-page.tsx 'app/standards/catalog/[id]/page.tsx' package.json next.config.mjs`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (independent of 046–049)
- **Category**: bug / tech-debt
- **Planned at**: commit `c42d695`, 2026-07-02

## Why this matters

Three small defects in the website. (1) Content pages render MDX with no compile
fallback: one stray angle token in prose (e.g. `<date>`) aborts the entire
`next build` — the exact failure the catalog detail page already defends against
with a documented try/catch (and which actually happened once: plan 043 fixed a
bare `<date>` in cmp-1.md). The two surfaces render the same class of content;
only one is hardened. (2) The `shadcn` CLI — a scaffolding tool — is declared as
a production dependency; nothing imports it. (3) `next.config.mjs` traces files
for a `/llms-full.txt` route that was removed (commit 2a7576c "drop
llms-full.txt"). Each fix is small, low-risk, and makes the build/dependency
story honest.

## Current state

- `components/doc-page.tsx` — the shared renderer for all `content/` doc pages.
  Line 2: `import { MDXRemote } from "next-mdx-remote/rsc";`. Lines 68–74:

  ```tsx
  <article className="prose mt-8">
    <MDXRemote
      source={doc.content}
      components={{ h2: heading("h2"), h3: heading("h3") }}
      options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
    />
  </article>
  ```

  No try/catch. `DocPage` is a server component (rsc import); check whether it
  is already `async` — if not, it must become async for `compileMDX`.

- `app/standards/catalog/[id]/page.tsx` lines 57–75 — the hardened exemplar to
  mirror:

  ```tsx
  /* Control bodies are plain Markdown, but a stray angle token outside a code
     span (e.g. "<date>" in prose) makes MDX read it as an unclosed JSX tag.
     Compile in a try/catch; on failure fall back to a preformatted block with
     a visible note rather than aborting the build with a broken page. */
  let rendered: ReactNode = null;
  let rawFallback = false;
  if (detail.body) {
    try {
      const { content } = await compileMDX({
        source: detail.body,
        components: { h2: heading("h2"), h3: heading("h3") },
        options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
      });
      rendered = content;
    } catch {
      rawFallback = true;
    }
  }
  ```

  Read the rest of that file to see the fallback markup it renders when
  `rawFallback` is true, and reuse the same markup/wording in DocPage.

- Both files define identical local helpers `textOf(node)` and
  `heading(Tag)` (doc-page.tsx lines 22–40ish; same shapes in the catalog page)
  — duplicated verbatim.

- `package.json` line 28: `"shadcn": "^4.11.0"` under `dependencies`. Grep
  confirms no `import`/`require` of it anywhere in `app/ components/ lib/
  scripts/ hooks/` — only prose/CSS-comment mentions.

- `next.config.mjs` line 7: `"/llms-full.txt": ["./content/**/*",
  "./harness/standards/**/*"],` — the app has `app/llms.txt/route.ts` only; no
  llms-full route exists.

- Conventions: comments in this codebase state constraints, purpose-first
  (see the excerpt above); Tailwind v4 tokens only (TOK-1) — the fallback
  markup must reuse the catalog page's existing classes, not invent styles.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install (after dep change) | `pnpm install` | exit 0, lockfile updated |
| Build (runs prebuild checks) | `pnpm build` | exit 0 |
| Standards gate only | `pnpm check:standards` | exit 0 |
| Import check | `grep -rn "from \"shadcn\"\|require(\"shadcn\")" app components lib scripts hooks middleware.ts` | no output |

## Scope

**In scope**:
- `components/doc-page.tsx`
- `components/mdx.tsx` (create — shared `textOf`/`heading` helpers)
- `app/standards/catalog/[id]/page.tsx` (ONLY to import the shared helpers)
- `package.json` + `pnpm-lock.yaml` (remove `shadcn`)
- `next.config.mjs` (delete one line)

**Out of scope** (do NOT touch):
- `lib/markdown-twin.ts`, `lib/content.ts`, `lib/catalog.ts` — plan 051 adds
  tests there; no behaviour change is wanted.
- The MDX content in `content/` — if a page fails to compile during testing,
  the fallback should catch it; fixing the content is a separate content edit.
- Any other component, and the fonts setup (`@fontsource` imports were
  considered and rejected — see plans/README.md rejected list).

## Git workflow

- Branch: `advisor/050-app-hygiene`
- Commit style: `fix(web): MDX compile fallback in DocPage; drop shadcn runtime dep; remove stale llms-full tracing`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extract the shared MDX helpers

Create `components/mdx.tsx` exporting `textOf` and `heading` (move the
implementations from `components/doc-page.tsx`; compare with the catalog page's
copies first — if they differ at all, STOP and report the diff). Update both
`components/doc-page.tsx` and `app/standards/catalog/[id]/page.tsx` to import
from it and delete their local copies. Keep the "Heading ids must match
lib/toc's extractHeadings" comment with the moved code.

**Verify**: `pnpm build` → exit 0; `grep -c "function textOf" components/doc-page.tsx app/standards/catalog/\[id\]/page.tsx` → 0 in both.

### Step 2: Add the compile fallback to DocPage

In `components/doc-page.tsx`, replace the `<MDXRemote …/>` usage with the
`compileMDX` try/catch pattern from the exemplar (imports:
`import { compileMDX } from "next-mdx-remote/rsc";`). Make `DocPage` `async` if
it isn't. On failure render the same fallback the catalog page renders (raw
body in a `<pre>` with its visible note), inside the existing
`<article className="prose mt-8">`. Copy the exemplar's constraint comment,
adjusted to name doc bodies rather than control bodies.

**Verify**: `pnpm build` → exit 0 (all content pages still compile).

### Step 3: Negative test the fallback

Temporarily append a line with a bare `<breaker>` token to any prose paragraph
in `content/governance/` (pick the smallest .mdx file), run `pnpm build`:
expected — build still exits 0 and the page renders the fallback (grep the
`.next` output or `pnpm dev` + curl the route to confirm the `<pre>` fallback
appears). Then REVERT the content change (`git checkout -- content/`).

**Verify**: build exit 0 with the breaker present; `git status` shows content/ clean after revert.

### Step 4: Remove the `shadcn` dependency

`pnpm remove shadcn`. (Scaffolding still works on demand via
`pnpm dlx shadcn@latest`.)

**Verify**: `grep -n '"shadcn"' package.json` → no output; `pnpm build` → exit 0.

### Step 5: Delete the stale tracing entry

Remove the `"/llms-full.txt": …` line from `next.config.mjs` (keep the
`/llms.txt` line and all others).

**Verify**: `pnpm build` → exit 0; `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/llms.txt` against `pnpm start` (or `pnpm dev`) → `200`.

## Test plan

The negative test in Step 3 is the key regression test for this plan's main
change. Plan 051 adds the unit-test framework; if 051 has already landed when
you execute this, additionally add one Vitest case that `compileMDX`-based
DocPage fallback logic is exercised (only if a pure function was factored out —
do not force a component test).

## Done criteria

- [ ] `pnpm build` exits 0
- [ ] Step 3 negative test passed and was reverted (content/ clean)
- [ ] `grep -n '"shadcn"' package.json` → no output
- [ ] `grep -n "llms-full" next.config.mjs` → no output
- [ ] `textOf`/`heading` defined exactly once (`grep -rn "function textOf" app components | wc -l` → 1)
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The two files' `textOf`/`heading` implementations differ (Step 1) — pick
  neither; report the diff.
- Making DocPage async breaks a caller (search for `<DocPage` usages) in a way
  that needs more than adding `await`/async up one level.
- `pnpm remove shadcn` changes anything beyond the one dependency and lockfile
  entries (inspect `git diff package.json`).
- The Step 3 breaker makes the build fail — the fallback isn't catching; do not
  ship a fallback that doesn't work; report.

## Maintenance notes

- Content authors now get a visible `<pre>` fallback instead of a broken build;
  editors should still fix the offending token (the fallback note makes it
  findable). Consider (deferred) a `checks/`-style content scan for bare angle
  tokens if this recurs — plan 043 fixed one by hand, this plan stops the blast
  radius.
- Reviewer focus: the fallback markup matches the catalog page's (one
  convention, two call sites), and the removed dependency doesn't appear in any
  CI/script (`grep -rn "shadcn" .github scripts package.json`).
