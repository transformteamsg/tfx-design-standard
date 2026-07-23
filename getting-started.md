# Getting started: making frontend changes in a real codebase

A guide for designers who want to make real, safe UI changes in an existing product - using an AI coding assistant (like Claude Code) - and get that change reviewed and merged by an engineer.

> **A note before we start.** I'm a designer, not a software engineer. This is the process that has worked for me, written plainly for other designers who are new to it. Every team sets things up a little differently, so treat this as a starting map, not gospel - **check the specifics with your engineers.** Engineers reading this: if anything here is off, please correct it.

You don't need to be able to write code from scratch. You need to understand *what each step is doing and why*, so you can tell when something looks wrong. That understanding is what makes this safe. So this guide leads with the "why" every time, not just the "how".

---

## The mindset

Think of the codebase like a shared Figma file that is also live in production. Lots of people work in it; a mistake is visible to real users.

So the whole game is three things:

- **Move fast on the UI** - the visual layer is where you're strong and where changes are low-risk.
- **Stay fenced off from anything risky** - you work on your own copy, you start in the frontend (where changes are safest), and you never merge your own work into the shared codebase without a second pair of eyes.
- **Hand the engineers a small, clean change** - the smaller and clearer your change, the faster and safer the review.

**Start with the frontend.** The frontend is what users see and interact with - it's where you're strongest and where changes are lowest-risk, so it's the right place to begin. The backend (the server, the database, how data is stored) is riskier ground, but it's not off-limits: with a capable AI model and an engineer's support, plenty of designers work there too. The rule isn't "never touch the backend" - it's *don't wander into it by accident.* If a change turns out to need backend work, treat that as a moment to pause and bring in an engineer, then decide together whether you take it on with their help or hand it over.

---

## Every repo is different - get your bearings first

