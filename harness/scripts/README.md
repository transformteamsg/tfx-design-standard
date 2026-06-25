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
