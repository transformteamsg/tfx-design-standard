# Batch 4 parity review — catalog ↔ skills ↔ website

- **Date**: 2026-06-22
- **Commit reviewed**: `c66e835` (branch `advisor/batch4-execute`)
- **Reviewer**: parity-review executor (plan 042), read-only
- **Verdict**: **Batch 4 parity: clean** — zero `drift`, zero `needs-human`. Four findings
  recorded as follow-ups (a harness-file escape, two recording-check triage lists, and a
  stale-waiver reconciliation). None of them are parity drift between the three surfaces.

## Scope of this review (which batch plans landed)

All of 033–041 are present, so no matrix row is `n/a`. Derived from the tree, not memory:

| Plan | Landed | Evidence |
| --- | --- | --- |
| 033 markdown twins + `/llms.txt` | yes | `lib/markdown-twin.ts` exists; `/md/[...path]` route built (79 twins); `/llms.txt` + `/llms-full.txt` build |
| 034 validate testable + wired | yes | `package.json` `"prebuild"` starts `validate.py --self-test && validate.py …` |
| 035 `tfx-sync` markers + parity | yes | `tfx-sync` markers in `CLAUDE.md` + `tfx-design-ui` + `tfx-content-style` + `slp-9.md`; `docs/SYNC.md` exists; `[L0-SYNC]` / `[SLP9-SYNC]` helpers in `validate.py` |
| 036 per-control pages + twins | yes | `app/standards/catalog/[id]` dynamic segment beside `page.tsx`; 47 per-control pages + 47 `.md` twins build and return 200 |
| 037 guidelines single-source | yes | `content/guidelines/voice-tone.mdx` + `naming.mdx` link `/standards/catalog/<id>` |
| 038 content-lint + type-scan | yes | `harness/checks/content-lint.py`, `type-scan.py` exist with `--self-test` |
| 040 waiver-reconcile | yes | `harness/checks/waiver-reconcile.py` exists with `--self-test` |
| 041 reaudit-scope | yes | `harness/checks/reaudit-scope.py` exists with `--self-test` |

> Note: the per-control route is `app/standards/catalog/[id]` (a dynamic segment), not a
> literal `<id-lower>` directory — the plan text used `<id>` as a placeholder. Twin URLs
> resolve through `lib/markdown-twin.ts` + `content/map.json` and the `/md/[...path]`
> middleware rewrite (the namespace is `/md`, not `/_md`, because Next treats `_`-prefixed
> folders as private).

## Machine gate (the floor)

Every present check passed; `pnpm build` exited 0; both required `.md` twins returned
`200 text/markdown`.

| Check | Command (dir) | Result | Exit |
| --- | --- | --- | --- |
| validate (real) | `checks/validate.py` (harness) | `OK: 47 controls valid` | 0 |
| validate self-test | `checks/validate.py --self-test` (harness) | `SELF-TEST OK (27 cases)` | 0 |
| audit-record (real) | `checks/audit-record.py` (root) | `OK: 4 records audited` | 0 |
| audit-record self-test | `checks/audit-record.py --self-test` (harness) | `SELF-TEST OK (21 cases)` | 0 |
| component-manifest self-test | `checks/component-manifest.py --self-test` (harness) | `SELF-TEST OK (11 cases)` | 0 |
| content-lint self-test | `checks/content-lint.py --self-test` (harness) | `SELF-TEST OK (19 cases)` | 0 |
| type-scan self-test | `checks/type-scan.py --self-test` (harness) | `SELF-TEST OK (18 cases)` | 0 |
| waiver-reconcile self-test | `checks/waiver-reconcile.py --self-test` (harness) | `SELF-TEST OK (7 cases)` | 0 |
| reaudit-scope self-test | `checks/reaudit-scope.py --self-test` (harness) | `SELF-TEST OK (8 cases)` | 0 |
| site build | `pnpm build` (root) | `✓ Compiled successfully`; prebuild chain green; 47 control pages + 79 `.md` twins prerendered | 0 |
| plugin validate | `claude plugin validate harness` (root) | `✔ Validation passed with warnings` (1 pre-existing warning: CLAUDE.md at plugin root not loaded as context — informational, predates this batch) | 0 |

`token-audit` + `a11y-static` run inside the prebuild chain over the real tree (covered by
the green build).

**Recording-only checks (NOT wired into prebuild by design — findings, not build gates):**

