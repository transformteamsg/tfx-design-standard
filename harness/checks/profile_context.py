#!/usr/bin/env python3
"""Resolve profile-parameterised checker values from an explicit scan target.

Resolution order is product `.dxd/design.json` (legacy `.tfx/design.json`) over
the one domain profile named by that context. Concrete foundation values do not
exist. The sole v0.x compatibility exception is a repository with no DESIGN.md
and no generated context; that repository resolves the Teachers & School profile.

The resolver is deliberately shared by the typography and token scanners so an
explicit non-T&S domain can never accidentally receive a checker-local T&S
fallback. Values carry provenance: product, profile, compatibility fallback, or
unresolved.
"""

import json
import os
import re
import sys
from dataclasses import dataclass
from typing import Any, Mapping, Optional, Tuple

try:
    import yaml
except ImportError:
    print("ERROR profile_context.py: cannot import yaml — install pyyaml")
    sys.exit(1)


CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))
HARNESS_ROOT = os.path.dirname(CHECKS_DIR)
DOMAIN_SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
CONTEXT_PATHS = (
    os.path.join(".dxd", "design.json"),
    os.path.join(".tfx", "design.json"),
)
PROFILE_SECTIONS = ("colour", "typography", "stack")

PRODUCT = "product"
PROFILE = "profile"
COMPATIBILITY = "compatibility fallback"
UNRESOLVED = "unresolved"


@dataclass(frozen=True)
class ResolvedValue:
    """A typed checker value and where it came from."""

    value: Optional[Tuple[Any, ...]]
    provenance: str
    source: Optional[str] = None

    @property
    def resolved(self):
        return self.value is not None


@dataclass(frozen=True)
class ProfileContext:
    """Resolved product/domain context plus typed checker-facing helpers."""

    repo_root: str
    domain: Optional[str]
    context_path: Optional[str]
    profile_path: Optional[str]
    compatibility_fallback: bool
    profile_values: Mapping[str, Any]
    product_values: Mapping[str, Any]
    notes: Tuple[str, ...] = ()

    @property
    def merged_values(self):
        """Deep-merged colour/typography/stack values for non-check consumers."""
        return _deep_merge(self.profile_values, self.product_values)

    def _section(self, source, name):
        value = source.get(name) if isinstance(source, Mapping) else None
        return value if isinstance(value, Mapping) else {}

    def _field(self, section, field):
        product_section = self._section(self.product_values, section)
        if field in product_section:
            return product_section[field], PRODUCT, self.context_path
        profile_section = self._section(self.profile_values, section)
        if field in profile_section:
            provenance = COMPATIBILITY if self.compatibility_fallback else PROFILE
            return profile_section[field], provenance, self.profile_path
        return None, UNRESOLVED, None

    def _number_scale(self, section, field):
        raw, provenance, source = self._field(section, field)
        if not isinstance(raw, list) or not raw:
            return ResolvedValue(None, UNRESOLVED, source)
        values = []
        for item in raw:
            if isinstance(item, bool) or not isinstance(item, (int, float)) or item < 0:
                return ResolvedValue(None, UNRESOLVED, source)
            values.append(item)
        if len(values) != len(set(values)):
            return ResolvedValue(None, UNRESOLVED, source)
        return ResolvedValue(tuple(values), provenance, source)

    def allowed_font_families(self):
        """Return declared UI and registered wordmark families."""
        product_typography = self._section(self.product_values, "typography")
        profile_typography = self._section(self.profile_values, "typography")

        # A product that names display/body fonts overrides a profile-level
        # allowed_families list even if it omits its own derived list.
        product_names_fonts = any(
            key in product_typography
            for key in ("allowed_families", "display", "body")
        )
        if "allowed_families" in product_typography:
            raw = product_typography.get("allowed_families")
            provenance, source = PRODUCT, self.context_path
        elif product_names_fonts:
            raw = [
                product_typography.get("display", profile_typography.get("display")),
                product_typography.get("body", profile_typography.get("body")),
            ]
            provenance, source = PRODUCT, self.context_path
        elif "allowed_families" in profile_typography:
            raw = profile_typography.get("allowed_families")
            provenance = COMPATIBILITY if self.compatibility_fallback else PROFILE
            source = self.profile_path
        else:
            raw = [profile_typography.get("display"), profile_typography.get("body")]
            provenance = COMPATIBILITY if self.compatibility_fallback else PROFILE
            source = self.profile_path

        families = []
        if isinstance(raw, list):
            for value in raw:
                name = _font_name(value)
                if name and name.casefold() not in {f.casefold() for f in families}:
                    families.append(name)

        # Registered wordmark faces are valid only in their lockup; the static
        # scanner can allow the family while the evaluator checks that scope.
        wordmarks = dict(profile_typography.get("wordmarks") or {})
        product_wordmarks = product_typography.get("wordmarks")
        if isinstance(product_wordmarks, Mapping):
            wordmarks.update(product_wordmarks)
        for value in wordmarks.values():
            name = _font_name(value)
            if name and name.casefold() not in {f.casefold() for f in families}:
                families.append(name)

        if not families:
            return ResolvedValue(None, UNRESOLVED, source)
        return ResolvedValue(tuple(families), provenance, source)

    def type_scale(self):
        return self._number_scale("typography", "scale_px")

    def spacing_scale(self):
        return self._number_scale("stack", "spacing_px")

    def radius_scale(self):
        return self._number_scale("stack", "radius_px")


