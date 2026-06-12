# Adopting the TFX design harness — product team guide

**Audience:** an engineer or designer on Teacher Workspace, CaseSync, or Glow making
their repo "harness-ready" per TFX-DS §7.6.

**Time:** approximately one hour plus team decisions (mainly items 5 and 6 below).

This guide walks through the six §7.6 checklist items in order. Work through them
once per product repo, not once per page. After setup, every design session runs the
same loop automatically.

---

## 0. Install the plugin

Follow the two commands in the [README Install section](../README.md#install):

```
/plugin marketplace add <git-url-of-this-repo>
/plugin install tfx-design-harness@tfx
```

This installs the four skills (`design-ui`, `design-standards`, `content-style`,
`design-review`), the `design-evaluator` subagent, and the control catalog
(`standards/`) — the catalog ships with the plugin, not with your repo.

If you are working on the harness itself (not a product repo), open a Claude Code
session in this repository directly: the skills load from `.claude/skills/`
automatically and no install step is needed.

---

## 1. The stack

**What it means:** TFX-DS §7.6 item 1 requires your product to run the fixed stack:
Base UI components, Radix Colors, shadcn/ui default tokens, Plus Jakarta Sans (600)
for display, and Inter (400/500/600) for body and UI. No parallel component library
alongside these.

**The concrete step:** Check your product's `package.json` and component imports. The
stack must be your only component foundation. If you have a parallel library (MUI,
Ant Design, Chakra, or similar) running alongside Base UI and shadcn, stop here and
raise it with the design lead before installing the harness. The catalog controls
(CMP-1, TOK-1–3, TYP-1–3) assume the fixed stack throughout; a mixed stack produces
ambiguous verdicts in every verify phase.

**Status today:** Teacher Workspace is the reference implementation. CaseSync and
Glow should align their stacks before installation; no harness support is planned for
divergent stacks.

---

## 2. Component manifest

**What it means:** CMP-1 requires that when the agent proposes components, it only
uses components that exist in your product's library. A component manifest is the
machine-readable list the agent reads to satisfy that requirement.

**The concrete step:** The component manifest format is pending — it is the subject
of plans/008 (a spike on format and wiring). Until it lands, the interim answer is:
the agent reads your product's component source directory directly. Expect CMP-1
verdicts in every verify phase to be marked "asserted, no manifest" — this is a known
v0 limitation, not a misconfiguration or a skipped control. The worked example at
`docs/decisions/student-notes-empty-state.md` demonstrates what an "asserted, no
manifest" waiver looks like in practice.

**Do not create a manifest format yourself** before plans/008 defines it — the format
must be consistent across TW, CaseSync, and Glow.

---

## 3. Skills installed

**What it means:** The four TFX skills (`design-ui`, `design-standards`,
`content-style`, `design-review`) must be active in the product repo's Claude session
for the harness to work. Without them, the agent has no loop structure, no catalog
filters, and no evaluator procedure to follow.

**The concrete step:** After running the install commands in item 0, verify the skills
loaded. Open a Claude Code session in your product repo and ask: "design a test page."
The `design-ui` loop must trigger and ask intent questions — purpose, the teacher
and moment, page type, done-criteria. If it does not, run `/plugin list` and confirm
`tfx-design-harness` is enabled. If the plugin appears but the skill does not trigger,
check that the session is open in the product repo root, not in a subdirectory.

---

## 4. Deterministic checks (V1)

**What it means:** TFX-DS §7.6 item 4 calls for deterministic check scripts wired as
hooks — scripts that run automatically at the implement and verify phases without
waiting for agent judgment.

**Status today:** The first check script is now available: `checks/token-audit.py` covers TOK-1 (raw colours), TOK-2 (off-scale spacing), TOK-3 (off-scale radius), and COL-1/COL-2 (Tailwind palette bypass). Run it manually against any file or directory: `python3 checks/token-audit.py <path>`. The remaining 11 check scripts are not built yet. The catalog validator (`checks/validate.py`) is a harness self-check — it validates the catalog file format, not your design output. In every verify phase today, deterministic controls beyond token-audit are verified manually: you run checks by hand or by reading the code, then record the result. Every verify verdict in this period will read "verified manually" for all deterministic controls except token-audit. This is expected and correct — it is not a misconfiguration or a gap in your setup.

V1 will wire the check scripts as hooks; until then, manual verification is the
protocol. The worked example at `docs/decisions/student-notes-empty-state.md` shows
the full manual-verification table, including which checks the evaluator was unable
to verify from screenshots alone (see the ADVISORY on CMP-3 in that record).

---

## 5. Record locations

**What it means:** Decision records and waivers must live in a defined, findable
location in your repo. The harness does not dictate your full directory structure, but
it needs to know where to point humans for approval and audit.

**The concrete step:**

1. Create a `docs/decisions/` directory in your product repo.
2. Copy the decision-record template from the harness:
   `docs/decisions/TEMPLATE.md` → `your-repo/docs/decisions/TEMPLATE.md`.
3. Start one record per page or significant change, beginning at Phase 3 (plan
   approval). Do not start it at Phase 6 — the approved plan is the fixed artifact
   that the verify phase grades against.

L1 waivers live in the decision records until a central waiver registry exists. When
you grant a waiver, record it in the `## Waivers granted` table of the decision record
with a named approver, a specific reason, and the `tfx-waive` inline marker in the
code. L0 controls are never waivable. A waiver without a named human approver is not a
valid L1 waiver.

---

## 6. Named L1 approver

**What it means:** L1 waivers require a named human approver. Without one, L1 waivers
cannot be granted and the harness has no human gate for the most consequential
decisions.

**The concrete step:** Name a specific person — not a role, not a team, not
"the design lead in general." Record the name and date in
`docs/decisions/APPROVER.md` in your product repo, for example:

```
L1 waiver approver: Jane Doe (jane.doe@example.gov.sg)
Recorded: 2026-06-10
```

**No dedicated designer on your team?** The portfolio designer holds the plan and
verify gates asynchronously, per TFX-DS §7.5. Target turnaround is less than one day.
The portfolio designer is the correct L1 approver for teams without an embedded
designer. Name that person explicitly — do not leave the field blank because the
designer is not co-located.

---

## First real page — what to expect

Once the six items above are satisfied, run the `design-ui` loop on your first real
page. Here is what the six phases feel like in practice:

1. **Intent** — the agent asks four questions (purpose, the teacher and moment, page
   type, done-criteria) and locks in a sprint contract. Resist the urge to rush past
   this phase; the contract is what the verify phase grades against.
2. **Diverge** — 2–3 structural variants are presented, composed from your manifest
   components. You pick one. No code yet.
3. **Plan** — a detailed plan names the components, the controls in scope, the tradeoffs,
   and any proposed waivers. **You approve this before implementation begins.** In an
   attended session you confirm explicitly; in an unattended run the plan records proxy
   approval.
4. **Implement** — the agent implements against the approved plan with catalog controls
   active. You should not need to intervene unless the plan was ambiguous.
5. **Verify** — deterministic controls are checked manually (today), screenshots are
   captured at 360/768/1280 px, and the `design-evaluator` subagent grades the judgment
   controls and four quality criteria. Note: in an unattended single-agent session, the
   evaluator spawn requires an orchestrator-level dispatch after the executor stops —
   see the friction report headline finding for the working pattern.
6. **Ratchet** — the decision record is finished. Any defect no control covered becomes
   a proposed new control, recorded in the decision record as pending design-lead
   approval.

**The worked example** — a complete run through all six phases for the Student Notes
empty state in Teacher Workspace — is available at:

- Decision record: `docs/decisions/student-notes-empty-state.md` — sprint contract,
  chosen approach, waivers, manual verification table, and evaluator verdict.
- Implemented page and screenshots: `docs/loop-run/` — the self-contained HTML page
  and 360/768/1280 px screenshots.
- Friction report: `docs/loop-run/FRICTION-REPORT.md` — what worked, what was rough,
  and recommended follow-up edits. The headline finding (evaluator subagent spawn in
  unattended sessions) is directly relevant to how you run the loop.

The evaluator verdict in that example was produced via orchestrator-level dispatch
after the executor stopped — not from within the executor's session. In an interactive
session you run directly, the `design-ui` skill spawns the `design-evaluator`
subagent directly from Phase 5.

---

## When something fails

**L0 block** — stop, fix the violation, and re-verify before proceeding. L0 controls
(A11Y-1, A11Y-2, A11Y-3, CMP-2) are never waivable. There is no path forward that
leaves an L0 violation unresolved.

**A control seems wrong for your context** — use the waiver protocol in the
`design-standards` skill, not silent deviation. A silent deviation is a compliance gap;
a waiver with a reason and a named approver is an intentional decision. The catalog is
built to evolve — if a control is wrong in principle, raise it via the ratchet.

**A defect that no control covers** — use the ratchet. Record the gap in the decision
record as a proposed new control or anti-pattern, marked pending design-lead approval.
Do not wait for CONTRIBUTING.md (plan 006) before proposing — the decision record is
the right place until a formal contribution process exists. The worked example at
`docs/decisions/student-notes-empty-state.md` demonstrates this: two proposed controls
(CMP-4 and EVD-1) are recorded there, pending design-lead approval.
