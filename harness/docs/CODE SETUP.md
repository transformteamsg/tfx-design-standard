# Getting started: making changes in an existing codebase

A short guide for designers who want to make UI changes in a live product with an AI coding assistant, then ship them yourself while an engineer reviews.

*Draft 1 · last updated 24 July 2026*

## Introduction

You can make UI changes to a live product without writing code from scratch. Instead, you need to understand *what each step does and why*. That understanding is what keeps you safe, so this guide stays plain and explains the "why" as it goes.

**The mindset.** Think of the codebase like a shared Figma file that's also live for its users. Four habits keep you safe: work on your own copy, start with the frontend, keep each change small, and let someone review it before it goes live.

**Start with the frontend.** The frontend (what users see and click) is where you're strongest and where changes are safest. The backend (the server and database) is riskier, but not off-limits: with a good AI model and an engineer's help, plenty of designers work there too. One rule: don't touch the backend by accident. If a change turns out to need backend work, pause and bring in an engineer.

Two things worth knowing:

- **Your computer vs the shared server.** Your own computer holds your private copy. Anything you do there (including a live preview at `localhost`) is yours alone until you push it up to the shared server. The shared server (usually GitLab, sometimes GitHub) is what the whole team sees. Keep the two apart in your head and most of what follows makes sense.
- **Any assistant works.** The steps are the same whether you use Claude Code, Codex, or another. Only the interface differs.
  - What I reach for: Claude Code (the desktop app, on Opus) to build, and Codex for a second opinion on code review.
  - The steps also flex to your tech stack and your team's way of working, so check locally wherever something varies.

> **One note up front.** I'm a designer, not an engineer, so treat this as the path that's worked for me, not a rulebook. Teams set things up differently, so when something touches access, setup, or safety, check the specifics with your engineers.

## Step 0: Prep guardrails

You can experiment because the repo catches mistakes before they matter. If you're joining or starting a repo, work with your engineer to make sure these guardrails are in place:

- **Checks that catch bad code.** Linting, type-checking, and tests, plus a build step. Your project has a command that runs them; your engineer will tell you what it is.
- **A pipeline that runs those checks for you.** On GitLab, every merge request kicks off a *pipeline*: the same checks, run automatically on the server. Each check is a *job*; if a job fails, the pipeline turns red and nothing broken gets in. (This is what people mean by CI, or continuous integration. GitHub calls it Actions.)
- **Limits on the AI.** An automatic block on dangerous commands, like wiping files or a database. It also limits what the AI can touch on your computer and network.
- **Design checks.** A design harness that flags UI which breaks the design standard. On a TFX repo that's the [TFX harness](/harness/install); a DXD harness is on the way.

These guardrails are what make it safe for a designer to build. Without them, ask your engineer to set them up first.

## How do I do it?

Four steps, start to finish:

