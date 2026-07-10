# Updating the DXD Design Harness plugin

Consumer guide for product teams (Teacher Workspace, CaseSync, Glow) keeping the
installed harness plugin up to date.

- **Plugin:** `dxd`
- **Marketplace:** `dxd`
- **Source:** `github.com/transformteamsg/tfx-design-standard` (the marketplace tracks
  the `main` branch; the repo itself has not yet been renamed — see
  [MIGRATION-DXD.md](MIGRATION-DXD.md))

## First-time install

Skip this if the plugin is already installed.

```
/plugin marketplace add transformteamsg/tfx-design-standard
/plugin install dxd@dxd
```

If you have an existing `tfx@tfx` install, see
[MIGRATION-DXD.md](MIGRATION-DXD.md) for the uninstall/reinstall steps.

This installs the eleven skills (`start`, `setup`, `design`, `critique`,
`standards`, `feedback`, and the five focused passes — `copy`, `polish`,
`motion`, `flow`, `layout`), the
`evaluator` subagent (which carries its own review procedure), and the
control catalog — the catalog ships with the plugin, not with your repo.

## Update to the latest

```
/plugin marketplace update dxd     # pull the latest marketplace.json + plugin from main
/reload-plugins                    # activate the new skills/agents/catalog in this session
```

Restarting Claude Code does the same as `/reload-plugins`. Confirm the result:

```
/plugin list                       # dxd should be present and enabled
```

Quick check: ask "design a test page" — the `design` loop should trigger and
ask its intent questions.

## How updates work here

- **Updates are manual.** Third-party marketplaces have auto-update off by default, so
  a new release arrives only when you run `/plugin marketplace update dxd`. To make it
  automatic, add `autoUpdate` for the `dxd` marketplace in `.claude/settings.json`:

  ```json
  {
    "extraKnownMarketplaces": {
      "dxd": {
        "source": { "source": "github", "repo": "transformteamsg/tfx-design-standard" },
        "autoUpdate": true
      }
    }
  }
  ```

  or open `/plugin`, go to the Marketplaces tab, and enable auto-update for `dxd`.

- **The marketplace tracks `main`.** A marketplace update pulls whatever `main` holds
  now. To pin to a tagged release instead, add the marketplace with a ref —
  `/plugin marketplace add https://github.com/transformteamsg/tfx-design-standard.git#v0.1.1`
  — but moving to a later release then means re-adding with the new tag. Tracking
  `main` is simpler for a small team.

- **Claude Code does not show the plugin `version` in its UI.** It tracks updates at
  the marketplace level and pulls the latest from the tracked ref. The `version` in
  `.claude-plugin/plugin.json` and the entries in [CHANGELOG.md](../CHANGELOG.md) are
  the human-readable record of what each release changed.

- **The catalog ships with the plugin**, not your repo. After updating, new and
  reworded controls are live for every product repo automatically — there is no
  per-repo catalog copy to maintain.

## After updating

Run `/reload-plugins` (or restart Claude Code) so the new skills, agents, and updated
catalog take effect in the current session. Newly loaded components announce themselves
on the next request, which has a small one-time token cost.

## Verify what you are on

There is no in-app version readout, so to confirm a release landed:

- Check `harness/CHANGELOG.md` in the source repo for the latest version and its notes.
- Spot-check a known change — for example, after 0.1.1 the catalog carries 40 controls
  including `LAY-2` and `LAY-4`; ask the `standards` skill to list the LAY
  controls, or open the catalog page on the TFX-DS website.

## Migrating from 0.5.x (focused passes + content→copy, 0.6.0)

0.6.0 adds five model-invoked focused passes and dissolves `content` into `copy`. The
plugin and its skills path are unchanged (directory-scanned), so this is **not** a
reinstall — a plain marketplace update picks it up:

```
/plugin marketplace update tfx     # pull the latest plugin from main
/reload-plugins                    # load the five passes; drop content
```

**What changed:**

