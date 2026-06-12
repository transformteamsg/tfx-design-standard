#!/usr/bin/env python3
"""
Catalog validator — checks/validate.py
Validates standards/catalog.yaml for internal consistency:
  1. YAML parses; top-level 'controls' is a non-empty list.
  2. Required fields present per control; allowed values enforced.
  3. Tier → waiver pairing: L0→none, L1→documented, L2→rationale.
  4. Control ID uniqueness and shape.
  5. Every detail: path exists relative to standards/; judgment/hybrid
     controls must carry one. meta.categories covers every ID prefix.
  6. Reverse check: every standards/controls/*.md frontmatter matches catalog.
  7. Cross-reference sweep: every control ID mentioned in prose exists in catalog.
Exit 0 and print "OK: <n> controls valid" on success.
Exit 1 and print "ERROR <location>: <message>" lines on failure.
"""

import json
import os
import re
import sys

try:
    import yaml
except ImportError:
    print("ERROR validate.py: cannot import yaml — install pyyaml")
    sys.exit(1)

# ── Path setup ─────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG_PATH = os.path.join(REPO_ROOT, "standards", "catalog.yaml")
CONTROLS_DIR = os.path.join(REPO_ROOT, "standards", "controls")

CROSS_REF_FILES = [
    os.path.join(REPO_ROOT, "CLAUDE.md"),
    os.path.join(REPO_ROOT, "README.md"),
    os.path.join(REPO_ROOT, "checks", "README.md"),
    os.path.join(REPO_ROOT, "docs", "decisions", "TEMPLATE.md"),
]
# Glob .claude/skills/*/SKILL.md, .claude/agents/*.md, and
# docs/catalog-changes/*.md at runtime
SKILLS_DIR = os.path.join(REPO_ROOT, ".claude", "skills")
AGENTS_DIR = os.path.join(REPO_ROOT, ".claude", "agents")
CATALOG_CHANGES_DIR = os.path.join(REPO_ROOT, "docs", "catalog-changes")

# ── Allowed values — from standards/schema.json, shared with the website's
# build guard (scripts/check-standards.mjs); edit the schema, not this file. ──
with open(os.path.join(REPO_ROOT, "standards", "schema.json")) as fh:
    SCHEMA = json.load(fh)

REQUIRED_FIELDS = SCHEMA["required_fields"]
TIER_WAIVER = SCHEMA["tier_waiver"]
ALLOWED_TIERS = set(TIER_WAIVER)
ALLOWED_CHECKS = set(SCHEMA["checks"])
ALLOWED_PHASES = set(SCHEMA["phases"])
ALLOWED_APPLIES_TO = set(SCHEMA["applies_to"])
ALLOWED_WAIVERS = set(TIER_WAIVER.values())

_PREFIXES = "|".join(SCHEMA["id_prefixes"])
CONTROL_ID_RE = re.compile(rf"^({_PREFIXES})-\d+$")
XREF_RE = re.compile(rf"\b({_PREFIXES})-\d+\b")

errors = []


def err(location, message):
    errors.append(f"ERROR {location}: {message}")


# ── Step 1: Parse catalog ──────────────────────────────────────────────────────
try:
    with open(CATALOG_PATH) as fh:
        catalog_data = yaml.safe_load(fh)
except FileNotFoundError:
    err("standards/catalog.yaml", "file not found")
    for e in errors:
        print(e)
    sys.exit(1)
except yaml.YAMLError as exc:
    err("standards/catalog.yaml", f"YAML parse error: {exc}")
    for e in errors:
        print(e)
    sys.exit(1)

if not isinstance(catalog_data, dict) or "controls" not in catalog_data:
    err("standards/catalog.yaml", "missing top-level 'controls' key")
    for e in errors:
        print(e)
    sys.exit(1)

controls_list = catalog_data["controls"]
if not isinstance(controls_list, list) or len(controls_list) == 0:
    err("standards/catalog.yaml", "'controls' must be a non-empty list")
    for e in errors:
        print(e)
    sys.exit(1)

# ── Steps 2–5: Per-control validation ─────────────────────────────────────────
seen_ids = {}  # id → index for uniqueness check
catalog_by_id = {}

