# AI designer skills - brainstorm

Draft, not committed to the harness yet. Skills a designer could invoke as they build an AI feature, mapped to actual moments in the design workflow. The existing `ai` skill is a machine-twin of the standard - it enforces the rules when Claude Code is writing code. That is useful for the agent, but a designer at the mockup stage needs different help: skills that help them think, not skills that police them.

## The moments a designer needs help

1. Deciding whether AI is the right call
2. Picking the shape of the feature
3. Writing the system prompt
4. Designing what happens when it goes wrong
5. Reviewing the design against the ten principles
6. Writing the copy for AI states
7. Planning how to evaluate whether it works

## Skill candidates

### 1. `ai-triage` - "should this even be AI?"

Trigger: a PM or engineer comes to you with "let's add AI to X".

Runs a short interview: what is the user actually trying to do; is there a deterministic rule that would work; what is the cost of the AI being wrong; who bears that cost. Returns a verdict (do it / don't do it / do a simpler thing first) with the reasoning.

Prevents the "we added a chat because we could" trap.

### 2. `ai-pattern-pick` - "what shape should this feature take?"

Trigger: you know AI is the right call, now you need to pick between suggestion / draft / summariser / Q&A / classifier / agent / chat.

Walks the seven patterns against the specific user need you name. Returns the strongest fit with the second-choice named and rejected. Ends by telling you which components you will need.

Basically the Patterns page as an interactive interview.

### 3. `ai-prompt-draft` - "write the system prompt for this feature"

Trigger: you know your pattern and audience, need the prompt.

Asks the role, the user, the task, the tone, the constraints. Drafts a system prompt that passes all eight rules on the Prompts page. Labelled examples included. You review, edit, ship.

### 4. `ai-failure-design` - "what happens when this AI is wrong?"

Trigger: pre-launch review, or when you feel uneasy about a feature.

Given the feature, generates the ten most likely failure modes ranked by user impact. Names the recovery path for each: guardrail, fallback, undo, escalation, silence.

Turns "what if it hallucinates" into a concrete list to design against.

### 5. `ai-review` - "walk this mockup through the ten checks"

Trigger: you have a design ready for crit, want to self-check before showing.

Takes a screenshot / MDX / component and walks the ten principles as an audit. Returns pass / needs-work / broken per principle, with the specific screen element flagged.

Different from the general `critique` skill which is broad. This one is scoped to the AI checks only.

### 6. `ai-copy` - "write the strings for the AI states"

Trigger: you are building an AI surface and need the AI label wording, the error copy, the empty state, the confirmation gate copy, the source list header.

Drafts them all following the AI-copy conventions: no model terminology, plain language, second person, no gradient badges. One call per surface.

### 7. `ai-eval-plan` - "how will we know if this is actually working?"

Trigger: pre-launch, planning eval.

Given the feature and its pattern, drafts an eval plan: what to test, what "good" looks like per output type, what to break down by (age group, task type, language), what MIT Impact Bench categories apply.

Not the eval itself. The plan for one.

### 8. `ai-student-check` - "if students will use this, run it again for them"

Trigger: you have designed for adults; feature will also reach students.

Reruns the ten principles with the student weightings, flags the ones that shift (identity cues, engagement mechanics, task-type judgement), returns what to change.

This is the age-banding rule made operational.

## Meta - which of these are actually worth building

Best value first:

- **`ai-triage` and `ai-review`** hit the two moments designers most want a second opinion: start and end of a design. Highest signal per token.
- **`ai-prompt-draft` and `ai-copy`** are the utility skills for when you already know what you are building. Lower cognitive lift, high shipping value.
- **`ai-pattern-pick`** is useful if picking the right pattern is a real bottleneck. If the Patterns page already answers this in under a minute, the skill is redundant.
- **`ai-failure-design`** is the sharpest ask - the one thing most AI features skip. Small but load-bearing.

Candidates to drop or fold in:

- **`ai-eval-plan`** may belong to a data or research skill, not a design skill. Eval design is not really design work.
- **`ai-student-check`** could just be a mode of `ai-review` rather than its own skill (`ai-review --audience student`).

## Open questions

- **Do skills for designers need a different invocation shape than skills for the coding agent?** The existing skills fire automatically based on file paths and task keywords. Designer skills may need to be explicit `/ai-triage` invocations because they run in a design context, not a coding context.
- **Where does the design output live?** A designer's `ai-triage` conversation is not a code diff. Does it go into a decision record? A Figma comment? Just the chat?
- **Are these skills or is this a `design` skill mode?** The existing `design` skill orchestrates a full loop. AI-specific moments could be modes within it, or standalone skills.
- **Which of these overlap with the existing `critique` skill?** `critique` audits a whole page; `ai-review` audits against the ten AI principles. Related but not the same. Worth keeping separate or fold?