| Check | Command (dir) | Result | Exit |
| --- | --- | --- | --- |
| content-lint (real) | `checks/content-lint.py content` (root) | 13 `[CNT-3]` long-sentence findings in `content/` | 1 |
| type-scan (real) | `checks/type-scan.py app components` (root) | 37 `[TYP-2]` small-text findings in `app`/`components` | 1 |
| waiver-reconcile (real) | `checks/waiver-reconcile.py` (root) | 3 `[CMP-1]` stale-waiver NOTEs | 0 |

Exit 1 on content-lint / type-scan is expected — they report real-tree findings and are
not part of the build gate. Their findings are triage items (follow-ups F2, F3), not
parity drift.

**Twin reachability** (server: `pnpm start` on `:3000`):

| URL | Status | Content-type |
| --- | --- | --- |
| `/guidelines/voice-tone.md` (section twin) | 200 | `text/markdown; charset=utf-8` |
| `/standards/catalog.md` (catalog twin) | 200 | `text/markdown; charset=utf-8` |
| `/standards/catalog/a11y-1` (per-control page) | 200 | `text/html; charset=utf-8` |
| `/standards/catalog/a11y-1.md` (per-control twin) | 200 | `text/markdown; charset=utf-8` |

All 47 per-control pages and all 47 per-control `.md` twins were curl-checked: 47/47 each
returned 200.

## 3a — Control coverage (one row per catalog control)

The URL space equals the catalog: all 47 controls have a browsable page (036) and a `.md`
twin (033/036), confirmed by curling every id (47/47 page = 200, 47/47 twin = 200
`text/markdown`). "Referenced in a skill" is informational — not every control must be named
in a skill; only a skill naming a control the catalog lacks would be drift, which
`validate.py`'s xref check catches (it passed). The table is grouped for skimmability; every
control carries the same per-cell verdict because coverage is uniform.

| Control | Browsable page (036) | `.md` twin (033/036) | In a skill | Verdict | Evidence |
| --- | --- | --- | --- | --- | --- |
| A11Y-1 | yes (200) | yes (200) | yes | match | curl `/standards/catalog/a11y-1` + `.md`; `grep` in skills |
| A11Y-2 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| A11Y-3 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| A11Y-4 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| A11Y-5 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| A11Y-6 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| A11Y-7 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| A11Y-8 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| A11Y-9 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| A11Y-10 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| A11Y-11 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| TOK-1 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| TOK-2 | yes (200) | yes (200) | no | match | curl page + twin; not named in a skill (informational — catalog owns it; no xref error) |
| TOK-3 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| TYP-1 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| TYP-2 | yes (200) | yes (200) | no | match | curl page + twin; informational (see TOK-2) |
| TYP-3 | yes (200) | yes (200) | no | match | curl page + twin; informational (see TOK-2) |
| TYP-4 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| TYP-5 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| COL-1 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| COL-2 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| CMP-1 | yes (200, `<pre>` fallback) | yes (200) | yes | match | curl page + twin; in skills — see finding F1 (bare `<date>` token rendered via graceful fallback) |
| CMP-2 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| CMP-3 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| CMP-5 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| CMP-6 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| CNT-1 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| CNT-2 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| CNT-3 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| MOT-1 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| IDN-1 | yes (200) | yes (200) | no | match | curl page + twin; informational (see TOK-2) |
| SLP-1 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| SLP-2 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| SLP-3 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| SLP-4 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| SLP-5 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| SLP-6 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| SLP-7 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| SLP-8 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| SLP-9 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| SLP-10 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| SLP-11 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| LAY-2 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| LAY-3 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| LAY-4 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| LAY-5 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |
| LAY-6 | yes (200) | yes (200) | yes | match | curl page + twin; in skills |

3a totals: 47 `match`, 0 `drift`, 0 `n/a`, 0 `needs-human`.

## 3b — Fragment parity (the mechanical floor, plan 035)

035 landed, so the verdict is whatever `validate.py` reports. It exited 0 with
`OK: 47 controls valid`, which runs the `[L0-SYNC]` and `[SLP9-SYNC]` parity helpers
(`l0_parity_errors`, `slp9_parity_errors` in `checks/validate.py`).

| Fragment | Surfaces | Verdict | Evidence |
| --- | --- | --- | --- |
| L0 non-negotiables | `CLAUDE.md` + `tfx-design-ui` SKILL vs catalog `tier:L0` set | match | `validate.py` `[L0-SYNC]` passes; inline lists (both wrapped in `<!-- tfx-sync:L0 -->` markers) equal the catalog L0 set `{A11Y-1, A11Y-2, A11Y-3, CMP-2}` |
| SLP-9 buzzwords | `tfx-content-style` skill vs `controls/slp-9.md` | match | `validate.py` `[SLP9-SYNC]` passes; the skill's `slp9-buzzwords` block is a subset of the canonical list in `slp-9.md` (both wrapped in `<!-- tfx-sync:slp9-buzzwords -->` markers) |

