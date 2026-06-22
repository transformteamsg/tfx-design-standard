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

# Frontmatter fields compared against the catalog in the Step-6 reverse check.
FRONTMATTER_FIELDS = ["id", "source", "title", "tier", "check", "phase",
                      "applies_to", "verify", "waiver"]


def load_schema_bits(repo_root):
    """
    Load standards/schema.json from repo_root and derive the allowed-value
    sets, required fields, tier→waiver map, and the id / cross-ref regexes.
    Returns a dict (passed to the per-control validator). Done inside a
    function so the self-test can point at a fixture root.

    Allowed values come from standards/schema.json, shared with the website's
    build guard (scripts/check-standards.mjs); edit the schema, not this file.
    """
    with open(os.path.join(repo_root, "standards", "schema.json")) as fh:
        schema = json.load(fh)

    tier_waiver = schema["tier_waiver"]
    prefixes = "|".join(schema["id_prefixes"])
    return {
        "required_fields": schema["required_fields"],
        "tier_waiver": tier_waiver,
        "allowed_tiers": set(tier_waiver),
        "allowed_checks": set(schema["checks"]),
        "allowed_phases": set(schema["phases"]),
        "allowed_applies_to": set(schema["applies_to"]),
        "allowed_waivers": set(tier_waiver.values()),
        "control_id_re": re.compile(rf"^({prefixes})-\d+$"),
        "xref_re": re.compile(rf"\b({prefixes})-\d+\b"),
    }


def validate_control(control, idx, schema_bits):
    """
    Steps 2–4 for a single control: required fields, allowed values,
    tier→waiver pairing, and id shape. Returns a list of error strings; no
    I/O. (Uniqueness, detail-file existence, and meta.categories coverage stay
    in collect_errors because they need cross-control / filesystem context.)
    """
    errors = []

    def err(location, message):
        errors.append(f"ERROR {location}: {message}")

    required_fields = schema_bits["required_fields"]
    tier_waiver = schema_bits["tier_waiver"]
    allowed_tiers = schema_bits["allowed_tiers"]
    allowed_checks = schema_bits["allowed_checks"]
    allowed_phases = schema_bits["allowed_phases"]
    allowed_applies_to = schema_bits["allowed_applies_to"]
    allowed_waivers = schema_bits["allowed_waivers"]
    control_id_re = schema_bits["control_id_re"]

    # Identify by id early for better error messages
    ctrl_id = control.get("id", f"<entry {idx}>")
    loc = f"standards/catalog.yaml ({ctrl_id})"

    # 2a. Required fields
    for field in required_fields:
        if field not in control:
            err(loc, f"missing required field '{field}'")

    # 2b. Allowed values — only validate when fields are present
    tier = control.get("tier")
    if tier is not None and tier not in allowed_tiers:
        err(loc, f"invalid tier '{tier}' — allowed: {sorted(allowed_tiers)}")

    check = control.get("check")
    if check is not None and check not in allowed_checks:
        err(loc, f"invalid check '{check}' — allowed: {sorted(allowed_checks)}")

    phase = control.get("phase")
    if phase is not None:
        if not isinstance(phase, list):
            err(loc, f"'phase' must be a list, got {type(phase).__name__}")
        else:
            bad = [p for p in phase if p not in allowed_phases]
            if bad:
                err(loc, f"invalid phase values {bad} — allowed: {sorted(allowed_phases)}")

    applies_to = control.get("applies_to")
    if applies_to is not None:
        if not isinstance(applies_to, list):
            err(loc, f"'applies_to' must be a list, got {type(applies_to).__name__}")
        else:
            bad = [a for a in applies_to if a not in allowed_applies_to]
            if bad:
                err(loc, f"invalid applies_to values {bad} — allowed: {sorted(allowed_applies_to)}")

    waiver = control.get("waiver")
    if waiver is not None and waiver not in allowed_waivers:
        err(loc, f"invalid waiver '{waiver}' — allowed: {sorted(allowed_waivers)}")

    # 3. Tier→waiver pairing
    if tier in tier_waiver and waiver is not None:
        expected_waiver = tier_waiver[tier]
        if waiver != expected_waiver:
            err(loc, f"tier {tier} requires waiver '{expected_waiver}', got '{waiver}'")

    # 4. ID shape (uniqueness is checked in collect_errors across all controls)
    if ctrl_id != f"<entry {idx}>":
        if not control_id_re.match(str(ctrl_id)):
            err(loc, f"id '{ctrl_id}' does not match pattern {control_id_re.pattern}")

    return errors


