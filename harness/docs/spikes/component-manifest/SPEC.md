# Component Manifest Format — Spike Spec
**Status:** spike / under design-lead review  
**Date:** 2026-06-11  
**Author:** design-harness advisor (plan 008)

---

## 1. Problem

Three load-bearing instructions in the harness reference a "product component
manifest" that nothing defines:

**`design-ui` SKILL.md — Phase 2 (Diverge):**

> "Use the product's component manifest — options may only compose components
> that exist (CMP-1 applies from here on)."

**`design-ui` SKILL.md — Phase 4 (Implement):**

> "Compose only manifest components (CMP-1); semantic shadcn tokens only…"

**`standards/catalog.yaml` — CMP-1 verify field:**

> "Component usage diffed against the product manifest; evaluator judges
> 'exists for the need' edge cases"

None of these references point to a file, a schema, or a path. Today the
evaluator falls back to three unreliable surrogates (cmp-1.md §"v0 limit"):
reviewing the product codebase directly, accepting the agent's assertion, or
applying general knowledge of the Base UI / shadcn catalog. All three are
auditably weaker than a committed file.

A plain JSON file checked into the product repo unblocks all three references
now, with zero MCP infrastructure. Whatever MCP serves in V2 should serve this
same schema — the file is the offline/source-of-truth representation.

---

## 2. Proposed Format

### Path

```
<product-repo>/.tfx/component-manifest.json
```

`.tfx/` is a natural home for harness-adjacent product config (analogous to
`.storybook/`, `.husky/`). One file per product; overlay approach is an open
question (see §6).

### Top-level keys

| Field | Type | Required | Description |
|---|---|---|---|
| `product` | string | yes | Product slug: `teacher-workspace`, `casesync`, `glow` |
| `generated` | string (ISO 8601 date) | yes | Date manifest was last edited (`YYYY-MM-DD`) |
| `source` | `"hand-maintained"` \| `"generated"` | yes | Maintenance mode; see §4 |
| `components` | array of Component objects | yes | Non-empty |
| `_note` | string | no | Human-readable disclaimer or context — not consumed by tooling |

### Per-entry schema (Component object)

| Field | Type | Required | Consumer | Description |
|---|---|---|---|---|
| `name` | string | yes | Phase 2, CMP-1 diff | Importable component name as used in source: `Button`, `Dialog`, `DataTable`. Must match the export. |
| `import` | string | yes | CMP-1 diff | Module path the agent should import from: `"@base-ui/react"`, `"~/components/ui/button"`. Used to diff actual imports against the manifest. |
| `kind` | `"base-ui-wrapper"` \| `"composite"` \| `"layout"` \| `"pattern"` | yes | Phase 2 filtering | Taxonomy of the component's place in the hierarchy. See Kind definitions below. |
| `status` | `"stable"` \| `"deprecated"` \| `"restricted"` | yes | Phase 2 filter, evaluator | Phase 2 may only compose `stable` entries. `deprecated` usage is an evaluator finding. `restricted` usage requires a CMP-1 waiver. |
| `props_summary` | string | yes | Agent context | One-line description of the component's purpose and key props — the agent reads this instead of source when planning. Not a full API dump. |
| `replaces` | array of strings | no | CMP-1 evaluator | What NOT to hand-roll because this component exists. E.g. `["custom modals", "inline confirm prompts"]` on Dialog. The evaluator uses this to judge "exists for the need" edge cases. |
| `docs` | string (URL) | no | Agent context | Storybook story URL or design doc link. |

### Kind definitions

- **`base-ui-wrapper`** — a thin product wrapper around a Base UI primitive
  (adds tokens, props constraints, a11y defaults). Highest authority; use
  instead of the raw primitive.
- **`composite`** — assembles two or more base-ui-wrappers into a reusable
  multi-element surface (e.g. `FormField` wrapping `Label` + `Input` +
  `HelperText`).
- **`layout`** — a structural component with no semantic behavior: grid,
  stack, divider, `PageHeader` shell.
- **`pattern`** — a higher-order composition with business semantics:
  `EmptyState`, `ConfirmDialog`, `Banner`, `DataTable`. Not a primitive; may
  themselves compose composites.

### Consumer justification for each field