for idx, control in enumerate(controls_list):
    loc = f"standards/catalog.yaml (entry {idx})"

    if not isinstance(control, dict):
        err(loc, "entry is not a YAML mapping")
        continue

    # Identify by id early for better error messages
    ctrl_id = control.get("id", f"<entry {idx}>")
    loc = f"standards/catalog.yaml ({ctrl_id})"

    # 2a. Required fields
    for field in REQUIRED_FIELDS:
        if field not in control:
            err(loc, f"missing required field '{field}'")

    # 2b. Allowed values — only validate when fields are present
    tier = control.get("tier")
    if tier is not None and tier not in ALLOWED_TIERS:
        err(loc, f"invalid tier '{tier}' — allowed: {sorted(ALLOWED_TIERS)}")

    check = control.get("check")
    if check is not None and check not in ALLOWED_CHECKS:
        err(loc, f"invalid check '{check}' — allowed: {sorted(ALLOWED_CHECKS)}")

    phase = control.get("phase")
    if phase is not None:
        if not isinstance(phase, list):
            err(loc, f"'phase' must be a list, got {type(phase).__name__}")
        else:
            bad = [p for p in phase if p not in ALLOWED_PHASES]
            if bad:
                err(loc, f"invalid phase values {bad} — allowed: {sorted(ALLOWED_PHASES)}")

    applies_to = control.get("applies_to")
    if applies_to is not None:
        if not isinstance(applies_to, list):
            err(loc, f"'applies_to' must be a list, got {type(applies_to).__name__}")
        else:
            bad = [a for a in applies_to if a not in ALLOWED_APPLIES_TO]
            if bad:
                err(loc, f"invalid applies_to values {bad} — allowed: {sorted(ALLOWED_APPLIES_TO)}")

    waiver = control.get("waiver")
    if waiver is not None and waiver not in ALLOWED_WAIVERS:
        err(loc, f"invalid waiver '{waiver}' — allowed: {sorted(ALLOWED_WAIVERS)}")

    # 3. Tier→waiver pairing
    if tier in TIER_WAIVER and waiver is not None:
        expected_waiver = TIER_WAIVER[tier]
        if waiver != expected_waiver:
            err(loc, f"tier {tier} requires waiver '{expected_waiver}', got '{waiver}'")

    # 4. ID uniqueness and shape
    if ctrl_id != f"<entry {idx}>":
        if not CONTROL_ID_RE.match(str(ctrl_id)):
            err(loc, f"id '{ctrl_id}' does not match pattern {CONTROL_ID_RE.pattern}")
        if ctrl_id in seen_ids:
            err(loc, f"duplicate id '{ctrl_id}' (first seen at entry {seen_ids[ctrl_id]})")
        else:
            seen_ids[ctrl_id] = idx
            catalog_by_id[ctrl_id] = control

    # 5. detail: path exists; judgment/hybrid controls must have one
    detail = control.get("detail")
    if detail is not None:
        detail_abs = os.path.join(REPO_ROOT, "standards", detail)
        if not os.path.isfile(detail_abs):
            err(loc, f"detail file 'standards/{detail}' does not exist")
    elif check in {"judgment", "hybrid"}:
        err(loc, f"check '{check}' requires a 'detail' file (rationale + pass/fail examples)")

# ── Step 5b: meta.categories covers every ID prefix ───────────────────────────
# The TFX-DS website derives control categories from this map; a missing
# prefix breaks the site build.
meta_categories = (catalog_data.get("meta") or {}).get("categories") or {}
for ctrl_id in catalog_by_id:
    prefix = ctrl_id.split("-")[0]
    if prefix not in meta_categories:
        err("standards/catalog.yaml (meta.categories)",
            f"id prefix '{prefix}' ({ctrl_id}) has no category mapping")

# ── Step 6: Reverse check — controls/*.md frontmatter ─────────────────────────
FRONTMATTER_FIELDS = ["id", "source", "title", "tier", "check", "phase",
                      "applies_to", "verify", "waiver"]

# Collect all .md files in controls/
if os.path.isdir(CONTROLS_DIR):
    md_files = sorted(f for f in os.listdir(CONTROLS_DIR) if f.endswith(".md"))
else:
    md_files = []

