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

- **Screenshots:** (filled in Phase 5 — desktop before/after per chat demo; one non-chat demo regression check; CMP-3 streaming state frames)
- **Token block line range:** N/A — no `tfx-tokens` exemption region added
- **Dark mode:** N/A — site is light-only (`app/globals.css` custom-variant dark never activated)
- **Verification ledger:** (filled in Phase 5)
- **Evaluator verdict:** (pasted verbatim in Phase 5)

## Ratchet

(filled in Phase 6)
