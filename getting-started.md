# Getting started: making frontend changes in an existing codebase

A short guide for designers who want to make UI changes in a live product with an AI coding assistant - and ship them yourself, with an engineer reviewing along the way.

## Introduction

You can make UI changes to a live product without writing code from scratch. What you need instead is to understand *what each step does and why* - that's what keeps you safe. So this guide stays plain and explains the "why" as it goes.

**The mindset.** Think of the codebase like a shared Figma file that's also live for its users. So the game is simple: **work on your own copy, start with the frontend, keep each change small, and let a second pair of eyes check it before anything goes live.**

**Frontend-first, not frontend-only.** The frontend - what users see and click - is where you're strongest and where changes are safest, so it's the right place to begin. The backend (the server and database) is riskier ground, but not off-limits: with a good AI model and an engineer's help, plenty of designers work there too. The one rule: *don't wander into it by accident.* If a change turns out to need backend work, pause and bring in an engineer.

Two things worth knowing:

- **Your machine vs the shared server.** Your own computer holds your private copy - anything you do there (including a live preview at `localhost`) is yours alone until you share it. The shared server (usually **GitLab**, sometimes GitHub) is what the whole team sees. Keeping these separate in your head explains most of what follows.
- **Any assistant works.** This guide says "your AI assistant" on purpose - it works whether you use Claude Code, Codex, or another, and the interface differs but the process is the same. What I reach for: **Claude Code** (the desktop app, on Opus) for building, and **Codex** for a second opinion on code review. Your project may also have named shortcuts (slash-commands or "skills") for common jobs like planning or design-checking, so ask your team what yours has. The process also flexes to your **tech stack** and your team's **way of working**, so wherever something varies, check with your engineers.

> **One note up front.** I'm a designer, not an engineer, so treat this as the path that's worked for me, not gospel. Teams set things up differently, so when something touches *access, setup, or safety*, check the specifics with your engineers.

## How do I do it?

Four steps, start to finish:

1. **Get set up** - get the code onto your machine and running (once).
2. **Decide what you're making** - prototype, handoff, or revamp, and how much to plan.
3. **Build your change** - scan the codebase, build, and check it looks right.
4. **Ship it** - open a merge request, get it reviewed, and merge it.

A copy-paste prompt list is at the end.

## Introduction to Git

Git is the tool teams use to work on the same code without stepping on each other. You'll hear these words - here's all they mean:

- **Repo** - the shared folder of code your team works in, hosted on GitLab or GitHub.
- **Clone** - make a copy of the repo on your own computer.
- **Branch** - your own private version of the code to work on, so nothing you do touches the shared version until it's reviewed.
- **Commit** - save a checkpoint of your work. Commit often; it's what lets you undo mistakes.
- **Push** - upload your branch to the shared server so others can see it. Not merged yet - just parked there.
- **Merge request** (MR on GitLab, **pull request** / PR on GitHub) - ask for your branch to be reviewed and added into the shared code.
- **Merge** - approved and added in. Your work is now part of the shared codebase.

That's the whole vocabulary. Your AI assistant can run all of these for you; knowing what they mean just lets you tell when something looks off.

## Step 1: Get set up

You do this once, when you first join a repo. It's the most engineer-dependent part, so it's the best place to ask for help - that's not a failure, it's how everyone starts.

**What you need on your machine.** You'll work in a code editor (like VS Code or Cursor) with an AI coding assistant running in it. Getting your machine ready - the editor, the assistant, and a few tools the project needs - is a one-time thing an engineer can walk you through. If you're setting up the assistant yourself, Claude Code's setup guide covers it: [code.claude.com/docs/en/setup](https://code.claude.com/docs/en/setup).

Then, for the repo itself:

**1. Get access.** An engineer adds you to the repo (usually on GitLab, sometimes GitHub) so you're allowed in.

**2. Clone it to your machine.** On the repo's web page, click the **Code** button and copy the address. For a beginner, pick the **HTTPS** one (it starts with `https://`) - you sign in once and, on a Mac, your Keychain remembers it, so it stays invisible after that. (SSH, the `git@…` one, is an alternative some teams prefer.) Access setup is the fiddliest step, so **if you're unsure, ask an engineer to set up your own access with you.** Then cloning is one command (`git clone [address]`), or just ask your AI to do it.

> **Keep your access safe.** Your login is **personal - never share it, and never use a teammate's.** Keep it where it belongs (your Keychain, or a protected key), and never put a token or key into a commit, an AI prompt, Slack, or email. If one ever leaks, tell an engineer so it can be replaced. Good support means an engineer helps you set up *your own* access, never hands you theirs.

