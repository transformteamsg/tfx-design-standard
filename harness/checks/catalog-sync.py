#!/usr/bin/env python3
"""catalog-sync.py — generate / verify the website mirror of the control catalog.

The harness catalog (standards/catalog.yaml) is the single source of truth. The
website serves a reduced mirror (content/standards/catalog.yaml in the site repo)
with the field mapping: title -> statement, category derived from the control-id
prefix via meta.categories, and only id/category/tier/check/statement/fails_when
kept. This script makes that mapping mechanical.

Usage:
  python3 checks/catalog-sync.py           # verify: exit 1 if the mirror drifted
  python3 checks/catalog-sync.py --write   # regenerate the mirror in place

If the site repo is not present (harness used standalone), the script reports
SKIP and exits 0.
"""

import json
import os
import sys

try:
    import yaml
except ImportError:
    print("ERROR catalog-sync.py: cannot import yaml — install pyyaml")
    sys.exit(1)

HARNESS_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_PATH = os.path.join(HARNESS_ROOT, "standards", "catalog.yaml")
MIRROR_PATH = os.path.normpath(
    os.path.join(HARNESS_ROOT, "..", "content", "standards", "catalog.yaml")
)

HEADER = """\
# TFX Design Standard — control catalog v{version}
# A control is one verifiable statement. If you can't check it, it's not a standard.
# Tiers: L0 = non-negotiable (no waiver) · L1 = mandatory (documented waiver) · L2 = recommended (inline rationale)
# Generated from harness/standards/catalog.yaml (the single source of truth) by
# harness/checks/catalog-sync.py --write; do not edit here.
"""


def q(s):
    """Double-quoted YAML scalar (JSON quoting is a YAML subset)."""
    return json.dumps(str(s), ensure_ascii=False)


def render(source):
    meta = source.get("meta", {})
    categories = meta.get("categories", {})
    lines = [HEADER.format(version=meta.get("version", "0.0"))]
    lines.append("meta:")
    lines.append(f'  version: {q(meta.get("version", ""))}')
    lines.append(f'  updated: {q(meta.get("updated", ""))}')
    lines.append(f"  waiver_syntax: {q(meta.get('waiver_syntax', ''))}")
    lines.append("")
    lines.append("controls:")
    for ctl in source.get("controls", []):
        prefix = str(ctl["id"]).split("-")[0]
        category = categories.get(prefix)
        if category is None:
            print(f"ERROR catalog-sync.py: no category mapping for prefix {prefix} "
                  f"({ctl['id']}) in meta.categories")
            sys.exit(1)
        lines.append(f"  - id: {ctl['id']}")
        lines.append(f"    category: {category}")
        lines.append(f"    tier: {ctl['tier']}")
        lines.append(f"    check: {ctl['check']}")
        lines.append(f"    statement: {q(ctl['title'])}")
        fails = ctl.get("fails_when") or []
        if fails:
            lines.append("    fails_when:")
            for item in fails:
                lines.append(f"      - {q(item)}")
    return "\n".join(lines) + "\n"


def main():
    with open(SOURCE_PATH) as fh:
        source = yaml.safe_load(fh)
    expected = render(source)
    # Sanity: the generated text must itself parse.
    yaml.safe_load(expected)

    if not os.path.isfile(MIRROR_PATH) and "--write" not in sys.argv:
        print(f"SKIP: site mirror not found at {MIRROR_PATH} (harness standalone?)")
        return 0

    if "--write" in sys.argv:
        with open(MIRROR_PATH, "w") as fh:
            fh.write(expected)
        print(f"OK: wrote {os.path.relpath(MIRROR_PATH)} "
              f"({len(source.get('controls', []))} controls)")
        return 0

    with open(MIRROR_PATH) as fh:
        actual = fh.read()
    if actual != expected:
        print("ERROR catalog-sync.py: site mirror has drifted from the harness "
              "catalog — run `python3 checks/catalog-sync.py --write` to regenerate")
        return 1
    print(f"OK: mirror in sync ({len(source.get('controls', []))} controls)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
