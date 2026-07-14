---
id: TYP-1
source: TFX-DS
title: UI typefaces and weights match the resolved product/domain profile; registered wordmark faces stay within their lockups
tier: L1
check: deterministic
phase: [implement, verify]
applies_to: [page, component]
verify: "Font-family scan against the resolved profile's allowed_families and declared weights; registered wordmark faces are confined to their wordmark/logo lockups (see controls/typ-1.md); checks/type-scan"
waiver: documented
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Product UI uses only the families in the active profile's
`typography.allowed_families`, at its declared display/body weights. A product's
registered brand-wordmark face from `typography.wordmarks` is permitted only inside
that wordmark/logo lockup, never for running display, headings, or body text.

This is the typographic analogue of COL-1's product primary: the global control
defines the behaviour while the active profile owns the concrete values. Keeping
wordmark registrations in the profile prevents one domain's brand assets from
becoming global exceptions.

## Rationale

A wordmark is a brand asset (cf. IDN-1 for logo images), not a general-purpose UI
face. Registering it as a scoped profile parameter avoids recurring waivers while
keeping undeclared typefaces out of running UI.

A dead font import (a typeface loaded but used by nothing) is still a TYP-1 finding.
The exception covers a used wordmark face, not loaded dead bytes.

## How to verify

**Deterministic:** `checks/type-scan.py` resolves the active profile and scans
font-family declarations against its UI families and registered wordmark faces. An
explicit domain with unresolved families produces a NOTE rather than borrowing a
different domain's values or claiming TYP-1 passed. Weight and dead-import checks
remain manual.

**Scope check (evaluator):** confirm the registered wordmark face appears only in the
wordmark/logo lockup — not promoted to headings or body. Wordmark-in-lockup passes;
wordmark-as-heading is a finding.
