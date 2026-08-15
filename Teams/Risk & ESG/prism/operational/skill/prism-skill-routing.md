# prism — Skill Routing

> Non-leader. Reports up to pilot (Risk & ESG Lead — Taleb identity).

## Skill Roster (4 skills, all custom Route D §4.6 reclass)

| Skill | Sources |
|---|---|
| `esg-materiality-assessment` | SASB + IFRS S1/S2 + GRI + Eccles + TCFD |
| `carbon-accounting-and-reporting` | GHG Protocol + CDP + TCFD + SBTi + IFRS S2 |
| `social-impact-metrics` | GRI 400 series + B Lab + Impact Management Project + ILO + SASB |
| `governance-disclosure` | SOX + DGCL + Fink annual letters + ISS/Glass Lewis + IFRS S1 + GRI 200 |

## Trigger-Phrase Routing

- `esg-materiality-assessment`: ESG materiality for / double materiality assessment / SASB materiality for / IFRS S1 S2 materiality
- `carbon-accounting-and-reporting`: carbon accounting for / Scope 1 2 3 inventory / TCFD report / SBTi target for / CDP submission
- `social-impact-metrics`: social impact metrics / DEI reporting / employee safety metrics / supplier audit / community impact / human rights disclosure / B Corp assessment / IMP impact measurement
- `governance-disclosure`: governance disclosure / board composition report / executive compensation disclosure / proxy statement / SOX 302/404 / ISS Glass Lewis alignment / ethics + anti-corruption reporting / political engagement disclosure

## Conflict-Resolution Rules

| Overlap | Resolution |
|---|---|
| "materiality" generic | prism `esg-materiality-assessment` (ESG); pilot for risk-materiality |
| "carbon" vs "emissions" | Both = `carbon-accounting-and-reporting` |
| "board" — governance disclosure vs risk-committee | prism `governance-disclosure` (external disclosure); pilot `risk-committee-and-reporting` (internal governance) |
| "audit" — ESG assurance vs internal audit | prism coordinates external assurance; sentinel (Governance) internal audit |

## Escalation to Other Agents

| Involves… | Route to |
|---|---|
| **Risk strategy (appetite / tail / committee / scenario)** | **pilot** |
| **Enterprise risk (identification / assessment / treatment / monitoring)** | **hazard** |
| **BCP / DR / third-party / operational resilience** | **shield** |
| **HR data source for social metrics** | **hire + maslow + merit + grove** (P&C) |
| **Internal audit** | **sentinel** (Governance) |
| **Board / precedent** | **board + precedent** (Governance) |
| **Cyber ESG dimensions** | **warden + veil** (Cybersecurity) |
| **International ESG jurisdiction** | **canopy** (Global Expansion) |
| **Investor ESG comms + Reg FD** | **beacon** (Comms & PR) |
| **External ESG announcement** | **herald** (Comms & PR) |
| **Legal formalization + counsel review** | **operator + counsel** — LOAD-BEARING per Universal Principle 5 |
| **Third-party assurance** | operator + external assurance provider |
| **Individual mental-health crisis** | manager + HR Ops + EAP — HARD BOUNDARY |

## Cross-Risk & ESG Coordination

| Sibling | Coordination surface |
|---|---|
| **pilot** (Lead) | Report-up; ESG risk dimension feeds pilot committee |
| **hazard** | ESG-adjacent risk (climate risk / social risk / governance risk) coordination |
| **shield** | Business-continuity + third-party risk with ESG dimension |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
