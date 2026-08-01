#!/usr/bin/env python3
"""
Component fidelity scan — checks/component-fidelity.py
Static, line-local check implementing the deterministic subset of CMP-7
(components stay consistent with their design-system defaults, and no bare
global CSS reaches into a component's internals), plus two adjacent
deterministic checks that share the same "unscoped/uncontrolled style reaches
somewhere it shouldn't" shape: SLP-8 (no bounce/elastic easing) and MOT-1
(interface motion stays within 100-300ms).

Detection rules (line-local only)
──────────────────────────────────
Rule        Control   What is caught
OVERRIDE    CMP-7     A `className` on a capitalised JSX tag imported from
            (L2)      `components/ai-elements/*` or `components/ui/*`, on the
                      SAME line as an explicit `size="..."` prop on that tag,
                      whose className contains a fixed height `h-<n>` (n != 0)
                      or a font-size `text-xs|text-sm|text-base|text-lg|text-xl`
                      — exactly what `size` already owns. Only `h-<n>`/
                      `text-{xs,sm,base,lg,xl}` are judged; px-*/py-*/p-*/
                      gap-*/w-*/min-h-*/max-h-*/mt-*/mb-*/flex-1/absolute/
                      rounded-*/border-*/truncate are sanctioned layout
                      classes (AI Elements' own examples put them directly on
                      component tags) and are never flagged. `h-0` is a
                      collapse/expanded-state toggle, not a chosen size, so it
                      is excluded too. Requiring a literal `size=` on the same
                      tag is deliberate: without the component manifest
                      (CMP-1, not yet wired) there is no way to know from text
                      alone whether a given component even has a `size`/
                      `variant` prop to collide with — `size=` actually being
                      passed is the one signal available. This means a
                      className hard-coded ahead of a `{...props}` spread that
                      forwards `size` from a caller (no literal `size=` on
                      that line) is NOT caught; a false negative here is
                      preferred to a false positive (see "does NOT verify").
PROSE       CMP-7     A `.prose` DESCENDANT rule (`.prose h1 { }`, `.prose
            (L2)      :where(h3, h4) { }`, ...) lacking `:not(.not-prose *)`
                      scoping. The bare `.prose { }` class rule itself is not
                      a descendant rule and is not flagged.
GLOBALH     CMP-7     A CSS rule whose selector is a bare `h1`/`h2`/`h3`/`h4`
            (L2)      type selector with NO class anywhere in that
                      comma-separated selector group — i.e. not scoped under
                      any ancestor (or self) class. A rule like `.card h2 { }`
                      or `.prose h1:not(.not-prose *) { }` is scoped (has a
                      `.` somewhere) and is not flagged.
EASING      SLP-8     `animate-bounce` as a class token, a `cubic-bezier(...)`
            (L1)      whose 2nd or 4th number (a y-value) is outside [0,1], or
                      a `type:`/`ease:`/`easing:` key whose quoted value is a
                      named overshoot/spring/elastic easing.
DURATION    MOT-1     A Tailwind `duration-<n>` utility or CSS
            (L2)      `transition-duration:` greater than 300ms. Values <=300
                      (and 0, used by the reduced-motion guard) are fine.

What this script does NOT verify
─────────────────────────────────
- OVERRIDE only fires with a literal `size=` on the same line/tag — a
  component forwarding `size` via `{...props}` with no literal `size=` on
  that line is out of reach without the CMP-1 component manifest. Deferred to
  the manual/evaluator pass (CMP-7's `verify` text already names this).
- OVERRIDE is same-line only: `<SelectTrigger\n  className={cn("h-7 ...`
  spanning multiple lines is out of a line-local check's reach, same as
  type-scan's own documented line-local limits.
- EASING's named-easing list is a small curated set (spring, elastic, bounce,
  backIn, backOut, backInOut, anticipate) — an unlisted vendor easing name
  would not be caught.
- DURATION only covers the `duration-<n>` scale utility and CSS
  `transition-duration:`, not the `duration-[Nms]` arbitrary-value form.

Per-rule selection (additive)
─────────────────────────────
`--rules CMP-7,SLP-8` restricts emitted findings to those control ids
(comma-separated; `--rules=CMP-7` also works). Without the flag every rule
runs. Unknown ids are a usage error (exit 1).

Output
──────
ERROR <file>:<line> [<CTL-ID>] <found> — suggest: <...>
Exit 0 and print nothing (or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any violation.
"""

