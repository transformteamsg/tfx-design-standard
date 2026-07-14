# Source: Microsoft HAX Toolkit
Researched: 2026-07-15. URL: https://www.microsoft.com/en-us/haxtoolkit/library/

Origin: 18 guidelines synthesized from 20+ years of research, published in an award-winning 2019 CHI paper by Saleema Amershi and colleagues at Microsoft Research.
Validated with 49 design practitioners across 20 popular AI-infused products.

## The 18 guidelines

Guidelines group into four interaction phases, labeled Initially / During / When Wrong / Over Time.

### Initially - set expectations before the user commits

**G1 - Make clear what the system can do** [initially]
Help the user understand what the AI system is capable of doing.
Set capability expectations upfront to prevent frustration and product abandonment.

**G2 - Make clear how well the system can do what it can do** [initially]
Accurately communicate AI confidence and performance levels so users are not misled about reliability.
Sub-patterns include matching UI language precision (G2-A) and numbers (G2-B) to actual system performance.

### During - behave well inside an active session

**G3 - Time services based on context** [during]
Act or interrupt at the right moment in the user's workflow - not before, not after.

**G4 - Show contextually relevant information** [during]
Display only what is pertinent to the user's current task and context.

**G5 - Match relevant social norms** [during]
Align AI behavior and language with cultural and social expectations of the user's context.

**G6 - Mitigate social biases** [during]
Actively reduce stereotyping and bias in AI outputs and suggestions.

**G7 - Support efficient invocation** [during]
Make it easy for the user to trigger or call upon the AI when they want it.

**G8 - Support efficient dismissal** [during]
Make it easy for the user to stop, ignore, or close AI-initiated actions or suggestions.

**G9 - Support efficient correction** [during]
Make it easy for the user to fix AI mistakes; corrections also serve as feedback for learning.

**G10 - Scope services when in doubt** [during]
When the AI is uncertain, narrow its scope or ask for clarification rather than acting on a wrong assumption.
Example: an AI assistant unsure whom to call should ask "Do you mean Bill G. or Bill C.?" rather than call the wrong person.

**G11 - Make clear why the system did what it did** [during]
Explain the AI's reasoning so users understand how to change inputs to achieve a different output.
Sub-patterns include global explanations (G11-B), properties of outputs (G11-C), and "what if?" simulations (G11-G).

### When Wrong - recover gracefully from errors

**G12 - Remember recent interactions** [when wrong]
Maintain context across a session so the user does not have to repeat themselves after an error.

**G13 - Learn from user behavior** [when wrong]
Adapt to individual user preferences based on observed actions over time.

**G14 - Update and adapt cautiously** [when wrong]
Make changes gradually and deliberately; flooding users with rapid updates is disorienting, but imperceptibly slow changes undermine trust that the system learned.

**G15 - Encourage granular feedback** [when wrong]
Enable users to alter AI behavior through editing, correcting, or refining outputs; make clear that corrections feed future learning.

### Over Time - grow with the user across sessions

**G16 - Convey the consequences of user actions** [over time]
Show users how their interactions shape the AI's future behavior - before (feedforward), after (feedback), or in documentation.
Sub-patterns: G16-A (before action), G16-B (after action), G16-C (reconfirmation reminder), G16-D (help docs).

**G17 - Provide global controls** [over time]
Let users customize AI behavior system-wide, not just per-interaction.

**G18 - Notify users about changes** [over time]
Inform users when the AI has updated or changed its behavior so they are not caught off guard.

## Concrete UI patterns

Pattern codes match guideline numbers; all patterns are UI-independent.

**G1-A: Introductory blurb** - brief onboarding text that describes what the AI does before first use.
**G1-C: Expose system controls** - surface adjustable settings to reveal capability scope; pitfall: over-promising causes abandonment.
**G1-D: Demonstrate possible inputs** - show clickable example prompts, auto-completions, or pre-filled fields; choose examples for diversity, popularity, and relevance; pitfall: examples must perform well or trust breaks.
**G1-E: Show a set of system outputs** - display sample outputs so users calibrate expectations before interacting.
**G1-B: Use explanation (G11) patterns** - cross-link capability explanations with reasoning patterns from G11.

**G9-A: Switch classification decisions** - give users a toggle or button to flip a classification output (e.g., not spam).
**G9-B: Rich and detailed edits** - allow in-line editing of AI-generated content with structured editing UI.
**G9-D: Do G9 through G15** - a compound pattern covering correction, feedback, learning, and consequences in one integrated flow; warning: if corrections are too frequent, offer an opt-out.

**G11-B: Global explanations** - show how the AI system makes decisions in aggregate, not just per-instance.
**G11-C: Present properties of system outputs** - label outputs with relevant attributes (confidence score, sources, category).
**G11-G: "What if?" explanations** - let users adjust variables and see how outputs would change; best for decision-support tools; pitfall: unclear cause-and-effect breaks the pattern.

**G14-A: Comprehensive updates** - deliver system adaptations as deliberate, permeating updates rather than isolated patches; calibrate scale and rate with ML practitioners to avoid overwhelming or underwhelming users.

**G16-A/B: Feedforward and feedback** - show consequences before an action (feedforward) and confirm what changed after (feedback); example: photo tagging app previewing how a new tag affects other photos.

