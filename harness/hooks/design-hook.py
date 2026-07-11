#!/usr/bin/env python3
"""
design-hook.py — run the design detector automatically when an agent edits a UI file.

A Claude Code PostToolUse hook. It reads the hook event on stdin, and when the edited
file is a UI file, runs `checks/detect.py --json <file>` (the curated, low-false-
positive profile — token-audit, contrast, a11y-static, TYP-1) and, only on NEW
findings, feeds ONE short reminder back to the agent. It never blocks an edit
(PostToolUse cannot block) and it stays silent on clean edits and non-UI files.

Contract (see hooks/README.md for the schema source):
- Input:  the PostToolUse event JSON on stdin — {tool_name, tool_input:{file_path,…}, …}.
- Output: on findings, exit 0 with JSON on stdout carrying
            {"hookSpecificOutput": {"hookEventName": "PostToolUse",
                                     "additionalContext": "<reminder>"}, ...}
          Claude Code injects additionalContext into the agent's context as a system
          reminder. On a clean edit / non-UI file / kill-switch, print nothing.
- Exit:   always 0. This hook REMINDS; it never rejects an edit.

Honest enforcement (checks/README.md): the hook runs only the curated subset, not the
full catalog. Every reminder says so. A clean edit means "the built curated checks
found nothing", never "the design is compliant". A detector failure is reported as a
failure — never silently swallowed into a fake pass.

Quiet by design:
- File filter first — non-UI extensions exit 0 immediately (this runs on every edit).
- New-findings memory — a finding already announced for a file is not re-announced on
  a later edit to that file; it re-announces only when its flagged line content changes
  (state keyed on control + source-line text, in the hook's own cache dir).
- Kill switch — TFX_HOOK_DISABLED=1 → exit 0, silent.

Self-test: `python3 hooks/design-hook.py --self-test` → exit 0 (pure logic, no real
detector subprocess).
"""

import hashlib
import json
import os
import subprocess
import sys

HOOK_DIR = os.path.dirname(os.path.abspath(__file__))
HARNESS_ROOT = os.path.dirname(HOOK_DIR)
DETECT = os.path.join(HARNESS_ROOT, "checks", "detect.py")

# The file types the wrapped checkers scan (their TARGET_EXTENSIONS), minus
# .md/.mdx: content files are the content-lint pass's concern, not the hook's.
UI_EXTENSIONS = {".tsx", ".jsx", ".js", ".ts", ".css", ".html", ".vue", ".svelte"}

# A single detector run on one file is fast; a hang is a failure, not a silent pass.
DETECT_TIMEOUT = 120

# detect.py exit contract (059): 0 clean · 2 findings · 1 tool failure.
DETECT_CLEAN = 0
DETECT_FINDINGS = 2


# ── Event parsing ────────────────────────────────────────────────────────────────

def extract_paths(event):
    """Pull edited file path(s) out of a PostToolUse event. Edit/Write/MultiEdit all
    carry the target in tool_input.file_path; unknown shapes yield no paths."""
    if not isinstance(event, dict):
        return []
    ti = event.get("tool_input")
    if not isinstance(ti, dict):
        return []
    paths = []
    fp = ti.get("file_path")
    if isinstance(fp, str) and fp:
        paths.append(fp)
    return paths


def is_ui_file(path):
    return os.path.splitext(path)[1].lower() in UI_EXTENSIONS


# ── New-findings memory ──────────────────────────────────────────────────────────

def state_path():
    """The hook's own cache file (not the target repo, so it is never committed).
    Keyed globally; per-file entries live inside it."""
    base = os.environ.get("XDG_CACHE_HOME") or os.path.join(
        os.path.expanduser("~"), ".cache")
    d = os.path.join(base, "tfx-design-hook")
    try:
        os.makedirs(d, exist_ok=True)
    except OSError:
        d = os.path.join(os.environ.get("TMPDIR", "/tmp"), "tfx-design-hook")
        os.makedirs(d, exist_ok=True)
    return os.path.join(d, "state.json")


def load_state(path):
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def save_state(path, state):
    try:
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(state, fh)
    except OSError:
        pass  # memory is best-effort; losing it only risks a repeat reminder


