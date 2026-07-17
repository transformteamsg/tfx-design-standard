# Plan 005: Add Usage code blocks + Best-practices (Do/Don't) to every Foundations page

> **Executor instructions**: Follow step by step. Run every verification command
> and confirm the expected result before moving on. Touch only in-scope files.
> On any STOP condition, stop and report — do not improvise. Commit per the git
> workflow. SKIP updating `plans/README.md` — the reviewer maintains it.
>
> **Drift check (run first)**:
> `git diff --stat <base>..HEAD -- components/mdx.tsx app/globals.css content/foundations components/foundations`
> where `<base>` is the commit your branch was cut from. Your branch is cut
> from `advisor/004-brand-icon-specimen`, so `components/foundations/brand-icon-set.tsx`
> and the `BrandIconSet` registration + the iconography brand-icon section are
> EXPECTED to already exist — that is plan 004, not drift. Read the live files
> before editing. If `content/foundations/iconography.mdx` lacks a
> `<BrandIconSet />` embed, STOP (004 did not land — wrong base).

## Status

- **Priority**: P2
- **Effort**: M–L
- **Risk**: MED (new MDX `pre` override affects every code block site-wide)
- **Depends on**: plan 004 (your base branch); indirectly 001–003 (merged in `main`)
- **Category**: docs
- **Planned at**: commit `c519230` (main) + plan 004, 2026-07-17

## Why this matters

The user likes Astryx's Colour page, which pairs a **Usage** code sample with a
**Best Practices** Do/Don't table (https://astryx.atmeta.com/docs/color).
Astryx's snippet is StyleX (`stylex.create`, `colorVars[…]`) — their stack.
Ours is Tailwind v4 + CSS custom properties + shadcn, so our Usage samples must
show *our* consumption (semantic classes + the `var(--token)` escape hatch),
never StyleX. Today our MDX renders ` ``` ` fences as unstyled `<pre>` (no
panel, no label, no copy button — confirmed: `.prose pre` has no styling and
there is no highlight/copy dependency). This plan builds a reusable, copyable
`CodeBlock` (matching the framed/labelled look) and a `DoDont` table, then adds
a Usage + Best-practices section to all five Foundations pages so the treatment
is consistent, not just on Colour.

## Current state

- `components/mdx.tsx` — the MDX registry. It exports `textOf(node)` (recursively
  extracts text from a ReactNode — reuse it) and `mdxComponents` (maps `h2`,
  `h3`, and the specimen components incl. `BrandIconSet` from plan 004). You
  will add a `pre` override + register `CodeBlock`/`DoDont`.

- `components/page-actions.tsx` — the existing copy pattern to mirror: a client
  component using `navigator.clipboard.writeText`, `useState` for
  copied/error, and lucide `Copy`/`Check` icons. Read it for the idiom.

- `app/globals.css` `.prose` block (~lines 202-211) styles `h1/h2/h3/p/ul/ol/li`
  only — **no `code`/`pre` rules**. Existing `.prose` spacing values are all
  on the shadcn scale (e.g. `margin: 0 0 14px`, `padding-left: 20px`). Match
  that: any px you add must be on-scale (spacing set includes 1,2,4,6,8,…;
  radius set is {0,2,4,6,8,12,16,24,9999}). `harness/checks/token-audit.py`
  scans `app components lib` and will FAIL the build on an off-scale
  padding/margin/gap or radius, or any raw colour — use `var(--…)` only.

- The five Foundations MDX files, current bodies — reproduced so you match them
  exactly (all under `content/foundations/`):

  - **colour.mdx** ends with a `## Rules` bullet list:
    ```
    ## Rules
    - Primary actions and brand moments use the product's primary (COL-1).
    - Functional colours always from the shared Radix scales, never ad-hoc (COL-2).
    - No purple/violet gradients, cyan-on-dark, glow accents, or gradient text (SLP-1, SLP-2).
    - Don't rely on colour alone: pair with text labels (accessibility baseline).
    ```
  - **typography.mdx** ends with a `## Usage` section holding **Do:/Don't:** prose:
    ```
    ## Usage
    **Do:** Plus Jakarta Sans exclusively for display and headlines · Inter for all body and UI text · generous line height · respect the scale.
    **Don't:** mix display and body roles · decorative or script fonts · body text below 14px · all-caps text — use sentence case (genuine acronyms excepted).
    ```
  - **spacing-radius.mdx** — ends with the `## Radius` section + `<RadiusScale />`; has no Usage/Rules.
  - **iconography.mdx** — has `## Rules` (3 bullets: icon-only buttons carry aria-label / icons beside meaning not above (SLP-5) / match stroke weight to text) AND (from plan 004) a `<BrandIconSet />` under "Brand icons — Icon Generator". `status: proposed`, keep the `tools:` frontmatter.
  - **motion.mdx** — ends with `## The controls`; `status: proposed`. No Usage/Rules.

