#!/usr/bin/env python3
"""
Golden-task scorer — evals/score.py
Runs the deterministic assertions in a golden task YAML against the repo.

Usage
─────
  python3 evals/score.py <task.yaml>     score one task
  python3 evals/score.py --self-test     run embedded self-test cases

Task YAML schema
────────────────
  id: <task id>
  brief: <the prompt the task was / will be run with>
  traps: [..]                # documentation only — what the task is testing for
  artifacts:
    record: <path>           # decision record
    page: <path>             # produced page
    screenshots_dir: <path>  # screenshot evidence directory
  assertions: [..]           # list of assertion mappings (four types below)

Assertion types (exactly these four — adding more is a plan STOP condition)
──────────────────────────────────────────────────────────────────────────
  {type: file_exists, path}
  {type: grep, path, pattern, expect: present|absent}   # re.MULTILINE regex
  {type: command, run, exit: 0|1}                       # whitelist: run must
                                                        #   start "python3 checks/"
  {type: count, path, pattern, min}                     # regex match count ≥ min

Paths are relative to the repo root (absolute paths also accepted, used by the
self-test fixtures). Commands execute with cwd = repo root.

Output
──────
Exit 0 and print "PASS <task-id>: N assertions" on success.
Exit 1 and print one "ERROR <task-id> (<assertion summary>): <message>" line
per failure. A missing artifact is a clear "artifact missing" error, never a
traceback.
"""

import os
import re
import shlex
import subprocess
import sys

try:
    import yaml
except ImportError:
    print("ERROR score.py: cannot import yaml — install pyyaml")
    sys.exit(1)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ASSERTION_TYPES = {"file_exists", "grep", "command", "count"}
COMMAND_WHITELIST_PREFIX = "python3 checks/"

REQUIRED_TASK_FIELDS = ["id", "brief", "traps", "artifacts", "assertions"]
REQUIRED_ARTIFACT_FIELDS = ["record", "page", "screenshots_dir"]


# ── Path + file helpers ────────────────────────────────────────────────────────

def resolve(path):
    if os.path.isabs(path):
        return path
    return os.path.join(REPO_ROOT, path)


def read_text(path):
    """Return (text, error_message). error_message is None on success."""
    full = resolve(path)
    if not os.path.isfile(full):
        return None, f"artifact missing — file '{path}' not found"
    try:
        with open(full, encoding="utf-8") as fh:
            return fh.read(), None
    except OSError as exc:
        return None, f"cannot read '{path}': {exc}"


def compile_pattern(pattern):
    """Return (compiled_regex, error_message)."""
    try:
        return re.compile(pattern, re.MULTILINE), None
    except re.error as exc:
        return None, f"invalid regex '{pattern}': {exc}"


# ── Schema validation ──────────────────────────────────────────────────────────

def validate_task(task):
    """Return a list of error message strings (empty = valid)."""
    errs = []
    if not isinstance(task, dict):
        return ["task YAML is not a mapping"]

    for field in REQUIRED_TASK_FIELDS:
        if field not in task:
            errs.append(f"missing required field '{field}'")
    if errs:
        return errs

    if not isinstance(task["traps"], list):
        errs.append("'traps' must be a list")
    artifacts = task["artifacts"]
    if not isinstance(artifacts, dict):
        errs.append("'artifacts' must be a mapping")
    else:
        for field in REQUIRED_ARTIFACT_FIELDS:
            if field not in artifacts:
                errs.append(f"artifacts missing required field '{field}'")
    assertions = task["assertions"]
    if not isinstance(assertions, list) or len(assertions) == 0:
        errs.append("'assertions' must be a non-empty list")
        return errs

    for idx, a in enumerate(assertions):
        loc = f"assertion {idx}"
        if not isinstance(a, dict):
            errs.append(f"{loc}: not a mapping")
            continue
        atype = a.get("type")
        if atype not in ASSERTION_TYPES:
            errs.append(f"{loc}: unknown type '{atype}' — allowed: {sorted(ASSERTION_TYPES)}")
            continue
        if atype == "file_exists":
            if "path" not in a:
                errs.append(f"{loc} (file_exists): missing 'path'")
        elif atype == "grep":
            for field in ("path", "pattern", "expect"):
                if field not in a:
                    errs.append(f"{loc} (grep): missing '{field}'")
            if a.get("expect") not in (None, "present", "absent"):
                errs.append(f"{loc} (grep): 'expect' must be present|absent, got '{a.get('expect')}'")
        elif atype == "command":
            for field in ("run", "exit"):
                if field not in a:
                    errs.append(f"{loc} (command): missing '{field}'")
            if a.get("exit") not in (None, 0, 1):
                errs.append(f"{loc} (command): 'exit' must be 0 or 1, got '{a.get('exit')}'")
        elif atype == "count":
            for field in ("path", "pattern", "min"):
                if field not in a:
                    errs.append(f"{loc} (count): missing '{field}'")
            if "min" in a and not isinstance(a["min"], int):
                errs.append(f"{loc} (count): 'min' must be an integer")
    return errs


