# shield — Skill Routing

> Non-leader. Reports up to pilot (Risk & ESG Lead — Taleb identity).

## Skill Roster (4 skills, all custom Route D §4.6 reclass)

| Skill | Sources |
|---|---|
| `business-continuity-planning` | ISO 22301 + ISO 22317 + ISO 22318 + DRI + BCI |
| `disaster-recovery-planning` | NIST 800-34 + ISO 27031 + SNIA + AWS/Azure/GCP + Uptime Institute |
| `third-party-risk-management` | SIG + ISO 27036 + NIST 800-161 + OCC 2013-29 + Bird & Bird / Baker McKenzie |
| `operational-resilience-testing` | BoE PRA + FCA + BCBS + DORA + ISO 22301 |

## Trigger-Phrase Routing (verbatim from front-matter)

- `business-continuity-planning`: business continuity plan for / BCP for / business impact analysis for / BCP exercise for / recovery-time objective for / BCP maintenance / continuity strategy for
- `disaster-recovery-planning`: disaster recovery plan for / DR for / RTO RPO for / DR runbook / DR testing for / failover design for / DR strategy for
- `third-party-risk-management`: third-party risk assessment for / vendor due diligence for / TPRM framework / SIG questionnaire for / vendor tiering / supplier risk assessment / data-processing agreement for
- `operational-resilience-testing`: operational resilience for / important business service identification / impact tolerance for / severe-but-plausible scenario testing / DORA compliance / BoE FCA operational resilience / resilience testing plan

## Conflict-Resolution Rules

| Overlap | Resolution |
|---|---|
| "BCP" vs "DR" | BCP = business-side; DR = IT-side subset |
| "backup" | `disaster-recovery-planning` (backup ≠ DR, but backup is component) |
| "vendor" — risk vs sales-partner | Vendor = `third-party-risk-management`; sales-partner = bond (Growth & Partnerships) |
| "resilience" — enterprise vs operational | Operational = shield `operational-resilience-testing`; enterprise = pilot + hazard |
| "regulatory" — resilience-specific vs general | Resilience-specific = shield `operational-resilience-testing`; general = canopy |

## Escalation

| Involves… | Route to |
|---|---|
| **Risk strategy** | **pilot** |
| **Enterprise risk day-to-day** | **hazard** |
| **ESG reporting** | **prism** |
| **Cyber technical BCP/DR execution** | **warden + veil + bastion** (Cybersecurity) |
| **Data-processing agreement + jurisdiction** | **canopy** + counsel |
| **International resilience regulation** | **canopy** + counsel |
| **Investor material resilience event (Reg FD)** | **beacon** |
| **BCP activation crisis comms** | **beacon** `crisis-comms` |
| **Partner-vendor overlap** | **bond** (Growth & Partnerships) |
| **Individual mental-health crisis** | manager + HR Ops + EAP — HARD BOUNDARY |

## Cross-Risk & ESG Coordination

| Sibling | Coordination surface |
|---|---|
| **pilot** (Lead) | Report-up; resilience risks feed pilot committee |
| **hazard** | Risk-treatment as resilience input |
| **prism** | Third-party ESG risk |

## Compile Behavior

Per §14.2.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
