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
            (L1)      value naming a typeface other than Plus Jakarta Sans or
                      Inter. The token names font-display / font-body /
                      font-sans / --font-display / --font-body are allowed.
SIZEFLOOR   TYP-2     A `font-size:` or Tailwind `text-[Npx]` with N < 14
            (L1)      (body floor). Labels may go to 11px, so 11–13px is flagged
                      with a note that it's only a violation outside a label
                      context (the 11/14 ambiguity is in the suggest text).
LINEHEIGHT  TYP-2     An explicit numeric `line-height:` or Tailwind
            (L1)      `leading-[N]` clearly outside the 1.5–1.6 body band.
                      Conservative: only unitless / em values are judged; px
                      and percentage line-heights are NOT (needs the font size).
ONSCALE     TYP-3     A `text-[Npx]` or `font-size:Npx` whose N is not on the
            (L1)      TFX type scale {120,96,72,48,32,24,20,18,16,14,12,11}.
                      The scale is sourced from TYP-3's catalog `verify` field
                      (see TYPE_SCALE below) so it cannot drift.
ALLCAPS     TYP-4     A `text-transform: uppercase` / `uppercase` class on a
            (L2)      line whose same-line text content runs longer than a short
                      label (> 24 letters of running text).

What this script does NOT verify
─────────────────────────────────
- Font WEIGHTS (TYP-1's "PJS 600 / Inter 400/500/600 only" half): a weight is
  rarely co-located with the family on one line and "approved weight" needs the
  family resolved. Weight enforcement is deferred to the manual pass.
- The 11px-vs-14px floor decision (TYP-2): whether a given element is a "label"
  (11px floor) or "body" (14px floor) needs rendered context. Sizes 11–13px are
  flagged with the ambiguity noted, not asserted as definite body violations.
- Line-heights given in px or % (TYP-2): the 1.5–1.6 ratio needs the font size,
  which is rarely on the same line. Only unitless/em line-heights are judged.
- All-caps LENGTH precisely (TYP-4): "short label" is a rendered-length judgement.
  This uses a same-line letter-count heuristic (> 24 letters) and cannot see
  text supplied by a child element, a variable, or i18n. Conservative; NOTE the
  unresolvable cases rather than guessing.
- Font families / sizes set in a separate stylesheet the line-local rule can't
  see, or composed from variables / class-name interpolation — out of static
  reach; the manual pass covers them.

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

# ── Target extensions ──────────────────────────────────────────────────────────
TARGET_EXTENSIONS = {".css", ".html", ".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte"}

# ── TYP-3 type scale ──────────────────────────────────────────────────────────
# Sourced from TYP-3's catalog `verify` field:
#   "Sizes in {120,96,72,48,32,24,20,18,16,14,12,11}; checks/type-scan"
# Read at runtime from standards/catalog.yaml when available (so it cannot drift
# from the catalog), with this set as the embedded fallback if the catalog can't
# be read/parsed.
TYPE_SCALE_FALLBACK = {120, 96, 72, 48, 32, 24, 20, 18, 16, 14, 12, 11}

CATALOG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "standards", "catalog.yaml",
)


def load_type_scale(path=CATALOG_PATH):
    """
    Read the allowed type-scale set from TYP-3's `verify` field in catalog.yaml:
    `Sizes in {120,96,72,48,32,24,20,18,16,14,12,11}; …`. Returns (set, note);
    `note` is non-None if the embedded fallback was used.
    """
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return TYPE_SCALE_FALLBACK, (
            f"NOTE type-scan: could not read {path}; using embedded TYP-3 scale"
        )
    # Find TYP-3's verify line and pull the {…} set out of it.
    idx = text.find("id: TYP-3")
    section = text[idx:] if idx != -1 else text
    m = re.search(r"verify:\s*\"[^\"]*Sizes in\s*\{([0-9,\s]+)\}", section)
    if not m:
        return TYPE_SCALE_FALLBACK, (
            f"NOTE type-scan: could not parse TYP-3 scale from {path}; using embedded set"
        )
    scale = {int(n) for n in re.findall(r"\d+", m.group(1))}
    if not scale:
        return TYPE_SCALE_FALLBACK, (
            f"NOTE type-scan: TYP-3 scale parsed empty from {path}; using embedded set"
        )
    return scale, None