# ── Assertion runners — each returns (summary, error_message_or_None) ──────────

def run_file_exists(a):
    path = a["path"]
    summary = f"file_exists {path}"
    if not os.path.isfile(resolve(path)):
        return summary, f"artifact missing — file '{path}' not found"
    return summary, None


def run_grep(a):
    path, pattern, expect = a["path"], a["pattern"], a["expect"]
    summary = f"grep {path} /{pattern}/ {expect}"
    regex, err = compile_pattern(pattern)
    if err:
        return summary, err
    text, err = read_text(path)
    if err:
        return summary, err
    found = regex.search(text) is not None
    if expect == "present" and not found:
        return summary, f"pattern '{pattern}' not found (expected present)"
    if expect == "absent" and found:
        return summary, f"pattern '{pattern}' found (expected absent)"
    return summary, None


def run_command(a):
    run, expected_exit = a["run"], a["exit"]
    summary = f"command {run}"
    if not run.startswith(COMMAND_WHITELIST_PREFIX):
        return summary, (f"REFUSED — command not whitelisted "
                         f"(must start with '{COMMAND_WHITELIST_PREFIX}'); not executed")
    try:
        argv = shlex.split(run)
    except ValueError as exc:
        return summary, f"cannot parse command: {exc}"
    try:
        proc = subprocess.run(argv, cwd=REPO_ROOT,
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                              timeout=120)
    except FileNotFoundError as exc:
        return summary, f"command failed to start: {exc}"
    except subprocess.TimeoutExpired:
        return summary, "command timed out after 120s"
    if proc.returncode != expected_exit:
        return summary, f"exit {proc.returncode}, expected {expected_exit}"
    return summary, None


def run_count(a):
    path, pattern, minimum = a["path"], a["pattern"], a["min"]
    summary = f"count {path} /{pattern}/ min {minimum}"
    regex, err = compile_pattern(pattern)
    if err:
        return summary, err
    text, err = read_text(path)
    if err:
        return summary, err
    n = len(regex.findall(text))
    if n < minimum:
        return summary, f"found {n} matches, expected ≥ {minimum}"
    return summary, None


RUNNERS = {
    "file_exists": run_file_exists,
    "grep": run_grep,
    "command": run_command,
    "count": run_count,
}


# ── Scoring ────────────────────────────────────────────────────────────────────

def score_task(task):
    """Return a list of formatted ERROR lines (empty = all assertions pass)."""
    task_id = task.get("id", "<no id>") if isinstance(task, dict) else "<no id>"
    schema_errs = validate_task(task)
    if schema_errs:
        return [f"ERROR {task_id} (schema): {msg}" for msg in schema_errs]

    error_lines = []
    for a in task["assertions"]:
        summary, err = RUNNERS[a["type"]](a)
        if err:
            error_lines.append(f"ERROR {task_id} ({summary}): {err}")
    return error_lines


