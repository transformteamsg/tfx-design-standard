# Plan 054: A `feedback` skill — catch harness feedback mid-turn and file it as a GitHub issue on the right repo

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat c42d695..HEAD -- harness/.claude/skills/ harness/scripts/ harness/docs/harness-feedback.md harness/evals/routing/prompts.yaml`
> Plans 046/047/049 landing first is expected drift (fold, renames, extraction).
> This plan uses POST-047 names (`design`, `onboard`, plugin `tfx`); if 047 has
> not landed, STOP — execute 047 first (or ask the operator whether to use the
> old names).

## Status

- **Priority**: P2 (direct user ask)
- **Effort**: M
- **Risk**: MED (new routing surface + an outward side effect — mitigated by consent gate and dry-run)
- **Depends on**: 047 (hard — names/paths), 046 (transitively)
- **Category**: dx
- **Planned at**: commit `c42d695`, 2026-07-02

## Why this matters

The harness already made GitHub issues the system of record for its own feedback
(plan 030: `docs/harness-feedback.md`) and shipped a safe filing helper
(plan 031: `scripts/file-feedback-issue.py` — marker, labels, dedup, dry-run,
honest failure). But nothing *triggers* that machinery when it matters most: a
user working in a product repo says, mid-task, "this gate is annoying", "the
check flagged the wrong thing", "the skill missed my component" — and the
feedback evaporates when the session ends, because filing is only mentioned at
Phase 6 of the design loop (ratchet time) and only for friction the agent itself
noticed. This plan adds a small user-routable `feedback` skill that teaches the
agent to (1) recognise harness feedback the moment a user voices it — even
mid-turn in another task, (2) capture the context while it is fresh, (3) confirm
with the user, and (4) file it via the existing helper to the CORRECT repo — the
harness repo (`transformteamsg/tfx-design-standard`), never the product repo the
session happens to be in.

One tension to own: plans 046/047 just simplified the stack 5 → 4 skills, and
this adds a fifth back. The difference is that `tfx-design-review` was never
user-routed; `feedback` exists precisely TO be user-routed. Keep it small
(≤ 80 lines) — it is a trigger + procedure, not an essay.

## Current state

- `harness/docs/harness-feedback.md` (81 lines) — the process spec: issues on
  `transformteamsg/tfx-design-standard`; title marker `[harness-feedback]
  <summary>`; labels = one severity (`L0-risk`, `high`, `med`, `low`) + one or
  more category (`a11y`, `tooling`, `standards`, `harness-ux`, `onboarding`);
  dedup via `gh issue list --search "[harness-feedback] <keywords>" --state all`
  with exact-marker re-filtering; honest failure ("print the issue body that
  *would* have been filed and the failure reason, exit non-zero — never silently
  skip"); boundary rule — feedback/friction is an issue, a control proposal
  goes through the ratchet instead.
- `harness/scripts/file-feedback-issue.py` (320 lines) — the ACTION helper.
  Constants: `MARKER = "[harness-feedback]"`, `SEVERITIES`, `CATEGORIES`,
  `DEFAULT_REPO = "transformteamsg/tfx-design-standard"`. Flags: `--severity`,
  `--category`, `--title`, `--body`, `--dry-run` (prints the gh command + body,
  files nothing), `--self-test` (14 cases, network-free). Check at execution
  time whether a `--repo` override flag exists; the DEFAULT_REPO constant is the
  correct target either way.
- The design skill's Phase 6 (post-049 file layout: still in SKILL.md) says
  friction "is filed as a **GitHub issue** (the system of record), per
  `docs/harness-feedback.md`: title `[harness-feedback] <summary>`, one severity
  + one or more category labels, dedup first."
- `harness/.claude-plugin/plugin.json` — `"skills": "./.claude/skills/"` (a
  glob: adding a skill directory needs no manifest edit). Post-047 the plugin is
  `tfx`, so the new skill invokes as `tfx:feedback`.
- `harness/evals/routing/prompts.yaml` — 33 routing cases; the header documents
  the sweep policy ("run the full sweep only when a skill's frontmatter
  `description:` changes"). A NEW skill = new description = its cases must be
  added and at minimum a spot-check run.
- `harness/CLAUDE.md` — "Where things live" table routes tasks to skills; needs
  a feedback row.
- Skill path convention: the helper ships with the plugin; from inside a skill
  dir it resolves as `<this-skill-dir>/../../../scripts/file-feedback-issue.py`
  (same three-levels-up pattern every skill uses for `standards/`).
- Consumer-repo reality the skill must handle: the session's cwd is a PRODUCT
  repo (TW/CaseSync/Glow); `gh` may be unauthenticated or the user may lack
  access to the harness repo; the harness repo's visibility may make filed text
  readable beyond the team.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Helper self-test | `python3 harness/scripts/file-feedback-issue.py --self-test` | `SELF-TEST OK (14 cases)` |
| Helper rehearsal | `python3 harness/scripts/file-feedback-issue.py --dry-run --severity low --category harness-ux --title "test" --body "test"` | prints gh command + body, files nothing, exit 0 |
| Validate | `python3 harness/checks/validate.py` | exit 0 |
| Routing spot-check (per case) | `claude -p "<prompt>" --max-turns 2 --output-format json` | expected skill in tool calls |

## Scope

**In scope**:
- `harness/.claude/skills/feedback/SKILL.md` (create)
- `harness/.claude/skills/design/SKILL.md` (Phase 6: replace the inline filing
  instructions with a pointer to the feedback skill — ~3 lines changed)
- `harness/.claude/skills/onboard/SKILL.md` (one line in the run-shape routing:
  "feedback about the harness itself → the `feedback` skill")
- `harness/CLAUDE.md` ("Where things live" table: one row)
- `harness/README.md` (skills list/diagram: one entry)
- `harness/docs/harness-feedback.md` (one short section: "Mid-session capture —
  the `feedback` skill", pointing back here as spec)
- `harness/evals/routing/prompts.yaml` (new cases)
- `content/harness/skills.mdx` (one table row — keeps the website's skill list true)

**Out of scope** (do NOT touch):
- `harness/scripts/file-feedback-issue.py` — reuse as-is. EXCEPTION: if
  execution reveals it lacks a `--repo` flag AND `gh` in a product repo would
  file to the wrong place without one, STOP and report; adding the flag is a
  one-line decision the operator should see.
- Label definitions, severity/category sets, the marker — the doc + script are
  the source of truth; the skill cites, never restates the lists.
- The evaluator agent, `standards`/`content` skills, the catalog.

## Git workflow

- Branch: `advisor/054-feedback-skill`
- Commit style: `feat(harness): tfx:feedback skill — mid-turn harness feedback → GitHub issue`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Write the skill

Create `harness/.claude/skills/feedback/SKILL.md` (≤ 80 lines). Frontmatter:

- `name: feedback`
- `description:` — must earn routing on BOTH explicit asks and mid-task
  signals, and defend against false positives. Draft (tune wording, keep all
  three parts — trigger, mid-turn clause, negative):
  "Capture feedback about the TFX design harness itself — a confusing skill or
  gate, a check that flagged wrongly or is missing, a process or onboarding
  gap — and file it as a `[harness-feedback]` GitHub issue on the harness repo.
  Use when the user gives such feedback in ANY session, including mid-task
  while another skill is running, or asks to 'file this as harness feedback'.
  NOT for feedback about a product's design or page (that is design-loop
  material), and NOT for proposing a new catalog control (that is the ratchet,
  via the standards skill)."

Body — the procedure, in this order:

1. **Recognise and hold, don't derail.** If you are mid-task (e.g. inside the
   design loop), acknowledge the feedback in one line, capture it (step 2) into
   a note, finish the current gate/step, then run steps 3–5 before the turn
   ends. Never let the capture die with the session; never abandon the user's
   main task to go file paperwork.
2. **Capture context while fresh**: what the user said (quote them), which
   skill/phase/check/control surfaced it, the evidence (the command output,
   control id, or gate in question), and the session's product repo. This
   becomes the issue body per `../../../docs/harness-feedback.md` (resolve
   relative to this SKILL.md, three levels up — the doc ships with the plugin).
3. **Classify**: one severity + category label(s) from the doc's scheme
   (read the doc; do not trust memory for the label lists). Boundary check: if
   the feedback is really a control proposal, route to the ratchet via the
   `standards` skill instead and say so.
4. **Confirm before filing** — filing an issue is an outward, visible side
   effect on a repo the user may not own. Show the exact title, labels, and
   body (use the helper's `--dry-run` output) and ask the user to approve,
   edit, or skip. In an unattended run, do NOT file — emit the dry-run output
   into the session/record and mark it "queued, not filed".
5. **File via the helper, never raw `gh issue create`**:
   `python3 <this-skill-dir>/../../../scripts/file-feedback-issue.py --severity … --category … --title … --body …`
   It dedups, validates labels, targets the harness repo
   (`transformteamsg/tfx-design-standard`) regardless of the session's cwd, and
   fails honestly. If it exits non-zero, relay its would-be-issue output and the
   reason verbatim — never claim an issue was filed when it wasn't, and never
   retry into the product repo.
6. **Close the loop**: give the user the issue URL; if the helper reported a
   duplicate, give the existing issue's URL and offer to add their context as a
   comment instead.

**Verify**: `wc -l harness/.claude/skills/feedback/SKILL.md` → ≤ 80; `grep -c "file-feedback-issue.py\|harness-feedback.md" harness/.claude/skills/feedback/SKILL.md` → ≥ 2; `grep -c "dry-run\|Confirm before filing" harness/.claude/skills/feedback/SKILL.md` → ≥ 2.

### Step 2: Point the existing surfaces at it

- `design/SKILL.md` Phase 6: replace the inline "title `[harness-feedback]`…
  dedup first" detail with: "…is filed as a GitHub issue via the `feedback`
  skill (it carries the procedure; `docs/harness-feedback.md` is the spec)."
  Do not change anything else in Phase 6.
- `onboard/SKILL.md`: in the run-shape step's single-run list, add: "feedback
  about the harness itself → hand off to the `feedback` skill and stop."
- `harness/CLAUDE.md` "Where things live": add row "Report harness
  friction/feedback | `feedback` skill (files the GitHub issue)".
- `harness/README.md`: add `feedback` to the skills list/diagram (post-048 the
  diagram is regenerated — coordinate; if 048 landed, edit the regenerated one).
- `harness/docs/harness-feedback.md`: add a 3–4 line "Mid-session capture"
  section naming the skill as the delivery vehicle, doc stays the spec.
- `content/harness/skills.mdx`: add the row so the website's skill table stays
  true (5 skills again — the row should say what it does, one line).

**Verify**: `grep -rn "feedback" harness/CLAUDE.md | grep -ci "skill"` → ≥ 1; `grep -c "feedback" content/harness/skills.mdx` → ≥ 1; `pnpm build` → exit 0.

### Step 3: Routing eval cases

Append to `harness/evals/routing/prompts.yaml` (update the header enumeration
and total count comment):

- `"The plan gate keeps interrupting me for tiny copy changes — that's too much process"` → `expect: feedback`
- `"File this as harness feedback: the contrast check flagged a disabled button"` → `expect: feedback`
- `"The token-audit check missed a raw hex I snuck in — the harness should have caught it"` → `expect: feedback`
- `"I don't like the empty state on the student notes page"` → `expect: design` (product feedback, NOT harness feedback — the critical negative case)
- `"I think we need a new control banning full-width tables"` → `expect: standards` (ratchet, not an issue)

Run at least these five as a live spot-check per the file's `how_to_run` (fresh
sessions). If headless runs are unavailable, STOP short of DONE and report the
sweep as pending.

**Verify**: 5/5 expected outcomes (or failures reported with transcripts).

### Step 4: End-to-end rehearsal (no real issue)

`python3 harness/scripts/file-feedback-issue.py --self-test` → 14 cases green.
Then a full dry-run with a realistic body (quote + skill/phase + product repo
context per Step 1's capture format) → confirm the printed gh command targets
`transformteamsg/tfx-design-standard` and the title carries the marker. Do NOT
file a real issue as part of this plan.

**Verify**: dry-run output shows the correct repo and marker; nothing filed (`gh issue list --repo transformteamsg/tfx-design-standard --search "test" --state open` unchanged — skip this check if `gh` is unauthenticated and note it).

## Test plan

The routing spot-check (Step 3) and the dry-run rehearsal (Step 4) are the
tests. Recommend to the operator one supervised REAL filing from a product-repo
session as the acceptance run (a genuine nit, user-approved) — not part of this
plan's execution.

## Done criteria

- [ ] `feedback` skill exists, ≤ 80 lines, cites doc + helper by relative path, has the consent gate and the unattended "queued, not filed" rule
- [ ] design Phase 6 + onboard + CLAUDE.md + README + harness-feedback.md + skills.mdx all point at it consistently
- [ ] Routing cases added; 5-case spot-check green (or reported pending)
- [ ] Helper self-test green; dry-run targets the harness repo with the marker
- [ ] `python3 harness/checks/validate.py` exit 0; `pnpm build` exit 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 047 has not landed (names/paths mismatch).
- The helper lacks a needed `--repo` behaviour such that a product-repo session
  would file to the wrong repo (see Scope exception) — report, don't patch it
  silently.
- A routing spot-check shows the product-feedback negative case
  ("I don't like the empty state…") routing to `feedback` — tighten the
  description's NOT-clause and re-run; if it still misroutes after one
  iteration, report with transcripts.
- Any step would file a real issue — this plan never files; rehearsal only.

## Maintenance notes

- The skill deliberately restates NO label lists or marker strings — the doc and
  helper own them. A reviewer should reject any diff that copies those lists
  into the skill (that is the drift class plans 035/037 exist to kill).
- If the org later moves feedback to a GitHub *Project* board or another repo,
  the change is one constant in the helper + one line in the doc; the skill
  needs no edit — check that stays true in review.
- Follow-up candidate: a golden eval where feedback arrives mid-design-loop and
  the transcript must show capture → gate finished → confirm → dry-run/file
  ordering (the "hold, don't derail" behaviour is the hardest to keep honest).
