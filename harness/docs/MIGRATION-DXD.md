# Migrating to DXD (plugin rename, 0.8.0)

The standard's identity moves from **TFX** to **DXD** (Digital Products & Excellence
Division), which now spans Students, Parents, and Platform (EduPass) domain leads in
addition to Teacher & School. This is a rename of the harness's own identity — the
control catalog, control ids, and the TFX-DS normative source citation are unchanged.
"TFX" is retained only where it correctly names the Teacher & School domain or quotes
history (plans, changelog entries, decision records).

## What changed

- **Plugin id and marketplace name:** `tfx` → `dxd`. Display name "TFX Design Harness"
  → "DXD Design Harness".
- **Skill invocation prefix:** skill names come from the plugin id, so every skill
  command changes prefix — `/tfx:start` → `/dxd:start`, `/tfx:design` → `/dxd:design`,
  and so on for every installed skill. No skill was individually renamed; only the
  namespace changed.
- **Waiver syntax:** the new canonical form is `dxd-waive <ID> reason="<specific
  reason>"`.
- **Context dir:** `scripts/generate-design-json.py` now writes `.dxd/design.json`
  (previously `.tfx/design.json`).
- **Site identity:** the published site's masthead and page titles now read "DXD Design
  Standard" instead of "TFX Design Standard".

## What still works (compatibility guarantees)

- **Legacy `tfx-waive` markers remain valid.** `checks/waiver-reconcile.py`,
  `checks/token-audit.py`, and `checks/audit-record.py` all accept `tfx-waive` and
  `dxd-waive` interchangeably — nothing needs to be rewritten in existing source or
  decision records.
- **`.tfx/design.json` still works.** Readers (the `design` skill, the `evaluator`
  agent, `checks/detect.py`) resolve `.dxd/design.json` first, falling back to
  `.tfx/design.json` for repos that predate the rename. Only the *generator* writes
  exclusively to `.dxd/` going forward; run it once to migrate a repo's twin file to
  the new path.
- **The old marketplace path still resolves.** `/plugin marketplace add
  transformteamsg/tfx-design-standard` is unchanged for now (see the flagged step
  below) — only the plugin *name inside* that marketplace changed, from `tfx` to `dxd`.

## What an existing install must do

If you already have the `tfx@tfx` plugin installed in a product repo:

```
/plugin uninstall tfx          # or remove it via /plugin → Installed
/plugin marketplace update dxd  # if the marketplace entry itself needs refreshing,
                                 # re-add it: /plugin marketplace add transformteamsg/tfx-design-standard
/plugin install dxd@dxd
/reload-plugins                 # or restart Claude Code
```

Confirm with `/plugin list` — `dxd` should be present and enabled, `tfx` gone. Ask
Claude to "design a test page" — the `design` loop should still trigger under the new
namespace. Full update mechanics (auto-update, pinning to a release, verifying what
you're on) are unchanged in shape — see [UPDATING.md](UPDATING.md), which now reflects
`dxd` throughout its current (non-historical) instructions.

## Flagged human step: the GitHub repo has not been renamed

This migration does **not** rename the GitHub repository
(`transformteamsg/tfx-design-standard`). That is a deliberate human coordination step,
not something this change attempts:

- Renaming it to `transformteamsg/dxd-design-standard` is a repo-admin action.
- GitHub redirects the old clone/marketplace URL automatically after a rename, so
  existing `/plugin marketplace add transformteamsg/tfx-design-standard` invocations
  will keep working for a transition period — but doc snippets in this repo
  (`README.md`, `harness/README.md`, `harness/docs/ONBOARDING.md`,
  `harness/docs/UPDATING.md`) should be updated to the new path once the rename
  happens, so new installs don't depend on a redirect indefinitely.
- Until that rename happens, the marketplace source path stays
  `transformteamsg/tfx-design-standard` — only the plugin name inside it (`dxd`) has
  changed.
