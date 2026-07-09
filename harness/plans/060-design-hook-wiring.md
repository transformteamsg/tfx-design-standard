# Plan 060: Design hook — run the detector automatically when the agent edits UI files (curated, quiet, consented)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> any STOP condition occurs, stop and report. When done, update the 060 row
> in `harness/plans/README.md` — unless a reviewer told you they maintain it.
>
> **Drift check (run first)**, from repo root:
> `git diff --stat 61104e0..HEAD -- harness/checks/detect.py harness/hooks harness/docs/ONBOARDING.md`
> This plan HARD-depends on 059's detect.py (exit contract 0/2/1, curated
> profile, `--json`). 059 HAS landed (main @ 61104e0); reviewer confirmed the
> `--json` shape before dispatch: `{findings:[{check,control,file,line,message}],
> counts, profile, exit}`, exit 2 on findings, TOK-1 caught on raw hex. Only
> NEW drift since 61104e0 is a STOP.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: MED (every-edit automation; noise erodes trust — the mitigations ARE the plan)
- **Depends on**: 059 (hard)
- **Category**: dx
- **Planned at**: commit `48d13dd`, 2026-07-03 (re-stamp against post-059 HEAD before executing)

## Why this matters

"V1 will wire the check scripts as hooks" has been deferred since plan 007 —
the longest-standing open promise in the harness. Impeccable's hook pattern
proves the shape: run the detector automatically when an AI tool edits UI
files, and on findings "send the agent a short reminder with the finding and
a fix direction"; stay silent on clean edits and non-UI files.

Decisions (grilling 2026-07-03): the hook runs ONLY the curated quiet
profile (059's default — token-audit, contrast, a11y-static, TYP-1); it is
quiet by default (one short message per edit, only on NEW findings); and it
is per-developer consented (installed by choice, off by default in the
plugin).

## Current state

- Claude Code hooks are configured in a repo's `.claude/settings.json`
  (`PostToolUse` matcher on Edit/Write) or shipped via a plugin's
  `hooks/hooks.json`. Consult the claude-code hooks documentation for the
  exact current schema before writing it (`claude --help` / docs) — do not
  write the config from memory.
- `harness/hooks/` does not exist. The plugin manifest is
  `harness/.claude-plugin/plugin.json` (0.4.0).
- 059 provides: `python3 <harness>/checks/detect.py --json <files>` with
  exit 0/2/1 and per-finding control ids.
- `harness/checks/README.md` honest-enforcement rule binds hook messaging:
  the hook covers only the curated subset — it must never imply a clean edit
  passed *all* controls.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Hook script self-test | `cd harness && python3 hooks/design-hook.py --self-test` | exit 0 |
| Manual invocation (simulating a hook event) | `echo '<hook-event-json>' \| python3 harness/hooks/design-hook.py` | reminder text on findings; silent + exit 0 on clean |
| Detector (dependency) | `python3 harness/checks/detect.py --json <file>` | 0/2/1 |

## Scope

**In scope**:
- `harness/hooks/design-hook.py` (create) + `harness/hooks/README.md` (create: what it runs, consent, how to enable/disable)
- Plugin hook manifest IF plugin-shipped hooks are supported and can default OFF; otherwise a documented snippet product repos paste into `.claude/settings.json` (consent by construction)
- `harness/docs/ONBOARDING.md` (optional checklist line: enabling the hook)
- `harness/checks/README.md` (one line: the hook exists, what subset it runs)
- `harness/plans/README.md` (row)

**Out of scope**:
- detect.py's profiles/rules (059 owns them; the hook passes NO rule flags —
  it inherits the curated default).
- Any always-blocking behaviour: the hook REMINDS; it never rejects an edit.
- Skills, catalog, website.

## Git workflow

Branch `advisor/060-design-hook`; commit
`feat(harness): design hook — detector on UI-file edits, curated + quiet + consented (plan 060)`.

## Steps

### Step 1: Confirm the hook contract

Read the current Claude Code hooks schema (PostToolUse event payload, how a
hook returns text to the agent, plugin-shipped vs settings.json). Record
what you found in `hooks/README.md`. If plugin-shipped hooks cannot default
to OFF/consented, choose the settings-snippet route and say so.

**Verify**: README states the chosen mechanism with the schema source cited.

### Step 2: Build `design-hook.py`

Stdlib-only. Behaviour:
- Reads the hook event from stdin; extracts edited file path(s).
- **File filter first**: only UI extensions (`.tsx .jsx .css .html .vue
  .svelte`); everything else → exit 0 silently, fast (this runs on every
  edit — no work on misses).
- Runs `detect.py --json` on just the edited file(s). Exit 2 → emit ONE
  short reminder: finding count, top finding (control id + file:line + one
  fix direction), and "run `python3 checks/detect.py <file>` for the full
  list". Exit 0 → silent. Exit 1 (detector broken) → one-line honest notice,
  never fake a pass.
- **New-findings memory**: keep a tiny state file under `.tfx/` (or the
  hook's own cache dir) so an unchanged finding isn't re-announced on every
  subsequent edit to the same file; a finding re-announces when its line
  content changes.
- Env kill-switch (`TFX_HOOK_DISABLED=1` → exit 0) mirroring impeccable's.
- `--self-test` ≥ 6 cases: non-UI file silence, clean UI file silence,
  finding → reminder shape, detector-crash honesty, kill-switch, repeat-edit
  suppression.

**Verify**: `python3 harness/hooks/design-hook.py --self-test` → exit 0.

### Step 3: Ship the consent path + docs

Wire the chosen mechanism from Step 1 (plugin manifest default-off, or the
paste-in snippet in `hooks/README.md` + ONBOARDING line). One line in
`checks/README.md`. Live smoke test: in this repo, enable it, edit a
scratch `.tsx` file containing a raw hex → the reminder fires; remove the
hex → silent; then disable and delete the scratch file.

**Verify**: the smoke test transcript (both directions) recorded in your report; `git status` shows no scratch remnants.

### Step 4: Gates

`python3 checks/validate.py` OK; `claude plugin validate harness` exit 0 (no
new warnings); `git status` in-scope only; index row.

## Test plan

Hook self-test (≥ 6) + the live smoke test in Step 3 (fire + silence + kill-switch).

## Done criteria

- [ ] `design-hook.py --self-test` exit 0
- [ ] Live smoke test: raw-hex edit → one reminder naming TOK-1; clean edit → silence
- [ ] Repeat edit of unchanged finding → no re-announcement (self-test case)
- [ ] Consent path documented and default-off
- [ ] Honest messaging: no wording implies full-catalog compliance
- [ ] validate + plugin validate green; `git status` in-scope only; index row updated

## STOP conditions

- 059 not landed, or its exit/json contract differs from this plan's assumptions.
- The current Claude Code hooks schema doesn't support returning reminder
  text to the agent from PostToolUse — report what it does support instead.
- Anything pushes toward blocking edits rather than reminding.

## Maintenance notes

- The hook inherits 059's curated profile by design — widening the hook =
  widening the profile (design-lead decision), never a hook-side flag.
- If the hook proves valuable, the same script is the natural CI entry
  (`detect.py` exit 2 failing a PR) — deliberately not wired here.
- Watch trust: if users start disabling it, treat that as harness feedback
  (the `feedback` skill) — noise data should drive the profile, per the
  eval-ratchet principle.
