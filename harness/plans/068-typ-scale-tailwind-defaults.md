# Plan 068: Migrate the TFX type scale to Tailwind defaults — catalog, checks, site code

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT update `harness/plans/README.md` — your
> reviewer maintains the index.
>
> **Drift check (run first)**: `git diff --stat b329c0c..HEAD -- harness/standards harness/checks content/foundations/typography.mdx app components`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (L1 catalog change + site-wide visual deltas — both explicitly approved, see below)
- **Depends on**: none
- **Category**: tech-debt (standards alignment)
- **Planned at**: commit `b329c0c`, 2026-07-15

## Why this matters

The TFX Design Standard site runs on a custom pixel type scale — `{120,96,72,48,32,24,20,18,16,14,12,11}`, published in control TYP-3 — applied through Tailwind arbitrary values (`text-[32px]`, `leading-[1.6]`) in ~20 files. The harness philosophy is "the stack is fixed and boring on purpose: Base UI components, Radix Colors, shadcn/ui default tokens", and the custom scale contradicts it: every type declaration bypasses the named utility system, two values (`text-[13px]`, `text-[0.8rem]`) are off even the custom scale, and the site fails its own type-scan check (~40 ERRORs today).

The design lead has decided to **migrate the standard itself to Tailwind's default type scale** and eliminate the custom scale. Approval, to be recorded verbatim where Step 1 says so: **Approved by: Reza Ilmi (design lead), 2026-07-15 — in-session decision (chose "Migrate to Tailwind defaults" over keeping the TFX scale); recommended options adopted.**

After this plan: the published scale is Tailwind's default set, components use only named utilities (`text-xs`…`text-7xl`), the label floor rises 11px→12px, the TYP-4 all-caps violations are cleaned up, and `checks/type-scan.py` passes over `app` + `components` with zero ERRORs.

**Intentional visual deltas (approved, do not "fix" them):** page/section titles 32→30px, labels/badges/eyebrows 11→12px, eyebrows lose all-caps + wide tracking, body line-height 1.6→1.5, hero line-height 1.04→1.0.

## Current state

Repo: Next.js 15 App Router + Tailwind v4 + MDX, package manager **pnpm**. The standards catalog `harness/standards/catalog.yaml` is the single source of truth; the site reads it directly. Python checks live in `harness/checks/` (stdlib + PyYAML). Singapore English spelling in prose (organise, colour, centre).

### The two controls being changed (`harness/standards/catalog.yaml`)

`catalog.yaml:273-289` (TYP-2) and `catalog.yaml:290-303` (TYP-3), today:

```yaml
  - id: TYP-2
    source: TFX-DS
    title: Body text at least 14px; labels at least 11px; body line-height 1.5-1.6
    ...
  - id: TYP-3
    source: TFX-DS
    title: Type sizes come from the TFX type scale; no off-scale sizes
    ...
    verify: "Sizes in {120,96,72,48,32,24,20,18,16,14,12,11}; checks/type-scan"
```

Ratchet-comment convention to mirror — the TYP-5 comment at `catalog.yaml:301-304`:

```yaml
  # TYP-5: ratchet addition 2026-06-17 — tabular figures for numbers that align or
  # update, adopted from the make-interfaces-feel-better design-engineering skill;
  # high value for this number-heavy portfolio (grade tables, attendance counts,
  # live totals). Approved: harness lead (Reza Ilmi, direct instruction).
```

`harness/checks/validate.py` enforces **frontmatter parity** between each control's `detail:` file and the catalog — if you change TYP-2's title in the catalog you MUST change it in `harness/standards/controls/typ-2.md` frontmatter too, or validate fails.

### The enforcement script (`harness/checks/type-scan.py`)