3b totals: 2 `match`, 0 `drift`, 0 `n/a`, 0 `needs-human`.

## 3c — Guideline ↔ catalog parity (plan 037 + the deferred table check)

One row per `content/guidelines/*.mdx`. Plan 037 (lines 132–134) deliberately scopes
single-sourcing to **voice-tone + naming only**; the other five guideline pages are
"presentation guidance not tied to a single content control" and are explicitly left
standalone. So a page that names a control as a cross-reference (e.g. `(A11Y-2)`) without
linking is not drift — it is out of 037's deference scope. Only voice-tone + naming are
required to defer.

| Guideline page | Control(s) it should defer to | Defers (links the control) | Restated-rule drift | Verdict | Evidence |
| --- | --- | --- | --- | --- | --- |
| voice-tone.mdx | CNT-3, CNT-1, SLP-9 | yes — links `/standards/catalog/cnt-3`, `/cnt-1`, `/slp-9`, `/cmp-2`, and `/standards/catalog` (line 7, 26, 32, 39) | none | match | links present; voice-attribute table (5 rows) and tone-by-context table (6 rows) are **cell-for-cell identical** to the same tables in `tfx-content-style/SKILL.md` (lines 30–47) — only difference is the website links CMP-2 to its page vs the skill's bare `(CMP-2)`, which is an enhancement, not a content difference |
| naming.mdx | CNT-2 | yes — line 9: "The normative rule is [CNT-2](/standards/catalog/cnt-2); this page is its human-facing guidance." | none | match | explicit normative pointer + link; Do/Don't and Good/Bad examples are presentation, not a restatement that conflicts with CNT-2 |
| data-viz.mdx | (none — standalone) | n/a — out of 037 scope | none | match | plan 037 lines 132–134 leave this page standalone; references only OPQ-1 (an open pattern question, not a catalog control); covers data-viz specifics the catalog does not own |
| illustration.mdx | (none — standalone) | n/a — out of 037 scope | none | match | no control references; covers Midjourney SREF / illustration production the catalog does not own |
| interaction.mdx | (none — standalone) | n/a — out of 037 scope | none | match | names CMP-2 / SLP-10 / CMP-3 as bare cross-references (not restatements that conflict); plan 037 leaves it standalone |
| product-icons.mdx | (none — standalone) | n/a — out of 037 scope | none | match | icon construction grid; catalog does not own this; uses product blue `#0064FF` in content MDX (documented brand colour) |
| web-interface.mdx | (none — standalone) | n/a — out of 037 scope | none | match | names A11Y-2/3/4/5, MOT-1, SLP-8, CNT-1 as bare cross-references; plan 037 leaves it standalone (Vercel-derived craft floor) |

The voice/tone-table parity that plan 037 deferred to this review is **confirmed match** by
direct table comparison — not `needs-human`, because the tables are literally identical
(equal rows, equal cells).

3c totals: 7 `match`, 0 `drift`, 0 `n/a`, 0 `needs-human`.

## 3d — Twin fidelity (plan 033)

Sample (≥8 URLs as required): all 7 guideline twins + the catalog twin + 3 control twins =
11 URLs, listed in full below (no silent truncation). The product-icons twin (the known JSX
case) is checked explicitly. "No HTML/JSX leak" = the plan's grep `<div|<svg|<figure|<Image`
returns nothing. The full per-control twin set (47) was reachability-checked in the machine
gate (47/47 = 200).

