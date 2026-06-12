#!/usr/bin/env python3
"""
Token audit — checks/token-audit.py
Scans UI source files for raw colour / off-scale spacing / off-scale radius values
that should be replaced with design tokens.

Detection rules
───────────────
Rule          Controls    What is caught
TOK-1/COL     TOK-1       Raw hex #rrggbb / #rgb / #rrggbbaa in style contexts
              COL-1/2     Raw rgb()/rgba() and hsl()/hsla() calls in style contexts
                          Raw oklch() calls in style contexts
                          Standalone CSS named colours (white|black|red|green|blue|
                            gray|grey|orange|yellow|purple) as CSS property values
              COL-1/2     Tailwind palette utility classes that bypass the semantic layer
                            e.g. bg-red-500, text-blue-600, border-gray-200
TOK-2                     margin/padding/gap/top/left/right/bottom with raw px/rem values
                            not in the shadcn default spacing scale
                            Scale: {0,1,2,4,6,8,10,12,14,16,20,24,28,32,36,40,44,48,
                                    56,64,80,96,112,128} px (rem equivalents at 16px base)
                            Passes: var(--…), auto, 0, percentages, viewport units
TOK-3                     border-radius with raw px/rem values not in
                            {0,2,4,6,8,12,16,24,9999} px

Exemptions
──────────
Token-definition blocks are exempt from all raw-value rules.  A block is:
  (a) A contiguous run of CSS custom-property declarations (--*: value;) — the
      scanner detects an open block when it sees "--<name>:" and closes it when
      it finds a non-blank line that is neither a comment nor a --*: declaration.
  (b) An explicit /* tfx-tokens */ … /* /tfx-tokens */ region.

L1 waiver handling
──────────────────
TOK and COL controls are all L1.  An inline `tfx-waive TOK-…` or `tfx-waive COL-…`
comment does NOT suppress the violation; it downgrades the output line to:
  ERROR <file>:<line> [<CTL-ID>][waiver-claimed] <found> — verify approver in decision record
and still exits 1.  Decision-record lookup is out of scope; humans close that loop.

Output
──────
ERROR <file>:<line> [<CTL-ID>] <found> — suggest: <nearest token or scale value>
Exit 0 and print nothing (or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any violation.
"""

import os
import re
import sys

# ── Target extensions ──────────────────────────────────────────────────────────
TARGET_EXTENSIONS = {".css", ".html", ".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte"}

# ── Spacing scale (shadcn default, px) ────────────────────────────────────────
SPACING_SCALE_PX = {
    0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48,
    56, 64, 80, 96, 112, 128
}
# rem equivalents (16px base, rounded to 4 decimal places for float comparison)
SPACING_SCALE_REM = {round(px / 16, 4) for px in SPACING_SCALE_PX}

# ── Radius scale (shadcn default, px) ─────────────────────────────────────────
RADIUS_SCALE_PX = {0, 2, 4, 6, 8, 12, 16, 24, 9999}
RADIUS_SCALE_REM = {round(px / 16, 4) for px in RADIUS_SCALE_PX}

# ── Named colours that are suspicious as CSS values ───────────────────────────
NAMED_COLOUR_RE = re.compile(
    r"(?<!['\"\w-])(white|black|red|green|blue|gray|grey|orange|yellow|purple)(?!['\"\w-])",
    re.IGNORECASE
)

# ── Raw colour regexes ─────────────────────────────────────────────────────────
HEX_COLOUR_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b")
RGB_COLOUR_RE = re.compile(r"\brgba?\s*\(")
HSL_COLOUR_RE = re.compile(r"\bhsla?\s*\(")
OKLCH_COLOUR_RE = re.compile(r"\boklch\s*\(")

# ── Spacing properties ─────────────────────────────────────────────────────────
SPACING_PROP_RE = re.compile(
    r"\b(margin(?:-(?:top|right|bottom|left|block|inline|block-start|block-end|"
    r"inline-start|inline-end))?|padding(?:-(?:top|right|bottom|left|block|inline|"
    r"block-start|block-end|inline-start|inline-end))?|gap|column-gap|row-gap|"
    r"top|left|right|bottom)\s*:",
    re.IGNORECASE
)

# ── Radius property ────────────────────────────────────────────────────────────
RADIUS_PROP_RE = re.compile(
    r"\bborder-radius(?:-(?:top-left|top-right|bottom-right|bottom-left|"
    r"start-start|start-end|end-end|end-start))?\s*:",
    re.IGNORECASE
)

