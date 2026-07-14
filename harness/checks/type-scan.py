#!/usr/bin/env python3
"""
Type scan — checks/type-scan.py
Scans UI source files for the statically-resolvable subset of TYP-1, TYP-2,
TYP-3, and TYP-4 — typography violations detectable from source text alone,
without rendered layout.

Detection rules (line-local only)
──────────────────────────────────
Rule        Control   What is caught
FONT        TYP-1     A CSS `font-family:` or a Tailwind `font-[…]` arbitrary
            (L1)      value naming a typeface outside the active product/domain
                      profile. The token names font-display / font-body /
                      font-sans / --font-display / --font-body are allowed.
SIZEFLOOR   TYP-2     A `font-size:` or Tailwind `text-[Npx]` with N < 14
            (L1)      (body floor). Labels may go to 11px, so 11–13px is flagged
                      with a note that it's only a violation outside a label
                      context (the 11/14 ambiguity is in the suggest text).
LINEHEIGHT  TYP-2     An explicit numeric `line-height:` or Tailwind
            (L1)      `leading-[N]` clearly outside the 1.5–1.6 body band.
                      Conservative: only unitless / em values are judged; px
                      and percentage line-heights are NOT (needs the font size).
                      The band is BODY-scoped — line-heights inside an h1–h6 CSS
                      rule, or on a heading element, are excluded (headings run
                      tighter by design; see controls/typ-2.md).
ONSCALE     TYP-3     A `text-[Npx]` or `font-size:Npx` whose N is not on the
            (L1)      active product/domain profile's declared type scale.
ALLCAPS     TYP-4     A `text-transform: uppercase` declaration or an `uppercase`
            (L2)      Tailwind class (in a class/className attr or a class-list
                      string). Text is never set in all-caps, at any length;
                      genuine acronyms are literal capitals in content, not a
                      transform, so they are not matched.

What this script does NOT verify
─────────────────────────────────
- Font WEIGHTS (TYP-1's declared-weight half): a weight is
  rarely co-located with the family on one line and "approved weight" needs the
  family resolved. Weight enforcement is deferred to the manual pass.
- The 11px-vs-14px floor decision (TYP-2): whether a given element is a "label"
  (11px floor) or "body" (14px floor) needs rendered context. Sizes 11–13px are
  flagged with the ambiguity noted, not asserted as definite body violations.
- Line-heights given in px or % (TYP-2): the 1.5–1.6 ratio needs the font size,
  which is rarely on the same line. Only unitless/em line-heights are judged.
- All-caps via camelCase inline style (TYP-4): `style={{textTransform:'uppercase'}}`
  in JSX is not matched — only the `text-transform: uppercase` CSS form and the
  Tailwind `uppercase` utility (as a class token) are. Rare; deferred to manual.
- Font families / sizes set in a separate stylesheet the line-local rule can't
  see, or composed from variables / class-name interpolation — out of static
  reach; the manual pass covers them.

Per-rule selection (additive)
─────────────────────────────
`--rules TYP-1,TYP-3` restricts the emitted findings to those control ids
(comma-separated; `--rules=TYP-1` also works). Without the flag every rule
runs — unchanged default. This is the hook detect.py's curated profile uses to
run TYP-1 only, leaving the noisier TYP-2 recording-only. Unknown ids are a
usage error (exit 1); operational errors (path not found) are never filtered.

Output
──────
ERROR <file>:<line> [<CTL-ID>] <found> — suggest: <...>
NOTE  <file>:<line> <message>     (unresolvable / dynamic, never a silent pass)
Exit 0 and print nothing (or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any violation (NOTE lines alone do not fail).
"""

import os
import re
import sys

from profile_context import ProfileContext, resolve_profile_context

# ── Target extensions ──────────────────────────────────────────────────────────
TARGET_EXTENSIONS = {".css", ".html", ".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte"}

