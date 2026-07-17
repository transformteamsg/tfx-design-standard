# Plan 007: Integrate the Foundations rebuild onto origin/main's Tailwind type-scale ratchet

> **Executor instructions**: Follow step by step. Run every verification command
> and confirm the expected result before moving on. On any STOP condition, stop
> and report. Commit per the git workflow. SKIP `plans/README.md` — reviewer
> maintains it. Before reporting, audit every claim against an actual tool
> result; if a verification failed or was skipped, say so plainly. Reply in the
> report format the dispatcher gave you.

## Why this matters

Two lines diverged from `d2fb27a`. `origin/main` (now `12891ab`) shipped a
**type-scale ratchet**: TYP-2/TYP-3 now bind to the **Tailwind default type
scale** `{128,96,72,60,48,36,30,24,20,18,16,14,12}`, enforced by
`harness/checks/type-scan.py app components` (a prebuild + CI gate), and the
codebase uses **named utilities only** — zero `text-[Npx]` arbitrary values
(verified: `grep -rE "text-\[[0-9]+px\]" app components` returns nothing on
origin). The other line (branch `advisor/006-slim-tokens-reference`, based on
`d2fb27a`) is the visual Foundations rebuild — colour ramps, tokens page, brand
icons, CodeBlock/Do-Don't, type/spacing/icon specimens — but built on the OLD
scale (H1 32px, Display 120px) with arbitrary `text-[Npx]` sizes throughout.

This plan merges the rebuild onto `origin/main` and adapts it to the ratchet:
adopt origin's scale, convert every arbitrary size to a named utility, so the
additive work lands and `type-scan` stays green.

## Base & merge

Your worktree is cut from `origin/main` (`12891ab`). First:

```
git merge --no-ff advisor/006-slim-tokens-reference
```

A trial merge shows exactly **two conflicts** — everything else auto-merges
(all `components/foundations/*`, `components/code-block.tsx`,
`components/foundations/do-dont.tsx`, `lib/foundations/*`,
`content/foundations/{colour,spacing-radius,iconography,motion,tokens}.mdx`,
`components/mdx.tsx`, `components/doc-page.tsx`, `package.json`,
`tests/site-contract.spec.ts`, `plans/*`). Resolve the two:

### Conflict A — `content/foundations/typography.mdx`

**origin's version is canonical for the scale.** Origin's body (keep its scale
table + the "The scale IS the Tailwind default type scale …" line + Usage
prose). The rebuild added `<FontRoles />` + `<TypeScale />` specimens and a
`## Usage` code block + `## Best practices` DoDont. Produce a UNION:
- Keep origin's frontmatter (`status: settled`) and its **scale table values**
  (Display 96/72/60/48, Heading 1 **30**, Heading 2 24, Heading 3 20, Body
  Large 18, Body 16, Body Small 14, Caption/Label 12).
- Put `<FontRoles />` near the top (before/after the font table) and
  `<TypeScale />` under `## Type scale` (in addition to — or replacing — the
  markdown scale table; keep at least one representation, and if you keep both
  they must agree).
- Keep the "The scale IS the Tailwind default type scale … named utilities,
  never arbitrary `text-[Npx]`" sentence.
