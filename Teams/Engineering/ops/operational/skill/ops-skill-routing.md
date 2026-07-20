---
name: ops-skill-routing
type: operational/skill
status: consolidated from ops's skill files — no new routing invented
assigned_agent: ops (Engineering / DevOps & Reliability)
date_added: 2026-07-09
---

## Purpose

How ops's four skills fit together. ops is the department's **safety net**: it ships what quinn passed (reversibly), catches what breaks (and makes it teach the system), and keeps the healthy system healthy. ops owns production; it does not build features or gate quality — those are the builders' and quinn's.

## The shape

```
platform-playbooks (dated mechanics for THIS business's stack — read by all three)
        │
release-discipline ──ships──> production <──keeps healthy── maintenance-hygiene
   (rollback-first)                │                          (deps/backups/baselines/expiries)
                                   │ breaks
                                   ▼
                          incident-response
                          (restore → blameless post-mortem → MANDATORY feeds:
                           quinn's regression map · dev ADRs · hygiene baselines)
```

## Routing rules

- "Deploy / ship / rollback / canary" → **release-discipline** (preconditions: quinn GATE PASS + locked plan), which pulls strategy/mechanics from **marketplace/deployment-patterns** (rolling/blue-green/canary trade-offs, Docker, CI/CD stages, probes, readiness checklists — dated snippets bind via platform-playbooks). Conflicts resolve to release-discipline.
- "Down / broken / users affected / alert fired / post-mortem" → **incident-response**.
- "Dependencies / backups / baselines / expiry / CVE / normal" → **maintenance-hygiene**.
- "How does [platform] do X / write the playbook / where are the logs" → **platform-playbooks**.
- Host-specific steps inside ANY skill → cite the playbook + its date; no undated platform claims.
- A failed restore test → incident-response (P2), not a register note.
- A failed deploy verify → release-discipline rolls back NOW; incident-response only if users were hit.

## Handoffs

- **quinn**: GATE PASS precedes every ship; ops's tool calls are plan-locked; post-mortems feed the regression map (mandatory, or written why-not).
- **dev**: design flaws from incidents become ADRs; recurrence at a mapped fragility escalates to dev; platform changes are ADRs before playbooks change; "rollback-ready" in dev's DoD is release-discipline's requirement.
- **dana** (when built): authors every migration/data script; the OPERATOR executes (Rail 3) — ops sequences, never runs them.
- **aegis** (when built): CVE triage above patch-level and security incidents become joint.
- **board** (Governance): infra spend and above-threshold changes gate there (plan §6).
- Senior authority: **Security Charter** — held even mid-incident; urgency is never a rail exception.
