# Plan 006: Slim the Tokens page to a dense, non-repetitive reference

> **Executor instructions**: Follow step by step. Run every verification command
> and confirm the expected result before moving on. Touch only in-scope files.
> On any STOP condition, stop and report. Commit per the git workflow. SKIP
> updating `plans/README.md` — the reviewer maintains it.
>
> **Drift check (run first)**:
> `git diff --stat <base>..HEAD -- content/foundations/tokens.mdx`
> Your branch is cut from `advisor/005-usage-and-best-practices`. Plan 005 does
> NOT touch `tokens.mdx`, so it should match the excerpt in Current state. If it
> differs, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plan 005 (branch chain); the page it edits came from plan 003
- **Category**: docs
- **Planned at**: commit `c519230` (main) + plans 004/005, 2026-07-17

## Why this matters

The maintainer found the Tokens page repetitive: it re-renders the *same full
teaching specimens* (`<TypeScale />`, `<SpacingScale />`, `<RadiusScale />`) as
the category pages, so type/spacing/radius are duplicated wholesale. An
all-tokens page earns its place only as a **dense reference index** — every
token name and value in one flat, scannable, copyable surface — distinct from
the category pages, which teach with rich specimens and rationale. This plan
swaps the three repeated specimens for compact value tables, keeping the page a
one-stop lookup (and the natural surface for agents / `llms.txt`) without the
redundancy. The colour token tables and motion table already ARE compact
references, so they stay.

## Current state

`content/foundations/tokens.mdx` (full body; `status: proposed`):

```mdx
One page, every token. Use the token name, never the value (TOK-1).

## Colour

<TokenTable group="core" />

<TokenTable group="functional" />

See [Colour](/foundations/colour) for the Radix ramps and where each product's primary comes from.

## Type scale

<TypeScale />

See [Typography](/foundations/typography) for font roles and usage rules.

## Spacing

<SpacingScale />

See [Spacing & radius](/foundations/spacing-radius) for the full spacing and radius specimens.

## Radius

<RadiusScale />

## Motion

| Token | Value |
| --- | --- |
| `--motion-fast` | 120ms |
| ... (six rows) |

Durations and easings are never hardcoded — always reference the token (MOT-2 ⚑). See [Motion](/foundations/motion) for the raced specimen.
```

- `<TokenTable group="…" />` (colour), the motion markdown table, and all the
  "See …" links stay. Only the three full specimens are replaced.
- The canonical scale values you will tabulate (do not change them):
  - **Type scale** (from `lib/foundations/type-data.ts`): Display 48px (also 72/96/120), Heading 1 32px, Heading 2 24px, Heading 3 20px, Body Large 18px, Body 16px, Body Small 14px, Caption 12px, Label 11px. Fonts: display steps are Plus Jakarta Sans 600; body steps are Inter (Body* 400, Caption 500, Label 600).
  - **Spacing scale** (shadcn default, the token-audit `SPACING_SCALE_PX`): step = px ÷ 4. 1→4px, 2→8px, 3→12px, 4→16px, 5→20px, 6→24px, 8→32px, 10→40px, 12→48px, 14→56px, 16→64px, 20→80px, 24→96px (continues 112 / 128px). You may list the common steps 1–24 and note it continues.
  - **Radius scale** (shadcn default): 0, 2, 4, 6, 8, 12, 16, 24px, and `9999` (full).
- The specimens (`TypeScale`, `SpacingScale`, `RadiusScale`) remain USED on
  their category pages, so removing them here leaves no dead component and no
  `check-standards.mjs` breakage. `tokens.mdx` stays registered in
  `content/map.json` and the sidebar — do not touch those.

Copy: sentence case, ≤25-word sentences (CNT-3), no AI-writing tells (SLP-9).

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Standards gate | `node scripts/check-standards.mjs` | exit 0 |
| Typecheck / lint / test | `pnpm typecheck && pnpm lint && pnpm test` | exit 0 |
| Token audit | `python3 harness/checks/token-audit.py app components lib` | exit 0 |
| A11y static | `python3 harness/checks/a11y-static.py app components` | exit 0 |
| Full build | `pnpm build` | exit 0, no `MDX compile failed` |
| Rendered contract | `pnpm test:e2e` | all pass (37) |

## Scope

**In scope**:
- `content/foundations/tokens.mdx` — replace the three specimen embeds with compact markdown tables
- `plans/README.md` — status row (SKIP per override)

**Out of scope**: the specimen components (still used on category pages),
`components/**`, `lib/**`, `content/map.json`, `components/sidebar.tsx`,
`tests/**`, the colour `<TokenTable>` embeds and motion table on this page,
every other content page.

