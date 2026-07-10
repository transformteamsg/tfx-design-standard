# Onboard my product — the brand interview (Mode B)

This is a scripted conversation, not a form. You interview the person for their product's
brand basics and, at the end, write their product's design context for them: a `DESIGN.md`
at their repo root and its generated twin `.dxd/design.json`. They never edit a file.

**Who you are talking to.** Assume they know only "our primary colour and our fonts".
Never mention YAML, JSON, git, or "keys". Never ask them to open or edit a file. One
question at a time, plain language, second person, Singapore English.

**The bar.** Someone who answers only name, domain, colour, and fonts — skipping
everything else — must still finish with a valid, working context. That is a success, not
a half-done job.

## Two rules that bind every question

1. **Every non-essential question is skippable, and skip means default.** Show an example
   answer and an explicit "skip — use the standard's default" option on every question
   except the product name. A skipped question writes **nothing**. An absent section means
   the standard's default applies (the product's domain profile, then the foundation
   default) — a valid, complete state, never a placeholder. Never invent or fill a value
   the person did not give.
2. **Parameters, never rule restatements.** You are capturing *values* — a hex, a typeface
   name, a slug — not restating what a control requires. This is the one rule of the
   context layer, verbatim from `../../../docs/DESIGN-CONTEXT.md`:

   > `DESIGN.md` carries only what *differs* from the portfolio default or *specialises* a
   > catalog rule for this product — the values, not the rules. It must never restate a
   > catalog control.

   So write `Primary: --tw-blue #0064FF`, never "primary actions use the product's own
   primary colour". The wizard writes values, not prose rules.

## The questions — ask in this order

Ask each on its own turn. The **Writes** column names where the answer goes; a question
with no DESIGN.md section (audiences) only informs the optional domain-profile snippet at
the end, never the product file.

### 1. Product name — *required*
"What's the product called?" (example: "Teacher Workspace", "Glow")
→ Writes the `DESIGN.md` title line. No skip — everything else can default, but the file is
named after the product.

### 2. Which domain — *skippable*
"Which part of the portfolio does this belong to? Pick one:"

- **Teachers & School** (`teachers-school`) — tools for teachers and school staff.
- **Students** (`students`) — surfaces students use directly.
- **Parents** (`parents`) — surfaces for parents and guardians.
- **Platform** (`platform`) — shared platform, including EduPass.

(These are the four in `../../../standards/domains/`. Describe each in the one line above;
don't read out the slugs unless asked.) Skip = no domain declared; the foundation default
applies.
→ Writes the `## Domain` section (the slug).

### 3. Audiences — *skippable*
"Who uses it? Pick any that apply:"

- **Teachers** — teachers and school staff.
- **Students — primary** — primary-school students.
- **Students — secondary and up** — secondary students and older.
- **Parents** — parents and guardians.

(These are the catalog's `meta.audiences` vocabulary.) Skip allowed.
→ Does **not** write a `DESIGN.md` section. If the domain is a proposed stub (see the end),
this feeds the domain-profile snippet you draft for the domain lead.

### 4. Primary colour — *skippable, but the one worth asking for*
"What's your primary brand colour? A hex like `#0A7B4B` is perfect — or if your team
already has a colour token, tell me its name." Accept either a hex, or "we have a token"
(then ask for the token name). Skip = the domain's primary (then the foundation default)
applies.
→ Writes the `## Colour` section (`- primary: <token and/or hex>`).

### 5. Typefaces — *skippable*
"Which fonts do you use — one for headings (display) and one for body text? Example:
display 'Plus Jakarta Sans', body 'Inter'." Skip = the domain's typefaces (then the
foundation default) apply.
→ Writes the `## Typography` section (`- display:` / `- body:`).

### 6. Stack — *skippable*
"What component and token stack does the product build on? Free text is fine — example:
'Base UI + Radix Colors + shadcn/ui default tokens'. Not sure? Skip it." Skip = the
domain's stack (then the foundation default) applies.
→ Writes the `## Stack` section (prose).

### 7. Illustration direction — *skippable*
"Any illustration or imagery direction? A sentence is enough — and if you use Midjourney
style-reference codes (SREF), share them. Skip if you have none." Skip allowed.
→ Writes an `## Illustration` section (prose, plus `- sref: [...]` if given).

### 8. Voice and tone — *skippable*
"How should the product sound? A short pointer — example: 'neutral, steady, quietly
confident'. Skip to follow the standard's default voice." Skip allowed.
→ Writes the `## Tone weighting` section (prose).

Motion, layout system, and components (the remaining `DESIGN-CONTEXT.md` sections) are not
asked in the interview — they are advanced parameters most adopters leave at the default.
Mention once, at the end, that these exist and can be added later by re-running the wizard;
never prompt for them.

## After the interview — write and confirm

1. **Write `DESIGN.md`** at the product repo root. Include a section **only** for each
   question that was answered; omit every skipped one entirely. Use `- key: value` bullets
   for the machine-readable parameters (colour, typography, sref) and prose for the rest,
   exactly as `../../../docs/DESIGN-CONTEXT.md` describes. Match the annotated template
   shape at `../../../docs/templates/DESIGN.md`.
2. **Generate the twin.** Run:
   `python3 ../../../scripts/generate-design-json.py <product-repo-root>`
   This writes `.dxd/design.json`. Never hand-write that file — it is generated only.
3. **Read the choices back in plain language.** Show the person what was captured and what
   defaulted, e.g.: "Your primary is #0A7B4B and your display font is Plus Jakarta Sans;
   anything you skipped — motion, layout, voice — uses the standard's defaults." Show them
   the generated `.dxd/design.json` so they can see the machine twin exists.
4. Tell them they can re-run this any time to add or change parameters — you regenerate the
   twin for them.

## If the chosen domain is a proposed stub

Profiles in `../../../standards/domains/` marked `status: proposed` (Students, Parents,
Platform today) are stubs awaiting the domain lead's declarations. If the person picked one
and gave brand answers, tell them their answers can help settle the domain profile — but
**you never write into `../../../standards/domains/`**. Instead:

1. Draft a YAML snippet from the blank at `../../../standards/domains/_template.yaml`,
   filling in the fields their answers cover (domain, name, audiences, colour, typography,
   stack, illustration, voice). Keep `status: proposed`.
2. Show it to them and say to send it to the foundation owner through the ratchet — the
   process is in `../../../CONTRIBUTING.md`.

This keeps the product's own `DESIGN.md` (which you did write) separate from the shared
domain profile (which only the ratchet may change).

## Stay honest

- Report only what you wrote and what defaulted. A repo with a minimal `DESIGN.md` is
  complete, not deficient.
- If the generator reports an error, show its actual output; do not claim the twin was
  written unless the command succeeded.
- SLP-9 binds this prose and every question you ask — plain language, no AI-writing tells.
