# Plan 022: Stitch — the live loop becomes the landing hero visual; cross-links and seam checks

> **Executor instructions**: This plan runs AFTER plans 016–021 and 023 are
> merged into one tree — your worktree already contains all of them. Follow it
> step by step; run every verification; STOP conditions are binding. Do NOT
> update `plans/README.md` — your reviewer maintains the index.
>
> **Precondition check (run first)**:
> `test -f components/diagrams/orbit-loop.tsx && grep -c "Hero visual: the live loop diagram lands here" app/page.tsx && grep -c "motion-story" app/globals.css`
> → file exists, marker count 1, token count ≥1. Anything else = STOP.

## Status

- **Priority**: P1 (the last mile of the presentation story)
- **Effort**: S
- **Risk**: LOW (one embed + link/copy seams on an already-green tree)
- **Depends on**: 016, 017, 018, 019, 020, 021, 023 all DONE and merged
- **Category**: direction
- **Planned at**: the integration tree (reviewer records the SHA at dispatch)

## Why this matters

Plan 019 removed the landing hero's empty illustration placeholder and left a
marked slot; plan 017 built the OrbitLoop. Stitching them makes the division's
first impression the standard's own machinery, live and moving — instead of a
dashed box. The remaining seams (a stale count, cross-links between the new
surfaces) are exactly the kind of drift the standard says to catch.

## Current state (verify in YOUR tree — it includes 016–021, 023)

- `app/page.tsx` contains the marker comment
  `{/* Hero visual: the live loop diagram lands here (plan 022). */}` where the
  `<Parallax><Illo …/></Parallax>` block used to be (after the CTA section).
- `components/diagrams/orbit-loop.tsx` exports `OrbitLoop` with
  `variant?: "full" | "inline"`, self-contained, reduced-motion safe.
- `app/standards/page.tsx` (plan 018) has an h2 sub-line stating the control
  count in prose ("Sixty-two controls read as one demo." or the number the
  executor used).
- `components/landing-motion.tsx` still exports `Reveal` (and `Parallax`, which
  may now have zero consumers — leave it; removal is not this plan).
- The catalog count ground truth: `grep -c "^  - id:" harness/standards/catalog.yaml`.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck / Lint / Tests | `pnpm typecheck && pnpm lint && pnpm test` | exit 0 |
| Standards guard | `node scripts/check-standards.mjs` | OK |
| Full build | `pnpm build` | exit 0, no `[doc-page]` warnings |
| Dev | `pnpm dev --port 4022` | serves |

## Scope

**In scope**: `app/page.tsx` (hero embed + one link), `app/standards/page.tsx`
(count line only, and only if drifted), `content/harness/loop.mdx` (one
cross-link line only, and only if Step 3 finds it missing).

**Out of scope**: everything else — this is a stitch, not a pass. No component
edits, no copy rewrites, no nav changes.

## Git workflow

- Worktree branch `advisor/022-hero-stitch`; single commit
  `feat(site): loop diagram as the landing hero`; do not push.

## Steps

### Step 1: Hero embed

Replace the marker comment in `app/page.tsx` with:

```tsx
<Reveal className="mt-14">
  <OrbitLoop />
  <p className="mt-3 text-[13px] text-muted-foreground">
    The design loop, live — two human gates, intent without loss.{" "}
    <Link href="/harness/loop" className="text-tw-blue underline underline-offset-2">
      How the loop works
    </Link>
  </p>
</Reveal>
```

Add the `OrbitLoop` import; `Reveal` and `Link` are already imported. If
`Parallax` is now unused in this file, remove it from the import line only.

**Verify**: `pnpm typecheck && pnpm lint` → exit 0; dev: `/` shows the ring
with its detail panel under the CTA row; tab order reaches the phase tabs;
reduced-motion shows no travelling dot.

### Step 2: Count-line truth on /standards

`N=$(grep -c "^  - id:" harness/standards/catalog.yaml)` — if the prose count
in `app/standards/page.tsx`'s demo intro differs from N, correct it (spell the
number in words if it currently is, digits if digits).

**Verify**: the stated count equals N.

### Step 3: Cross-link seam

Check `content/harness/loop.mdx` links to `/harness/get-started` OR
`/standards/catalog` somewhere in its body (`grep -c "get-started\|standards/catalog" content/harness/loop.mdx`).
If 0: append one sentence to the intro paragraph linking the catalog ("Every
phase grades against the [control catalog](/standards/catalog).") — nothing
else.

### Step 4: Full gate + evidence

`pnpm typecheck && pnpm lint && pnpm test && pnpm build && node scripts/check-standards.mjs`
→ all green. agent-browser captures (`pnpm dev --port 4022`): `/` at 360 and
1280 (hero with the ring), `/` at 1280 reduced-motion if the tool supports it.
Paths in NOTES.

## Test plan

None new — this plan wires existing tested pieces; the gates above are the
acceptance.

## Done criteria

- [ ] All commands in Step 4 exit 0
- [ ] `grep -c "Hero visual: the live loop diagram lands here" app/page.tsx` → 0
- [ ] `grep -c "OrbitLoop" app/page.tsx` → ≥2 (import + render)
- [ ] `grep -c "Illo" app/page.tsx` → 0 (still)
- [ ] /standards count line equals the catalog count
- [ ] Only in-scope files modified (`git status`)

## STOP conditions

- The precondition check fails (a dependency didn't merge).
- The hero embed collides visually at 360px (ring clipped / labels overlap)
  — report with a screenshot; do not restyle OrbitLoop from this plan.

## Maintenance notes

- If a future plan re-adds an illustration to the hero, OrbitLoop should move
  to the "Why a standard" section rather than disappear — record intent here.
- `Parallax` may now be consumer-less; leave removal to a hygiene plan.
