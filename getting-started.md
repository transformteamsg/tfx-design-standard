# Getting started: making frontend changes in a real codebase

A short guide for designers who want to make real UI changes in a live product using an AI coding assistant (like Claude Code), and get them safely reviewed and shipped by an engineer.

## Introduction

You don't need to be able to write code from scratch. You need to understand *what each step does and why* - that understanding is what keeps you safe and makes it click. So this guide keeps things plain, and explains the "why" as it goes.

**The mindset.** Think of the codebase like a shared Figma file that's also live for real users. So the game is simple: **work on your own copy, start with the frontend, keep each change small, and let a second pair of eyes check it before anything goes live.**

**Frontend-first, not frontend-only.** The frontend - what users see and click - is where you're strongest and where changes are safest, so it's the right place to begin. The backend (the server and database) is riskier ground, but not off-limits: with a good AI model and an engineer's help, plenty of designers work there too. The rule is just *don't wander into it by accident* - if a change turns out to need backend work, pause and bring in an engineer.

**How this guide works.** A quick glossary of the git words you'll hear, then four steps: **set up** → **decide what you're making** → **build it** → **ship it.** A copy-paste prompt list is at the end.

> **One standing note, so I only say it once.** I'm a designer, not a software engineer - this is the process that's worked for me, written for designers new to it. Every team sets things up differently, so when something below is about *access, setup, or safety*, treat it as a starting map and check the specifics with your engineers.

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

You do this once, when you first join a repo. It's the most engineer-dependent part, so it's the best place to ask for help.

**1. Get access.** An engineer adds you to the repo so you're allowed in.

**2. Clone it to your machine.** On the repo's web page, click the **Code** button and copy the address. It comes in two forms:

- **HTTPS** (`https://…`) - you sign in with a token (a generated password). On a Mac, your Keychain remembers it after the first sign-in, so it's invisible after that.
- **SSH** (`git@…`) - you set up a key on your laptop once, then it just works with no prompts.

Both download the exact same code - they only differ in how your machine proves it's allowed in. This setup is the fiddliest, most team-specific step, so **if you're unsure, ask an engineer to set up your own access with you.** Then cloning is one command (`git clone [address]`) - or just ask your AI: *"clone this repo for me: [paste the address]."*

**3. Keep your access safe.** Your login is **personal - never share it, and never use a teammate's.** Store it securely (the Keychain for an HTTPS token; a passphrase-protected key for SSH), and never put a token or key into a commit, an AI prompt, Slack, or email. If one ever leaks, tell an engineer so it can be revoked and replaced. Good support means an engineer helps you set up *your own* access, never hands you theirs.

**4. Get the `.env` values.** A `.env` file (short for *environment*) holds the app's settings and secret keys - things like the database address or an API key. These are kept *out* of the repo on purpose, so a fresh clone doesn't include them. An engineer sends you the real values through a secure channel (a password manager or vault, not plain Slack), and you paste them into your own local `.env`. **Without them the app won't run** - it can't reach the database or log you in.

**5. Run it.** The easiest path: ask your AI or an engineer *"how do I install and run this project?"* - your AI can read the repo and give you the exact commands.

> **A note on finding commands:** a project's commands are listed in a file called `package.json`. But in bigger projects the one at the very top is nearly empty, and the real commands live in the folder you actually work in (like `frontend/`) - so hunting for them yourself gets confusing. Asking your AI is faster and more reliable.

> **In LangBuddy:** the frontend runs with `yarn start` (at `http://localhost:5173`). Yours may be `npm run dev` or `pnpm dev` - ask.

## Step 2: Decide what you're making

Before any code, get clear on *what kind of work this is*. It decides how careful and polished to be.

| Mode | What it is | How polished |
| --- | --- | --- |
| **Prototype** | A quick build to test an idea or demo to the team | Rough is fine - mock data, main flow only. It just needs to look real. |
| **Handoff** | A clean version an engineer will build on (e.g. wire up the backend) | Tidy and conventional - it should match how the codebase normally does things. |
| **Revamp** | Polishing existing UI without breaking how it works | Careful - improve the look without disturbing the wiring underneath. |

