# Design decision record — Chat-demo shared shell (guidelines AI demos)

> One record per page or significant change. Started at the Phase 3 plan gate (the
> approved plan is the fixed artifact the verify phase grades against), finished at
> Phase 6.

- **Date:** 2026-07-15
- **Product:** TW surface (design-standard site — guidelines docs)
- **Change type:** modification
- **Page type:** component demos embedded in MDX (guidelines/conversation-design, guidelines/ai-design)
- **Run type:** attended
- **The teacher and the moment:** Not a teacher — the audience is a TFX designer/agent reading the design-standard site to learn how to compose AI Elements on-brand. The demos are the reference they copy from; inconsistent spacing teaches the wrong rhythm.

## Sprint contract (done-criteria)

1. All four chat demos (`DemoConversation`, `DemoChatbot`, `DemoStreaming`, `DemoPromptInput`) share one spacing rhythm: same message padding, same message-to-input gap, same divider treatment.
2. No nested cards (SLP-4): the inner `rounded-lg border bg-surface` boxes inside the `DemoFrame` figure are removed; grouping is done with spacing + a `border-t` divider.
3. No message is clipped mid-sentence; scripted demos sit at natural height, only the flagship `DemoChatbot` keeps internal scroll (with its existing `ConversationScrollButton`).
4. Message rhythm tuned for the compact demo context (`ConversationContent gap-8` → `gap-4`) via `className` override only — AI Elements source components untouched ("exactly as the site").
5. Tokens only (TOK-1), Plus Jakarta/Inter only (TYP-1), reduced-motion preserved (A11Y-5), streaming stop control preserved (CMP-3).

## Chosen approach

Option A — a shared `components/ai-demos/chat-shell.tsx` (`ChatShell` / `ChatShellMessages` / `ChatShellInput`) providing one spacing source of truth (`gap-4`, `p-4`, `border-t border-border`). `DemoFrame` gains an optional `bleed` prop that drops its `p-5 sm:p-6` so the chat owns its own padding and the divider spans edge-to-edge. The four chat demos compose the shell; the two that had an inner bordered box (`DemoConversation`, `DemoChatbot`) drop it (SLP-4 fix). `DemoChatbot` alone uses `ChatShellMessages scroll` (`max-h-[420px] overflow-y-auto`).

## Rejected options

- **Option B — standardize the classes in place, no shared component.** Same visual result, but the rhythm is copy-pasted across four files, so the next demo re-introduces drift — the exact failure being fixed, deferred.

## Tradeoffs, named

1. Demos lose the framed "chat-app window" look (inner box) → read as content on the `DemoFrame` canvas split by a divider. Accept: SLP-4 + consistency win, and `DemoFrame` already *is* the frame.
2. `DemoFrame` is shared by all demos; adding `bleed` touches a common file. Mitigate: defaults false; non-chat demos unaffected; verified.
3. `DemoConversation` gets taller (no 420 cap). Accept: it's a doc page; kills the clip.

## Controls in scope