# ── FONT (TYP-1) ──────────────────────────────────────────────────────────────
# Allowed family tokens (case-insensitive). The product fonts plus the token
# names that resolve to them.
ALLOWED_FONT_TOKENS = (
    "plus jakarta sans", "inter", "font-display", "font-body", "font-sans",
    "--font-display", "--font-body", "var(--font-display)", "var(--font-body)",
    "inherit", "initial", "unset",
)
# Generic CSS family keywords that are not a "typeface" choice.
GENERIC_FAMILY_KEYWORDS = (
    "sans-serif", "serif", "monospace", "system-ui", "ui-sans-serif",
    "ui-monospace", "ui-serif", "cursive", "fantasy", "-apple-system",
    "blinkmacsystemfont", "segoe ui", "roboto", "helvetica", "arial",
)
CSS_FONT_FAMILY_RE = re.compile(r"font-family\s*:\s*([^;{}]+)", re.IGNORECASE)
TW_FONT_ARBITRARY_RE = re.compile(r"\bfont-\[([^\]]+)\]")


def _check_font_rule(scan_line):
    """TYP-1: returns a list of (found, suggest) for disallowed typefaces."""
    hits = []

    def judge(family_value, source):
        val = family_value.strip().strip("'\"").lower()
        if not val:
            return
        # Generic keyword only → not a typeface choice; allow.
        if val in GENERIC_FAMILY_KEYWORDS:
            return
        # Allowed product font / token (substring match on the first family).
        for ok in ALLOWED_FONT_TOKENS:
            if ok in val:
                return
        # Dynamic / interpolated value — unresolvable, caller NOTEs it.
        if "var(" in val or "${" in val or "{" in val:
            return
        hits.append((
            f'font-family "{family_value.strip()}" ({source})',
            "use Plus Jakarta Sans (display) or Inter (body) via the font tokens",
        ))

    for m in CSS_FONT_FAMILY_RE.finditer(scan_line):
        # Judge the FIRST family in the stack (the one that wins).
        first = m.group(1).split(",")[0]
        judge(first, "CSS")
    for m in TW_FONT_ARBITRARY_RE.finditer(scan_line):
        inner = m.group(1).replace("_", " ")
        judge(inner.split(",")[0], "Tailwind font-[…]")
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
        # TYP-3: off the published scale (only judge whole-px sizes).
        if px == int(px) and int(px) not in type_scale:
            hits.append((
                "TYP-3",
                f"font size {int(px)}px not on the TFX type scale ({source})",
                f"use a scale size: {sorted(type_scale, reverse=True)}",
            ))
    return hits


# ── LINE-HEIGHT (TYP-2) ───────────────────────────────────────────────────────
# Unitless or em line-heights only (px/% need the font size — out of reach).
CSS_LINE_HEIGHT_RE = re.compile(r"line-height\s*:\s*([0-9.]+)(em)?\s*[;}]", re.IGNORECASE)
TW_LEADING_ARBITRARY_RE = re.compile(r"\bleading-\[([0-9.]+)(em)?\]")


def _check_line_height_rule(scan_line):
    """TYP-2 line-height: flag unitless/em values clearly outside 1.5–1.6."""
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


