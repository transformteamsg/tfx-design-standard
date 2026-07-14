# Source: IBM Carbon for AI
Researched: 2026-07-15. URL: https://carbondesignsystem.com/guidelines/carbon-for-ai/

## Principles found

Section: "Carbon for AI overview"
- Transparency of AI presence is key to user trust.
- Having a consistent identity builds awareness and anticipation of AI presence across experiences.
- Whether AI exists within a single word or across the entire page, users should clearly understand how pervasive AI is implemented.
- Some degree of explainability must be offered in every scenario.
- Users should always know when they are interfacing with AI and understand its limitations, to prevent a breach of trust.

Section: "AI transparency and accountability"
- The AI label is the primary mechanism for AI transparency, accountability, and explainability at any interface level.
- Clear and accessible visual cues are required to help users distinguish AI-generated content.
- Regulatory pressure (EU AI Act, US executive guidance) informs the requirement to mark AI content consistently.

Section: "Light as metaphor"
- The visual treatment uses light as a metaphor to "illuminate" AI-generated content.
- The gradient effect is designed to coexist alongside Carbon themes but has its own distinct visual identity.

## Concrete UI patterns

### AI Label component (stable component, previously called "AI Slug")
Source: https://carbondesignsystem.com/components/ai-label/usage/

Two variants:
- Default AI label - icon-only, spanning Carbon's standard icon and pictogram sizes.
  When placed next to ghost icon buttons, go one size down so they are optically weighted the same.
  Clickable area is limited to the icon only (like an icon-only ghost button).
- Inline AI label - text + icon, sized to match surrounding text (e.g., 14px type = medium inline AI label).
  Has extra padding included in the click target area.

Three interactive states: enabled, hover, focus.
The AI label must never be disabled or appear in read-only styling - it is always active.

### Explainability popover
Source: https://carbondesignsystem.com/components/ai-label/usage/

- Triggered by clicking the AI label.
- Described as "the first layer of explainability."
- Auto-positions to the best orientation on screen so it is never out of view.
- Follows the same alignments as the primitive caret-tip popover.
- Provides a configurable content area with a recommended four-section template.
  (Exact section names are in the IBMers-only "AI explainability popover pattern on Design for AI" - not publicly documented.)
- Progressive disclosure model: summarized explanation in the popover, deeper detail available on demand.
- Focus stays on the AI label trigger when the popover opens.
  When the popover contains interactive elements, the correct key moves focus into it.
- The AI label inside a text input adds a second tab stop (input focus first, then AI label).

### AI presence styling (the "AI layer")
Source: https://carbondesignsystem.com/guidelines/carbon-for-ai/ and https://medium.com/carbondesign/carbon-for-ai-scaling-new-ways-of-working-fc6913624667

- Implemented via a Sass mixin called by passing an "AI label" prop to a component.
- Visual treatment: linear-gradient background + light glow on container edges (spread is limited and subtle to preserve contrast).
- Designers described it as "playing with gradients to simulate light, as a metaphor for illuminating users."
- The gradient and glow are design tokens, allowing opacity and color to be refined without code refactors.
- TFX note - transferable idea: visible, bounded marking that distinguishes AI content from non-AI content.
  TFX note - Carbon-specific styling: the blue gradient/glow is Carbon's own visual language.
  TFX would replace the gradient with its own token-based treatment (since TFX bans gradient/glow).

### Placement rules
Source: https://carbondesignsystem.com/components/ai-label/usage/ and https://carbondesignsystem.com/components/form/usage/

- Single AI-populated table cell: AI label placed inline, to the left of the cell text.
- Entire form is AI-generated: AI label placed in the top right of the form header.
- Only some form fields are AI-generated: AI label embedded only in those specific components.
- The level of AI label visibility depends on the need to distinguish AI content from human content.

### Components with AI label support (13 documented)
Source: https://supernova-io.medium.com/top-6-examples-of-ai-guidelines-in-design-systems-dea15a0cf0ac

Includes: form inputs, select, text input, textarea, tags (read-only and dismissible variants only), and others.
Tags: the AI label is embedded and acts as both indicator and popover trigger.
Read-only and dismissible are the only tag variants that allow the interactive AI label.

### Revert-to-AI pattern
Source: https://carbondesignsystem.com/components/ai-label/usage/