# ── FONT (TYP-1) ──────────────────────────────────────────────────────────────
# Semantic family tokens (case-insensitive). Concrete family names come only
# from profile_context.
SEMANTIC_FONT_TOKENS = (
    "font-display", "font-body", "font-sans",
    "--font-display", "--font-body", "var(--font-display)", "var(--font-body)",
    "inherit", "initial", "unset",
)
# Generic CSS family keywords that are not a "typeface" choice.
GENERIC_FAMILY_KEYWORDS = (
    "sans-serif", "serif", "monospace", "system-ui", "ui-sans-serif",
    "ui-monospace", "ui-serif", "cursive", "fantasy", "-apple-system",
    "blinkmacsystemfont", "segoe ui", "roboto", "helvetica", "arial",
)
# Generics that, used as the PRIMARY family, deliberately pick a non-approved
# typeface (mono/serif). Sans fallbacks such as sans-serif and system-ui remain
# allowed after a resolved profile family; these do not.
NON_APPROVED_PRIMARY_GENERICS = {"monospace", "serif", "ui-monospace", "ui-serif"}
CSS_FONT_FAMILY_RE = re.compile(r"font-family\s*:\s*([^;{}]+)", re.IGNORECASE)
TW_FONT_ARBITRARY_RE = re.compile(r"\bfont-\[([^\]]+)\]")
# Named Tailwind family utilities. Only the built-in non-approved *family*
# utilities are checked here (font-serif / font-mono) — NEVER the weight
# utilities (font-semibold, font-bold, …), which are not a typeface choice.
TW_FONT_NAMED_FAMILY_RE = re.compile(r"\bfont-(serif|mono)\b")


def _check_font_rule(scan_line, allowed_families):
    """TYP-1: returns a list of (found, suggest) for disallowed typefaces."""
    hits = []
    allowed = tuple(f.casefold() for f in (allowed_families or ()))
    allowed_label = ", ".join(allowed_families or ()) or "the resolved font tokens"

    def judge(family_value, source):
        val = family_value.strip().strip("'\"").lower()
        if not val:
            return
        # Deliberately-non-approved generic as the PRIMARY family → flag.
        # (_check_font_rule passes only the first family to judge() for CSS,
        # so this fires only on the primary, not on a sans fallback.)
        if val in NON_APPROVED_PRIMARY_GENERICS:
            hits.append((
                f'font-family "{family_value.strip()}" ({source})',
                f"use a resolved profile family ({allowed_label}) via semantic font tokens",
            ))
            return
        # Generic keyword only → not a typeface choice; allow.
        if val in GENERIC_FAMILY_KEYWORDS:
            return
        # Allowed profile family / semantic token (substring match on the first family).
        for ok in allowed + SEMANTIC_FONT_TOKENS:
            if ok in val:
                return
        # Dynamic / interpolated value — unresolvable, caller NOTEs it.
        if "var(" in val or "${" in val or "{" in val:
            return
        hits.append((
            f'font-family "{family_value.strip()}" ({source})',
            f"use a resolved profile family ({allowed_label}) via semantic font tokens",
        ))

    for m in CSS_FONT_FAMILY_RE.finditer(scan_line):
        # Judge the FIRST family in the stack (the one that wins).
        first = m.group(1).split(",")[0]
        judge(first, "CSS")
    for m in TW_FONT_ARBITRARY_RE.finditer(scan_line):
        inner = m.group(1).replace("_", " ")
        judge(inner.split(",")[0], "Tailwind font-[…]")
    for m in TW_FONT_NAMED_FAMILY_RE.finditer(scan_line):
        util = "font-" + m.group(1)
        if util in SEMANTIC_FONT_TOKENS:   # a project may sanction one (see plan 045)
            continue
        hits.append((
            f"Tailwind {util} utility (resolves to the default {m.group(1)} stack, "
            "not a resolved profile family)",
            f"use font-display/font-body, or define a --{util[5:]} token mapped to an "
            "approved profile face",
        ))
    return hits


# ── SIZE (TYP-2 floor + TYP-3 on-scale) ───────────────────────────────────────
CSS_FONT_SIZE_RE = re.compile(r"font-size\s*:\s*([0-9.]+)px", re.IGNORECASE)
TW_TEXT_PX_RE = re.compile(r"\btext-\[([0-9.]+)px\]")


