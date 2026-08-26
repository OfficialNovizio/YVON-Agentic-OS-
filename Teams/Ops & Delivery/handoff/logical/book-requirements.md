---
agent: handoff
touch: 1
touch_2_status: pending
last_updated: 2026-07-29
---

# handoff · logical / book-requirements

Path 1 all-free.

## Proposed scripts
| # | Script | Route | Source #1 (★) | Source #2 |
|---|---|---|---|---|
| 1 | `handoff_envelope_validator` | B | Google SRE book (incident-comm patterns) — free | Team Topologies patterns — free abstracts |
| 2 | `silent_handoff_detector` | B | Own handoff-registry statistical baselines | Google SRE book (SLI/SLO) — free |
| 3 | `critical_path_computer` | A | Graph-theory reference (CLRS via NIST-hosted excerpts) — free | Reinertsen — *Principles of Product Development Flow* — CDL |

## Skills → script mapping
| Skill | Imports touch-2 |
|---|---|
| handoff-protocol | script #1 |
| handoff-registry | script #2 |
| dependency-map | script #3 |
| cross-team-incident-handoff | `sre_postmortem_culture.py` (inherited) |

## Inherited scripts (Shared OS/logical/)
| Script | Source | Purpose |
|---|---|---|
| `sre_postmortem_culture.py` **✅ EXTRACTED touch-2 2026-08-10** | [Google SRE Book Ch.15](https://sre.google/sre-book/postmortem-culture/) — CC BY-NC-ND 4.0 + [SRE Workbook Ch.10](https://sre.google/workbook/postmortem-culture/) | Cross-team incident handoff — ensures the handoff document meets the "shared with relevant stakeholders" criterion and captures root cause + action-plan ownership. |
| `sre_managing_incidents.py` **✅ EXTRACTED touch-2 2026-08-10** | [Google SRE Book Ch.14](https://sre.google/sre-book/managing-incidents/) — CC BY-NC-ND 4.0 + [FEMA NIMS](https://www.fema.gov/national-incident-management-system) | Canonical IC handoff protocol — validates the "You're now the incident commander, okay?" acknowledgment + broadcast-to-team pattern that anchors handoff's cross-timezone IC transitions. |
