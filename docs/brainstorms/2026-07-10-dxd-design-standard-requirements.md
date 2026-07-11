---
date: 2026-07-10
topic: dxd-design-standard
---

# DXD Design Standard — scaling the TFX standard to division level

## Problem Frame

The TFX Design Standard (control catalog + agent harness + micro-website) was built for the TransformX Teachers & School portfolio. Other DXD (Digital Products & Excellence Division) domain leads — Students, Parents, Platform (incl. EduPass) — have seen the website and asked to adopt it for their own products. They do not want to build their own standard or harness from scratch; they lack the time and AI-native capability to do so. They are aware they need their own branding directions (visual direction, illustration styles, colours) and want the shared machinery with "some little customization."

Today the standard conflates three layers that must be separated for division-level scale:

1. **Foundation** — portfolio-agnostic controls (accessibility, anti-slop, layout, components, content, motion) and the harness machinery (loop, checks, evaluator, ratchet). Already ~90% brand-neutral.
2. **Domain profile** — brand and context each domain declares: primary colour, typefaces, illustration direction + SREF codes, voice & tone, product list, audiences, **and tech stack**. Today this is hardcoded as TFX facts (Base UI + Radix + Plus Jakarta Sans + T&S Blue) in the catalog, skills, and CLAUDE.md files.
3. **Product context** — per-repo declarations. The embryo already exists as the `.tfx/design.json` / DESIGN.md context layer.

The work: restructure the standard so the foundation is singular and shared, domains plug in via a declared profile, the plugin reads the profile, and the website mirrors the same split — including a genuinely kind onboarding path for people who are not tech-savvy or AI-native.

---

## Actors

- A1. Foundation owner (Wondo / TFX team): governs the foundation catalog and ratchet; owns the website.
- A2. Domain lead (Students, Parents, Platform): not AI-native; can state their brand basics (primary colour, fonts, illustration direction); owns their domain profile and any domain-scoped controls.
- A3. Domain builder (designer/engineer in a domain team): installs the plugin in a product repo and runs the design loop day to day; skill level varies widely.
- A4. The harness/agent: reads foundation catalog + domain profile + product context and enforces them during design work.
- A5. Website visitor: anyone in the division evaluating or learning the standard, including non-technical stakeholders.

---

## Key Flows

- F1. Domain onboarding (the critical new path)
  - **Trigger:** A domain lead (A2) wants their team to use the standard.
  - **Actors:** A2, A3, A4
  - **Steps:** (1) Lead reads the website onboarding page — plain-language explanation of what the plugin and skills are, how the loop works, what customizing means. (2) Lead (or a builder) installs the plugin in a product repo. (3) They run the setup/onboarding wizard skill, which interviews them — product name, domain, audiences, primary colour, typefaces, stack, illustration/voice pointers — and writes the domain/product profile. (4) The design loop now runs with foundation controls + their brand.
  - **Outcome:** A team with zero harness-authoring capability is running the standard with their own brand declared; nothing TFX-branded leaks into their output.
  - **Covered by:** R5, R6, R7, R8, R12, R13

- F2. Designing under a domain profile
  - **Trigger:** A domain builder (A3) asks the agent to design or change UI.
  - **Actors:** A3, A4
  - **Steps:** Agent loads foundation catalog → resolves the repo's domain profile (colours, type, stack, voice) → runs the loop; controls that are profile-parameterized (e.g. COL-1 "each product's own primary") grade against the declared values; domain-scoped controls apply only in their domain.
  - **Outcome:** Same rigour as TFX gets today, expressed in the domain's brand.
  - **Covered by:** R1, R2, R3, R6

- F3. Domain-scoped ratchet
  - **Trigger:** A domain hits a real failure the foundation doesn't cover (e.g. Students needs reading-level or touch-target rules).
  - **Actors:** A2, A1
  - **Steps:** Domain proposes an additive control scoped to their domain (like IDN-4, the existing product-scoped precedent) → foundation owner reviews → merged with `domains:`/`products:` scope.
  - **Outcome:** Catalog grows; foundation controls are never weakened or overridden by a domain.
  - **Covered by:** R4, R14, R15

