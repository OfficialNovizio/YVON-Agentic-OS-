# Legal & Compliance Department

**4 agents · all built** — External legal exposure: real law, real regulators, real counterparties. Owns the organisation's outward-facing legal surface.

| Agent | Role | Status |
|-------|------|--------|
| **comply** | Compliance Lead (department leader) — regulatory feed monitoring, obligation register, pre-launch regime readiness | ✅ Built · Brandeis persona |
| **scribe** | Contracts — template library, agreement review, redlining, post-signing obligation ledger | ✅ Built |
| **guard** | IP Protection — trademark clearance, OSS licence review, infringement triage, IP registry | ✅ Built |
| **shield** | Litigation & Disputes — dispute registry, case assessment memo, response-deadline tracking | ✅ Built |

**Department doc:** [DEPARTMENT-WORKFLOW.md](DEPARTMENT-WORKFLOW.md) — built after all 4 agents completed per playbook §10.

---

## Boundaries with existing departments

This department owns the **external** legal surface. Three incumbents own adjacent **internal** surfaces, and the split is deliberate:

| Concern | Owned by | Not owned by |
|---|---|---|
| Real law, regulators, statutes, counterparties | **Legal & Compliance** (this dept) | — |
| Internal ruling consistency, precedent, distinguish-or-overrule | `Governance/precedent` | this dept |
| Internal control design and effectiveness testing (GRC) | `Cybersecurity/warden` | this dept |
| Constitutional enforcement, fiduciary veto | `Governance/board` | this dept |

Handoffs are one-directional outward from L&C; inbound goes through operator via a dept entry point (no unsolicited inbound).

---

## Genericisation applied

The source catalog entry for this department was wired to one jurisdiction and one venture. Per playbook §0.4b and §0.5, the following were stripped before any build:

| Catalog original | Built as | Reason |
|---|---|---|
| `vyon-fintrac-readiness` | `regulated-activity-readiness` | Named a specific venture and a single national regulator. Rebuilt as a generic "does this feature trigger a licensing or registration regime" gate, with jurisdiction and regime as config. |
| `pipeda-checklist` | folded into `obligation-register` (row per regime) | Single national privacy statute hardcoded; regime becomes a parameter, not a skill. |
| `vyon-compliance-matrix` | `obligation-register` | Enumerated one country's statutes (PIPEDA, GST/HST, CBCA) in the skill body. |
| `vyon-ip-registry` | `ip-registry` | One jurisdiction, one venture hardcoded. |
| `vyon-dispute-log` | `dispute-log` | Same. |
| `>$5K` litigation escalation | `<FILL_IN>` in each agent's config | A real threshold nobody supplied. Not invented. |

No venture, company, or product name appears in any built artifact in this department.

---

## Skills roster (15 total)

**5 marketplace** (all verbatim per §4.8) + **10 custom** across the 4 agents.

| Agent | Marketplace | Custom |
|---|---|---|
| comply | `reg-feed-watcher` | `reg-monitor-routing` (wrap) · `obligation-register` · `regulated-activity-readiness` |
| scribe | `vendor-agreement-review` | `contract-review-routing` (wrap) · `contract-library` · `obligation-extraction` |
| guard | `clearance` · `oss-review` · `infringement-triage` | `ip-routing` (ONE wrapper for all 3) · `ip-registry` |
| shield | `case-assessment-memo` | `dispute-log` |

Marketplace sources:
- [anthropics/claude-for-legal](https://github.com/anthropics/claude-for-legal) — regulatory-legal, commercial-legal, ip-legal
- [HHHHHejia/awesome-legal-aiagent-skills](https://github.com/HHHHHejia/awesome-legal-aiagent-skills) — litigation-dispute-resolution

---

## Build state

All 4 agents fully built: skills · operational (5 subfolders each) · logical placeholder (touch 1 complete) · identity (leader only) · agent.md. Every agent compiled clean; every `.md` has a `.toon` twin; every skill file chunked in the RAG index; every routing row in the root `CLAUDE.md` §2 rail.

**Fleet count contribution:** +4 agents (from 46 to 50 addressable).
