# Getting started: making frontend changes in an existing codebase

A short guide for designers who want to make UI changes in a live product with an AI coding assistant, then ship them yourself while an engineer reviews.

*Draft 1 · last updated 24 July 2026*

## Introduction

You can make UI changes to a live product without writing code from scratch. Instead, you need to understand *what each step does and why*. That understanding is what keeps you safe, so this guide stays plain and explains the "why" as it goes.

**The mindset.** Think of the codebase like a shared Figma file that's also live for its users. Four habits keep you safe: work on your own copy, start with the frontend, keep each change small, and let someone review it before it goes live.

**Start with the frontend.** The frontend (what users see and click) is where you're strongest and where changes are safest. The backend (the server and database) is riskier, but not off-limits: with a good AI model and an engineer's help, plenty of designers work there too. One rule: don't touch the backend by accident. If a change turns out to need backend work, pause and bring in an engineer.

Two things worth knowing:

- **Your machine vs the shared server.** Your own computer holds your private copy. Anything you do there (including a live preview at `localhost`) is yours alone until you share it. The shared server (usually GitLab, sometimes GitHub) is what the whole team sees. Keep the two apart in your head and most of what follows makes sense.
- **Any assistant works.** The steps are the same whether you use Claude Code, Codex, or another. Only the interface differs.
  - What I reach for: Claude Code (the desktop app, on Opus) to build, and Codex for a second opinion on code review.
  - Your project may have named shortcuts (slash-commands or "skills") for common jobs like planning or design-checking. Ask your team what yours has.
  - The steps also flex to your tech stack and your team's way of working, so check locally wherever something varies.

> **One note up front.** I'm a designer, not an engineer, so treat this as the path that's worked for me, not a rulebook. Teams set things up differently, so when something touches access, setup, or safety, check the specifics with your engineers.

## How do I do it?

Four steps, start to finish:

1. [Get set up](#step-1-get-set-up) - get the code onto your machine and running (once).
2. [Decide what you're making](#step-2-decide-what-youre-making) - prototype, revamp, or handoff, and how much to plan.
3. [Build your change](#step-3-build-your-change) - scan the codebase, build, and check it looks right.
4. [Ship it](#step-4-ship-it) - open a merge request, get it reviewed, and merge it.

A copy-paste prompt list is at the end.

## Introduction to Git

Git is the tool teams use to work on the same code without overwriting each other's work. You'll hear these words. Here's what each one means:

- **Repo** - the shared folder of code your team works in, hosted on GitLab or GitHub.
- **Clone** - make a copy of the repo on your own computer.
- **Branch** - your own private version of the code, so nothing you do touches the shared version until it's reviewed.
- **Commit** - save a checkpoint of your work. Commit often; it's what lets you undo mistakes.
- **Push** - upload your branch to the shared server so others can see it. Not merged yet, just uploaded.
- **Merge request** (MR on GitLab, **pull request** / PR on GitHub) - ask for your branch to be reviewed and added into the shared code.
- **Merge** - approved and added in. Your work is now part of the shared code.

That's the whole vocabulary. Your AI can run all of these for you; knowing what they mean just lets you tell when something looks off.

## Step 1: Get set up

You do this once, when you first join a repo. It's the most engineer-dependent part, so it's the best place to ask for help. Everyone starts by asking.

**What you need on your machine.** You'll work in a code editor (like VS Code or Cursor) with an AI coding assistant running inside it. Getting your machine ready (the editor, the assistant, and a few tools the project needs) is a one-time setup an engineer can walk you through. To set up the assistant yourself, Claude Code's setup guide covers it: [code.claude.com/docs/en/setup](https://code.claude.com/docs/en/setup).

Then, for the repo itself:

**1. Get access.** An engineer adds you to the repo (usually on GitLab, sometimes GitHub) so you're allowed in.

**2. Clone it to your machine.** Cloning downloads the code. On the repo's web page, click the **Code** button and copy the address. As a beginner, pick the **HTTPS** address (it starts with `https://`). You sign in once, and on a Mac your Keychain remembers it, so it stays invisible after that. (SSH, the `git@…` address, is an alternative some teams prefer.) Access setup is the trickiest step, so if you're unsure, ask an engineer to set it up with you. Then cloning is one command (`git clone [address]`), or you can ask your AI to do it.

> **Keep your access safe.** Your login is personal. Never share it, and never use a teammate's. Keep it where it belongs (your Keychain, or a protected key), and never put a token or key into a commit, an AI prompt, Slack, or email. If one ever leaks, tell an engineer so they can replace it. Good support means an engineer helps you set up your own access, never hands you theirs.

**3. Get the `.env` values.** A `.env` file (short for *environment*) holds the app's settings and secret keys, like the database address or an API key. The repo leaves these out on purpose, so a fresh clone doesn't include them. An engineer sends you the real values through a secure channel (a password manager or vault, not plain Slack), and you paste them into your own local `.env`. Without them, the app won't start. If it crashes on launch with errors about missing keys or config, you're probably missing `.env` values, so ask your engineer.

**4. See it running (your preview).** Ask your AI or an engineer how to start the project. Your AI can read the repo and give you the exact command. Once it's running, the app opens in your browser at an address like `http://localhost:5173`. That's your **preview**: your own copy of the app, running on your computer, where you see and click your changes.

> **About the preview:** you start it fresh each work session. If it stops on its own, that's normal; just ask your AI to start it again. Some apps need other pieces running too, like a database. Getting those going the first time is something an engineer helps with during setup. After that, it's the same start command each session.

## Step 2: Decide what you're making

Before any code, get clear on what kind of work this is. That decides how much to plan and which tools help.

| Mode | What it is | Recommended approach |
| --- | --- | --- |
| **Prototype** | A quick build to test an idea or demo to the team | Prompt freely with mock data; rough is fine. If the idea is fuzzy, start with a grill-me interview. |
| **Revamp** | Polishing existing UI without breaking how it works | Explore against the current screens in small steps. A light plan-mode pass is usually enough. |
| **Handoff** | A clean version an engineer will build on, with real backend work | Write a short spec first (spec-driven), for example with OpenSpec, so your intent survives the handoff. |

**How much to plan is up to you.** A common rhythm: explore or prototype freely first, then write it down once the shape settles. Rigid plans early tend to fight visual exploration.

The tools named above, from light to heavier:

| Tool | What it's for | Where |
| --- | --- | --- |
| **plan mode** | Your AI lays out its approach before it writes any code. Reach for it when you move from exploring to building. | [Claude Code feature](https://code.claude.com/docs/en/permission-modes) |
| **grill-me** | Your AI interviews you to pressure-test the idea and surface gaps. Good while you're still shaping it. | [mattpocock/skills](https://github.com/mattpocock/skills) |
| **OpenSpec** | Turns your intent into a structured written spec. | [openspec.dev](https://openspec.dev) |
| **Compound Engineering** | A brainstorm-to-plan-to-build-to-review flow. Works with Claude Code, Cursor, Codex, and more. | [github.com/EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) |

All optional. Use whatever fits you or your team, or none.

> **Tip: add reference images.** Give your AI a screenshot, a Figma frame, or a screen you admire from another app. Images convey the look you want faster than words.

## Step 3: Build your change

Once you know what you're making, the loop is the same every time.

**1. Make a branch.** Pull the latest shared code first (the shared branch is usually called `main`), then make your branch off it, so you build on the current version. Have your AI show you the exact git command and wait for your OK before it runs. Git actions are worth a quick double-check.

> Branch naming is team-specific. For example, `102-add-feedback-link` or `feat/add-feedback-link`. Ask what yours uses.

**2. Let your AI learn the codebase first.** Before it writes anything, have your AI read the project, so it copies what's already there instead of inventing its own style. Point it at the setup file, a couple of existing components, and any design guidelines or tokens. This one step is what makes the output match the existing code.

> *"Before writing anything, read this codebase: the setup file, a few existing components, and the design tokens or guidelines. Then follow how this project already does things."*

> You don't have to re-orient from scratch every session. Many codebases keep a `CLAUDE.md` file (or similar) that your AI reads automatically when a session starts, so it begins oriented. If yours has one, lean on it. It's a shared team file, so read from it rather than writing your own notes into it.

**3. Match what's already there.** Reuse what's there before building new. A change that looks like it belongs is easier to trust and review.

- **Reuse components.** Have your AI check for an existing component before it builds a new one. The `ui/` and `common/` folders are where shared pieces usually live. Only make something new if you'll reuse it in a few places.
- **Use the existing tokens.** Colours, spacing, and corner radius should come from the values the project already defines. These are the same idea as design tokens in Figma. They usually live as CSS variables in a file like `src/index.css` or `app/globals.css`. (If your project uses shadcn, those values are generated at [ui.shadcn.com](https://ui.shadcn.com) and pasted into that file.) No hardcoded hex, no random pixel values. (These tokens are unrelated to the sign-in token from Step 1.)
- **Watch shared components.** A component used on more than one page changes everywhere when you edit it. Ask your AI to flag that before you touch it, so you don't restyle other screens by accident.

**4. Build only what the task needs.** Skip unrelated "improvements"; they make the review harder. Pause to ask an engineer if the AI wants to install a new dependency, edit files outside the frontend folder (like `backend/`), touch a lot of files at once, or do something you don't understand.

**5. Check it in your preview.** Look at your change in the running app at `localhost`, at mobile and desktop widths, and in every state: **empty** (no data yet), **loading** (while it fetches), and **error** (when it fails). Those three states are where UI usually breaks, and they're easy to forget.

> To see the mobile width, open your browser's dev tools (right-click the page and choose Inspect) and click the phone/tablet icon for device view. Or just drag the window narrower.

**6. Run the checks.** Ask your AI to run the project's checks *and* its build. Run both, since the quick checks (types, formatting) can pass while the full build fails. If your team has automated design checks (a "harness"), run those too: they catch hardcoded colours, contrast failures, missing focus states, tiny fonts, and generic "AI slop". A green result means nothing automated was flagged, not that the design is done, so still look at it yourself.

> A harness might be a command your AI runs, or a named skill your team has. Ask what yours is and how to run it.

**7. Have your AI review its own work.** Before a human sees it, ask your AI for an *adversarial* review (a deliberately critical pass), or run Claude Code's code-review skill. It catches rough edges and confirms the change fits the codebase's conventions, so your engineer's review goes faster. A second model like Codex catches even more, because it reviews the code independently.

## Step 4: Ship it

A merge request is how your change gets reviewed and added into the shared code. Your AI can do the mechanics. Here's what's happening, so you can follow along.

**1. Commit and push.** Write a short, clear commit message, and stage only the files you meant to change. A quick `git status` first shows what's included, so nothing stray gets committed. **Never push to `main`.** Always push your own branch.

**2. Open the merge request.** Set the target to `main`, add a reviewer (an engineer or your lead), and create it. Then write a short description of what changed, plus before/after screenshots. Ask your AI to draft it from what you did, then tidy it.

**3. Watch the checks go green.** When you open the MR, the server automatically re-runs the same checks and build from Step 3. Teams call this **CI** (continuous integration). If something fails, open the failed step, read the error (your AI can help), fix it, and push again. The MR updates itself.

**4. Get it reviewed and merged.** Your reviewer may ask for changes; make them and push again. Once approved, it's merged in.

> Once merged, many teams auto-deploy the change to a staging site, a safe copy for checking things before your users see them. Whether yours does, and where, is set per project, so check how yours works.

**Keeping your branch fresh.** While you work, others merge into `main`, so your branch can fall behind. Before merging, update it by pulling in the latest `main`. Two techniques do this: *rebase* and *merge* (not the same "merge" as your MR being merged in). Teams have a preference, so ask which yours uses and let your AI run the command. If two people changed the same lines, you'll get a **merge conflict**. Don't guess; ask your AI to help, then re-run the checks.

> **A habit worth building:** as you build, jot down the decisions: what the change is for, what states it covers, and anything the backend will need. That's the checklist your reviewer verifies against, and it's how your intent reaches the engineer instead of getting lost.

## When something breaks

Errors are normal, and on your own branch they're safe. Two things to remember:

- **You can't break anything permanently.** Nothing you do is shared until it's reviewed and merged, so your own branch is a safe place to experiment. Worst case, you undo it.
- **When you hit an error, hand it to your AI.** Copy the red text, paste it in, and ask your AI to explain what's wrong and fix it. Reading errors is a skill you pick up fast, and your AI is good at it.

## Prompts you can copy

Starting points that work in any repo. Your assistant fills in the specifics.

**Getting set up**
- "What's the tech stack here, and how do I install, run, and build this project?"
- "Clone this repo for me: [paste the address]."

**Building**
- "Before writing anything, read this codebase and its design tokens, then follow how it already does things."
- "Make a branch for this change. Show me the git command and wait for my OK first."
- "Reuse existing components and tokens. Check the ui/ and common/ folders before making anything new, and don't hardcode colours."
- "Before you change a component, tell me if it's used on more than one page."
- "Do an adversarial code review of this change. Find anything an engineer would flag, and check it fits the codebase's conventions."

**Shipping**
- "Run the checks, the build, and the design checks if we have them, then show me the results before we commit."
- "Stage only the files I changed, commit with a clear message, and push my branch. Confirm the commands first."
- "Draft an MR description from what we did, with before/after screenshots."
- "Update my branch with the latest main. Tell me whether this repo uses rebase or merge first."

**When stuck**
- "This check failed. Read the error and tell me what's wrong and how to fix it."
- "The preview stopped. Can you start it again?"

---

*A living starting point. When your team does something differently, especially around setup, access, and secrets, trust your engineers over this guide, and help improve it.*
