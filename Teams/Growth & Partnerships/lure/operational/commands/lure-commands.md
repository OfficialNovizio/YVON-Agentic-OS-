<!--
Operational: commands file for lure. Non-leader.
-->

# lure — Commands

> Invocation patterns for lure. Non-leader — reports up to quest.

## Direct Invocations

### `demand-generation-strategy`
- `lure: channel-mix for [segment]` (Phase 1)
- `lure: demand-gen budget + attribution brief` (Phase 2 — LOAD-BEARING)
- `lure: campaign design + MQL definition with closer` (Phase 3)
- `lure: campaign performance report` (Phase 4)

### `content-marketing-funnel`
- `lure: content audit for [site]` (Phase 1)
- `lure: topic-cluster design for [product]` (Phase 2)
- `lure: funnel-stage content brief for [stage]` (Phase 3)
- `lure: factual-grounding pre-publish review` (Phase 4 — LOAD-BEARING)
- `lure: content performance report` (Phase 5)

### `marketing-attribution-and-mtx`
- `lure: martech stack assessment` (Phase 1)
- `lure: attribution implementation for [campaign]` (Phase 2)
- `lure: campaign report for [period]` (Phase 3)
- `lure: optimization recommendation` (Phase 4)

### `account-based-marketing`
- `lure: ABM strategy + type selection` (Phase 1)
- `lure: target account list for [segment]` (Phase 2 — LOAD-BEARING compliance)
- `lure: personalization playbook for [tier]` (Phase 3)
- `lure: sales-marketing orchestration for [campaign]` (Phase 4)
- `lure: ABM measurement dashboard` (Phase 5)

## Coordination Commands

| Command | Coordinates with | Purpose |
|---|---|---|
| `lure → quest: campaign / attribution feedback` | quest siblings | Upstream feedback |
| `lure → closer: MQL-to-SQL handoff` | closer siblings | Cross-agent |
| `lure → bond: co-marketing coordination` | bond siblings | Cross-agent |
| `lure → Brand Studio: creative brief + channel execution` | Brand Studio | Downstream |
| `lure → rank: technical SEO handoff` | rank (Engineering) | Cross-department |
| `lure → canopy: prospect PII compliance` | canopy `data-residency-mapping` | Cross-department (LOAD-BEARING) |
| `lure → retain: customer-advocacy content coordination` | retain | Cross-department |
| `lure → compass + lingua: international marketing` | compass + lingua | Cross-department |

## Escalation Commands

| Trigger | Escalate to | Rationale |
|---|---|---|
| Individual mental-health crisis signal | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |
| Fabricated campaign metrics pressure | operator | LOAD-BEARING — demand-gen Principle 1 |
| Spending without attribution pressure | operator + CFO | LOAD-BEARING — demand-gen Principle 2 |
| Content without factual grounding pressure | operator + counsel | LOAD-BEARING — content Principle 1 |
| Individual-user data external-publication pressure | operator + counsel | LOAD-BEARING — attribution Principle 2 |
| ABM personal-data compliance uncertainty | operator + canopy + counsel | LOAD-BEARING — ABM Principle 1 |
| B2B outreach jurisdiction compliance uncertainty | operator + international counsel | LOAD-BEARING — ABM Principle 2 |
| Defamation risk (competitor comparison content) | operator + counsel | Legal escalation |
| Governance approval for major marketing decision | board (Governance) | Governance escalation |

## Not Available (explicit)

| Command NOT accepted | Correct route |
|---|---|
| `lure: growth strategy / pricing / motion / attribution framework` | quest |
| `lure: sales execution` | closer |
| `lure: partnership execution` | bond |
| `lure: creative content creation` | Brand Studio (lena / weave / muse) |
| `lure: social / ads / audio channel execution` | Brand Studio (pulse / rio / kai / tempo) |
| `lure: technical SEO implementation` | rank (Engineering) |
| `lure: product decision` | Product |
| `lure: international marketing execution` | compass + lingua |
| `lure: draft legal disclaimer` | operator + counsel |
| `lure: individual crisis support` | manager + HR Ops + EAP |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
