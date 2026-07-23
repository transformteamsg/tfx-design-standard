# Getting started: making frontend changes in a real codebase

A short guide for designers who want to make real UI changes in a live product using an AI coding assistant, and get them safely reviewed and shipped by an engineer.

## Introduction

Here's the good news: you can make real changes to a live product without being able to write code from scratch. What you need is to understand *what each step does and why* - that understanding is what keeps you safe, and it's what makes the whole thing click. So this guide stays plain, and explains the "why" as it goes. You've got this.

**The mindset.** Think of the codebase like a shared Figma file that's also live for real users. So the game is simple: **work on your own copy, start with the frontend, keep each change small, and let a second pair of eyes check it before anything goes live.**

**Frontend-first, not frontend-only.** The frontend - what users see and click - is where you're strongest and where changes are safest, so it's the right place to begin. The backend (the server and database) is riskier ground, but not off-limits: with a good AI model and an engineer's help, plenty of designers work there too. The rule is just *don't wander into it by accident* - if a change turns out to need backend work, pause and bring in an engineer.

A couple of things worth knowing up front:

- **Your machine vs the shared server.** Your own computer holds your private copy - anything you do there (including a live preview at `localhost`) is yours alone until you share it. The shared server (GitLab or GitHub) is what the whole team sees. Keeping these separate in your head explains most of what follows.
- **Any assistant works.** This guide says "your AI assistant" on purpose. It works whether you use Claude Code (desktop app or terminal), Codex, or another. The interface differs; the process is the same. It's also flexible to your project's **tech stack** and your team's **way of working** - so wherever something varies by team, check with your engineers.

> **One standing note, so I only say it once.** I'm a designer, not a software engineer - this is the process that's worked for me, written for designers new to it. Every team sets things up differently, so when something is about *access, setup, or safety*, treat it as a starting map and check the specifics with your engineers.

## The four steps at a glance

1. **Get set up** - get the code onto your machine and running (once).
2. **Decide what you're making** - prototype, handoff, or revamp, and how much to plan.
3. **Build your change** - branch, build, and check it looks right.
4. **Ship it** - open a merge request and get it reviewed and merged.

A copy-paste prompt list is at the end.

## Git in plain words

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

**What you need on your machine.** You'll work in a code editor (like VS Code or Cursor) with an AI coding assistant running in it. Getting your machine ready - the editor, the assistant, and a few tools the project needs - is a one-time thing an engineer can walk you through. If you're setting up the assistant yourself, Claude Code's own setup guide covers it: [code.claude.com/docs/en/setup](https://code.claude.com/docs/en/setup).

Then, for the repo itself:

**1. Get access.** An engineer adds you to the repo so you're allowed in.

**2. Clone it to your machine.** On the repo's web page, click the **Code** button and copy the address. For a beginner, pick the **HTTPS** one (it starts with `https://`) - you sign in once and, on a Mac, your Keychain remembers it, so it stays invisible after that. (SSH, the `git@…` one, is an alternative some teams prefer.) The access setup is the fiddliest step, so **if you're unsure, ask an engineer to set up your own access with you.** Then cloning is one command (`git clone [address]`), or just ask your AI to do it.

**3. Keep your access safe.** Your login is **personal - never share it, and never use a teammate's.** Keep it where it belongs (your Keychain, or a protected key), and never put a token or key into a commit, an AI prompt, Slack, or email. If one ever leaks, tell an engineer so it can be replaced. Good support means an engineer helps you set up *your own* access, never hands you theirs.

**4. Get the `.env` values.** A `.env` file (short for *environment*) holds the app's settings and secret keys - things like the database address or an API key. These are kept *out* of the repo on purpose, so a fresh clone doesn't include them. An engineer sends you the real values through a secure channel (a password manager or vault, not plain Slack), and you paste them into your own local `.env`. **Without them the app won't run.**

**5. Run it, and see it.** Ask your AI or an engineer how to start the project - your AI can read the repo and give you the exact command. Once it's running, the app opens in your browser at an address like `http://localhost:5173`. That's your **preview** - your own private copy of the app, running on your computer, where you'll see and click your changes.

> **About the preview:** you start it fresh each work session, and sometimes it stops on its own - that's normal. If it does, just ask your AI to start it again. Some apps also need a supporting piece (like a database) running first; an engineer sets that up once.

## Step 2: Decide what you're making

Before any code, get clear on *what kind of work this is*. It shapes how careful and polished to be.

| Mode | What it is | How polished |
| --- | --- | --- |
| **Prototype** | A quick build to test an idea or demo to the team | Rough is fine - mock data, main flow only. It just needs to look real. |
| **Handoff** | A clean version an engineer will build on (e.g. wire up the backend) | Tidy and conventional - it should match how the codebase normally does things. |
| **Revamp** | Polishing existing UI without breaking how it works | Careful - improve the look without disturbing the wiring underneath. |

