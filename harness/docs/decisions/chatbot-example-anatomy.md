# Design decision record — DemoChatbot → AI Elements chatbot-example anatomy (mock)

- **Date:** 2026-07-15
- **Product:** TW surface (design-standard site — Conversation UX page, `/ai/conversation-ux`)
- **Change type:** modification
- **Page type:** flagship component demo embedded in MDX (`content/ai/conversation-ux.mdx`, via `doc-page.tsx`)
- **Run type:** attended
- **The teacher and the moment:** Not a teacher — a TFX designer/agent studying the design-standard site to see the canonical AI Elements chatbot composition and reproduce it on-brand.

## Sprint contract (done-criteria)

Bring `DemoChatbot` up to the official AI Elements chatbot example ([elements.ai-sdk.dev/examples/chatbot](https://elements.ai-sdk.dev/examples/chatbot)) anatomy, staying mock (no `useChat`, no API route, no key, static-safe):
1. Web-search toggle (`PromptInputButton` + `GlobeIcon`, `variant` default/ghost) present in a `PromptInputTools` group.
2. `Loader` shown on `status === "submitted"` (pending window before first token).
3. `MessageActions` (Copy + Retry) on the last completed assistant turn; Retry regenerates.
4. Input restructured to the example's `PromptInputBody` / `PromptInputFooter` / `PromptInputTools` anatomy.
5. Stays mock — `MockChatTransport`, no network; existing empty state, suggestions, reasoning, sources, stop control preserved; AI Elements source components not restyled.

## Chosen approach

Extended the existing `DemoChatbot` rather than rewriting from the example's `useChat` version. Added `webSearch` state + a `PromptInputButton` toggle; installed the AI Elements `loader` component (registry) and rendered `{status === "submitted" && <Loader />}`; added `MessageActions` (Copy → clipboard, Retry → `regenerate`); refactored the send path into a shared `streamAssistant(history)` so send and Retry share one streaming code path. The mock (`mock-chat.ts`) now reads `body.webSearch` and returns Sources only when search is on — mirroring a search-enabled model (perplexity/sonar) so the toggle is meaningful, not decorative.

**Deliberate deviation from "exactly":** the example wires `useChat` to a live `/api/chat` route (perplexity/sonar + AI Gateway key). Kept mock per the approved scope — a static docs site should not ship a live LLM endpoint or require a secret. Also omitted the example's `PromptInputActionMenu` file-attachment affordance: it would be a dead control in the mock, and `DemoPromptInput` already demonstrates attachments. Both approved by Tasha at the plan gate.

## Rejected options

- **Rebuild on `useChat` + live API route** — rejected: needs `AI_GATEWAY_API_KEY` (a secret I won't handle) and turns the static docs site into one with a live LLM endpoint. Out of scope for a design-standard demo.

## Tradeoffs, named

1. The mock diverges from the example's live-network reality — it teaches the *UI anatomy* faithfully but not the server wiring. Acceptable: the demo's job is the composition, and the page links to the real example for the backend.
2. Retry re-streams the mock canned reply (same text) rather than a genuinely new generation. Acceptable in a mock; the affordance and flow are what the demo teaches.

## Controls in scope

TOK-1..3 (tokens only), TYP-1 (fonts), A11Y-1 (contrast — Search active uses `--primary` = TW Blue), A11Y-2 (keyboard/focus; Search toggle has `aria-pressed` + `aria-label`), A11Y-5 (reduced-motion — `mock-chat.ts` streams instantly under the preference), CMP-3 (loading/streaming/success states + stop control), CMP-7 (component defaults — used at defaults), SLP-4/7 (no nested card; rhythm preserved via `ChatShell`). CMP-1 asserted (no `.tfx` manifest; `loader` is an installed AI Elements component, `DemoChatbot` composes existing components).

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| — | — | none | — | — |

## Plan approval

- **Approved by:** Tasha (attended Approve/Adjust gate — chose: omit attachments menu, mock gates Sources on Search, build)
- **Approved on:** 2026-07-15

## Verify verdict

- **Route:** `/ai/conversation-ux` (flagship demo, first on the page).
- **Screenshots (desktop, dev server):**
  - New toolbar: Search toggle (globe) + model select + submit, caption lists Loader/MessageActions/PromptInputTools/PromptInputButton (`ss_5464w2eci`).
  - Search toggled ON → filled TW Blue active state (`ss_30316qm41`).
  - **CMP-3 loading:** `Loader` spinner in the submitted window under the user bubble (`ss_58349bm3s`).
  - **CMP-3 streaming:** reasoning auto-open "Thinking…", stop control visible (`ss_7279ioiy5`); "Used 2 sources" appears because Search is ON (`ss_8032omguo`).
  - **CMP-3 success:** collapsed reasoning ("Thought for 24 seconds"), Sources, full response, `MessageActions` (Retry + Copy) rendered, input back to ready (`ss_9253xng39`).
  - Retry regenerates: trims the assistant turn and re-streams (Loader again) (`ss_1312iofkk`).
- **Deterministic:** `tsc --noEmit` exit 0; `token-audit.py` clean; no raw hex in `demo-chatbot.tsx` / `mock-chat.ts` / `loader.tsx`; `loader.tsx` has no `dark:`/hex.
- **Dark mode:** N/A — site is light-only.
- **Evaluator verdict (verbatim, agent `tfx-design-evaluator`):**

  > VERDICT: pass-with-findings
  >
  > BLOCKING: None. Every L0/L1 control in scope that I could verify passes; the one L1 residual (A11Y-5) is a near-zero-exposure close call graded advisory with a named human re-check, not a clear fail.
  >
  > ADVISORY:
  > - A11Y-5 (L1) — reduced-motion residual, close call. The A11Y-5 claim is scoped to "mock-chat streams instantly under the preference" (verified: the `instant` gate zeroes the round-trip and per-word delays). But this change introduces the `Loader` (`animate-spin`, no `motion-reduce:` variant) and relies on the reasoning `Shimmer` (infinite repeat) + reasoning slide; there is no global `prefers-reduced-motion` killswitch in `app/globals.css` and `tw-animate-css` ships none. Mitigating: instant streaming makes the Loader/Shimmer on-screen near-zero, and a spinner is defensibly essential motion (A11Y-5 exempts non-essential only). Residual: the reasoning slide still fires on user expand/collapse; keyframe halt not code-provable. No waiver on file. Better fix: a blanket reduce guard. Recommend a human screen-recording under `prefers-reduced-motion: reduce`.
  > - CMP-3 success-state for Copy (L1), minor. Copy calls `navigator.clipboard.writeText` with no visible success confirmation. Borderline (clipboard is an instant local op; no-toast is convention). Advisory. Worth a transient "Copied" affordance.
  >
  > QUALITY: Design strong (input reads in task order; single-surface ChatShell, SLP-4 preserved); Originality strong (faithfully reproduces the canonical anatomy — right for an exemplar; two omissions recorded/justified); Craft strong (one shared `streamAssistant` for send + retry; clean abort; MessageActions gate correctly; Sources gating makes the toggle meaningful; empty/loading/streaming/success states designed); Functionality strong (send/stop/retry/search all work, no dead ends); Dark mode N/A.
  >
  > Done-criteria: (1) web-search toggle MET; (2) Loader on submitted MET; (3) MessageActions Copy+Retry, Retry regenerates MET; (4) PromptInputBody/Footer/Tools anatomy MET; (5) stays mock, source components unrestyled, empty/suggestions/reasoning/sources/stop preserved MET. Approved deviations (live route + attachment menu omitted) confirmed against the record, not defects.
  >
  > Ledger: TOK-1/2/3 pass (token-audit exit 0; `fill="white"` in loader.tsx is an SVG mask region, not a token); TYP-1 pass (no font-family added); A11Y-1 pass-with-caveat (Search active = --primary/TW Blue + white, AA pair by token resolution, not pixel-measured); A11Y-2 pass (native button, focus ring intact); A11Y-8 pass (aria-pressed + aria-label track the visual; MessageAction names via sr-only label); A11Y-5 unverified (Loader/Shimmer/slide reduce-guard — human recording needed); CMP-3 pass-with-caveat (loading/streaming/success + stop present; error path exists; Copy success-state gap); CMP-7 pass (defaults, no override; toolbar members both interactive; sole flagship instance); SLP-4 pass (ChatShell in DemoFrame, no inner card); SLP-7 pass (mixed spacing, rhythm preserved); CMP-1 pass (no manifest; composes existing components + registry Loader). git: message/prompt-input/conversation/reasoning/sources.tsx unchanged vs HEAD; no `useChat` import; no `app/api/chat` route; tsc exit 0.
  >
  > UNCOVERED: None observed.

## Ratchet

- **No new control proposed** — the evaluator found no uncovered defect. The two advisories are covered by existing controls (A11Y-5, CMP-3). Ratchet: no proposal.
- **Follow-ups (advisory, not gating):**
  1. **A11Y-5 (site-wide, pre-existing):** there is no global `prefers-reduced-motion: reduce` killswitch in `app/globals.css`. This change surfaces it via the new `Loader` spinner. Recommend adding a blanket reduce guard (or `motion-reduce:` variants on the animated components) and a human screen-recording to confirm. Owner decision — it's a shared-file, site-wide change beyond this demo's scope, so not made here.
  2. **CMP-3 Copy success-state:** add a transient "Copied" affordance to the Copy action (would pull in a toast/`sonner` + `Toaster`; deferred as it exceeds the mock demo's minimal footprint).