import importlib.util
import os
import re
import sys

_CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_checklib():
    path = os.path.join(_CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_tfx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()

TARGET_EXTENSIONS = checklib.TARGET_EXTENSIONS

VALID_RULES = {"CMP-7", "SLP-8", "MOT-1"}
# Which catalog id each emitted rule code belongs to, for --rules filtering.
RULE_CONTROL = {
    "OVERRIDE": "CMP-7",
    "PROSE": "CMP-7",
    "GLOBALH": "CMP-7",
    "EASING": "SLP-8",
    "DURATION": "MOT-1",
}


# ── OVERRIDE (CMP-7) ──────────────────────────────────────────────────────────
# Named imports: `import { Button, Foo as Bar } from "@/components/ui/button"`.
# Default imports: `import Button from "@/components/ui/button"`. This codebase
# uses only the "@/components/..." absolute alias (zero relative imports of
# ui/ai-elements components), so a substring check on the import path is
# enough — no path resolution needed.
NAMED_IMPORT_RE = re.compile(
    r'import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["\']([^"\']+)["\']'
)
DEFAULT_IMPORT_RE = re.compile(
    r'import\s+(?:type\s+)?([A-Za-z_$][\w$]*)\s+from\s+["\']([^"\']+)["\']'
)
DESIGN_SYSTEM_PATH_RE = re.compile(r"components/(ai-elements|ui)/")

TAG_OPEN_RE = re.compile(r"<([A-Z][A-Za-z0-9]*)\b")
SIZE_PROP_RE = re.compile(r"\bsize\s*=")
CLASS_ATTR_RE = re.compile(r'class(?:Name)?\s*=\s*("[^"]*"|\'[^\']*\'|\{[^}]*\})')
# Fixed height: h-<n>, n != 0. Lookbehind excludes min-h-*/max-h-* by
# construction (the char right before "h-" must not be a word char or "-"),
# not by a substring denylist. Optional trailing "!" (Tailwind v4 important).
HEIGHT_TOKEN_RE = re.compile(r"(?<![\w-])h-(\d+(?:\.\d+)?)!?(?![\w])")
# Font size: exact text-xs|sm|base|lg|xl, optional variant prefix (sm:, hover:,
# ...; still a real override), optional trailing "!" or "/<n>" leading shorthand.
FONT_SIZE_TOKEN_RE = re.compile(
    r"(?<![\w-])text-(xs|sm|base|lg|xl)(?:/\d+)?!?(?![\w-])"
)


def _parse_named_import_names(names_blob):
    names = []
    for part in names_blob.split(","):
        part = re.sub(r"^\s*type\s+", "", part.strip())
        if not part:
            continue
        m = re.match(r"([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)", part)
        if m:
            names.append(m.group(2))
            continue
        m2 = re.match(r"([A-Za-z_$][\w$]*)", part)
        if m2:
            names.append(m2.group(1))
    return names


def _collect_design_system_imports(lines):
    """Local names imported (anywhere in the file) from components/ai-elements/*
    or components/ui/*."""
    names = set()
    for line in lines:
        for m in NAMED_IMPORT_RE.finditer(line):
            if DESIGN_SYSTEM_PATH_RE.search(m.group(2)):
                names.update(_parse_named_import_names(m.group(1)))
        for m in DEFAULT_IMPORT_RE.finditer(line):
            if DESIGN_SYSTEM_PATH_RE.search(m.group(2)):
                names.add(m.group(1))
    return names


def _check_override_rule(scan_line, ds_names):
    """CMP-7 OVERRIDE. Returns list of (found, suggest)."""
    hits = []
    for m in TAG_OPEN_RE.finditer(scan_line):
        tag = m.group(1)
        if tag not in ds_names:
            continue
        tag_span = scan_line[m.start():]
        if not SIZE_PROP_RE.search(tag_span):
            continue  # no size= on this tag -> nothing here for size to own
        class_m = CLASS_ATTR_RE.search(tag_span)
        if not class_m:
            continue
        class_val = class_m.group(1)
        for hm in HEIGHT_TOKEN_RE.finditer(class_val):
            if hm.group(1) == "0":
                continue  # collapse/hidden-state toggle, not a chosen size
            hits.append((
                f'fixed height `h-{hm.group(1)}` in className on <{tag}> '
                f'(size="..." present on the same tag)',
                "let the size prop own height; remove the fixed h-<n> override",
            ))
        for fm in FONT_SIZE_TOKEN_RE.finditer(class_val):
            hits.append((
                f'font-size `text-{fm.group(1)}` in className on <{tag}> '
                f'(size="..." present on the same tag)',
                "let the size prop own font-size; remove the fixed text-{xs,sm,base,lg,xl} override",
            ))
    return hits


# ── PROSE (CMP-7) ─────────────────────────────────────────────────────────────
# ".prose" followed by whitespace then anything other than "{" is a descendant
# rule (".prose h1", ".prose :where(h3, h4)", ...); ".prose { ... }" (the base
# class rule itself) is excluded by the negative lookahead.
PROSE_DESCENDANT_RE = re.compile(r"\.prose\s+(?!\{)\S")


def _check_prose_rule(scan_line):
    if not PROSE_DESCENDANT_RE.search(scan_line):
        return None
    if ":not(.not-prose *)" in scan_line:
        return None
    return (
        "`.prose` descendant rule missing `:not(.not-prose *)` scoping",
        "add `:not(.not-prose *)` so this rule can't reach a not-prose-guarded subtree",
    )


# ── GLOBALH (CMP-7) ───────────────────────────────────────────────────────────
_HEADING_TAG_RE = re.compile(r"^(h[1-4])(?![a-z0-9-])", re.IGNORECASE)


def _rightmost_compound(selector_group):
    tokens = re.split(r"[\s>+~]+", selector_group.strip())
    return tokens[-1] if tokens else ""


def _split_top_level_commas(selector_text):
    """Split on "," at paren-depth 0 only — a comma inside `:where(h1, h2)` or
    `:is(...)` is NOT a group separator; naively splitting on every comma
    would shred a single scoped selector into several selector-shaped
    fragments and misread each as its own (falsely bare) group."""
    parts = []
    depth = 0
    current = []
    for ch in selector_text:
        if ch == "(":
            depth += 1
            current.append(ch)
        elif ch == ")":
            depth -= 1
            current.append(ch)
        elif ch == "," and depth == 0:
            parts.append("".join(current))
            current = []
        else:
            current.append(ch)
    parts.append("".join(current))
    return parts


def _check_globalh_rule(scan_line):
    if "{" not in scan_line:
        return None
    selector_text = scan_line.split("{", 1)[0].strip()
    if not selector_text or selector_text.startswith("@"):
        return None
    groups = [g.strip() for g in _split_top_level_commas(selector_text) if g.strip()]
    bare_headings = []
    for g in groups:
        if "." in g:
            continue  # scoped under (or qualified by) a class somewhere
        m = _HEADING_TAG_RE.match(_rightmost_compound(g))
        if m:
            bare_headings.append(m.group(1).lower())
    if not bare_headings:
        return None
    tags = ", ".join(sorted(set(bare_headings)))
    return (
        f"bare global selector targeting {tags} — not scoped to any class",
        "scope this rule under a class ancestor (e.g. `.prose h2`), never leave a heading-tag selector global",
    )


# ── EASING (SLP-8) ────────────────────────────────────────────────────────────
ANIMATE_BOUNCE_RE = re.compile(r"\banimate-bounce\b")
CUBIC_BEZIER_RE = re.compile(
    r"cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)"
)
SPRING_NAME_RE = re.compile(
    r'\b(?:type|ease|easing)\s*:\s*["\'](spring|elastic|bounce|backIn|backOut|backInOut|anticipate)["\']'
)
# Class-list-shaped quoted string with no class= on the line (a wrapped class
# list, or a cn('...') argument on its own line) — mirrors type-scan's
# ALLCAPS handling of the same shape.
CLASSLIST_TOKEN_RE = re.compile(
    r"\b(flex|grid|block|inline|rounded|tracking-|leading-|"
    r"px-|py-|pt-|pb-|pl-|pr-|mx-|my-|mt-|mb-|gap-|font-|"
    r"text-\[|text-(?:left|right|center)|items-|justify-|w-|h-|animate-)"
)


def _check_easing_rule(scan_line):
    hits = []

    class_attr_matches = list(CLASS_ATTR_RE.finditer(scan_line))
    if class_attr_matches:
        for cm in class_attr_matches:
            if ANIMATE_BOUNCE_RE.search(cm.group(1)):
                hits.append((
                    "`animate-bounce` — bounce/overshoot easing is never used on interface elements",
                    "use a standard ease (--ease-out / --ease-in-out); no bounce/elastic motion",
                ))
    else:
        for sm in re.finditer(r'"([^"]*)"|\'([^\']*)\'', scan_line):
            inner = sm.group(1) if sm.group(1) is not None else sm.group(2)
            if inner and ANIMATE_BOUNCE_RE.search(inner) and CLASSLIST_TOKEN_RE.search(inner):
                hits.append((
                    "`animate-bounce` — bounce/overshoot easing is never used on interface elements",
                    "use a standard ease (--ease-out / --ease-in-out); no bounce/elastic motion",
                ))

    for m in CUBIC_BEZIER_RE.finditer(scan_line):
        y1, y2 = float(m.group(2)), float(m.group(4))
        if not (0 <= y1 <= 1) or not (0 <= y2 <= 1):
            hits.append((
                f"{m.group(0)} has a y-value outside [0,1] — overshoot/bounce easing",
                "use a standard ease (--ease-out / --ease-in-out) whose y-values stay in [0,1]",
            ))

    for m in SPRING_NAME_RE.finditer(scan_line):
        hits.append((
            f'"{m.group(1)}" easing — spring/elastic easing is never used on interface elements',
            "use a standard ease; no spring/elastic motion",
        ))

    return hits


# ── DURATION (MOT-1) ──────────────────────────────────────────────────────────
CSS_TRANSITION_DURATION_RE = re.compile(
    r"transition-duration\s*:\s*([\d.]+)(ms|s)\b", re.IGNORECASE
)
TW_DURATION_RE = re.compile(r"(?<![\w-])duration-(\d+)(?![\w])")


def _check_duration_rule(scan_line):
    hits = []
    for m in CSS_TRANSITION_DURATION_RE.finditer(scan_line):
        value, unit = float(m.group(1)), m.group(2).lower()
        ms = value * 1000 if unit == "s" else value
        if ms > 300:
            hits.append((
                f"transition-duration {m.group(1)}{unit} exceeds 300ms",
                "keep interface motion within 100-300ms",
            ))
    for m in TW_DURATION_RE.finditer(scan_line):
        n = int(m.group(1))
        if n > 300:
            hits.append((
                f"Tailwind `duration-{n}` exceeds 300ms",
                "keep interface motion within 100-300ms",
            ))
    return hits


# ── Per-file scan ──────────────────────────────────────────────────────────────

def check_file(filepath, rules=None):
    """Scan a single file. Returns a list of ERROR strings. `rules` (additive,
    optional): a set/iterable of control ids to keep (e.g. {"CMP-7"}). When
    None, every rule runs."""
    rule_filter = set(rules) if rules is not None else None
    results = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in TARGET_EXTENSIONS:
        return results

    try:
        with open(filepath, encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()
    except OSError as exc:
        results.append(f"ERROR {filepath}: cannot read file — {exc}")
        return results

    rel = os.path.relpath(filepath)
    ds_names = _collect_design_system_imports(lines)
    in_block_comment = False

    for lineno, raw_line in enumerate(lines, start=1):
        line = raw_line.rstrip("\n")

        def emit(rule_code, found, suggest):
            ctl_id = RULE_CONTROL[rule_code]
            if rule_filter is not None and ctl_id not in rule_filter:
                return
            results.append(checklib.emit_error(rel, lineno, ctl_id, found, suggest))

        scan_line = checklib.strip_block_comments(line, in_block_comment)
        in_block_comment = checklib.ends_in_block_comment(line, in_block_comment)
        scan_line = re.sub(r"<!--.*?-->", "", scan_line)
        if ext in (".js", ".ts", ".jsx", ".tsx"):
            scan_line = re.sub(r"//.*$", "", scan_line)

        for found, suggest in _check_override_rule(scan_line, ds_names):
            emit("OVERRIDE", found, suggest)

        prose_hit = _check_prose_rule(scan_line)
        if prose_hit is not None:
            emit("PROSE", prose_hit[0], prose_hit[1])

        globalh_hit = _check_globalh_rule(scan_line)
        if globalh_hit is not None:
            emit("GLOBALH", globalh_hit[0], globalh_hit[1])

        for found, suggest in _check_easing_rule(scan_line):
            emit("EASING", found, suggest)

        for found, suggest in _check_duration_rule(scan_line):
            emit("DURATION", found, suggest)

    return results


def scan_paths(paths, rules=None):
    all_results = []
    for kind, val in checklib.iter_target_files(paths, TARGET_EXTENSIONS):
        if kind == "missing":
            print(f"ERROR component-fidelity: path not found: {val}")
            all_results.append(f"ERROR component-fidelity: path not found: {val}")
        else:
            all_results.extend(check_file(val, rules))
    return all_results


def parse_rules_flag(args):
    """Additive `--rules CMP-7,SLP-8` (or `--rules=CMP-7`). Removes the flag
    from `args` in place; returns the id set (or None when absent)."""
    rules = None
    i = 0
    while i < len(args):
        a = args[i]
        val = None
        if a == "--rules":
            if i + 1 >= len(args):
                raise ValueError("--rules needs a comma-separated control-id list")
            val = args[i + 1]
            del args[i:i + 2]
        elif a.startswith("--rules="):
            val = a[len("--rules="):]
            del args[i]
        else:
            i += 1
            continue
        ids = {r.strip().upper() for r in val.split(",") if r.strip()}
        if not ids:
            raise ValueError("--rules needs at least one control id")
        unknown = ids - VALID_RULES
        if unknown:
            raise ValueError(
                f"--rules: unknown id(s) {sorted(unknown)}; valid: {sorted(VALID_RULES)}"
            )
        rules = ids if rules is None else (rules | ids)
    return rules


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    import tempfile

    failures = []
    case_count = 0

    def run(content, ext):
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            res = check_file(tf.name)
        os.unlink(tf.name)
        return res

    def assert_violations(name, content, ext, expected_ctl_ids):
        nonlocal case_count
        case_count += 1
        res = run(content, ext)
        found = []
        for e in res:
            m = re.search(r"\[([A-Z0-9-]+)\]", e)
            if m:
                found.append(m.group(1))
        for ctl in expected_ctl_ids:
            if ctl not in found:
                failures.append(f"FAIL {name}: expected [{ctl}] — got: {res}")

    def assert_clean(name, content, ext):
        nonlocal case_count
        case_count += 1
        res = run(content, ext)
        errs = [r for r in res if r.startswith("ERROR")]
        if errs:
            failures.append(f"FAIL {name}: expected no ERROR — got: {errs}")

    # ── OVERRIDE (CMP-7) ──────────────────────────────────────────────────────
    IMPORT_BUTTON = 'import { Button } from "@/components/ui/button";\n'
    assert_violations(
        "OVERRIDE: h-<n>+text-size on a Button with size= present",
        IMPORT_BUTTON + '<Button size="sm" className="h-7 px-3 text-xs">Click</Button>',
        ".tsx", ["CMP-7"],
    )
    assert_clean(
        "OVERRIDE: sanctioned utilities only (px-*, gap-*, flex-1) stay clean",
        IMPORT_BUTTON + '<Button size="sm" className="px-3 gap-2 flex-1">Click</Button>',
        ".tsx",
    )
    assert_clean(
        "OVERRIDE: lowercase tag is always legal regardless of className",
        '<div className="h-7 text-xs">content</div>',
        ".tsx",
    )
    assert_clean(
        "OVERRIDE: capitalised tag not imported from ui/ai-elements (lucide-react icon)",
        'import { AlertCircle } from "lucide-react";\n<AlertCircle size={16} className="h-7 text-xs" />',
        ".tsx",
    )
    assert_clean(
        "OVERRIDE: h-0 is a collapse/hidden-state toggle, not a chosen size",
        'import { CollapsibleContent } from "@/components/ui/collapsible";\n'
        '<CollapsibleContent size="sm" className="data-starting-style:h-0 data-ending-style:h-0">x</CollapsibleContent>',
        ".tsx",
    )
    assert_clean(
        "OVERRIDE: no size prop present -> nothing for size to own (InputGroup real case)",
        'import { InputGroup } from "@/components/ui/input-group";\n'
        '<InputGroup className="h-8! rounded-lg!">x</InputGroup>',
        ".tsx",
    )
    assert_clean(
        "OVERRIDE: variant (not size) present is not the same ownership signal (Badge real case)",
        'import { Badge } from "@/components/ui/badge";\n'
        '<Badge className="gap-1.5 rounded-full text-xs" variant="secondary">x</Badge>',
        ".tsx",
    )
    assert_clean(
        "OVERRIDE: min-h-*/max-h-* are never fixed-height overrides",
        IMPORT_BUTTON + '<Button size="lg" className="min-h-11 max-h-20">Click</Button>',
        ".tsx",
    )

    # ── PROSE (CMP-7) ─────────────────────────────────────────────────────────
    assert_violations(
        "PROSE: descendant rule missing :not(.not-prose *)",
        ".prose p { margin: 0 0 14px; }", ".css", ["CMP-7"],
    )
    assert_clean(
        "PROSE: descendant rule with :not(.not-prose *) is clean",
        ".prose p:not(.not-prose *) { margin: 0 0 14px; }", ".css",
    )
    assert_clean(
        "PROSE: the base .prose class rule itself is not a descendant rule",
        ".prose { max-width: 70ch; line-height: 1.5; }", ".css",
    )

    # ── GLOBALH (CMP-7) ───────────────────────────────────────────────────────
    assert_violations(
        "GLOBALH: bare unscoped h1, h2 selector",
        'h1, h2 { font-family: "Plus Jakarta Sans Variable", system-ui, sans-serif; }',
        ".css", ["CMP-7"],
    )
    assert_clean(
        "GLOBALH: scoped under .prose with :not(.not-prose *) is clean",
        '.prose h1:not(.not-prose *) { font-family: "Plus Jakarta Sans Variable"; }',
        ".css",
    )
    assert_clean(
        "GLOBALH: scoped under any ancestor class is clean",
        ".card h2 { font-family: \"Plus Jakarta Sans Variable\"; }", ".css",
    )
    assert_clean(
        "GLOBALH: a rule targeting a non-heading element via an h-tag ancestor is clean",
        "h1 > span { color: red; }", ".css",
    )
    assert_clean(
        "GLOBALH: :where(h1, h2, h3, h4) inside a scoped selector is not shredded by "
        "naive comma-splitting into falsely-bare per-tag groups",
        '.prose :where(h1, h2, h3, h4):not(.not-prose *) { font-family: "Plus Jakarta Sans Variable"; }',
        ".css",
    )
    assert_violations(
        "GLOBALH: a bare :where(h1, h2) with no class anywhere is still caught",
        ":where(h1, h2) { font-family: Georgia; }", ".css", ["CMP-7"],
    )

    # ── EASING (SLP-8) ────────────────────────────────────────────────────────
    assert_violations(
        "EASING: animate-bounce class",
        '<div className="animate-bounce">x</div>', ".tsx", ["SLP-8"],
    )
    assert_violations(
        "EASING: cubic-bezier with a y-value outside [0,1] (overshoot)",
        "transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);",
        ".css", ["SLP-8"],
    )
    assert_violations(
        "EASING: named spring easing in a motion config",
        'const t = { type: "spring", stiffness: 300 };', ".ts", ["SLP-8"],
    )
    assert_clean(
        "EASING: the real --ease-out token (y-values in [0,1]) stays clean",
        "--ease-out: cubic-bezier(0.215, 0.61, 0.355, 1);", ".css",
    )
    assert_clean(
        "EASING: the real --ease-in-out token (y-values in [0,1]) stays clean",
        "--ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);", ".css",
    )
    assert_clean(
        "EASING: the standard 'ease-in-out' keyword is not a named-easing violation",
        "transition-timing-function: ease-in-out;", ".css",
    )

    # ── DURATION (MOT-1) ──────────────────────────────────────────────────────
    assert_violations(
        "DURATION: Tailwind duration-500 exceeds 300ms",
        '<div className="transition-all duration-500">x</div>', ".tsx", ["MOT-1"],
    )
    assert_violations(
        "DURATION: CSS transition-duration 400ms exceeds 300ms",
        ".x { transition-duration: 400ms; }", ".css", ["MOT-1"],
    )
    assert_violations(
        "DURATION: CSS transition-duration 0.5s (500ms) exceeds 300ms",
        ".x { transition-duration: 0.5s; }", ".css", ["MOT-1"],
    )
    assert_clean(
        "DURATION: duration-300 boundary is allowed",
        '<div className="transition-all duration-300">x</div>', ".tsx",
    )
    assert_clean(
        "DURATION: transition-duration 150ms is allowed",
        ".x { transition-duration: 150ms; }", ".css",
    )
    assert_clean(
        "DURATION: transition-duration 0ms (reduced-motion guard) is allowed",
        ".x { transition-duration: 0ms; }", ".css",
    )

    # ── Comment stripping ─────────────────────────────────────────────────────
    assert_clean(
        "COMMENT: commented-out bare h1 rule not flagged",
        "/* h1, h2 { font-family: Georgia; } */ .x { color: black; }", ".css",
    )

    # ── --rules per-rule selection (additive) ─────────────────────────────────
    def rule_ids(content, ext, rules):
        nonlocal case_count
        case_count += 1
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            res = check_file(tf.name, rules)
        os.unlink(tf.name)
        ids = set()
        for e in res:
            if not e.startswith("ERROR"):
                continue
            m = re.search(r"\[([A-Z0-9-]+)\]", e)
            if m:
                ids.add(m.group(1))
        return ids

    MULTI = "h1, h2 { font-family: Georgia; transition-duration: 400ms; }"
    all_ids = rule_ids(MULTI, ".css", None)
    if not {"CMP-7", "MOT-1"} <= all_ids:
        failures.append(f"FAIL --rules baseline: expected CMP-7/MOT-1 — got {all_ids}")
    only_cmp7 = rule_ids(MULTI, ".css", {"CMP-7"})
    if only_cmp7 != {"CMP-7"}:
        failures.append(f"FAIL --rules CMP-7 only: expected {{CMP-7}} — got {only_cmp7}")
    only_mot1 = rule_ids(MULTI, ".css", {"MOT-1"})
    if only_mot1 != {"MOT-1"}:
        failures.append(f"FAIL --rules MOT-1 only: expected {{MOT-1}} — got {only_mot1}")

    case_count += 1
    a1 = ["--rules", "CMP-7,SLP-8", "some/path"]
    if parse_rules_flag(a1) != {"CMP-7", "SLP-8"} or a1 != ["some/path"]:
        failures.append(f"FAIL parse_rules_flag list: got {a1}")
    case_count += 1
    a2 = ["--rules=mot-1", "p"]
    if parse_rules_flag(a2) != {"MOT-1"} or a2 != ["p"]:
        failures.append(f"FAIL parse_rules_flag = form: got {a2}")
    case_count += 1
    if parse_rules_flag(["p"]) is not None:
        failures.append("FAIL parse_rules_flag absent: expected None")
    case_count += 1
    try:
        parse_rules_flag(["--rules", "CMP-9", "p"])
        failures.append("FAIL parse_rules_flag unknown: expected ValueError")
    except ValueError:
        pass

    checklib.report_self_test(failures, case_count)


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: python3 checks/component-fidelity.py [--rules CMP-7,SLP-8] <path>... | --self-test")
        sys.exit(1)
    if "--self-test" in args:
        run_self_test()
        return
    try:
        rules = parse_rules_flag(args)
    except ValueError as exc:
        print(f"ERROR component-fidelity: {exc}")
        sys.exit(1)
    if not args:
        print("Usage: python3 checks/component-fidelity.py [--rules CMP-7,SLP-8] <path>... | --self-test")
        sys.exit(1)
    results = scan_paths(args, rules)
    errors = [r for r in results if r.startswith("ERROR")]
    for r in results:
        print(r)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