- **Five focused passes** — each improves one named dimension of an existing page:
  `copy` (wording, tone, naming), `polish` (spacing, type, colour), `motion`
  (transitions, easing), `flow` (the multi-step journey), `layout` (structure, density,
  alignment). Say "polish the motion on `<page>`" or "tighten the layout"; each captures,
  proposes ranked fixes, gates, and verifies. A whole-page "improve this" with no
  dimension named stays with `critique`; a named structural change stays with `design`.
- **`content` renamed to `copy`.** The folder moved (`.claude/skills/content/` →
  `.claude/skills/copy/`); its full voice/tone/naming/SLP-9 body is unchanged. `copy`
  keeps every content trigger ("rewrite this error message", "is this on-voice?") and
  adds the improve-the-copy pass. No reinstall — the skills directory is scanned.

**What does not change:** the control catalog, `tfx-waive` syntax, `tfx-sync` markers,
control ids, and the `start`, `setup`, `design`, `critique`, `standards`, `feedback`,
and `evaluator` names. Historical documents that reference `content` by name stay valid
as history.

## Migrating from 0.4.x (skill-stack restructure, 0.5.0)

0.5.0 reshapes the skill stack from domain-named to intent-shaped. The plugin and its
skills path are unchanged (`"skills": "./.claude/skills/"`, directory-scanned), so this
is **not** a reinstall like 0.3.0 was — a plain marketplace update picks it up:

```
/plugin marketplace update tfx     # pull the latest plugin from main
/reload-plugins                    # load start, setup, critique; drop onboard
```

**What changed:**

- **New `start` skill** — user-invoked only (`/tfx:start`). It orients you, checks your
  machine/repo, and routes you to the right skill. It is the new front door; nothing
  triggers it automatically.
- **`onboard` renamed to `setup`.** The folder moved (`.claude/skills/onboard/` →
  `.claude/skills/setup/`); the setup checklist inside it is unchanged. `setup` still
  answers "set up the harness" and "onboard me", and can now also seed a product's
  `DESIGN.md` context layer. **The `/tfx:onboard` command name is gone** — use
  `/tfx:start` to orient, or just ask to be set up and `setup` triggers.
- **New `critique` skill** — takes "review / improve / polish / audit / I don't like it"
  asks for an existing page (no specific change named); `design` keeps named changes and
  new pages.
- **`standards` slimmed** to a rulebook shell that points at `standards/README.md`; its
  behaviour is unchanged (still the place for waiver and applicability questions).

**What does not change:** the control catalog, `tfx-waive` syntax, `tfx-sync` markers,
control ids, and the `content`, `feedback`, and `evaluator` names. Decision records and
other historical documents that reference `onboard` by name stay valid as history — they
describe what ran at the time, and rewriting them would falsify the record.

## Migrating from 0.2.x (plugin and skill rename, 0.3.0)

0.3.0 renamed the plugin `tfx-design-harness` → `tfx` and every skill to a single
distinguishing token (`tfx-design-ui` → `design`, `tfx-design-standards` →
`standards`, `tfx-content-style` → `content`, `tfx-design-onboarding` → `onboard`;
the evaluator agent `tfx-design-evaluator` → `evaluator`). Installed, these read
`tfx:design`, `tfx:standards`, `tfx:content`, `tfx:onboard`, and `tfx:evaluator`.

**0.2.x and 0.3.0 cannot coexist under different plugin names** — a plain
`/plugin marketplace update` will not move you across this rename, because the old
install is a separate plugin (`tfx-design-harness`) from the new one (`tfx`). You
must reinstall:

```
/plugin uninstall tfx-design-harness   # or remove it via /plugin
/plugin marketplace update tfx         # pull the latest marketplace.json
/plugin install tfx@tfx
```

Then restart Claude Code, or run `/reload-plugins`, so the renamed skills and agent
load under their new names.

**What does not change:** the control catalog, waiver syntax (`tfx-waive`), the
`tfx-sync` markers, and control ids are unaffected — this rename touches only the
plugin name and the skill/agent names. **What does not get rewritten:** decision
records and other historical documents in your product repo that reference the old
skill names (`tfx-design-ui`, `tfx-content-style`, and so on) stay valid as history —
they describe what ran at the time, and rewriting them would falsify the record.