SLP-4 (primary — nested cards removed), SLP-7 (rhythm), SLP-11 (removed boxes weren't interactive units), TOK-1..3, TYP-1, CMP-7 (documented `ConversationContent` gap/padding override), LAY-6 (edge alignment), MOT-1 / SLP-8 / A11Y-5 (motion unchanged), CMP-3 (streaming states preserved — `DemoStreaming`, `DemoChatbot`), A11Y-1/-2. CMP-1 asserted (no `.tfx` manifest).

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| — | — | none | — | — |

> CMP-7 note (not a waiver): `ConversationContent` is used with a `className` that overrides its default `gap-8 p-4` to `gap-4 p-4` for the compact demo context. Recorded here with reason rather than left silent.

## Plan approval

- **Approved by:** Tasha (attended, in-session Approve/Adjust gate)
- **Approved on:** 2026-07-15

## Verify verdict

- **Route note:** during the session the guidelines pages were concurrently restructured (by Tasha, in a parallel editor) into an `/ai/` subgroup; the chat demos now render at `/ai/conversation-ux`. Content unchanged, only the route moved. Changes landed in commit `a8654a3` (Phase 9, tashayip).
- **Screenshots (desktop, dev server `/ai/conversation-ux`):**
  - DemoConversation after — full assistant message renders (no mid-sentence clip), no inner box, single full-bleed divider, even rhythm (browser MCP `ss_4932h37q4`).
  - DemoChatbot empty state on canvas (`ss_07348uu4u`); streaming/submitted with stop control (`ss_75273xash`); Reasoning auto-open "Thinking…" (`ss_4076j7h6a`); response with collapsed Reasoning + Sources streaming (`ss_22866rf1n`).
  - Before-state reference (old `/guidelines/conversation-design`): inner box + mid-sentence clip + airy gap-8 (`ss_7425bq5bl`, `ss_2519gm9p0`).
- **CMP-3 frames:** loading (disabled textarea, "Waiting for response…"), streaming (visible square stop control), success (streamed response + reasoning + sources) all captured. Error state not exercised (mock transport has no error path); noted, not blocking.
- **Token block line range:** N/A — no `tfx-tokens` exemption region added.
- **Dark mode:** N/A — site is light-only (`app/globals.css` custom-variant dark never activated).
- **Deterministic:** `tsc --noEmit` clean; production `next build` compiled all 223 pages; `token-audit.py` exit 0; no raw hex in the 6 changed files; no inner `rounded…border…bg-surface` in the 4 demos; `git diff 92ff709 HEAD -- components/ai-elements/{conversation,prompt-input}.tsx` empty (source untouched).
- **Evaluator verdict (verbatim, agent `tfx-design-evaluator`):**

  > VERDICT: pass
  >
  > This is a clean, well-scoped modification. Every done-criterion is met, every in-scope control I could verify passes, and the two headline claims that carry the most risk — "AI Elements source untouched" and "no nested cards" — are provable deterministically rather than on the builder's say-so. Note: the working tree is committed (changes landed at commits `1c14804` Phase 8 / `a8654a3` Phase 9), so I graded the committed state and diffed the AI Elements source against its Phase 6.1 install point (`92ff709`).
  >
  > BLOCKING: None. ADVISORY: None that rise to a finding — two close calls recorded (A11Y-5 Shimmer keyframe halt under reduced-motion, and LAY-6 1280 render) are both "verify by human", neither a control failure on the evidence.
  >
  > Contract: all 5 done-criteria MET (rhythm single-sourced; SLP-4 nested boxes removed; only DemoChatbot scrolls, no clip; AI Elements source byte-identical to install; tokens/fonts/motion/stop-control preserved). Plan fidelity: matches approved Option A exactly, no structure drift.
  >
  > Grades: Design quality strong (one rhythm, composed not boxed — anti-slop done right); Originality strong (appropriately invisible — boring shared shell is the correct answer); Craft strong (divider prop avoids doubling the header border; textarea default left on purpose and documented); Functionality strong (chatbot flow completes; stop reachable throughout).
  >
  > Control ledger: SLP-4 pass (script+manual); SLP-7 pass; SLP-11 pass; TOK-1/2/3 pass (token-audit exit 0); TYP-1 pass; CMP-7 pass (override recorded with reason, spacing-only, no A11Y-1 trigger); LAY-6 pass (verified in code; recommend human glance at 1280); CMP-3 pass (SquareIcon+onStop on streaming, wired in both demos); MOT-1/SLP-8 pass (no bounce/spring/transition-all); A11Y-5 pass with one unverified sub-item (Shimmer keyframe halt — pre-existing untouched component, needs a human with reduced-motion set); CMP-1 asserted (no `.tfx` manifest; chat-shell is a layout wrapper, not a re-implemented primitive).
  >
  > Uncovered defects: none. One courtesy observation (not a finding): `demo-chatbot.tsx` `setStatus(ac.signal.aborted ? "ready" : "ready")` is a no-op ternary — harmless, pre-existing, outside any design control.

## Ratchet

- **No new control proposed** — the evaluator found no defect uncovered by an existing control. SLP-4 already covered the nested-card root cause; SLP-7 covered the rhythm. Ratchet: no proposal.
- **Courtesy follow-ups (not gating, pre-existing, outside this change's scope):**
  1. `demo-chatbot.tsx` no-op ternary `setStatus(ac.signal.aborted ? "ready" : "ready")` — trivial simplify.
  2. A11Y-5: confirm the `Shimmer` (`motion/react`) keyframe halts under `prefers-reduced-motion` — a human with the OS preference set should eyeball it.
  3. Pre-existing environmental: `[slug]` doc pages hit `Cannot find module './vendor-chunks/@shikijs.js'` on cold-cache `next dev` (shiki MDX highlighter); affects all doc pages, unrelated to this change. Worth a separate look (e.g. `serverExternalPackages`).
