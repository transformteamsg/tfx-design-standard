# Deterministic checks

Scripts that verify `check: deterministic` controls (and the deterministic half of
`hybrid` ones). Each check maps to TFX-DS control ids, exits 0 on pass and 1 on
violation, and prints violations with file/line/element and the control id — verbose
on failure, silent on success.

## Validator (built)

`python3 checks/validate.py` — validates `standards/catalog.yaml` against the schema in `standards/README.md`: field presence and allowed values, tier→waiver pairing, `detail:` file existence, detail-frontmatter ↔ catalog consistency, and that every control ID referenced in skills/docs exists in the catalog. Exit 0 on pass, exit 1 with `ERROR` lines on failure. This is the repo's verification baseline — run it before committing any `standards/` change.


## Token audit (built)

`python3 checks/token-audit.py <path>...` — scans `.css`, `.html`, `.jsx`, `.tsx`, `.js`, `.ts`, `.vue`, and `.svelte` files for raw colour values, off-scale spacing, and off-scale border-radius that should be replaced with design tokens. Accepts files or directories (recursive). Exit 0 silent on pass; exit 1 with `ERROR` lines on failure.

**Coverage:** TOK-1 (raw hex/rgb/hsl/oklch/named-colour in style contexts), TOK-2 (off-scale spacing — shadcn default scale), TOK-3 (off-scale border-radius), COL-1/COL-2 (Tailwind palette utility classes bypassing the semantic layer). Suggests the nearest scale value or token pattern on every violation.

**Token-definition exemption:** raw values inside a `:root { --*: … }` custom-property block or a `/* tfx-tokens */` … `/* /tfx-tokens */` region are exempt — tokens must be defined somewhere.

**L1 waiver behaviour:** TOK and COL are all L1; an inline `tfx-waive TOK-…` or `tfx-waive COL-…` comment does NOT suppress the violation. It downgrades the output line to `ERROR …:[line] [CTL-ID][waiver-claimed] … — verify approver in decision record` and still exits 1. The scanner never silences L1 violations; a human closes the decision-record loop.

**Self-test:** `python3 checks/token-audit.py --self-test` → `SELF-TEST OK (18 cases)`.

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

Planned for V1 (remaining):

| Check | Controls | Approach |
|---|---|---|
| `contrast` | A11Y-1 | axe-core contrast scan: 4.5:1 body, 3:1 large text + UI components |
| `focus` | A11Y-2 | Keyboard traversal covers all interactive elements; visible focus state on each |
| `labels` | A11Y-3 | Every input has a programmatically associated visible label |
| `targets` | A11Y-4 | Computed hit area of interactive elements ≥ 24×24 CSS px |
| `reduced-motion` | A11Y-5 | With prefers-reduced-motion set, non-essential animation does not run |
| `alt-scan` | A11Y-6 | Every img/svg/icon has a text alternative or is marked decorative |
| `structure` | A11Y-7 (deterministic half) | Heading-hierarchy walk; lists/tables/groups are semantic elements |
| `nrv` | A11Y-8 (deterministic half) | Custom controls carry role + accessible name + state attributes |
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