1. [Set up](#step-1-set-up) - get the code onto your computer and running (once).
2. [Plan](#step-2-plan) - prototype, revamp, or handoff, and how much to plan.
3. [Build](#step-3-build) - scan the codebase, build, and check it looks right.
4. [Ship](#step-4-ship) - open a merge request, get it reviewed, and merge it.

A copy-paste prompt list is at the end.

## Introducing Git

Git is the tool teams use to work on the same code without overwriting each other's work. You'll hear these words. Here's what each one means:

- **Repo** - the shared folder of code your team works in, hosted on GitLab or GitHub.
- **Clone** - make a copy of the repo on your own computer.
- **Branch** - your own private version of the code, so nothing you do touches the shared version until it's reviewed.
- **Commit** - save a checkpoint of your work. Commit often; it's what lets you undo mistakes.
- **Push** - upload your branch to the shared server so others can see it. Not merged yet, just uploaded.
- **Merge request** (MR on GitLab, **pull request** / PR on GitHub) - ask for your branch to be reviewed and added into the shared code.
- **Merge** - approved and added in. Your work is now part of the shared code.

That's the whole vocabulary. Your AI can run all of these for you; knowing what they mean just lets you tell when something looks off.

## Step 1: Set up

You do this once, when you first join a repo. It's the most engineer-dependent part, so it's the best place to ask for help. Everyone starts by asking.

### AI tools

You have three ways to run your AI assistant:

- **Claude Code desktop app** (easiest) - a standalone app, no code editor needed.
- **Claude Code in the terminal** - the command-line version.
- **A code editor** like VS Code or Cursor, with the [Claude Code extension](https://code.claude.com/docs/en/vs-code).

You sign in with a Claude account. The desktop app uses a personal subscription (Pro or Max); to use GovTech's provided API credits, use the terminal or an editor.

Whichever you pick, getting your computer ready (the app or editor, plus a few tools the project needs) is a one-time setup an engineer can walk you through. To do it yourself, Claude Code's [setup guide](https://code.claude.com/docs/en/setup) covers it. Some repos also ship a design harness you install once; on a TFX repo, see [Install](/harness/install).

### Product repo

Most of this happens once. The first time, ask an engineer to walk through it with you.

#### 1. Get access

An engineer adds you to the repo (usually GitLab, sometimes GitHub) so you're allowed in.

#### 2. Clone it

Cloning downloads the code to your computer.

- On the repo's web page, click **Code** and copy the **HTTPS** address (it starts with `https://`).
- Run `git clone [address]`, or ask your AI to do it.
- You sign in once; your computer remembers it after that (Keychain on a Mac, credential helpers on Windows and Linux). SSH, the `git@…` address, is an alternative some teams prefer.

> **Keep your access safe.** Your login is personal, so never share it or use a teammate's. Never put a token or key into a commit, an AI prompt, Slack, or email.

#### 3. Get the `.env` values

A `.env` file holds the app's settings and secret keys, like a database address or an API key, kept out of the repo on purpose.

- Your engineer sends the real values through a secure channel, like a password manager or vault, not plain Slack.
- Paste them into your local `.env`. Without them, the app won't start.

#### 4. Start the preview

Ask your AI for the command to run the project; it can read the repo and tell you exactly.

- The app opens in your browser at an address like `http://localhost:5173`. That's your **preview**: your own copy, where you see and click your changes.
- Start it fresh each session. If it stops, that's normal; just ask your AI to start it again.
- Some apps need other pieces too, like a database; an engineer helps set those up the first time.

## Step 2: Plan

### Start with the problem

Before any code, get clear on what you're solving: a short problem statement, a design brief, and (where they apply) your measures of success. A clear problem makes every later step easier to judge.

> **Tip: track success.** If your app is wired to [PostHog](https://posthog.com), you can even set up analytics so you can see whether a build actually moves the metric, not just whether it shipped.

### Pick your mode

What kind of work this is decides how much to plan and which tools help.

| Mode | What it is | Recommended approach |
| --- | --- | --- |
| **Prototype** | A quick build to test an idea or demo to the team | Prompt freely with mock data; rough is fine. If the idea is fuzzy, start with a `/grill-me` interview. |
| **Revamp** | Polishing existing UI without breaking how it works | Use light plan mode, describe the changes you want, and go in small steps. |
| **Handoff (frontend)** | A clean frontend an engineer will wire up; they mostly refactor the backend | Write a spec so your design intent survives; OpenSpec or `/ce-plan` (Compound Engineering) can draft one. How detailed depends on the work and the engineer, so ask what documentation they need. |

### Decide how much to plan

It's your call. A common rhythm: explore or prototype freely first, then write it down once the shape settles. Rigid plans early tend to fight visual exploration. These modes mirror the early phases of a design loop (intent, then a few directions, then a plan); see [The loop](/harness/loop).

### Tools and skills

Whichever tool you use, you start the same way: tell the AI, in plain words, what you want to build and the problem it solves. Be specific; vague in, vague out.

**Got a design harness? Lean on it.** Its skills know the standard, so they build, review, and polish to spec. On a TFX repo you type it plainly - `/tfx:design a settings page for teachers` - and see [the harness skills](/harness/skills) for the full set. (That's the product-specific TFX harness; a generic DXD one is on the way.)

No harness? The generic tools below do similar jobs, but the AI still needs slightly more babysitting. These are the ones I picked up from the LangBuddy engineers:

| Tool | What it does, and how to use it | Where |
| --- | --- | --- |
| **plan mode** | Lays out its approach before writing any code. Turn it on, describe the change, then read the plan and approve it or send it back. Honestly, your best friend. | [Claude Code feature](https://code.claude.com/docs/en/permission-modes) |
| **`/grill-me`** (rec. Sheen An) | Interviews you to pressure-test the idea. Run it, then answer its questions honestly; it surfaces the gaps you missed. | [mattpocock/skills](https://github.com/mattpocock/skills) |
| **OpenSpec** (rec. Selwyn) | Turns your intent into a structured written spec. Describe the feature and it drafts a spec for you to review and refine. | [openspec.dev](https://openspec.dev) |
| **`/feature-dev`** (Anthropic) | Walks a feature through discovery, architecture, build, and review. Run `/feature-dev` followed by a description of what you want. | [claude.com/plugins/feature-dev](https://claude.com/plugins/feature-dev) |
| **Compound Engineering** (rec. Wondo) | A brainstorm-to-plan-to-build-to-review flow, built so each task makes the next one easier. Kick it off with the feature and the problem. | [github.com/EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) |

All optional. Use whatever fits you or your team, or none.

> **Tip: add reference images.** Give your AI a screenshot, a Figma frame, or a screen you admire from another app. Images convey the look you want faster than words.

## Step 3: Build

Once you know what you're making, the loop is the same every time.

> **If your repo has a design harness, it runs the build, check, and review phases for you.** It builds to the standard, stops for your approval before and after, and has a separate reviewer grade the result (on a TFX repo, that's `/tfx:design` and its [six-phase loop](/harness/loop)). You still make the branch and open the merge request yourself. No harness yet? Drive the steps by hand below; honestly, doing it manually first is the best way to learn what's actually going on.

**1. Make a branch.** Pull the latest shared code first (the shared branch is usually called `main`), then make your branch off it, so you build on the current version. Have your AI show you the exact git command and wait for your OK before it runs. Git actions are worth a quick double-check.

> Branch naming is team-specific. For example, `102-add-feedback-link` or `feat/add-feedback-link`. Ask what yours uses.

**2. Let your AI learn the codebase first.** Before it writes anything, have your AI read the project, so it copies what's already there instead of inventing its own style. Point it at the setup file, a couple of existing components, and any design guidelines or tokens. This one step is what makes the output match the existing code.

> *"Before writing anything, read this codebase: the setup file, a few existing components, and the design tokens or guidelines. Then follow how this project already does things."*

> You don't have to re-orient from scratch every session. Many codebases keep a `CLAUDE.md` file (or similar) that your AI reads automatically when a session starts, so it begins oriented. If yours has one, lean on it. It's a shared team file, so read from it rather than writing your own notes into it.

**3. Follow the codebase's conventions.** Reuse what's there before building new. A change that looks like it belongs is easier to trust and review.

- **Reuse components.** Have your AI check for an existing component before it builds a new one. The `ui/` and `common/` folders are where shared pieces usually live. Only make something new if you'll reuse it in a few places.
- **Use the existing tokens.** Colours, spacing, and corner radius should come from the values the project already defines. These are the same idea as design tokens in Figma. They usually live as CSS variables in a file like `src/index.css` or `app/globals.css`. (If your project uses shadcn, those values are generated at [ui.shadcn.com](https://ui.shadcn.com) and pasted into that file.) No hardcoded hex, no random pixel values. (These tokens are unrelated to the sign-in token from Step 1.)
- **Watch shared components.** A component used on more than one page changes everywhere when you edit it. Ask your AI to flag that before you touch it, so you don't restyle other screens by accident.

A few more habits worth keeping:

- **Match the words already in the codebase.** Use the terms the project already uses (say "publish mission", not a new phrase you invented), so flows stay consistent.
- **Don't add a new tool for something the project can already do.** Reach for a new dependency only when nothing built in covers it.
- **Leave it clean.** When you remove UI, have your AI remove the code behind it too, so no dead bits or filler comments pile up.
- **Handle data safely.** Ask your AI to shape incoming data at the boundary and never assume a response is there, so a missing value doesn't blank the screen.
- **Keep spacing on the grid.** Use the project's spacing steps (often an 8px grid), not arbitrary pixel values.
- **Let elements size to their content** instead of forcing fixed widths.

**No conventions yet?** A fresh or inconsistent codebase may have nothing to match. Set them yourself - pick your tokens and patterns and keep to them - or lean on a design harness, which brings the standard with it.

> **Keep an eye on the basics yourself.** AI is good, but it lapses. Every so often it will hardcode a colour, skip a token, or reinvent a component that already exists. Knowing the best practices (use tokens, reuse what's there) is what lets you catch the slip. You can't fully outsource judgment.

*These are habits I picked up from engineers and from building with AI, not hard rules. Add to them or correct them as you learn your own codebase.*

**4. Build only what the task needs.** Keep the change focused. Skip unrelated "improvements", even tempting ones; they make it harder to review and to undo.

Some moves are higher-stakes and worth a closer look. Read carefully when the AI wants to:

- install a new dependency
- edit files outside the frontend folder (like `backend/`)
- touch a lot of files at once
- do something you don't understand

None of these are off-limits, and most turn out fine. They're just the moments to slow down, understand what's happening, and loop in an engineer if it's outside your area or you're unsure.

**5. Check it in your preview.** Look at your change in the running app at `localhost`, at mobile and desktop widths, and in every state: **empty** (no data yet), **loading** (while it fetches), and **error** (when it fails). Those three states are where UI usually breaks, and they're easy to forget.

> To see the mobile width, open your browser's dev tools (right-click the page and choose Inspect) and click the phone/tablet icon for device view. Or just drag the window narrower.

> **Let your AI drive the browser.** [Claude in Chrome](https://claude.com/claude-for-chrome) can open your preview, click through the states, and resize for mobile, so it catches visual issues without you doing every click yourself.

**6. Run the checks.** Ask your AI to run two things. Run both, since the quick checks can pass while the full build still fails:

- **Code checks** - types, formatting, and tests, plus the build step.
- **Design checks**, if your team has them - they catch hardcoded colours, contrast failures, missing focus states, tiny fonts, and generic "AI slop".

These are the same checks GitLab runs as a **pipeline** when you open a merge request (Step 4), so running them now catches failures early.

A green result means nothing automated was flagged, not that the design is done, so still look at it yourself. On a TFX repo, what gets checked lives in the [standards catalog](/standards/catalog); if a check flags one dimension (spacing, colour, wording), a focused pass like `/tfx:polish` or `/tfx:copy` fixes just that.

**7. Get the code reviewed before a human sees it.** Ask for an *adversarial* review, a deliberately critical pass that hunts for problems. On a TFX repo, [`/tfx:critique`](/harness/skills) does this against the standard; otherwise, run Claude Code's `/code-review` skill. Even better, have a *different* model do the review. The model that wrote the code is a poor judge of its own work, so a fresh set of eyes catches more; Codex is good for this. Either way, it cleans things up first, so your engineer's review goes faster.

## Step 4: Ship

A merge request is how your change gets reviewed and added into the shared code. Your AI can do the mechanics. Here's what's happening, so you can follow along.

**1. Commit and push.** Write a short, clear commit message, and stage only the files you meant to change. A quick `git status` first shows what's included, so nothing stray gets committed. **Never push to `main`.** Always push your own branch.

> Many repos run some checks automatically at a Git hook, on commit or on push (LangBuddy runs lint and types on push). If the hook fails, it blocks you, so running the checks yourself first saves a round-trip. The build and tests usually run in CI.

**2. Open the merge request.** Set the target to `main`, add a reviewer (an engineer or your lead), and create it. Then write a short description of what changed, plus before/after screenshots. Ask your AI to draft it from what you did, then tidy it.

**3. Watch the pipeline go green.** When you open the merge request, GitLab runs the **pipeline**: the same checks and build from Step 3, automatically on the server. Each check is a **job**; if a job fails, open it, read the error (your AI can help), fix it, and push again. The pipeline re-runs and the MR updates itself. (This is CI, or continuous integration; GitHub calls it Actions.)

**4. Get it reviewed and merged.** Your reviewer may ask for changes; make them and push again. Once approved, it's merged in.

> Once merged, many teams auto-deploy the change to a staging site, a safe copy for checking things before your users see them. Whether yours does, and where, is set per project, so check how yours works.

**Keeping your branch fresh.** While you work, others merge into `main`, so your branch can fall behind. Before merging, update it by pulling in the latest `main`. Two techniques do this: *rebase* and *merge* (not the same "merge" as your MR being merged in). Teams have a preference, so ask which yours uses and let your AI run the command. If two people changed the same lines, you'll get a **merge conflict**. Don't guess; ask your AI to help, then re-run the checks.

> **A habit worth building:** as you build, jot down the decisions: what the change is for, what states it covers, and anything the backend will need. That's the checklist your reviewer verifies against, and it's how your intent reaches the engineer instead of getting lost.

## When something breaks

Errors are normal, and on your own branch they're safe. Two things to remember:

- **You can't break anything permanently.** Nothing you do is shared until it's reviewed and merged, so your own branch is a safe place to experiment. Worst case, you undo it. Git forgives.
- **When you hit an error, hand it to your AI.** Copy the red text, paste it in, and ask your AI to explain what's wrong and fix it. Reading errors is a skill you pick up fast, and your AI is good at it.

## Going further

A harness can take on more of this as you go: asking the questions, making changes, drafting and running a plan while you approve. It handles the mechanics, but knowing what each step does is what lets you catch the AI when it slips and push back. That's why it pays to do a few changes by hand first. The [Designer on-ramp](/harness/on-ramp) lays out how to hand off more as your judgment grows.

## Prompts you can copy

Starting points that work in any repo. Your assistant fills in the specifics.

**Getting set up**

| What it does | Prompt |
| --- | --- |
| Understand the project | "What's the tech stack here, and how do I install, run, and build this project?" |
| Clone it | "Clone this repo for me: [paste the address]." |

**Building**

| What it does | Prompt |
| --- | --- |
| Learn the codebase first | "Before writing anything, read this codebase and its design tokens, then follow how it already does things." |
| Make a branch | "Make a branch for this change. Show me the git command and wait for my OK first." |
| Reuse over invent | "Reuse existing components and tokens. Check the ui/ and common/ folders before making anything new, and don't hardcode colours." |
| Check the blast radius | "Before you change a component, tell me if it's used on more than one page." |
| Review before a human does | "Use the /code-review skill on this change (or a different model like Codex). Find anything an engineer would flag, and check it fits the codebase's conventions." |

**Shipping**

| What it does | Prompt |
| --- | --- |
| Verify your change | "Run the project's checks (lint, types, tests) and its build, plus the design checks if it has them. Show me what passes and what fails." |
| Commit and push safely | "Stage only the files I changed, commit with a clear message, and push my branch. Confirm the commands first." |
| Draft the MR | "Draft an MR description from what we did, with before/after screenshots." |
| Update your branch | "Update my branch with the latest main. Tell me whether this repo uses rebase or merge first." |

**When stuck**

| What it does | Prompt |
| --- | --- |
| Fix a failed check | "This check failed. Read the error and tell me what's wrong and how to fix it." |
| Restart the preview | "The preview stopped. Can you start it again?" |

---

*A living starting point. When your team does something differently, especially around setup, access, and secrets, trust your engineers over this guide, and help improve it.*

*Thanks to the LangBuddy engineers who taught me most of this.*
