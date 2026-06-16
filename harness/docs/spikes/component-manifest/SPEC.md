# Component Manifest Format — Spec
**Status:** accepted — design-lead approved 2026-06-16 (plan 019 Stage B)  
**Date:** 2026-06-11 (accepted 2026-06-16)  
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
| `coverage` | `"complete"` \| `"partial"` | no (default `"partial"`) | Declares whether the manifest covers all product components. `"complete"` activates the CMP-1 import-diff (see §3); `"partial"` keeps the diff **off** and the evaluator verdict reads "verified against partial manifest (generated: &lt;date&gt;) — diff not run". Default `"partial"` is intentionally conservative — a team that omits this field never accidentally activates the import-diff. |
| `components` | array of Component objects | yes | Non-empty |
| `_note` | string | no | Human-readable disclaimer or context — not consumed by tooling |

**Discoverability pointer.** The manifest path is referenced from the product repo's `package.json` via a `tfxComponentManifest` field (mirroring the Custom Elements Manifest community convention of `customElements` in `package.json`), so tooling can locate the manifest without hard-coding `.tfx/`:

```json
{
  "tfxComponentManifest": ".tfx/component-manifest.json"
}
```

This field is optional and informational — the harness checks the `.tfx/` path directly — but it makes the manifest discoverable to third-party tooling and signals the product's adoption of the TFX manifest.

### Per-entry schema (Component object)

| Field | Type | Required | Consumer | Description |
|---|---|---|---|---|
| `name` | string | yes | Phase 2, CMP-1 diff | Importable component name as used in source: `Button`, `Dialog`, `DataTable`. Must match the export. |
| `import` | string | yes | CMP-1 diff | Module path the agent should import from: `"@base-ui/react"`, `"~/components/ui/button"`. Used to diff actual imports against the manifest. |
| `kind` | `"base-ui-wrapper"` \| `"composite"` \| `"layout"` \| `"pattern"` | yes | Phase 2 filtering | Taxonomy of the component's place in the hierarchy. See Kind definitions below. |
| `status` | `"stable"` \| `"deprecated"` \| `"restricted"` | yes | Phase 2 filter, evaluator | Phase 2 may only compose `stable` entries. `deprecated` usage is an evaluator finding. `restricted` usage requires a CMP-1 waiver. |
| `approver` | string | no (applies when `status: "restricted"`) | Evaluator | Names the person who can approve use of a `restricted` component (e.g. `"design-lead"`). The evaluator checks that any `tfx-waive CMP-1` annotation on a restricted component names this approver. |
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
    "coverage":   { "type": "string", "enum": ["complete", "partial"] },
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
          "approver":      { "type": "string" },
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

## 6. Prior Art

**Custom Elements Manifest (CEM).** The web-components community has a JSON-Schema
standard for describing components: the Custom Elements Manifest
([github.com/webcomponents/custom-elements-manifest](https://github.com/webcomponents/custom-elements-manifest)).
It is discoverable via a `customElements` field in `package.json`. CEM is designed for
web component authors to expose component APIs (slots, attributes, CSS custom
properties) to IDEs and documentation tools.

The TFX manifest stays **distinct** from CEM for three reasons:

1. **Enforcement fields.** TFX carries `replaces`, `status`, and `coverage` — the fields
   CMP-1 enforcement needs. CEM has no equivalent; it describes APIs, not
   agent-enforcement policy.
2. **React / Base UI, not custom elements.** The TFX portfolio is React + Base UI.
   CEM is tailored to HTML custom elements (Web Components). Adopting CEM would impose
   a format designed for a different runtime.
3. **Interop target.** If TFX ever ships web components, CEM becomes the future interop
   target — the `tfxComponentManifest` field in `package.json` (§2 discoverability
   pointer) mirrors CEM's `customElements` convention deliberately, so the two formats
   can coexist or be reconciled later.

**Storybook CSF / component index.** Storybook emits a component index (`stories.json`)
from its Component Story Format (CSF). The TFX manifest's `docs` field can reference
Storybook story URLs. The relationship between the two: Option (a) from the spike
(extractor reads `stories.json` and emits the manifest) is the V1 path; until then
they are independent artifacts.

---

## 7. Design-Lead Answers (accepted 2026-06-16)

The six open questions from the spike were answered by the harness lead (Reza Ilmi)
on 2026-06-16. All six recommended answers were accepted as-is.

1. **Variants.** No `variants` field for v1. `props_summary` is enough; the agent
   reads source for detail. Maintenance burden of per-variant tracking outweighs
   the benefit at v1.
2. **Per-product flat manifests.** No shared-base overlay for v1. Duplication across
   four manifests is acceptable; an overlay model adds merge-step complexity that is
   not justified until four manifests exist and drift.
3. **`approver` on restricted.** Yes — add an optional `approver` field on
   `restricted` entries (implemented in §2 above). The evaluator checks that a
   `tfx-waive CMP-1` annotation on a restricted component names this approver.
4. **`.tfx/` is the home.** Confirmed. Referenced from `package.json` via
   `tfxComponentManifest` (§2 discoverability pointer).
5. **Storybook.** Manifest is canonical; Storybook stories are documentation.
   V1 extractor (if built) reads `stories.json` and emits the manifest.
6. **No minimum size.** No minimum entry count. Even a 5-entry manifest covering
   the most commonly misused components is enough to be useful. The `coverage`
   field (§2) is the activation gate for the import-diff — not entry count.

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