**How much to plan is up to you** - designers and teams work differently here, so treat this as a suggestion, not a rule. What many find helps: **explore loosely first, write it down after.** For visual work, don't lock a rigid plan before you've tried things - it fights your creativity. Explore or prototype first, and once the shape stops moving, *then* capture it if you need to.

A few optional tools you might try, from light to heavier:

- **plan mode** - your AI lays out an approach before it writes any code. Good for a quick sanity-check.
- **a "grill-me" interview** - your AI asks you questions to pressure-test the idea and surface gaps. Good when you're still shaping it.
- **a written spec** (tools like **OpenSpec** turn your intent into a structured spec, or **Compound Engineering** runs a brainstorm to plan to build to review flow) - worth it for a complex feature, or a prototype you're handing an engineer to build the backend, so your intent survives the handoff.

All optional. Use whatever fits you or your team - or none.

## Step 3: Build your change

Once you know what you're making, the loop is the same every time.

**1. Make a branch.** Pull the latest shared code first (the shared branch is usually called `main`), then make your branch off it, so you're building on the current version. Have your AI show you the exact git command and wait for your OK before running it - git actions are worth a quick double-check.

> Branch naming is team-specific - for example `102-add-feedback-link` or `feat/add-feedback-link`. Ask what yours uses.

**2. Match what's already there.** Look at how the codebase does things and reuse it - existing components, and the existing patterns and **tokens** (the colour, spacing, and type values already defined for reuse in the code, the same idea as design tokens in Figma; nothing to do with the sign-in token from Step 1). Matching beats inventing: a change that looks native is easier to trust and review.

**3. Build only what the task needs.** No drive-by "improvements" to unrelated things - they make the review harder. (And if it turns out to need backend work, that's the moment to pause and ask an engineer.)

**4. Check it in your preview.** Look at your change in the running app at `localhost` - at **mobile and desktop widths**, and in its **empty, loading, and error states**, not just the main flow. Half of good UI is the states people forget.

**5. Run the checks.** Before sharing, ask your AI to run the project's checks *and* its build. Run both - the quick checks (types, formatting) can pass while the full build fails.

## Step 4: Ship it

A merge request is how your change gets reviewed and added into the shared code. Your AI can do the mechanics - here's what's happening so you can follow along.

**1. Commit and push.** Use a short, clear commit message, and stage only the files you meant to change - a quick `git status` first shows what's included, so nothing stray sneaks in. **Never push to `main`** - always your own branch.

**2. Open the merge request.** Set the target to `main`, add a reviewer (an engineer or your lead), and create it. Then write a short description - what changed, plus before/after screenshots. Ask your AI to draft it from what you did, then tidy it.

**3. Watch the checks go green.** When you open the MR, the server automatically re-runs the same checks and build from Step 3 (this is called **CI**). If something fails, open the failed step, read the error (your AI can help), fix it, and push again - the MR updates itself.

**4. Get it reviewed and merged.** Your reviewer may ask for changes; make them and push again. Once approved, it's merged in.

> Once merged, many teams auto-deploy the change to a staging site (a safe copy for checking things before real users see them). Whether yours does, and where, is set per project - check how yours works.

**Keeping your branch fresh.** While you work, others merge into `main`, so your branch can fall behind. Before merging, update it by pulling in the latest `main` - there are two techniques for this, *rebase* and *merge* (not the same "merge" as your MR being merged in). Teams have a preference, so ask which yours uses and let your AI handle the command. If two people changed the same lines you'll get a **merge conflict** - don't guess, ask your AI to help, then re-run the checks.

> **The one habit that pays off most:** as you build, jot down the decisions - what this is for, what states it covers, and anything the backend will need. That's the checklist your reviewer verifies against, and it's how your intent reaches the engineer instead of getting lost.

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
- "Make a branch for this change - show me the git command and wait for my OK first."
- "Match the existing components and tokens in this codebase - reuse what's there, don't invent new styles."
- "Show me this at mobile and desktop, and the empty, loading, and error states."

**Shipping**
- "Run the checks and the build, then show me the results before we commit."
- "Stage only the files I changed, commit with a clear message, and push my branch - confirm the commands first."
- "Draft an MR description from what we did, with before/after screenshots."
- "Update my branch with the latest main - tell me whether this repo uses rebase or merge first."

**When stuck**
- "This check failed - read the error and tell me what's wrong and how to fix it."
- "The preview stopped - can you start it again?"

---

*A living starting point. When your team does something differently - especially around setup, access, and secrets - trust your engineers over this guide, and help improve it.*