**How much to plan.** The rule that saves you: **explore loose first, write it down after.** For visual work, don't lock a rigid spec before you've tried things - it fights your creativity. Explore or prototype first, and once the shape stops moving, *then* capture it if you need to.

- **Small or visual change** - a quick chat with your AI to think it through is enough.
- **Complex feature, or a prototype you're handing an engineer to build the backend** - write a short **spec** (what it does, what the backend needs, how you'd know it works). This is the intent, written down so it survives the handoff - the engineer isn't left guessing what to build or verify.

> Some teams use planning tools like plan mode, OpenSpec, or Compound Engineering for bigger features. All optional - ask if your team has a preferred one.

## Step 3: Build your change

Once you know what you're making, the loop is the same every time.

**1. Make a branch.** Pull the latest shared code first (the shared branch is usually called `main`), then make your branch off it, so you're building on the current version. Have your AI show you the exact git command and wait for your OK before running it - git actions are worth a quick double-check.

> **In LangBuddy:** branches are named like `102-add-feedback-link` or `feat/add-feedback-link`. Naming schemes are team-specific - ask what yours uses.

**2. Match what's already there.** Before building, look at how the codebase does things - reuse existing components, and match the existing patterns and **tokens** - the colour, spacing, and type values already defined for reuse in the code, the same idea as design tokens in Figma (nothing to do with the sign-in token from Step 1). Matching beats inventing: a change that looks native is easier to trust and review.

**3. Build only what the task needs.** No drive-by "improvements" to unrelated things - they make the review harder. (And if it turns out to need backend work, that's the moment to pause and ask an engineer.)

**4. Check every state.** Look at it at **mobile and desktop widths**, and check the **empty, loading, and error states** - not just the main flow. Half of good UI is the states people forget.

**5. Run the checks.** Before sharing, run the project's checks *and* its build. Run both - the quick checks (types, formatting) can pass while the full build fails.

> **In LangBuddy:** that's `yarn pre-commit` and `yarn build`. Or just ask your AI to "run the checks and build for this repo."

## Step 4: Ship it

A merge request is how your change gets reviewed and added into the shared code. Your AI can do the mechanics - here's what's happening.

**1. Commit and push.** Use a short, clear commit message, and stage only the files you meant to change - a quick `git status` first shows what's included, so nothing stray sneaks in. **Never push to `main`** - always your own branch.

**2. Open the merge request.** Set the target to `main`, add a reviewer (an engineer or your lead), and create it. Then write a short description - what changed, plus before/after screenshots. Ask your AI to draft it from what you did, then tidy it.

**3. Watch the checks go green.** When you open the MR, the server automatically re-runs the same checks and build from Step 3 (this is called **CI**). If something fails, open the failed step, read the error (your AI can help), fix it, and push again - the MR updates itself.

**4. Get it reviewed and merged.** Your reviewer may ask for changes; make them and push again. Once approved, it's merged in.

> **In LangBuddy:** a merge auto-deploys to a staging site (UAT - a safe copy for checking things before real users see them). Whether yours does, and where, is set per project - check how yours works.

**Keeping your branch fresh.** While you work, others merge into `main`, so your branch can fall behind. Before merging, update it by pulling in the latest `main` - there are two techniques for this, *rebase* and *merge* (not the same "merge" as your MR being merged in). Teams have a preference, so ask which yours uses and let your AI handle the command. If two people changed the same lines you'll get a **merge conflict** - don't guess, ask your AI to help, then re-run the checks.

> **The one habit that pays off most:** as you build, jot down the decisions - what this is for, what states it covers, and anything the backend will need. That's the checklist your reviewer verifies against, and it's how your intent reaches the engineer instead of getting lost.

## Prompts you can copy

Starting points that work in any repo - your assistant fills in the specifics.

**Getting set up**
- "What's the tech stack here, and how do I install, run, test, and build this project?"
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
- "This check failed - read the error and tell me what's wrong and how to fix it."

---

*A living starting point. When your team does something differently - especially around setup, access, and secrets - trust your engineers over this guide, and help improve it.*
