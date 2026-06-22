# Plan 042: End-of-batch parity review — confirm the catalog, the skills, and the website all match

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **This is a REVIEW / acceptance plan, not a feature plan.** Its product is a
> *review record* — a filled-in parity matrix plus a verdict. It **runs after
> the rest of Batch 4 (plans 033–041) lands** and confirms the source-of-truth
> model actually holds end-to-end. It creates only documentation under
> `harness/docs/reviews/` (and one pointer line in `harness/docs/SYNC.md`). It
> **must not** edit any control, catalog file, skill, check script, component,
> or website source — if the review finds drift, you record it and file a
> follow-up; you do **not** fix it here.
>
> **Drift check (run first)**: `git diff --stat 7629f00..HEAD`
> Unlike a normal plan, you **expect** large changes here — this plan reviews
> the work of plans 033–041, which all land after commit `7629f00`. Use the
> diff and Step 1 to determine **which** batch plans are present; a plan that
> has not landed makes its review rows `n/a` (not a failure). If a referenced
> file's *shape* differs materially from the "Current state" excerpts below
> (e.g. a check's output banner changed), re-read before relying on it.

## Status

- **Priority**: P2 (the acceptance gate for Batch 4: it is the only step that checks the three
  surfaces are consistent *in the rendered product*, not just that each plan's own checks pass —
  and it is the home for the cross-boundary parity that plan 037 deliberately left to human review)
- **Effort**: M (the machine gate is fast; the bulk is walking the parity matrix across every
  catalog control, all five skills, and the website's guideline + control + `.md`-twin surfaces)
- **Risk**: LOW — read-only review that produces documentation; it changes no code, catalog, skill,
  or check.
- **Depends on**: the rest of Batch 4 — **033–041** (this is the capstone; run it last). It is also
  usable *incrementally*: rows for an un-landed plan are marked `n/a`. Hard reference: plan **035**'s
  `harness/docs/SYNC.md` (Step 4 adds a pointer to it — skip that edit if 035 has not landed).
- **Category**: docs / dx (process — acceptance review of the sync architecture)
- **Planned at**: commit `7629f00`, 2026-06-22

## Why this matters

Batch 4 establishes one architecture: **harness = source · website = publisher · `validate.py` =
the guarantee** (recorded in `plans/README.md` "Batch 4" and, after plan 035, in
`harness/docs/SYNC.md`). Several plans enforce slices of it mechanically — 035 parity-checks the L0
and SLP-9 *fragments*, 037 makes the guidelines point at the controls, 033/036 publish `.md` twins
and per-control pages. But **no single step confirms the three surfaces actually agree once
everything has landed.** The mechanical checks are necessarily narrow: plan 037 explicitly
*deferred* an automated voice/tone-*table* parity check as too brittle to cross the
harness↔website boundary, and the deterministic checks can't judge whether a guideline page's prose
*genuinely* defers to a control or whether a `.md` twin faithfully represents its page. That
judgment gap is exactly where drift hides.

This plan is the gap-closer: a **repeatable parity review** that (a) runs the whole built-check gate
as its floor, then (b) walks a structured matrix over every control, skill, and published surface,
recording a verdict and concrete evidence per row, and (c) files a follow-up for every drift or
needs-human row. It turns "we believe the website and the skills match the catalog" into a dated,
auditable record — run now as Batch 4's acceptance gate, and re-runnable later whenever the catalog
or skills change.

## Current state

The three surfaces this review reconciles (the "triangle"):

- **Catalog — the source.** `harness/standards/catalog.yaml` (every control + tier + category) and
  `harness/standards/controls/<id-lower>.md` (per-control detail bodies). `python3
  checks/validate.py` prints `OK: <n> controls valid` — use `<n>` as the control count; do **not**
  hardcode it.
- **Skills — the in-context consumers** (under `harness/.claude/skills/`, five of them):
  `tfx-design-ui`, `tfx-content-style`, `tfx-design-standards`, `tfx-design-review`,
  `tfx-design-onboarding`. They embed control IDs and restate fragments of the catalog: the **L0
  non-negotiables** list (also in `harness/CLAUDE.md` under "Non-negotiables (L0)": A11Y-1, A11Y-2,
  A11Y-3, CMP-2) and the **SLP-9 buzzword** list, plus voice/tone and naming guidance in
  `tfx-content-style`.
- **Website — the publisher** (Next.js app at the repo/worktree root; reads harness files through
  `lib/catalog.ts` and `lib/llms.ts`). Surfaces under review:
  - the catalog browser `app/standards/catalog/page.tsx` and (after **036**) per-control pages
    `app/standards/catalog/<id>` + control `.md` twins;
  - the guideline pages `content/guidelines/*.mdx` — at `7629f00` these are: `data-viz.mdx`,
    `illustration.mdx`, `interaction.mdx`, `naming.mdx`, `product-icons.mdx`, `voice-tone.mdx`,
    `web-interface.mdx` (enumerate the live directory — do not assume this list is current);
  - (after **033**) a `.md` twin for every page and a curated `/llms.txt` index + `/llms-full.txt`.

What the batch produces that this review checks (presence ⇒ that plan landed):

- **033** — `lib/markdown-twin.ts` (the registry of which `.md` URLs exist) + `.md` routes +
  restructured `/llms.txt`. Twin URLs are derivable from that registry and/or `content/map.json`.
- **034** — `validate.py` gains `--self-test` and is wired into `package.json` `"prebuild"`. Today
  (`7629f00`) prebuild is: `node scripts/check-standards.mjs && python3 harness/checks/token-audit.py
  app components lib && python3 harness/checks/a11y-static.py app components` — `validate.py` is
  **not** in it yet.
- **035** — `<!-- tfx-sync:L0 -->` / `<!-- tfx-sync:slp9-buzzwords -->` markers in
  `harness/CLAUDE.md` + the skills + `controls/slp-9.md`, parity sub-checks inside `validate.py`,
  and a new `harness/docs/SYNC.md`.
- **036** — per-control detail pages + control `.md` twins; catalog-browser rows link to them.
- **037** — `tfx-content-style` + the guideline `.mdx` pages defer to the catalog control IDs
  instead of restating the rules; the voice/tone *table* parity is left to **this** review.
- **038 / 040 / 041** — new checks `content-lint.py`, `type-scan.py`, `waiver-reconcile.py`,
  `reaudit-scope.py`, each with an embedded `--self-test`.

Built checks present at `7629f00` (run whatever exists at execution time): `validate.py`,
`token-audit.py`, `audit-record.py`, `a11y-static.py`, `component-manifest.py`.

### Repo conventions to honour

- The review record is plain markdown with markdown tables; verdicts use a **fixed vocabulary**
  (below) so the record is skimmable and the done-criteria are checkable.
- Prose follows `tfx-content-style` (sentence case, second person, plain language, Singapore English
  — "colour", "organise").
- Honesty rule from `harness/CLAUDE.md`: never record a control as "passed" on an unbuilt check —
  say `manual` (with evidence) or `unverified`. The same applies to review verdicts: if you cannot
  judge a row, mark it `needs-human` and escalate; do **not** rubber-stamp it `match`.

**Verdict vocabulary** (use exactly these, lowercase):

- `match` — the surfaces agree; evidence cites how you confirmed it (a passing command, or the
  matching text/link you found).
- `drift` — the surfaces disagree; evidence states the specific difference. Every `drift` row gets a
  follow-up (Step 5).
- `n/a` — the relevant batch plan has not landed yet, so there is nothing to compare. You may
  annotate which plan blocks it in parentheses (e.g. `n/a (036)`), but the verdict cell must still
  *start* with the bare token `n/a` so it reads as a member of this vocabulary.
- `needs-human` — a real comparison that requires judgment you cannot make mechanically (e.g. "do
  these two tone tables say the same thing in different words"). Escalate it; do not guess.

## Commands you will need

| Purpose | Command | Working dir | Expected on success |
|---------|---------|-------------|---------------------|
| Catalog valid + count | `python3 checks/validate.py` | `harness/` | `OK: <n> controls valid`, exit 0 |
| Validate self-test (after 034) | `python3 checks/validate.py --self-test` | `harness/` | `SELF-TEST OK (N cases)`, exit 0 |
| Token audit | `python3 checks/token-audit.py app components lib` | repo root | exit 0 (no violations) |
| A11y static | `python3 checks/a11y-static.py app components` | repo root | exit 0 |
| Record audit | `python3 harness/checks/audit-record.py` | repo root | `OK: <n> records audited`, exit 0 |
| Record-audit self-test | `python3 checks/audit-record.py --self-test` | `harness/` | `SELF-TEST OK (N cases)`, exit 0 |
| Component-manifest self-test | `python3 checks/component-manifest.py --self-test` | `harness/` | `SELF-TEST OK (N cases)`, exit 0 |
| New checks self-test (after 038/040/041) | `python3 checks/<name>.py --self-test` | `harness/` | `SELF-TEST OK (N cases)`, exit 0 |
| Site build | `pnpm build` | repo root | exit 0 (prebuild + routes succeed) |
| Plugin validation | `claude plugin validate harness` (or `.` from `harness/`) | repo root | `✔ Validation passed` |
| Twin reachable (after 033) | `curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:3000/guidelines/voice-tone.md` | (site running) | `200 text/markdown...` |

(`pnpm build` exercises the prebuild check chain. To curl `.md` twins you must have the site running
— `pnpm start` after a build, or `pnpm dev` — see Step 2; if 033 generated static files under
`public/` instead of using middleware, check those files directly rather than curling.)

## Scope

**In scope** (create/modify — documentation only):
- `harness/docs/reviews/README.md` (create) — the **repeatable procedure**: how to run a parity
  review, the matrix definition, the verdict vocabulary. (Create the `reviews/` directory.)
- `harness/docs/reviews/batch4-parity-2026-06-22.md` (create) — **this run's review record** (the
  filled matrix + verdict). Name it with the date you run it if different.
- `harness/docs/SYNC.md` (modify — **only if it exists**, i.e. plan 035 has landed) — add one
  pointer line tying the automated parity checks to this periodic human review.

**Out of scope** (do NOT touch — this is a review):
- Any control, the catalog, `controls/*.md`, any skill, any `checks/*.py`, any website source
  (`app/`, `components/`, `lib/`, `content/`), `package.json`. If the review finds a problem in any
  of these, **record it and file a follow-up (Step 5)** — fixing it is a separate plan.
- `plans/README.md` beyond your own status row.
- Filing GitHub issues or any network side effect (unless the operator explicitly asks) — Step 5
  writes follow-ups as local notes / plan stubs by default.

## Git workflow

- Branch: `advisor/042-parity-review`. Conventional commits
  (`docs(reviews): add Batch 4 catalog↔skills↔website parity review`). Do NOT push.

## Steps

### Step 1: Determine review scope (which batch plans have landed)

Establish, mechanically, which of 033–041 are present — each absent plan turns its rows `n/a`:

- **033** landed if `lib/markdown-twin.ts` exists (`ls lib/markdown-twin.ts`).
- **034** landed if `grep -n "validate.py" package.json` shows it in `"prebuild"`.
- **035** landed if `grep -rn "tfx-sync" harness/CLAUDE.md harness/.claude/skills` finds markers AND
  `ls harness/docs/SYNC.md` exists.
- **036** landed if a per-control route exists under `app/standards/catalog/` — run
  `ls 'app/standards/catalog/'` (quote it so the shell does not glob the brackets) and look for a
  dynamic-segment directory (e.g. `[id]`) alongside `page.tsx`.
- **037** landed if the guideline `.mdx` files link to catalog control IDs
  (`grep -rn "standards/catalog" content/guidelines/`).
- **038 / 040 / 041** landed if `ls harness/checks/content-lint.py harness/checks/type-scan.py
  harness/checks/waiver-reconcile.py harness/checks/reaudit-scope.py` finds them.

Record the landed/absent status of each — it becomes the "Scope of this review" header in the
record.

**Verify**: you have a yes/no for each of 033–041, derived from the commands above (not from
memory).

### Step 2: Run the machine gate (the floor)

Run every built check and the build; capture exit code + the headline line of each. **All present
checks must pass.** Run only the checks that exist (per Step 1):

- `python3 checks/validate.py` (from `harness/`) → `OK: <n> controls valid`. Record `<n>`.
- If 034 landed: `python3 checks/validate.py --self-test` → `SELF-TEST OK (N cases)`.
- `python3 harness/checks/audit-record.py` (repo root) → `OK: <n> records audited`.
- `python3 checks/audit-record.py --self-test` (from `harness/`) → `SELF-TEST OK (N cases)`.
- `python3 checks/component-manifest.py --self-test` (from `harness/`) → `SELF-TEST OK (N cases)`.
- For each present new check (038/040/041): `python3 checks/<name>.py --self-test` → `SELF-TEST OK`.
- `pnpm build` (repo root) → exit 0 (this runs the prebuild check chain — token-audit + a11y-static
  over the real tree, plus validate.py once 034 landed).
- `claude plugin validate harness` → `✔ Validation passed`.

The machine gate = the prebuild chain (exercised by `pnpm build`) + the `--self-test` of every built
check present (validate, audit-record, component-manifest, and whichever of 038/040/041 landed) +
`claude plugin validate`. Run each and record its banner. `token-audit` and `a11y-static` run over
the real tree inside `pnpm build`, so a green build covers them — you do not run them separately.

If 033 landed, verify the `.md` twins are reachable. The build server is long-running, so start it
in the background, wait for it, curl, then stop it:
- `pnpm start &` (background). Note the port it prints — default `3000`, but if that port is taken
  it may pick another; use the printed port in the curls below.
- Poll until up: `for i in $(seq 1 30); do curl -sf http://localhost:3000/ >/dev/null && break; sleep 1; done`
- `curl` a representative twin **including a *section* path** (the routing precedent plan 033 calls
  out): `/guidelines/voice-tone.md` and `/standards/catalog.md` must each return `200` with
  `content-type: text/markdown` (use the `-w '%{http_code} %{content_type}'` form from the Commands
  table).
- Stop the server when done (`kill %1`, or Ctrl-C the shell you started it in).

(If 033 generated static `public/` files instead of a server route, skip the server and check the
files directly: `ls public/guidelines/voice-tone.md && head -n 5 public/guidelines/voice-tone.md` —
each must exist and be markdown.)

**Verify**: every present check exits 0 with its expected banner; `pnpm build` exits 0; if 033
landed, the two `.md` twins return `200 text/markdown`. Any failure here is a STOP condition — the
batch is not actually green, so the parity review cannot proceed honestly.

### Step 3: Build the parity matrix (catalog ↔ skills ↔ website)

Fill four tables in the review record. Derive rows from the live tree (catalog, skill files,
guideline directory, twin registry) — never from memory. For each row, assign a verdict from the
vocabulary and cite concrete evidence (a command result, a found link, or the differing text).

**3a — Control coverage** (one row per catalog control; the URL space should equal the catalog):

| Control | Browsable page (036) | `.md` twin (033/036) | Referenced in a skill | Verdict | Evidence |

- "Browsable page": after 036, `app/standards/catalog/<id>` renders (build covers it; spot-check a
  few ids by curl if the site is running). Before 036 → `n/a (036)`.
- ".md twin": the control's `.md` URL is in the twin registry / returns 200. Before 033/036 →
  `n/a`.
- "Referenced in a skill": `grep -rn "<ID>" harness/.claude/skills` finds it (informational — not
  every control must be named in a skill; only flag a control a skill names but the catalog lacks,
  which `validate.py` would already catch).

**3b — Fragment parity (the mechanical floor, plan 035)**:

| Fragment | Surfaces | Verdict | Evidence |
| L0 non-negotiables | `CLAUDE.md` + skills vs catalog L0 set | | `validate.py` parity result |
| SLP-9 buzzwords | `tfx-content-style` vs `controls/slp-9.md` | | `validate.py` parity result |

- If 035 landed, the verdict is whatever `validate.py` reports (it now parity-checks these) →
  `match` on pass. If 035 has **not** landed, do the comparison **by hand** here (read the L0 list in
  `CLAUDE.md`/`tfx-design-ui` against the catalog's L0-tier controls; read the buzzword list in
  `tfx-content-style` against `controls/slp-9.md`) and record `match` / `drift` — this review is
  also a safety net for the parity 035 will later automate.

**3c — Guideline ↔ catalog parity (plan 037 + the deferred table check)**:

| Guideline page | Control(s) it should defer to | Defers (links the control) | Restated-rule drift | Verdict | Evidence |

- One row per `content/guidelines/*.mdx`. "Defers": `grep -n "standards/catalog" <file>` shows a link
  to the control (after 037). "Restated-rule drift": does the page still *restate* a rule the
  control owns, in words that differ from the control? For `voice-tone.mdx` specifically, lay its
  voice-attribute and tone-by-context **tables** beside the same tables in `tfx-content-style`
  (this is the parity plan 037 deferred): equal rows, equal cells? If they differ, `drift` with the
  specific row; if you cannot judge equivalence of differently-worded cells, `needs-human`.

**3d — Twin fidelity (plan 033)**:

| Page `.md` twin | Reachable (200) | No HTML/JSX leak | Faithful to page | Verdict | Evidence |

- One row per twin in the registry. If there are more than 10 twins you may sample, but the floor is
  **≥ 8 URLs chosen as: every guideline twin + the catalog twin (`/standards/catalog.md`) + the
  product-icons twin + at least 3 control twins** — and you must **list every sampled URL** in the
  record (no silent truncation; if you cover all twins, say so). "No HTML/JSX leak": `curl` the twin
  and `grep -E "<div|<svg|<figure|<Image"` returns nothing (the known JSX case is
  `content/guidelines/product-icons.mdx` — check its twin explicitly, always, even when sampling).
  "Faithful": the twin's headings/body correspond to the rendered page (spot-check). Before 033 →
  all `n/a`.

**Verify**: every control has a 3a row; every fragment a 3b row; every guideline page a 3c row;
every twin (or a declared sample) a 3d row. No row is blank — each has a verdict and evidence.

### Step 4: Write the review record + the repeatable procedure; link from SYNC.md

- Create `harness/docs/reviews/batch4-parity-2026-06-22.md` (use today's date) with:
  - a header: date, the commit reviewed (`git rev-parse --short HEAD`), and the Step-1 landed/absent
    table;
  - the four matrices from Step 3, filled;
  - a **Verdict summary**: counts of `match` / `drift` / `n/a` / `needs-human`, and a one-line
    overall call ("Batch 4 parity: clean" only if there are zero `drift` and zero `needs-human`
    rows; otherwise "parity gaps found — see follow-ups").
- Create `harness/docs/reviews/README.md` documenting the **procedure** so it is re-runnable: when to
  run it (after the catalog or skills change, or after a sync batch lands), the four matrices and how
  to derive each, and the verdict vocabulary. Keep it short and imperative.
- **Only if `harness/docs/SYNC.md` exists** (035 landed): add one line under its parity section,
  e.g. "Automated parity (the `tfx-sync` checks above) is the floor; a periodic human parity review
  — `docs/reviews/` — covers what the checks can't (twin fidelity, table equivalence, guideline
  deference). See `docs/reviews/README.md`." If SYNC.md does not exist, **skip this edit** and note
  in the record that the SYNC.md pointer is deferred until 035 lands.

**Verify**: `ls harness/docs/reviews/README.md harness/docs/reviews/batch4-parity-2026-06-22.md`
both exist; `claude plugin validate harness` → `✔ Validation passed`; `git status` shows only
in-scope files.

### Step 5: File follow-ups for every drift / needs-human row

For each `drift` or `needs-human` row, create a short follow-up so it is not lost — **do not fix it
here**:

- Default (no operator instruction to use GitHub): append a "## Follow-ups" section to the review
  record listing each gap as a one-liner (`<surface> — <specific difference> — suggested owner /
  next plan`), and, where a fix clearly warrants its own plan, write a brief plan stub under
  `plans/` following the next free number — re-derive it as the highest `NNN` over
  `ls plans/[0-9]*.md` plus 1 (scan the directory, not just the README table, which may be stale
  mid-batch) — *stub only*: title,
  why, the specific drift, and "specify fully before executing". 
- If the operator explicitly asked for issues, file them with `gh` (confirm repo visibility first per
  the harness feedback process) — otherwise stay local.

**Verify**: the count of follow-up entries equals the count of `drift` + `needs-human` rows in the
verdict summary (no gap recorded without a follow-up).

## Test plan

This plan writes documentation, so its "tests" are the gate it runs and the completeness of the
record:

- Step 2's machine gate — every present check + `pnpm build` + plugin validate green; the two `.md`
  twins reachable (if 033 landed).
- Record completeness — a row per control / fragment / guideline / twin; every row has a verdict +
  evidence; follow-up count matches drift+needs-human count.
- Re-runnability — a second reader, following `docs/reviews/README.md` alone, could reproduce the
  matrices.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] Step 1 landed/absent status recorded for each of 033–041 (derived from the tree, not memory)
- [ ] Every **present** built check passes and `pnpm build` exits 0; `claude plugin validate harness`
      → `✔ Validation passed`; if 033 landed, `/guidelines/voice-tone.md` and `/standards/catalog.md`
      return `200 text/markdown`
- [ ] `harness/docs/reviews/batch4-parity-2026-06-22.md` exists with the four matrices filled — a row
      per catalog control (3a), the two fragments (3b), each `content/guidelines/*.mdx` (3c), and
      each twin or a declared sample (3d) — every row carrying a verdict ∈ {`match`,`drift`,`n/a`,`needs-human`} and evidence
- [ ] `harness/docs/reviews/README.md` documents the repeatable procedure + verdict vocabulary
- [ ] If `harness/docs/SYNC.md` exists, it links to the review procedure; if not, the record notes the deferral
- [ ] Every `drift` / `needs-human` row has a matching follow-up entry (Step 5)
- [ ] No file outside the in-scope list is modified (`git status`) — **no control, catalog, skill,
      check, or website source touched**
- [ ] `plans/README.md` status row for 042 updated

## STOP conditions

Stop and report back (do not improvise) if:

- **A built check or `pnpm build` fails** in Step 2 — the batch is not green, so a parity review
  would be reporting on a broken state. Report which check failed and stop; this is a batch-execution
  problem, not a review finding to log.
- Reviewing a row would require **editing** a control, skill, check, or website file to make it
  "match" — that is out of scope; record it as `drift` with a follow-up and move on.
- The catalog control count from `validate.py` is `0`, or `content/guidelines/` is empty, or the twin
  registry can't be located while 033 is marked landed — the tree doesn't match this plan's "Current
  state"; re-read and report rather than producing an empty matrix.
- You find a `drift` you are tempted to mark `match` because "it's basically the same" — mark it
  `needs-human` and escalate instead. The review's value is honesty about gaps.

## Maintenance notes

For the human/agent who owns this after it lands:

- This review is **re-runnable** and should be re-run whenever the catalog or a skill changes, or
  after any future sync batch — `docs/reviews/README.md` is the procedure; add a new dated record
  each run rather than overwriting the last.
- It is the designated home for the **cross-boundary parity that stays manual on purpose**: plan
  037 deferred an automated voice/tone-*table* parity check (a table check spanning the
  harness↔website boundary is brittle); matrix 3c is where that comparison actually happens. If that
  ever justifies automation, it becomes its own check plan — and matrix 3c shrinks to citing it,
  exactly as 3b cites `validate.py` once 035 lands.
- A reviewer should scrutinise that (a) no row was rubber-stamped `match` without evidence, (b) the
  twin-fidelity sample (3d) is either complete or its sampling is stated (no silent truncation), and
  (c) the plan stayed read-only — the in-scope list is documentation only.
- Natural extension (not in this plan): a tiny helper that prints the matrix *skeleton* (one row per
  control + guideline + twin) from `getCatalog()` + `content/map.json`, so the reviewer fills
  verdicts instead of reconstructing the row set — the same spirit as plan 041's `reaudit-scope`.
