# Pilot: EduPass (Platform domain)

## Purpose

Validate the full adoption path — the website's "Get started" page
(`/harness/get-started`), plugin
install, the `/dxd:setup` wizard, and one screen shipped through the design
loop — with zero hand-holding beyond those artifacts. The Platform domain is
the pilot adopter: its users (teachers and HQ officers) sit close to the
current audience, while its product shape stresses the domain model in ways
Teacher & School does not. The standard is announced division-wide only after
this pilot exits.

## Who

- **Platform domain lead** — to be named.
- **One EduPass builder** — to be named.
- **Foundation owner** (a design lead) observes. The foundation owner never
  drives the pilot.

## Entry criteria

- DXD program plans 001–006 are merged.
- The `dxd` plugin is installable in an EduPass repo.
- The setup wizard has been rehearsed at least once outside this pilot.

## Script

1. The domain lead reads the website's "Get started" page, then explains back
   what adopting the standard takes. Record the explanation verbatim.
2. The builder installs the plugin in an EduPass repo and runs `/dxd:setup` →
   onboard my product, answering with real EduPass brand basics.
3. The builder designs one real screen through `/dxd:design` end to end,
   including the plan gate and verify phase.
4. Every point of confusion is filed via the feedback skill as it happens, not
   batched at the end.

## Exit criteria

- One screen is shipped through the loop under EduPass branding.
- The produced artifacts carry zero Teacher & School leakage — grep them for
  teacher and T&S brand values to confirm.
- The lead's explain-back from step 1 was substantially correct.
- All feedback filed during the pilot is triaged.

## Known gaps to watch

- EduPass serves teachers and HQ officers. HQ officers may need a new
  `hq-staff` audience added to the catalog via the ratchet — watch for this,
  don't pre-empt it.
- If EduPass runs a non-web stack, it will hit the web-only checks boundary.
  Record what breaks; this pilot does not solve it.

## Second track: Students domain

The Students domain runs the same script next. Its engineers are co-building
the division's AI-native workflow, so also collect harness-integration
feedback from them — not just adoption-path feedback.
