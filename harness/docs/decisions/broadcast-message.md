# Design decision record — Send an announcement (broadcast to parents)

> Golden-eval task 003. Started at the Phase 3 plan gate; finished at Phase 6.

- **Date:** 2026-07-07
- **Product:** TW
- **Change type:** new page
- **Page type:** form
- **Run type:** attended
- **The teacher and the moment:** Mr. Rahman, Form Teacher of P4 Resilience, 4:15pm — tomorrow's excursion is postponed for weather and he needs all 32 parents told now, to the right class, without firing off a half-written draft.

## Sprint contract (done-criteria)

1. A teacher writes recipients + subject + message and sends to one class's parents in the fewest steps, with the recipient scope visible before sending.
2. Send is guarded by a confirmation that plainly states who receives it (the class + count) and that it can't be unsent, before anything goes out (CMP-2, L0).
3. Send has visible loading / success / error states (CMP-3); the error state keeps the teacher's draft and says so (CNT-1).
4. "ComLink+" appears verbatim as the sending channel — a mandated name carried under a documented CNT-2 waiver, never reworded.
5. Every field has a visible label; the page is keyboard-reachable with visible focus; each async state change uses exactly one announcement channel (A11Y-3, A11Y-2, A11Y-11).
6. One primary action (Send); plain TW voice; semantic tokens only; no anti-slop patterns.

## Chosen approach

**Option B — compose + live preview (two-pane).** A single compose column (To / Subject / Message + a Send / Cancel action row) beside a live "Preview — what parents receive" facsimile of the delivered message. Two-pane at ≥ 880px; stacks to one column at 768 and 360 in the order To → Subject → Message → Preview → Send. The irreversible send is guarded by an inline confirm region (not a dialog) that names the class + recipient count and states it can't be unsent (CMP-2). The preview is rendered as a **message facsimile** — a labelled block that mimics the received message on a light muted surface with a single hairline, not card chrome — chosen at the grill (below) so it reads as an object preview and passes SLP-11 without a waiver.

## Rejected options

- **Option A** — single compose column, confirm as a dialog. Simplest and was the recommendation, but the user chose B for the reassurance the live preview gives before an irreversible send.
- **Option C** — recipient-first 3-step stepper. Over-structures a "one note → one class" task; adds step traversal, cross-step draft safety, and escapability surface for no real gain (HIG Simplicity/Agency).

## Tradeoffs, named

- **Two-pane costs width and adds a second region to maintain** — accepted by making the preview visually subordinate (muted, lighter) and collapsing it below compose at narrow widths, so it never competes with the task (LAY-7) or breaks reflow (LAY-2).
- **The preview is a non-interactive facsimile, not a card** — a deliberate SLP-11/CMP-7 judgment resolved at the grill: it represents the delivered message artifact (like an email preview), so it is framed as a labelled message block, not decorative card chrome.
- **Inline confirm instead of a dialog** — keeps the preview in view while confirming; satisfies CMP-2 via an explicit two-step confirm that names the class + count + irreversibility.

## Plan grill (Phase 3, stage 2)

The plan was grilled before approval (design/grill.md). Decisions resolved:

- **Preview / SLP-11 (human call):** render the preview as a labelled message facsimile on a muted surface with a single hairline — no card shadow/radius stack — so it passes SLP-11 as an object preview. No waiver spent. *(Approved: Reza Ilmi.)*
- **Empty Subject/Message on Send (self-answered):** validate on Send — block, move focus to the first empty field, show an inline message (CNT-1); not a disabled button.
- **Double-send (self-answered):** the confirm button is `disabled` + `aria-busy` during loading, so it can't fire twice.
- **Intent drift (self-answered):** all six done-criteria met; the preview is endorsed scope (Option B), kept subordinate.
- **Waiver honesty (self-answered):** CNT-2 is genuinely mandated ("must appear exactly as written"); approver named below.
- **Out of scope (self-answered):** attachments and multi-class sends — the contract is one class, text only.

## Controls in scope

L0: A11Y-1, A11Y-2, A11Y-3, CMP-2.
L1: A11Y-4, A11Y-5, A11Y-6, A11Y-7, A11Y-8, A11Y-9, A11Y-10, A11Y-11, TOK-1, TOK-2, TOK-3, TYP-1, TYP-2, TYP-3, COL-1, COL-2, CMP-1, CMP-3, CNT-1, CNT-2, IDN-1, SLP-1, SLP-2, SLP-3, SLP-4, SLP-8.
L2: TYP-5, CMP-5, CMP-7, CNT-3, IDN-3, SLP-5, SLP-6, SLP-7, SLP-9, SLP-10, SLP-11, LAY-2, LAY-3, LAY-4, LAY-5, LAY-6, LAY-7, MOT-1.

Async + destructive → this single page inherits the `[flow]` controls CMP-2, CMP-3, A11Y-11.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| CNT-2 | L1 | "ComLink+" is the mandated programme/channel name; must appear verbatim per the brief, not reworded | Reza Ilmi (harness/design lead) | this record + inline `tfx-waive CNT-2` on the page |