def finding_fingerprint(finding, file_lines):
    """Stable id for a finding: its control plus the flagged source line's text. Keying
    on line TEXT (not line number) means an unrelated edit that shifts line numbers keeps
    the same fingerprint (suppressed), while editing the flagged line changes it
    (re-announced)."""
    control = finding.get("control") or "op"
    line = finding.get("line")
    if isinstance(line, int) and 1 <= line <= len(file_lines):
        content = file_lines[line - 1].strip()
    else:
        content = (finding.get("message") or "").strip()
    raw = f"{control}\x1f{content}".encode("utf-8", "replace")
    return hashlib.sha1(raw).hexdigest()


# ── Detector ───────────────────────────────────────────────────────────────────

def run_detect(path):
    """Run `detect.py --json <path>`. Returns (exit_code, report_dict_or_None)."""
    argv = [sys.executable, DETECT, "--json", path]
    try:
        proc = subprocess.run(argv, capture_output=True, text=True,
                              timeout=DETECT_TIMEOUT)
    except (subprocess.TimeoutExpired, OSError):
        return 1, None
    try:
        report = json.loads(proc.stdout)
    except ValueError:
        report = None
    return proc.returncode, report


# ── Reminder text ────────────────────────────────────────────────────────────────

def _display_path(path):
    try:
        return os.path.relpath(path)
    except ValueError:
        return path


def build_reminder(report, new_findings, path):
    """One short reminder: count, the top NEW finding (control + file:line + the
    detector's own fix direction), and how to see the full list. Honest: names the
    curated subset, never implies full-catalog compliance."""
    total = len(report.get("findings", []))
    disp = _display_path(path)
    # Prefer a control-bearing finding for the headline; fall back to the first.
    top = next((f for f in new_findings if f.get("control")), new_findings[0])
    control = top.get("control") or "(operational)"
    loc = ""
    if top.get("file") and top.get("line"):
        loc = f" {_display_path(top['file'])}:{top['line']}"
    msg = (top.get("message") or "").strip()
    lines = [
        f"TFX design check: {total} finding(s) on {disp} "
        f"(curated subset — token/contrast/a11y/TYP-1 only, NOT the full catalog).",
        f"Top: [{control}]{loc} — {msg}" if msg else f"Top: [{control}]{loc}",
        f"Full list: `python3 checks/detect.py {disp}` (add --all for the wider set). "
        f"This checks a subset; it is not a whole-catalog pass.",
    ]
    return "\n".join(lines)


def build_failure_notice(path):
    """Detector broke — honest, never a fake pass, never blocking."""
    disp = _display_path(path)
    return (
        f"TFX design check could not run on {disp} — the detector exited with an error. "
        f"This is NOT a pass: re-run `python3 checks/detect.py {disp}` or report the "
        f"detector failure. Nothing was verified.")


# ── Core (pure, detector + state injected for testability) ─────────────────────────

def process_event(event, detect_fn, get_state, set_state, read_lines):
    """Return the reminder string to feed the agent, or None to stay silent.

    detect_fn(path) -> (exit_code, report_or_None)
    get_state(path) -> list[str] fingerprints previously announced for path
    set_state(path, fps) -> persist the current fingerprint list for path
    read_lines(path) -> list[str] source lines of path (for line-content fingerprints)
    """
    if os.environ.get("TFX_HOOK_DISABLED") == "1":
        return None

    ui_paths = [p for p in extract_paths(event) if is_ui_file(p)]
    if not ui_paths:
        return None  # non-UI (or no path): silent and fast — this runs on every edit

    messages = []
    for path in ui_paths:
        rc, report = detect_fn(path)

        if rc == DETECT_CLEAN:
            set_state(path, [])  # clean now → forget prior findings for this file
            continue

        if rc == DETECT_FINDINGS and report:
            findings = report.get("findings", []) or []
            if not findings:
                set_state(path, [])
                continue
            file_lines = read_lines(path)
            fps = [finding_fingerprint(f, file_lines) for f in findings]
            prev = set(get_state(path))
            new = [(f, fp) for f, fp in zip(findings, fps) if fp not in prev]
            set_state(path, fps)  # replace: unchanged suppressed, gone ones dropped
            if new:
                messages.append(build_reminder(report, [f for f, _ in new], path))
            continue

        # rc == 1 (or anything unexpected): detector failure — report, never fake a pass.
        messages.append(build_failure_notice(path))

    if not messages:
        return None
    return "\n\n".join(messages)