Each product lives in its own **repo** (short for repository - the shared folder of code your team works in, hosted somewhere like GitLab or GitHub). Each one has a different **tech stack** (the tools and frameworks it's built with). One app might use React with Vite; another Next.js; another Vue. The *process* in this guide is the same for all of them - but the exact commands and file names change per stack.

The good news: you don't have to memorise any of it. You just need to know how to *find* your repo's specifics.

Three places to look, every time:

1. **The README** - most repos have a `README.md` at the root that explains what the project is and how to run it. Start here.
2. **`package.json`** - if it's a JavaScript/TypeScript project, this file's `scripts` section lists the real commands (how to start it, test it, build it). It's the single best source of truth for "what do I actually type?".
3. **An engineer, or your AI assistant** - genuinely the fastest path. Ask: *"What's the tech stack here, and how do I install, run, test, and build this project?"* Your AI can read the repo and answer for that specific codebase.

> **Why this matters:** the plain-English prompts in this guide stay the same in any repo. Your AI assistant is the translator that turns *"start the app and run the checks"* into the exact command for your stack. That's what lets one process work everywhere.

Throughout this guide, wherever a command is stack-specific, I'll show the LangBuddy version as an example in a box like this:

> **In LangBuddy:** the app starts with `yarn start`. In your repo it might be `npm run dev` or `pnpm dev` - check `package.json` or ask.

---

## Do once, every session, every change

A lot of early confusion comes from not knowing what repeats. Here's the map:

| When | What you do |
| --- | --- |
| **Once**, when you first join a repo | Get access, copy it to your machine, install it, get the `.env` values from an engineer. |
| **Every work session** | Start the app locally; pull the latest version of the shared code. |
| **Every change / feature** | Make a branch (your own copy of the code to work on), build the change, run the checks, open a merge request, get it reviewed. |

You only do the heavy setup **once per machine**. After that, day-to-day is just "start the app, make a branch, do the work, open a merge request".

---

## One-time setup (do this with an engineer)

You can't work on the code until you have a copy of it running on your own machine. This part is genuinely the hardest, and it's the most engineer-dependent - so **ask for help and don't assume it'll just work.** The steps differ per repo; the README and your AI assistant will fill in the specifics.

1. **Get access to the repository** (the repo). An engineer adds you so you're allowed in.
2. **Copy it to your machine** - this is called *cloning*, and it downloads the whole project into a folder so you can open and run it locally. Here's the exact path:
   - On the repo's web page, find the **Code** button (blue on GitLab, green on GitHub) near the top right, and click it.
   - Copy the clone address. You'll see two kinds: **SSH** (starts with `git@...`) and **HTTPS** (starts with `https://...`). They do the same thing - they differ only in how your machine proves it's allowed in. SSH uses a one-time key you set up; HTTPS asks for a token or password.
   - **Which one to use, and setting up that access, is the part to do with an engineer the first time.** It's fiddly, it's team-specific, and it's the step most likely to trip you up - so don't battle it alone.
   - Once you have the address, cloning is a single command - `git clone <the-address>` - or just ask your AI: *"clone this repo for me: &lt;paste the address&gt;"*.

   > **In LangBuddy (GitLab):** the **Code** button gives you an SSH address (`git@sgts.gitlab-dedicated.com:...`) and an HTTPS one. An engineer set up my access the first time - well worth asking for.
3. **Install and run it.** Projects need their building blocks installed before they'll start, and there are often prerequisites (specific tools or versions) first. The README usually lists these; your AI can read them and walk you through.
4. **Get the `.env` values** - see the callout below. Without these, the app won't run.

> **What's a `.env` file, and why does an engineer have to send you one?**
>
> A `.env` file (short for *environment*) holds an app's settings and secret keys - things like the database address and password, or the key that lets the app call an AI service. It's a list of `NAME = value` lines.
>
> The code itself doesn't contain these values. Instead the code says *"go fetch the key from the environment"*. That's deliberate, for two reasons: (1) real secrets should never sit in the shared code, and (2) the same code needs different values in different places (your laptop uses a test database; the live site uses the real one).
>
> Because those values are secret and specific to each setup, they're **kept out of the repo on purpose**. So when you clone, you *don't* get them - you usually only get an `.env.example` template with blank placeholders. An engineer sends you the real values through a **secure channel** (a password manager or vault, ideally - not plain Slack or email), and you paste them into your own local `.env` file.
>
> **This is the secure pattern working correctly, not a workaround.** Keys travel person-to-person or through a vault; they never travel through the repo.
>
> **If you skip this:** the app won't run locally - it can't reach the database, call services, or log you in. So getting the `.env` values is a real prerequisite, not an optional extra.

---

## Is it actually safe for me to code here?

Coding safely is mostly about how the project is set up *around* you. Some of this may already be in place; some may not. **Don't assume - check with your engineers what protections exist and how to work safely in their repo.** Here's what "safe" tends to look like, so you know what to ask about:

- **A rulebook the AI reads** - many repos have a `CLAUDE.md` (or similar) at the root that tells the AI assistant the project's conventions and commands, so it works the right way by default.
- **Guardrails against dangerous commands** - a good setup blocks the truly destructive stuff (wiping data, force-overwriting shared history) before it can run.
- **A sandbox** - the AI runs with limited reach, so it can't freely touch files or the network outside the project.
- **CI as a backstop** - when you open a merge request, the project's automated checks (called *CI*) re-run tests and builds on the server. It's a safety net that catches things your local run missed.

If none of this exists in a repo, that's not a reason to panic - it's a reason to slow down and set it up *with* an engineer first.

### Keep secrets safe

This one is worth understanding properly, because it's the area where a small slip has real consequences. A "secret" is any key, password, token, or credential.

**Habits that protect you in any repo:**

- **Never paste a real key, password, or token into a prompt or a commit.** No tool can reliably catch this - it's the number-one risk, and it's entirely in your hands. (If you ever do it by accident, tell an engineer so the key can be rotated.)
- **Look at what you're about to commit.** Before committing, run `git status` (what's included) and read the change with `git diff --staged`. If you see a `.env` or anything credential-shaped in the list, stop.
- **Keep secrets in a gitignored `.env`** (more on `.gitignore` below), never in a normal file.
- **Treat any file with "key", "secret", "token", "password", or "credential" in its name as untouchable** - don't open, edit, or commit it without asking an engineer.
- **If your AI assistant asks permission to read a `.env`, `.ssh`, or `credentials` file, that prompt is a stop sign.** Say no unless you know exactly why it's needed.

**A quick check you can run (or just ask your AI to run these and tell you what it finds):**

- Is `.env` ignored by git? `git check-ignore .env` - if it prints the file path, git is ignoring it (good); if it prints nothing, it is *not* ignored, so flag that.
- Are any secret-shaped files already committed? `git ls-files | grep -iE '\.env|secret|credential|\.pem|\.key'` lists tracked files with those names. (It only catches obvious names - a content scanner is what catches secrets hidden inside ordinary files.)
- **And ask your engineers:** Is there secret-scanning in the project's CI? Is there a pre-commit check that blocks secrets? Where are real secrets meant to live?