| Field | Consumer | Why it is needed |
|---|---|---|
| `name` | Phase 2 filtering, CMP-1 diff | The diff compares component names in changed source against this list. Phase 2 must reference names the agent can match to imports. |
| `import` | CMP-1 diff (deterministic half) | Allows the checker to resolve `import { Button } from "~/components/ui/button"` as a manifest hit, not an unknown. Without the module path the diff produces false positives on re-exports. |
| `kind` | Phase 2 option diversity | The agent should pick components across kinds; a layout option composed entirely of patterns is a smell. Kind enables that signal. |
| `status` | Phase 2 gate, evaluator | `stable`-only filtering in Phase 2 prevents the agent proposing deprecated or restricted components. `deprecated`/`restricted` in the evaluator is a graded finding. |
| `props_summary` | Agent planning context | Prevents hallucinated prop names. One line is enough — the agent opens source for details. Keeping it short keeps the manifest maintainable. |
| `replaces` | CMP-1 evaluator | The "exists for the need" judgment in CMP-1 is currently a free-text evaluator call. `replaces` makes it structured: if the agent built a custom modal and `Dialog.replaces` includes `"custom modals"`, that is a finding, not an edge case. |
| `docs` | Agent context | Optional; lets the agent quote the correct story URL in a decision record. |

### Schema (JSON Schema draft-07 subset — for reference)

```json
{
  "type": "object",
  "required": ["product", "generated", "source", "components"],
  "properties": {
    "product":    { "type": "string" },
    "generated":  { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
    "source":     { "type": "string", "enum": ["hand-maintained", "generated"] },
    "components": {
      "type": "array", "minItems": 1,
      "items": {
        "type": "object",
        "required": ["name", "import", "kind", "status", "props_summary"],
        "properties": {
          "name":          { "type": "string" },
          "import":        { "type": "string" },
          "kind":          { "type": "string", "enum": ["base-ui-wrapper", "composite", "layout", "pattern"] },
          "status":        { "type": "string", "enum": ["stable", "deprecated", "restricted"] },
          "props_summary": { "type": "string" },
          "replaces":      { "type": "array", "items": { "type": "string" } },
          "docs":          { "type": "string" }
        }
      }
    },
    "_note": { "type": "string" }
  }
}
```

---

## 3. How Each Consumer Uses It

### Phase 2 — Diverge (design-ui SKILL.md)

The agent loads `.tfx/component-manifest.json` at the start of Phase 2.  
**Filter**: only entries with `status: "stable"` are candidates for options.
The agent lists which manifest components each structural option composes.
If Phase 2 can only be satisfied with a `deprecated` or `restricted` entry,
that must be named explicitly and a waiver flagged.

**Example:** An option that needs a date input looks up manifest entries where
`name` is `DatePicker` and `status` is `stable`. If no such entry exists, the
option must surface a missing-component note and the plan (Phase 3) must
propose either a DS request or a CMP-1 waiver.

### Phase 4 / future `checks/component-audit` (CMP-1 deterministic half)

A script diffs the imports in changed source files against `manifest.name` +
`manifest.import`. Any element used that resolves outside the manifest is
flagged. This replaces the current "asserted, no manifest" fallback with a
mechanical check.

**Algorithm sketch:**

```
for each import in changed_files:
    if import.module not in manifest[*].import:
        and import.name not in manifest[*].name:
            emit CMP-1 finding: "{name} from {module} not in manifest"
```

### Evaluator (CMP-1 "exists for the need" judgment)

Currently cmp-1.md §"v0 limit" requires the evaluator to state which of three
unreliable surrogates it used. With the manifest:

1. The evaluator searches `replaces` arrays for the hand-rolled element's
   functional description. A match is a finding.
2. The evaluator checks `status` of every component used: `deprecated` usage
   is an evaluator finding; `restricted` usage without a `tfx-waive CMP-1`
   annotation is a finding.
3. The v0-limit caveat in cmp-1.md §"Evaluator guidance" is **retired** once
   the manifest is adopted for a product — the evaluator states: "verified
   against `.tfx/component-manifest.json` (generated: <date>)" instead.

---

## 4. Maintenance Model

### Hand-maintained first

For a product with 30 components, writing this file is an afternoon's work.
The `source: "hand-maintained"` field signals that no generator is involved.
A stale manifest is detectable by `generated` date; a CI reminder (not a
blocker) can flag when `generated` is more than 90 days old.

### Staleness policy

A stale or absent manifest **fails open**. The agent says "manifest may be
stale — verifying manually" and falls back to the cmp-1.md v0-limit procedure.
It does NOT block implementation or fail the build. Staleness is a quality
signal, not a gate.

Rationale: a stale manifest is better than no manifest (it covers the stable
core); blocking on staleness would punish teams that have adopted the harness
but not yet updated the manifest after a recent DS release.

### Generated mode (future)

`source: "generated"` signals the file was emitted by an extractor script.
The extractor is out of scope for this spike; it is V1/V2 work. The format is
designed to be trivially emittable from a TypeScript AST walk or a Storybook
index (see §6).

### Update triggers

