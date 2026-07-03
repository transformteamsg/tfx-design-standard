# Hooks — run the detector automatically on UI-file edits

`design-hook.py` is a Claude Code **PostToolUse** hook. When an agent edits a UI file
it runs the curated design detector (`checks/detect.py`, plan 059) on just that file
and, only on **new** findings, feeds the agent one short reminder with a fix
direction. It stays silent on clean edits and non-UI files, and it **never blocks an
edit** — it reminds. This is the long-deferred "wire the checks as hooks" item
(open since plan 007), built curated, quiet, and consented (plan 060).

## What it runs

Only the detector's **curated profile** — `token-audit`, `contrast`, `a11y-static`,
and `type-scan`'s `TYP-1` rule (059's default). The hook passes **no** rule flags; it
inherits that default. The curated set is a low-false-positive **subset** of the
catalog, not the whole standard: a silent (clean) edit means *the built curated checks
found nothing*, never *this design is compliant*. Every reminder says so, per the
honest-enforcement rule in [`../checks/README.md`](../checks/README.md).

## The hook contract (schema)

Source: Claude Code hooks reference, <https://code.claude.com/docs/en/hooks>
(fetched 2026-07-03; `docs.claude.com/en/docs/claude-code/hooks` 301-redirects there).

- **Event payload (stdin JSON).** PostToolUse delivers `hook_event_name`, `tool_name`
  (`Edit` / `Write` / `MultiEdit`), `tool_input` (carries `file_path`), `tool_response`,
  plus `session_id`, `prompt_id`, `transcript_path`, `cwd`, `permission_mode`, `effort`.
  The hook reads `tool_input.file_path`.
- **Returning text to the agent.** Two documented mechanisms: exit 0 with JSON on
  stdout carrying `hookSpecificOutput.additionalContext` (Claude Code wraps it in a
  system reminder and injects it into the agent's context), or exit 2 with the message
  on stderr. **We use `additionalContext` on exit 0** — the recommended path for
  feeding context back. The hook therefore **always exits 0**; the reminder rides in
  the JSON, `suppressOutput: true` keeps the raw JSON out of the transcript UI.
- **Cannot block.** PostToolUse fires *after* the tool ran; per the docs it "cannot
  block". This matches the plan exactly — the hook reminds, it never rejects an edit.

## Consent mechanism — settings snippet, not a plugin default

We deliberately do **not** ship this hook in the plugin's `hooks/hooks.json`. The docs
are explicit: plugin-provided hooks have **"No opt-in per hook … They run whenever the
plugin is active"**, and the only off switch is the global `disableAllHooks` (which
kills *every* hook). A plugin-shipped hook therefore **cannot default OFF / be
per-developer consented**, which plan 060 requires. So the hook takes the documented
fallback: a **paste-in `settings.json` snippet** — installing it is an explicit choice
(consent by construction), and it is off until a developer adds it.

Add this to `.claude/settings.json` (shared) or `.claude/settings.local.json`
(personal, gitignored) in the product repo:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          { "type": "command", "command": "python3 \"<HARNESS>/hooks/design-hook.py\"" }
        ]
      }
    ]
  }
}
```

Resolve `<HARNESS>` to wherever the harness lives on your machine:

- **Developing the harness itself** (this repo): `harness` — i.e.
  `python3 "harness/hooks/design-hook.py"` (Claude Code runs hooks from the repo root).
- **Harness installed as the `tfx` plugin**: the plugin root is the harness dir, so
  `${CLAUDE_PLUGIN_ROOT}/hooks/design-hook.py`. (If your Claude Code build does not
  expand `${CLAUDE_PLUGIN_ROOT}` inside a hand-written `settings.json` command, use the
  absolute install path instead.)

`design-hook.py` finds `detect.py` relative to itself (`../checks/detect.py`), so no
extra path config is needed.

## Behaviour

- **File filter first.** Only UI extensions run the detector: `.tsx .jsx .css .html
  .vue .svelte`. Everything else exits 0 immediately (this fires on every edit — no
  work on a miss).
- **On findings** (`detect` exit 2): one reminder — finding count, the top new finding
  (control id + `file:line` + the detector's own fix direction), and
  `python3 checks/detect.py <file>` for the full list.
- **On a clean edit** (`detect` exit 0): silent.
- **On a detector failure** (`detect` exit 1, timeout, or unparseable output): one
  honest one-line notice that nothing was verified — never a fake pass.
- **New-findings memory.** A per-file fingerprint list in the hook's own cache dir
  (`$XDG_CACHE_HOME/tfx-design-hook/state.json`, or `~/.cache/…`) — **not** the target
  repo, so nothing is ever committed. A finding already announced for a file is not
  re-announced on a later edit; it re-announces only when its flagged **line content**
  changes (the fingerprint is keyed on the control + source-line text, so an unrelated
  edit that merely shifts line numbers stays quiet).

## Disable

- **Kill switch (per session / one-off):** set `TFX_HOOK_DISABLED=1` → the hook exits 0
  silently.
- **Turn it off:** remove the snippet from `settings.json`.
- **All hooks off:** set `"disableAllHooks": true` in settings.

## Test

```
python3 hooks/design-hook.py --self-test    # → SELF-TEST OK (25 cases), exit 0
```

Simulate a real event (the manual-invocation path):

```
echo '{"hook_event_name":"PostToolUse","tool_name":"Edit","tool_input":{"file_path":"some.tsx"}}' \
  | python3 hooks/design-hook.py
```

Reminder JSON on findings; nothing on a clean file or a non-UI file. The self-test is
pure (it injects a fake detector), so it needs no real check subprocess.