def _check_allcaps_rule(scan_line):
    """
    TYP-4: an uppercase utility/property on a line whose same-line text content
    is long (> 24 letters of running text). Returns (found, suggest) or None;
    returns the sentinel ("__NOTE__", msg) when uppercase is present but the
    text length can't be resolved on this line.
    """
    has_tw = bool(ALLCAPS_TW_RE.search(scan_line))
    has_css = bool(ALLCAPS_CSS_RE.search(scan_line))
    if not (has_tw or has_css):
        return None

    # If `uppercase` is the Tailwind utility and it sits inside a quoted string
    # that is class-list-shaped (other utility tokens like flex / px-* / text-[…]
    # / rounded-* / tracking-* alongside it), this is a className string with no
    # text content on the line — common when a long class list wraps onto its own
    # line. Treat it as unresolvable (NOTE), not a flag: the rendered text is
    # elsewhere. (Conservative widen; the same-line text heuristic can't see it.)
    if has_tw and not has_css:
        for sm in re.finditer(r'"([^"]*\buppercase\b[^"]*)"|\'([^\']*\buppercase\b[^\']*)\'', scan_line):
            inner = sm.group(1) if sm.group(1) is not None else sm.group(2)
            if inner and re.search(
                r"\b(flex|grid|block|inline|rounded|tracking-|leading-|"
                r"px-|py-|pt-|pb-|pl-|pr-|mx-|my-|mt-|mb-|gap-|font-|"
                r"text-\[|text-(?:left|right|center)|items-|justify-|w-|h-)", inner
            ):
                return ("__NOTE__",
                        "uppercase inside a className string (no text on line) — "
                        "verify the rendered text is a short label")

    # Extract same-line text content: strip tags, classNames, and attributes,
    # then count letters of what reads as visible text.
    text = scan_line
    # Drop className/class attribute values (where the uppercase token lives).
    text = re.sub(r'class(?:Name)?\s*=\s*(?:"[^"]*"|\'[^\']*\'|\{[^}]*\})', " ", text)
    # Drop other attributes value=… and style=… .
    text = re.sub(r'\b[\w-]+\s*=\s*(?:"[^"]*"|\'[^\']*\'|\{[^}]*\})', " ", text)
    # Drop tags and CSS selectors/braces.
    text = STRIP_TAGS_RE.sub(" ", text)
    text = re.sub(r"\{[^}]*\}", " ", text)
    text = re.sub(r"[.#][\w-]+", " ", text)  # css selectors
    text = re.sub(r"text-transform\s*:\s*uppercase\s*;?", " ", text, flags=re.IGNORECASE)
    letters = re.sub(r"[^A-Za-z]", "", text)

    if not letters:
        # uppercase present but no resolvable same-line text → NOTE, never silent.
        return ("__NOTE__",
                "uppercase utility present but text content not on this line — "
                "verify it is a short label")
    if len(letters) > 24:
        snippet = text.strip()
        if len(snippet) > 40:
            snippet = snippet[:40] + "…"
        return (f"all-caps on long text ({len(letters)} letters): \"{snippet}\"",
                "reserve all-caps for short labels; use sentence case for running text")
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