- F4. Exploring the website by domain
  - **Trigger:** A visitor (A5) wants their domain's view of the standard.
  - **Actors:** A5
  - **Steps:** Top nav gains one item — **Domains** — landing on four domain cards (Teachers & School, Students, Parents, Platform). Each domain page carries that domain's profile: brand, products, illustration direction, SREF codes, voice, stack, domain-scoped controls. Teachers & School launches rich (existing product/brand content moves there); the other three launch as structured stubs that double as the template for onboarding a domain.
  - **Outcome:** The site reads as "one foundation, four expressions" — not four parallel standards.
  - **Covered by:** R9, R10, R11

---

## Requirements

**Foundation / profile split**
- R1. The control catalog separates foundation controls (apply to every domain) from scoped controls (declared `products:`/`audiences:`/domain scope), extending the existing scope mechanism rather than inventing a new one.
- R2. Stack declarations (component library, colour system, typefaces) move out of the foundation into the domain profile. Foundation controls may demand stack-shaped behaviour ("semantic tokens only", "declare a type scale") but never name a specific stack.
- R3. A domain profile schema exists covering at minimum: domain name, products, audiences, primary colour(s), typefaces, illustration direction + SREF codes, voice & tone pointers, tech stack. TFX's current brand facts become the first instance: the **Teachers & School profile**.
- R4. Domains may add additive scoped controls via the ratchet; they cannot weaken, override, or globally waive foundation controls. Waivers stay per-instance.

**Renaming to DXD**
- R5. This repo evolves in place into the **DXD Design Standard**: repo/site identity, plugin name, skill namespace (`/tfx:` → `/dxd:` or equivalent), and waiver syntax (`tfx-waive` → `dxd-waive`) rebrand, with a migration note for existing installs. "TFX" survives only as the Teachers & School domain profile name.
- R6. Skill descriptions and harness prose are de-branded: "Teacher & School product page" phrasing becomes domain-neutral, with the domain resolved from the profile at run time.

**Plugin & onboarding wizard**
- R7. The setup skill becomes a true onboarding wizard usable by a non-AI-native person: it interviews for the profile fields (R3) and writes the profile files itself — no skill authoring or YAML editing required of the user.
- R8. A team that only knows "our primary colour and fonts" can complete F1 end to end; every other profile field has a sensible default or an explicit "inherit foundation default" marker.

**Website**
- R9. Top nav gains a single **Domains** item (not four domain buttons) landing on four domain cards; each domain page presents that domain's profile, products, and scoped controls. Existing TFX product/brand content moves under Teachers & School.
- R10. The three new domain pages launch as structured stubs whose structure doubles as the domain-onboarding template (what a domain must declare to exist here).
- R11. Site information architecture keeps the foundation (principles, guidelines, standards catalog, governance, harness) as the primary spine; domains are expressions of it, and the visual hierarchy communicates that.
- R12. A dedicated, kind onboarding page explains — in plain language for non-technical readers — what the plugin is, what skills are, how the design loop works, how to install, how to customise (the profile), and where to get help. It includes sufficient visualisations (diagrams of the foundation/profile split, the loop, and the onboarding journey), not walls of text.
- R13. The onboarding page and the setup wizard tell one consistent story: the page is the "before" (understand + decide), the wizard is the "during" (do); each references the other.

**Governance**
- R14. Governance is documented on the site: foundation owner (A1) ratchets the foundation; domain leads own profiles and domain-scoped controls; the council model is written as the stated end-state, activated when 2+ domains actively ratchet.
- R15. The ratchet contribution flow (CONTRIBUTING) is updated to route domain-scoped proposals and to state the "additive only, never override" rule.

