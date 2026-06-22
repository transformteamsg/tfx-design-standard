# Parity reviews — the repeatable procedure

A parity review confirms the three surfaces of the standard agree once everything has
landed: the **catalog** (source — `standards/catalog.yaml` + `controls/<id>.md`), the
**skills** (in-context consumers under `.claude/skills/`), and the **website** (publisher
— the Next.js app that reads the harness through `lib/catalog.ts` and `lib/llms.ts`).

The automated `tfx-sync` checks in `validate.py` are the floor (see `../SYNC.md`). They
are narrow on purpose. This review covers what they can't judge mechanically: whether a
`.md` twin faithfully represents its page, whether two tone tables say the same thing,
and whether a guideline page genuinely defers to a control. It produces a **dated review
record** — a filled parity matrix plus a verdict.

## When to run

- After a sync batch lands (it was first run as the acceptance gate for Batch 4).
- Whenever the catalog or a skill changes.
- Add a **new dated record** each run (`batch4-parity-YYYY-MM-DD.md`); never overwrite the
  last one.

## It is read-only

This review changes no control, catalog file, skill, check, or website source. If it
finds drift, it **records the drift and files a follow-up** — fixing is a separate plan.
The only files a review may create or modify: this `README.md`, the dated record, and one
pointer line in `../SYNC.md`.

## Verdict vocabulary

Use exactly these, lowercase:

- `match` — the surfaces agree. Evidence cites how you confirmed it (a passing command, or
  the matching text/link you found).
- `drift` — the surfaces disagree. Evidence states the specific difference. Every `drift`
  row gets a follow-up.
- `n/a` — the relevant batch plan has not landed yet, so there is nothing to compare. You
  may annotate the blocking plan in parentheses (`n/a (036)`), but the cell must start with
  the bare token `n/a`.
- `needs-human` — a real comparison that needs judgment you can't make mechanically.
  Escalate it; do not guess. Every `needs-human` row gets a follow-up.

Never rubber-stamp `match` without evidence. If you are tempted to call a difference
"basically the same", mark it `needs-human` instead.

## Procedure

### 1. Determine scope (which batch plans have landed)

Derive each from the tree, not from memory. An absent plan turns its rows `n/a`:

- 033 — `ls lib/markdown-twin.ts`
- 034 — `grep -n "validate.py" package.json` shows it in `"prebuild"`
- 035 — `grep -rn "tfx-sync" CLAUDE.md .claude/skills` finds markers AND `ls docs/SYNC.md`
- 036 — `ls 'app/standards/catalog/'` shows a dynamic segment (`[id]`) beside `page.tsx`
- 037 — `grep -rn "standards/catalog" content/guidelines/` finds links
- 038/040/041 — `ls checks/content-lint.py checks/type-scan.py checks/waiver-reconcile.py checks/reaudit-scope.py`

### 2. Run the machine gate (the floor)

Run only what exists. All present checks must pass; any failure is a STOP condition — the
batch is not green, so the review cannot proceed honestly.

- `python3 checks/validate.py` (from `harness/`) → `OK: <n> controls valid`. Record `<n>`;
  do not hardcode it. The control count `<n>` is the row count for matrix 3a.
- `python3 checks/validate.py --self-test` → `SELF-TEST OK (N cases)` (after 034).
- `python3 checks/audit-record.py` (repo root) → `OK: <n> records audited`.
- `python3 checks/audit-record.py --self-test`, `component-manifest.py --self-test`, and
  each present new check's `--self-test` → `SELF-TEST OK`.
- `pnpm build` (repo root) → exit 0 (runs the prebuild chain: validate + token-audit +
  a11y-static over the real tree). A green build covers `token-audit` / `a11y-static`.
- `claude plugin validate harness` → `✔ Validation passed`.
- `content-lint` / `type-scan` are NOT in prebuild by design — run them over the real tree
  and record their findings in the matrix; they do not gate the build.

If 033 landed, serve and curl the twins:

- `pnpm start &`, then
  `curl --retry 40 --retry-delay 1 --retry-connrefused -sf http://localhost:3000/ -o /dev/null`.
- A **section** twin (`/guidelines/voice-tone.md`) and the catalog twin
  (`/standards/catalog.md`) must each return `200 text/markdown`. Use
  `curl -sS -o /dev/null -w '%{http_code} %{content_type}\n'`.
- Stop the server (`kill %1`).

### 3. Build the parity matrix (four tables)

Derive rows from the live tree. Every row carries a verdict and concrete evidence.

- **3a Control coverage** — one row per catalog control. Browsable page (036), `.md` twin
  (033/036), referenced in a skill (informational — `grep -rn "<ID>" .claude/skills`).
- **3b Fragment parity** — the L0 non-negotiables and the SLP-9 buzzword list. If 035
  landed, the verdict is whatever `validate.py` reports (it parity-checks both via
  `[L0-SYNC]` / `[SLP9-SYNC]`). If 035 has not landed, compare by hand.
- **3c Guideline ↔ catalog parity** — one row per `content/guidelines/*.mdx`. Does it defer
  (link the control) or restate a rule the control owns in differing words? For
  `voice-tone.mdx`, lay its voice-attribute and tone-by-context tables beside the same
  tables in `tfx-content-style` (the parity 037 deferred): equal rows, equal cells? Note:
  plan 037 scopes single-sourcing to `voice-tone` + `naming` only; the other guideline
  pages are standalone presentation guidance not tied to a single content control, so they
  need no deference.
- **3d Twin fidelity** — one row per twin, or a declared sample. Floor: every guideline
  twin + the catalog twin + the product-icons twin + at least 3 control twins, and list
  every sampled URL (no silent truncation). Reachable (200), no HTML/JSX leak
  (`grep -E "<div|<svg|<figure|<Image"` returns nothing — always check the product-icons
  twin, the known JSX case), faithful to the page (headings/body correspond).

### 4. Write the record + link from SYNC.md

- Create `batch4-parity-YYYY-MM-DD.md` with: a header (date, reviewed commit, scope table),
  the four filled matrices, and a **Verdict summary** (counts of each verdict + a one-line
  call — "clean" only with zero `drift` and zero `needs-human`).
- Keep this `README.md` current.
- If `../SYNC.md` exists, ensure it links to this procedure.

### 5. File follow-ups

For each `drift` / `needs-human` row, append a `## Follow-ups` section to the record listing
each gap as a one-liner (`<surface> — <specific difference> — suggested owner / next plan`).
Where a fix warrants its own plan, write a brief stub under `plans/` (next free `NNN`).
Default to local notes; file GitHub issues only if the operator asks. The follow-up count
must equal the `drift` + `needs-human` count.
