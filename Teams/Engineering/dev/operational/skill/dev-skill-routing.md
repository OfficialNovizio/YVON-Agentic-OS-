---
name: dev-skill-routing
type: operational/skill
status: consolidated from the "Boundaries" sections of dev's skill files — no new logic invented
assigned_agent: dev (Engineering / Lead Developer)
date_added: 2026-07-08
---

## Purpose

dev's routing map. Triggers: `operational/commands/dev-commands.md`.

## Where Identity Fits

dev is Engineering's department leader and carries the active identity (`identity/pragmatic-architect-werner-vogels.md`). Identity governs *how* decisions are made and communicated — design-for-failure, measure-don't-guess, boring-is-a-feature; it never overrides a skill's method, the Security Charter, or the Universal principles.

## The Law Dev Writes (four custom skills + one marketplace)

```
stack-profile                (WHAT we're built with — read by every Engineering agent)
architecture-decisions       (WHY it's that way — the ADR ledger; stack changes are ADRs)
code-review-standards        (per-PR quality gate: correctness → security → tests → style)
delivery-governance          (what DONE and MERGEABLE mean; tech-debt register; rollback-required)
git-workflow-and-versioning  (marketplace — HOW change moves: commit/branch/release mechanics, semver, changelog)
```

dev sets the rules the whole department operates under, sitting above the builders and beside quinn/ops/aegis as the safety spine's origin.

## Handoff Rules

- **stack-profile → all agents**: every agent reads the relevant section before acting; drift is a finding.
- **architecture-decisions → domain agents**: decisions touching data/backend/frontend/mobile/security/reliability are reviewed by dana/raj/mia/nova/aegis/ops before logging; stack changes update the profile.
- **code-review-standards → quinn / aegis**: per-PR review is upstream of quinn's release gate; risky surfaces route to aegis.
- **delivery-governance → quinn + ops + aegis**: the definition of done *requires* their gates; nothing is done without a tested rollback (ops) and green gate (quinn).
- **git-workflow-and-versioning → all build agents + ops**: commit/branch/release mechanics every code change follows; branch *policy* conflicts resolve to delivery-governance; the tag+changelog contract feeds ops's release-discipline; tooling examples bind via stack-profile.
- **Security Charter (senior authority)**: dev's skills enforce but never weaken it; a decision to change a rail is an operator amendment, not an ADR.

## Precedence

"Should we use X / why did we choose Y" → architecture-decisions. "What are we built with" → stack-profile. "Review this / mergeable?" → code-review-standards. "Is this done" → delivery-governance. "How do I commit/branch/version/release this" → git-workflow-and-versioning. Ambiguous → decide, document, or done-check?

## Fallback

No stack-profile → build it first (or proceed on stated stack, labeled provisional). Charter unfilled → most-restrictive reading, stated. Anything unclear → ask.
