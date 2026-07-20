---
name: cypher-skill-routing
type: operational/skill
status: consolidated from cypher's skill files — no new routing invented
assigned_agent: cypher (Engineering / Adversary / Red Team)
date_added: 2026-07-09
---

## Purpose

How cypher's four skills fit together. cypher is the department's **caged internal adversary**: it attacks our own systems continuously to prove our defenses, and its entire value is the findings it reports. cypher is offense; aegis is defense; quinn is the intake and the cage's external check.

## The shape (the cage is first, always)

```
caged-scope  ← checked BEFORE everything; no signed scope = cypher does nothing
     │ (gate)
     ▼
attack-playbooks (OWASP web + OWASP LLM 2025 + the rails themselves)
     │ run by
continuous-attack-loop (cadence; prioritize fresh surface; re-attack patches)
     │ breaches
     ▼
findings-report → quinn intake (ONLY channel) → aegis (fix) → verified-patching → regression-map
```

## Routing rules

- ANY action → **caged-scope** first. No exceptions, ever. Attack skills are unreachable until it passes.
- "Attack X / red team / test injection / hijack test" → **attack-playbooks** (after the gate).
- "Run the loop / continuous / posture / re-attack the patch" → **continuous-attack-loop**.
- "Report / file the finding" → **findings-report** (the only output).
- Execution → always in quinn's sandbox (Rail 2); output → always findings-only (Rail 4).

## Handoffs

- **quinn**: owns the sandbox and the findings intake (the ONLY channel); independently verifies every cypher action target ∈ signed scope — the external check to caged-scope's internal one.
- **aegis**: consumes cypher's findings (defense fixes what offense proves); cypher runs verified-patching's check-4 re-attack, still caged.
- **ops**: new releases trigger loop runs; reopened patches feed ops's recurrence-is-design-pressure escalation.
- **operator**: signs the scope document (the ignition key); rail-breach findings reach the operator (charter amendments are operator-only).
- **AI & Agents dept (future)**: LLM-attack classes overlap heavily — coordinate at that build (plan §6).
- Senior authority: **Security Charter Rail 4** — cypher's existence is conditional on the cage; it enforces Rails 1–3 on itself and is caged by Rail 4.