# ── I/O wiring ───────────────────────────────────────────────────────────────────

def _read_lines(path):
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            return fh.read().splitlines()
    except OSError:
        return []


def emit(message):
    """PostToolUse: exit 0 + JSON stdout; additionalContext is injected into the agent's
    context. suppressOutput keeps the raw JSON out of the transcript UI."""
    out = {
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": message,
        },
        "suppressOutput": True,
    }
    print(json.dumps(out))


def main():
    if "--self-test" in sys.argv[1:]:
        sys.exit(run_self_test())

    try:
        event = json.load(sys.stdin)
    except (ValueError, OSError):
        return 0  # unparseable event: never block, never crash the tool run

    sp = state_path()
    state = load_state(sp)

    def get_state(path):
        v = state.get(os.path.abspath(path))
        return v if isinstance(v, list) else []

    def set_state(path, fps):
        state[os.path.abspath(path)] = fps

    message = process_event(event, run_detect, get_state, set_state, _read_lines)
    save_state(sp, state)

    if message:
        emit(message)
    return 0


# ── Self-test (pure — no real detector subprocess) ─────────────────────────────────

def run_self_test():
    import tempfile

    failures = []
    n = 0

    def check(name, cond):
        nonlocal n
        n += 1
        if not cond:
            failures.append(f"FAIL {name}")

    # A tiny in-memory state harness for the pure core.
    def make_env(initial=None):
        store = dict(initial or {})

        def get_state(path):
            return list(store.get(os.path.abspath(path), []))

        def set_state(path, fps):
            store[os.path.abspath(path)] = list(fps)

        return store, get_state, set_state

    FINDINGS_REPORT = {
        "findings": [{"check": "token-audit", "control": "TOK-1",
                      "file": "app/x.tsx", "line": 1,
                      "message": "raw colour '#ff0000' in arbitrary value — suggest: use a token"}],
        "counts": {"total": 1}, "profile": "curated", "exit": 2,
    }

    def clean_detect(_p):
        return (0, {"findings": [], "counts": {"total": 0}, "exit": 0})

    def findings_detect(_p):
        return (2, FINDINGS_REPORT)

    def crash_detect(_p):
        return (1, None)

    lines_one = lambda _p: ['<div className="bg-[#ff0000]" />']

    os.environ.pop("TFX_HOOK_DISABLED", None)

    # 1. Non-UI file → silent (detector never consulted).
    called = {"n": 0}

    def tracking_detect(_p):
        called["n"] += 1
        return clean_detect(_p)

    _store, g, s = make_env()
    m = process_event({"tool_input": {"file_path": "app/util.py"}}, tracking_detect, g, s, lines_one)
    check("non-UI file → silent", m is None)
    check("non-UI file → detector not run", called["n"] == 0)

    # 1b. .ts file → detector IS invoked (parity with the checkers' TARGET_EXTENSIONS).
    called_ts = {"n": 0}

    def tracking_detect_ts(_p):
        called_ts["n"] += 1
        return clean_detect(_p)

    _store, g, s = make_env()
    m = process_event({"tool_input": {"file_path": "app/tokens.ts"}}, tracking_detect_ts, g, s, lines_one)
    check(".ts file → detector invoked", called_ts["n"] == 1)

    # 2. Clean UI file → silent, exit 0 semantics.
    _store, g, s = make_env()
    m = process_event({"tool_input": {"file_path": "app/ok.tsx"}}, clean_detect, g, s, lines_one)
    check("clean UI file → silent", m is None)

    # 3. Findings → a reminder naming the control, file:line, count, and detect.py.
    _store, g, s = make_env()
    m = process_event({"tool_input": {"file_path": "app/x.tsx"}}, findings_detect, g, s, lines_one)
    check("findings → reminder produced", isinstance(m, str) and bool(m))
    check("reminder names the control (TOK-1)", m is not None and "TOK-1" in m)
    check("reminder carries file:line", m is not None and "app/x.tsx:1" in m)
    check("reminder states the finding count", m is not None and "1 finding" in m)
    check("reminder points at detect.py for the full list", m is not None and "detect.py" in m)

    # 4. Detector crash → honest notice, never a fake pass, no reminder of compliance.
    _store, g, s = make_env()
    m = process_event({"tool_input": {"file_path": "app/x.tsx"}}, crash_detect, g, s, lines_one)
    check("detector crash → notice produced", isinstance(m, str) and bool(m))
    check("crash notice is honest (NOT a pass)", m is not None and "NOT a pass" in m)
    check("crash notice never claims a pass/compliant", m is not None
          and "passed" not in m.lower() and "compliant" not in m.lower())

    # 5. Kill switch → silent regardless of findings.
    os.environ["TFX_HOOK_DISABLED"] = "1"
    _store, g, s = make_env()
    m = process_event({"tool_input": {"file_path": "app/x.tsx"}}, findings_detect, g, s, lines_one)
    check("kill switch → silent even with findings", m is None)
    os.environ.pop("TFX_HOOK_DISABLED", None)

    # 6. Repeat edit of an UNCHANGED finding → no re-announcement.
    store, g, s = make_env()
    ev = {"tool_input": {"file_path": "app/x.tsx"}}
    m1 = process_event(ev, findings_detect, g, s, lines_one)
    m2 = process_event(ev, findings_detect, g, s, lines_one)
    check("first edit announces", isinstance(m1, str) and bool(m1))
    check("repeat edit of unchanged finding → silent", m2 is None)

    # 7. Same finding but the flagged LINE CONTENT changed → re-announce.
    store, g, s = make_env()
    lines_a = lambda _p: ['<div className="bg-[#ff0000]" />']
    lines_b = lambda _p: ['<div className="bg-[#00ff00]" />']  # edited the flagged line
    m1 = process_event(ev, findings_detect, g, s, lines_a)
    m2 = process_event(ev, findings_detect, g, s, lines_b)
    check("changed flagged-line content → re-announced", isinstance(m2, str) and bool(m2))

    # 8. A file that goes clean after having findings → silent, and memory cleared.
    store, g, s = make_env()
    process_event(ev, findings_detect, g, s, lines_one)
    m = process_event(ev, clean_detect, g, s, lines_one)
    check("findings → clean transition is silent", m is None)
    check("clean transition clears memory", g("app/x.tsx") == [])

    # 9. Fingerprint stability — line-number shift with identical text is suppressed.
    fp_at_1 = finding_fingerprint({"control": "TOK-1", "line": 1, "message": "m"},
                                  ["FLAG", "other"])
    fp_at_2 = finding_fingerprint({"control": "TOK-1", "line": 2, "message": "m"},
                                  ["other", "FLAG"])
    check("fingerprint keyed on line TEXT, not number", fp_at_1 == fp_at_2)
    fp_diff = finding_fingerprint({"control": "TOK-1", "line": 1, "message": "m"},
                                  ["DIFFERENT"])
    check("fingerprint changes when flagged text changes", fp_at_1 != fp_diff)

    # 10. Path extraction + UI filter.
    check("extract_paths reads tool_input.file_path",
          extract_paths({"tool_input": {"file_path": "a.tsx"}}) == ["a.tsx"])
    check("extract_paths tolerates missing input", extract_paths({}) == [])
    check("is_ui_file true for .tsx/.css/.svelte",
          is_ui_file("a.tsx") and is_ui_file("b.css") and is_ui_file("c.svelte"))
    check("is_ui_file true for .ts/.js",
          is_ui_file("a.ts") and is_ui_file("b.js"))
    check("is_ui_file false for .py/.md/.json",
          not is_ui_file("a.py") and not is_ui_file("b.md") and not is_ui_file("c.json"))

    # 11. Reminder honesty — never implies whole-catalog compliance.
    _store, g, s = make_env()
    m = process_event(ev, findings_detect, g, s, lines_one)
    check("reminder names the curated subset", "curated subset" in m)
    check("reminder disclaims full-catalog compliance",
          "NOT the full catalog" in m or "not a whole-catalog pass" in m)

    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {n} cases run)")
        return 1
    print(f"SELF-TEST OK ({n} cases)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
