# scripts/

Action tools — things that *do* something (file an issue, mutate remote state), as
opposed to the read-only validators in `checks/` that run during the verify phase. Keep
the two separate: a tool that creates a GitHub issue does not belong among the
validators.

## file-feedback-issue.py

Files a deduped, labelled harness-feedback GitHub issue per `docs/harness-feedback.md`
(the spec). Pure standard-library Python 3.

```
# file an issue (real)
python3 scripts/file-feedback-issue.py --severity med --category tooling \
    --title "summary" --body "the ask + source context"

# rehearse without filing
python3 scripts/file-feedback-issue.py --dry-run --severity med --category tooling \
    --title "summary" --body "..."

# pure logic test — never touches the network
python3 scripts/file-feedback-issue.py --self-test
```

- `--severity` — one of `L0-risk` / `high` / `med` / `low`.
- `--category` — repeatable; one or more of `a11y` / `tooling` / `standards` /
  `harness-ux` / `onboarding`.
- `--dry-run` — print the `gh` command + body, file nothing.
- The title marker `[harness-feedback]` is added automatically (idempotent), and the
  tool dedups against existing issues before filing. If `gh` is unavailable, it prints
  the issue that *would* have been filed and the reason, and exits non-zero — never a
  silent skip.

## generate-design-json.py

Generates a product repo's `.tfx/design.json` (the machine twin) from its human-owned
`DESIGN.md` (per-product visual parameters). Spec: `docs/DESIGN-CONTEXT.md`. Pure
standard-library Python 3. `.tfx/design.json` is generated only — never hand-edited.

```
# generate .tfx/design.json under the product repo root
python3 scripts/generate-design-json.py <repo-root>

# CI freshness gate — exit 2 if .tfx/design.json is stale vs DESIGN.md, write nothing
python3 scripts/generate-design-json.py <repo-root> --check

# pure logic test — writes only inside a temp dir
python3 scripts/generate-design-json.py --self-test
```

- Parses `DESIGN.md`'s `## ` sections into one json key each (`colour`, `tone`, `motion`,
  `layout_system`, `components`); `- key: value` bullets become structured fields, a
  prose section becomes its text verbatim, HTML comments are stripped.
- Exit codes: `0` wrote / up to date · `1` no `DESIGN.md` (portfolio defaults apply —
  not a failure) · `2` `--check` found a stale twin.
