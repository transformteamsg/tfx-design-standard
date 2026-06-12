# Fixture: Mark entry — screen copy + announcement blurb

<!-- Every ground-truth line in this file is a single-line HTML comment starting at column 1. -->
<!-- Strip them all with: grep -v '^<!--' (see expected-findings-copy.yaml). -->
<!-- The evaluator must never see the stripped lines. -->

## Screen copy (Mark entry)

Page title: Mark entry

Intro: Welcome! Great question — where do your marks go? They're saved as a draft until you submit.
<!-- PLANT 1: SLP-9 — chatbot artifacts ("Welcome!", "Great question —") shipped as UI copy -->

Empty state: No marks yet. Select a class to begin.

Helper under the score field: Enter a score between 0 and 100. Decimals are allowed — use a dot, not a comma.
<!-- DECOY A: single working em dash + an "X, not Y" that IS the rule. Do not flag. -->

Save button: Save marks

Confirmation: This could potentially possibly affect some submitted scores. Continue?
<!-- PLANT 2: SLP-9 — hedging stack ("could potentially possibly") -->

Error message: We couldn't save your marks — your draft is kept on this device. Check your connection and try again.

## Announcement blurb (what's-new panel)

Mark entry isn't just a faster form, it's a new way of thinking about assessment.
<!-- PLANT 3: SLP-9 — negative parallelism as rhetoric -->

The score field serves as the centrepiece of the experience, marking a pivotal step forward in your workflow.
<!-- PLANT 4: SLP-9 — copula avoidance ("serves as") + significance inflation ("pivotal step forward") -->

Plan lessons, track progress, and unlock insights.
<!-- PLANT 5: SLP-9 — forced triad; "unlock insights" is decoration, not a third real thing -->

Marks sync automatically across devices, ensuring a seamless, world-class experience.
<!-- PLANT 6: SLP-9 — superficial -ing tail + buzzwords ("seamless", "world-class") -->

You can enter marks by class, by student, or by assessment.
<!-- DECOY B: genuine triad — the three actual entry modes. Do not flag. -->

Scores are saved as drafts until you submit them, so a wrong tap costs nothing.
<!-- DECOY C: plain, concrete claim. Do not flag. -->
