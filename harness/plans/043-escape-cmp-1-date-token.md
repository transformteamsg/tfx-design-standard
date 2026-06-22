# Plan 043: Escape the bare `<date>` token in `controls/cmp-1.md` so the detail page renders as prose

> **Executor instructions**: Follow this plan step by step. Run the verification
> command and confirm the expected result. If the "STOP conditions" occur, stop
> and report. Update this plan's row in `plans/README.md` when done (unless a
> reviewer maintains the index).
>
> **Drift check (run first)**: `git diff --stat e1ccae1..HEAD -- harness/standards/controls/cmp-1.md "app/standards/catalog/[id]/page.tsx"`
> If `cmp-1.md` changed since this plan was written, re-confirm the bare-token line below
> before editing; on a mismatch, STOP.

## Status

- **Priority**: P3 (cosmetic rendering hygiene; the page already renders safely via a fallback)
- **Effort**: XS
- **Risk**: LOW — a one-line escape in a harness control body; read-only over everything else
- **Depends on**: none. (Originated as plan 042 follow-up F1.)
- **Category**: docs / harness hygiene
- **Planned at**: commit `e1ccae1`, 2026-06-22

## Why this matters

`harness/standards/controls/cmp-1.md` contains a bare angle-bracket token — `<date>` — **in
prose** (not inside a code span). MDX reads `<date>` as an unclosed JSX tag, so compiling the
control body throws. The per-control page `app/standards/catalog/[id]/page.tsx` catches that and
falls back to rendering the raw body in a `<pre>` block (a deliberate safety net, plan 036). The
result: `/standards/catalog/cmp-1` is reachable (200) and safe, but its body reads as a raw
preformatted dump instead of formatted guidance — the only control page that does. The `.md`
twin is unaffected (it always emits the raw body). This plan removes the one stray token so the
page renders as normal prose.

## Current state

`harness/standards/controls/cmp-1.md` — every `<…>` occurrence (verified by grep):

- **Line 71** — `` `<Button>` ``, `` `<Dialog>` ``, `` `<ConfirmRow>` `` — **inside backticks**
  (inline code). SAFE — do not touch.
- **Line 78** — `` `CMP-1: verified against .tfx/component-manifest.json (generated: <date>, coverage: <complete|partial>)` ``
  — the whole string is **inside backticks**. SAFE — do not touch.
- **Line 79** — `` `CMP-1: asserted, no manifest — manifest absent for <product>` `` — **inside
  backticks**. SAFE — do not touch.
- **Line 91** — the **only** offender, a bare token in prose (double-quoted, NOT backticked):
  ```
  "verified against partial manifest (generated: <date>) — diff not run".
  ```
  Here `<date>` is parsed by MDX as JSX → the compile error that triggers the `<pre>` fallback.

So the fix is a **single line** (91). The backticked tokens on 71/78/79 are already correct and
must be left as-is.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Build (recompiles MDX) | `pnpm build` (repo root) | exit 0 |
| Page renders as prose (not `<pre>`) | serve + curl (see Step 2) | body is formatted HTML, no `<pre>` fallback note |
| Twin still served | `curl -s -o /dev/null -w '%{http_code} %{content_type}' http://localhost:3000/standards/catalog/cmp-1.md` | `200 text/markdown` |

## Scope

**In scope** (modify): `harness/standards/controls/cmp-1.md` — **line 91 only**.

**Out of scope** (do NOT touch):
- Lines 71/78/79 (their tokens are already safely backticked).
- `app/standards/catalog/[id]/page.tsx` — the `<pre>` fallback is a correct safety net for any
  future stray token; leave it.
- Any other control file or component.

## Git workflow

- Branch: `advisor/043-cmp1-date-token`. Conventional commit
  (`fix(catalog): escape bare <date> token in cmp-1.md so the detail page renders as prose`).
  Do NOT push.

## Steps

### Step 1: Escape the bare token (line 91)

Wrap the `<date>` on line 91 in backticks so MDX treats it as inline code, matching how the same
token is shown on line 78. Change:
```
"verified against partial manifest (generated: <date>) — diff not run".
```
to:
```
"verified against partial manifest (generated: `<date>`) — diff not run".
```
(Backticking just the token keeps the sentence readable. Do NOT alter the surrounding prose.)

**Verify**: `grep -nE '\(generated: <date>\)' harness/standards/controls/cmp-1.md` returns
nothing (the bare form is gone); `grep -nE '\(generated: `<date>`\)' …` finds the escaped form.

### Step 2: Confirm the page renders as prose

`pnpm build` (exit 0), then serve and check the page no longer uses the fallback:
- `pnpm start &` (background); wait: `curl --retry 40 --retry-delay 1 --retry-connrefused -sf http://localhost:3000/ -o /dev/null`
- `curl -s http://localhost:3000/standards/catalog/cmp-1 | grep -c "raw Markdown source"` → **0**
  (the fallback path renders a visible "Showing the raw Markdown source …" note; 0 means the body
  now compiled as MDX). Also confirm a normal heading rendered:
  `curl -s http://localhost:3000/standards/catalog/cmp-1 | grep -c "<h2"` → **> 0**.
- `curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:3000/standards/catalog/cmp-1.md` → `200 text/markdown` (twin unaffected).
- Stop the server (`kill %1`).

**Verify**: the "raw Markdown source" note count is 0 and at least one `<h2` is present.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `cmp-1.md` line 91's `<date>` is backticked; lines 71/78/79 unchanged
- [ ] `pnpm build` exits 0
- [ ] `/standards/catalog/cmp-1` renders the body as MDX prose (the "raw Markdown source" fallback note is absent; an `<h2>` is present)
- [ ] `/standards/catalog/cmp-1.md` still returns `200 text/markdown`
- [ ] Only `harness/standards/controls/cmp-1.md` modified
- [ ] `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- After escaping line 91 the page STILL uses the `<pre>` fallback — there is another bare token
  the grep missed (the build error names the line); escape that one too, or report.
- The build error points at a backticked token (71/78/79) — that would mean MDX is mis-parsing
  inside code spans, which is a different (toolchain) problem; STOP and report rather than
  un-backticking working examples.

## Maintenance notes

- Placeholder tokens in control bodies must always be backticked (`` `<date>` ``) or escaped —
  the `<pre>` fallback in the detail page is a safety net, not a license to ship bare tokens.
- A reviewer should confirm only line 91 changed and the page renders as prose.