> **An honest note on how far protection goes.** Gitignoring `.env` only helps if the file was ignored *before* it was ever committed - if a secret is already in the history, adding it to `.gitignore` later does nothing; an engineer has to *rotate the value first* (so the old one stops working), then remove it from history. Gitignore also only governs git - a secret can still leak through logs, screenshots, or CI output even if it was never committed. And CI secret-scanning usually runs *after* you push - it's an alarm, not a lock on the door. So none of this replaces the habits above.

> **One nuance for frontend values.** In some setups, "public" frontend config (things prefixed `VITE_`, `NEXT_PUBLIC_`, or `REACT_APP_`, depending on the framework) is committed on purpose - because those values get bundled into the browser and are public anyway. That's fine *as long as they're never actual secrets.* The safe rule: **assume anything in frontend code is world-readable, and keep real secrets out of it entirely.**

---

## Before you build: what am I making?

Get clear on *what kind of work this is* before you touch code - it decides how careful and polished you need to be.

| Mode | What it is | How polished |
| --- | --- | --- |
| **Prototype** | A quick build to test an idea or demo to the team | Rough is fine - mock data, happy path only (the main flow, no edge cases). It just needs to look real and tell the story. |
| **Handoff** | A clean version an engineer will take further (e.g. wire up the real backend) | Conventional and tidy - engineers will build on it, so it should match how the codebase normally does things. |
| **Revamp** | Polishing rough existing UI without breaking how it works | Careful - improve the look without disturbing the wiring underneath. |

Naming the mode up front saves you from over-building a throwaway prototype, or under-building something an engineer depends on.

---

## Planning your change

You don't need a heavy process for every change. Match the planning to the size and risk.

The single most useful rule: **explore loose first, spec tight after.** For anything visual or interactive, don't write a rigid specification before you've tried things - you'll lock in decisions while your taste is still forming, and it'll fight your creativity. Explore first (prototype, or just talk it through), and once the shape stops moving, *then* write it down if you need to. A spec written after exploration records a decision you already trust, instead of guessing at one.

| Your situation | A good approach |
| --- | --- |
| A tiny tweak (copy, a colour, moving a button) | Just do it, or a one-line "plan" - any ceremony costs more than the change. |
| A new self-contained piece of UI, no backend | A light plan or a quick back-and-forth to surface the states (empty, loading, error) before you build. |
| A complex feature you'll keep working on | Write it down properly, so the intent survives across sessions. |
| A prototype you're handing to an engineer to build the backend | Write a **spec** - this becomes the document they read to know exactly what to build and verify. |

**Tools that can help (all optional - pick what fits, or use none):**

- **Plan mode / a "grill me" interview** - the lightweight default. The AI pressure-tests your idea and lays out an approach before writing code. Great for simple, exploratory work.
- **OpenSpec** - writes a durable, structured spec (requirements in plain "when the user does X, the system does Y" form). Best when intent needs to be precise and handed to someone else to build.
- **Compound Engineering** - a fuller workflow (brainstorm → plan → build → review → capture learnings) with multiple AI reviewers. Best for larger, fuzzier, or riskier features.
- Your team may also have its own skills or templates - ask.

> **Why write a spec at all?** So the *intent flows through*. The common handoff failure is the engineer gets a screen but not the decisions behind it, so they don't know what to build or how to check it. A short spec - what this does, what the backend needs to support, how you'd know it works - is that intent, written down so it survives the handoff.

---

## The build loop

Once you know what you're making, the loop is the same every time.

1. **Make a branch - and confirm the git command first.** A *branch* is your own copy of the code to work on, so nothing you do affects the shared version until it's reviewed. Pull the latest shared code *before* you branch, so you're building on the current version, not a stale one. Always have your AI show you the exact git command and wait for your OK before running it - git actions are the ones worth double-checking.

   > **In LangBuddy:** branches are named like `102-add-feedback-link` (with a ticket number) or `feat/add-feedback-link`. Naming schemes are team-specific - **ask what yours uses.**

2. **Ground the work in your design standard.** Before building, look at how the codebase already does things - reuse existing components, match the existing patterns and tokens (the colour, spacing, and type values already defined for reuse in the code - the same idea as design tokens in Figma), don't invent new styles. Matching beats improving here; a change that looks native to the codebase is easier to trust and review.

3. **Build it - staying in the frontend to start.** Make the change, and only the change the task needs. If it turns out to need backend work, pause and loop in an engineer (see "Start with the frontend" above) rather than pushing on alone. No drive-by "improvements" to unrelated things - they make the review harder and the risk higher.

4. **Check it looks right.** Look at it at **mobile and desktop widths**, and check the **empty, loading, and error states**, not just the happy path. Half of good UI is the states people forget.

