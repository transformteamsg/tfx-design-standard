# Plan 011: Give catalog controls a `status` field so pending proposals stop rendering as settled standard

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT update `plans/README.md` — the reviewer
> maintains the index.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- harness/standards/catalog.yaml harness/standards/schema.json harness/checks/validate.py scripts/check-standards.mjs lib/catalog.ts app/standards/catalog components/catalog-browser.tsx`
> On any change to these paths, compare the "Current state" excerpts against
> the live code; on a mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug (governance/integrity)
- **Planned at**: commit `233f3be`, 2026-07-11

## Why this matters

CNT-5, CNT-6, and CNT-7 in `harness/standards/catalog.yaml` carry YAML comments
reading "ratchet PROPOSAL … Pending design-lead approval". Git history confirms
no approval was ever recorded (contrast CNT-4, whose approval is in commit
`b5be29d` and whose comment says "design-lead approved"). But YAML comments are
invisible to the parser: the schema has no status field for controls, so all
three render on `/standards/catalog` and `/standards/catalog/<id>`
indistinguishable from settled controls, and CNT-5/CNT-6 are stamped
`enforced: partial` with `checks/content-lint.py` actively flagging teams on
them. Product teams receive findings from controls the design lead has not
approved, presented as in-force standard. This violates the repo's own ratchet
flow (`harness/CONTRIBUTING.md`: the design lead approves before catalog
changes land) and the spirit of the repo CLAUDE.md rule "Don't mark proposed
things settled."

Fix at the right depth: make proposal status **data** — an optional
`status: proposed` field validated by both validators, surfaced on the site the
same way proposed docs already are. Do NOT decide the governance question of
whether lint should stop flagging proposed controls — surface it, don't settle it.

## Current state

Files and roles:
- `harness/standards/catalog.yaml` — the catalog; CNT-5 (~line 626), CNT-6
  (~line 650), CNT-7 (~line 674) each carry a `# … ratchet PROPOSAL …
  Pending design-lead approval …` comment. Entry shape (CNT-5, abridged):

```yaml
  - id: CNT-5
    source: TFX-DS
    title: UI action words name the action, not the input device — "choose", "select", "view", never "click", "tap", "swipe", or "press"
    tier: L2
    check: hybrid
    ...
    detail: controls/cnt-5.md
    enforced: partial
    script: checks/content-lint.py
    refs: [...]
```

- `harness/standards/schema.json` — the full file today:

```json
{
  "comment": "Catalog schema shared by harness/checks/validate.py and scripts/check-standards.mjs — edit here, never in the validators. Format prose: standards/README.md.",
  "required_fields": ["id", "source", "title", "tier", "check", "phase", "applies_to", "verify", "waiver"],
  "tier_waiver": { "L0": "none", "L1": "documented", "L2": "rationale" },
  "checks": ["deterministic", "judgment", "hybrid"],
  "phases": ["intent", "plan", "implement", "verify"],
  "applies_to": ["page", "component", "flow", "content"],
  "products": ["tw", "casesync", "glow"],
  "audiences": ["teachers", "students-primary", "students-secondary", "parents"],
  "enforced": ["script", "partial", "manual", "evaluator"],
  "id_prefixes": ["A11Y", "TOK", "TYP", "COL", "CMP", "CNT", "MOT", "IDN", "SLP", "LAY"]
}
```

- `harness/checks/validate.py` — loads schema.json (`load_schema`, ~line 41)
  into `schema_bits` with `allowed_*` sets (lines 57–64) and validates each
  control in `validate_control` (~line 72 onward); optional fields
  (`products`, `audiences`, `enforced`, `script`) each get an allowed-values
  check. It has `--self-test` (45 cases) — follow the existing case style.
- `scripts/check-standards.mjs` — the Node twin; validates allowed values for
  `phase`, `applies_to` (line 60), `products`, `audiences` (line 69). Neither
  validator rejects unknown fields, so `status` is additive-safe, but both
  must gain an allowed-values check for it.
- `lib/catalog.ts` — `Control` type (lines 5–16), `PUBLIC_FIELDS` allowlist
  (lines 28–43), `getCatalog()` field mapping (lines 50–73). New fields must
  be added in all three places.
- `app/standards/catalog/[id]/page.tsx` — control detail page (server
  component reading `getControlDetail`/`getCatalog` from `lib/catalog-detail`
  / `lib/catalog`). Read it before editing.
- `components/catalog-browser.tsx` — the catalog index browser (client
  component). Read it before editing.
- Exemplar for the badge UI: `components/doc-page.tsx:52-56` renders the
  proposed badge for docs:

```tsx
        {doc.status === "proposed" && (
          <span className="mb-2 inline-block rounded-full border border-warning-muted bg-warning-subtle px-2 py-0.5 text-[11px] font-medium text-warning">
            ⚑ Proposed — react, don&apos;t obey
          </span>
        )}