def cross_ref_errors(rel_path, text, catalog_ids, xref_re):
    """
    Step 7's per-file sweep: for every XREF_RE match in `text` whose id is not
    in `catalog_ids`, emit a "references unknown control id" error with the
    computed line number. No I/O (the caller reads the file).
    """
    errors = []
    for match in xref_re.finditer(text):
        ref_id = match.group(0)
        if ref_id not in catalog_ids:
            # Find line number for better reporting
            line_no = text[:match.start()].count("\n") + 1
            errors.append(f"ERROR {rel_path}:{line_no}: references unknown control id '{ref_id}'")
    return errors


# ── tfx-sync parity sub-checks ──────────────────────────────────────────────────
# Some fragments are restated in prose across files that must each ship in their
# own context (the plugin SKILL.md + the project-root CLAUDE.md; the skill summary +
# the canonical control). A whole-file read-through can't fix a fragment inside a
# larger file, so each restatement is wrapped in <!-- tfx-sync:NAME -->…<!-- /tfx-sync:NAME -->
# markers and compared against its source here. See docs/SYNC.md.

# REQUIRED_CORE — a hard-coded floor of buzzwords that must appear in BOTH the
# canonical slp-9.md list and the tfx-content-style summary. NOT synced from
# slp-9.md by design, so the check keeps an anchor even if both lists are edited.
# If the canonical list ever drops one of these, update this set too (see SYNC.md).
REQUIRED_CORE = {"streamline", "empower", "supercharge"}

# Connector / noise tokens dropped during buzzword tokenization.
_BUZZWORD_NOISE = {"and", "kin", "the", "plus", "list", "buzzword", ""}


def extract_sync_block(text, name):
    """
    Return the inner span between <!-- tfx-sync:NAME … --> and
    <!-- /tfx-sync:NAME --> (DOTALL), or None if the block is absent / unclosed.
    The open marker tolerates extra attributes (e.g. `source`, `source=catalog`).
    """
    pattern = (r"<!-- tfx-sync:" + re.escape(name) + r"\b[^>]*-->"
               r"(.*?)<!-- /tfx-sync:" + re.escape(name) + r" -->")
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1) if match else None


def tokenize_buzzwords(span):
    """
    Lowercase, split on commas/whitespace/bullets, strip a trailing parenthetical
    inflection (streamline(d) → streamline; effortless(ly) → effortless), drop
    connector/noise tokens, and return the resulting set. No morphological
    stemming — the live lists already align on the paren-stripped token.
    """
    tokens = set()
    for raw in re.split(r"[,\s•*—–…]+", span.lower()):
        tok = raw.strip("-–—….•* ")
        m = re.match(r"^(\w+)\(\w*\)$", tok)
        if m:
            tok = m.group(1)
        if tok and tok not in _BUZZWORD_NOISE:
            tokens.add(tok)
    return tokens


def l0_parity_errors(repo_root, catalog_by_id, xref_re):
    """
    [L0-SYNC] Each inline 'Non-negotiables (L0)' list (CLAUDE.md and the
    tfx-design-ui SKILL.md) must equal the catalog's tier:L0 set. Missing
    markers are an error. Set comparison, so prose/order around the IDs is free.
    """
    errors = []
    source = {cid for cid, c in catalog_by_id.items() if c.get("tier") == "L0"}
    consumers = [
        os.path.join(repo_root, "CLAUDE.md"),
        os.path.join(repo_root, ".claude", "skills", "tfx-design-ui", "SKILL.md"),
    ]
    for fpath in consumers:
        if not os.path.isfile(fpath):
            continue
        rel = os.path.relpath(fpath, repo_root)
        with open(fpath) as fh:
            text = fh.read()
        span = extract_sync_block(text, "L0")
        if span is None:
            errors.append(f"ERROR {rel} [L0-SYNC]: missing tfx-sync:L0 markers")
            continue
        inline = {m.group(0) for m in xref_re.finditer(span)}
        if inline != source:
            errors.append(
                f"ERROR {rel} [L0-SYNC]: inline L0 list {{{', '.join(sorted(inline))}}} "
                f"!= catalog L0 set {{{', '.join(sorted(source))}}}"
            )
    return errors