- Replace origin's prose `## Usage` (Do:/Don't:) with the rebuild's `## Usage`
  (a ```tsx code block) + `## Best practices` (`<DoDont items={[…]} />`), BUT
  fix the code sample to named utilities (see Step 3).

### Conflict B — `app/globals.css`

UNION: keep origin's changes AND the rebuild's `.prose` code-block styling. The
rebuild added inline-code + `pre` styling so `CodeBlock` renders on a light
panel. Keep origin's type-related rules; add/merge the rebuild's:
```css
.prose code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; background: var(--muted); padding: 2px 6px; border-radius: 4px; overflow-wrap: anywhere; word-break: break-word; }
.prose pre { background: transparent; color: inherit; padding: 0; margin: 0; border-radius: 0; overflow-x: auto; }
.prose pre code { background: transparent; padding: 0; overflow-wrap: normal; word-break: normal; white-space: inherit; }
```
If origin's `.prose pre` sets a dark background, it MUST be overridden to
transparent (CodeBlock provides its own panel) — otherwise the code panel
renders dark-on-light wrong. Only tokens + on-scale spacing/radius values (the
`token-audit.py` gate covers this file): `2px`,`6px`,`4px` are on-scale.

Commit the merge once conflicts are resolved and `pnpm typecheck` passes.

## The type-scan adaptation (the real work)

`type-scan.py` flags, in `app components`: arbitrary `text-[Npx]`/`text-[Nrem]`
that are off the scale `{128,96,72,60,48,36,30,24,20,18,16,14,12}` (ONSCALE),
arbitrary sizes `< 14px` (SIZEFLOOR; labels may be 12), non-PJS/Inter fonts,
and all-caps. **Named utilities (`text-xs`…`text-9xl`) are NOT flagged** — that
is the fix origin used. Convert every arbitrary `text-[Npx]` in the merged-in
components to the nearest named utility:

| arbitrary | named | px |
|---|---|---|
| `text-[10px]`, `text-[11px]`, `text-[12px]` | `text-xs` | 12 |
| `text-[13px]`, `text-[14px]` | `text-sm` | 14 |
| `text-[16px]` | `text-base` | 16 |
| `text-[18px]` | `text-lg` | 18 |
| `text-[20px]` | `text-xl` | 20 |
| `text-[24px]` | `text-2xl` | 24 |
| `text-[30px]`,`text-[32px]` | `text-3xl` | 30 |

Files with arbitrary sizes to convert (find them all with
`grep -rEl "text-\[[0-9]+px\]" components`): `components/foundations/`
color-ramp, functional-colours, primary-swatches, token-table, type-scale,
spacing-scale, radius-scale, icon-set, brand-icon-set, do-dont; and
`components/code-block.tsx`. After conversion,
`grep -rE "text-\[[0-9]+px\]" app components` must return NOTHING.

Do NOT touch `components/diagrams/motion-scale.tsx` (origin's; already compliant).

### type-data + TypeScale specimen (align to origin's scale)

`lib/foundations/type-data.ts` currently has off-scale values (Display 120, H1
32, Label 11). Rewrite `TYPE_SCALE` to origin's scale AND add a `util` field
carrying the named class so the specimen renders on-scale without arbitrary
values (Tailwind scans lib/ so literal class strings here are generated):

```ts
export type TypeRow = { step: string; util: string; px: number; font: "display" | "body"; weight: number; note?: string };
export const TYPE_SCALE: TypeRow[] = [
  { step: "Display", util: "text-5xl", px: 48, font: "display", weight: 600, note: "Also 60 / 72 / 96px for larger surfaces." },
  { step: "Heading 1", util: "text-3xl", px: 30, font: "display", weight: 600 },
  { step: "Heading 2", util: "text-2xl", px: 24, font: "display", weight: 600 },
  { step: "Heading 3", util: "text-xl", px: 20, font: "display", weight: 600 },
  { step: "Body Large", util: "text-lg", px: 18, font: "body", weight: 400 },
  { step: "Body", util: "text-base", px: 16, font: "body", weight: 400 },
  { step: "Body Small", util: "text-sm", px: 14, font: "body", weight: 400 },
  { step: "Caption", util: "text-xs", px: 12, font: "body", weight: 500 },
  { step: "Label", util: "text-xs", px: 12, font: "body", weight: 600, note: "Sentence case, not all-caps (TYP-4)." },
];
```

In `components/foundations/type-scale.tsx`, render each sample with
`className={\`${row.font === "display" ? "font-display" : "font-body"} ${row.util} …\`}`
and `style={{ fontWeight: row.weight }}` — drop the `style={{ fontSize }}`
(the named util carries the size now). The metadata line: `{row.step} · {row.px}px · …`.

### tokens.mdx type table (align to origin's scale)

`content/foundations/tokens.mdx`'s compact Type-scale table currently uses the
old values. Update to origin's scale: Display `48px (also 60 / 72 / 96)`,
Heading 1 `30px`, Heading 2 `24px`, Heading 3 `20px`, Body Large `18px`, Body
`16px`, Body Small `14px`, Caption `12px`, Label `12px`.

### Usage code samples → named utilities

In the `## Usage` ```tsx blocks (content isn't type-scanned, but must teach the
ratchet, not contradict it):
- typography.mdx: `<h2 className="font-display text-2xl font-semibold" />` and
  `<p className="font-body text-base" />` (was `text-[24px]`/`text-[16px]`).
- Any other Usage sample that shows an arbitrary `text-[Npx]` → named utility.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Install | `pnpm install` | exit 0 (adds @radix-ui/colors) |
| Typecheck | `pnpm typecheck` | exit 0 |
| Lint | `pnpm lint` | 0 errors |
| Test | `pnpm test` | all pass |
| Standards gate | `node scripts/check-standards.mjs` | exit 0 |
| Token audit | `python3 harness/checks/token-audit.py app components lib` | exit 0 |
| A11y | `python3 harness/checks/a11y-static.py app components` | exit 0 |
| **Type scan** | `python3 harness/checks/type-scan.py app components` | **exit 0, silent** |
| Build | `pnpm build` | exit 0, no `MDX compile failed` |
| e2e | isolated port (see dispatcher note) | 37+ pass |

## Scope

In scope: the merge + conflict resolution; the type conversions in the listed
components; `lib/foundations/type-data.ts`; `components/foundations/type-scale.tsx`;
`content/foundations/{typography,tokens}.mdx`; any Usage sample with arbitrary
sizes. Out of scope: origin's harness/checks changes, `harness/**`,
`components/diagrams/*`, anything unrelated to making the rebuild land + pass
type-scan.

## Git workflow
- Branch: `advisor/007-integrate-onto-origin` (create it in the worktree).
- Commit the merge, then a second commit `fix(site): adopt Tailwind type scale + named utilities across the foundations rebuild`.
- Do NOT push or open a PR.

## Steps
1. Merge `advisor/006-slim-tokens-reference`; resolve conflicts A and B as above; `pnpm typecheck` exit 0; commit the merge.
2. Convert all arbitrary `text-[Npx]` → named utilities (table above). Verify `grep -rE "text-\[[0-9]+px\]" app components` → empty.
3. Rewrite `type-data.ts` to origin's scale with `util` fields; update `type-scale.tsx` to render via `row.util`; update `tokens.mdx` type table; fix Usage samples.
4. `python3 harness/checks/type-scan.py app components` → exit 0 silent. If it flags anything, fix by converting to a named utility or an on-scale value — never a `tfx-waive`.
5. Full gate (all rows above) + e2e on the isolated port per the dispatcher note. Confirm `pnpm build` clean and the colour-data sync test still passes against origin's `app/globals.css` (if it fails, origin changed a functional token — STOP and report the mismatch).
6. Commit. Report.

## Done criteria
- [ ] Merge committed; only conflicts A/B were hand-resolved
- [ ] `grep -rE "text-\[[0-9]+px\]" app components` → empty
- [ ] `python3 harness/checks/type-scan.py app components` exit 0
- [ ] lint/typecheck/test/build + token-audit/a11y/check-standards exit 0; e2e passes on isolated port
- [ ] `/foundations/{colour,typography,spacing-radius,iconography,motion,tokens}` all render; TypeScale specimen shows origin's scale (H1 30, no 120/32)
- [ ] colour-data sync test passes against origin globals.css
- [ ] git status clean

## STOP conditions
- The colour-data sync test fails against origin's globals.css (origin moved a colour token) — report the exact mismatch.
- `type-scan` flags something that isn't a `text-[Npx]`/off-scale/sub-14 size you can convert (e.g. a font-family issue) — report it.
- A merge conflict appears in a file other than the two named above — report it (the trial merge showed only those two; a third means drift).
- e2e can't run because port 3000 is occupied — use the isolated-port procedure the dispatcher gives you; if that also fails, report.

## Maintenance notes
- This adopts origin's type ratchet as authoritative; the rebuild's old scale
  (120px display, 32px H1, 11px label) is intentionally dropped.
- Reviewer scrutiny: type-scan green, TypeScale specimen renders at Tailwind
  sizes, no arbitrary `text-[Npx]` reintroduced, code panel not dark.
