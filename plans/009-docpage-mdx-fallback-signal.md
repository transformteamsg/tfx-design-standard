# Plan 009: Make the DocPage MDX fallback loud at build time and honest in the UI

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT update `plans/README.md` — the reviewer
> maintains the index.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- components/doc-page.tsx`
> If the file changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `233f3be`, 2026-07-11

## Why this matters

`components/doc-page.tsx` wraps `compileMDX` in a bare `catch {}` that converts
**every** MDX compile failure into a raw-markdown `<pre>` fallback. The comment
documents an intentional case (a stray angle token like `<date>` in prose), but
the catch is unconditional and silent: a genuinely broken doc (unclosed JSX tag,
plugin error) now ships to production as a verbatim source dump while
`pnpm build` and CI stay green — the exact regression the repo's CLAUDE.md
verification contract ("After content edits run `pnpm build` to verify MDX
parses") used to catch. Additionally, in the fallback branch the page still
renders the ToC rail whose anchor links target heading ids that only exist in
the compiled path — every rail link is dead. Finally, the fallback note is
passive voice, violating the repo's own copy rule (CLAUDE.md: "Copy: second
person, active voice, sentence case, plain language").

This plan keeps the intentional fallback but (a) logs a loud, greppable
build-time warning naming the doc, (b) suppresses the dead ToC in fallback,
(c) rewrites the fallback note in active voice.

## Current state

- `components/doc-page.tsx` — the shared doc renderer for all `content/` pages.

`components/doc-page.tsx:28-43` today:

```tsx
  /* Doc bodies are plain Markdown, but a stray angle token outside a code
     span (e.g. "<date>" in prose) makes MDX read it as an unclosed JSX tag.
     Compile in a try/catch; on failure fall back to a preformatted block with
     a visible note rather than aborting the build with a broken page. */
  let rendered: ReactNode = null;
  let rawFallback = false;
  try {
    const { content } = await compileMDX({
      source: doc.content,
      components: { h2: heading("h2"), h3: heading("h3") },
      options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
    });
    rendered = content;
  } catch {
    rawFallback = true;
  }
```

`components/doc-page.tsx:71-80` (fallback UI, passive-voice note):

```tsx
        {rawFallback ? (
          <div className="mt-8">
            <p className="text-[14px] text-muted-foreground">
              Showing the raw Markdown source — this doc uses a token the renderer reads as
              markup, so it is shown verbatim below.
            </p>
```

`components/doc-page.tsx:86` (ToC renders regardless of fallback):

```tsx
      {headings.length >= 2 && <Toc headings={headings} />}
```

`Doc` comes from `@/lib/content`; it has `doc.section` and `doc.slug` fields
(see `lib/content.ts`) usable to name the failing doc in the log.

Repo conventions: comments state constraints, not narration; copy in second
person / active voice / sentence case; Tailwind v4 classes with CSS-variable
tokens only (no raw hex).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm typecheck` | exit 0 |
| Lint | `pnpm lint` | exit 0 |
| Build | `pnpm build` | exit 0 (and NO `[doc-page]` warnings — all current docs compile) |
| Tests | `pnpm test` | 19+ tests pass |

## Scope

**In scope**:
- `components/doc-page.tsx`

**Out of scope**:
- `lib/content.ts`, `lib/toc.ts`, `components/toc.tsx` — no API changes needed.
- Any `content/**` file — do not "fix" docs to avoid the fallback.
- Do NOT make the build fail on fallback — the stray-angle-token tolerance is a
  documented product decision; this plan makes it visible, not fatal.

## Git workflow

- Branch: `advisor/009-docpage-mdx-fallback-signal` from `233f3be`
- Commit style: `fix(site): log MDX fallback at build time, drop dead ToC in fallback`
- Do NOT push or open a PR.

## Steps

### Step 1: Log the failure with the doc identity

In the `catch` block, capture the error and emit one greppable warning line:

```tsx
  } catch (err) {
    rawFallback = true;
    console.warn(
      `[doc-page] MDX compile failed for ${doc.section}/${doc.slug} — serving raw-markdown fallback:`,
      err instanceof Error ? err.message : err,
    );
  }
```

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Suppress the ToC in the fallback branch

Change line 86 so the rail only renders when the compiled article rendered:

```tsx
      {!rawFallback && headings.length >= 2 && <Toc headings={headings} />}
```

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Rewrite the fallback note in active voice

Replace the note copy with second-person, active-voice text, e.g.:

```
This doc contains a token the renderer reads as markup, so you are seeing the
raw Markdown source.
```

(Keep it one sentence, sentence case, no em-dash chains.)

**Verify**: `python3 harness/checks/content-lint.py components/doc-page.tsx` → exit 0 (no CNT-3 passive-voice finding on the new string).

### Step 4: Full gates

**Verify**:
- `pnpm build` → exit 0, and `pnpm build 2>&1 | grep "\[doc-page\]"` → no output (no doc currently falls back).
- `pnpm test` → all pass.
- `pnpm lint` → exit 0.

## Test plan

No new unit test file: `DocPage` is an async RSC with no existing component
test harness, and the fallback path is exercised by the build gate. The
verification is behavioural: temporarily add a line `Broken <Tool demo` to any
doc under `content/guidelines/`, run `pnpm build`, confirm the build **passes**
and prints the `[doc-page]` warning naming that doc, then revert the temp edit
(`git checkout -- content/`). Record the observed warning line in your report.

## Done criteria

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` all exit 0
- [ ] The temp-broken-doc rehearsal printed a `[doc-page]` warning naming the doc, and the fallback page (in `pnpm build` output or dev render) has no ToC rail
- [ ] `content/` is untouched at the end (`git status`)
- [ ] The fallback note copy is active voice, second person, sentence case

## STOP conditions

- The `catch` block or fallback JSX no longer matches the excerpts (drift).
- Making the rehearsal doc fail does NOT trigger the fallback (the assumption
  that compileMDX throws for broken docs is false) — report what happened.
- You find yourself wanting to change `lib/content.ts` or the build pipeline —
  out of scope.

## Maintenance notes

- If the site later wants fallbacks to fail CI, grep for `[doc-page]` in build
  output in the CI workflow — the log line added here is the hook for that.
- Reviewer: check the rehearsal evidence (warning line) — it is the only proof
  the fallback path still works after the edit.