def _check_size_rules(scan_line, type_scale):
    """TYP-2 floor + TYP-3 on-scale. Returns list of (ctl, found, suggest)."""
    hits = []
    sizes = []  # (px_float, source)
    for m in CSS_FONT_SIZE_RE.finditer(scan_line):
        sizes.append((float(m.group(1)), "CSS font-size"))
    for m in TW_TEXT_PX_RE.finditer(scan_line):
        sizes.append((float(m.group(1)), "text-[…px]"))

    for px, source in sizes:
        n = px
        n_int = int(px) if px == int(px) else px
        # TYP-2: below the 14px body floor.
        if px < 14:
            if px < 11:
                hits.append((
                    "TYP-2",
                    f"font size {n_int}px below the 11px label floor ({source})",
                    "labels >= 11px, body >= 14px",
                ))
            else:
                hits.append((
                    "TYP-2",
                    f"font size {n_int}px below the 14px body floor ({source})",
                    "body >= 14px; only short labels may go to 11px",
                ))
        # TYP-3: off the resolved scale (only judge whole-px sizes). An
        # unresolved scale is skipped honestly by the caller's one NOTE.
        if type_scale is not None and px == int(px) and int(px) not in type_scale:
            hits.append((
                "TYP-3",
                f"font size {int(px)}px not on the resolved type scale ({source})",
                f"use a scale size: {sorted(type_scale, reverse=True)}",
            ))
    return hits


# ── LINE-HEIGHT (TYP-2) ───────────────────────────────────────────────────────
# Unitless or em line-heights only (px/% need the font size — out of reach).
CSS_LINE_HEIGHT_RE = re.compile(r"line-height\s*:\s*([0-9.]+)(em)?\s*[;}]", re.IGNORECASE)
TW_LEADING_ARBITRARY_RE = re.compile(r"\bleading-\[([0-9.]+)(em)?\]")

# TYP-2's line-height band (1.5–1.6) is BODY-scoped — controls/typ-2.md fails only on
# "line-height under 1.5 on multi-line body text". Headings correctly run tighter, so a
# line-height inside an h1–h6 rule (or on a heading element) is out of scope, not a fail.
_HEADING_SUBJECT_RE = re.compile(r"^h[1-6](?![a-z0-9-])", re.IGNORECASE)
# A heading element opened on this line (JSX/HTML) — scopes `leading-[N]` on it.
_HEADING_TAG_RE = re.compile(r"<h[1-6][\s/>]", re.IGNORECASE)


def _selector_is_heading_only(selector_text):
    """True when every comma-group of a CSS selector targets an h1–h6 element.
    Mixed groups (e.g. '.title, h2') return False so the body member is still
    judged; @-rules and empty selectors return False."""
    sel = selector_text.strip()
    if not sel or sel.startswith("@"):
        return False
    parts = [p.strip() for p in sel.split(",") if p.strip()]
    if not parts:
        return False
    for part in parts:
        subject = re.split(r"[\s>+~]+", part)[-1]  # rightmost compound selector
        if not _HEADING_SUBJECT_RE.match(subject):
            return False
    return True


def _check_line_height_rule(scan_line, heading_context=False):
    """TYP-2 line-height: flag unitless/em values clearly outside 1.5–1.6.
    Skips heading contexts — TYP-2's band governs body copy, not headings."""
    if heading_context:
        return []
    hits = []
    candidates = []
    for m in CSS_LINE_HEIGHT_RE.finditer(scan_line):
        candidates.append((float(m.group(1)), m.group(2), "line-height"))
    for m in TW_LEADING_ARBITRARY_RE.finditer(scan_line):
        candidates.append((float(m.group(1)), m.group(2), "leading-[…]"))
    for val, unit, source in candidates:
        # px line-heights are written with 'px' so won't match (no group for px).
        # Treat unitless and em the same: a ratio.
        if val < 1.4 or val > 1.7:
            # Outside a generous band around 1.5–1.6 → flag. Within 1.4–1.7 we
            # stay quiet (close calls are advisories, not blocks).
            hits.append((
                f"body line-height {val}{unit or ''} outside 1.5-1.6 ({source})",
                "set body line-height to 1.5-1.6",
            ))
    return hits


# ── ALL-CAPS (TYP-4) ──────────────────────────────────────────────────────────
ALLCAPS_TW_RE = re.compile(r"\buppercase\b")
ALLCAPS_CSS_RE = re.compile(r"text-transform\s*:\s*uppercase", re.IGNORECASE)
STRIP_TAGS_RE = re.compile(r"<[^>]+>")
# A class / className attribute whose value may carry the `uppercase` utility
# (quoted value or a {…} JSX expression such as {cn('…')}).
CLASS_ATTR_RE = re.compile(r'class(?:Name)?\s*=\s*("[^"]*"|\'[^\']*\'|\{[^}]*\})')
# A class-list-shaped quoted string (other utility tokens present alongside) —
# catches a wrapped class list on its own line and cn('…') args with no class=.
CLASSLIST_TOKEN_RE = re.compile(
    r"\b(flex|grid|block|inline|rounded|tracking-|leading-|"
    r"px-|py-|pt-|pb-|pl-|pr-|mx-|my-|mt-|mb-|gap-|font-|"
    r"text-\[|text-(?:left|right|center)|items-|justify-|w-|h-)"
)