# ── Tailwind palette bypass ────────────────────────────────────────────────────
TAILWIND_PALETTE_RE = re.compile(
    r'\b(bg|text|border)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|'
    r'blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b'
)

# ── var() passthrough ──────────────────────────────────────────────────────────
VAR_RE = re.compile(r"var\s*\(--")

# ── Numeric value extractor ────────────────────────────────────────────────────
NUM_VAL_RE = re.compile(r"([\d.]+)\s*(px|rem)\b")

# ── Waiver marker ─────────────────────────────────────────────────────────────
WAIVER_RE = re.compile(r"tfx-waive\s+(TOK-\d+|COL-\d+)", re.IGNORECASE)

# ── Custom property declaration (token definition) ────────────────────────────
CUSTOM_PROP_RE = re.compile(r"^\s*--[\w-]+\s*:")

# ── tfx-tokens region markers ─────────────────────────────────────────────────
TFX_TOKENS_OPEN_RE = re.compile(r"/\*\s*tfx-tokens\s*\*/")
TFX_TOKENS_CLOSE_RE = re.compile(r"/\*\s*/tfx-tokens\s*\*/")


def nearest_spacing(value_px):
    """Return the nearest value in SPACING_SCALE_PX."""
    return min(SPACING_SCALE_PX, key=lambda s: abs(s - value_px))


def nearest_radius(value_px):
    """Return the nearest value in RADIUS_SCALE_PX."""
    return min(RADIUS_SCALE_PX, key=lambda r: abs(r - value_px))


def is_on_spacing_scale(num_str, unit):
    """Return True if the numeric value is on the spacing scale."""
    try:
        val = float(num_str)
    except ValueError:
        return True  # can't parse → don't flag
    if unit == "px":
        return round(val) in SPACING_SCALE_PX
    elif unit == "rem":
        return round(val, 4) in SPACING_SCALE_REM
    return True


def is_on_radius_scale(num_str, unit):
    """Return True if the numeric value is on the radius scale."""
    try:
        val = float(num_str)
    except ValueError:
        return True
    if unit == "px":
        return round(val) in RADIUS_SCALE_PX
    elif unit == "rem":
        return round(val, 4) in RADIUS_SCALE_REM
    return True


def parse_passes(value_fragment):
    """Return True if a CSS value fragment unconditionally passes (var/auto/0/pct/viewport)."""
    stripped = value_fragment.strip()
    if VAR_RE.search(stripped):
        return True
    if stripped in ("0", "auto", "none", "inherit", "initial", "unset", "revert"):
        return True
    if re.match(r"^0\s*(px|rem|em|%|vh|vw|vmin|vmax)?$", stripped):
        return True
    if "%" in stripped or "vh" in stripped or "vw" in stripped or "vmin" in stripped or "vmax" in stripped:
        return True
    return False


class StyleContextTracker:
    """
    Tracks whether the current line of a file is in a style context.

    Style contexts:
      - Entire .css files
      - <style>…</style> blocks in HTML/Vue/Svelte
      - style="…" attribute spans (single-line; multi-line not handled for now)
      - Tagged template literals: css`…`, styled.xxx`…`, createGlobalStyle`…`

    Also tracks token-definition blocks for exemption.
    """

    def __init__(self, file_ext):
        self.file_ext = file_ext
        self.in_style_tag = file_ext == ".css"
        self.in_template_literal = False
        self.in_tfx_tokens_region = False
        self.in_custom_prop_block = False

    def update(self, line):
        """Update state from the given raw line. Returns (in_style, in_token_def)."""
        # tfx-tokens region markers (can appear anywhere in file)
        if TFX_TOKENS_OPEN_RE.search(line):
            self.in_tfx_tokens_region = True
        if TFX_TOKENS_CLOSE_RE.search(line):
            self.in_tfx_tokens_region = False
            return (self.in_style_tag or self.in_template_literal, True)

        # HTML/Vue/Svelte: <style> tags
        if self.file_ext in (".html", ".vue", ".svelte"):
            if re.search(r"<style\b", line, re.IGNORECASE):
                self.in_style_tag = True
            if re.search(r"</style\s*>", line, re.IGNORECASE):
                self.in_style_tag = False
                return (False, False)

        # JS/TS/JSX/TSX: tagged template literals (css`...`, styled.x`...`)
        if self.file_ext in (".js", ".ts", ".jsx", ".tsx"):
            if re.search(r"\b(?:css|styled\.\w+|createGlobalStyle|injectGlobal)\s*`", line):
                self.in_template_literal = True
            if self.in_template_literal and "`" in line and not re.search(
                r"\b(?:css|styled\.\w+|createGlobalStyle|injectGlobal)\s*`", line
            ):
                # closing backtick ends the template literal
                # (simplified: treats the line with the closing ` as still in context)
                pass
            if self.in_template_literal and line.strip() == "`":
                self.in_template_literal = False

        in_style = self.in_style_tag or self.in_template_literal

        # Token-definition block tracking (only meaningful inside style contexts)
        if in_style or self.file_ext == ".css":
            if CUSTOM_PROP_RE.match(line):
                self.in_custom_prop_block = True
            else:
                stripped = line.strip()
                # Allow blank lines and comment lines inside a custom-prop block
                if stripped and not stripped.startswith("/*") and not stripped.startswith("//") and stripped != "}":
                    # If not a custom property, close the block
                    if not CUSTOM_PROP_RE.match(line):
                        self.in_custom_prop_block = False

        in_token_def = self.in_tfx_tokens_region or self.in_custom_prop_block
        return (in_style, in_token_def)


