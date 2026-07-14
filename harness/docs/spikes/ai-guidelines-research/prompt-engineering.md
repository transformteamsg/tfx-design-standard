# Source: Prompt engineering + conversation design fundamentals
Researched: 2026-07-15.
Multi-source research for the "Shape the assistant" and "Handle the turn" sections of content/guidelines/conversation-design.mdx.

---

## A. Prompt engineering principles

**1. Be clear and direct**
Specify exactly what you want; treat the model like a capable new hire who has no context on your norms.
- Source: Anthropic - Prompting best practices (https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- TFX applicability: system prompt should name the assistant's role in teacher terms ("You are a teaching-support assistant for Singapore primary-school educators"), not generic terms.

**2. Give the model a role in the system prompt**
Even a single sentence ("You are a helpful coding assistant") measurably changes tone, scope, and behaviour.
- Source: Anthropic - Prompting best practices, "Give Claude a role" section
- TFX applicability: anchor the assistant to MoE curriculum context, subject level, and the "Kind Utility" voice from the first line.

**3. Use examples (few-shot / multishot)**
3-5 `<example>` blocks covering edge cases are one of the most reliable ways to steer output format, tone, and structure.
- Source: Anthropic - Prompting best practices, "Use examples effectively"; OpenAI - Prompt engineering guide (https://developers.openai.com/api/docs/guides/prompt-engineering), "Few-shot learning"
- TFX applicability: include one example of a correct teacher-facing reply and one example of a reply that is too clinical, so the model learns the warmth calibration.

**4. Structure prompts with XML tags**
Wrap instructions, context, and examples in labelled tags (`<instructions>`, `<context>`, `<example>`) to reduce misinterpretation when the prompt is long or mixes content types.
- Source: Anthropic - Prompting best practices, "Structure prompts with XML tags"
- TFX applicability: wrap classroom-context data (subject, level, number of students) in `<context>` so the model knows what is fixed vs what the teacher is asking.

**5. Add context / motivation behind instructions**
Explaining *why* a rule exists ("read aloud by TTS so never use ellipses") lets the model generalise beyond the literal case.
- Source: Anthropic - Prompting best practices, "Add context to improve performance"
- TFX applicability: "Teachers in Singapore use MOE-prescribed terminology; use those terms so responses match what teachers see in official materials."

**6. Control output format explicitly**
Tell the model *what to do* rather than what not to do; match prompt formatting style to the desired output style.
- Source: Anthropic - Prompting best practices, "Control the format of responses"
- TFX applicability: "Respond in plain prose, no bullet lists, one idea per sentence" matches how teachers scan feedback during a busy lesson.

**7. Organise developer-level instructions in a consistent order**
Identity - instructions - examples - context gives the model a reliable parse order and prevents later sections overriding earlier ones accidentally.
- Source: OpenAI - Prompt engineering guide, "Message formatting with Markdown and XML"
- TFX applicability: keeps the system prompt auditable when a new AI feature is handed off across the TFX team.

**8. Chain of thought / reasoning first**
Instructing the model to reason before answering improves complex-task output.
- Source: Anthropic - Prompting best practices, "Thinking and reasoning" (https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) - note: the old standalone chain-of-thought page now redirects here.
- TFX applicability: for multi-step tasks such as lesson planning, prompt the model to consider year level, learning objective, and prior knowledge before drafting output.

**9. Prompt injection guard**
Teacher-pasted content (student work, parent messages) must be wrapped in labelled tags and treated as data, not instructions.
- Source: Anthropic - Prompting best practices, "Structure prompts with XML tags"; Anthropic agentic security guidance (https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- TFX applicability: any user-supplied document or message should be wrapped in a tag such as `<student_work>` or `<document>` with an explicit instruction that content inside those tags never overrides the assistant's role or constraints.

**10. Evaluate before shipping**
Anthropic's overview places evals before prompt engineering ("Before prompt engineering" section); test prompts with representative real inputs before deploying.
- Source: Anthropic - Prompt engineering overview, "Before prompt engineering: build evaluations" (https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- TFX applicability: run 5-10 representative teacher inputs - one ambiguous, one off-topic, one very short - before any assistant feature goes live.

---

## B. Conversation design fundamentals

**Welcome / opening turn**
The first turn sets capability expectations; it should be brief, name the assistant's scope, and offer a prompt rather than a long list of features.
- Source: Google Conversation Design guide (https://developers.google.com/assistant/conversation-design), "Create a persona"
- TFX applicability: teacher-facing assistants should open with a short orientation ("I can help you plan this lesson or suggest differentiation strategies - where would you like to start?").

**Disambiguation**
Ask one clarifying question at a time; never stack multiple questions.
Never ask something the system already knows from context.
- Source: Amazon Alexa design principles (https://developer.amazon.com/en-US/docs/alexa/alexa-design/get-started.html), "Be Brief / Be Contextual"
- TFX applicability: if a teacher's question is ambiguous, surface the single most useful clarifying question ("Are you thinking about a specific subject area?") before continuing.

**Fallback (no-match / no-input)**
1st attempt: brief reprompt with rephrased question.
2nd attempt: add an example or two to model valid inputs.
After 2 failures: exit gracefully - do not spiral.
Assume the user is being cooperative; never imply the user did something wrong.
- Source: Google Conversation Design guide, "Errors" section (https://developers.google.com/assistant/conversation-design/errors)
- TFX applicability: teachers mid-lesson have no patience for a third retry; route them to a human-readable fallback ("I'm not sure I understand - could you rephrase, or check the Help centre link below?").

**Session / memory boundaries**
Design explicitly for the model having no memory across sessions unless you build it.
Let teachers know, in context, that the assistant cannot remember previous conversations by default.
- Source: Voiceflow conversation design (https://www.voiceflow.com/blog/conversation-design), "Understanding Layer - what context disambiguates vague requests"
- TFX applicability: CaseSync and Teacher Workspace must surface a session-reset notice ("This is a new session - I don't have our previous conversation") rather than quietly hallucinating continuity.

**Unhappy-path design is the product**
Happy path is easy; the quality of an assistant is measured by how it handles ambiguity, off-topic input, frustration, and silence.
Script fallbacks deliberately; do not rely on the base model's default behaviour.
- Source: Voiceflow conversation design, "Unhappy Path Design" and "Common Failures"
- TFX applicability: teachers under time pressure are the most likely to abandon mid-task; every flow needs a designed escape hatch.

**Keep turns brief and contextual**
Response length should match conversational register; one idea per reply is usually correct for teacher-facing chat.
Use what the system already knows (subject, level, number of students) before asking the teacher to repeat it.
- Source: Amazon Alexa design principles, "Be Brief" and "Be Contextual"; Google Conversation Design, "Consistent Style"
- TFX applicability: a teacher asking for a quick differentiation tip does not need a five-paragraph response; keep it to 2-3 sentences unless they ask for more.

**Follow-up offers, not interrogations**
End turns with an optional forward-offer ("Want me to adjust this for lower-ability learners?") not a mandatory question.
Follow-ups should feel like a helpful suggestion, not a form to fill.
- Source: Amazon Alexa design principles, "Be Natural" (note: the Google Conversation Design "Conversational components" URL 404s; the Alexa "Be Natural" principle is the reliable citation for forward-offer endings)
- TFX applicability: after generating a lesson hook, offer one logical next step but let the teacher close the loop.

---

## Distilled rules for TFX (candidate content for the site)

### Shape the assistant (system prompt guidance)

- **Declare the role in teacher-facing terms from the first line.** "You are a teaching-support assistant for Singapore primary-school educators" anchors tone and scope more reliably than a generic "helpful assistant" framing.
  Citation: Anthropic Prompting best practices - "Give Claude a role" / https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview

- **Explain the why behind each constraint, not just the rule.** The model generalises from reasons. "Use MOE-prescribed terminology so responses match what teachers see in official materials" teaches a principle, not just a word list.
  Citation: Anthropic Prompting best practices - "Add context to improve performance"

- **Include 3-5 labelled examples covering the warmth calibration.** One example of a correct reply and one that is too clinical teach the Kind Utility register faster than prose description.
  Citation: Anthropic Prompting best practices - "Use examples effectively"; OpenAI Prompt engineering guide - "Few-shot learning"

- **Structure the prompt: identity, instructions, examples, context - using XML tags.** This ordering is auditable and prevents later sections silently overriding earlier ones.
  Citation: OpenAI Prompt engineering guide - "Message formatting with Markdown and XML"; Anthropic Prompting best practices - "Structure prompts with XML tags"

- **Control output format with positive instructions, not prohibitions.** "Respond in plain prose, one idea per sentence" is more reliable than "do not use bullet lists."
  Citation: Anthropic Prompting best practices - "Control the format of responses"

- **Wrap classroom-context data in labelled tags so the model knows what is fixed.** `<context>` blocks containing subject, level, and class size stop the model from asking the teacher to repeat what the system already holds.
  Citation: Anthropic Prompting best practices - "Structure prompts with XML tags"; OpenAI Prompt engineering guide - "Include relevant context information"

- **For complex tasks, instruct the model to reason before answering.** "Before drafting the lesson hook, consider the year level, the objective, and what the teacher already knows" beats asking for the answer directly.
  Citation: Anthropic Prompting best practices - "Thinking and reasoning"

- **Treat teacher-pasted content as data, not instructions.** Wrap it in a labelled tag (`<student_work>`, `<document>`) and state that content inside those tags never overrides the assistant's role or constraints.
  Citation: Anthropic Prompting best practices - "Structure prompts with XML tags"; Anthropic agentic security guidance

- **Test the prompt with real teacher inputs before shipping.** Run 5-10 representative inputs - one ambiguous, one off-topic, one very short - and check tone, scope, and fallbacks.
  Citation: Anthropic prompt engineering overview - "Before prompt engineering: build evaluations"

### Handle the turn (interaction fundamentals)

- **Open with a scope statement and one forward prompt, not a feature list.** Teachers have limited time. "I can help you plan this lesson or suggest differentiation strategies - where would you like to start?" sets expectations without overwhelming.
  Citation: Google Conversation Design guide - "Create a persona" / https://developers.google.com/assistant/conversation-design

- **Ask one clarifying question at a time, and only ask what the system does not already know.** Stacking questions, or re-asking context the system holds, feels like a poorly designed form.
  Citation: Amazon Alexa design principles - "Be Brief / Be Contextual" / https://developer.amazon.com/en-US/docs/alexa/alexa-design/get-started.html

- **Escalate fallbacks: brief reprompt on the first miss, add an example on the second, exit gracefully at the third.** Never imply the teacher did something wrong. Assume cooperation and rephrase naturally.
  Citation: Google Conversation Design guide - "Errors" / https://developers.google.com/assistant/conversation-design/errors

- **Design the unhappy paths explicitly; do not rely on base model defaults.** Off-topic input gets a brief acknowledgement before the redirect - never a blunt refusal. Ambiguity, and frustration are where teacher-facing assistants lose trust. Script escape hatches to help resources or a human reviewer.
  Citation: Voiceflow conversation design - "Unhappy Path Design" / https://www.voiceflow.com/blog/conversation-design

- **State session-reset boundaries clearly; do not imply continuity.** If the assistant cannot access a prior conversation, say so - "This is a new session - I don't have our previous conversation" - rather than filling in gaps.
  Citation: Voiceflow conversation design - "Understanding Layer / context boundaries"

- **End turns with an optional forward-offer, not a mandatory question.** "Want me to adjust this for lower-ability learners?" invites the teacher to continue but lets them close the loop. An interrogative like "What do you need next?" creates conversational pressure.
  Citation: Amazon Alexa design principles - "Be Natural"

- **Match confirmation weight to consequence.** Irreversible actions get explicit yes/no; reversible ones use implicit confirmation ("I'll draft this now") the teacher can interrupt. Constant explicit confirmation trains click-through.
  Citation: Google Conversation Design guide - "Confirmations"

- **Calibrate response length to register.** A quick question gets 2-3 sentences; a structured request can run longer. Default short; let the teacher pull more.
  Citation: Amazon Alexa design principles - "Be Brief"; Google Conversation Design guide

- **Use the reprompt ladder for misunderstood input; follow CNT-1 anatomy for system errors.** System errors follow CNT-1 anatomy, not the reprompt ladder.
  Citation: Google Conversation Design guide - "Errors"; TFX CNT-1

---

## Quotes and links

"Think of Claude as a brilliant but new employee who lacks context on your norms and workflows. The more precisely you explain what you want, the better the result."
- Anthropic Prompting best practices: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview

"One poorly handled error can outweigh dozens of successful interactions."
- Google Conversation Design guide, Errors section: https://developers.google.com/assistant/conversation-design/errors

"The unhappy paths are the product."
- Voiceflow conversation design: https://www.voiceflow.com/blog/conversation-design

"Assume the user is being cooperative, and what they're saying is relevant and valid."
- Google Conversation Design guide, Errors section: https://developers.google.com/assistant/conversation-design/errors