def _font_name(value):
    """Extract a family name from a structured family/wordmark declaration."""
    if not isinstance(value, str):
        return None
    name = value.strip()
    if not name:
        return None
    # Wordmark declarations may append a token and scope note.
    name = re.split(r"\s+—\s+|\s+\(--font-[^)]+\)", name, maxsplit=1)[0].strip()
    return name or None


def _deep_merge(base, overlay):
    """Return a recursive mapping merge without mutating either input."""
    result = {}
    for key, value in (base or {}).items():
        result[key] = _deep_merge(value, {}) if isinstance(value, Mapping) else value
    for key, value in (overlay or {}).items():
        if isinstance(value, Mapping) and isinstance(result.get(key), Mapping):
            result[key] = _deep_merge(result[key], value)
        elif isinstance(value, Mapping):
            result[key] = _deep_merge({}, value)
        else:
            result[key] = value
    return result


def _marker_root(start):
    current = os.path.abspath(start)
    while True:
        if any(
            os.path.exists(os.path.join(current, marker))
            for marker in (".git", ".dxd", ".tfx", "DESIGN.md")
        ):
            return current
        parent = os.path.dirname(current)
        if parent == current:
            return None
        current = parent


def find_repo_root(scan_paths, cwd=None):
    """Find the target repository root from explicit file/directory scan paths."""
    cwd = os.path.abspath(cwd or os.getcwd())
    paths = list(scan_paths or [])
    if not paths:
        return _marker_root(cwd) or cwd

    starts = []
    roots = []
    for raw in paths:
        path = raw if os.path.isabs(raw) else os.path.join(cwd, raw)
        path = os.path.abspath(path)
        start = path if os.path.isdir(path) else os.path.dirname(path)
        starts.append(start)
        root = _marker_root(start)
        if root:
            roots.append(root)
    if roots and all(root == roots[0] for root in roots):
        return roots[0]

    try:
        common = os.path.commonpath(starts)
    except ValueError:
        common = starts[0]
    return _marker_root(common) or common


def _read_json(path, notes):
    try:
        with open(path, encoding="utf-8") as fh:
            value = json.load(fh)
    except (OSError, ValueError) as exc:
        notes.append(f"could not read generated context {path}: {exc}")
        return {}
    if not isinstance(value, dict):
        notes.append(f"generated context {path} is not a JSON object")
        return {}
    return value


def _read_yaml(path, notes):
    try:
        with open(path, encoding="utf-8") as fh:
            value = yaml.safe_load(fh)
    except (OSError, yaml.YAMLError) as exc:
        notes.append(f"could not read domain profile {path}: {exc}")
        return {}
    if not isinstance(value, dict):
        notes.append(f"domain profile {path} is not a YAML mapping")
        return {}
    return value


def _context_file(repo_root):
    for relative in CONTEXT_PATHS:
        path = os.path.join(repo_root, relative)
        if os.path.isfile(path):
            return path
    return None


def _profile_sections(value, notes, source_label):
    sections = {}
    for section in PROFILE_SECTIONS:
        item = value.get(section) if isinstance(value, Mapping) else None
        if item is None:
            continue
        if not isinstance(item, Mapping):
            notes.append(f"{source_label} section '{section}' is not an object")
            continue
        sections[section] = dict(item)
    return sections


