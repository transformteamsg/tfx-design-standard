# Source: Google People + AI Guidebook
Researched: 2026-07-15. URL: https://pair.withgoogle.com/guidebook/

## Principles found

**Chapter: User Needs + Defining Success**
- "Even the best AI will fail if it doesn't provide unique value to users."
- Use AI only when a predictive system creates a personalized experience that could not exist without it.
- Do not use AI just because you can - heuristics or manual control can often create better experiences.
- Frame success criteria as: "We think AI (can/cannot) help solve [user need] because [reason]."
- Automate when tasks are tedious, dangerous, or beyond user ability; augment when users enjoy the task or when stakes are high.
- Weigh false positives and false negatives differently depending on domain consequences - do not treat them equally.
- Evaluate outcomes across 100+ user interactions, not just initial sessions.
- Establish monitoring thresholds: "If [metric] for [feature] changes beyond [threshold], then [action]."

**Chapter: Mental Models**
- Users form mental models before their first interaction, based on product name, onboarding copy, and prior experiences.
- "If the algorithmic nature and limits of these products are not explicitly communicated, they can set expectations that are unrealistic and eventually lead to user disappointment, or even unintended deception."
- Build on existing mental models rather than replacing them from scratch.
- Use a layered onboarding message: "This is [product], and it'll help you by [benefit]. Right now, it's not able to [limit]. Over time, it'll change. You can help it improve by [action]."
- Introduce new features when users need them, not in advance ("inboarding").
- Plan for co-learning: the system adapts to feedback; users adjust their mental model accordingly.
- Design graceful failures with non-AI fallback options.
- Know when not to explain - if AI behavior matches common mental models, adding explanation is noise.

**Chapter: Explainability + Trust**
- Trust has three components: ability (competence), reliability (consistency), and benevolence (honest transparency).
- "Trust is slow to build and requires deliberate, sustained effort across multiple touchpoints."
- Provide partial explanations focused on what users need to decide, not full system explanations.
- Increase explanation detail in high-stakes scenarios (health, finances, safety).
- Tie explanations to specific user actions and contexts, not to abstract system mechanics.
- Use progressive disclosure - deeper explanations outside the active user flow (onboarding, help docs, marketing).
- Skip explanations when systems match user mental models and work reliably.

**Chapter: Feedback + Control**
- Distinguish implicit feedback (behavioral signals) from explicit feedback (intentional user input) - not every action implies a preference.
- "Simply acknowledging that you received a user's feedback can build trust."
- Acknowledge feedback and either adjust immediately or tell users when adjustment will happen.
- Users prefer maintaining control when: they enjoy the task, they feel personally responsible, or stakes are high.
- Always provide a manual fallback and the option to reset to non-personalized defaults.
- "Even in cases where users may not frequently exercise the option to take back control, it can be helpful to let them know that they have that option."
- Do not promise immediate model improvement from a single piece of feedback.

**Chapter: Errors + Graceful Failure**
- AI systems have a third error type beyond user and system errors: context errors (incorrect assumptions about user intent at a given time or place).
- "Learning, machine or otherwise, can't happen without making mistakes."
- Error severity depends on domain stakes - entertainment differs from health and safety.
- Users tolerate errors more in early interactions; after extended use, the same errors feel like failures.
- "Make failure safe and boring" - avoid making dangerous failure modes interesting or over-explaining vulnerabilities.
- Act with humanity in error messaging; avoid technical language.
- Let users correct AI labeling or classification errors - this feeds back into the model.

**Chapter: Data Collection + Evaluation**
- Translate user needs into data needs by mapping: user need -> user action -> ML prediction -> required data.
- Source data with relevance, fairness, privacy, and security in mind.
- Include "noisy" real-world data in training sets - users contribute imperfect inputs (typos, abbreviations, emojis).
- At every stage, human bias can be introduced and then amplified by the model.
- Invest in good data practices early; downstream "data cascades" are costly.
- Document datasets including their contents and the decisions made during collection.
- Learn from label disagreements - discrepancies signal deeper data or instruction issues, not just random noise.

---

## Concrete UI patterns

**Explain the benefit, not the technology** (Pattern 3: Using AI Responsibly).
Show "Your route avoids traffic" rather than "Our ML model processed 2M data points."
Use when introducing an AI-powered feature in any context.

**Determine how to show model confidence, if at all** (Pattern 11: Onboarding Users).
Options: categorical labels (High / Medium / Low), N-best alternatives, numeric percentages.
Numeric percentages are risky unless users understand probability - test before shipping.
Use when the system output has variable certainty visible to the user.

**Automate in phases** (Pattern 17: Explaining AI Systems).
Start with the lowest automation level; let users adjust settings upward.
Progress: suggest -> draft -> auto-apply (with review) -> auto-apply (silent).
Use for any AI feature that takes over a user task incrementally.

**Let users supervise automation** (Pattern 16: Explaining AI Systems).
Enable review and approval of automated decisions.
Provides override capability and builds comfort before higher automation.
Use when automating decisions that affect user work or data.

**Let users give feedback** (Pattern 15: Explaining AI Systems).
Provide thumbs up/down, flagging, or correction at the point of output.
Acknowledge receipt immediately and explain what will change.
Use on every AI-generated output where quality matters.