## Checkable (candidate machine-verifiable rules)

These G-rules map to conditions a coding agent can scan or test:

- **G1** - Does onboarding or first-run surface text describing what the AI can do?
  Pass: introductory blurb or capability examples exist before first AI call.
- **G2** - Does the UI communicate confidence or accuracy level?
  Pass: confidence score, accuracy disclaimer, or hedging language present.
- **G7** - Is there a clearly labeled trigger for the AI feature?
  Pass: button, shortcut, or affordance exists and is reachable within two taps/clicks.
- **G8** - Can the user dismiss or pause the AI output in one action?
  Pass: dismiss control is present and visible while AI output is active.
- **G9** - Is there an edit or correction affordance on AI-generated content?
  Pass: inline edit, thumb-down, or "refine" control is present on output.
- **G11** - Is an explanation or source indicator shown with AI output?
  Pass: attribution, confidence label, or "why?" link present.
- **G17** - Does the product have a global AI settings page?
  Pass: user preferences for AI behavior exist and persist across sessions.
- **G18** - Does the product notify users after a model or behavior update?
  Pass: changelog entry, in-app notice, or email exists for material changes.

## Judgment (guideline material)

These G-rules require designer interpretation and cannot be reduced to a pass/fail scan:

- **G3** - Timing requires domain knowledge about when an interruption is welcome vs. disruptive.
- **G4** - "Contextually relevant" depends on task and user goals that vary by screen.
- **G5** - Social norm matching requires cultural research and persona work.
- **G6** - Bias mitigation requires audit methodology, not just a UI check.
- **G10** - Scoping when in doubt requires calibrating the cost of under-action vs. wrong action per use case.
- **G13** - What counts as appropriate learning vs. creepy tracking is a product values call.
- **G14** - What update rate feels cautious vs. stagnant depends on user expectations in the domain.
- **G15** - Granularity of feedback to request depends on how the model actually uses the signal.
- **G16** - Which consequences to surface (and when) requires judgment about what users find useful vs. overwhelming.

## Relevance to conversation design vs general AI design

[conversation] guidelines are especially relevant to chat and voice AI surfaces.
[ai-general] guidelines apply to any AI feature regardless of modality.
[both] guidelines apply strongly to both.

- G1 - Set capability expectations on entry [both] - critical for conversation (users improvise prompts) and for feature-based AI (users mis-scope tasks)
- G2 - Communicate performance level [ai-general] - more visible in classification and recommendation than in open-ended chat
- G3 - Time services [both] - proactive suggestions in chat vs. auto-triggers in tools
- G4 - Show contextual information [both]
- G5 - Match social norms [conversation] - tone, formality, and persona are central conversation concerns
- G6 - Mitigate bias [both] - language models amplify this for conversation
- G7 - Efficient invocation [ai-general] - important for embedded tools; conversation entry is usually the input field itself
- G8 - Efficient dismissal [both] - stopping a streaming response is a core conversation pattern
- G9 - Efficient correction [both] - editing a chat turn vs. correcting a classification
- G10 - Scope when in doubt [conversation] - ambiguity resolution ("did you mean X or Y?") is a core dialogue pattern
- G11 - Explain reasoning [both] - "show your work" is critical in both
- G12 - Remember recent interactions [conversation] - multi-turn memory is a defining conversation capability
- G13 - Learn from behavior [ai-general] - more relevant to recommendation and personalization than pure chat
- G14 - Update cautiously [ai-general] - model updates visible at product level
- G15 - Granular feedback [both] - thumbs-down on a chat turn vs. correcting a label
- G16 - Convey consequences [both] - "this will retrain the model" is important in both
- G17 - Global controls [both] - tone/persona settings for conversation; content filters for general AI
- G18 - Notify of changes [ai-general] - model version announcements matter across all AI surfaces

## Quotes and links

"AI is the most ambiguous space I've ever worked in - there aren't any real rules."
- practitioner quote cited as motivation for the toolkit
Source: https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/

"Over-inflated user expectations have been shown to cause frustration and even product abandonment."
Source: https://www.microsoft.com/en-us/haxtoolkit/pattern/g1-c-expose-system-controls/

"If the assistant is unsure whom to call, requesting clarification can be less costly than calling the wrong person."
- description of G10 scoping pattern
Source: https://www.microsoft.com/en-us/haxtoolkit/library/

"Make a controlled and deliberate comprehensive update in response to user behaviors or other signals."
- description of G14-A
Source: https://www.microsoft.com/en-us/haxtoolkit/pattern/g14-a-comprehensive-updates/

"Enable users to alter the AI system's behavior by editing, correcting, or refining its output, and make clear that their correction will be used as feedback for learning over time."
- description of G15
Source: https://www.microsoft.com/en-us/haxtoolkit/library/

Individual guideline pages: https://www.microsoft.com/en-us/haxtoolkit/guideline/make-clear-what-the-system-can-do/
Full design patterns index: https://www.microsoft.com/en-us/haxtoolkit/design-patterns/
HAX Workbook (team planning tool): https://www.microsoft.com/en-us/haxtoolkit/workbook/
Original 2019 CHI paper: https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/
