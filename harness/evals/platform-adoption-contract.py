#!/usr/bin/env python3
"""Executable AE1 contract for an explicit Platform product declaration."""

import os
import subprocess
import sys
from pathlib import Path


HARNESS_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = HARNESS_ROOT.parent
CHECKS_DIR = HARNESS_ROOT / "checks"
FIXTURE_ROOT = Path(__file__).resolve().parent / "fixtures" / "platform-adoption"
PASS_FILES = [FIXTURE_ROOT / "pass.css", FIXTURE_ROOT / "pass.tsx"]
FAIL_FILE = FIXTURE_ROOT / "fail.css"

GLOBAL_FILES = [
    HARNESS_ROOT / "standards" / "catalog.yaml",
    HARNESS_ROOT / "standards" / "controls" / "tok-1.md",
    HARNESS_ROOT / "standards" / "controls" / "tok-3.md",
    HARNESS_ROOT / "standards" / "controls" / "typ-1.md",
    HARNESS_ROOT / "standards" / "controls" / "col-2.md",
    HARNESS_ROOT / "standards" / "controls" / "cmp-1.md",
    HARNESS_ROOT / ".claude" / "skills" / "design" / "SKILL.md",
    HARNESS_ROOT / ".claude" / "skills" / "standards" / "SKILL.md",
    HARNESS_ROOT / ".claude" / "agents" / "evaluator.md",
]
T_AND_S_MARKERS = (
    "Plus Jakarta Sans",
    "Base UI",
    "Radix Colors",
    "shadcn",
    "Teacher & School",
    "TFX type scale",
    "#0064FF",
)

sys.path.insert(0, str(CHECKS_DIR))
from profile_context import PRODUCT, resolve_profile_context  # noqa: E402


def error(message):
    print(f"ERROR platform adoption contract: {message}")


def run_checker(script, paths):
    env = dict(os.environ)
    env.setdefault("PYTHONPYCACHEPREFIX", "/private/tmp/dxd-platform-contract-pycache")
    return subprocess.run(
        [sys.executable, str(CHECKS_DIR / script), *(str(path) for path in paths)],
        cwd=str(REPO_ROOT),
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )


def control_ids(output):
    ids = set()
    for line in output.splitlines():
        if not line.startswith("ERROR ") or "[" not in line:
            continue
        control = line.split("[", 1)[1].split("]", 1)[0]
        if control:
            ids.add(control)
    return ids


def main():
    failures = []

    for script in ("type-scan.py", "token-audit.py"):
        result = run_checker(script, PASS_FILES)
        ids = control_ids(result.stdout)
        if result.returncode != 0 or any(cid.startswith(("TYP-", "TOK-")) for cid in ids):
            failures.append(
                f"{script} rejected passing Platform fixture (exit {result.returncode}): "
                f"{result.stdout.strip() or result.stderr.strip()}"
            )

    type_fail = run_checker("type-scan.py", [FAIL_FILE])
    type_ids = control_ids(type_fail.stdout)
    if type_fail.returncode != 1 or not {"TYP-1", "TYP-3"}.issubset(type_ids):
        failures.append(
            "type-scan.py did not report TYP-1/TYP-3 for failing Platform fixture "
            f"(exit {type_fail.returncode}, ids {sorted(type_ids)}): {type_fail.stdout.strip()}"
        )

    token_fail = run_checker("token-audit.py", [FAIL_FILE])
    token_ids = control_ids(token_fail.stdout)
    if token_fail.returncode != 1 or not {"TOK-2", "TOK-3"}.issubset(token_ids):
        failures.append(
            "token-audit.py did not report TOK-2/TOK-3 for failing Platform fixture "
            f"(exit {token_fail.returncode}, ids {sorted(token_ids)}): {token_fail.stdout.strip()}"
        )

    context = resolve_profile_context(PASS_FILES, harness_root=str(HARNESS_ROOT))
    if context.domain != "platform":
        failures.append(f"resolved domain is {context.domain!r}, expected 'platform'")
    if context.compatibility_fallback:
        failures.append("explicit Platform context used the T&S compatibility fallback")
    if not context.profile_path or not context.profile_path.endswith("platform.yaml"):
        failures.append(f"selected profile is {context.profile_path!r}, expected platform.yaml")
    for label, resolved in (
        ("font families", context.allowed_font_families()),
        ("type scale", context.type_scale()),
        ("spacing scale", context.spacing_scale()),
        ("radius scale", context.radius_scale()),
    ):
        if resolved.provenance != PRODUCT:
            failures.append(
                f"resolved {label} provenance is {resolved.provenance!r}, expected product"
            )
    families = context.allowed_font_families().value or ()
    if "Plus Jakarta Sans" in families:
        failures.append("explicit Platform context received a T&S-only font family")

    for path in GLOBAL_FILES:
        text = path.read_text(encoding="utf-8")
        for marker in T_AND_S_MARKERS:
            if marker in text:
                failures.append(f"global file {path.relative_to(REPO_ROOT)} leaks {marker!r}")

    t_and_s_profile = (
        HARNESS_ROOT / "standards" / "domains" / "teachers-school.yaml"
    ).read_text(encoding="utf-8")
    for marker in T_AND_S_MARKERS:
        if marker not in t_and_s_profile:
            failures.append(
                f"T&S profile lost required moved value marker {marker!r}"
            )

    if failures:
        for failure in failures:
            error(failure)
        return 1

    print("PASS platform adoption contract")
    return 0


if __name__ == "__main__":
    sys.exit(main())