**Anchor on familiarity** (Pattern 9: Onboarding Users).
Use recognizable UI patterns so users focus on trusting recommendations, not learning interfaces.
Use when introducing an AI-powered version of an existing workflow.

**Give control back to the user when automation fails** (Pattern 18: Supporting Failure).
Provide awareness of the failure, a clear next step, and all context the user needs to act.
Use any time the AI system cannot complete its task.

**Make it safe to explore** (Pattern 8: Using AI Responsibly).
Allow reversible actions and sandbox experiences before requesting data commitments.
Use during onboarding and initial feature activation.

**Go beyond in-the-moment explanations** (Pattern 13: Explaining AI Systems).
Support in-product explanations with marketing, onboarding content, and help docs.
Use when core trust or capability explanation would interrupt the active flow.

---

## Checkable (candidate machine-verifiable rules)

- Every AI-generated output must have at least one explicit feedback mechanism (thumbs up/down, flag, or correction).
- Confidence displays must be categorical (High / Medium / Low) or N-best alternatives by default; numeric percentages require documented justification and user testing.
- Onboarding for any AI feature must state at least one limitation ("it is not able to...") alongside the primary benefit.
- Error messages for AI failures must not use ML/model terminology (no references to "the model", "neural network", "training data" in user-visible copy).
- Any automated action must have a visible override or undo control accessible without leaving the current screen.
- Feedback acknowledgement copy must appear within the same view as the feedback action - not deferred to a separate confirmation screen.
- AI features that can be turned off must expose that toggle within one navigation step from the feature surface.
- High-stakes AI outputs (grades, assessments, recommendations with significant consequences) must include a prompt for the user to verify or cross-check.

---

## Judgment (guideline material)

- Deciding where the product sits on the automate-vs-augment spectrum for each specific task requires understanding the social and emotional value of user effort.
- Choosing which explanation type to surface (general system explanation, specific output explanation, data source explanation) depends on what information changes user behavior in that context.
- Calibrating error message tone requires assessing both domain stakes and the user's state at time of failure.
- Deciding whether a feature's accuracy level is good enough requires domain-specific risk assessment - a 60% accurate system is acceptable or unacceptable depending on user goals.
- Setting data labeling instructions requires iterative collaboration with domain experts; this cannot be front-loaded.
- Choosing how much to progressively disclose about system behavior requires knowing how much cognitive load users can absorb in that moment.
- Assessing whether user feedback (implicit or explicit) is a reliable signal for model tuning requires product-specific analysis of the feedback action's meaning.

---

## Relevance to conversation design vs general AI design

- "Even the best AI will fail if it doesn't provide unique value to users." [ai-general]
- Automate vs augment framework for task selection. [ai-general]
- Layered onboarding message template. [both] - applies to conversational onboarding and UI onboarding equally.
- "If the algorithmic nature and limits of these products are not explicitly communicated, they can set expectations that are unrealistic and eventually lead to unintended deception." [both] - especially relevant to conversational AI where anthropomorphism is built-in.
- Plan for co-learning between user and system. [both]
- Design graceful failures with non-AI fallback options. [both]
- Trust has three components: ability, reliability, benevolence. [ai-general]
- Context errors (AI incorrect assumptions about user intent at a given time/place). [conversation] - highly relevant to intent detection failures.
- "Make failure safe and boring." [both]
- Explicit vs implicit feedback distinction. [both] - implicit in conversation = engagement, re-reads, corrections, follow-ups.
- Feedback acknowledgement builds trust. [both] - in conversation design, this maps to confirmation turns.
- Automate in phases. [ai-general]
- Go beyond in-the-moment explanations into onboarding and help content. [both]
- Include noisy real-world data in training sets. [ai-general]
- Label disagreements are signal, not noise. [ai-general]

---

## Quotes and links

"Even the best AI will fail if it doesn't provide unique value to users."
https://pair.withgoogle.com/guidebook-v2/chapters

"Use AI when the predictive system can create a valuable personalized experience that couldn't exist without it."
https://pair.withgoogle.com/guidebook-v2/patterns

"Don't use AI just because you can. Heuristics or manual control can often create better experiences."
https://pair.withgoogle.com/guidebook-v2/patterns

"If the algorithmic nature and limits of these products are not explicitly communicated, they can set expectations that are unrealistic and eventually lead to user disappointment, or even unintended deception."
https://pair.withgoogle.com/chapter/mental-models/

"Simply acknowledging that you received a user's feedback can build trust."
https://pair.withgoogle.com/chapter/feedback-controls/

"Even in cases where users may not frequently exercise the option to take back control, it can be helpful to let them know that they have that option."
https://pair.withgoogle.com/chapter/feedback-controls/

"Learning, machine or otherwise, can't happen without making mistakes."
https://pair.withgoogle.com/chapter/errors-failing/

"Clarify the AI's limitations, especially in high stakes situations."
https://pair.withgoogle.com/guidebook-v2/patterns

"Avoid suggesting the tech works perfectly in high-stakes situations if unreliable."
https://pair.withgoogle.com/guidebook-v2/patterns