- A new component added to the product's DS wrapper layer: add an entry.
- A component deprecated by the DS: change `status` to `"deprecated"`.
- A component restricted pending review: change `status` to `"restricted"`.
- A DS version bump: update `generated` and review entries for status changes.

---

## 5. Migration to V2 / MCP

The README roadmap notes "V2 — component manifest via MCP." The MCP tool
serves this same per-entry schema — the fields above are the canonical
vocabulary whether the data comes from a file, an MCP call, or a Storybook
index.

Migration path:

1. Today — hand-maintained `.tfx/component-manifest.json` checked into the
   product repo. The harness reads the file directly.
2. V1 — extractor script generates the file from source; `source: "generated"`.
3. V2 — MCP server exposes `get_manifest(product)` returning the same JSON.
   The file becomes the offline/source-of-truth backup; the MCP response is
   the live version. No schema change needed at either step.

The file-first approach means teams can adopt CMP-1 verification immediately
without waiting for MCP infrastructure.

---

## 6. Open Questions for the Design Lead

1. **Variants and sizes in the manifest or in source?**  
   Should `Button` have a `variants` field listing `["primary","secondary","ghost","destructive"]`?
   Or is one-line `props_summary` enough and the agent reads source for detail?
   Tradeoff: variants in the manifest enables Phase 2 to surface "use
   `Button variant='destructive'`" rather than "use `Button`", but it
   significantly increases maintenance burden.

2. **Per-product manifest or shared-base + product overlay?**  
   All four products share the same Base UI wrapper layer. Should there be a
   `base-manifest.json` (shared layer, maintained by the DS team) that product
   manifests extend/override? Or is the duplication across four manifests
   acceptable for v1 simplicity? An overlay model adds a merge step.

3. **Does `restricted` need an `approver` field?**  
   Today `restricted` means "requires CMP-1 waiver" but doesn't name who can
   approve. Should the manifest carry an `approver` field on restricted entries
   (e.g. `"approver": "design-lead"`) so the evaluator can check the waiver
   annotation names the right person?

4. **Is `.tfx/` the right home?**  
   `.tfx/` is not yet an established convention (no other `.tfx/` files exist).
   Alternatives: `.claude/tfx/component-manifest.json` (scoped to the harness
   plugin), `tfx.config.json` (flat), or `docs/design/component-manifest.json`
   (more visible). The choice affects whether the path is hard-coded or
   configurable in the plugin.

5. **Storybook manifest reconciliation.**  
   Storybook generates its own component index (`stories.json`). If a product
   adopts Storybook later, how should `.tfx/component-manifest.json` relate?
   Options: (a) the extractor reads `stories.json` and emits the manifest; (b)
   the manifest is the canonical source and Storybook stories are documentation
   only; (c) they are kept in sync manually.

6. **Minimum viable manifest size for CMP-1 to be "active"?**  
   Should the harness consider CMP-1 mechanically enforceable only when the
   manifest has ≥ N entries? Or is even a 5-entry manifest (covering the most
   commonly misused components) enough to activate the diff?

---

## Self-check

Walk of CMP-1's verify sentence and Phase 2's filter instruction against the
schema to confirm every needed datum is present.

### Phase 2 filtering

**Instruction:** "options may only compose components that exist (CMP-1 applies
from here on)"

| Needed datum | Schema field | Present? |
|---|---|---|
| Is the component defined for this product? | `name` in `components[]` | Yes |
| Is it available for use (not deprecated/restricted)? | `status == "stable"` | Yes |
| What is it for (so the agent picks the right one)? | `props_summary` | Yes |
| What kind of component is it? | `kind` | Yes |

All Phase 2 filtering needs are covered.

### CMP-1 diffing (deterministic half)

**Instruction:** "Component usage diffed against the product manifest"

| Needed datum | Schema field | Present? |
|---|---|---|
| Component name to match against source imports | `name` | Yes |
| Module path to resolve re-exports | `import` | Yes |
| Whether the component is from the product stack | `import` (resolves to product/DS paths) | Yes |

All CMP-1 diff needs are covered.

### Evaluator (CMP-1 judgment half)

**Instruction:** "evaluator judges 'exists for the need' edge cases"

| Needed datum | Schema field | Present? |
|---|---|---|
| What hand-rolling this component replaces | `replaces` | Yes |
| Whether usage of a deprecated/restricted entry is a finding | `status` | Yes |
| Evidence source for the verdict | `generated` date (agent quotes in verdict) | Yes |

All evaluator needs are covered. The v0-limit caveat in cmp-1.md §"Evaluator
guidance" can be retired once the manifest is adopted for a product.

### Summary

No schema gap found. Every consumer's needed datum maps to a field.
`replaces` is the most load-bearing addition — it is what makes CMP-1's
"exists for the need" judgment structural rather than free-form.