def score_file(task_path):
    """Load a task YAML, score it, print results, return exit code."""
    if not os.path.isfile(task_path):
        print(f"ERROR score.py: task file '{task_path}' not found")
        return 1
    try:
        with open(task_path, encoding="utf-8") as fh:
            task = yaml.safe_load(fh)
    except yaml.YAMLError as exc:
        print(f"ERROR score.py: YAML parse error in '{task_path}': {exc}")
        return 1

    error_lines = score_task(task)
    if error_lines:
        for line in error_lines:
            print(line)
        return 1
    print(f"PASS {task['id']}: {len(task['assertions'])} assertions")
    return 0


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    import tempfile

    failures = []
    case_count = 0

    fixture = tempfile.NamedTemporaryFile(
        suffix=".txt", mode="w", delete=False, encoding="utf-8")
    fixture.write("alpha line one\nVERDICT: pass\nbeta beta beta\n")
    fixture.close()
    fixture_path = fixture.name
    missing_path = fixture_path + ".does-not-exist"

    def make_task(assertions):
        return {
            "id": "self-test",
            "brief": "self-test fixture task",
            "traps": [],
            "artifacts": {"record": fixture_path, "page": fixture_path,
                          "screenshots_dir": os.path.dirname(fixture_path)},
            "assertions": assertions,
        }

    def expect_pass(name, assertions):
        nonlocal case_count
        case_count += 1
        errs = score_task(make_task(assertions))
        if errs:
            failures.append(f"FAIL {name}: expected pass, got: {errs}")

    def expect_error(name, assertions, must_contain):
        nonlocal case_count
        case_count += 1
        errs = score_task(make_task(assertions))
        if not errs:
            failures.append(f"FAIL {name}: expected an ERROR, got pass")
        elif not any(must_contain in e for e in errs):
            failures.append(f"FAIL {name}: expected error containing "
                            f"'{must_contain}', got: {errs}")

    # 1–2: file_exists pass / fail
    expect_pass("file_exists-pass",
                [{"type": "file_exists", "path": fixture_path}])
    expect_error("file_exists-fail",
                 [{"type": "file_exists", "path": missing_path}],
                 "artifact missing")

    # 3–6: grep present/absent, pass/fail (re.MULTILINE anchors)
    expect_pass("grep-present-pass",
                [{"type": "grep", "path": fixture_path,
                  "pattern": r"^VERDICT: pass$", "expect": "present"}])
    expect_error("grep-present-fail",
                 [{"type": "grep", "path": fixture_path,
                   "pattern": r"^VERDICT: fail$", "expect": "present"}],
                 "not found")
    expect_pass("grep-absent-pass",
                [{"type": "grep", "path": fixture_path,
                  "pattern": "gamma", "expect": "absent"}])
    expect_error("grep-absent-fail",
                 [{"type": "grep", "path": fixture_path,
                   "pattern": "alpha", "expect": "absent"}],
                 "expected absent")

    # 7: grep on a missing artifact — clear error, no traceback
    expect_error("grep-missing-artifact",
                 [{"type": "grep", "path": missing_path,
                   "pattern": "alpha", "expect": "present"}],
                 "artifact missing")

    # 8–9: count pass / fail
    expect_pass("count-pass",
                [{"type": "count", "path": fixture_path,
                  "pattern": "beta", "min": 3}])
    expect_error("count-fail",
                 [{"type": "count", "path": fixture_path,
                   "pattern": "beta", "min": 4}],
                 "found 3 matches")

    # 10–11: command — whitelisted check passes / exit-code mismatch fails
    expect_pass("command-pass",
                [{"type": "command", "run": "python3 checks/validate.py",
                  "exit": 0}])
    expect_error("command-exit-mismatch",
                 [{"type": "command", "run": "python3 checks/validate.py",
                   "exit": 1}],
                 "exit 0, expected 1")

    # 12: REQUIRED — non-whitelisted command is REFUSED, never executed
    expect_error("command-whitelist-refusal",
                 [{"type": "command", "run": "rm -rf /", "exit": 0}],
                 "REFUSED")

    # 13: unknown assertion type → schema error
    expect_error("unknown-assertion-type",
                 [{"type": "pixel_diff", "path": fixture_path}],
                 "unknown type")

    # 14: schema — missing required task field
    case_count += 1
    bad_task = make_task([{"type": "file_exists", "path": fixture_path}])
    del bad_task["brief"]
    errs = score_task(bad_task)
    if not any("missing required field 'brief'" in e for e in errs):
        failures.append(f"FAIL schema-missing-field: got: {errs}")

    # 15: schema — grep with invalid expect value
    expect_error("grep-bad-expect",
                 [{"type": "grep", "path": fixture_path,
                   "pattern": "alpha", "expect": "maybe"}],
                 "must be present|absent")

    os.unlink(fixture_path)

    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {case_count} cases run)")
        sys.exit(1)
    print(f"SELF-TEST OK ({case_count} cases)")
    sys.exit(0)


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: python3 evals/score.py <task.yaml> | --self-test")
        sys.exit(1)
    if "--self-test" in args:
        run_self_test()
        return  # run_self_test calls sys.exit
    sys.exit(score_file(args[0]))


if __name__ == "__main__":
    main()