def extract_waived_ctl(line):
    """Return the control id from a tfx-waive marker, or None."""
    m = WAIVER_RE.search(line)
    if m:
        return m.group(1).upper()
    return None


def _strip_block_comments(line, in_comment):
    """
    Return a version of `line` with /* ... */ block-comment spans replaced by
    spaces.  `in_comment` is True if the previous line ended inside a block
    comment.  Only handles CSS-style /* */ comments (not // or <!-- -->).
    """
    result = []
    i = 0
    n = len(line)
    while i < n:
        if in_comment:
            # Look for end of block comment
            end = line.find("*/", i)
            if end == -1:
                # Entire rest of line is comment
                break
            else:
                i = end + 2
                in_comment = False
        else:
            # Look for start of block comment
            start = line.find("/*", i)
            if start == -1:
                result.append(line[i:])
                break
            else:
                result.append(line[i:start])
                i = start + 2
                in_comment = True
    return "".join(result)


def _ends_in_block_comment(line, in_comment):
    """
    Return True if `line` ends inside a /* ... */ block comment.
    """
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


def check_file(filepath):
    """
    Scan a single file and return a list of error strings.
    Each string is formatted: ERROR <file>:<line> [CTL-ID] <found> — suggest: <...>
    """
    errors = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in TARGET_EXTENSIONS:
        return errors

    try:
        with open(filepath, encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()
    except OSError as exc:
        errors.append(f"ERROR {filepath}: cannot read file — {exc}")
        return errors

    rel = os.path.relpath(filepath)
    ctx = StyleContextTracker(ext)
    in_block_comment = False  # tracks multi-line /* ... */ comments

    for lineno, raw_line in enumerate(lines, start=1):
        line = raw_line.rstrip("\n")
        in_style, in_token_def = ctx.update(line)

        # Detect inline-style attribute for HTML (single line only)
        has_inline_style_attr = bool(re.search(r'\bstyle\s*=\s*["\']', line))
        effective_style = in_style or (ext in (".html", ".vue", ".svelte") and has_inline_style_attr)

        # Detect waiver claim on this line (before comment stripping, so inline
        # waiver markers can appear in comments)
        waived_ctl = extract_waived_ctl(line)

        def emit(ctl_id, found, suggest):
            """Emit one violation line (or waiver-claimed line)."""
            if waived_ctl and waived_ctl == ctl_id:
                errors.append(
                    f"ERROR {rel}:{lineno} [{ctl_id}][waiver-claimed] {found}"
                    f" — verify approver in decision record"
                )
            else:
                errors.append(
                    f"ERROR {rel}:{lineno} [{ctl_id}] {found} — suggest: {suggest}"
                )

        # ── Skip token-definition blocks ──────────────────────────────────────
        if in_token_def:
            continue

        # ── Build scan_line: strip comments so comment text is not flagged ────
        # Handle multi-line /* ... */ block comments.
        # Strategy: process the raw line character-by-character to remove spans
        # that are inside block comments.
        scan_line = _strip_block_comments(line, in_block_comment)
        # Update block comment state for next line
        in_block_comment = _ends_in_block_comment(line, in_block_comment)

        # Strip HTML comments (<!-- ... -->) from the scan line
        scan_line = re.sub(r"<!--.*?-->", "", scan_line)
        # Strip single-line // comments from JS/TS contexts
        if ext in (".js", ".ts", ".jsx", ".tsx"):
            scan_line = re.sub(r"//.*$", "", scan_line)

        # ── TOK-1 / COL-1 / COL-2 : raw colour checks (style contexts only) ──
        if effective_style:
            # Hex colours
            for m in HEX_COLOUR_RE.finditer(scan_line):
                emit("TOK-1", f"raw colour {m.group()}", "use a semantic token (var(--color-…))")

            # rgb/rgba
            for m in RGB_COLOUR_RE.finditer(scan_line):
                emit("TOK-1", f"raw colour {m.group().strip()}…", "use a semantic token (var(--color-…))")

            # hsl/hsla
            for m in HSL_COLOUR_RE.finditer(scan_line):
                emit("TOK-1", f"raw colour {m.group().strip()}…", "use a semantic token (var(--color-…))")

            # oklch
            for m in OKLCH_COLOUR_RE.finditer(scan_line):
                emit("TOK-1", f"raw colour {m.group().strip()}…", "use a semantic token (var(--color-…))")

            # Named colours as CSS property values
            # Must appear as a value (after a colon) or in a style attribute value
            # Look for pattern: property: ... named-colour ...
            named_col_ctx = re.sub(r"var\([^)]*\)", "", scan_line)  # strip var() refs
            named_col_ctx = re.sub(r"url\([^)]*\)", "", named_col_ctx)  # strip url()
            named_col_ctx = re.sub(r'"[^"]*"', '""', named_col_ctx)  # strip quoted strings
            named_col_ctx = re.sub(r"'[^']*'", "''", named_col_ctx)
            if re.search(r":\s*[^;{]*\b(?:white|black|red|green|blue|gray|grey|orange|yellow|purple)\b", named_col_ctx, re.IGNORECASE):
                for m in NAMED_COLOUR_RE.finditer(named_col_ctx):
                    # Make sure it's in a value context (preceded by a colon somewhere on the line)
                    before = named_col_ctx[:m.start()]
                    if ":" in before:
                        emit("TOK-1", f"named colour '{m.group()}'", "use a semantic token (var(--color-…))")

        # ── Tailwind palette bypass (all file types — applies in class= attributes and JSX) ──
        for m in TAILWIND_PALETTE_RE.finditer(scan_line):
            emit("COL-2", f"Tailwind palette class '{m.group()}'", "use a semantic token class (e.g. bg-primary, text-destructive)")

        # ── TOK-2 : spacing checks (style contexts only) ──────────────────────
        if effective_style:
            for prop_m in SPACING_PROP_RE.finditer(scan_line):
                # Extract the value portion after the colon
                value_start = prop_m.end()
                # Get rest of line up to ; or { or end
                rest = scan_line[value_start:]
                val_match = re.match(r"([^;{}]+)", rest)
                if not val_match:
                    continue
                value_str = val_match.group(1).strip()

                if parse_passes(value_str):
                    continue

                # Shorthand: split by spaces and check each token
                # e.g. "12px 24px" → check both
                # Remove calc() expressions
                value_str_clean = re.sub(r"calc\([^)]*\)", "0px", value_str)
                value_str_clean = re.sub(r"var\(--[^)]*\)", "0px", value_str_clean)

                parts = value_str_clean.split()
                for part in parts:
                    num_m = NUM_VAL_RE.match(part.strip())
                    if not num_m:
                        continue
                    num, unit = num_m.group(1), num_m.group(2)
                    try:
                        val_f = float(num)
                    except ValueError:
                        continue
                    if unit == "px":
                        val_px = round(val_f)
                        if val_px == 0:
                            continue
                        if val_px not in SPACING_SCALE_PX:
                            suggest_px = nearest_spacing(val_px)
                            emit("TOK-2", f"off-scale spacing {part}", f"{suggest_px}px or var(--space-…)")
                    elif unit == "rem":
                        val_px_equiv = round(val_f * 16)
                        if val_px_equiv == 0:
                            continue
                        if val_px_equiv not in SPACING_SCALE_PX:
                            suggest_px = nearest_spacing(val_px_equiv)
                            emit("TOK-2", f"off-scale spacing {part}", f"{suggest_px}px ({round(suggest_px/16,4)}rem) or var(--space-…)")

        # ── TOK-3 : border-radius checks (style contexts only) ────────────────
        if effective_style:
            for prop_m in RADIUS_PROP_RE.finditer(scan_line):
                value_start = prop_m.end()
                rest = scan_line[value_start:]
                val_match = re.match(r"([^;{}]+)", rest)
                if not val_match:
                    continue
                value_str = val_match.group(1).strip()

                if parse_passes(value_str):
                    continue

                value_str_clean = re.sub(r"calc\([^)]*\)", "0px", value_str)
                value_str_clean = re.sub(r"var\(--[^)]*\)", "0px", value_str_clean)

                # border-radius shorthand can have / for horizontal/vertical
                value_str_clean = value_str_clean.replace("/", " ")
                parts = value_str_clean.split()
                for part in parts:
                    num_m = NUM_VAL_RE.match(part.strip())
                    if not num_m:
                        continue
                    num, unit = num_m.group(1), num_m.group(2)
                    try:
                        val_f = float(num)
                    except ValueError:
                        continue
                    if unit == "px":
                        val_px = round(val_f)
                        if val_px == 0:
                            continue
                        if val_px not in RADIUS_SCALE_PX:
                            suggest_px = nearest_radius(val_px)
                            emit("TOK-3", f"off-scale radius {part}", f"{suggest_px}px or var(--radius-…)")
                    elif unit == "rem":
                        val_px_equiv = round(val_f * 16)
                        if val_px_equiv == 0:
                            continue
                        if val_px_equiv not in RADIUS_SCALE_PX:
                            suggest_px = nearest_radius(val_px_equiv)
                            emit("TOK-3", f"off-scale radius {part}", f"{suggest_px}px ({round(suggest_px/16,4)}rem) or var(--radius-…)")

    return errors


def scan_paths(paths):
    """Walk the given paths (files or directories) and collect all violations."""
    all_errors = []
    for p in paths:
        if os.path.isfile(p):
            all_errors.extend(check_file(p))
        elif os.path.isdir(p):
            for root, dirs, files in os.walk(p):
                # Skip hidden directories
                dirs[:] = [d for d in dirs if not d.startswith(".")]
                for fname in sorted(files):
                    ext = os.path.splitext(fname)[1].lower()
                    if ext in TARGET_EXTENSIONS:
                        all_errors.extend(check_file(os.path.join(root, fname)))
        else:
            print(f"ERROR token-audit: path not found: {p}")
            all_errors.append(f"ERROR token-audit: path not found: {p}")
    return all_errors


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    """
    Embedded self-test cases.  Prints SELF-TEST OK (N cases) and exits 0 on success,
    or prints failures and exits 1.
    """
    import tempfile

    failures = []
    case_count = 0

    def assert_violations(name, content, ext, expected_ctl_ids, expect_waiver_claimed=False):
        nonlocal case_count
        case_count += 1
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            errs = check_file(tf.name)
        os.unlink(tf.name)

        found_ctls = []
        for e in errs:
            # Extract [CTL-ID] or [CTL-ID][waiver-claimed]
            m = re.search(r"\[([A-Z0-9-]+)\](?:\[waiver-claimed\])?", e)
            if m:
                found_ctls.append(m.group(1))

        if expect_waiver_claimed:
            waiver_lines = [e for e in errs if "[waiver-claimed]" in e]
            if not waiver_lines:
                failures.append(f"FAIL {name}: expected waiver-claimed marker but got: {errs}")
            # Should still produce errors (exit 1 equivalent)
            if not errs:
                failures.append(f"FAIL {name}: expected errors with waiver-claimed but got none")
            return

        for ctl in expected_ctl_ids:
            if ctl not in found_ctls:
                failures.append(f"FAIL {name}: expected [{ctl}] violation — got: {errs}")

    def assert_clean(name, content, ext):
        nonlocal case_count
        case_count += 1
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            errs = check_file(tf.name)
        os.unlink(tf.name)
        if errs:
            failures.append(f"FAIL {name}: expected no violations — got: {errs}")

    # ── Case 1: raw hex colour caught (TOK-1) ──────────────────────────────────
    assert_violations(
        "raw hex colour",
        ".foo { color: #ff0000; }",
        ".css",
        ["TOK-1"]
    )

    # ── Case 2: rgb() caught (TOK-1) ───────────────────────────────────────────
    assert_violations(
        "rgb() colour",
        ".foo { background: rgb(255, 0, 0); }",
        ".css",
        ["TOK-1"]
    )

    # ── Case 3: named colour caught (TOK-1) ────────────────────────────────────
    assert_violations(
        "named colour",
        ".foo { color: red; }",
        ".css",
        ["TOK-1"]
    )

    # ── Case 4: token-block exemption holds — var() in :root is NOT flagged ────
    assert_clean(
        "token block exemption (custom property definitions)",
        ":root {\n  --color-brand: #0064FF;\n  --color-bg: #FFFFFF;\n}\n.foo { color: var(--color-brand); }\n",
        ".css"
    )

    # ── Case 5: off-scale spacing caught (TOK-2) ───────────────────────────────
    assert_violations(
        "off-scale spacing",
        ".foo { margin: 15px; }",
        ".css",
        ["TOK-2"]
    )

    # ── Case 6: on-scale spacing passes ────────────────────────────────────────
    assert_clean(
        "on-scale spacing",
        ".foo { margin: 16px; padding: 8px; gap: 24px; }",
        ".css"
    )

    # ── Case 7: off-scale radius caught (TOK-3) ────────────────────────────────
    assert_violations(
        "off-scale radius",
        ".foo { border-radius: 10px; }",
        ".css",
        ["TOK-3"]
    )

    # ── Case 8: on-scale radius passes ─────────────────────────────────────────
    assert_clean(
        "on-scale radius",
        ".foo { border-radius: 8px; }",
        ".css"
    )

    # ── Case 9: Tailwind palette class caught (COL-2) ──────────────────────────
    assert_violations(
        "tailwind palette class",
        '<button class="btn bg-red-500 text-white">Delete</button>',
        ".html",
        ["COL-2"]
    )

    # ── Case 10: waiver-claimed marker appears and still exits 1 ───────────────
    assert_violations(
        "waiver-claimed still errors",
        "/* tfx-waive TOK-1 reason=\"approved\" */ .foo { color: #ff0000; }",
        ".css",
        ["TOK-1"],
        expect_waiver_claimed=True
    )

    # ── Case 11: var() spacing passes ──────────────────────────────────────────
    assert_clean(
        "var() spacing passes",
        ".foo { margin: var(--space-4); padding: var(--spacing); }",
        ".css"
    )

    # ── Case 12: var() radius passes ───────────────────────────────────────────
    assert_clean(
        "var() radius passes",
        ".foo { border-radius: var(--radius-md); }",
        ".css"
    )

    # ── Case 13: tfx-tokens region exempt ──────────────────────────────────────
    assert_clean(
        "tfx-tokens region exemption",
        "/* tfx-tokens */\n.root { --c: #ff0000; }\n/* /tfx-tokens */\n.foo { color: var(--c); }\n",
        ".css"
    )

    # ── Case 14: hsl() caught (TOK-1) ─────────────────────────────────────────
    assert_violations(
        "hsl() colour",
        ".foo { background: hsl(200, 100%, 50%); }",
        ".css",
        ["TOK-1"]
    )

    # ── Case 15: oklch() caught (TOK-1) ───────────────────────────────────────
    assert_violations(
        "oklch() colour",
        ".foo { color: oklch(0.7 0.15 200); }",
        ".css",
        ["TOK-1"]
    )

    # ── Case 16: non-style context — hex in HTML text not flagged ─────────────
    assert_clean(
        "hex in non-style context (HTML text)",
        "<p>The colour code #ff0000 is red.</p>",
        ".html"
    )

    # ── Case 17: inline style attribute catches hex ────────────────────────────
    assert_violations(
        "inline style attribute",
        '<div style="color: #ff0000;">text</div>',
        ".html",
        ["TOK-1"]
    )

    # ── Case 18: zero value passes spacing check ───────────────────────────────
    assert_clean(
        "zero spacing passes",
        ".foo { margin: 0; padding: 0px; }",
        ".css"
    )

    # ── Report ─────────────────────────────────────────────────────────────────
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
        print("Usage: python3 checks/token-audit.py <path>... | --self-test")
        sys.exit(1)

    if "--self-test" in args:
        run_self_test()
        return  # run_self_test calls sys.exit

    errors = scan_paths(args)

    if errors:
        for e in errors:
            print(e)
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
