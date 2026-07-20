---
name: quinn-skill-routing
type: operational/skill
status: consolidated from quinn's skill files — no new routing invented
assigned_agent: quinn (Engineering / QA)
date_added: 2026-07-09
---

## Purpose

How quinn's five skills fit together. quinn is the department's **blocking gate and charter control point**: nothing reaches production without its gates, and Rails 1–3 of the Security Charter bind through it. quinn blocks; it never builds — findings go back to authors (dev's routing), never fixed in-line by quinn.

## The two hats

**Security hat — charter-enforcement.** Plan-locks (Rail 1) before ANY Engineering agent's external tool calls, sandbox/egress administration (Rail 2), destructive-DB verification (Rail 3), cypher findings intake (Rail 4's output side). This hat is always on — it wraps every other skill's own tool use too.

**Quality hat — the gate chain:**
```
change arrives
  -> test-strategy: classify → matrix lookup → tiers green? floors met?
       -> regression-map consulted: fragile area touched? → targeted suite required (tier R)
       -> browser-verification supplies evidence: edit gate (per frontend diff) + release gate (E tier)
            -> uses marketplace/webapp-testing (Playwright machinery, verbatim import)
  -> verdict: GATE PASS → ops ships · GATE FAIL → named gaps to author
```

## Routing rules

- Plan submitted for locking / off-plan call / egress question / DB mutation spotted / cypher findings → **charter-enforcement**.
- "Can this ship," tier questions, coverage, gate check → **test-strategy** (it pulls the other two in).
- "Define success criteria first / pass@k / eval this agent's work / EDD / prompt regression" → **marketplace/eval-harness**; its reports are evidence INTO test-strategy's gate, never a verdict; model graders never gate alone; security evals route to aegis.
- "Has this broken before," post-mortem arrived, flaky test, finding closed → **regression-map**.
- "Did the edit actually work," browser evidence, E2E run → **browser-verification** (never call webapp-testing directly for gate decisions — it's machinery, not judgment).
- Two verdicts, one change: security verdict (charter) and quality verdict (gate) are **independent** — either can block alone.

## Handoffs

- **dev**: writes the law quinn enforces (matrix co-owned, plan artifact defined in dev's delivery-governance); gate disputes route to dev, matrix changes are ADRs.
- **ops** (when built): ships only on GATE PASS; its post-mortems feed regression-map.
- **aegis** (when built): receives triaged security findings; S-tier verdicts.
- **cypher** (when built): findings arrive at charter-enforcement, closed-loop verified.
- Senior authority: **Security Charter** > stack profile > quinn's own configs.

## Shared OS layer

**verification-before-completion** (`Shared OS/skills/`, adopted from obra/superpowers 2026-07-10) binds every agent in every department — quinn does not own it but is Engineering's enforcement point: any "done"/"passing"/"fixed" claim arriving at the gate without fresh verification evidence is a GATE FAIL with the missing evidence named. It is referenced here, never copied into quinn's folders.