| Page `.md` twin | Reachable (200) | No HTML/JSX leak | Faithful to page | Verdict | Evidence |
| --- | --- | --- | --- | --- | --- |
| `/guidelines/voice-tone.md` | yes | yes (0 leak lines) | yes | match | headings `# Voice & tone`, `## Voice attributes`, `## Tone by context` match the page |
| `/guidelines/naming.md` | yes | yes (0) | yes | match | heading `# Naming` matches the page |
| `/guidelines/data-viz.md` | yes | yes (0) | yes | match | 200 text/markdown; no leak |
| `/guidelines/illustration.md` | yes | yes (0) | yes | match | 200 text/markdown; no leak |
| `/guidelines/interaction.md` | yes | yes (0) | yes | match | 200 text/markdown; no leak |
| `/guidelines/product-icons.md` | yes | yes (0 — inline `<div>`/`<svg>`/`<img>` JSX stripped) | yes | match | known JSX case; twin headings `# Product icons`, `## Anatomy`, `## The construction grid` match; the `grep` for `<div\|<svg\|<figure\|<Image` returns nothing |
| `/guidelines/web-interface.md` | yes | yes (the only `<div>` is inside a backtick code span in prose — `` `<a>`/`<Link>` … never `<button>` or `<div>` `` — a legitimate inline-code reference to HTML semantics, not leaked markup) | yes | match | headings `# Web interface`, `## Interactions`, `## Forms` match the page; the `<div>` match is text inside an inline code span, not JSX |
| `/standards/catalog.md` | yes | yes (0) | yes | match | clean markdown table from `getCatalog()`: header `# Control catalog` + a 47-row table (ID / Tier / Check / Category / Statement) |
| `/standards/catalog/a11y-1.md` | yes | yes (0) | yes | match | heading is the control statement; no leak |
| `/standards/catalog/cmp-2.md` | yes | yes (0) | yes | match | heading is the control statement; no leak |
| `/standards/catalog/slp-9.md` | yes | yes (0) | yes | match | heading is the control statement; no leak |

3d totals: 11 `match`, 0 `drift`, 0 `n/a`, 0 `needs-human`.

## Verdict summary

| Matrix | match | drift | n/a | needs-human |
| --- | --- | --- | --- | --- |
| 3a control coverage | 47 | 0 | 0 | 0 |
| 3b fragment parity | 2 | 0 | 0 | 0 |
| 3c guideline parity | 7 | 0 | 0 | 0 |
| 3d twin fidelity | 11 | 0 | 0 | 0 |
| **Total** | **67** | **0** | **0** | **0** |

**Batch 4 parity: clean.** The catalog, the five skills, and the website agree across all
four sub-matrices — every control is browsable and twinned, both mechanical fragments parity-
check green, the deferred voice/tone tables are cell-for-cell identical, and every sampled
twin is reachable, leak-free, and faithful.

The follow-ups below are **not** parity drift — they are pre-existing quality/hygiene items
surfaced by the recording-only checks and one harness-file authoring issue. They are recorded
here so they are not lost; fixing them is out of scope for this read-only review.

## Follow-ups

These are not `drift` / `needs-human` rows (the matrix has none). They are findings surfaced
during the gate and recorded so they are not lost. No fix was made here.

- **F1 — harness — `controls/cmp-1.md` has bare `<date>` / `<complete|partial>` tokens (lines
  78, 91) MDX cannot parse; the per-control page renders them via a graceful `<pre>` fallback
  (escaped to `&lt;date&gt;`), and the `.md` twin is unaffected.** Fix: escape the angle
  brackets (`` `<date>` `` in backticks, or `\<date\>`) in the harness control file so the page
  renders the body normally instead of the fallback. Suggested owner: harness maintainer.
  Warrants a small plan stub (see `plans/043-escape-cmp-1-date-token.md`).
- **F2 — content — `content-lint` flags 13 `[CNT-3]` long-sentence (> 25 words) findings** in
  `for-agents.mdx`, `home.mdx`, `glow.mdx`, `colour.mdx`, `loop.mdx` (×3), `skills.mdx`,
  `brand-principles.mdx`, `data-viz.mdx`, `illustration.mdx`, `product-icons.mdx` (×2). These
  are genuine long-form prose to triage with `tfx-content-style`, not parity drift; not wired
  into prebuild by design. Suggested owner: content editor (triage, not blanket-split).
- **F3 — website — `type-scan` flags 37 `[TYP-2]` small-text findings** in `app`/`components`
  (sub-14px text + one `leading-[1.1]` line-height), many on short labels where the 11/14px
  label ambiguity is documented (uppercase-label NOTEs accompany several). Triage which are
  genuine body text vs allowed short labels; not a build gate. Suggested owner: website/design.
- **F4 — harness — `waiver-reconcile` reports 3 stale `[CMP-1]` waiver NOTEs** in
  `docs/decisions/attendance.md`, `grade-entry.md`, `student-notes-empty-state.md` (recorded
  process waivers with no inline `tfx-waive` usage in the scanned source; exit 0). Confirm each
  is still needed or retire it. Suggested owner: design-lead / decision-record owner.

Follow-up count: 4. (Matrix `drift` + `needs-human` count: 0 — so no follow-up is required by
the done criteria; these are recorded as good-hygiene findings, not parity gaps.)