def slp9_parity_errors(repo_root):
    """
    [SLP9-SYNC] The tfx-content-style buzzword summary must be a SUBSET of the
    canonical slp-9.md buzzword list (the skill may show fewer words, never more),
    and REQUIRED_CORE must appear in both. Missing markers are an error.
    """
    errors = []
    src_path = os.path.join(repo_root, "standards", "controls", "slp-9.md")
    con_path = os.path.join(repo_root, ".claude", "skills", "tfx-content-style", "SKILL.md")

    source = None
    if os.path.isfile(src_path):
        with open(src_path) as fh:
            src_span = extract_sync_block(fh.read(), "slp9-buzzwords")
        if src_span is None:
            errors.append("ERROR standards/controls/slp-9.md [SLP9-SYNC]: missing source marker")
        else:
            source = tokenize_buzzwords(src_span)

    consumer = None
    if os.path.isfile(con_path):
        rel = os.path.relpath(con_path, repo_root)
        with open(con_path) as fh:
            con_span = extract_sync_block(fh.read(), "slp9-buzzwords")
        if con_span is None:
            errors.append(f"ERROR {rel} [SLP9-SYNC]: missing consumer marker")
        else:
            consumer = tokenize_buzzwords(con_span)

    if source is not None and consumer is not None:
        rel = os.path.relpath(con_path, repo_root)
        extra = consumer - source
        if extra:
            errors.append(
                f"ERROR {rel} [SLP9-SYNC]: skill buzzword(s) "
                f"{{{', '.join(sorted(extra))}}} not in canonical slp-9.md list"
            )

    # Required-core floor: must appear in both lists.
    if consumer is not None:
        missing = REQUIRED_CORE - consumer
        if missing:
            rel = os.path.relpath(con_path, repo_root)
            errors.append(
                f"ERROR {rel} [SLP9-SYNC]: required core buzzword(s) "
                f"{{{', '.join(sorted(missing))}}} absent"
            )
    if source is not None:
        missing = REQUIRED_CORE - source
        if missing:
            errors.append(
                f"ERROR standards/controls/slp-9.md [SLP9-SYNC]: required core "
                f"buzzword(s) {{{', '.join(sorted(missing))}}} absent"
            )
    return errors


