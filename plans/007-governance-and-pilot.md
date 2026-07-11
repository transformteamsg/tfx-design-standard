# Plan 007: Update governance + contributing for the domain model, and write the EduPass pilot playbook

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- content/governance harness/CONTRIBUTING.md harness/docs/ONBOARDING.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: plans/002-domain-profile-schema.md (the rules it documents); pilot section depends on 004 + 006 existing at least as merged plans
- **Category**: docs / direction
- **Executor model**: Sonnet (documentation of already-made decisions; prose quality bar per SLP-9)
- **Planned at**: commit `233f3be`, 2026-07-10

## Why this matters

Scaling to division level changes who decides what — and that must be written down before the second domain arrives, not after a dispute. The settled model (requirements R14–R15): the **foundation owner** (Wondo Jeong, wondo.jeong@gt.tech.gov.sg) ratchets the foundation catalog; **domain leads** own their domain profile and may propose **additive** domain-scoped controls; no domain may weaken, override, or globally waive a foundation control; a cross-domain design council is the documented end-state, activated when 2+ domains actively ratchet. R16: Platform/EduPass is the pilot adopter (its users — teachers and HQ officers — are adjacent to the current audience, while its product shape stresses the model), Students is the second track; the pilot validates the whole onboarding path end-to-end before broad announcement, and it needs a concrete playbook.

## Current state

