# Plan 043: Escape the bare `<date>` token in `controls/cmp-1.md` (STUB — specify fully before executing)

> **Stub only.** Filed by the Batch 4 parity review (plan 042, follow-up F1). Specify
> fully before executing — this stub records the problem and the fix shape, not the steps.

## Status

- **Priority**: P3 (cosmetic-rendering hygiene; the page already renders safely)
- **Effort**: XS
- **Risk**: LOW — a one-file escape in a harness control body; read-only over everything else
- **Category**: docs / harness hygiene
- **Planned at**: 2026-06-22, from the Batch 4 parity review record
  (`docs/reviews/batch4-parity-2026-06-22.md`, follow-up F1)

## Why this matters

`harness/standards/controls/cmp-1.md` contains bare angle-bracket tokens — `<date>` and
`<complete|partial>` (around lines 78 and 91) — that MDX cannot parse as text. The
per-control page `/standards/catalog/cmp-1` therefore falls back to a graceful `<pre>`
block (the tokens render escaped as `&lt;date&gt;`) instead of rendering the control body
as normal prose. The `.md` twin is unaffected. This is purely a rendering-quality issue:
the page is reachable (200) and safe, but the CMP-1 detail body reads as a raw `<pre>`
dump rather than formatted guidance.

## The specific drift / defect

- File: `harness/standards/controls/cmp-1.md`, the two lines carrying `<date>` /
  `<complete|partial>` inside example strings.
- Effect: the per-control page renders the body through its `<pre>` fallback path instead
  of as MDX prose.

## Fix shape (specify fully before executing)

- Escape the angle brackets so MDX treats them as literal text — wrap the example strings
  in backticks (e.g. `` `... (generated: <date>, coverage: <complete|partial>)` ``) or
  escape as `\<date\>` — whichever keeps the example readable and matches how other control
  files show placeholder tokens.
- Re-run `pnpm build` and confirm `/standards/catalog/cmp-1` renders the body as prose (no
  `<pre>` fallback) and the `.md` twin is still 200 `text/markdown`.
- Touch only `controls/cmp-1.md`; do not change the page's fallback logic (it is a correct
  safety net for any future stray token).

## Done criteria

- [ ] `controls/cmp-1.md` `<date>` / `<complete|partial>` tokens escaped
- [ ] `/standards/catalog/cmp-1` renders the body as formatted prose, not a `<pre>` fallback
- [ ] `pnpm build` exits 0; the `.md` twin still returns 200 `text/markdown`
- [ ] No other file touched