5. **Run the checks.** Before you share it, run the project's checks and its build. Run *both* - the quick checks (types, formatting) can pass while the full build fails, so one isn't a substitute for the other.

   > **In LangBuddy:** that's `yarn pre-commit` (types + formatting) and `yarn build`, plus `yarn test`. Your repo's commands live in `package.json` or the README - or ask your AI to "run the checks and build for this repo".

---

## Shipping it: your first merge request

A **merge request** (MR on GitLab, called a **pull request** or PR on GitHub) is how your change gets reviewed and added into the shared code. Your AI can do the mechanics - but understanding them lets you tell when something's off.

The four words, in plain terms:

- **Commit** = save a checkpoint of your work. (Commit often - it's what protects you. Committed work can be recovered even after a mistake, via a git safety net called `reflog`; *uncommitted* work can be lost for good.)
- **Push** = upload your branch to the shared server so others can see it. Not merged yet - just parked there.
- **Merge request / pull request** = ask for your branch to be reviewed and added into `main` (the shared code). This is also where the automated CI checks run and where discussion happens.
- **Merge** = approved and added in. Your work is now part of the shared codebase.

The steps:

1. **Commit your work** (Claude often does this as it goes). Use a short, clear message describing what the change does. Stage only the files you meant to change - check `git status` first so nothing stray sneaks in.
2. **Push your branch** to the server. **Never push directly to `main`** - always your own branch. Your AI can do this; just have it confirm first.
3. **Open the merge request.** Set the target to `main`, add a reviewer (an engineer, or your lead designer), and create it.
4. **Write a clear description.** Keep it short and scannable: what changed, and screenshots of before/after. Ask your AI to draft it from what you did this session, then tidy it so it reads well.
5. **Watch the CI checks go green.** After you open the MR, the server re-runs the tests and build. If something fails, open the failed step, read the error (your AI can help), fix it, and push again - the MR updates automatically.
6. **Get it reviewed and approved.** Your reviewer may ask for changes; make them and push again. Get approval before it's merged.

> **In LangBuddy:** once merged, the change auto-deploys to a staging site (UAT, short for user acceptance testing - a safe copy of the app for checking things before real users see them) before production. Whether a merge auto-deploys, and where to, is set per project - **check how yours works.**

**Keeping your branch fresh.** While you work, other people merge things into `main`, so your branch can fall behind. Before merging (or if the MR says "behind"), update it. There are two ways teams do this - *rebase* or *merge* the latest `main` into your branch - and teams have a preference, so **ask which yours uses.**

> **A real caution on rebase.** Rebasing rewrites your branch's history. It's fine on a branch only *you* have touched. But never rebase a branch other people have already pulled, and once your branch is pushed, a rebase needs a careful "force push" (`--force-with-lease`, never a plain `--force`) - this is exactly the kind of step to let an engineer or your AI handle, and to ask about rather than guess.

If two people changed the same lines, you'll get a **merge conflict**. Don't guess - ask your AI to help resolve it, then check *both* your change and theirs are kept, and **re-run the checks** afterwards (resolving a conflict can quietly break things).

> **Capture the intent as you go.** As you build, jot down the decisions - what this is for, what states it covers, and anything the backend will need to support. This becomes the checklist your reviewer verifies against, and it's the "intent that flows through" so the engineer isn't guessing. It's the single highest-value habit in this whole process.

---

## Handy prompts for your AI assistant

Copy-paste starting points. They stay the same across repos - your assistant fills in the specifics.

**Getting oriented**
- "What's the tech stack here, and how do I install, run, test, and build this project?"
- "Give me a plain-English tour of this repo - where does the frontend live, and what are the main patterns it uses?"

**Starting a change**
- "Make a branch for this change, and show me the exact git command and wait for my OK before running it."
- "Pull the latest main first, then create my branch."

**Building**
- "Match the existing components and design tokens in this codebase - reuse what's there, don't invent new styles."
- "Show me this at mobile and desktop, and the empty, loading, and error states."

**Shipping**
- "Run the checks and the build for this repo, then show me the results before we commit."
- "Stage only the files I changed, commit with a clear message, and push my branch - confirm the commands first."
- "Draft an MR description from what we did this session, with before/after screenshots."
- "Give me the MR link."
- "Update my branch with the latest main - tell me whether this repo uses rebase or merge first."

**When something's wrong**
- "This CI check failed - read the error and tell me what's going on and how to fix it."
- "Help me resolve this merge conflict, and confirm both changes are kept."

---

*This guide is a living starting point. If your team does something differently - especially around setup, guardrails, and secrets - trust your engineers over this document, and help improve it.*
