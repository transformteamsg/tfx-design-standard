# Plan 002: Define the domain layer — domain registry, profile schema, and catalog `domains:` scoping

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- harness/standards harness/checks/validate.py harness/docs/DESIGN-CONTEXT.md harness/scripts/generate-design-json.py lib/catalog.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/001-dxd-rename.md (naming only — can technically run first, then 001 sweeps the new files too)
- **Category**: tech-debt / migration (foundational data model)
- **Executor model**: Opus (schema and boundary judgment; the data model everything else consumes)
- **Planned at**: commit `233f3be`, 2026-07-10

## Why this matters

The DXD standard scales by one move: separating the **foundation** (portfolio-agnostic controls + machinery, singular, owned centrally) from **domain profiles** (each domain's declared brand: colours, typefaces, illustration + SREF codes, voice, stack, products, audiences). Today the Teachers & School brand is hardcoded as global fact; there is no place where a domain *is* anything. This plan creates that place: a domain registry in the catalog meta, a machine-validated profile file per domain, and a `domains:` scope field for controls — extending the existing `products:`/`audiences:` mechanism rather than inventing a parallel one. Requirements R1–R4 in `docs/brainstorms/2026-07-10-dxd-design-standard-requirements.md`. Every later plan (skills de-branding, wizard, website Domains section) reads what this plan defines.

## Current state

- `harness/standards/catalog.yaml` — single source of truth, 60 controls. `meta:` block has `version: "0.1"`, `updated`, `waiver_syntax`, `categories:` (10 category codes), `products:` (`tw`, `casesync`, `glow` with display names), `audiences:` (`teachers`, `students-primary`, `students-secondary`, `parents`).
- `harness/standards/README.md` §Scope (~lines 55–80) — scoping spec: `products:`/`audiences:` optional per-control fields; **absent = global**; filtering is an intersection; "Do not stamp scope onto floor controls" (stamping would exempt future audiences from the a11y/anti-slop floor).
- Precedent for scoped controls: IDN-4 is product-scoped (`products: [casesync]`, catalog ~line 757).
- `harness/standards/schema.json` — the machine schema `validate.py` validates the catalog against.
- `harness/checks/validate.py` — catalog validator; also run by the site prebuild (`package.json` `prebuild`).
- `lib/catalog.ts` (+ `lib/catalog.test.ts`) — the site's typed reader of the same catalog file.
- `harness/docs/DESIGN-CONTEXT.md` — per-**product** context layer: human `DESIGN.md` + generated `.dxd/design.json` (post-001; `.tfx/` pre-001), sections Colour / Tone weighting / Motion / Layout system / Components, each mapping to one JSON key via `harness/scripts/generate-design-json.py` (stdlib, deterministic). Core rule: **parameters, never catalog-rule restatements**. Both files optional; absent = portfolio defaults.
- Stack facts currently stated as global in `harness/CLAUDE.md`: "The stack is fixed and boring on purpose: Base UI components, Radix Colors, shadcn/ui default tokens. Plus Jakarta Sans (600) display, Inter (400/500/600) body."

Decisions already made (do not relitigate):

- Four domains: `teachers-school`, `students`, `parents`, `platform`.
- Domain profiles live **in this repo** at `harness/standards/domains/<slug>.yaml` — consumed by both the harness (defaults for products in that domain) and the website (renders domain pages, plan 005). Product repos keep their per-product `DESIGN.md`; a product declares which domain it belongs to.
- Domains may **add** scoped controls via the ratchet; they can never weaken/override foundation controls. Waivers stay per-instance.
- Stack moves from foundation fact to profile field. Foundation controls may demand stack-shaped behaviour ("semantic tokens only") but never name a stack.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Catalog + schema validation | `python3 harness/checks/validate.py` | exit 0 |
| Validator self-test | `python3 harness/checks/validate.py --self-test` | exit 0 |
| Site tests (catalog reader) | `pnpm test` | all pass |
| Full build | `pnpm build` | exit 0 |
| YAML sanity | `python3 -c "import yaml,glob; [yaml.safe_load(open(f)) for f in glob.glob('harness/standards/domains/*.yaml')]; print('ok')"` | `ok` |

## Scope

**In scope**:
- `harness/standards/catalog.yaml` (meta block + no control-body changes except adding `domains:` scope to zero-or-more controls if trivially derivable — default: none)
- `harness/standards/schema.json`, `harness/checks/validate.py`
- `harness/standards/README.md` (§Scope + a new §Domains)
- `harness/standards/domains/` (create: `README.md`, `_template.yaml`, `teachers-school.yaml`, `students.yaml`, `parents.yaml`, `platform.yaml`)
- `harness/docs/DESIGN-CONTEXT.md`, `harness/scripts/generate-design-json.py` (new `Domain` + `Typography` + `Stack` sections)
- `harness/CLAUDE.md` (stack paragraph rewrite)
- `lib/catalog.ts`, `lib/catalog.test.ts` (types for meta.domains)

**Out of scope**:
- Rewriting skill prose (plan 003), the wizard (plan 004), website pages (plan 005).
- Adding real Students/Parents/Platform brand values — their profiles are **stubs with explicit `status: proposed`** until their leads supply values. Do not invent colours or fonts for them.
- Changing any control's tier, text, or enforcement. Do not stamp `domains:` onto floor controls (same safety rule as products/audiences).
- CONTRIBUTING/governance text (plan 007).

## Git workflow

- Branch: `advisor/002-domain-profile-schema` off `main` (rebase on 001 if it has landed).
- Commit per step; match repo message style (`docs(standards): …`, `feat(harness): …`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Domain registry in catalog meta

In `harness/standards/catalog.yaml` `meta:`, add:

```yaml
  domains:
    teachers-school: Teachers & School   # TransformX portfolio: tw, casesync, glow
    students: Students
    parents: Parents
    platform: Platform                   # incl. EduPass
```

and map existing products to their domain by adding a comment-level note only (products stay the operational scope unit). Bump `meta.updated` to today.

**Verify**: `python3 harness/checks/validate.py` → exit 0 (if the schema rejects unknown meta keys, that's step 2's job — do steps 1–2 together, then verify).

### Step 2: Schema + validators learn `domains`

1. `harness/standards/schema.json`: allow `meta.domains` (map of slug → display name) and an optional per-control `domains:` array whose values must be keys of `meta.domains` (mirror exactly how `products:` is validated).
2. `harness/checks/validate.py`: validate per-control `domains:` values against the registry; forbid empty lists (same rule as `products: []`).
3. `lib/catalog.ts`: extend the meta type with `domains: Record<string,string>`; add/extend a test in `lib/catalog.test.ts` asserting the four domain keys load.

**Verify**: `python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py` → exit 0; `pnpm test` → all pass.

### Step 3: Scope spec update

In `harness/standards/README.md` §Scope: document `domains:` as the third optional scope field — absent = all domains; intersection filtering now reads (`domains` absent OR contains active domain) AND (`products` …) AND (`audiences` …); a control carrying both `domains:` and `products:` must be consistent (a product implies its domain). Restate the floor rule verbatim for domains: **never stamp `domains:` onto floor controls**. Add a short §Domains section: what a domain is, the additive-only rule ("domains may add scoped controls via the ratchet; no domain may weaken, override, or globally waive a foundation control — waivers stay per-instance"), and a pointer to `standards/domains/`.

**Verify**: `grep -n 'domains' harness/standards/README.md | head` → shows the new spec; `python3 harness/checks/validate.py` → exit 0.

### Step 4: Domain profile schema + the four profiles

Create `harness/standards/domains/` with:

- `README.md` — the profile format spec, mirroring DESIGN-CONTEXT's philosophy: **a profile carries brand parameters, never rule restatements**; absent field = foundation default; profiles are additive to the catalog, never normative over it.
- `_template.yaml` — the commented blank template a new domain copies.
- Profile shape (all fields optional except `domain`, `name`, `status`):

```yaml
domain: teachers-school          # registry key (meta.domains)
name: Teachers & School
status: settled                  # settled | proposed — same vocabulary the site uses
owner: ""                        # domain lead
products:                        # registry keys from catalog meta.products
  - tw
  - casesync
  - glow
audiences: [teachers]
colour:
  primaries:                     # per-product primary, per COL-1
    tw: "--tw-blue #0064FF"
    casesync: "--casesync (Radix indigo-9)"
    glow: "--glow (Radix orange-9)"
typography:
  display: "Plus Jakarta Sans (600)"
  body: "Inter (400/500/600)"
stack: "Base UI + Radix Colors + shadcn/ui default tokens"
illustration:
  direction: ""                  # prose pointer
  sref: []                       # Midjourney SREF codes
voice: "Kind Utility — see content skill §6"
notes: ""
```

- `teachers-school.yaml` — filled from the real values above (source: `harness/CLAUDE.md` stack paragraph and COL-1/TYP-1 control detail files — read `harness/standards/controls/col-1.md` and `typ-1.md` to confirm exact wording; copy values, cite sources in comments). `status: settled`.
- `students.yaml`, `parents.yaml`, `platform.yaml` — `status: proposed`, `domain`/`name`/`owner: ""` only, every brand field absent, one comment: "Stub — awaiting domain lead's declarations. Absent = foundation defaults."

Extend `harness/checks/validate.py` to validate `standards/domains/*.yaml`: required keys present, `domain` matches filename and registry, `products`/`audiences` values exist in catalog meta, `status` ∈ {settled, proposed}.

**Verify**: `python3 harness/checks/validate.py` → exit 0; the YAML sanity command from the table → `ok`. Negative test: temporarily set `domain: bogus` in `_template.yaml`… actually `_template.yaml` should be **excluded** from validation (underscore prefix); verify the validator skips it: rename check — `python3 harness/checks/validate.py` → exit 0 with `_template.yaml` present.

### Step 5: Product context layer learns `Domain`, `Typography`, `Stack`

In `harness/docs/DESIGN-CONTEXT.md`, add three sections to the DESIGN.md table: `Domain` → `domain` (registry key — connects a product repo to its domain profile), `Typography` → `typography`, `Stack` → `stack`. Cite normative sources (COL-1/TYP-1 for the T&S values; the domain profile otherwise). Update `harness/scripts/generate-design-json.py`'s heading map accordingly (follow its existing deterministic-parse pattern: heading → key, `- key: value` lines → structured data). Resolution order documented in DESIGN-CONTEXT.md: **product DESIGN.md > domain profile > foundation default**.

**Verify**: `cd $(mktemp -d) && printf '## Domain\nplatform\n## Colour\n- primary: --edu-green #0A7B4B\n' > DESIGN.md && python3 <repo>/harness/scripts/generate-design-json.py && python3 -c "import json; d=json.load(open('.dxd/design.json')); assert d['domain'].strip()=='platform'; print('ok')"` → `ok` (adjust the output path to `.tfx/` if 001 hasn't landed; check the script's CLI signature first).

### Step 6: Foundation stops naming the stack

In `harness/CLAUDE.md`, rewrite the stack bullet: the *rule* stays foundation ("semantic tokens only — never raw colour/spacing/radius values (TOK-1..3); declare your stack, type, and primaries in your domain profile / DESIGN.md"), the *values* move to a citation of the Teachers & School profile ("T&S profile: Base UI + Radix + shadcn tokens; Plus Jakarta Sans display, Inter body; per-product primaries — `standards/domains/teachers-school.yaml`"). Keep the per-product primary list reachable within one hop. Do not touch the L0 list or anti-slop bullets.

**Verify**: `grep -n 'teachers-school.yaml' harness/CLAUDE.md` → ≥1 hit; `pnpm build` → exit 0.

## Test plan

- `lib/catalog.test.ts`: new assertion — meta.domains has exactly `teachers-school, students, parents, platform` (model on the existing meta assertions in that file).
- `validate.py`: if it has a self-test/fixture pattern (`--self-test`, `harness/checks/fixtures/`), add one fixture: a control with `domains: [students]` passes; `domains: [bogus]` fails; `domains: []` fails. If no fixture pattern exists for validate.py, verify by temporary mutation and record that in the PR description.
- Full gates: `pnpm build && pnpm test` → exit 0.

## Done criteria

- [ ] `python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py` exit 0
- [ ] `pnpm build`, `pnpm test`, `pnpm typecheck` exit 0
- [ ] Four profile files + `_template.yaml` + `README.md` exist under `harness/standards/domains/`; T&S is `settled` with real values; the other three are `proposed` stubs with no invented brand values
- [ ] Catalog meta has `domains:` registry; schema + validator + `lib/catalog.ts` all know it
- [ ] `harness/standards/README.md` documents `domains:` scope + the additive-only rule + the floor rule
- [ ] Generator round-trips `Domain`/`Typography`/`Stack` sections (step 5 verify)
- [ ] `harness/CLAUDE.md` no longer states stack/font values as global facts (they're cited from the T&S profile)
- [ ] No files outside the in-scope list modified; `plans/README.md` row updated

## STOP conditions

Stop and report back if:

- `schema.json` uses a validation approach that can't express "array values ∈ keys of meta.domains" without restructuring — report the schema's actual shape first.
- `harness/standards/controls/col-1.md` / `typ-1.md` disagree with `harness/CLAUDE.md` about the T&S values — report the discrepancy; do not pick a winner silently.
- `generate-design-json.py`'s parse model can't accommodate a plain-prose `Domain` section without changing its structured/prose heuristic for existing keys.
- You feel the need to invent any brand value for students/parents/platform.

## Maintenance notes

- The resolution order (product DESIGN.md > domain profile > foundation default) is the contract plans 003/004/005 build on — changing it later means revisiting all three.
- When a domain lead supplies real values, their profile flips `status: proposed → settled` via the ratchet flow (plan 007 documents this).
- EduPass's audiences (teachers + HQ officers) don't fit the current `audiences:` registry; adding an `hq-staff` audience is a ratchet decision deliberately left out of this plan — expect it during the pilot.
- Reviewer scrutiny: that no existing control gained a scope field, and that stub profiles contain no invented values.
