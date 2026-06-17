# Updating the TFX Design Harness plugin

Consumer guide for product teams (Teacher Workspace, CaseSync, Glow) keeping the
installed harness plugin up to date.

- **Plugin:** `tfx-design-harness`
- **Marketplace:** `tfx`
- **Source:** `github.com/transformteamsg/tfx-design-standard` (the marketplace tracks the `main` branch)

## First-time install

Skip this if the plugin is already installed.

```
/plugin marketplace add transformteamsg/tfx-design-standard
/plugin install tfx-design-harness@tfx
```

This installs the five skills (`tfx-design-ui`, `tfx-design-standards`,
`tfx-content-style`, `tfx-design-review`, `tfx-design-onboarding`), the
`tfx-design-evaluator` subagent, and the control catalog — the catalog ships with the
plugin, not with your repo.

## Update to the latest

```
/plugin marketplace update tfx     # pull the latest marketplace.json + plugin from main
/reload-plugins                    # activate the new skills/agents/catalog in this session
```

Restarting Claude Code does the same as `/reload-plugins`. Confirm the result:

```
/plugin list                       # tfx-design-harness should be present and enabled
```

Quick check: ask "design a test page" — the `tfx-design-ui` loop should trigger and
ask its intent questions.

## How updates work here

- **Updates are manual.** Third-party marketplaces have auto-update off by default, so
  a new release arrives only when you run `/plugin marketplace update tfx`. To make it
  automatic, add `autoUpdate` for the `tfx` marketplace in `.claude/settings.json`:

  ```json
  {
    "extraKnownMarketplaces": {
      "tfx": {
        "source": { "source": "github", "repo": "transformteamsg/tfx-design-standard" },
        "autoUpdate": true
      }
    }
  }
  ```

  or open `/plugin`, go to the Marketplaces tab, and enable auto-update for `tfx`.

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
  including `LAY-2` and `LAY-4`; ask the `tfx-design-standards` skill to list the LAY
  controls, or open the catalog page on the TFX-DS website.