**3. Get the `.env` values.** A `.env` file (short for *environment*) holds the app's settings and secret keys - things like the database address or an API key. These are kept *out* of the repo on purpose, so a fresh clone doesn't include them. An engineer sends you the actual values through a secure channel (a password manager or vault, not plain Slack), and you paste them into your own local `.env`. **Without them the app won't run** - if it crashes on start with errors about missing keys or config, you're probably missing `.env` values, so ask your engineer.

**4. See it running (your preview).** Ask your AI or an engineer how to start the project - your AI can read the repo and give you the exact command. Once it's running, the app opens in your browser at an address like `http://localhost:5173`. That's your **preview**: your own copy of the app, running on your computer, where you'll see and click your changes.

> **About the preview:** you start it fresh each work session, and if it stops on its own, just ask your AI to start it again - that's normal. Some apps need other pieces running too (like a database). Getting those going the *first time* is something an engineer helps with during setup; after that, it's the same start command each session.

## Step 2: Decide what you're making

Before any code, get clear on *what kind of work this is*. It shapes how careful and polished to be.

| Mode | What it is | How polished |
| --- | --- | --- |
| **Prototype** | A quick build to test an idea or demo to the team | Rough is fine - mock data, main flow only. It just needs to look convincing. |
| **Handoff** | A clean version an engineer will build on - use it when there's significant backend work to be done | Tidy and conventional, and it needs a short spec so your intent survives the handoff. |
| **Revamp** | Polishing existing UI without breaking how it works | Careful - improve the look without disturbing the wiring underneath. |

**How much to plan is up to you** - designers and teams work differently, so treat this as a suggestion, not a rule. What many find helps: **explore loosely first, then plan the actual build.** Don't lock a rigid plan before you've tried things - for visual work, that fights your creativity. Explore or prototype freely (no plan mode yet), and once the shape stops moving, use what you learned to plan the actual implementation.

A few optional tools you might reach for, from light to heavier:

