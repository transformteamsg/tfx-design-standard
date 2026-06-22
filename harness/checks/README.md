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
`docs/` path exists on disk, and the Ratchet section is non-empty ("no proposal —
nothing uncovered" counts). Exit 0 with `OK: N records audited` on pass; exit 1
with `ERROR <file>: <message>` lines on failure. This is the record-audit layer of
the eval workflow (`evals/README.md`); hook-ready for V1 (PostToolUse on
`docs/decisions/*` edits).

**Self-test:** `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (14 cases)`.

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
| `type-scan` | TYP-1..4 | Font families/weights (PJS 600, Inter 400/500/600 only), size floors (body ≥ 14, labels ≥ 11), on-scale sizes, line-height 1.5–1.6, all-caps length |
| `destructive` | CMP-2 (deterministic half) | Enumerate destructive actions; assert consequence surface + undo/confirm exists |
| `async-states` | CMP-3 (deterministic half) | Enumerate async actions; assert loading/success/error states exist and are reachable |
| `content-lint` | CNT-1 (raw codes), CNT-3 (sentence length), SLP-9 (deterministic half) | Flag raw error codes as primary copy; sentences > 25 words; the SLP-9 lint lists (buzzwords + AI vocabulary, filler phrases, chatbot artifacts — see `standards/controls/slp-9.md` "How to verify") + em-dash chains in user-facing strings |
| `motion` | MOT-1, SLP-8 | Animation durations within 100–300ms, standard easing, none decorative on critical paths; no bounce/elastic/overshoot easing |
| `identity` | IDN-1 | Logo/lockup files resolve to the approved asset library; no inline redraws |
| `slop-scan` | SLP-1..4 | Stylesheet/DOM scan: purple-violet gradient palettes, cyan-on-dark theming, glow accents, gradient text, thick side-tab borders on rounded cards, nested cards |
| `slop-layout` | SLP-5..7 | Layout heuristics: identical-card grids / icon-tile templates, adjacent type-scale ratio < 1.25, a single spacing value used uniformly |

Wiring (V1): run as a PostToolUse hook on file edits during the implement phase
(fast subset: token-audit, type-scan, content-lint) and as the verify-phase gate
(full suite). L0 failures block; L1 failures loop the agent back to implement.

Waiver handling: checks must respect inline `tfx-waive <CTL-ID> reason="..."`
comments for L2 controls only — a waiver on an L0/L1 control is itself reported as a
violation unless it appears in the decision record with a named approver (L1; L0 is
never waivable).