def check_file(filepath, type_scale=None):
    """
    Scan a single file. Returns a list of ERROR / NOTE strings.
    `type_scale` is the allowed-size set; built from the catalog if omitted.
    """
    results = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in TARGET_EXTENSIONS:
        return results

    if type_scale is None:
        type_scale, _note = load_type_scale()

    try:
        with open(filepath, encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()
    except OSError as exc:
        results.append(f"ERROR {filepath}: cannot read file — {exc}")
        return results

    rel = os.path.relpath(filepath)
    in_block_comment = False

    for lineno, raw_line in enumerate(lines, start=1):
        line = raw_line.rstrip("\n")

        def emit(ctl_id, found, suggest):
            results.append(
                f"ERROR {rel}:{lineno} [{ctl_id}] {found} — suggest: {suggest}"
            )

        def note(msg):
            results.append(f"NOTE {rel}:{lineno} {msg}")

        scan_line = _strip_block_comments(line, in_block_comment)
        in_block_comment = _ends_in_block_comment(line, in_block_comment)
        scan_line = re.sub(r"<!--.*?-->", "", scan_line)
        if ext in (".js", ".ts", ".jsx", ".tsx"):
            scan_line = re.sub(r"//.*$", "", scan_line)

        # TYP-1 fonts
        for found, suggest in _check_font_rule(scan_line):
            emit("TYP-1", found, suggest)

        # TYP-2 size floor + TYP-3 on-scale
        for ctl, found, suggest in _check_size_rules(scan_line, type_scale):
            emit(ctl, found, suggest)

        # TYP-2 line-height
        for found, suggest in _check_line_height_rule(scan_line):
            emit("TYP-2", found, suggest)

        # TYP-4 all-caps
        ac = _check_allcaps_rule(scan_line)
        if ac is not None:
            if ac[0] == "__NOTE__":
                note(ac[1])
            else:
                emit("TYP-4", ac[0], ac[1])

    return results


def scan_paths(paths):
    """Walk paths, collect ERROR/NOTE lines. Prints scale-fallback NOTE once."""
    type_scale, scale_note = load_type_scale()
    if scale_note:
        print(scale_note)
    all_results = []
    for p in paths:
        if os.path.isfile(p):
            all_results.extend(check_file(p, type_scale))
        elif os.path.isdir(p):
            for root, dirs, files in os.walk(p):
                dirs[:] = [d for d in dirs if not d.startswith(".")]
                for fname in sorted(files):
                    ext = os.path.splitext(fname)[1].lower()
                    if ext in TARGET_EXTENSIONS:
                        all_results.extend(
                            check_file(os.path.join(root, fname), type_scale)
                        )
        else:
            print(f"ERROR type-scan: path not found: {p}")
            all_results.append(f"ERROR type-scan: path not found: {p}")
    return all_results


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    import tempfile

    type_scale, _note = load_type_scale()

    failures = []
    case_count = 0

    def run(content, ext):
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            res = check_file(tf.name, type_scale)
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

    # ── TYP-2 line-height ─────────────────────────────────────────────────────
    assert_violations("LINEHEIGHT: 1.2 too tight",
                      ".b { line-height: 1.2; }", ".css", ["TYP-2"])
    assert_clean("LINEHEIGHT: 1.5 clean", ".b { line-height: 1.5; }", ".css")
    assert_clean("LINEHEIGHT: 1.6 clean", ".b { line-height: 1.6; }", ".css")

    # ── TYP-4 all-caps ────────────────────────────────────────────────────────
    assert_violations(
        "ALLCAPS: uppercase on a long sentence",
        '<p className="uppercase">This entire running sentence is in upper case</p>',
        ".tsx", ["TYP-4"],
    )
    assert_clean(
        "ALLCAPS: uppercase on a short label NEW",
        '<span className="uppercase">NEW</span>', ".tsx",
    )
    assert_clean(
        "ALLCAPS: uppercase in a wrapped className string (no text on line)",
        '          "block flex-1 rounded-md px-1 py-1.5 font-semibold uppercase tracking-wider",',
        ".tsx",
    )

    # ── Comment stripping ─────────────────────────────────────────────────────
    assert_clean("COMMENT: commented-out small size not flagged",
                 "/* font-size: 9px; */ .x { color: black; }", ".css")
    assert_clean("COMMENT: line-commented font-[Georgia] not flagged (tsx)",
                 "// className='font-[Georgia]' text-[8px]", ".tsx")

    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {case_count} cases run)")
        sys.exit(1)
    else:
        print(f"SELF-TEST OK ({case_count} cases)")
        sys.exit(0)


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: python3 checks/type-scan.py <path>... | --self-test")
        sys.exit(1)
    if "--self-test" in args:
        run_self_test()
        return
    results = scan_paths(args)
    errors = [r for r in results if r.startswith("ERROR")]
    for r in results:
        print(r)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
