# Plan 014: Strip Markdown list/blockquote markers so anchored content-lint checks see bulleted copy

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT update `plans/README.md` — the reviewer
> maintains the index.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- harness/checks/content-lint.py`
> On any change, compare the "Current state" excerpts; on a mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug (systematic false negative)
- **Planned at**: commit `233f3be`, 2026-07-11

## Why this matters

CNT-6's empty-opener detection anchors at the start of a sentence
(`^(?:there\s+is|…)\b`), but the Markdown branch of the scanner never strips
list or blockquote markers. Empirically verified: `There is a problem with
your form.` as a plain paragraph is flagged `[CNT-6] empty opener "There is"`;
the identical sentence behind `- `, `* `, or `> ` produces **zero** findings —
the marker stays glued to the prose, so the `^`-anchored regex can never match.
Anchored CNT-1 matching (`re.match` on "something went wrong") is defeated the
same way. Most guideline copy in this repo is bulleted, so the opener half of
CNT-6 is a near-no-op exactly where it should bite.

## Current state

- `harness/checks/content-lint.py` — the only file in scope.

The md-branch preprocessing, `content-lint.py:559-572`:

```python
        if is_md:
            # MDX/MD prose line: skip headings, code fences, list/table markup,
            # import/export lines, JSX-only lines, and front-matter.
            if (not stripped
                    or stripped.startswith(("#", "```", "import ", "export ",
                                            "<", "|", ":::", "---"))):
                pass
            else:
                # Treat the whole prose line as text for sentence-length.
                prose = re.sub(r"`[^`]*`", "", scan_line)  # drop inline code
                _check_cnt3_text(prose, emit)
                _check_cnt1_text(prose.strip(), line, lineno, lines, emit)
                _check_cnt5_text(prose, emit, device_re)
                _check_cnt6_text(prose, emit, cnt6_res)
```

Note the skip-prefix comment says "list/table markup" is skipped, but only `|`
(tables) actually is — `- `, `* `, `> `, and `1. ` lines fall through to the
else branch WITH their markers attached. (That fall-through is desirable —
bullets carry real copy — the markers just need stripping.)

The anchored consumer, `content-lint.py:660-666` (`_check_cnt6_text`):

```python
    if cnt6_res["openers"]:
        for sentence in _split_sentences(text):
            m = cnt6_res["openers"].match(sentence.strip())
```

The openers regex construction, `content-lint.py:391-398`, is
`re.compile(r"^(?:" + … + r")\b", re.IGNORECASE)`.

The file has `--self-test` (find the block near the bottom; plain asserts with
one-line labels) — extend it, matching style. Python stdlib only.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Self-test | `python3 harness/checks/content-lint.py --self-test` | SELF-TEST OK, case count grows |
| Repo scan | `python3 harness/checks/content-lint.py content harness/docs; echo "exit=$?"` | record exit + finding count BEFORE and AFTER (see step 3) |
| Syntax | `python3 -m py_compile harness/checks/content-lint.py` | exit 0 |

## Scope

**In scope**:
- `harness/checks/content-lint.py`

**Out of scope**:
- The canonical word lists (`harness/standards/controls/cnt-6.md`, `slp-9.md`,
  `cnt-5.md`) — no list changes.
- `_split_sentences`, the openers regex builder — the fix is in the md-branch
  preprocessing, not the matchers.
- Any `content/**` file — if new true-positive findings appear in repo prose,
  REPORT them in your summary; do not edit the prose (that's a separate
  editorial pass).

## Git workflow

- Branch: `advisor/014-content-lint-list-markers` from `233f3be`
- Commit style: `fix(harness): strip list/blockquote markers so anchored lints see bulleted copy`
- Do NOT push or open a PR.

## Steps

### Step 1: Strip markers in the md branch

In the else branch, strip leading list/blockquote markers from the prose
before the checks (repeatedly, to handle `> - text` nesting):

```python
                # Treat the whole prose line as text for sentence-length.
                prose = re.sub(r"`[^`]*`", "", scan_line)  # drop inline code
                # Strip list/blockquote markers so anchored checks (CNT-6
                # openers, CNT-1) see the sentence start: "- ", "* ", "+ ",
                # "1. ", "> " — repeated for nested "> - " forms.
                prose = re.sub(r"^(?:\s*(?:[-*+]|\d{1,3}[.)]|>)\s+)+", "", prose)
```

Keep passing the stripped `prose` to all four `_check_*` calls exactly as
today. Do NOT change the skip-prefix tuple: `-` alone must not become a skip
(bulleted copy must still be scanned), and `---` (front-matter/hrule) is
already skipped by the tuple before this line runs.

**Verify**: `python3 -m py_compile harness/checks/content-lint.py` → exit 0.

### Step 2: Self-test cases

Add cases, matching existing style:
1. `- There is a problem with your form.` in a `.md` file → CNT-6 empty-opener
   finding emitted.
2. `> There is a delay.` → CNT-6 finding.
3. `1. There is one step.` → CNT-6 finding.
4. `- Choose a class to continue.` → no CNT-6 finding (control case).
5. A `---` line → still no findings (front-matter skip intact).

**Verify**: `python3 harness/checks/content-lint.py --self-test` → SELF-TEST OK, count increased by your cases.

### Step 3: Measure the blast radius on repo prose

Run BEFORE your change (on a clean checkout of the base, e.g. `git stash`) and
AFTER: `python3 harness/checks/content-lint.py content harness/docs`. Diff the
finding lists. New findings are expected (bulleted copy was invisible); list
them all in your report. Do not fix the prose (out of scope) and do not
suppress the findings.

**Verify**: the AFTER run exits 0 or 1 (findings), not a crash; the BEFORE→AFTER delta contains only findings on lines starting with list/blockquote markers.

## Test plan

The five self-test cases in step 2 are the regression suite; the step 3
before/after diff is the empirical evidence for the report.

## Done criteria

- [ ] Self-test OK with the five new cases
- [ ] The empirical repro flips: a scratch file containing `- There is a problem with your form.` now yields a CNT-6 finding
- [ ] Step 3 delta reported (may be non-empty — that is the point)
- [ ] Only `harness/checks/content-lint.py` modified (`git status`)

## STOP conditions

- The md-branch code no longer matches the excerpt (drift).
- Step 3 shows the change ALSO altered findings on non-list lines (the regex
  over-strips — e.g. an em-dash line) — report with examples.
- An existing self-test case fails — do not weaken it; report.

## Maintenance notes

- The `prebuild` gate and `detect.py --all` profile both run content-lint;
  after this lands, previously-invisible bulleted findings may surface in
  builds — the step 3 report tells the maintainer exactly what to expect.
- If a future control needs the ORIGINAL line (marker included), thread a
  second variable rather than un-stripping `prose`.