Conventions: components open with a short block comment naming the job + the
controls that constrain them. Do/Don't pills reuse the functional tokens that
already pass contrast (as in `components/foundations/functional-colours.tsx`):
Do → `bg-success-subtle text-success border-success-muted`; Don't →
`bg-danger-subtle text-danger border-danger-muted`. Copy: second person, active
voice, sentence case, ≤25-word sentences (CNT-3), no AI-writing tells (SLP-9).

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm typecheck` | exit 0 |
| Lint | `pnpm lint` | 0 errors (4 pre-existing warnings OK) |
| Unit tests | `pnpm test` | all pass (58) |
| Standards gate | `node scripts/check-standards.mjs` | exit 0 |
| Token audit | `python3 harness/checks/token-audit.py app components lib` | exit 0, silent |
| A11y static | `python3 harness/checks/a11y-static.py app components` | exit 0 |
| Full build | `pnpm build` | exit 0, no `MDX compile failed` |
| Rendered contract | `pnpm test:e2e` | all pass (37) |

## Scope

**In scope**:
- `components/code-block.tsx` (create — client)
- `components/foundations/do-dont.tsx` (create)
- `components/mdx.tsx` — add `pre` override + register `CodeBlock`, `DoDont`
- `app/globals.css` — add `.prose code` inline styling + `.prose pre code` reset (tokens only, on-scale values)
- `content/foundations/colour.mdx`, `typography.mdx`, `spacing-radius.mdx`, `iconography.mdx`, `motion.mdx` — add/convert Usage + Best-practices
- `plans/README.md` — status row (SKIP per override)

**Out of scope**: `content/foundations/tokens.mdx` (plan 006 handles it), the
specimen components from 001/002/004, `lib/**`, `harness/**`,
`content/map.json`, `components/sidebar.tsx`, any syntax-highlighting
dependency (do NOT add one — plain monospace is fine).

## Git workflow
- Branch: `advisor/005-usage-and-best-practices` (create with `git checkout -b` if the worktree opened on an auto-named branch)
- Conventional commits, e.g. `feat(site): reusable CodeBlock + Do/Don't tables across foundations`
- Do NOT push or open a PR.

## Steps

### Step 1: Build the CodeBlock component

Create `components/code-block.tsx` (`"use client"`). Props `{ code: string; lang?: string }`. A framed panel; copy button mirrors `page-actions.tsx`:

```tsx
"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* clipboard unavailable — no-op */ }
  }
  return (
    <figure className="my-6 overflow-hidden rounded-lg border border-border bg-muted">
      <figcaption className="flex items-center justify-between border-b border-border px-4 py-2 text-[12px] text-muted-foreground">
        <span>{lang ?? "code"}</span>
        <button type="button" onClick={copy} aria-label="Copy code"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors duration-(--motion-fast) hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) max-sm:min-h-11">
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre className="overflow-x-auto p-4 text-[13px] leading-[1.6]"><code className="font-mono text-foreground">{code}</code></pre>
    </figure>
  );
}
```

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Build the DoDont component

Create `components/foundations/do-dont.tsx`. MDX-friendly prop API — an array of items passed inline:

```tsx
/* Best-practices Do/Don't table for the Foundations pages. Pills reuse the
   functional tokens that already clear AA (COL-2/A11Y-1): success for Do,
   danger for Don't. Static content grouped with rows, not cards (SLP-11). */
