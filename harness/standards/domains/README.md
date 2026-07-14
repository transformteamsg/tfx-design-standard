# Domain profiles — `standards/domains/<slug>.yaml`

A **domain** is a portfolio-level brand boundary (see `standards/README.md`
§Domains). This directory holds one profile per domain in the `meta.domains`
registry: the domain's *declared brand* — colours, typefaces, illustration,
voice, stack, products, audiences.

Consumed by both the harness (defaults for products in that domain) and the
website (renders domain pages). A product repo declares which domain it belongs
to (`Domain` in its `DESIGN.md`; see `docs/DESIGN-CONTEXT.md`) and keeps its own
per-product `DESIGN.md` for anything that differs from the domain default.

## The one rule: parameters, never rule restatements

Same discipline as the per-product context layer (`docs/DESIGN-CONTEXT.md`): a
profile carries brand **parameters** (the values), never restatements of a
catalog control (the rules). A profile is **additive** to the catalog and never
normative over it — it can declare what a domain's primary *is*, but it cannot
change what COL-1 *requires*. An absent concrete field stays **unresolved**:
universal foundation behaviour still applies, but consumers must not borrow a
different domain's value or claim the parameterised control passed.

Cite the normative source in a comment when a value specialises a catalog rule
(e.g. per-product primaries cite COL-1; typefaces cite TYP-1).

## Fields

Required on every profile: `domain`, `name`, `status`. Everything else is
optional (absent = unresolved concrete fact).

| Field | Type | Meaning |
|---|---|---|
| `domain` | slug | Registry key from `catalog.yaml` `meta.domains`. Must equal the filename (`<domain>.yaml`). |
| `name` | string | Display name (matches `meta.domains[domain]`). |
| `status` | `settled` \| `proposed` | Same vocabulary the website uses. `proposed` = awaiting the domain lead's declarations. |
| `owner` | string | Domain lead. `""` until assigned. |
| `products` | list | Registry keys from `meta.products` that belong to this domain. |
| `audiences` | list | Registry keys from `meta.audiences` this domain serves. |
| `colour` | map | Brand colour parameters. `primaries` maps each product to its primary per COL-1. |
| `typography` | map | `display` / `body` names, `allowed_families`, positive-integer `display_weights` / `body_weights`, non-negative unique `scale_px`, and optional registered `wordmarks`. |
| `stack` | map | Non-empty `components`, `colour_system`, and `token_convention` names plus non-negative unique `spacing_px` / `radius_px` scales. Foundation controls demand stack-shaped behaviour but never name the stack. |
| `illustration` | map | `direction` (prose pointer) + `sref` (Midjourney SREF codes). |
| `voice` | string | Voice/tone pointer (e.g. the content skill's tone section). |
| `notes` | string | Anything else the domain lead wants on record. |

## Adding a domain

1. Add the slug → display-name entry to `catalog.yaml` `meta.domains` and to
   `standards/schema.json` `domains` (both, same as `products:`).
2. Copy `_template.yaml` to `<slug>.yaml`, fill `domain`/`name`/`status`, add
   only values the domain lead has settled. Proposed stubs may omit every
   optional field.
3. `python3 checks/validate.py` — the validator checks required keys, the
   `domain`↔filename↔registry match, that `products`/`audiences` values exist in
   catalog meta, and the shape of any structured typography/stack values.

`_`-prefixed files (e.g. `_template.yaml`) are excluded from validation.