def resolve_profile_context(scan_paths, harness_root=None, cwd=None):
    """Resolve the active product/domain context for a scanner invocation."""
    repo_root = find_repo_root(scan_paths, cwd=cwd)
    harness_root = os.path.abspath(harness_root or HARNESS_ROOT)
    notes = []
    context_path = _context_file(repo_root)
    has_design_md = os.path.isfile(os.path.join(repo_root, "DESIGN.md"))
    context = _read_json(context_path, notes) if context_path else {}

    domain = context.get("domain") if isinstance(context, Mapping) else None
    if domain is not None and (
        not isinstance(domain, str) or not DOMAIN_SLUG_RE.fullmatch(domain)
    ):
        notes.append("generated context 'domain' must be a registry slug string")
        domain = None

    compatibility_fallback = not context_path and not has_design_md
    selected_domain = "teachers-school" if compatibility_fallback else domain
    profile_path = None
    profile = {}
    if selected_domain:
        candidate = os.path.join(
            harness_root, "standards", "domains", selected_domain + ".yaml"
        )
        if os.path.isfile(candidate):
            profile_path = candidate
            profile = _read_yaml(candidate, notes)
        else:
            notes.append(
                f"domain profile '{selected_domain}' is missing at {candidate}")
    elif context_path or has_design_md:
        notes.append("product context does not declare a domain")

    # A declared domain selects exactly one profile. There is intentionally no
    # fallback to teachers-school here for an explicit non-T&S domain.
    profile_values = _profile_sections(profile, notes, "domain profile")
    product_values = _profile_sections(context, notes, "generated context")

    return ProfileContext(
        repo_root=repo_root,
        domain=selected_domain,
        context_path=context_path,
        profile_path=profile_path,
        compatibility_fallback=compatibility_fallback,
        profile_values=profile_values,
        product_values=product_values,
        notes=tuple(notes),
    )