```

Match this markup/tokens for the control detail page badge.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Validator self-test | `python3 harness/checks/validate.py --self-test` | `SELF-TEST OK` (case count grows) |
| Validator | `python3 harness/checks/validate.py` | `OK: 60 controls valid` |
| Node gate | `node scripts/check-standards.mjs` | `OK: 60 controls valid, …` |
| Typecheck | `pnpm typecheck` | exit 0 |
| Build | `pnpm build` | exit 0 |
| Tests | `pnpm test` | all pass (includes `lib/catalog.test.ts` characterization tests) |

## Scope

**In scope**:
- `harness/standards/schema.json`
- `harness/standards/catalog.yaml` (ONLY adding `status: proposed` lines to CNT-5, CNT-6, CNT-7 — no other edits)
- `harness/checks/validate.py`
- `scripts/check-standards.mjs`
- `lib/catalog.ts`
- `lib/catalog.test.ts` (extend)
- `app/standards/catalog/[id]/page.tsx`
- `components/catalog-browser.tsx`

**Out of scope**:
- `harness/checks/content-lint.py` and any enforcement behaviour — whether
  lint should skip proposed controls is a design-lead decision; record it in
  the maintenance notes, do not implement it.
- `harness/standards/controls/cnt-5.md` etc. — control detail docs unchanged.
- Approving or un-proposing anything — this plan marks reality, it does not
  change it.
- The `/standards/catalog.yaml` header comment or any other catalog entries.

## Git workflow

- Branch: `advisor/011-catalog-proposal-status` from `233f3be`
- Commit per step; style: `feat(standards): optional status field marks unapproved proposals (schema)` etc.
- Do NOT push or open a PR.

## Steps

### Step 1: Schema

Add to `harness/standards/schema.json`:

```json
  "status": ["proposed"],
```

(Only `proposed` is a valid explicit value — absence means settled. This keeps
the field a marker, not a lifecycle machine.)

**Verify**: `python3 -c "import json; json.load(open('harness/standards/schema.json'))"` → exit 0.

### Step 2: validate.py

In `load_schema`, add `"allowed_status": set(schema["status"])` to the returned
dict. In `validate_control`, add an optional-field check mirroring the
`enforced` check: if `status` is present it must be a string in
`allowed_status`. Add self-test cases: (a) `status: proposed` passes,
(b) `status: settled` fails (explicit settled is not a value — absence means
settled), (c) absence passes.

**Verify**: `python3 harness/checks/validate.py --self-test` → SELF-TEST OK with increased case count; `python3 harness/checks/validate.py` → still `OK` (catalog not yet stamped — order is fine either way since the field is optional).

### Step 3: check-standards.mjs

Mirror the same optional-value check following the existing
`[["products", PRODUCTS], ["audiences", AUDIENCES]]` pattern at line 69.

**Verify**: `node scripts/check-standards.mjs` → OK.

### Step 4: Stamp the three proposals

In `harness/standards/catalog.yaml`, add `status: proposed` to CNT-5, CNT-6,
and CNT-7 (place it after `tier:` for readability). Do not touch the comments —
they carry the history.

**Verify**: `python3 harness/checks/validate.py && node scripts/check-standards.mjs` → both OK.

### Step 5: lib/catalog.ts

Add `status?: "proposed"` to the `Control` type, `"status"` to
`PUBLIC_FIELDS`, and `status: c.status` to the `getCatalog()` mapping (cast as
needed, matching the existing style). Extend `lib/catalog.test.ts` with a
characterization case: CNT-5/6/7 have `status === "proposed"`, and a settled
control (e.g. `A11Y-1`) has `status === undefined`; and the public YAML
(`getPublicCatalogYaml()`) contains `status: proposed` exactly 3 times.

**Verify**: `pnpm test` → all pass including new cases; `pnpm typecheck` → exit 0.

### Step 6: Render the badge

- `app/standards/catalog/[id]/page.tsx`: when the control's `status` is
  `"proposed"`, render the proposed badge (match `components/doc-page.tsx:52-56`
  markup and tokens exactly, same copy "⚑ Proposed — react, don't obey").
- `components/catalog-browser.tsx`: in the control row/card, render a small
  `Proposed` marker (reuse the same warning tokens; keep it compact — e.g. the
  short word only, no flag glyph, matching the browser's existing badge scale).

**Verify**: `pnpm build` → exit 0; then `grep -c "Proposed" .next/server/app/standards/catalog/cnt-5.html 2>/dev/null || pnpm build 2>&1 | tail -1` → the built CNT-5 page contains the badge (if the .next path differs, verify by running `pnpm dev` and fetching `curl -s localhost:3000/standards/catalog/cnt-5 | grep -o "Proposed"` → at least one match; kill the dev server after).

## Test plan

- `lib/catalog.test.ts`: the three characterization cases in step 5, modelled
  on the file's existing tests.
- `validate.py --self-test`: the three cases in step 2, modelled on existing
  self-test asserts.

## Done criteria

- [ ] `python3 harness/checks/validate.py --self-test` and `python3 harness/checks/validate.py` → OK
- [ ] `node scripts/check-standards.mjs` → OK
- [ ] `pnpm typecheck && pnpm test && pnpm build` → all exit 0
- [ ] CNT-5, CNT-6, CNT-7 pages render the Proposed badge; A11Y-1 does not
- [ ] `/standards/catalog.yaml` public projection carries `status: proposed` for exactly those three ids
- [ ] No enforcement behaviour changed (`git diff --stat` shows no `content-lint.py`)

## STOP conditions

- The three catalog entries no longer carry "Pending design-lead approval"
  comments (someone may have approved them since 233f3be — if so, this plan's
  premise is gone; report instead of stamping).
- Either validator turns out to REJECT unknown fields in a way that breaks at
  step 4 before steps 2–3 are merged in your worktree — reorder locally, and
  if that fails, report.
- The detail page or browser has no obvious place for a badge without
  restructuring — report with a proposal rather than restructuring.

## Maintenance notes

- **Open governance question for the design lead** (deliberately not decided
  here): should `enforced` checks skip `status: proposed` controls, or keep
  flagging them as advisory? Today content-lint flags CNT-5/6 regardless.
- When the design lead approves a proposal: delete its `status: proposed` line
  and update the YAML comment (see CNT-4's comment for the approved wording).
- The ratchet docs (`harness/CONTRIBUTING.md`) should eventually mention the
  field — deferred to keep this plan's scope tight.