## Plan approval

- **Approved by:** Reza Ilmi (user) — after the Phase 3 grill, via the Approve/Adjust gate
- **Approved on:** 2026-07-07

## Verify verdict

- **Screenshots:** width evidence at `docs/loop-run/screenshots/broadcast-message/360-default.png`, `768-default.png`, `1280-default.png` (two-pane), plus `320-default.png` for the LAY-2 320px reflow; state frames `768-confirm.png`, `768-loading.png`, `768-success.png`, `768-error.png`. All viewports verified against actual rendered pixel width before naming.
- **Token block line range:** `broadcast-message.html` `/* tfx-tokens */` region (see the file head).
- **Dark mode:** N/A — the harness loop-run pages have no dark mode (consistent with attendance/grade-entry).
- **Demo hooks (so every async state is photographable):** `?state=confirm|loading|success|error` forces a frame; `?fail=1` forces the real send to error.
- **Verification ledger** (one row per in-scope control family):

  | Control | Method | Evidence |
  |---------|--------|----------|
  | TOK-1/2/3, COL-1 | script | `checks/token-audit.py` exit 0 (clean) — all values from the `/* tfx-tokens */` block |
  | TYP-1/2/3 | script | `checks/type-scan.py` exit 0 (clean) |
  | A11Y-2/3/8 (static subset) | script | `checks/a11y-static.py` exit 0 (clean) after `:focus-visible` fix |
  | CNT-2 waiver | script | `checks/waiver-reconcile.py` — no orphan; inline `tfx-waive CNT-2` + record waiver row |
  | A11Y-1, COL-2 | manual | evaluator hand-computed: muted 6.38:1 (white) / 6.09:1 (surface), danger heading 5.90:1, white-on-brand-600 4.92:1 — all clear AA; disabled label 1.42:1 is WCAG-exempt (inactive) |
  | CMP-2 (L0) | manual | confirm names class + count + irreversibility before send (`768-confirm.png`) |
  | CMP-3 | manual | loading/success/error all reachable + photographed (`768-loading/success/error.png`) |
  | A11Y-11 | manual | traced JS: loading→polite live region; confirm/success/error→focus move, no `role="alert"`; class-change→live region — one channel each |
  | CNT-1 | manual | error copy: what happened → draft saved → what to do next (`768-error.png`) |
  | CMP-5 | manual | one active primary per view; compose Send disabled while confirm open (`768-confirm.png`) |
  | TYP-5 | manual | `tabular-nums` on `.recipient-count .num`, `.confirm .num`, `.success .num` |
  | LAY-2 | manual | reflow holds at 320 (`320-default.png`) and 360 — single column, no loss, controls reachable |
  | LAY-7 | manual | squint test lands on the compose column + CTA; preview subordinate (`1280-default.png`) |
  | SLP-11 | manual | preview judged an object facsimile of the delivered message, not decorative chrome (evaluator concurs); L2 |
  | CMP-1 | manual | asserted, no manifest — native `select`/`input`/`textarea`/`button`, no reinvented dialog |

- **CMP-1: asserted, no manifest — manifest absent for TW.**
- **Post-verdict fixes (non-blocking findings the verdict named, closed after it was rendered):** added `aria-describedby` linking Subject/Message to their inline error text; held focus on the confirm region during the send window; added the 320px reflow capture. Deterministic checks re-run green; changes are additive and do not affect the pass verdict.
- **Evaluator verdict** (verbatim, `tfx:evaluator` agent):

VERDICT: pass

BLOCKING (must fix before ship):
- None. No L0 or L1 control is violated without a waiver. CMP-2 (L0) is complete and plain; A11Y-1/2/3 (L0) hold; the CNT-2 (L1) waiver trail is intact.

Evidence for the six done-criteria (all met):
1. **Fewest-steps send, scope visible** — compose (To/Subject/Message) → inline confirm → send. The recipient scope "32 parents in P4 Resilience will receive this" sits under the To select and updates live on class change. Met.
2. **CMP-2 (L0) guard** — confirm heading "Send to 32 parents?" + body "Everyone in P4 Resilience gets this. A sent announcement can't be unsent." names the object (class + count via tabular `.num`), states the consequence, and states irreversibility, before anything fires. Strong, plain, complete. Met.
3. **CMP-3 + CNT-1** — loading ("Sending…" + `aria-busy` + polite live "Sending your announcement…"), success panel, and error banner all present and reachable (`?state=`/`?fail=1`). Error copy "We couldn't send your announcement / The connection dropped before it went out. Your draft is saved here. Check your connection and try again." is textbook what-happened → what-it-means → what-to-do, no raw code, and the `768-error.png` frame shows the draft preserved. Met.
4. **CNT-2 waived** — "ComLink+" appears verbatim in the title, header, facsimile "via ComLink+", and success, never reworded. Inline `tfx-waive CNT-2` (line 10) + records waiver row + `waiver-reconcile.py` shows no orphan. Met.
5. **Labels / focus / one channel per async state** — every field has an associated visible label; `:focus-visible` ring on all controls and on the confirm/success/error regions; A11Y-11 channels are correct (see notes). Met, with one non-blocking gap below.
6. **One primary / TW voice / tokens / no slop** — single filled brand-600 primary per view (COL-1), plain calm TW copy, all colour/space/radius/type from `/* tfx-tokens */`, no anti-slop tells. `token-audit`, `type-scan`, `a11y-static`, `contrast`, `content-lint` all exit 0. Met.