def run_self_test():
    import tempfile

    failures = []
    cases = 0

    def check(name, condition, detail=""):
        nonlocal cases
        cases += 1
        if not condition:
            failures.append(f"FAIL {name}" + (f": {detail}" if detail else ""))

    with tempfile.TemporaryDirectory(prefix="profile-context-selftest-") as td:
        harness = os.path.join(td, "harness")
        domains = os.path.join(harness, "standards", "domains")
        os.makedirs(domains)
        with open(os.path.join(domains, "teachers-school.yaml"), "w") as fh:
            yaml.safe_dump({
                "domain": "teachers-school",
                "name": "Teachers & School",
                "status": "settled",
                "typography": {
                    "display": "Plus Jakarta Sans",
                    "body": "Inter",
                    "allowed_families": ["Plus Jakarta Sans", "Inter"],
                    "scale_px": [48, 16, 14],
                },
                "stack": {
                    "spacing_px": [0, 4, 8, 16],
                    "radius_px": [0, 4, 8],
                },
            }, fh)
        with open(os.path.join(domains, "platform.yaml"), "w") as fh:
            yaml.safe_dump({
                "domain": "platform", "name": "Platform", "status": "proposed"
            }, fh)

        def repo(name):
            path = os.path.join(td, name)
            os.makedirs(path)
            target = os.path.join(path, "screen.css")
            with open(target, "w") as fh:
                fh.write(".screen {}\n")
            return path, target

        # Legacy no-context repositories receive the documented v0.x profile.
        legacy, legacy_target = repo("legacy")
        resolved = resolve_profile_context([legacy_target], harness_root=harness)
        check("legacy domain", resolved.domain == "teachers-school", str(resolved))
        check("legacy compatibility provenance",
              resolved.type_scale().provenance == COMPATIBILITY)
        check("legacy profile values", resolved.spacing_scale().value == (0, 4, 8, 16))

        # Explicit Platform product values win and never receive T&S values.
        platform, platform_target = repo("platform-product")
        os.makedirs(os.path.join(platform, ".dxd"))
        with open(os.path.join(platform, ".dxd", "design.json"), "w") as fh:
            json.dump({
                "domain": "platform",
                "typography": {
                    "display": "Atkinson Hyperlegible",
                    "body": "Source Sans 3",
                    "scale_px": [48, 32, 24, 18, 15, 12],
                },
                "stack": {
                    "spacing_px": [0, 3, 6, 12, 18, 24, 36],
                    "radius_px": [0, 5, 10, 9999],
                },
            }, fh)
        resolved = resolve_profile_context([platform_target], harness_root=harness)
        check("explicit Platform domain", resolved.domain == "platform")
        check("explicit Platform is not compatibility", not resolved.compatibility_fallback)
        check("product font provenance",
              resolved.allowed_font_families().provenance == PRODUCT)
        check("product font values",
              resolved.allowed_font_families().value ==
              ("Atkinson Hyperlegible", "Source Sans 3"))
        check("product scale values", resolved.type_scale().value[-2:] == (15, 12))
        check("explicit Platform has no T&S family",
              "Plus Jakarta Sans" not in resolved.allowed_font_families().value)

        # An explicit stub domain remains honestly unresolved.
        stub, stub_target = repo("platform-stub")
        os.makedirs(os.path.join(stub, ".dxd"))
        with open(os.path.join(stub, ".dxd", "design.json"), "w") as fh:
            json.dump({"domain": "platform"}, fh)
        unresolved = resolve_profile_context([stub_target], harness_root=harness)
        check("stub families unresolved", not unresolved.allowed_font_families().resolved)
        check("stub spacing unresolved", not unresolved.spacing_scale().resolved)
        check("stub never compatibility", not unresolved.compatibility_fallback)

        # Product values override selected profile values field by field.
        override, override_target = repo("override")
        os.makedirs(os.path.join(override, ".dxd"))
        with open(os.path.join(override, ".dxd", "design.json"), "w") as fh:
            json.dump({
                "domain": "teachers-school",
                "typography": {"scale_px": [99, 15]},
                "stack": {"spacing_px": [0, 7]},
            }, fh)
        resolved = resolve_profile_context([override_target], harness_root=harness)
        check("product-over-profile type scale", resolved.type_scale().value == (99, 15))
        check("product-over-profile spacing", resolved.spacing_scale().value == (0, 7))
        check("profile field still available", resolved.radius_scale().provenance == PROFILE)
        check(
            "deep merge keeps profile and product fields",
            resolved.merged_values["stack"] == {
                "spacing_px": [0, 7], "radius_px": [0, 4, 8]
            },
            str(resolved.merged_values),
        )

        # Malformed canonical context fails closed: no legacy or .tfx borrowing.
        malformed, malformed_target = repo("malformed")
        os.makedirs(os.path.join(malformed, ".dxd"))
        with open(os.path.join(malformed, ".dxd", "design.json"), "w") as fh:
            fh.write("{not json")
        os.makedirs(os.path.join(malformed, ".tfx"))
        with open(os.path.join(malformed, ".tfx", "design.json"), "w") as fh:
            json.dump({"domain": "teachers-school"}, fh)
        resolved = resolve_profile_context([malformed_target], harness_root=harness)
        check("malformed context has note", any("could not read" in n for n in resolved.notes))
        check("malformed context no compatibility", not resolved.compatibility_fallback)
        check("malformed context unresolved", not resolved.type_scale().resolved)

        # DESIGN.md without its generated twin is explicit, not a legacy repo.
        design_only, design_only_target = repo("design-only")
        with open(os.path.join(design_only, "DESIGN.md"), "w") as fh:
            fh.write("# Product design\n")
        resolved = resolve_profile_context([design_only_target], harness_root=harness)
        check("DESIGN.md prevents compatibility", not resolved.compatibility_fallback)
        check("DESIGN.md missing twin unresolved", not resolved.type_scale().resolved)

        # Legacy .tfx context remains readable when .dxd is absent.
        old_context, old_target = repo("old-context")
        os.makedirs(os.path.join(old_context, ".tfx"))
        with open(os.path.join(old_context, ".tfx", "design.json"), "w") as fh:
            json.dump({
                "domain": "platform",
                "stack": {"radius_px": [0, 13]},
            }, fh)
        resolved = resolve_profile_context([old_target], harness_root=harness)
        check("legacy path selected", resolved.context_path.endswith(".tfx/design.json"))
        check("legacy path product provenance", resolved.radius_scale().provenance == PRODUCT)

    if failures:
        for failure in failures:
            print(failure)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {cases} cases run)")
        return 1
    print(f"SELF-TEST OK ({cases} cases)")
    return 0


def main():
    if sys.argv[1:] == ["--self-test"]:
        return run_self_test()
    print("Usage: python3 checks/profile_context.py --self-test")
    return 1


if __name__ == "__main__":
    sys.exit(main())
