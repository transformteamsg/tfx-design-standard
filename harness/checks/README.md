# Deterministic checks

Scripts that verify `check: deterministic` controls (and the deterministic half of
`hybrid` ones). Each check maps to TFX-DS control ids, exits 0 on pass and 1 on
violation, and prints violations with file/line/element and the control id — verbose
on failure, silent on success.

## Validator (built)

`python3 checks/validate.py` — validates `standards/catalog.yaml` against the schema in `standards/README.md`: field presence and allowed values, tier→waiver pairing, `detail:` file existence, detail-frontmatter ↔ catalog consistency, and that every control ID referenced in skills/docs exists in the catalog. Exit 0 on pass, exit 1 with `ERROR` lines on failure. This is the repo's verification baseline — run it before committing any `standards/` change.

The validator also enforces two **fragment-parity** sub-checks via `<!-- tfx-sync:… -->` markers: `[L0-SYNC]` (the inline "Non-negotiables (L0)" lists in `CLAUDE.md` and `tfx-design-ui/SKILL.md` must equal the catalog's `tier: L0` set) and `[SLP9-SYNC]` (the `tfx-content-style` buzzword summary must be a subset of the canonical list in `standards/controls/slp-9.md`). See [docs/SYNC.md](../docs/SYNC.md).

**Self-test:** `python3 checks/validate.py --self-test` → `SELF-TEST OK (27 cases)`.


## Token audit (built)

`python3 checks/token-audit.py <path>...` — scans `.css`, `.html`, `.jsx`, `.tsx`, `.js`, `.ts`, `.vue`, and `.svelte` files for raw colour values, off-scale spacing, and off-scale border-radius that should be replaced with design tokens. Accepts files or directories (recursive). Exit 0 silent on pass; exit 1 with `ERROR` lines on failure.

**Coverage:** TOK-1 (raw hex/rgb/hsl/oklch/named-colour in style contexts, plus raw colour inside Tailwind arbitrary-value utilities e.g. `bg-[…]` — see below), TOK-2 (off-scale spacing — shadcn default scale), TOK-3 (off-scale border-radius), COL-1/COL-2 (Tailwind palette utility classes bypassing the semantic layer). Suggests the nearest scale value or token pattern on every violation.

**Token-definition exemption:** raw values inside a `:root { --*: … }` custom-property block or a `/* tfx-tokens */` … `/* /tfx-tokens */` region are exempt — tokens must be defined somewhere.

**Project-token awareness (COL-2):** The scanner reads `--color-<name>: …` declarations from the CSS files it scans (Tailwind v4 `@theme` convention) to build an allowlist of *theme-defined* colour names (e.g. `--color-amber-11` licences `text-amber-11`). A Tailwind palette class whose name is in the allowlist is **not** flagged as a COL-2 bypass. Pass additional names via `--allow name1,name2,…` or a `checks/token-audit.allow` file (one name per line, `#` comments). Without an explicit allowlist the scanner flags all palette classes.

**Arbitrary-value scanning (TOK-1):** In addition to style-context raw colours, the scanner checks the bracket contents of Tailwind arbitrary-value utilities (`bg-[…]`, `text-[…]`, `border-[…]`, etc.) for raw colour on **all** line types (not just style contexts). A raw hex, rgb/rgba, hsl, oklch, or standalone named colour (white, black, red, …) inside the brackets — excluding `var(--…)` references — emits `[TOK-1] raw colour '…' in arbitrary value`. For example, `hover:bg-[color-mix(in_oklab,var(--tw-blue)_88%,black)]` flags `black`.

**L1 waiver behaviour:** TOK and COL are all L1; an inline `tfx-waive TOK-…` or `tfx-waive COL-…` comment does NOT suppress the violation. It downgrades the output line to `ERROR …:[line] [CTL-ID][waiver-claimed] … — verify approver in decision record` and still exits 1. The scanner never silences L1 violations; a human closes the decision-record loop.

**Peer-radius-consistency (TOK-3):** The scanner checks on-scale and concentric nesting per element, but cannot compare peer elements (cross-element). Peer-radius-consistency is **judgment-only** — the evaluator carries consistency against the product's Card/`--radius` anchor.

**Self-test:** `python3 checks/token-audit.py --self-test` → `SELF-TEST OK (23 cases)`.

## Audit record (built)

`python3 checks/audit-record.py [<record.md>...]` — audits design decision records
(`docs/decisions/*.md`) for process compliance. With no arguments, audits every
record except `TEMPLATE.md`. Asserts per record: required sections present
(substring-tolerant headings), `**Run type:**` header or an explicit operator-proxy
note, ≥ 3 numbered done-criteria in the sprint contract, the evaluator verdict
pasted verbatim (heuristic: a `VERDICT:` line AND a `QUALITY GRADES` block — a
paraphrase lacks both), waiver rows carry a non-empty approver and never a waived
L0, plan approval names an approver or records operator proxy, every referenced
`docs/` path exists on disk, the Ratchet section is non-empty ("no proposal —
nothing uncovered" counts), a CMP-1-in-scope record carries exactly one fixed-form
CMP-1 verdict line, and the Verify verdict carries a **verification ledger** (a
`| Control | Method | Evidence |` table — each method is `script` / `manual` /
`unverified`, and a `manual` or `unverified` row must state its evidence/reason, so
"verified manually" is an auditable claim rather than a prose blob). Exit 0 with
`OK: N records audited` on pass; exit 1 with `ERROR <file>: <message>` lines on
failure. This is the record-audit layer of the eval workflow (`evals/README.md`);
hook-ready for V1 (PostToolUse on `docs/decisions/*` edits).

**Self-test:** `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (21 cases)`.

Pass `--repo-root <path>` to audit a consumer repo's `docs/decisions/` (the default roots at the harness).

## A11y static scan (built — static subset)

`python3 checks/a11y-static.py <path>...` — scans `.css`, `.html`, `.jsx`, `.tsx`, `.js`, `.ts`, `.vue`, and `.svelte` files for three high-confidence a11y violations that are detectable from source text alone, without a rendered DOM. Accepts files or directories (recursive). Exit 0 silent on pass; exit 1 with `ERROR` lines on failure.

**Rules:**

- **FOCUS (A11Y-2, L0):** A class string or CSS rule containing an outline-removal token (`outline-none`, `outline-0`, `focus:outline-none`, or CSS `outline: none/0`) with no focus-visible replacement (`focus-visible:outline`, `focus-visible:ring`, `focus-visible:border`, `focus-visible:shadow`, or CSS `:focus-visible { … outline|box-shadow|border … }`) on the same line.
- **KBD (A11Y-2, L0):** A `<div`, `<span`, `<li`, or `<p` opening tag carrying a click handler (`onClick`, `onMouseDown`, `onclick`, `(click)`, `@click`) with no `role=` and no `tabIndex`/`tabindex` on the same tag.
- **NAME (A11Y-3, L0):** A `<button` or `role="button"` tag with no `aria-label`, `aria-labelledby`, or `title`, that is self-closing or whose same-line content is only an icon (`<svg`, a `*Icon` component, or an `aria-hidden` child) with no visible text. Only flags the same-line / self-closing case.

**Static-subset caveat — what this script does NOT verify:**

- Computed contrast ratios (A11Y-1) — needs rendered colours.
- Interactive hit-area size (A11Y-4) — needs computed layout.
- Focus traversal order and completeness (A11Y-2 traversal half) — needs a live DOM.
- ARIA state tracking — `aria-expanded`/`aria-pressed`/`aria-checked` updating to match visual state (A11Y-8 state half) — cannot be detected statically without cross-file variable mutation tracking. Deferred; manual pass required.
- Focus styles provided by a shared stylesheet: if `outline-none` appears in JSX but the `:focus-visible` recovery lives in a separate CSS file, the FOCUS rule will flag it. Cross-file CSS resolution needs a browser or axe-core.

**Waiver suppression:** A11Y-2 and A11Y-3 are L0 — never waivable. This script does not parse `tfx-waive` markers; every violation is a hard ERROR.

**Self-test:** `python3 checks/a11y-static.py --self-test` → `SELF-TEST OK (14 cases)`.

## Contrast scan (built — static subset)

`python3 checks/contrast.py --tokens <globals.css> <path>...` — computes WCAG 2.1 text-contrast ratios (A11Y-1) for the subset that is statically resolvable: a foreground and a background colour set together on the **same line** (class string or CSS rule) where both resolve to known token colours. This is the static half of A11Y-1 that needs no rendered DOM — the complement to `a11y-static.py`, whose docstring lists contrast as out of scope. Scans the same extensions as `a11y-static.py`. Exit 0 on pass or NOTEs-only; exit 1 with `ERROR` lines on any sub-AA pair.

**Token resolution (`--tokens <file>`):** the colour map is built from a product's CSS token file (for this repo's own site, `../app/globals.css` from `harness/`). It resolves direct hex, `var(--other)` chains (transitively, cycle-safe), `color-mix(in oklab, var(--a) p%, <b>)` (mixed in OKLab per the CSS spec), and `@theme inline` aliases (`--color-foo: var(--bar)`) so a Tailwind `text-foo`/`bg-foo` utility resolves through. An unresolved token stays unresolved — never guessed.

**What counts as a candidate (line-local):** a `text-<colour>` **and** a `bg-<colour>` on the same Tailwind class string (bare names that resolve to a token colour, or arbitrary `text-[#hex]`/`bg-[var(--t)]`), or a CSS rule / `style="…"` with both `color:` and `background[-color]:`.

**Thresholds:** ratio `< 3.0` → ERROR (fails even large text); `3.0 ≤ ratio < 4.5` → ERROR noting it passes only as large text (≥24px / 18.66px bold — confirm the size); `≥ 4.5` → clean.

**Unresolvable, never silent:** when a candidate pair is detected but a colour can't be resolved (unknown token, dynamic/`clsx` arbitrary value), the check emits a `NOTE … — verify manually` and exits 0 — it never passes silently and never raises a false ERROR.

**Static-subset caveat — what this script does NOT verify:**

- **Inherited / computed backgrounds.** A rule or class that sets only a text colour (background inherited from a parent) is **not** a candidate — there is no background to compare against, so it is skipped, not flagged. This is the largest false-negative surface and remains the manual / axe pass's job.
- **Font-size-dependent large-text classification.** The 3.0–4.5 band is flagged conservatively with a "confirm the text size" note; the check does not infer font size line-locally.
- **Non-text (UI component) contrast**, `color-mix` in spaces other than `oklab`, multi-line CSS rules, and dynamic class names beyond an arbitrary value it can read.

**Self-test:** `python3 checks/contrast.py --self-test` → `SELF-TEST OK (15 cases)` (path-independent; uses inline temp fixtures).

## Waiver reconcile (built)

`python3 checks/waiver-reconcile.py --src <path>... --records <dir>` — reconciles the two places a waiver can live so neither drifts from the other: inline `tfx-waive <CTL-ID> reason="..."` comments in source/CSS (the syntax `token-audit` defines, here generalised to **all** control prefixes), the "## Waivers granted" table rows in decision records (`docs/decisions/*.md`, skipping `TEMPLATE.md`), and the control's catalog tier. It reuses `audit-record.py`'s `parse_table_rows` / `column_index` / `split_sections` / `find_section` (imported by path, never rewritten). Accepts `--repo-root <path>` (records default to `<repo-root>/docs/decisions`) for consumer repos; the catalog tiers always come from the harness. Exit 0 on a clean reconcile (or NOTEs only); exit 1 on any ERROR.

**ERROR (exit 1) vs NOTE (exit 0):**

- **ERROR — inline tfx-waive on an L0 control** (any prefix): L0 is never waivable, so an inline waiver on `A11Y-1/2/3` or `CMP-2` is always a hard failure. This generalises the L0-never rule beyond the TOK/COL controls `token-audit` already guards.
- **ERROR — orphan inline waiver:** an inline `tfx-waive <id>` (L1/L2) with no matching recorded waiver row for `<id>` in any scanned record — claimed in code, never approved in a record. Add it to a decision record with a named approver.
- **ERROR — unknown control id:** a `tfx-waive` whose id is not in `standards/catalog.yaml`.
- **NOTE — stale recorded waiver:** a recorded waiver row for `<id>` with no inline `tfx-waive <id>` in the scanned source — confirm it is still needed. A **NOTE, not an ERROR**, because the source set scanned may be partial: a recorded waiver looks "stale" only relative to the `--src` paths given, and a partial scan must never be turned into a false hard failure.

A row counts as a recorded waiver only when column 0 holds a control id (`^[A-Z0-9]+-\d+$`); TEMPLATE-style empty / descriptive placeholder rows are ignored, so they raise no false stale NOTE.

**What this script does NOT verify:** waivers in files or records outside the scanned `--src` / `--records` paths (the reconciliation is only as complete as the paths given — run it with the same `--src` breadth as the other checks); whether the recorded *reason* actually justifies the inline usage (judgment — the approver / evaluator); L2-waiver rationale quality. It reads the records; it never edits them.

This closes the loop `token-audit.py` leaves open ("a human closes the decision-record loop") — but only for the scanned paths.

**Self-test:** `python3 checks/waiver-reconcile.py --self-test` → `SELF-TEST OK (7 cases)`.

## Reaudit scope (built)

`python3 checks/reaudit-scope.py <CTL-ID>` (or `--category <name>`) — a **read-only query, not a gate**. When a control is added or tightened, already-shipped surfaces are silently out of date "until re-audited"; this answers "which decision records should I re-audit now that control X changed?" It reads two sources, both read-only: `standards/catalog.yaml` `meta.categories` (each control's category = `meta.categories[id.split("-")[0]]`) and the `## Controls in scope` sections of `docs/decisions/*.md` (skipping `TEMPLATE.md`). It reuses `audit-record.py`'s `split_sections` / `find_section` (imported by path, never rewritten). Accepts `--repo-root <path>` to query a consumer repo's `docs/decisions/`; the category map always comes from the harness catalog.

**What it computes:**

- **Directly in scope** — records whose in-scope set contains the target id. For a *changed* control these explicitly used it and must be re-checked against the new clause.
- **Same-category candidates** — records that list any control sharing the target's category but do **not** list the target id. For a *new* control these surfaces are in the affected domain. They are framed as **candidates to confirm**, not proven-affected — confirm each actually uses the affected pattern. `--category <name>` (a prefix like `COL` or the human name `Colour`) treats every control of that category as the target set.

**Honest limit:** it reasons over **recorded** surfaces (decision records — the harness's ledger of what shipped), **not** the product repo's live code. When the records are complete, the re-audit set is complete; when records are missing, so is the set. Keep records current.

**Exit codes:** exit 0 whenever the query runs — **including an empty result set** (no records matched is a valid answer). Exit 1 only on a usage error: an unknown control id, an unknown `--category`, or a missing records directory.

**Self-test:** `python3 checks/reaudit-scope.py --self-test` → `SELF-TEST OK (8 cases)`.

## Content lint (built — static subset)

`python3 checks/content-lint.py <path>...` — scans `.mdx`, `.md`, `.tsx`, `.jsx`, `.ts`, `.js`, `.vue`, `.svelte`, `.css`, and `.html` files for the statically-resolvable subset of CNT-1, CNT-3, and the deterministic (lint) half of SLP-9. Accepts files or directories (recursive). Exit 0 silent on pass; exit 1 with `ERROR` lines on failure.

**Single-source word lists:** the SLP-9 buzzword, AI-vocabulary, filler, and chatbot-artifact lists are **read at runtime** from `standards/controls/slp-9.md` (resolved relative to the check, from the `<!-- tfx-sync:slp9-buzzwords -->` marked span and the named bullets in "How to verify") — never embedded as a third copy, so the lint and the catalog cannot diverge. If `slp-9.md` cannot be found or parsed, the check falls back to a small embedded copy and prints a `NOTE` saying so — never silently.

**Rules:**

- **SLP-9 (L2, lint half):** a word-boundaried, case-insensitive hit on the buzzword or AI-vocabulary list; a hit on the filler or chatbot-artifact phrase lists; or two or more em dashes inside one sentence. Markdown table rows (lines starting `|`) are skipped for the em-dash rule — those dashes are structural per SLP-9's "Do not flag" list.
- **CNT-3 (L2):** a user-facing string literal (in code) or MDX/MD prose line whose longest sentence exceeds 25 words.
- **CNT-1 (L1):** a user-facing string that is *only* a raw error code (`ERR_SYNC_500`, `0x…`, an all-caps token), or the bare literal "Something went wrong" with no actionable next step on the same or next line. Conservative — when unsure, does not flag.

**Static-subset caveat — what this script does NOT verify:**

- Non-literal / interpolated strings (`{var}`, template `${…}`, concatenation) — out of static reach; not flagged and not passed silently; the manual / evaluator pass covers them.
- Whether a string is truly user-facing vs. an internal label, key, className, or path — conservative heuristics; coordinate / SVG-path data (mostly numeric tokens) is excluded.
- CNT-3's "leads with its purpose" *semantic* half — judgment (evaluator).
- SLP-9's structural-tell *evaluator* half — negative parallelism, forced triads, copula avoidance, significance inflation, redundant label/helper pairs, em-dash clustering across a paragraph — all judgment (evaluator).
- CNT-1's full "what happened → what it means → what to do next" anatomy — judgment (evaluator); the script only catches the raw-code-only and bare-"Something went wrong" cases.

**Self-test:** `python3 checks/content-lint.py --self-test` → `SELF-TEST OK (19 cases)`.

## Type scan (built — static subset)

`python3 checks/type-scan.py <path>...` — scans `.css`, `.html`, `.jsx`, `.tsx`, `.js`, `.ts`, `.vue`, and `.svelte` files for the statically-resolvable subset of TYP-1, TYP-2, TYP-3, and TYP-4. Accepts files or directories (recursive). Exit 0 silent on pass; exit 1 with `ERROR` lines on failure (`NOTE` lines for unresolvable cases do not, on their own, fail the run).

**Rules:**

- **TYP-1 fonts (L1):** a CSS `font-family:` or Tailwind `font-[…]` arbitrary value naming a typeface other than Plus Jakarta Sans or Inter; the named Tailwind family utilities `font-mono` / `font-serif` (which resolve to a third default typeface stack — but **never** the weight utilities `font-semibold` / `font-bold` / …, which are not a typeface choice); and a non-approved generic — `monospace` / `serif` / `ui-monospace` / `ui-serif` — used as the **primary** CSS `font-family`. Allowed: the token names `font-display` / `font-body` / `font-sans` / `--font-display` / `--font-body`, the sans fallbacks `sans-serif` / `system-ui` / `ui-sans-serif`, and any utility a project sanctions by adding it to `ALLOWED_FONT_TOKENS`.
- **TYP-2 size floor (L1):** a `font-size:` or `text-[Npx]` with `N < 14`. The suggest text carries the 11/14 ambiguity (labels may go to 11px; body floor is 14px) since label-vs-body context needs rendered layout.
- **TYP-2 line-height (L1):** an explicit unitless / em `line-height:` or `leading-[N]` clearly outside the 1.5–1.6 body band (judged with a generous 1.4–1.7 tolerance). px / % line-heights are NOT judged — the ratio needs the font size.
- **TYP-3 on-scale (L1):** a `text-[Npx]` or `font-size:Npx` whose whole-px `N` is not on the **TFX type scale `{120,96,72,48,32,24,20,18,16,14,12,11}`**. The scale is read at runtime from TYP-3's catalog `verify` field (`Sizes in {…}; checks/type-scan`) so it cannot drift; the same set is the embedded fallback if the catalog can't be read.
- **TYP-4 all-caps (L2):** a `text-transform: uppercase` declaration or an `uppercase` Tailwind utility (matched as a class token — inside a class/className attr or a class-list-shaped string). Text is never set in all-caps, at any length — short labels included (HF-20). The English word "uppercase" in body text, and genuine acronyms (literal capitals, not a transform), are not flagged.

**TYP-3 scope decision:** TYP-3 **is** implemented (the preferred path) — the allowed scale is sourced live from the catalog `verify` field, not invented.

**Static-subset caveat — what this script does NOT verify:**

- Font *weights* (TYP-1's "PJS 600 / Inter 400/500/600" half) — weight is rarely co-located with the family and "approved weight" needs the family resolved; deferred to the manual pass.
- The 11px-vs-14px floor *decision* (TYP-2) — whether an element is a label (11px floor) or body (14px floor) needs rendered context; 11–13px is flagged with the ambiguity noted, not asserted as a definite body violation.
- Line-heights given in px or % (TYP-2) — the ratio needs the font size, rarely on the same line.
- All-caps set via camelCase inline style (TYP-4) — `style={{textTransform:'uppercase'}}` in JSX is not matched; only the CSS `text-transform: uppercase` form and the Tailwind `uppercase` utility are.
- Fonts / sizes set in a separate stylesheet the line-local rule can't see, or composed from variables / class-name interpolation — out of static reach.

**Self-test:** `python3 checks/type-scan.py --self-test` → `SELF-TEST OK (27 cases)`.

## Component manifest (built)

`python3 checks/component-manifest.py <manifest.json> [<source-root>]` — validates a product's `.tfx/component-manifest.json` against the TFX SPEC (`docs/spikes/component-manifest/SPEC.md`): required keys, enum values, date format. Exit 0 silent on pass; exit 1 with one `ERROR` line per violation.

**CMP-1 import-diff — only when `coverage: "complete"`:** the diff flags any component import in changed source that resolves outside the manifest. When `coverage` is `"partial"` (or absent) the diff stays **off** and the script reports `partial manifest — diff not run` — a team that declares complete coverage is asserting the manifest is reliable enough to diff against.

**What this script does NOT verify:** re-exports and barrel files can produce false-positive diff hits when an import resolves through a barrel that isn't the manifest's import path; if you hit these, downgrade to `coverage: "partial"` and the diff stays off (same trust lesson as `token-audit`). The manifest is only as complete as the product keeps it — a stale manifest passes schema validation but misses new components.

**Self-test:** `python3 checks/component-manifest.py --self-test` → `SELF-TEST OK (11 cases)`.

Planned for V1 (remaining):

| Check | Controls | Approach |
|---|---|---|
| `contrast` | A11Y-1 | axe-core contrast scan: 4.5:1 body, 3:1 large text + UI components |
| ~~`focus`~~ | ~~A11Y-2~~ | ✅ built (static subset) — `a11y-static` covers FOCUS (outline removal) + KBD (click on non-focusable element); traversal order and hit-area still need a rendered DOM |
| ~~`labels`~~ | ~~A11Y-3~~ | ✅ built (static subset) — `a11y-static` covers NAME (icon-only button without aria-label); placeholder-only label and multi-line label association still need a rendered DOM |
| `targets` | A11Y-4 | Computed hit area of interactive elements ≥ 24×24 CSS px |
| `reduced-motion` | A11Y-5 | With prefers-reduced-motion set, non-essential animation does not run |
| `alt-scan` | A11Y-6 | Every img/svg/icon has a text alternative or is marked decorative |
| `structure` | A11Y-7 (deterministic half) | Heading-hierarchy walk; lists/tables/groups are semantic elements |
| ~~`nrv`~~ | ~~A11Y-8 (deterministic half)~~ | ✅ built (static subset) — `a11y-static` covers KBD (non-focusable click handler without role/name); ARIA state tracking (aria-expanded/pressed/checked) is the deferred extension — too fuzzy statically, manual pass required |
| `title-lang` | A11Y-9 | Descriptive document title present; html lang attribute set |
| `skip-link` | A11Y-10 | Skip-to-main first focusable, or main/nav landmarks present |
| `announce` | A11Y-11 (deterministic half) | Each async state surface has live-region role XOR focus-target wiring |
| ~~`token-audit`~~ | ~~TOK-1..3, COL-1..2~~ | ✅ built |
| ~~`type-scan`~~ | ~~TYP-1..4~~ | ✅ built (static subset) — `type-scan` covers TYP-1 (font families), TYP-2 (size floor + unitless line-height), TYP-3 (on-scale, scale sourced from the catalog), TYP-4 (no all-caps, acronyms exempt); font *weights*, the label-vs-body floor decision, and px/% line-heights still need rendered context |
| `destructive` | CMP-2 (deterministic half) | Enumerate destructive actions; assert consequence surface + undo/confirm exists |
| `async-states` | CMP-3 (deterministic half) | Enumerate async actions; assert loading/success/error states exist and are reachable |
| ~~`content-lint`~~ | ~~CNT-1, CNT-3, SLP-9 (deterministic half)~~ | ✅ built (static subset) — `content-lint` covers CNT-1 (raw codes), CNT-3 (sentence length), and the SLP-9 lint lists (read live from `standards/controls/slp-9.md`) + em-dash chains; the SLP-9 structural-tell evaluator half and the CNT-3 lead-with-purpose semantic half stay judgment |
| `motion` | MOT-1, SLP-8 | Animation durations within 100–300ms, standard easing, none decorative on critical paths; no bounce/elastic/overshoot easing |
| `identity` | IDN-1 | Logo/lockup files resolve to the approved asset library; no inline redraws |
| `slop-scan` | SLP-1..4 | Stylesheet/DOM scan: purple-violet gradient palettes, cyan-on-dark theming, glow accents, gradient text, thick side-tab borders on rounded cards, nested cards |
| `slop-layout` | SLP-5..7 | Layout heuristics: identical-card grids / icon-tile templates, adjacent type-scale ratio < 1.25, a single spacing value used uniformly |

Wiring (V1): run as a PostToolUse hook on file edits during the implement phase
(fast subset: token-audit, type-scan, content-lint) and as the verify-phase gate
(full suite). L0 failures block; L1 failures loop the agent back to implement.

Wiring status: `type-scan` and `content-lint` are **built but not yet wired into
`package.json` prebuild** (which runs `token-audit` + `a11y-static` over `app
components lib`). Both currently surface pre-existing violations on this repo's own
tree — `content-lint` flags long-sentence (CNT-3) prose in `content/`, and `type-scan`
flags sub-14px `text-[11/12/13px]` labels and tight `leading-[…]` headings across
`app`/`components` (the documented 11/14 label-floor and display line-height
ambiguities). Per the harness rule "never wire a failing check into the build,"
wiring is deferred until the live tree is clean or the flagged values are reviewed and
either fixed or waived. Until then, run both manually during the implement phase.

Waiver handling: checks must respect inline `tfx-waive <CTL-ID> reason="..."`
comments for L2 controls only — a waiver on an L0/L1 control is itself reported as a
violation unless it appears in the decision record with a named approver (L1; L0 is
never waivable).