QUALITY GRADES:
- **Design quality: strong.** The squint test (LAY-7) lands first on the white compose column with the blue CTA; the preview is deliberately subordinate (muted `--color-surface`, narrower 1fr vs 1.4fr) so it reassures without competing. Reading order To → Subject → Message → Preview → Send matches the task, spacing has rhythm (24px between fields, 8px label-to-input), and hierarchy is unambiguous — the teacher always knows what comes next. Kind Utility, not just controls passed.
- **Craft: strong.** Every state is designed — placeholder/empty, focus, disabled, loading, success, error — and the CMP-5 handling is deliberate: the compose "Send announcement" is disabled (greyed, non-competing) the moment the confirm's primary appears, so exactly one active primary reads per view. Tabular figures on all counts (TYP-5), `word-break` on long subject/message, `prefers-reduced-motion` honoured, motion 150–200ms standard easing (MOT-1/SLP-8 clean). Two small imperfections keep it from flawless (see human review).

NON-BLOCKING / HUMAN REVIEW:
- **Field errors lack `aria-describedby` (the one real a11y gap).** On empty-submit, focus moves to the first invalid field and the live region announces the generic "Add the missing details before sending." — but `#subject-error`/`#message-error` are not linked to their inputs, so a screen-reader user landing on the field hears "Subject, invalid" without the specific guidance. The visible error is fine; only the programmatic association is missing. Does not cleanly fail a scoped L0/L1 control — recommend adding `aria-describedby` and a human decides. [Closed post-verdict.]
- **A11Y-11 borderline — validation path fires two channels (stated explicitly).** Empty-submit both moves focus (to the field) and writes the live region. These carry *different* messages (field identity/invalid state vs. a global "add the missing details" summary), so this is not a same-message double-announce and I judge it acceptable — but it is the one place the design leans on both channels. Every *async* transition is cleanly single-channel.
- **A11Y-11 minor — transient focus during loading.** Clicking "Send" disables `#confirm-send`, which drops focus to `<body>` for the ~1.2s window before success/error re-homes it. The polite live region carries the status so nothing is silent, but consider holding focus during the disabled window. Minor. [Closed post-verdict.]
- **SLP-11 borderline — the preview facsimile (stated explicitly).** The `.facsimile` is a card-styled container wrapping *static* content, which strict SLP-11 would flag. I judge it a **pass**: it is an object preview — a facsimile of the delivered message whose framing represents the message artifact boundary, analogous to an email preview; removing the chrome would hurt the "what parents receive" comprehension. Resolved at the grill as a human call (Reza Ilmi) with no waiver spent, and recorded. L2 regardless.
- **SLP-3 adjacent (not a violation).** Both the facsimile and the confirm region use a thick *top* rule on a rounded container. SLP-3 is scoped to *left/side* accent borders, so this does not fire — noted for a human.
- **LAY-2 — 320px not captured.** Reflow verified manually from code and the 360 frame; a true 320px capture would close it deterministically. [Closed post-verdict — `320-default.png` added.]
- **CMP-1 evidence source.** `CMP-1: asserted, no manifest — manifest absent for TW`. It uses native controls that map to the Base UI/shadcn stack; the inline confirm is composition, not a hand-rolled Dialog. Accepted.
- **Manual verification notes:** A11Y-1/COL-2 — computed contrast by hand (muted 6.38:1 / 6.09:1, danger heading 5.90:1 on danger-bg, success glyph 4.86:1, white-on-brand-600 4.92:1 — all clear AA; disabled-button label 1.42:1 is WCAG-exempt). CMP-2/CMP-3/A11Y-11 — traced transitions in the JS. CMP-5/CMP-7 — counted active primaries per frame. TYP-5 — confirmed `tabular-nums`.

## Ratchet

**ratchet: no new control proposal — nothing uncovered.** Every finding the evaluator raised maps to an existing control (A11Y-11, SLP-11, LAY-2, CMP-5) and was either resolved at the grill or closed post-verdict; no defect escaped the catalog.

**Harness observation (not a control gap — for the `feedback` skill if it recurs):** the `agent-browser set viewport` step is the loop's most error-prone capture point — `viewport` (without `set`) and setting the viewport *before* `open` both silently produce 1280-wide frames that pass file naming but are mislabeled evidence. The verify.md "check each frame's actual rendered viewport before naming it" rule caught it here. Worth a one-line capture-recipe note in the setup skill's agent-browser section.