| Tool | What it's for | Where |
| --- | --- | --- |
| **plan mode** | Your AI lays out its approach before it writes any code. Reach for it when you move from exploring to the actual build. | [Claude Code feature](https://code.claude.com/docs/en/permission-modes) |
| **grill-me** | Your AI interviews you to pressure-test the idea and surface gaps. Good while you're still shaping it. | [mattpocock/skills](https://github.com/mattpocock/skills) |
| **OpenSpec** | Turns your intent into a structured written spec. | [openspec.dev](https://openspec.dev) |
| **Compound Engineering** | A brainstorm to plan to build to review flow. Works with Claude Code, Cursor, Codex, and more. | [github.com/EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) |

A written spec (like OpenSpec) earns its keep for a complex feature, or a **handoff** you're giving an engineer to build the backend - so your intent reaches them intact. All optional: use whatever fits you or your team, or none.

## Step 3: Build your change

Once you know what you're making, the loop is the same every time.

**1. Make a branch.** Pull the latest shared code first (the shared branch is usually called `main`), then make your branch off it, so you're building on the current version. Have your AI show you the exact git command and wait for your OK before running it - git actions are worth a quick double-check.

> Branch naming is team-specific - for example `102-add-feedback-link` or `feat/add-feedback-link`. Ask what yours uses.

**2. Let your AI learn the codebase first.** Before it writes anything, have your AI *read* the project so it copies what's already there instead of inventing its own style. Point it at the setup file, a couple of existing components, and any design guidelines or tokens. This one step is what makes the output look native.

> *"Before writing anything, read this codebase - the setup file, a few existing components, and the design tokens or guidelines - and follow how this project already does things."*

> You don't have to re-orient from scratch every session. Many codebases already keep a `CLAUDE.md` file (or similar) that your AI reads automatically at the start of each session, so it starts oriented. If yours has one, lean on it - it's a shared team file, so read from it rather than writing your own notes into it.

**3. Match what's already there.** Reuse beats invent - a change that looks native is easier to trust and review.

- **Reuse components.** Have your AI check for an existing component before building a new one - the `ui/` and `common/` folders are where shared pieces usually live. Only make something new if it'll be reused in a few places.
- **Use the existing tokens.** Colours, spacing, and corner radius should come from the values the project already defines - the same idea as design tokens in Figma. They usually live as CSS variables in a file like `src/index.css` or `app/globals.css` (if your project uses shadcn, those values are generated at [ui.shadcn.com](https://ui.shadcn.com) and pasted into that file). No hardcoded hex, no random pixel values. (These are unrelated to the sign-in token from Step 1.)
- **Watch shared components.** If a component is used on more than one page, changing it changes it *everywhere*. Ask your AI to flag that before you touch it, so you don't restyle other screens by accident.

**4. Build only what the task needs.** No drive-by "improvements" to unrelated things - they make the review harder. And **pause and ask an engineer** if the AI wants to install a new dependency, edit files outside the frontend folder (like `backend/`), touch a lot of files at once, or do something you don't understand.

**5. Check it in your preview.** Look at your change in the running app at `localhost` - at **mobile and desktop widths**, and in every state, not just the main flow: **empty** (no data yet), **loading** (while it fetches), and **error** (when it fails). Half of good UI is the states people forget.

> To see the mobile width, open your browser's dev tools (right-click the page and choose Inspect) and click the phone/tablet icon for device view - or just drag the window narrower.

**6. Run the checks.** Ask your AI to run the project's checks *and* its build - run both, since the quick checks (types, formatting) can pass while the full build fails. If your team has automated **design** checks (a "harness"), run those too: they catch hardcoded colours, contrast failures, missing focus states, tiny fonts, and generic "AI slop." A green result means nothing automated was flagged, not that the design is done - so still look at it yourself.

> A harness might be a command your AI runs, or a named skill your team has. Ask what yours is and how to run it.

**7. Have your AI review its own work.** Before a human sees it, ask your AI for an *adversarial* review - or run Claude Code's **code-review** skill - to catch rough edges and confirm the change fits the codebase's conventions. This cleans it up before your engineer's review, so theirs goes faster. A second model (like Codex) reviewing catches even more, since it comes at the code fresh.

## Step 4: Ship it

A merge request is how your change gets reviewed and added into the shared code. Your AI can do the mechanics - here's what's happening so you can follow along.

**1. Commit and push.** Use a short, clear commit message, and stage only the files you meant to change - a quick `git status` first shows what's included, so nothing stray sneaks in. **Never push to `main`** - always your own branch.

**2. Open the merge request.** Set the target to `main`, add a reviewer (an engineer or your lead), and create it. Then write a short description - what changed, plus before/after screenshots. Ask your AI to draft it from what you did, then tidy it.

**3. Watch the checks go green.** When you open the MR, the server automatically re-runs the same checks and build from Step 3 (this is called **CI**). If something fails, open the failed step, read the error (your AI can help), fix it, and push again - the MR updates itself.

**4. Get it reviewed and merged.** Your reviewer may ask for changes; make them and push again. Once approved, it's merged in.

> Once merged, many teams auto-deploy the change to a staging site (a safe copy for checking things before your users see them). Whether yours does, and where, is set per project - check how yours works.

**Keeping your branch fresh.** While you work, others merge into `main`, so your branch can fall behind. Before merging, update it by pulling in the latest `main` - there are two techniques for this, *rebase* and *merge* (not the same "merge" as your MR being merged in). Teams have a preference, so ask which yours uses and let your AI handle the command. If two people changed the same lines you'll get a **merge conflict** - don't guess, ask your AI to help, then re-run the checks.

> **A habit worth building:** as you build, jot down the decisions - what this is for, what states it covers, and anything the backend will need. That's the checklist your reviewer verifies against, and it's how your intent reaches the engineer instead of getting lost.

## When something breaks

Errors are normal, and on your own branch they're safe. Two things to remember:

- **You can't break anything permanently.** Nothing you do is shared until it's reviewed and merged, so your own branch is a safe place to experiment. Worst case, you undo it.
- **When you hit an error, don't panic - hand it to your AI.** Copy the red text, paste it in, and ask it to explain what's wrong and fix it. Reading errors is a skill you pick up fast, and your AI is good at it.

## Prompts you can copy

Starting points that work in any repo - your assistant fills in the specifics.

**Getting set up**
- "What's the tech stack here, and how do I install, run, and build this project?"
- "Clone this repo for me: [paste the address]."

**Building**
- "Before writing anything, read this codebase and its design tokens, then follow how it already does things."
- "Make a branch for this change - show me the git command and wait for my OK first."
- "Reuse existing components and tokens - check the ui/ and common/ folders before making anything new, and don't hardcode colours."
- "Before you change a component, tell me if it's used on more than one page."
- "Do an adversarial code review of this change - find anything an engineer would flag, and check it fits the codebase's conventions."

**Shipping**
- "Run the checks and the build - and the design checks if we have them - then show me the results before we commit."
- "Stage only the files I changed, commit with a clear message, and push my branch - confirm the commands first."
- "Draft an MR description from what we did, with before/after screenshots."
- "Update my branch with the latest main - tell me whether this repo uses rebase or merge first."

**When stuck**
- "This check failed - read the error and tell me what's wrong and how to fix it."
- "The preview stopped - can you start it again?"

---

*A living starting point. When your team does something differently - especially around setup, access, and secrets - trust your engineers over this guide, and help improve it.*