- `type-scan.py:82` — `TYPE_SCALE_FALLBACK = {120, 96, 72, 48, 32, 24, 20, 18, 16, 14, 12, 11}` (embedded fallback; the live set is parsed from TYP-3's `verify` field at runtime by `load_type_scale()`, regex `Sizes in\s*\{([0-9,\s]+)\}` — the new verify string must keep that exact shape).
- `type-scan.py:199-200` — size regexes are **px-only**: `CSS_FONT_SIZE_RE = re.compile(r"font-size\s*:\s*([0-9.]+)px", ...)` and `TW_TEXT_PX_RE = re.compile(r"\btext-\[([0-9.]+)px\]")`. This is why `text-[0.8rem]` in the button escapes the scanner today.
- `type-scan.py:212-236` (`_check_size_rules`) — label floor is `if px < 11:`; TYP-3 judges only whole-px sizes: `if px == int(px) and int(px) not in type_scale:`.
- `type-scan.py:494-703` (`run_self_test`) — inline self-test, currently "SELF-TEST OK (49 cases)"-style output; `assert_violations` checks **control ids only**, not message text.
- Docstring lines 15-27 and 41-48 describe the old scale and the 11px floor.

### The old scale/floor is echoed in these files (all must be updated)

| File | What it says today |
|---|---|
| `harness/standards/controls/typ-2.md` | frontmatter `title:` = old TYP-2 title; body says "labels at least 11px", "Labels and captions are ≥ 11px (Label 11 / Caption 12 styles)", "UI labels below 11px" |
| `harness/checks/README.md:257-267` | TYP-2 floor prose ("labels may go to 11px") and TYP-3 scale set `{120,96,72,48,32,24,20,18,16,14,12,11}` |
| `harness/standards/README.md:19` | control-format example quoting the old TYP-2 title |
| `harness/docs/index.html:403` | same control-format example quoting the old TYP-2 title |
| `content/foundations/typography.mdx:12-26` | the published "Type scale" table (Display 120/96/72/48, Heading 1 32px, Label 11px) |

Do **NOT** touch historical records that mention the old scale: anything under `harness/docs/decisions/`, `harness/docs/loop-run/`, `harness/plans/0*.md`, `harness/docs/catalog-changes/` (existing files), or `harness/checks/fixtures/`. They document past states.

### Site code — current typography usage

Every custom component/page uses arbitrary values. Full inventory (from `grep -rn "text-\[" components app` at the planned-at commit): sizes used are 11, 12, 13, 14, 16, 18, 20, 24, 32, 48, 72 px plus one `0.8rem`. Arbitrary `leading-[…]` values: `1.04`, `1.05`, `1.1`, `1.6`. `uppercase` + `tracking-wider|widest` appear together at exactly 10 sites (listed in Step 5). There are **zero** arbitrary spacing values — don't introduce any.

Load-bearing excerpts (verify these before editing):

```
app/page.tsx:37:        <h1 className="mt-4 max-w-[16ch] font-display text-[48px] font-semibold leading-[1.04] tracking-tight sm:text-[72px]">
components/readers.tsx:76:        <h2 className="mt-3 max-w-[20ch] font-display text-[24px] font-semibold leading-[1.1] tracking-tight sm:text-[32px]">
app/overview/page.tsx:29:      <h1 className="mt-3 font-display text-[32px] font-semibold leading-[1.05] tracking-tight">
components/ui/button.tsx:26:        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
components/sidebar.tsx:99:  "px-1 py-1.5 text-[11px] font-semibold uppercase tracking-wider";
components/page-actions.tsx:16:  "px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors " +
```

`.prose` block in `app/globals.css:175-190` hardcodes px sizes (`font-size: 16px/32px/24px/20px/14px`), `line-height: 1.6`, and `.prose code { ... padding: 1px 4px ...}`.

Keep unchanged: `tracking-tight` on display headings, the `letter-spacing: -0.01em` on `h1,h2,h3,h4` in globals.css (display-font tuning, not scale), `scroll-padding-top: 80px`, all spacing/radius utilities, everything in `components/ui/*` except the single `text-[0.8rem]` token.

### Line-height subtlety (why "just delete leading-[1.6]" is wrong for text-sm)

Tailwind v4's named size utilities carry built-in line-heights: `text-xs` 1.333, `text-sm` ≈1.429, `text-base` 1.5, `text-lg` ≈1.556, `text-3xl` 1.2, `text-5xl`/`text-7xl` 1.0. TYP-2 requires body line-height **1.5–1.6**. So:

- Body copy at `text-base` or `text-lg`: built-in line-height is in band → **drop** the explicit `leading-[1.6]`.
- Body copy at `text-sm` or `text-xs` that today has `leading-[1.6]`: built-in would fall below 1.5 → replace `leading-[1.6]` with **`leading-normal`** (1.5).
- Display headings: drop `leading-[1.04|1.05|1.1]` entirely; the size utilities' defaults (1.0–1.2) apply, and headings are exempt from the body band.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 (fresh worktree has no `node_modules`) |
| Catalog validate | `python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py` | self-test OK; `OK: 57 controls valid` |
| Type-scan self-test | `python3 harness/checks/type-scan.py --self-test` | `SELF-TEST OK (N cases)`, exit 0 |
| Type-scan on site | `python3 harness/checks/type-scan.py components app` | exit 0, **zero ERROR lines** |
| Token audit | `python3 harness/checks/token-audit.py app components lib` | exit 0 |
| Typecheck | `pnpm typecheck` | exit 0 |
| Lint | `pnpm lint` | exit 0 |
| Unit tests | `pnpm test` | vitest all pass (19 today) |
| Build (runs prebuild gate) | `pnpm build` | exit 0 |

Python needs PyYAML (`python3 -c "import yaml"` to confirm; if missing, `pip3 install pyyaml`).

## Scope

**In scope** (the only files you may modify):

- `harness/standards/catalog.yaml` (TYP-2 title, TYP-3 title + verify, two ratchet comments — nothing else in the file)
- `harness/standards/controls/typ-2.md`
- `harness/docs/catalog-changes/typ-scale-tailwind-defaults.md` (create)
- `harness/checks/type-scan.py`
- `harness/checks/README.md` (TYP-2/TYP-3 rule prose only)
- `harness/standards/README.md` (line 19 example title only)
- `harness/docs/index.html` (line 403 example title only)
- `content/foundations/typography.mdx`
- `app/globals.css` (`.prose` block only)
- These TSX files, typography classes only: `components/{topbar,sidebar,toc,tool-card,thumbnails,doc-page,catalog-browser,breadcrumb,page-actions,readers,section-index,illo}.tsx`, `components/ui/button.tsx` (the one `text-[0.8rem]` token in size `sm`), `app/{page,layout}.tsx`, `app/{overview,for-agents}/page.tsx`, `app/standards/catalog/page.tsx`, `app/standards/catalog/[id]/page.tsx`

**Out of scope** (do NOT touch, even though they look related):

- Any other control in `catalog.yaml`; the catalog `meta:` block (`updated:` is bumped at release, per plan 066 precedent)
- `harness/checks/detect.py` and its curated rule profile (wiring more TYP rules into the hook is a deferred follow-up)
- `components/ui/*` beyond the single button token — vendored shadcn code (its named `text-xs/sm/base` utilities are already conformant; its radius clamps are governed by TOK-3)
- Historical records: `harness/docs/decisions/`, `harness/docs/loop-run/`, `harness/plans/0*.md`, existing files in `harness/docs/catalog-changes/`, `harness/checks/fixtures/`
- Font families/weights, spacing, radius, colour tokens — all excluded from this task
- `content/**` other than `typography.mdx`

## Git workflow

- Branch: `advisor/068-typ-scale-tailwind-defaults`
- Commit per step (or per logical unit); message style matches repo, e.g. `feat(standards): TYP-2/TYP-3 → Tailwind default type scale (ratchet)`, `fix(site): named type utilities replace arbitrary px values`
- Do NOT push or open a PR.

## Steps

### Step 1: Catalog — TYP-2 + TYP-3 (the ratchet change)

In `harness/standards/catalog.yaml`:

1. TYP-2 `title:` → `Body text at least 14px; labels at least 12px; body line-height 1.5-1.6`
2. TYP-3 `title:` → `Type sizes come from the Tailwind default type scale; no off-scale sizes`
3. TYP-3 `verify:` → `"Sizes in {128,96,72,60,48,36,30,24,20,18,16,14,12}; checks/type-scan"` (keep the `Sizes in {…}; checks/type-scan` shape exactly — `load_type_scale()` parses it)
4. Add one ratchet comment above **each** control (mirror the TYP-5 comment style shown in Current state), each ending with the approval line: `Approved by: Reza Ilmi (design lead), 2026-07-15 — in-session decision (chose "Migrate to Tailwind defaults" over keeping the TFX scale); recommended options adopted.`

Then update `harness/standards/controls/typ-2.md`: frontmatter `title:` to match the new catalog title exactly; body text — label floor 11→12px everywhere ("Labels and captions are ≥ 12px (Label/Caption 12 styles)"; "UI labels below 12px" in Fails when). Do not change the 14px body floor or the 1.5–1.6 band.

Update the two format examples quoting the old title: `harness/standards/README.md:19` and `harness/docs/index.html:403` (title line only in each).

**Verify**: `python3 harness/checks/validate.py` → `OK: 57 controls valid` (frontmatter parity passes). `grep -rn "labels at least 11px" harness/standards harness/docs/index.html` → no matches.

### Step 2: Change record

Create `harness/docs/catalog-changes/typ-scale-tailwind-defaults.md` (this directory is for ratchet records, NOT `docs/decisions/` which is audited against the loop-run template). Content, following the header style of `lay-7-focal-point.md`: date 2026-07-15; change type: revision of TYP-2 + TYP-3 (no new control, no tier change); the approval line from Step 1; what changed (old set `{120,96,72,48,32,24,20,18,16,14,12,11}` → Tailwind default set `{128,96,72,60,48,36,30,24,20,18,16,14,12}`; label floor 11→12px); why (harness philosophy "shadcn/ui default tokens" — the custom scale bypassed the named utility system and even its own site used arbitrary values plus two off-scale sizes 13px/0.8rem); consequences (site-wide utility migration, 32→30px titles, 11→12px labels, type-scan rem support); and the re-audit note: historical decision records citing 11px floors are grandfathered, not rewritten.

**Verify**: `python3 harness/checks/validate.py` still exits `OK: 57 controls valid` (its catalog-changes cross-ref sweep must not flag the record — refer to controls as TYP-2/TYP-3, which exist).

### Step 3: `harness/checks/type-scan.py` + checks README

1. `TYPE_SCALE_FALLBACK` → `{128, 96, 72, 60, 48, 36, 30, 24, 20, 18, 16, 14, 12}`; update the scale sets/floor mentions in the module docstring (lines ~15-27, 41-48) and `load_type_scale()`'s docstring example.
2. Label floor: in `_check_size_rules`, `if px < 11:` → `if px < 12:`; suggest strings → `"labels >= 12px, body >= 14px"` and `"body >= 14px; only short labels may go to 12px"`.
3. **rem support**: add `CSS_FONT_SIZE_REM_RE = re.compile(r"font-size\s*:\s*([0-9.]+)rem", re.IGNORECASE)` and `TW_TEXT_REM_RE = re.compile(r"\btext-\[([0-9.]+)rem\]")`; in `_check_size_rules` collect their matches as `(float(m.group(1)) * 16.0, "<source> (rem)")` alongside the px ones.
4. **Fractional sizes are off-scale**: change the TYP-3 condition from `if px == int(px) and int(px) not in type_scale:` to flag when `px != int(px)` OR `int(px) not in type_scale` (a 12.8px computed size is off-scale by definition). Format the size in the message via the existing `n_int` pattern so whole numbers print without `.0`.
5. Self-test additions (existing cases must keep passing — `assert_violations` checks ids only, and 13px/15px remain off the new scale): `text-[0.8rem]` → `["TYP-2", "TYP-3"]`; `text-[0.875rem]` (14px) → clean; CSS `font-size: 1.875rem` (30px) → clean; CSS `font-size: 0.6875rem` (11px) → `["TYP-2", "TYP-3"]` (below the new 12px label floor AND off the new scale).
6. `harness/checks/README.md`: in the type-scan section (~lines 257-267), update the TYP-2 floor prose (12px), the TYP-3 scale set, and add one line noting rem values are now converted (×16) and judged.

**Verify**: `python3 harness/checks/type-scan.py --self-test` → `SELF-TEST OK` with a case count ≥ the old count + 4. Then `python3 harness/checks/type-scan.py harness/checks/README.md` → exit 0 (README's own examples don't trip the scanner; if they do, backtick-fence them the way the file already fences code).

### Step 4: Site migration — named utilities replace arbitrary type values

Across the in-scope TSX files, apply this mapping (class attribute strings only):

| From | To |
|---|---|
| `text-[11px]`, `text-[12px]` | `text-xs` |
| `text-[13px]`, `text-[14px]` | `text-sm` |
| `text-[0.8rem]` (button.tsx:26 only) | `text-sm` (matches stock shadcn's `sm` size) |
| `text-[16px]` | `text-base` |
| `text-[18px]` | `text-lg` |
| `text-[20px]` | `text-xl` |
| `text-[24px]` | `text-2xl` |
| `text-[32px]` | `text-3xl` |
| `text-[48px]` | `text-5xl` |
| `text-[72px]` | `text-7xl` |
| `sm:text-[32px]` / `sm:text-[72px]` | `sm:text-3xl` / `sm:text-7xl` |
| `leading-[1.04]`, `leading-[1.05]`, `leading-[1.1]` (display headings) | delete |
| `leading-[1.6]` next to `text-base`/`text-lg` | delete |
| `leading-[1.6]` next to `text-sm`/`text-xs` | `leading-normal` |

The `leading-[1.6]`-with-small-text sites (get `leading-normal`): `components/tool-card.tsx:28`, `components/illo.tsx:19`, `components/illo.tsx:25`, `app/overview/page.tsx:97,104,113`. Every other `leading-[…]` is deleted.

Then the `.prose` block in `app/globals.css`: `.prose` `font-size: 16px` → `font-size: var(--text-base)`; `line-height: 1.6` → `1.5`; h1 `32px` → `var(--text-3xl)`; h2 `24px` → `var(--text-2xl)`; h3 `20px` → `var(--text-xl)`; table `14px` → `var(--text-sm)`; `.prose code` padding `1px 4px` → `2px 4px`. (Tailwind v4 exposes `--text-*` theme variables globally; the build will confirm they resolve.) Leave the `.prose code { font-size: 0.875em }` relative size and everything else in the block as is.

**Verify**: `grep -rn "text-\[" components app | grep -v "text-\[.*ch\]"` → no matches (the `max-w-[NNch]` utilities are width, not type — they won't match `text-\[` anyway; expect plain zero matches). `grep -rn "leading-\[" components app` → no matches. `pnpm typecheck` → exit 0.

### Step 5: TYP-4 cleanup — remove all-caps eyebrows

At exactly these 10 sites, remove `uppercase` AND the paired `tracking-wider`/`tracking-widest` (wide tracking is an all-caps convention; the eyebrows keep their size/weight/colour classes):

- `components/readers.tsx:73` and `:96`
- `components/section-index.tsx:15`
- `components/sidebar.tsx:99` (a string constant, not JSX)
- `components/thumbnails.tsx:142`
- `components/toc.tsx:31`
- `components/tool-card.tsx:23`
- `app/page.tsx:34` and `:103`
- `app/overview/page.tsx:26`

The source strings are already sentence case (the transform did the capitalisation) — do not re-case any content. Do NOT remove `tracking-tight` anywhere (display headings keep it).

**Verify**: `grep -rn "uppercase\|tracking-wider\|tracking-widest" components app` → no matches. `python3 harness/checks/type-scan.py components app` → exit 0, zero ERRORs.

### Step 6: Published scale page — `content/foundations/typography.mdx`

Rewrite the "Type scale" table and its surroundings (keep frontmatter `status: settled` — the revision is design-lead approved; keep the fonts table and the rest of the page):

| Step | Size | Font |
| --- | --- | --- |
| Display | 96 / 72 / 60 / 48px | Plus Jakarta Sans 600 |
| Heading 1 | 30px | Plus Jakarta Sans 600 |
| Heading 2 | 24px | Plus Jakarta Sans 600 |
| Heading 3 | 20px | Plus Jakarta Sans 600 |
| Body Large | 18px | Inter 400 |
| Body | 16px | Inter 400 |
| Body Small | 14px | Inter 400 |
| Caption / Label | 12px | Inter 500 / 600, sentence case |

After the table, replace the existing note line with: the scale **is** the Tailwind default type scale (`text-xs` … `text-9xl`); sizes are used via named utilities, never arbitrary `text-[Npx]` values. Body line-height: 1.5–1.6. Related controls: TYP-1, TYP-2, TYP-3, TYP-4. Keep the Usage Do/Don't lists (they remain true; "body text below 14px" is unchanged). Write in the page's existing voice — short, second person where applicable, sentence case, no AI-writing tells (no "robust", "seamless", "it's important to note").

**Verify**: `pnpm build` → exit 0 (MDX parses; prebuild gate green).

### Step 7: Full gate

Run, in order, and record each result:

1. `python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py` → self-test OK + `OK: 57 controls valid`
2. `python3 harness/checks/type-scan.py --self-test` → SELF-TEST OK
3. `python3 harness/checks/type-scan.py components app` → exit 0, no ERRORs
4. `python3 harness/checks/token-audit.py app components lib` → exit 0
5. `pnpm typecheck && pnpm lint` → both exit 0
6. `pnpm test` → all vitest tests pass
7. `pnpm build` → exit 0

## Test plan

No new vitest tests — the enforcement surface here is the Python self-tests. New self-test cases (Step 3.5) are the regression net: rem conversion, fractional-px off-scale, the new 12px floor, and 30px-on-scale. `lib/catalog.test.ts` has no assertions on the type scale (verified at planning time) — if it fails, that's a STOP, not something to patch.

## Done criteria

ALL must hold (machine-checkable):

- [ ] `python3 harness/checks/validate.py` → `OK: 57 controls valid`
- [ ] `python3 harness/checks/type-scan.py --self-test` → SELF-TEST OK, case count increased
- [ ] `python3 harness/checks/type-scan.py components app` → exit 0, zero ERROR lines
- [ ] `python3 harness/checks/token-audit.py app components lib` → exit 0
- [ ] `grep -rn "text-\[" components app` → 0 matches; `grep -rn "leading-\[" components app` → 0 matches; `grep -rn "uppercase" components app` → 0 matches
- [ ] `grep -rn "labels at least 11px" harness/standards harness/docs/index.html content` → 0 matches
- [ ] `grep -c "text-\[0.8rem\]" components/ui/button.tsx` → 0
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` all exit 0
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `harness/docs/catalog-changes/typ-scale-tailwind-defaults.md` exists and contains the approval line verbatim

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows in-scope files changed since `b329c0c`, and any "Current state" excerpt no longer matches the live code.
- `validate.py` fails for any reason other than the TYP-2 frontmatter parity you are in the middle of fixing (e.g. it flags the new catalog-changes record) — twice after one fix attempt.
- `pnpm test` (vitest) fails — the plan asserts no test depends on the type scale; a failure means that assertion is wrong.
- The type-scan self-test cannot pass without weakening an existing assertion (existing cases must keep passing unmodified except where Step 3 names them).
- Zero-ERROR type-scan over `components app` requires editing any file not in scope (e.g. a violation inside `components/ui/*` beyond the button token).
- You find `text-[Npx]` values not covered by the Step 4 mapping table.

## Maintenance notes

- **Reviewer/user must visually spot-check** after merge: landing hero (72px, line-height 1.0), a doc page title (30px, was 32), sidebar/toc/eyebrow labels (12px, sentence case, no wide tracking), catalog tier badges, one MDX prose page. The checks can't see rendered output.
- Future UI code should use named `text-*` utilities only; type-scan now catches px **and** rem arbitrary values, so regressions surface in `verify`.
- Deferred follow-ups: wire TYP-2/TYP-3/TYP-4 into `detect.py`'s curated hook profile now that the site is clean (today only TYP-1 runs there); consider a `leading-[…]` grep in the hook; catalog `meta.updated` bump at next release (066 precedent).
- Historical decision records (`harness/docs/decisions/*`) still cite the 11px floor — grandfathered deliberately; `checks/reaudit-scope.py TYP-2` lists candidates if a re-audit is ever wanted.
