# Per-product context layer — `DESIGN.md` + `.dxd/design.json`

The control catalog is portfolio-wide and product-agnostic on purpose (see
`standards/README.md` rule 5: no per-product control overlays). But real products differ
in ways the catalog deliberately does not encode: which primary they anchor on, how they
weight tone, their motion conventions, their column grid. Those **parameters** used to be
scattered — per-product primary in `standards/controls/col-1.md`, tone weighting in the
content skill's §6, motion nowhere, grid in a separate proposed `.tfx/layout-system.json`.

This layer gives each product repo one place for "what makes this product this product":

- **`DESIGN.md`** — human-owned, at the product repo root. Per-product visual parameters.
  You need not write it by hand: the setup wizard writes this file for you (`/dxd:setup` →
  "onboard my product").
- **`.dxd/design.json`** — its machine twin, **generated** from `DESIGN.md` by
  `scripts/generate-design-json.py`, so checks and hooks can read the same parameters the
  agent reads. Never hand-edited.

Both are optional for existing installs. Through v0.x, a repo with neither
`DESIGN.md` nor generated context uses the `teachers-school` profile as a
time-bounded compatibility shim; remove that shim at 1.0. This is the only concrete
fallback. Once a repo declares a domain, consumers load only that domain profile and
never borrow T&S values. Missing concrete facts stay unresolved while universal
foundation controls continue to apply.

**Legacy path.** `.dxd/design.json` is the canonical path as of the DXD rename
(plan 001); the generator writes only here now. Readers (the design skill, `evaluator`,
`checks/detect.py`) resolve `.dxd/design.json` first, falling back to `.tfx/design.json`
in repos that predate the rename — that legacy path keeps working, it is just no longer
where the generator writes.

## The one rule: parameters, never catalog-rule restatements

`DESIGN.md` carries only what overrides or completes its selected domain profile —
the values, not the rules. It must never restate a catalog
control (that recreates exactly the drift `docs/SYNC.md` exists to prevent). Say the
parameter and cite its normative source:

- Good: `Primary: --product-primary #2455A4` (an illustrative value) with
  "Normative source: COL-1".
- Bad: "Primary actions use the product's own primary brand colour" — that is COL-1's rule
  restated; it will drift from the catalog and mislead.

Omit a section when the selected domain profile already supplies it. If neither layer
declares a concrete fact, that fact is unresolved: the agent asks or records a NOTE; it
does not invent a value or inherit another domain's profile.

## `DESIGN.md` — sections (all optional)

Each `## ` heading below maps to one top-level key in `.dxd/design.json`. Cite the
normative source in each section you keep.

| Section (`## `) | json key | Carries | Normative source to cite |
|---|---|---|---|
| `Domain` | `domain` | the registry key of the domain this product belongs to (`teachers-school`, `students`, `parents`, `platform`) — connects the repo to its domain profile in `standards/domains/<slug>.yaml` | `meta.domains` (catalog) |
| `Colour` | `colour` | primary + accent token/hex, usage beyond COL-1's table | COL-1 |
| `Typography` | `typography` | this product's display/body typefaces + any wordmark face, where it differs from the domain profile | TYP-1 |
| `Stack` | `stack` | this product's component/token stack, where it differs from the domain profile | the domain profile (`standards/domains/<slug>.yaml`) |
| `Tone weighting` | `tone` | pointer to content §6 + this product's weighting note | content skill §6 |
| `Motion` | `motion` | product motion conventions (durations, signature moves) | MOT-1, SLP-8, A11Y-5 |
| `Layout system` | `layout_system` | the declared column grid (see below) | LAY-1 proposal (`docs/catalog-changes/lay-1-grid.md`) |
| `Components` | `components` | product-specific component notes (e.g. AvatarFallback default) | CMP-1, CMP-7 |

**Resolution order.** A parameter resolves **product `DESIGN.md` > selected domain
profile (`standards/domains/<slug>.yaml`) > unresolved concrete fact.** `Domain`
is resolved first and names the only profile consumers load; a product need only
restate `Typography`/`Stack`/`Colour` in its `DESIGN.md` where it *differs* from
its domain's declared values. Omit a section to inherit that selected profile. An
explicit non-T&S domain never falls back to T&S. Universal behavioural conventions
remain the foundation when a concrete value is unresolved.