def _check_allcaps_rule(scan_line):
    """
    TYP-4: text is never set in all-caps. Flags a `text-transform: uppercase`
    declaration or an `uppercase` Tailwind utility — regardless of label length
    (the rule changed: short labels are no longer exempt; see HF-20 / catalog).
    The utility is matched only as a class token (inside a class/className attr
    or a class-list-shaped string), never the English word "uppercase" in
    visible text. Genuine acronyms are literal capitals in content, not a
    transform, so they are not matched. Returns (found, suggest) or None.
    """
    if ALLCAPS_CSS_RE.search(scan_line):
        return ("text-transform: uppercase — text is never set in all-caps",
                "remove the uppercase transform; use sentence case (TYP-4)")

    if not ALLCAPS_TW_RE.search(scan_line):
        return None

    # `uppercase` inside a class/className attribute value (incl. {cn('…')}).
    for m in CLASS_ATTR_RE.finditer(scan_line):
        if ALLCAPS_TW_RE.search(m.group(1)):
            return ("`uppercase` class — text is never set in all-caps",
                    "remove `uppercase`; use sentence case (TYP-4)")

    # `uppercase` inside a class-list-shaped quoted string with no class= on the
    # line (a wrapped class list, or a cn('…') argument on its own line).
    for sm in re.finditer(r'"([^"]*\buppercase\b[^"]*)"|\'([^\']*\buppercase\b[^\']*)\'', scan_line):
        inner = sm.group(1) if sm.group(1) is not None else sm.group(2)
        if inner and CLASSLIST_TOKEN_RE.search(inner):
            return ("`uppercase` class — text is never set in all-caps",
                    "remove `uppercase`; use sentence case (TYP-4)")

    return None


# ── comment stripping (mirrors a11y-static.py) ────────────────────────────────

def _strip_block_comments(line, in_comment):
    result = []
    i = 0
    n = len(line)
    while i < n:
        if in_comment:
            end = line.find("*/", i)
            if end == -1:
                break
            i = end + 2
            in_comment = False
        else:
            start = line.find("/*", i)
            if start == -1:
                result.append(line[i:])
                break
            result.append(line[i:start])
            i = start + 2
            in_comment = True
    return "".join(result)


def _ends_in_block_comment(line, in_comment):
    i = 0
    n = len(line)
    while i < n:
        if in_comment:
            end = line.find("*/", i)
            if end == -1:
                return True
            i = end + 2
            in_comment = False
        else:
            start = line.find("/*", i)
            if start == -1:
                return False
            i = start + 2
            in_comment = True
    return in_comment