def collect_errors(repo_root, _return_count=False):
    """
    Run all of Steps 1–7 against `repo_root` and return a list of error
    strings (empty on a fully valid catalog). Uses a local errors accumulator
    so it is safe to call repeatedly (e.g. from the self-test).

    With `_return_count=True`, returns `(errors, n)` where `n` is the count of
    unique, well-identified controls (the value printed by the success line) —
    so `main` reports exactly the original `len(catalog_by_id)` without
    re-parsing the catalog.
    """
    catalog_path = os.path.join(repo_root, "standards", "catalog.yaml")
    controls_dir = os.path.join(repo_root, "standards", "controls")

    cross_ref_files = [
        os.path.join(repo_root, "CLAUDE.md"),
        os.path.join(repo_root, "README.md"),
        os.path.join(repo_root, "checks", "README.md"),
        os.path.join(repo_root, "docs", "decisions", "TEMPLATE.md"),
    ]
    # Glob .claude/skills/*/SKILL.md, .claude/agents/*.md, and
    # docs/catalog-changes/*.md at runtime
    skills_dir = os.path.join(repo_root, ".claude", "skills")
    agents_dir = os.path.join(repo_root, ".claude", "agents")
    catalog_changes_dir = os.path.join(repo_root, "docs", "catalog-changes")

    schema_bits = load_schema_bits(repo_root)
    xref_re = schema_bits["xref_re"]

    errors = []

    def err(location, message):
        errors.append(f"ERROR {location}: {message}")

    def result(n=0):
        return (errors, n) if _return_count else errors

    # ── Step 1: Parse catalog ────────────────────────────────────────────────
    try:
        with open(catalog_path) as fh:
            catalog_data = yaml.safe_load(fh)
    except FileNotFoundError:
        err("standards/catalog.yaml", "file not found")
        return result()
    except yaml.YAMLError as exc:
        err("standards/catalog.yaml", f"YAML parse error: {exc}")
        return result()

    if not isinstance(catalog_data, dict) or "controls" not in catalog_data:
        err("standards/catalog.yaml", "missing top-level 'controls' key")
        return result()

    controls_list = catalog_data["controls"]
    if not isinstance(controls_list, list) or len(controls_list) == 0:
        err("standards/catalog.yaml", "'controls' must be a non-empty list")
        return result()

    # ── Steps 2–5: Per-control validation ────────────────────────────────────
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

        # Steps 2–4: required fields, allowed values, tier→waiver, id shape
        errors.extend(validate_control(control, idx, schema_bits))

        check = control.get("check")

        # 4. ID uniqueness (shape is checked in validate_control)
        if ctrl_id != f"<entry {idx}>":
            if ctrl_id in seen_ids:
                err(loc, f"duplicate id '{ctrl_id}' (first seen at entry {seen_ids[ctrl_id]})")
            else:
                seen_ids[ctrl_id] = idx
                catalog_by_id[ctrl_id] = control

        # 5. detail: path exists; judgment/hybrid controls must have one
        detail = control.get("detail")
        if detail is not None:
            detail_abs = os.path.join(repo_root, "standards", detail)
            if not os.path.isfile(detail_abs):
                err(loc, f"detail file 'standards/{detail}' does not exist")
        elif check in {"judgment", "hybrid"}:
            err(loc, f"check '{check}' requires a 'detail' file (rationale + pass/fail examples)")

    # ── Step 5b: meta.categories covers every ID prefix ──────────────────────
    # The TFX-DS website derives control categories from this map; a missing
    # prefix breaks the site build.
    meta_categories = (catalog_data.get("meta") or {}).get("categories") or {}
    for ctrl_id in catalog_by_id:
        prefix = ctrl_id.split("-")[0]
        if prefix not in meta_categories:
            err("standards/catalog.yaml (meta.categories)",
                f"id prefix '{prefix}' ({ctrl_id}) has no category mapping")

    # ── Step 6: Reverse check — controls/*.md frontmatter ────────────────────
    # Collect all .md files in controls/
    if os.path.isdir(controls_dir):
        md_files = sorted(f for f in os.listdir(controls_dir) if f.endswith(".md"))
    else:
        md_files = []

    for fname in md_files:
        fpath = os.path.join(controls_dir, fname)
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
        fpath = os.path.join(controls_dir, fname)
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

    # ── Step 7: Cross-reference sweep ────────────────────────────────────────
    # Collect skill SKILL.md files
    skill_files = []
    if os.path.isdir(skills_dir):
        for skill_name in os.listdir(skills_dir):
            skill_path = os.path.join(skills_dir, skill_name, "SKILL.md")
            if os.path.isfile(skill_path):
                skill_files.append(skill_path)

    # Collect agent files
    agent_files = []
    if os.path.isdir(agents_dir):
        for fname in os.listdir(agents_dir):
            if fname.endswith(".md"):
                agent_files.append(os.path.join(agents_dir, fname))

    # Collect catalog-change records
    catalog_change_files = []
    if os.path.isdir(catalog_changes_dir):
        for fname in os.listdir(catalog_changes_dir):
            if fname.endswith(".md"):
                catalog_change_files.append(os.path.join(catalog_changes_dir, fname))

    all_xref_files = cross_ref_files + skill_files + agent_files + catalog_change_files

    for fpath in all_xref_files:
        if not os.path.isfile(fpath):
            continue
        rel = os.path.relpath(fpath, repo_root)
        with open(fpath) as fh:
            content = fh.read()
        errors.extend(cross_ref_errors(rel, content, catalog_by_id, xref_re))

    # ── Step 8: tfx-sync parity sub-checks ───────────────────────────────────
    # Inline restatements (L0 list, SLP-9 buzzwords) must not drift from source.
    errors.extend(l0_parity_errors(repo_root, catalog_by_id, xref_re))
    errors.extend(slp9_parity_errors(repo_root))

    return result(len(catalog_by_id))


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    """
    Embedded self-test cases.  Prints SELF-TEST OK (N cases) and exits 0 on
    success, or prints failures and exits 1.
    """
    import tempfile
    import shutil

    failures = []
    case_count = 0

    # Schema bits derived from the real repo schema, so allowed-value sets match
    # what the live catalog is validated against.
    schema_bits = load_schema_bits(REPO_ROOT)
    xref_re = schema_bits["xref_re"]

    def assert_control_clean(name, control):
        nonlocal case_count
        case_count += 1
        errs = validate_control(control, 0, schema_bits)
        if errs:
            failures.append(f"FAIL {name}: expected no errors — got: {errs}")

    def assert_control_error(name, control, needle):
        nonlocal case_count
        case_count += 1
        errs = validate_control(control, 0, schema_bits)
        if not any(needle in e for e in errs):
            failures.append(f"FAIL {name}: expected an error containing {needle!r} — got: {errs}")

    def assert_xref_clean(name, text, catalog_ids):
        nonlocal case_count
        case_count += 1
        errs = cross_ref_errors("scratch.md", text, catalog_ids, xref_re)
        if errs:
            failures.append(f"FAIL {name}: expected no errors — got: {errs}")

    def assert_xref_error(name, text, catalog_ids, needle):
        nonlocal case_count
        case_count += 1
        errs = cross_ref_errors("scratch.md", text, catalog_ids, xref_re)
        if not any(needle in e for e in errs):
            failures.append(f"FAIL {name}: expected an error containing {needle!r} — got: {errs}")

    # ── Pure validate_control cases ──────────────────────────────────────────

    valid_control = {
        "id": "TOK-1",
        "source": "TFX-DS",
        "title": "Use tokens",
        "tier": "L0",
        "check": "deterministic",
        "phase": ["implement"],
        "applies_to": ["component"],
        "verify": "token-audit",
        "waiver": "none",
    }

    # Case 1: a valid L0 control → no errors
    assert_control_clean("valid L0 control", dict(valid_control))

    # Case 2: tier→waiver mismatch (L0 with waiver 'documented') → error
    bad_waiver = dict(valid_control, waiver="documented")
    assert_control_error("tier→waiver mismatch", bad_waiver, "requires waiver 'none'")

    # Case 3: invalid tier (L9) → error
    bad_tier = dict(valid_control, tier="L9")
    assert_control_error("invalid tier", bad_tier, "invalid tier 'L9'")

    # Case 4: malformed id (TOK1) → id-pattern error
    bad_id = dict(valid_control, id="TOK1")
    assert_control_error("malformed id", bad_id, "does not match pattern")

    # Case 5: invalid check value → error
    bad_check = dict(valid_control, check="bogus")
    assert_control_error("invalid check", bad_check, "invalid check 'bogus'")

    # Case 6: missing required field → error
    missing_field = dict(valid_control)
    del missing_field["title"]
    assert_control_error("missing required field", missing_field, "missing required field 'title'")

    # Case 7: phase not a list → error
    bad_phase = dict(valid_control, phase="implement")
    assert_control_error("phase not a list", bad_phase, "'phase' must be a list")

    # ── Pure cross_ref_errors cases ──────────────────────────────────────────

    catalog_ids = {"A11Y-1", "TOK-1"}

    # Case 8: known id mentioned → no error
    assert_xref_clean("known id mentioned", "See A11Y-1 and TOK-1 for details.", catalog_ids)

    # Case 9: unknown id (real prefix, absent number) → error with line number
    assert_xref_error("unknown id mentioned", "line one\nrefers to A11Y-999 here\n",
                      catalog_ids, "references unknown control id 'A11Y-999'")

    # Confirm the line number is computed correctly for the unknown id.
    case_count += 1
    line_errs = cross_ref_errors("scratch.md", "line one\nrefers to A11Y-999 here\n",
                                 catalog_ids, xref_re)
    if not any(e.startswith("ERROR scratch.md:2:") for e in line_errs):
        failures.append(f"FAIL unknown id line number: expected line 2 — got: {line_errs}")

    # ── tfx-sync parity cases (pure helpers) ─────────────────────────────────

    def assert_clean(name, errs):
        nonlocal case_count
        case_count += 1
        if errs:
            failures.append(f"FAIL {name}: expected no errors — got: {errs}")

    def assert_error(name, errs, needle):
        nonlocal case_count
        case_count += 1
        if not any(needle in e for e in errs):
            failures.append(f"FAIL {name}: expected an error containing {needle!r} — got: {errs}")

    # extract_sync_block: well-formed block returns the inner span; missing close
    # marker returns None.
    case_count += 1
    if extract_sync_block("<!-- tfx-sync:X source -->inner<!-- /tfx-sync:X -->", "X") != "inner":
        failures.append("FAIL extractor well-formed: expected 'inner' span")
    case_count += 1
    if extract_sync_block("<!-- tfx-sync:X -->inner (no close)", "X") is not None:
        failures.append("FAIL extractor unclosed: expected None")

    L0_SOURCE = {"A11Y-1", "A11Y-2", "A11Y-3", "CMP-2"}

    def l0_errs_for_span(span_text):
        """Drive the L0 parity comparison against a synthetic consumer span."""
        if span_text is None:
            return ["ERROR scratch.md [L0-SYNC]: missing tfx-sync:L0 markers"]
        inline = {m.group(0) for m in xref_re.finditer(span_text)}
        if inline != L0_SOURCE:
            return [f"ERROR scratch.md [L0-SYNC]: inline L0 list != catalog L0 set"]
        return []

    # L0 clean: span lists exactly the four → no error.
    assert_clean("L0 clean span",
                 l0_errs_for_span("A11Y-1; A11Y-2; A11Y-3; CMP-2"))
    # L0 missing a control: span omits CMP-2 → error.
    assert_error("L0 missing control",
                 l0_errs_for_span("A11Y-1; A11Y-2; A11Y-3"), "[L0-SYNC]")
    # L0 extra control: span adds A11Y-4 → error.
    assert_error("L0 extra control",
                 l0_errs_for_span("A11Y-1; A11Y-2; A11Y-3; A11Y-4; CMP-2"), "[L0-SYNC]")
    # L0 order / prose-insensitive: different order + surrounding words → clean.
    assert_clean("L0 order-insensitive",
                 l0_errs_for_span("destructive CMP-2 then label A11Y-3, focus A11Y-2, contrast A11Y-1"))
    # L0 missing markers: extract_sync_block None → missing-markers error.
    assert_error("L0 missing markers",
                 l0_errs_for_span(extract_sync_block("no markers here", "L0")),
                 "missing tfx-sync:L0 markers")

    # Buzzword parity — drive tokenize_buzzwords + the subset/required-core rules.
    BUZZ_SOURCE = tokenize_buzzwords(
        "streamline(d), empower, supercharge, effortless(ly), seamless(ly), "
        "world-class, revolutionise, leverage, unlock, elevate")

    def buzz_errs(consumer_span):
        consumer = tokenize_buzzwords(consumer_span)
        errs = []
        extra = consumer - BUZZ_SOURCE
        if extra:
            errs.append(f"ERROR scratch.md [SLP9-SYNC]: skill buzzword(s) {{{', '.join(sorted(extra))}}} not in canonical slp-9.md list")
        missing = REQUIRED_CORE - consumer
        if missing:
            errs.append(f"ERROR scratch.md [SLP9-SYNC]: required core buzzword(s) {{{', '.join(sorted(missing))}}} absent")
        return errs

    # Buzzword clean subset: {streamline,empower,supercharge} ⊆ source → no error.
    assert_clean("buzzword clean subset",
                 buzz_errs("streamline, empower, supercharge"))
    # Buzzword full set: consumer == source → no error.
    assert_clean("buzzword full set",
                 buzz_errs("streamline, empower, supercharge, effortless, seamless, "
                           "world-class, revolutionise, leverage, unlock, elevate"))
    # Buzzword rogue token: consumer adds 'disrupt' (not in source) → error.
    assert_error("buzzword rogue token",
                 buzz_errs("streamline, empower, supercharge, disrupt"),
                 "not in canonical slp-9.md list")
    # Buzzword inflection (paren-strip): source streamline(d) → streamline;
    # consumer streamline → match, no error. (Does NOT stem 'streamlined'.)
    case_count += 1
    if "streamline" not in BUZZ_SOURCE or "streamlined" in BUZZ_SOURCE:
        failures.append("FAIL buzzword inflection: streamline(d) should normalize to 'streamline' only")
    assert_clean("buzzword inflection match",
                 buzz_errs("streamline, empower, supercharge"))
    # Buzzword missing core: consumer lacks 'streamline' → required-core error.
    assert_error("buzzword missing core",
                 buzz_errs("empower, supercharge"),
                 "required core buzzword(s)")

    # ── Filesystem integration case for collect_errors ───────────────────────

    tmp_root = tempfile.mkdtemp(prefix="validate-selftest-")
    try:
        standards_dir = os.path.join(tmp_root, "standards")
        controls_dir = os.path.join(standards_dir, "controls")
        os.makedirs(controls_dir)

        # Copy the real schema.json so allowed values match the real validator.
        shutil.copyfile(
            os.path.join(REPO_ROOT, "standards", "schema.json"),
            os.path.join(standards_dir, "schema.json"),
        )

        # Minimal valid catalog: two L0 deterministic controls, meta.categories
        # covering both prefixes, no detail files (deterministic ⇒ not required).
        valid_catalog = {
            "meta": {"categories": {"TOK": "Tokens", "A11Y": "Accessibility"}},
            "controls": [
                {
                    "id": "TOK-1",
                    "source": "TFX-DS",
                    "title": "Use tokens",
                    "tier": "L0",
                    "check": "deterministic",
                    "phase": ["implement"],
                    "applies_to": ["component"],
                    "verify": "token-audit",
                    "waiver": "none",
                },
                {
                    "id": "A11Y-1",
                    "source": "WCAG",
                    "title": "Contrast",
                    "tier": "L0",
                    "check": "deterministic",
                    "phase": ["implement"],
                    "applies_to": ["page"],
                    "verify": "contrast",
                    "waiver": "none",
                },
            ],
        }
        catalog_path = os.path.join(standards_dir, "catalog.yaml")
        with open(catalog_path, "w") as fh:
            yaml.safe_dump(valid_catalog, fh)

        # Case 10: a minimal valid catalog → no errors
        case_count += 1
        errs = collect_errors(tmp_root)
        if errs:
            failures.append(f"FAIL integration valid catalog: expected no errors — got: {errs}")

        # Case 11: duplicate id → a "duplicate id" error
        dup_catalog = json.loads(json.dumps(valid_catalog))
        dup_catalog["controls"].append(dict(dup_catalog["controls"][0]))
        with open(catalog_path, "w") as fh:
            yaml.safe_dump(dup_catalog, fh)
        case_count += 1
        errs = collect_errors(tmp_root)
        if not any("duplicate id 'TOK-1'" in e for e in errs):
            failures.append(f"FAIL integration duplicate id: expected a duplicate-id error — got: {errs}")

        # Case 12: a judgment control with no detail → "requires a 'detail' file"
        judgment_catalog = json.loads(json.dumps(valid_catalog))
        judgment_catalog["controls"][0]["check"] = "judgment"
        with open(catalog_path, "w") as fh:
            yaml.safe_dump(judgment_catalog, fh)
        case_count += 1
        errs = collect_errors(tmp_root)
        if not any("requires a 'detail' file" in e for e in errs):
            failures.append(f"FAIL integration judgment no detail: expected a detail-file error — got: {errs}")

        # Case 13: missing catalog → "file not found"
        os.remove(catalog_path)
        case_count += 1
        errs = collect_errors(tmp_root)
        if not any("file not found" in e for e in errs):
            failures.append(f"FAIL integration missing catalog: expected 'file not found' — got: {errs}")
    finally:
        shutil.rmtree(tmp_root, ignore_errors=True)

    # ── Report ───────────────────────────────────────────────────────────────
    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {case_count} cases run)")
        sys.exit(1)
    else:
        print(f"SELF-TEST OK ({case_count} cases)")
        sys.exit(0)


# ── Entry point ──────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if "--self-test" in args:
        run_self_test()
        return  # run_self_test calls sys.exit

    errors, n = collect_errors(REPO_ROOT, _return_count=True)

    if errors:
        for e in errors:
            print(e)
        sys.exit(1)
    else:
        print(f"OK: {n} controls valid")
        sys.exit(0)


if __name__ == "__main__":
    main()