**Layout system** absorbs the `.tfx/layout-system.json` proposed in
`docs/catalog-changes/lay-1-grid.md` (plan 053): its object (`columns`, `gutter`,
`margins`, `breakpoints`, `maxContentWidth`) becomes the `layout_system` key here.
That control's gate status is unchanged — it still grades **N/A where no grid is
declared**; declaring one here only moves the declaration's location.

A `register:` field (brand-register impact) is **reserved for the future** and is not used
today — brand impact is carried by the colour parameters plus COL-1. Do not add it now.

## `.dxd/design.json` — the generated twin

Generated only, never hand-edited. Shape:

```json
{
  "generated_from": "DESIGN.md",
  "generated_at": "2026-07-03T00:00:00Z",
  "domain": "platform",
  "colour": { "primary": "--product-primary #2455A4" },
  "typography": {
    "display": "Example Display",
    "body": "Example Sans",
    "scale_px": [48, 32, 24, 18, 15, 12]
  },
  "stack": {
    "components": "Example UI",
    "spacing_px": [0, 3, 6, 12, 18, 24, 36],
    "radius_px": [0, 5, 10, 9999]
  },
  "layout_system": { "columns": 12, "gutter": "space-4" },
  "tone": "Follows the active domain's voice guidance."
}
```

These are contract-sample values, not settled Platform brand facts.

- `generated_from` is always `"DESIGN.md"`; `generated_at` is an ISO-8601 UTC timestamp.
- One top-level key per `DESIGN.md` section present (omitted sections produce no key).
- A section's value is **structured data** when the section carries `- key: value` lines
  (hex/token strings, scale numbers, arrays), else the **prose verbatim** as a string.

### How the generator parses `DESIGN.md`

`scripts/generate-design-json.py` (stdlib-only) does a deterministic parse:

1. Split on `## ` headings; map each heading to its json key (`Domain` → `domain`,
   `Colour`/`Color` → `colour`, `Typography` → `typography`, `Stack` → `stack`,
   `Tone weighting`/`Tone` → `tone`, `Motion` → `motion`, `Layout system` → `layout_system`,
   `Components` → `components`; any other heading is slugified so nothing is dropped).
2. Strip HTML comments (`<!-- ... -->`) from the section body — comments are guidance and
   never reach the json.
3. In the remaining body, a bulleted line of the form `- key: value` becomes a structured
   field. `value` is coerced: an integer literal → int, a `[…]` JSON array → list, else the
   string verbatim (so `space-4`, `#2455A4`, and `1280px` survive intact). Field keys keep
   their written casing (so `maxContentWidth` matches the LAY-1 schema).
4. A section with **no** field lines becomes its prose (non-comment, non-blank lines joined),
   verbatim. A section that is empty after comment-stripping produces no key.

Use `- key: value` bullets for parameters you want machine-readable; use prose (or `—`
bullets) for narrative notes.

## Loading rules (for the design skill)

- Read `DESIGN.md` at **intent** (once the product is identified) and implement against its
  parameters for the rest of the loop — it calibrates colour/tone/motion/layout downstream.
- **No `DESIGN.md` and no generated context → v0.x compatibility only.** Resolve the
  `teachers-school` profile through v0.x; remove this compatibility shim at 1.0. Do
  not grade the missing files themselves as a failure.
- **Declared domain → only that profile.** Merge product values over it. Never load
  T&S values for an explicit non-T&S domain; call missing facts unresolved.
- **Code overrides stale docs.** When `DESIGN.md` disagrees with the product's *implemented*
  conventions, the code wins: follow the implemented convention and tell the user that
  `DESIGN.md` has drifted (so a human can reconcile it). `DESIGN.md` is a pointer to intent,
  not an authority over shipped code.

## Regenerating

After editing `DESIGN.md`, regenerate and commit both files:

```
python3 scripts/generate-design-json.py <product-repo-root>
```

CI can assert freshness with `--check` (exit 2 when `.dxd/design.json` is stale vs the
markdown).

The unified detector consumes this: `checks/detect.py` (plan 059) runs the generator in
`--check` mode whenever a `.dxd/design.json` exists at the target repo root (falling back
to `.tfx/design.json` in repos that predate the rename), so a stale twin surfaces as a
detector finding (exit 2), never a crash. A repo with neither path skips the check
entirely. The profile resolver then applies the documented v0.x compatibility shim;
this is not a concrete foundation default.