def check_file(filepath, context=None, rules=None):
    """
    Scan a single file. Returns a list of ERROR / NOTE strings.
    `context` is a resolved ProfileContext; resolved from `filepath` if omitted.
    `rules` (additive, optional): a set/iterable of control ids to keep
    (e.g. {"TYP-1"}). When None, every rule runs (unchanged default). When
    given, only findings whose control id is in the set are emitted — the
    per-rule selection detect.py's curated profile needs. Operational errors
    (path not found, unreadable file) are never filtered by `rules`.
    """
    rule_filter = set(rules) if rules is not None else None
    results = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in TARGET_EXTENSIONS:
        return results

    if context is None:
        context = resolve_profile_context([filepath])
    font_value = context.allowed_font_families()
    scale_value = context.type_scale()
    allowed_families = font_value.value
    type_scale = set(scale_value.value) if scale_value.resolved else None

    try:
        with open(filepath, encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()
    except OSError as exc:
        results.append(f"ERROR {filepath}: cannot read file — {exc}")
        return results

    rel = os.path.relpath(filepath)
    in_block_comment = False
    in_heading_block = False  # inside an h1–h6 CSS rule (TYP-2 is body-scoped)

    for lineno, raw_line in enumerate(lines, start=1):
        line = raw_line.rstrip("\n")

        def emit(ctl_id, found, suggest):
            if rule_filter is not None and ctl_id not in rule_filter:
                return
            results.append(
                f"ERROR {rel}:{lineno} [{ctl_id}] {found} — suggest: {suggest}"
            )

        scan_line = _strip_block_comments(line, in_block_comment)
        in_block_comment = _ends_in_block_comment(line, in_block_comment)
        scan_line = re.sub(r"<!--.*?-->", "", scan_line)
        if ext in (".js", ".ts", ".jsx", ".tsx"):
            scan_line = re.sub(r"//.*$", "", scan_line)

        # TYP-1 fonts. If the profile has no declared family, skip this
        # parameterised judgment; scan_paths emits one honest NOTE.
        if allowed_families is not None:
            for found, suggest in _check_font_rule(scan_line, allowed_families):
                emit("TYP-1", found, suggest)

        # TYP-2 size floor + TYP-3 on-scale
        for ctl, found, suggest in _check_size_rules(scan_line, type_scale):
            emit(ctl, found, suggest)

        # TYP-2 line-height — body-scoped, so establish heading context first.
        opens_heading = (
            _selector_is_heading_only(scan_line.split("{", 1)[0])
            if "{" in scan_line else False
        )
        effective_heading = opens_heading if "{" in scan_line else in_heading_block
        if _HEADING_TAG_RE.search(scan_line):
            effective_heading = True  # `leading-[N]` on a heading element
        if "}" in scan_line:
            in_heading_block = False
        if "{" in scan_line and "}" not in scan_line:
            in_heading_block = opens_heading
        for found, suggest in _check_line_height_rule(scan_line, effective_heading):
            emit("TYP-2", found, suggest)

        # TYP-4 all-caps
        ac = _check_allcaps_rule(scan_line)
        if ac is not None:
            emit("TYP-4", ac[0], ac[1])

    return results


def _unresolved_profile_note(context, rules=None):
    """Return one NOTE for unresolved parameterised controls, or None."""
    active = set(rules) if rules is not None else VALID_RULES
    unresolved = []
    if "TYP-1" in active and not context.allowed_font_families().resolved:
        unresolved.append("TYP-1 font families")
    if "TYP-3" in active and not context.type_scale().resolved:
        unresolved.append("TYP-3 type scale")
    if not unresolved:
        return None
    domain = context.domain or "undeclared domain"
    detail = f" ({'; '.join(context.notes)})" if context.notes else ""
    return (
        f"NOTE type-scan: {', '.join(unresolved)} unresolved for {domain}; "
        f"skipping only those profile-specific judgments{detail}"
    )


def scan_paths(paths, rules=None, context=None):
    """Walk paths and collect ERROR/NOTE lines. Resolve profile context once.
    `rules` (additive, optional) restricts emitted findings to those control
    ids — passed straight through to check_file."""
    context = context or resolve_profile_context(paths)
    all_results = []
    unresolved_note = _unresolved_profile_note(context, rules)
    if unresolved_note:
        all_results.append(unresolved_note)
    for p in paths:
        if os.path.isfile(p):
            all_results.extend(check_file(p, context, rules))
        elif os.path.isdir(p):
            for root, dirs, files in os.walk(p):
                dirs[:] = [d for d in dirs if not d.startswith(".")]
                for fname in sorted(files):
                    ext = os.path.splitext(fname)[1].lower()
                    if ext in TARGET_EXTENSIONS:
                        all_results.extend(
                            check_file(os.path.join(root, fname), context, rules)
                        )
        else:
            print(f"ERROR type-scan: path not found: {p}")
            all_results.append(f"ERROR type-scan: path not found: {p}")
    return all_results


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    import tempfile

    failures = []
    case_count = 0

    t_and_s_context = ProfileContext(
        repo_root="fixture",
        domain="teachers-school",
        context_path=None,
        profile_path="fixture/teachers-school.yaml",
        compatibility_fallback=True,
        profile_values={
            "typography": {
                "allowed_families": ["Plus Jakarta Sans", "Inter"],
                "scale_px": [120, 96, 72, 48, 32, 24, 20, 18, 16, 14, 12, 11],
            }
        },
        product_values={},
    )
    platform_context = ProfileContext(
        repo_root="fixture",
        domain="platform",
        context_path="fixture/.dxd/design.json",
        profile_path="fixture/platform.yaml",
        compatibility_fallback=False,
        profile_values={},
        product_values={
            "typography": {
                "display": "Atkinson Hyperlegible",
                "body": "Source Sans 3",
                "scale_px": [48, 32, 24, 18, 15, 12],
            }
        },
    )
    unresolved_context = ProfileContext(
        repo_root="fixture",
        domain="platform",
        context_path="fixture/.dxd/design.json",
        profile_path="fixture/platform.yaml",
        compatibility_fallback=False,
        profile_values={},
        product_values={},
    )

    def run(content, ext, context=t_and_s_context):
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            res = check_file(tf.name, context)
        os.unlink(tf.name)
        return res

    def check_file_from_string(content, ext, rules, context=t_and_s_context):
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            res = check_file(tf.name, context, rules)
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

    # ── TYP-2 size floor + TYP-3 on-scale ─────────────────────────────────────
    # text-[13px] is below the 14px floor AND off-scale → TYP-2 + TYP-3.
    assert_violations("SIZE: text-[13px] below floor",
                      '<p className="text-[13px]">small</p>', ".tsx", ["TYP-2", "TYP-3"])
    # text-[14px] is on-scale and at the floor → clean.
    assert_clean("SIZE: text-[14px] clean", '<p className="text-[14px]">ok</p>', ".tsx")
    # text-[15px] is on the floor (>=14) but OFF the scale → TYP-3 only.
    assert_violations("SIZE: text-[15px] off-scale only",
                      '<p className="text-[15px]">ok size, off scale</p>', ".tsx", ["TYP-3"])
    # CSS font-size: 10px is below the 11px label floor.
    assert_violations("SIZE: CSS 10px below label floor",
                      ".tiny { font-size: 10px; }", ".css", ["TYP-2"])

    # ── TYP-1 fonts ───────────────────────────────────────────────────────────
    assert_violations("FONT: CSS Georgia",
                      ".h { font-family: Georgia, serif; }", ".css", ["TYP-1"])
    assert_clean("FONT: font-display token clean",
                 '<h1 className="font-display">Title</h1>', ".tsx")
    assert_clean("FONT: font-sans token clean",
                 '<p className="font-sans">Body</p>', ".tsx")
    assert_clean("FONT: CSS Inter clean",
                 ".b { font-family: 'Inter', sans-serif; }", ".css")
    assert_clean("FONT: CSS Plus Jakarta Sans clean",
                 ".h { font-family: 'Plus Jakarta Sans', sans-serif; }", ".css")
    assert_violations("FONT: Tailwind font-[Comic_Sans]",
                      '<h1 className="font-[Comic_Sans_MS]">Title</h1>', ".tsx", ["TYP-1"])
    # Named family utilities font-mono / font-serif are non-approved → TYP-1.
    assert_violations("FONT: Tailwind font-mono utility",
                      '<span className="font-mono text-[12px]">SLP-2</span>', ".tsx", ["TYP-1"])
    assert_violations("FONT: Tailwind font-serif utility",
                      '<p className="font-serif">x</p>', ".tsx", ["TYP-1"])
    # Weight utilities are NOT a typeface choice → never flagged by TYP-1.
    assert_clean("FONT: font-semibold is a WEIGHT not a family",
                 '<p className="font-semibold">x</p>', ".tsx")
    assert_clean("FONT: font-medium weight clean",
                 '<p className="font-medium">x</p>', ".tsx")
    # A non-approved generic as the PRIMARY CSS family → TYP-1.
    # (An approved face with a sans-serif fallback stays clean — covered by
    # "FONT: CSS Inter clean" above.)
    assert_violations("FONT: CSS monospace primary",
                      ".code { font-family: monospace; }", ".css", ["TYP-1"])

    # ── Profile-parameterised TYP-1 / TYP-3 ──────────────────────────────────
    case_count += 1
    platform_clean = run(
        ".screen { font-family: 'Atkinson Hyperlegible', sans-serif; font-size: 15px; }",
        ".css", platform_context,
    )
    if any(line.startswith("ERROR") for line in platform_clean):
        failures.append(
            f"FAIL PROFILE: Platform declared family/15px should pass — got {platform_clean}")

    case_count += 1
    platform_off_scale = run(
        ".screen { font-family: 'Source Sans 3', sans-serif; font-size: 17px; }",
        ".css", platform_context,
    )
    if not any("[TYP-3]" in line for line in platform_off_scale):
        failures.append(
            f"FAIL PROFILE: Platform undeclared 17px should fail TYP-3 — got {platform_off_scale}")

    case_count += 1
    leaked_family = run(
        ".screen { font-family: 'Plus Jakarta Sans', sans-serif; }",
        ".css", platform_context,
    )
    if not any("[TYP-1]" in line for line in leaked_family):
        failures.append(
            f"FAIL PROFILE: T&S family in Platform should fail TYP-1 — got {leaked_family}")

    case_count += 1
    with tempfile.NamedTemporaryFile(suffix=".css", mode="w", delete=False,
                                     encoding="utf-8") as tf:
        tf.write(".screen { font-family: Anything; font-size: 17px; line-height: 1.5; }")
        tf.flush()
        unresolved = scan_paths([tf.name], context=unresolved_context)
    os.unlink(tf.name)
    notes = [line for line in unresolved if line.startswith("NOTE")]
    if len(notes) != 1 or "TYP-1 font families" not in notes[0] or "TYP-3 type scale" not in notes[0]:
        failures.append(
            f"FAIL PROFILE: unresolved profile should emit one combined NOTE — got {unresolved}")
    if any("[TYP-1]" in line or "[TYP-3]" in line for line in unresolved):
        failures.append(
            f"FAIL PROFILE: unresolved profile borrowed a concrete judgment — got {unresolved}")

    # ── TYP-2 line-height ─────────────────────────────────────────────────────
    assert_violations("LINEHEIGHT: 1.2 too tight",
                      ".b { line-height: 1.2; }", ".css", ["TYP-2"])
    assert_clean("LINEHEIGHT: 1.5 clean", ".b { line-height: 1.5; }", ".css")
    assert_clean("LINEHEIGHT: 1.6 clean", ".b { line-height: 1.6; }", ".css")
    # TYP-2 is body-scoped: heading line-heights run tighter and are not judged.
    assert_clean("LINEHEIGHT: heading 1.2 same-line clean",
                 "h1 { line-height: 1.2; }", ".css")
    assert_clean("LINEHEIGHT: heading multi-line 1.25 clean",
                 "h1 {\n  line-height: 1.25;\n}", ".css")
    assert_clean("LINEHEIGHT: descendant heading rule clean",
                 ".card h2 {\n  line-height: 1.1;\n}", ".css")
    # A non-heading body rule spanning lines still flags.
    assert_violations("LINEHEIGHT: body multi-line 1.2 still flags",
                      ".lead {\n  line-height: 1.2;\n}", ".css", ["TYP-2"])
    # A mixed group (body + heading) is not treated as heading-only → still flags.
    assert_violations("LINEHEIGHT: mixed group still flags",
                      ".lead, h2 {\n  line-height: 1.2;\n}", ".css", ["TYP-2"])
    # Tailwind leading-[N]: heading element excluded, body element flagged.
    assert_clean("LINEHEIGHT: leading-[] on a heading element clean",
                 '<h1 className="leading-[1.1]">Title</h1>', ".tsx")
    assert_violations("LINEHEIGHT: leading-[] on a body element flags",
                      '<p className="leading-[1.2]">x</p>', ".tsx", ["TYP-2"])

    # ── TYP-4 all-caps (no all-caps at all — even short labels; HF-20) ──────────
    assert_violations(
        "ALLCAPS: uppercase on a long sentence",
        '<p className="uppercase">This entire running sentence is in upper case</p>',
        ".tsx", ["TYP-4"],
    )
    assert_violations(
        "ALLCAPS: uppercase on a short label is now a violation",
        '<span className="uppercase">NEW</span>', ".tsx", ["TYP-4"],
    )
    assert_violations(
        "ALLCAPS: uppercase in a wrapped className string",
        '          "block flex-1 rounded-md px-1 py-1.5 font-semibold uppercase tracking-wider",',
        ".tsx", ["TYP-4"],
    )
    assert_violations(
        "ALLCAPS: text-transform uppercase in CSS",
        ".eyebrow { text-transform: uppercase; }", ".css", ["TYP-4"],
    )
    assert_clean(
        "ALLCAPS: the word 'uppercase' in body text is not a utility",
        '<p>Type your initials in uppercase</p>', ".tsx",
    )
    assert_clean(
        "ALLCAPS: an acronym in content is fine (not a transform)",
        '<span className="font-semibold">MOE</span>', ".tsx",
    )
    assert_clean(
        "ALLCAPS: text-transform capitalize is allowed",
        ".name { text-transform: capitalize; }", ".css",
    )

    # ── Comment stripping ─────────────────────────────────────────────────────
    assert_clean("COMMENT: commented-out small size not flagged",
                 "/* font-size: 9px; */ .x { color: black; }", ".css")
    assert_clean("COMMENT: line-commented font-[Georgia] not flagged (tsx)",
                 "// className='font-[Georgia]' text-[8px]", ".tsx")

    # ── --rules per-rule selection (additive; detect.py's curated profile) ──────
    # A CSS rule that trips TYP-1 (font), TYP-2 (size floor), and TYP-3 (off-scale).
    MULTI = ".x { font-family: Georgia; font-size: 13px; }"

    def rule_ids(content, ext, rules):
        nonlocal case_count
        case_count += 1
        res = check_file_from_string(content, ext, rules)
        ids = []
        for e in res:
            if not e.startswith("ERROR"):
                continue
            m = re.search(r"\[([A-Z0-9-]+)\]", e)
            if m:
                ids.append(m.group(1))
        return set(ids)

    # rules=None → every rule runs (baseline for the filtered comparisons).
    all_ids = rule_ids(MULTI, ".css", None)
    if not {"TYP-1", "TYP-2", "TYP-3"} <= all_ids:
        failures.append(f"FAIL --rules baseline: expected TYP-1/2/3 — got {all_ids}")
    # Curated selection: rules={TYP-1} keeps TYP-1, DROPS the noisier TYP-2/TYP-3.
    only1 = rule_ids(MULTI, ".css", {"TYP-1"})
    if only1 != {"TYP-1"}:
        failures.append(f"FAIL --rules TYP-1 only: expected {{TYP-1}} — got {only1}")
    # A different single rule filters the other way.
    only2 = rule_ids(MULTI, ".css", {"TYP-2"})
    if only2 != {"TYP-2"}:
        failures.append(f"FAIL --rules TYP-2 only: expected {{TYP-2}} — got {only2}")
    # A two-rule set keeps exactly those two.
    two = rule_ids(MULTI, ".css", {"TYP-1", "TYP-3"})
    if two != {"TYP-1", "TYP-3"}:
        failures.append(f"FAIL --rules TYP-1,TYP-3: expected both — got {two}")

    # parse_rules_flag: valid list, `=` form, unknown id, missing value.
    case_count += 1
    a1 = ["--rules", "TYP-1,TYP-3", "some/path"]
    if parse_rules_flag(a1) != {"TYP-1", "TYP-3"} or a1 != ["some/path"]:
        failures.append(f"FAIL parse_rules_flag list: got {a1}")
    case_count += 1
    a2 = ["--rules=typ-2", "p"]  # lower-case is normalised
    if parse_rules_flag(a2) != {"TYP-2"} or a2 != ["p"]:
        failures.append(f"FAIL parse_rules_flag = form: got {a2}")
    case_count += 1
    if parse_rules_flag(["p"]) is not None:
        failures.append("FAIL parse_rules_flag absent: expected None")
    case_count += 1
    try:
        parse_rules_flag(["--rules", "TYP-9", "p"])
        failures.append("FAIL parse_rules_flag unknown: expected ValueError")
    except ValueError:
        pass

    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {case_count} cases run)")
        sys.exit(1)
    else:
        print(f"SELF-TEST OK ({case_count} cases)")
        sys.exit(0)


# ── Entry point ────────────────────────────────────────────────────────────────

VALID_RULES = {"TYP-1", "TYP-2", "TYP-3", "TYP-4"}


def parse_rules_flag(args):
    """Additive `--rules TYP-1,TYP-3` (or `--rules=TYP-1`). Removes the flag from
    `args` in place; returns the rule-id set (or None when absent). Raises
    ValueError on an unknown/empty rule id so the caller can fail as a usage
    error — the default (no flag) runs every rule, unchanged."""
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


def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: python3 checks/type-scan.py [--rules TYP-1,TYP-3] <path>... | --self-test")
        sys.exit(1)
    if "--self-test" in args:
        run_self_test()
        return
    try:
        rules = parse_rules_flag(args)
    except ValueError as exc:
        print(f"ERROR type-scan: {exc}")
        sys.exit(1)
    if not args:
        print("Usage: python3 checks/type-scan.py [--rules TYP-1,TYP-3] <path>... | --self-test")
        sys.exit(1)
    results = scan_paths(args, rules)
    errors = [r for r in results if r.startswith("ERROR")]
    for r in results:
        print(r)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