**Pilot**
- R16. Platform/EduPass is the pilot adopter (their users are teachers and HQ officers — adjacent audience, different product shape); the Students domain is the second track and the biggest-impact target (their engineers are co-building the division's AI-native workflow). The pilot validates F1 end to end before broad announcement.

---

## Acceptance Examples

- AE1. **Covers R2, R3, R6.** Given a Platform/EduPass repo whose profile declares a different component library and typeface, when a builder runs the design loop, no output references Plus Jakarta Sans, T&S Blue, or "Teacher & School" — foundation controls still grade (contrast, anti-slop, layout), and colour/type controls grade against the declared profile values.
- AE2. **Covers R7, R8.** Given a Parents-domain designer who knows only their primary colour and font names, when they run the onboarding wizard, they finish with a valid profile without editing any file by hand.
- AE3. **Covers R4.** Given a domain proposing "relax AA contrast for our brand colour," the ratchet rejects it as an override; given the same domain proposing an additive "reading-level ≤ grade 4 for student-facing copy" control scoped to Students, it is reviewable and mergeable.
- AE4. **Covers R9, R12.** Given a non-technical domain lead landing on the site, they can navigate Domains → their domain, and from the onboarding page explain back what the plugin does and what their team must decide (brand basics) before adopting.

---

## Success Criteria

- Platform/EduPass (pilot) completes F1 without hand-holding beyond the website + wizard, and ships at least one screen through the loop under their own brand.
- A domain lead who is not AI-native can read the onboarding page and correctly state what adopting requires of their team.
- The TFX/Teachers & School experience does not regress: existing installs keep working through the rename (migration path documented), and the T&S profile reproduces today's brand behaviour exactly.
- Zero foundation controls got weakened to make scaling work; TFX-specific facts exist only in the T&S profile.
- The website reads as one standard with four domain expressions; each domain page states its profile or its stub-template status honestly (no fake completeness).

---

## Scope Boundaries

### Deferred for later

- Non-web check adapters: today's check scripts assume web/CSS (DOM contrast, stylesheet scans). Native-mobile or non-web stacks are a declared known boundary, not solved now.
- Promoting individual domains into the top nav — revisit when a second domain has real content.
- Cross-domain design council governance — documented as end-state (R14), activated later.
- Per-domain illustration-generation tooling (SREF workflows) beyond documenting each domain's codes on their page.
- Auto-update/distribution improvements to the plugin marketplace flow.

### Outside this product's identity

- Per-domain forks of the catalog or harness — the entire point is one foundation; forks are rejected, not deferred.
- Domains overriding or relaxing foundation controls (a "foundation" that yields is not one).
- Becoming a component library or shipping UI code — the standard governs and verifies; it does not ship components.
- Building bespoke harnesses for teams that want fundamentally different machinery — they can consume the catalog (the website/llms.txt already serves it) without the harness.

---

## Key Decisions

- **Evolve this repo in place into DXD** (vs. new repo): one source of truth, history preserved, no sync problem. TFX becomes the first domain profile inside it.
- **Foundation owner governs; domains own profiles** (vs. council now): matches current capability reality; council written as end-state.
- **Profile + additive scoped controls** (vs. tokens-only or override rights): Students will genuinely need domain controls; overrides would hollow out the foundation.
- **Pilot = Platform/EduPass, second track = Students**: pilot has adjacent users (teachers/HQ officers) but different product shape — a strong test; Students is the biggest impact and has co-building engineers.
- **One "Domains" nav item, not four top-level buttons**: the site must say "one foundation, four expressions," and three domains launch as stubs — four buttons would overstate parity and crowd the nav.
- **Stack is profile, not foundation** (user-identified): foundation demands stack-shaped behaviour without naming a stack.

## Dependencies / Assumptions

- The existing `products:`/`audiences:` catalog scoping and the `.tfx/design.json`/DESIGN.md context layer are the extension points to build on (verified present: `harness/standards/catalog.yaml` meta, IDN-4 product-scoped precedent, LAY grid declaration).
- Domain leads can supply brand basics (colour, fonts, illustration direction) even without AI-native workflow capability — stated by them.
- The plugin distribution channel remains the Claude Code plugin marketplace (`transformteamsg/tfx-design-standard`); rename implications for install paths need a migration note (deferred detail to planning).
- Assumption (unverified): all near-term adopting products are web-stack; check-script portability beyond web is out of scope (see Deferred).

## Outstanding Questions

### Deferred to Planning

- [Affects R5][Technical] Exact rename mechanics: plugin id, marketplace path, skill namespace, `.tfx/` directory name, backwards-compat shims for existing installs.
- [Affects R3][Technical] Profile file format and layering (domain profile vs per-product context: one file or two; where the domain profile lives — plugin config vs product repo vs fetched from the site).
- [Affects R9][Technical] Content model for domain pages (MDX section per domain under `content/`, frontmatter-driven cards) consistent with the existing `content/` + `map.json` architecture.
- [Affects R12][Needs research] Visualisation set for the onboarding page (which diagrams, produced how) — must itself pass the site's own SLP/catalog controls.
- [Affects R6][Technical] How skills resolve domain-neutral language at run time without bloating every skill description.

## Next Steps

-> `/improve` — survey the repo against these requirements and produce prioritized, self-contained implementation plans (model-assigned by difficulty/importance) for execution.