- After user edits an AI-suggested value, AI presence styling is removed and the AI label is replaced by a "revert" icon-only button.
- Activating revert restores the original AI-generated content, the AI presence styling, and the AI label.
- This signals the boundary between AI-generated and human-generated content visually and interactively.

### Carbon AI Chat (conversation pattern)
Source: https://github.com/carbon-design-system/carbon-ai-chat and https://medium.com/carbondesign/announcing-the-carbon-ai-chat-v1-release-ce5f5b2fbab3

- Carbon AI Chat is a separate open-source front-end chat framework built on Carbon, released as v1.0.0.
- Focuses on core chat behaviors: message display, input, conversation threading.
- Designed as a stable, extensible foundation for AI chat experiences, not a Carbon Design System core component.
- Specific conversation design guidance is not publicly documented in the main Carbon for AI guidelines.

## Checkable (candidate machine-verifiable rules)

- Every AI-generated content surface carries an AI label component.
- The AI label is never disabled, even when its parent component is disabled or read-only.
- The AI label variant (default vs inline) matches its context - inline in text/table rows, default in headers/standalone.
- Inline AI label font size matches the surrounding text size.
- Default AI label is sized one step down when placed adjacent to ghost icon buttons.
- When a form is fully AI-generated, the AI label appears in the top-right of the form header.
- When only some form fields are AI-generated, only those components carry the AI label (not the whole form).
- When a user overrides an AI value, the AI label is removed and replaced by the revert icon button.
- When the user reverts, the AI label and AI presence styling are restored.
- The explainability popover auto-positions to remain in view on all screen orientations.
- The AI label is in the page tab order; interactive elements inside an open popover are also tab-reachable.

## Judgment (guideline material)

- Granularity of marking is context-dependent - a single page might have one AI label or many.
- The content of the explainability popover may address a single AI instance or multiple; both are acceptable.
- Designers must decide whether to mark at the component level, the section level, or the page level.
- Some degree of explainability must be present; how much detail to surface is a judgment call per scenario.
- AI styling is strictly reserved for AI instances - using the gradient or label for non-AI content is prohibited.
- Once content becomes human-generated (user has edited it), the AI marking is deliberately removed.
- The IBM framing: "An unlabeled AI component that quietly does the wrong thing, with no explanation and no way back, is a breach of trust."

## Relevance to conversation design vs general AI design

- [ai-general] AI label component - applies to any surface where AI content appears, not just chat.
- [ai-general] AI presence styling (gradient/glow) - applies to forms, tables, tags, and other components.
- [ai-general] Placement rules - scoping the label to the right level (component vs section vs page).
- [ai-general] Revert-to-AI pattern - relevant to any editable AI-generated field.
- [ai-general] Explainability popover - applies to any AI touchpoint.
- [conversation] Carbon AI Chat framework - conversation-specific component library.
- [conversation] Progressive disclosure in popovers - relevant to how explanations surface inline in chat.
- [both] The principle that AI presence must always be visible and consistent.
- [both] The principle that some explainability must be offered in every AI scenario.

## Quotes and links

- "Transparency of AI presence is key to user trust." - https://carbondesignsystem.com/guidelines/carbon-for-ai/
- "The AI label is intended for any scenario where something is being generated by or with AI." - https://carbondesignsystem.com/components/ai-label/usage/
- "The popover is the first layer of explainability, accessed by clicking the AI label." - https://carbondesignsystem.com/components/ai-label/usage/
- "An unlabeled AI component that quietly does the wrong thing, with no explanation and no way back, is a breach of trust." - https://carbondesignsystem.com/guidelines/carbon-for-ai/
- "The AI label should never be disabled as part of a disabled or read-only state." - https://carbondesignsystem.com/components/ai-label/usage/
- "The designers played with gradients to simulate light, as a metaphor for illuminating users." - https://medium.com/carbondesign/carbon-for-ai-scaling-new-ways-of-working-fc6913624667
- "While these new styling elements are enticing, they are strictly intended to identify any instances of AI being used." - https://carbondesignsystem.com/guidelines/carbon-for-ai/
- Carbon AI Chat v1 announcement: https://medium.com/carbondesign/announcing-the-carbon-ai-chat-v1-release-ce5f5b2fbab3
- AI label accessibility: https://carbondesignsystem.com/components/ai-label/accessibility/