- `content/governance/governance.mdx` — the site's governance page (section registered in `content/map.json` with `"root": true`). Read it fully first; today it documents the TFX-scoped model (tiers, waivers, ratchet).
- `harness/CONTRIBUTING.md` — the ratchet flow: how a control is proposed, evidence, approval (design-lead), merge. Read fully.
- `harness/standards/README.md` — post-002 carries the `domains:` scope spec + the additive-only rule (normative). Governance/CONTRIBUTING must *cite* it, not restate it (the repo's SYNC discipline: one normative home per rule — see `harness/docs/SYNC.md`).
- `harness/standards/domains/` (post-002) — profiles; stubs are `status: proposed`; the wizard (004) drafts profile snippets that arrive via this ratchet.
- Waiver tiers (from `harness/standards/README.md`): L0 never waived; L1 documented with named human approver; L2 inline rationale (`dxd-waive`, legacy `tfx-waive` accepted).
- Content rules for the site page: frontmatter `status`, second person, sentence case, SLP-9; `pnpm build` gates MDX.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Build (MDX + gates) | `pnpm build` | exit 0 |
| Catalog + profiles validation | `python3 harness/checks/validate.py` | exit 0 |

## Scope

**In scope**:
- `content/governance/governance.mdx`
- `harness/CONTRIBUTING.md`
- `harness/docs/PILOT-EDUPASS.md` (create)
- `harness/docs/ONBOARDING.md` (one link to the pilot playbook)

**Out of scope**:
- The normative scope/additive rules themselves (they live in `harness/standards/README.md`, plan 002) — cite, don't restate.
- Creating the council, templates for council operation, or any governance beyond what was decided.
- The catalog, skills, website structure.
- Announcing/comms — the playbook says the announcement waits for pilot exit; writing the announcement is not this plan.

## Git workflow

- Branch: `advisor/007-governance-pilot` off `main` (after 002).
- Commit per file; match repo message style (`docs(governance): …`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Governance page — the domain model

Extend `content/governance/governance.mdx` with a "Domains" section:

- Roles: foundation owner (named) — owns the foundation catalog, approves all ratchets today; domain lead — owns `standards/domains/<slug>.yaml` and the domain's site page, proposes domain-scoped controls and profile changes.
- The two rules, cited from `harness/standards/README.md` §Domains: additive-only (domains never weaken/override foundation; waivers stay per-instance), and profiles carry parameters, never rules.
- Lifecycle of a domain: stub (`proposed`) → lead declares profile via ratchet → `settled` → may propose domain-scoped controls.
- End-state, clearly labelled as such: a cross-domain design council approves foundation ratchets, **activated when two or more domains are actively ratcheting**; until then the foundation owner decides. (Keep frontmatter `status` consistent with the page's current convention — the council paragraph itself is explicitly future-tense so the page can stay `settled`.)

**Verify**: `pnpm build` → exit 0; `grep -n 'council\|domain lead' content/governance/governance.mdx` → both present.

### Step 2: CONTRIBUTING — route domain proposals

In `harness/CONTRIBUTING.md`, add to the ratchet flow: two new proposal types — **domain profile change** (new/updated `standards/domains/<slug>.yaml`; approver: foundation owner + the domain lead named in the file) and **domain-scoped control** (a control carrying `domains:`; same evidence bar as any control, plus the additive-only check: "does this weaken any foundation control for this domain? If yes, reject"). State where wizard-drafted profile snippets (004) enter this flow. Cite `standards/README.md` §Domains for the rules.

**Verify**: `grep -n 'domain' harness/CONTRIBUTING.md | head` → routing present; `python3 harness/checks/validate.py` → exit 0.

### Step 3: The EduPass pilot playbook

Create `harness/docs/PILOT-EDUPASS.md`:

- **Purpose**: validate the full adoption path (website "Get started" page → install → setup wizard → first screen through the loop) with zero hand-holding beyond those artifacts; the standard is announced division-wide only after pilot exit.
- **Who**: Platform domain lead + one EduPass builder; foundation owner observes, never drives.
- **Entry criteria**: plans 001–006 merged; plugin installable; wizard rehearsed (004's rehearsal artifacts exist).
- **Script**: (1) lead reads the Get started page, then explains back what adopting takes — record the explanation verbatim (AE4 evidence); (2) builder installs the plugin in an EduPass repo and runs `/dxd:setup` → onboard my product, answering with real EduPass brand basics; (3) builder designs one real screen through `/dxd:design` end to end, including the plan gate and verify; (4) every point of confusion is filed via the feedback skill as it happens.
- **Exit criteria** (from the requirements doc's success criteria): one screen shipped through the loop under EduPass branding; zero Teacher & School leakage in its output (grep the produced artifacts for teacher/T&S brand values); the lead's explain-back was substantially correct; all filed feedback triaged.
- **Known gaps to watch**: EduPass audiences (teachers + HQ officers) may need an `hq-staff` audience added to the catalog via ratchet; a non-web stack would hit the web-only checks boundary — record, don't solve.
- **Second track**: Students domain follows the same script; their engineers co-build the division's AI-native workflow, so also collect harness-integration feedback from them.

Link the playbook from `harness/docs/ONBOARDING.md`.

**Verify**: `test -f harness/docs/PILOT-EDUPASS.md && grep -c 'PILOT-EDUPASS' harness/docs/ONBOARDING.md` → ≥ 1.

## Test plan

- `pnpm build` (MDX + content gates) and `python3 harness/checks/validate.py` → exit 0.
- Prose passes SLP-9 self-check (read `harness/standards/controls/slp-9.md`; scan your own text against its canonical tells before finishing).

## Done criteria

- [ ] `pnpm build` and `python3 harness/checks/validate.py` exit 0
- [ ] Governance page documents roles, the two cited rules, domain lifecycle, and the council end-state with its activation condition
- [ ] CONTRIBUTING routes both new proposal types with approvers and the additive-only check
- [ ] `harness/docs/PILOT-EDUPASS.md` exists with entry/script/exit criteria and is linked from ONBOARDING.md
- [ ] No rule is restated that `standards/README.md` owns (cite instead)
- [ ] No files outside the in-scope list modified; `plans/README.md` row updated

## STOP conditions

Stop and report back if:

- The governance page's existing structure contradicts the decided model (e.g. it already names a different approver hierarchy) — surface the conflict; don't overwrite silently.
- CONTRIBUTING's ratchet flow has approval steps that the domain model can't slot into without changing who approves foundation controls.
- You need to invent pilot logistics not decided here (dates, named EduPass individuals beyond the domain-lead role) — leave named-person slots blank for the operator.

## Maintenance notes

- When the council activates (2+ domains ratcheting), the governance page's future-tense paragraph becomes the operative model — that edit is itself a ratchet-visible governance change.
- Pilot feedback lands via the feedback skill as `[harness-feedback]` issues; the pilot exit review should sweep them before announcement.
- The `hq-staff` audience question will likely be the pilot's first ratchet proposal — precedent for how audience vocabulary grows.
