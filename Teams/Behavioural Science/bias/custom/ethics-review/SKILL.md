---
name: ethics-review
type: custom
status: built from scratch
assigned_agent: bias (Behavioural Science / Bias & Ethics Review)
portable: true
date_added: 2026-07-29
tier: 3
description: "Ethics gate for behaviour-design interventions, experiments, dark-pattern audits. Belmont-inspired framework: respect for persons · beneficence · justice. Vulnerable-population extra scrutiny."
triggers:
  - ethics review
  - is this ethical
  - ethics gate
  - dark pattern review
  - vulnerable population check
  - Belmont review
---

# Ethics Review

## Purpose
Ethics gate for behavioural work — interventions, experiments, framings, audit outcomes.

Framework: Belmont Report principles (respect for persons · beneficence · justice) adapted for product/behavioural work.

## Structure / Protocol
```
1. INTAKE      intervention / experiment / design under review
2. PERSONS     autonomy respected? consent? deception justified?
3. BENEFICENCE benefits > harms? for whom?
4. JUSTICE     benefit-risk distributed fairly? vulnerable populations?
5. VERDICT     approve / conditional / reject with rationale
```

## Instructions
Vulnerable populations (minors · elderly · financially distressed · non-native speakers · health-compromised) trigger extra scrutiny.

Dark-pattern taxonomy (Brignull) as fast-fail reference.

## Output Format
Ethics verdict + rationale + conditions if conditional.

## Principles
- **Belmont-inspired framework.**
- **Vulnerable populations = extra scrutiny.**
- **Dark patterns = auto-reject.**
- **Conditional approval names specific conditions**, not "be careful".
- **Rejection routes back for redesign**, not silent kill.

## Fallback
| Failure | Response |
|---|---|
| Framework ambiguous for edge case | Escalate to `Governance/board` |
| Vulnerable-population impact unclear | Assume yes; require primary research |

## Boundaries
- `cognitive-bias-audit` (this agent) — cognitive not ethical.
- `pre-mortem` (this agent) — different tool.
- `nudge` · `frame` · `trial` (this dept) — this skill is their gate.
- `board` — L3 escalations.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| ethics-review | File read/write | — | All steps |
