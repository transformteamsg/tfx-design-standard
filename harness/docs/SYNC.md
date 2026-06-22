# Fragment sync — `tfx-sync` markers + parity checks

A few facts are restated as prose in more than one file because each copy must ship in
its own context. This doc records how those copies stay in agreement, so a future
restatement registers itself with the check instead of free-floating.

## The model

- **Harness = source.** `standards/catalog.yaml` and `standards/controls/*.md` are the
  single source of truth for controls, tiers, and the SLP-9 word lists.
- **Website = publisher.** The TFX-DS site reads the harness files through, it does not
  copy them — see `lib/catalog.ts` (reads the catalog) and `lib/llms.ts` (serves
  `slp-9.md` raw to `/llms-full.txt`). Whole-file duplication is always a read-through,
  never a copy.
- **`validate.py` = the guarantee.** `python3 checks/validate.py` compares each marked
  restatement against its source and fails (exit 1) on drift. Runs on every catalog
  change and at the site's prebuild.

## The rule — when to read through, when to mark

- **A whole file** that another surface needs → **read it through** (the website pattern
  above). No marker, no copy.
- **A fragment inside a larger file** that must ship in two contexts (the plugin
  `SKILL.md` + the project-root `CLAUDE.md`; or a skill summary + the canonical control)
  → wrap it in `<!-- tfx-sync:NAME -->` markers and add a parity check in `validate.py`.
- **Never a git symlink.** A symlink syncs whole files, not a list-inside-CLAUDE.md
  fragment; and it would either dangle (the plugin ships without the website's tree) or
  invert the plugin → project dependency. The marker + check is the only mechanism.

## The marker grammar

```
<!-- tfx-sync:NAME [source][ key=val] --> … <!-- /tfx-sync:NAME -->
```

- HTML comments — invisible in rendered Markdown, harmless in the plugin and in
  `/llms-full.txt` (which serves `slp-9.md` raw). They change no visible text.
- `source` (bare or `key=val`) marks the block that **is** the source; consumer blocks
  carry the bare `NAME`. Both open the same `NAME`.
- The close marker is always bare: `<!-- /tfx-sync:NAME -->`.
- A block may be inline (open and close on the same logical line, as in `slp-9.md` and
  the `tfx-content-style` summary) or own its lines (as in the two L0 lists).

## Registered blocks

| `NAME` | Source | Consumers | Check | Rule |
|---|---|---|---|---|
| `L0` | catalog `tier: L0` set | `CLAUDE.md`, `.claude/skills/tfx-design-ui/SKILL.md` | `[L0-SYNC]` | inline ID set **==** catalog L0 set |
| `slp9-buzzwords` | `standards/controls/slp-9.md` (marked `source`) | `.claude/skills/tfx-content-style/SKILL.md` | `[SLP9-SYNC]` | consumer ⊆ source (skill may show fewer, never more) |

### Normalization

- **L0**: control IDs are matched as a set via the catalog's ID regex, so order and the
  surrounding prose are free; only the set of IDs inside the span must equal the catalog's
  `tier: L0` set.
- **slp9-buzzwords**: tokens are lowercased, split on commas/whitespace/bullets, and a
  trailing parenthetical inflection is stripped (`streamline(d)` → `streamline`,
  `effortless(ly)` → `effortless`). There is **no** morphological stemming — the source and
  the summary already align on the paren-stripped token. Connector/noise words (`and`,
  `kin`, …) are dropped.
- **Required core** (`REQUIRED_CORE = {streamline, empower, supercharge}`) is a stable
  floor that must appear in **both** lists. It is **hard-coded in `validate.py`, not synced
  from `slp-9.md`**, so the check keeps an anchor even if both lists are edited. If the
  canonical `slp-9.md` list ever drops one of these three, update `REQUIRED_CORE` to match.

## Adding a new restated fragment

1. Wrap the restatement in `<!-- tfx-sync:NEWNAME -->` … `<!-- /tfx-sync:NEWNAME -->`,
   and mark the canonical copy `source`.
2. Add a `<newname>_parity_errors(...)` helper in `checks/validate.py` (reuse
   `extract_sync_block`; compare against the source with a set comparison), call it from
   `collect_errors`, and add `run_self_test` cases.
3. Register the block in the table above.

The pattern is always: the extractor + a set comparison. If a control or list ever
genuinely changes, the parity check fails loudly until every marked copy is updated —
that is the design working, not a bug.
