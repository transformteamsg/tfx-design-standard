# Plan 015: Sweep stale skill names, the dead docs link, and wrong counts out of the repo's own instructions

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT update `plans/README.md` — the reviewer
> maintains the index.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- README.md CLAUDE.md content/guidelines/voice-tone.mdx content/harness/skills.mdx harness/docs/index.html public/harness-onboarding.html`
> On any change, compare the "Current state" excerpts; on a mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs (user-breaking staleness)
- **Planned at**: commit `233f3be`, 2026-07-11

## Why this matters

The harness's skills were renamed (`tfx-content-style` → `copy`,
onboarding → `setup`/`start`), but the repo's own instructions still point at
the dead names. A new team member follows README and types `/tfx:onboard` —
no such command. An agent follows CLAUDE.md and tries to load `tfx:content` —
skill-not-found, so the SLP-9 canonical-list carrier silently never loads. The
harness doc hub links a `SKILL.md` path that 404s, its hero pills contradict
its own body text ("4 skills + 1 agent" vs "eleven skills"; "2 checks built"
vs "ten check scripts built"), and the published onboarding page claims 53
controls against a catalog of 60.

Ground truth at `233f3be` (verify yourself in step 0):
- `harness/.claude/skills/` contains exactly: `copy critique design feedback
  flow layout motion polish setup standards start` (11 skills). No `content`,
  no `onboard`.
- `harness/checks/` contains `validate.py` + 10 check scripts (11 `.py` files).
- `python3 harness/checks/validate.py` reports 60 controls.
- The agent is `evaluator` (`harness/.claude/agents/evaluator.md`).
- The guided tour is `/tfx:start` (orient/route) with `/tfx:setup` for machine
  setup — see `harness/.claude/skills/start/SKILL.md` and `setup/SKILL.md`.

## Current state

1. `README.md:11-14`:

```
The harness installs as a [Claude Code](https://code.claude.com/docs) plugin: four
skills (`tfx:design` the loop, `tfx:standards` catalog mechanics, `tfx:content`
voice & tone, and `tfx:onboard` a guided tour), the `tfx:evaluator`
agent (which carries its own review procedure), and the control catalog. It ships
```

and `README.md:28-30`:

```
Confirm it loaded with `/plugin` (look for `tfx`, enabled). New to it?
Run `/tfx:onboard` (or just say "onboard me") for a guided tour — then ask Claude
to design or change a page and the `tfx:design` loop takes over, enforcing the catalog
```

2. `CLAUDE.md:17`:

```
- When editing prose in `content/`, apply SLP-9 (AI-writing tells) — canonical lists and calibration in `harness/standards/controls/slp-9.md`, carried by the tfx:content skill.
```

3. `content/guidelines/voice-tone.mdx:7` (status: settled) — mid-paragraph:
"…this page and the `tfx:content` skill both apply them…"

4. `content/harness/skills.mdx:12` (status: proposed) — table row:

```
| `content` (formerly `tfx-content-style`) | Exists | Applies voice & tone, naming, and the AI-writing tells (SLP-9) at generation time, so copy arrives on-voice by default |
```

5. `harness/docs/index.html`:
   - line 327: `<span class="pill">4 skills + 1 agent</span>`
   - line 328: `<span class="pill">2 checks built</span>`
   - line 525-526 (the content-skill section):
     `<h3 id="content">content …` with
     `<a href="../.claude/skills/content/SKILL.md">.claude/skills/content/SKILL.md</a>`
     (dead — the directory is `copy/`)
   - Body text at lines 355 and 377 says "eleven skills" (correct — keep).
   - Line 645 says "catalog validator + ten check scripts built" (correct — keep).

6. `public/harness-onboarding.html:150`:

```html
      <span class="chip"><b>53</b> controls</span>
```

Copy conventions (repo CLAUDE.md): second person, active voice, sentence case,
plain language; apply SLP-9 (no AI-writing tells) to any prose you write —
canonical lists in `harness/standards/controls/slp-9.md`. Singapore English
spelling (harness/CLAUDE.md).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Stale-name grep | `grep -rn "tfx:content\|tfx:onboard\|skills/content/" README.md CLAUDE.md content/ harness/docs/index.html` | no matches (after) |
| Count check | `grep -n "53" public/harness-onboarding.html` | no `53 controls` chip (after) |
| Content lint | `python3 harness/checks/content-lint.py README.md CLAUDE.md content/guidelines/voice-tone.mdx content/harness/skills.mdx` | exit 0 (no new findings introduced) |
| Validator (COUNT-SYNC) | `python3 harness/checks/validate.py` | `OK: 60 controls valid…` |
| Build | `pnpm build` | exit 0 |

## Scope

**In scope**:
- `README.md` (the two excerpted regions only)
- `CLAUDE.md` (line 17 only)
- `content/guidelines/voice-tone.mdx` (the one skill mention only)
- `content/harness/skills.mdx` (the `content` table row only)
- `harness/docs/index.html` (pills 327–328, the content-section heading/link/id, any other `skills/content/` hrefs)
- `public/harness-onboarding.html` (the `53` chip only)

**Out of scope**:
- Rewriting the skills.mdx roster to list all 11 skills — the DXD integration
  branch (`advisor/006-onboarding-page` @ `e22f299`) already rewrites that
  page wholesale; a minimal correction here avoids a worse merge conflict.
- Renaming `tfx-waive` syntax, `/tfx:` command prefixes generally, or anything
  covered by the DXD rename program (plans 001–007) — only the four dead
  names/links/counts above.
- `harness/docs/UPDATING.md` historical sections (old names there are history,
  kept on purpose).
- `harness/CLAUDE.md` (already names `copy` correctly).

## Git workflow

- Branch: `advisor/015-stale-names-and-counts-sweep` from `233f3be`
- Commit style: `docs: point instructions at the real skill names, fix drifted counts and the dead skills link`
- Do NOT push or open a PR.

## Steps

### Step 0: Confirm ground truth

**Verify**: `ls harness/.claude/skills/ | tr '\n' ' '` → the 11 names listed
above; `ls harness/checks/*.py | wc -l` → 11.

### Step 1: README.md

Rewrite lines 11–14 to reflect reality: eleven skills — name the load-bearing
ones (`tfx:design` the loop, `tfx:standards` catalog mechanics, `tfx:copy`
voice & tone, `tfx:start` orientation) rather than enumerating all eleven —
plus the `evaluator` agent and the catalog. Rewrite line 29 to
`Run /tfx:start (or just say "onboard me") for a guided orientation`.

**Verify**: `grep -n "tfx:content\|tfx:onboard" README.md` → no matches.

### Step 2: CLAUDE.md

Line 17: change `the tfx:content skill` → `the tfx:copy skill`.

**Verify**: `grep -n "tfx:content" CLAUDE.md` → no matches.

### Step 3: voice-tone.mdx

Change `` the `tfx:content` skill `` → `` the `tfx:copy` skill `` (one
occurrence, keep the sentence otherwise intact — it is a settled page).

**Verify**: `grep -n "tfx:content" content/guidelines/voice-tone.mdx` → no matches.

### Step 4: skills.mdx

Change the row's skill name to `` `copy` (formerly `tfx-content-style`) `` —
keep the Status and description cells as they are.

**Verify**: `grep -n "\`content\`" content/harness/skills.mdx` → no matches.

### Step 5: harness/docs/index.html

- Pill line 327: `4 skills + 1 agent` → `11 skills + 1 agent`.
- Pill line 328: `2 checks built` → `10 check scripts + validator`.
- The content-skill section: heading text/id and meta-line link `content` →
  `copy`, href → `../.claude/skills/copy/SKILL.md`. Also update any in-page
  anchors (`href="#content"`) to `#copy` — grep the file.

**Verify**: `grep -n "skills/content/\|#content\"\|4 skills\|2 checks" harness/docs/index.html` → no matches; `grep -c "skills/copy/SKILL.md" harness/docs/index.html` → ≥ 1.

### Step 6: public/harness-onboarding.html

`<b>53</b> controls` → `<b>60</b> controls`.

**Verify**: `grep -n "53" public/harness-onboarding.html` → no `controls` chip match.

### Step 7: Full gates

**Verify**: `python3 harness/checks/validate.py` → OK (COUNT-SYNC still
passes); `python3 harness/checks/content-lint.py README.md CLAUDE.md content/guidelines/voice-tone.mdx content/harness/skills.mdx` → no NEW findings versus the same command on the base commit (run before/after and diff);
`pnpm build` → exit 0.

## Test plan

No unit tests — prose/docs change verified by the greps and gates above.

## Done criteria

- [ ] The stale-name grep (Commands table) returns nothing
- [ ] index.html pills match its own body text (11 skills, validator + 10 checks)
- [ ] Onboarding chip says 60
- [ ] `pnpm build` and `python3 harness/checks/validate.py` exit 0
- [ ] Only the six in-scope files modified (`git status`)

## STOP conditions

- Any excerpt no longer matches (drift — especially likely if the DXD branch
  was merged; if `README.md` already says `dxd:` names, this plan is
  superseded — report, don't edit).
- Fixing the counts requires touching validate.py's COUNT-SYNC regex — out of
  scope; report instead.

## Maintenance notes

- The DXD integration branch (`advisor/006-onboarding-page` @ `e22f299`)
  rewrites README/skills pages with `dxd:` names. Whichever lands second must
  re-run this plan's stale-name grep — trivially, after any merge:
  `grep -rn "tfx:content\|tfx:onboard\|skills/content/" README.md CLAUDE.md content/ harness/docs/`.
- The onboarding page's control count will drift again on the next ratchet:
  COUNT-SYNC cannot see `<b>60</b> controls` (markup splits digit from word)
  and doesn't scan `public/`. Extending COUNT-SYNC there is a validate.py
  follow-up, deliberately not in this plan.