## Git workflow
- Branch: `advisor/006-slim-tokens-reference` (create with `git checkout -b` if needed)
- Conventional commit, e.g. `refactor(site): make /foundations/tokens a dense reference, not repeated specimens`
- Do NOT push or open a PR.

## Steps

### Step 1: Replace the Type scale specimen with a compact table

In `tokens.mdx`, under `## Type scale`, replace `<TypeScale />` with a markdown
table (keep the "See [Typography]…" line):

```
| Step | Size | Font |
| --- | --- | --- |
| Display | 48px (also 72 / 96 / 120) | Plus Jakarta Sans 600 |
| Heading 1 | 32px | Plus Jakarta Sans 600 |
| Heading 2 | 24px | Plus Jakarta Sans 600 |
| Heading 3 | 20px | Plus Jakarta Sans 600 |
| Body Large | 18px | Inter 400 |
| Body | 16px | Inter 400 |
| Body Small | 14px | Inter 400 |
| Caption | 12px | Inter 500 |
| Label | 11px | Inter 600 |
```

### Step 2: Replace the Spacing specimen with a compact table

Under `## Spacing`, replace `<SpacingScale />` with (keep the "See …" line):

```
| Step | Size |
| --- | --- |
| 1 | 4px |
| 2 | 8px |
| 3 | 12px |
| 4 | 16px |
| 5 | 20px |
| 6 | 24px |
| 8 | 32px |
| 10 | 40px |
| 12 | 48px |
| 16 | 64px |
| 20 | 80px |
| 24 | 96px |

The scale continues to 112 and 128px.
```

### Step 3: Replace the Radius specimen with a compact table

Under `## Radius`, replace `<RadiusScale />` with:

```
| Token | Value |
| --- | --- |
| `rounded-none` | 0px |
| `rounded-sm` | 2px |
| `rounded` | 4px |
| `rounded-md` | 6px |
| `rounded-lg` | 8px |
| `rounded-xl` | 12px |
| `rounded-2xl` | 16px |
| `rounded-3xl` | 24px |
| `rounded-full` | 9999px |
```

(If unsure a Tailwind radius alias maps exactly to a px value, keep the px
column authoritative; the alias column is a convenience. The px values are the
scale — do not change them.)

### Step 4: Verify and gate

`pnpm build` → exit 0 and no `MDX compile failed for foundations/tokens`.
Start `pnpm dev --port 3060`, then
`curl -s http://localhost:3060/foundations/tokens | grep -c "TypeScale\|SpacingScale\|RadiusScale"` → 0 (specimens gone), and the page still contains "Type scale", "Spacing", "Radius", "Motion", "Colour". Kill the dev server; fresh `pnpm build` before e2e.
Then the full gate: `pnpm lint && pnpm typecheck && pnpm test && node scripts/check-standards.mjs && python3 harness/checks/token-audit.py app components lib && python3 harness/checks/a11y-static.py app components && pnpm build && pnpm test:e2e`.

**Verify**: every command exits 0.

## Test plan

- No new tests. The `/foundations/tokens` e2e route (added in plan 003) still
  guards single-main-landmark + 320/360px no-overflow; markdown tables must
  stay within the viewport (they wrap / the doc column scrolls). If overflow
  fails at 320px, that's a STOP (markdown tables shouldn't overflow, but
  report if they do rather than restructuring).

## Done criteria

ALL hold:
- [ ] lint/typecheck/test/build/test:e2e exit 0; token-audit + a11y-static exit 0
- [ ] `/foundations/tokens` renders NO full TypeScale/SpacingScale/RadiusScale specimens; type/spacing/radius are compact tables
- [ ] Colour `<TokenTable>`s and the motion table are unchanged; all "See …" links intact
- [ ] `check-standards.mjs` still passes (page stays registered; specimens still used elsewhere)
- [ ] `git status` clean; only `tokens.mdx` changed
- [ ] `plans/README.md` — left to reviewer

## STOP conditions

- Removing the specimen embeds trips `check-standards.mjs` (would mean a
  component became unused — it shouldn't, since the category pages still use
  them; report if it does).
- 320px overflow on the new tables in the e2e run.
- `tokens.mdx` differs from the Current-state excerpt (drift).

## Maintenance notes

- The compact tables now duplicate the scale values that also live in the
  specimen components / `lib/foundations/type-data.ts`. Low drift risk (these
  are fixed shadcn/TYP-3 scales), but if a scale value changes, update both the
  category specimen and this table. A future improvement (not this plan) is a
  compact `<TokenList>` that reads the same data, eliminating the duplication.
- Reviewer scrutiny: no lost links, values match the category specimens, and
  the page still reads as a reference (dense) rather than a teaching page.