type Item = { kind: "do" | "dont"; text: string };
export function DoDont({ items }: { items: Item[] }) {
  return (
    <figure className="my-8 overflow-hidden rounded-lg border border-border">
      <ul className="divide-y divide-border">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 bg-surface px-4 py-3">
            <span className={`mt-0.5 inline-block shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
              it.kind === "do" ? "border-success-muted bg-success-subtle text-success" : "border-danger-muted bg-danger-subtle text-danger"}`}>
              {it.kind === "do" ? "Do" : "Don't"}
            </span>
            <span className="text-[14px] leading-[1.6] text-prose-body">{it.text}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
```

**Verify**: `pnpm typecheck && pnpm lint` → exit 0. `python3 harness/checks/token-audit.py app components lib` → exit 0.

### Step 3: Wire the MDX `pre` override + register components

In `components/mdx.tsx`:
- Import `isValidElement` (already imported), `CodeBlock`, `DoDont`.
- Add a `Pre` component that extracts language + text from the fenced code and renders `CodeBlock`:
  ```tsx
  function Pre({ children }: { children?: ReactNode }) {
    if (isValidElement(children)) {
      const p = children.props as { className?: string; children?: ReactNode };
      const lang = p.className?.replace(/^language-/, "");
      const code = textOf(p.children).replace(/\n$/, "");
      return <CodeBlock code={code} lang={lang} />;
    }
    return <pre>{children}</pre>;
  }
  ```
- Register `pre: Pre`, `CodeBlock`, and `DoDont` in `mdxComponents`.

**Verify**: `pnpm typecheck` → exit 0. `pnpm build` → exit 0 (the existing fenced block in `content/guidelines/illustration.mdx` now renders through CodeBlock — confirm the build has no `MDX compile failed`). If the `pre` override breaks compileMDX, STOP.

### Step 4: Add inline code styling to globals.css

In the `.prose` block, add (tokens + on-scale values only):
```css
.prose code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; background: var(--muted); padding: 2px 6px; border-radius: 4px; }
.prose pre code { background: transparent; padding: 0; }
```
(The second rule is a safety reset; note `pre` is overridden to CodeBlock so it rarely applies, but harmless.)

**Verify**: `python3 harness/checks/token-audit.py app components lib` → exit 0 (proves `2px 6px` and `4px` read as on-scale and `var(--muted)` isn't a raw colour). `pnpm build` → exit 0.

### Step 5: Add Usage + Best-practices to each page

Use exactly these snippets and rows (they are correct for our stack; do not
invent). Put `## Usage` then `## Best practices` at the END of each page,
replacing any existing `## Rules`/`## Usage` prose block noted in Current state.
Keep every other section and all frontmatter intact.

**colour.mdx** — replace the `## Rules` block with:
````
## Usage

```tsx
// Semantic Tailwind classes — the default
<div className="bg-surface text-foreground border border-border" />
<span className="text-success bg-success-subtle" />

// CSS-variable escape hatch, when no class fits
<div style={{ background: "var(--muted)" }} />
```

## Best practices

<DoDont items={[
  { kind: "do", text: "Use the product's own primary for primary actions and brand moments (COL-1)." },
  { kind: "do", text: "Take success, warning, and danger colours from the shared Radix scales (COL-2)." },
  { kind: "do", text: "Pair colour with a text label — never signal with colour alone." },
  { kind: "dont", text: "Hardcode a hex value in a component; use a semantic token instead (TOK-1)." },
  { kind: "dont", text: "Use purple or violet gradients, cyan-on-dark, glow accents, or gradient text (SLP-1, SLP-2)." },
]} />
````

**typography.mdx** — replace the existing `## Usage` (Do:/Don't: prose) with:
````
## Usage

```tsx
<h2 className="font-display text-[24px] font-semibold" />  {/* Heading 2 */}
<p className="font-body text-[16px]" />                    {/* Body */}
```

## Best practices

<DoDont items={[
  { kind: "do", text: "Use Plus Jakarta Sans for display and headlines, Inter for body and UI." },
  { kind: "do", text: "Give body text a line height of 1.5 to 1.6, and respect the scale." },
  { kind: "dont", text: "Mix display and body roles, or reach for a decorative or script font." },
  { kind: "dont", text: "Set body text below 14px, or use all-caps — use sentence case (genuine acronyms excepted)." },
]} />
````

**spacing-radius.mdx** — append at the end:
````
## Usage

```tsx
{/* padding step 4 = 16px, gap step 2 = 8px, radius lg */}
<div className="p-4 gap-2 rounded-lg" />
```

## Best practices

<DoDont items={[
  { kind: "do", text: "Use the shadcn scale through Tailwind utilities — p-4, gap-2, rounded-lg." },
  { kind: "do", text: "Group related items more tightly than unrelated ones (SLP-7)." },
  { kind: "do", text: "Keep a child's radius at or below its parent's, so curves stay concentric." },
  { kind: "dont", text: "Reach for an off-scale value for margin, padding, or gap (TOK-2), or radius (TOK-3)." },
  { kind: "dont", text: "Use one spacing value everywhere — flat rhythm is an AI-slop tell (SLP-7)." },
]} />
````

**iconography.mdx** — replace the `## Rules` block with:
````
## Usage

```tsx
import { Calendar } from "lucide-react";

<Calendar aria-hidden size={20} strokeWidth={2} />

{/* An icon-only button carries a label */}
<button aria-label="Open calendar"><Calendar aria-hidden /></button>
```

## Best practices

<DoDont items={[
  { kind: "do", text: "Use Lucide for interface icons, and the ink set for marketing and comms." },
  { kind: "do", text: "Give every icon-only button a descriptive aria-label (A11Y-3)." },
  { kind: "do", text: "Match an icon's stroke weight to the adjacent text weight." },
  { kind: "dont", text: "Mix icon sets inside product UI." },
  { kind: "dont", text: "Stack an icon in a decorative tile above its heading (SLP-5)." },
]} />
````

**motion.mdx** — append after `## The controls`:
````
## Usage

```tsx
{/* CSS: duration and easing from tokens */}
<div className="transition-colors duration-(--motion-fast)" />

{/* motion/react, via lib/motion.ts which mirrors the CSS tokens */}
transition={{ duration: DUR.base, ease: EASE_OUT }}
```

## Best practices

<DoDont items={[
  { kind: "do", text: "Take durations and easings from the motion token set (MOT-2)." },
  { kind: "do", text: "Keep interface motion at 300ms or less (MOT-1)." },
  { kind: "do", text: "Give every animated surface a reduced-motion variant (A11Y-5)." },
  { kind: "dont", text: "Hardcode a duration or easing in component code." },
  { kind: "dont", text: "Use bounce or overshoot easing (SLP-8)." },
]} />
````

**Verify**: `pnpm build` → exit 0, no `MDX compile failed` for any foundations
page. Start `pnpm dev --port 3050`; for each page confirm the code panel + a
Do/Don't table render:
`for p in colour typography spacing-radius iconography motion; do echo $p; curl -s http://localhost:3050/foundations/$p | grep -c "Best practices"; done` → each ≥ 1.
Kill the dev server; fresh `pnpm build` before e2e.

### Step 6: Full gate

`pnpm lint && pnpm typecheck && pnpm test && node scripts/check-standards.mjs && python3 harness/checks/token-audit.py app components lib && python3 harness/checks/a11y-static.py app components && pnpm build && pnpm test:e2e`

**Verify**: every command exits 0.

## Test plan

- No new unit tests (static content + presentational components). Gates that
  bite: token-audit (CodeBlock/DoDont/globals.css must be TOK clean),
  a11y-static, build (the `pre` override must not break compileMDX), and e2e
  (the two listed foundations routes — motion — stay green; overflow at 320px
  is covered there and by the general chrome tests).

## Done criteria

ALL hold:
- [ ] lint/typecheck/test/build/test:e2e exit 0; token-audit + a11y-static exit 0
- [ ] Each of the five foundations pages shows a framed, copyable Usage code block and a Do/Don't table (curl/browser)
- [ ] The Usage samples show Tailwind classes / `var(--…)`, never StyleX
- [ ] `content/guidelines/illustration.mdx`'s existing fence still renders (via CodeBlock) — build clean
- [ ] `git status` clean; nothing outside in-scope changed; `content/foundations/tokens.mdx` untouched
- [ ] `plans/README.md` — left to reviewer

## STOP conditions

- The `pre` override breaks `compileMDX` (build error) and you can't fix it by
  adjusting the extraction in one attempt.
- token-audit flags globals.css or a new component and the fix isn't "use a
  token / on-scale value" — do NOT add `tfx-waive`.
- iconography.mdx has no `<BrandIconSet />` (wrong base — 004 didn't land).
- A foundations MDX file differs from the Current-state excerpts (drift).

## Maintenance notes

- The `pre` override makes ALL fenced code render through CodeBlock site-wide —
  a reviewer should sanity-check other pages with code (e.g.
  `content/guidelines/illustration.mdx`).
- Usage snippets are hand-maintained; if a token name changes, update them.
- Plan 006 (tokens slim-down) does not use these components but shares the
  branch chain.
- Reviewer scrutiny: CodeBlock copy button hit target on mobile (≥44px), the
  Do/Don't pill contrast, and that no Usage sample leaked a StyleX example.