for fname in md_files:
    fpath = os.path.join(CONTROLS_DIR, fname)
    floc = f"standards/controls/{fname}"

    # Read and parse frontmatter
    with open(fpath) as fh:
        raw = fh.read()

    # Extract YAML between first pair of ---
    fm_match = re.match(r"^---\n(.*?)\n---", raw, re.DOTALL)
    if not fm_match:
        err(floc, "missing or malformed YAML frontmatter (expected --- delimiters)")
        continue

    try:
        fm = yaml.safe_load(fm_match.group(1))
    except yaml.YAMLError as exc:
        err(floc, f"frontmatter YAML parse error: {exc}")
        continue

    if not isinstance(fm, dict):
        err(floc, "frontmatter is not a YAML mapping")
        continue

    # Check filename matches id convention: tok-1.md → TOK-1
    fm_id = fm.get("id")
    expected_filename = f"{str(fm_id).lower()}.md" if fm_id else None
    if expected_filename and fname != expected_filename:
        err(floc, f"filename '{fname}' does not match id '{fm_id}' (expected '{expected_filename}')")

    # Check id corresponds to a catalog entry
    if fm_id not in catalog_by_id:
        err(floc, f"id '{fm_id}' in frontmatter not found in catalog")
        continue

    cat_entry = catalog_by_id[fm_id]

    # Compare each frontmatter field against catalog
    for field in FRONTMATTER_FIELDS:
        if field not in fm:
            # Frontmatter need not repeat all fields — only check ones present
            continue
        fm_val = fm[field]
        cat_val = cat_entry.get(field)
        if fm_val != cat_val:
            err(floc, f"field '{field}' in frontmatter ({fm_val!r}) does not match catalog ({cat_val!r})")

# Check reverse: every catalog entry with a detail: file has a corresponding
# standards/controls/<id-lower>.md (the file existence is already checked in step 5;
# this checks orphan .md files not referenced by any catalog entry)
for fname in md_files:
    fpath = os.path.join(CONTROLS_DIR, fname)
    with open(fpath) as fh:
        raw = fh.read()
    fm_match = re.match(r"^---\n(.*?)\n---", raw, re.DOTALL)
    if not fm_match:
        continue
    try:
        fm = yaml.safe_load(fm_match.group(1))
    except yaml.YAMLError:
        continue
    if not isinstance(fm, dict):
        continue
    fm_id = fm.get("id")
    # Check that this file is referenced from the catalog entry
    if fm_id in catalog_by_id:
        cat_entry = catalog_by_id[fm_id]
        expected_detail = f"controls/{fname}"
        if cat_entry.get("detail") != expected_detail:
            err(f"standards/controls/{fname}",
                f"file exists but catalog entry for '{fm_id}' does not point to it "
                f"(catalog detail: {cat_entry.get('detail')!r}, expected: {expected_detail!r})")

# ── Step 7: Cross-reference sweep ─────────────────────────────────────────────
# Collect skill SKILL.md files
skill_files = []
if os.path.isdir(SKILLS_DIR):
    for skill_name in os.listdir(SKILLS_DIR):
        skill_path = os.path.join(SKILLS_DIR, skill_name, "SKILL.md")
        if os.path.isfile(skill_path):
            skill_files.append(skill_path)

# Collect agent files
agent_files = []
if os.path.isdir(AGENTS_DIR):
    for fname in os.listdir(AGENTS_DIR):
        if fname.endswith(".md"):
            agent_files.append(os.path.join(AGENTS_DIR, fname))

# Collect catalog-change records
catalog_change_files = []
if os.path.isdir(CATALOG_CHANGES_DIR):
    for fname in os.listdir(CATALOG_CHANGES_DIR):
        if fname.endswith(".md"):
            catalog_change_files.append(os.path.join(CATALOG_CHANGES_DIR, fname))

all_xref_files = CROSS_REF_FILES + skill_files + agent_files + catalog_change_files

for fpath in all_xref_files:
    if not os.path.isfile(fpath):
        continue
    rel = os.path.relpath(fpath, REPO_ROOT)
    with open(fpath) as fh:
        content = fh.read()
    for match in XREF_RE.finditer(content):
        ref_id = match.group(0)
        if ref_id not in catalog_by_id:
            # Find line number for better reporting
            line_no = content[:match.start()].count("\n") + 1
            err(f"{rel}:{line_no}", f"references unknown control id '{ref_id}'")

# ── Output ─────────────────────────────────────────────────────────────────────
if errors:
    for e in errors:
        print(e)
    sys.exit(1)
else:
    print(f"OK: {len(catalog_by_id)} controls valid")
    sys.exit(0)
