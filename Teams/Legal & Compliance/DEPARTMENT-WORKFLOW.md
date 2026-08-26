# Legal & Compliance — Department Workflow

## Summary

The Legal & Compliance department owns the organisation's **external legal surface** — real law, real regulators, real counterparties. Four agents; `comply` leads. Genericised per playbook §0.4b (no hardcoded venture, no hardcoded jurisdiction). Every skill and config is jurisdiction-parametric.

## Purpose

| Concern | Owning agent |
|---|---|
| Regulatory obligations (registration, notification, filing) — what we're on the hook for and when | **comply** (leader) |
| Contract review (inbound) + template library + post-signing obligation ledger | **scribe** |
| IP protection — trademark clearance, OSS licence compliance, infringement triage, IP registry | **guard** |
| Litigation and disputes — active portfolio, exposure aggregate, response-deadline calendar, case assessment | **shield** |

Anything in scope: real statute, real regulator, real counterparty, real dispute.

Explicitly out of scope (owned elsewhere):

| Concern | Owner |
|---|---|
| Internal ruling consistency (distinguish or overrule) | `Governance/precedent` |
| Internal control design + effectiveness testing (GRC) | `Cybersecurity/warden` |
| Constitutional enforcement, fiduciary veto | `Governance/board` |

## Working structure

**Department leader: `comply` (identity: Louis Brandeis persona — public-domain sources, Path 1).** Sequences multi-agent requests; owns the department-level escalation matrix; carries the identity-flavoured principles.

Non-leader agents (`scribe`, `guard`, `shield`) have universal-only principles per §6.1 and no identity content.

## Working tree

```
Teams/Legal & Compliance/
├── README.md                       (roster overview)
├── DEPARTMENT-WORKFLOW.md          (this file)
├── comply/                         (4 skills: 1 marketplace + 3 custom + identity)
├── scribe/                         (4 skills: 1 marketplace + 3 custom)
├── guard/                          (5 skills: 3 marketplace + 2 custom)
└── shield/                         (2 skills: 1 marketplace + 1 custom)
```

Total: 15 skills across 4 agents. 5 marketplace (all verbatim from public repos per §4.8) + 10 custom.

## Marketplace sources adopted

All verbatim per §4.8; wrapped by per-agent custom routing skills to bind YVON's config layer to each source plugin's config path.

| Agent | Marketplace skill | Source |
|---|---|---|
| comply | `reg-feed-watcher` | [anthropics/claude-for-legal · regulatory-legal](https://github.com/anthropics/claude-for-legal/tree/main/regulatory-legal/skills/reg-feed-watcher) |
| scribe | `vendor-agreement-review` | [anthropics/claude-for-legal · commercial-legal](https://github.com/anthropics/claude-for-legal/tree/main/commercial-legal/skills/vendor-agreement-review) |
| guard | `clearance` · `oss-review` · `infringement-triage` | [anthropics/claude-for-legal · ip-legal](https://github.com/anthropics/claude-for-legal/tree/main/ip-legal/skills) |
| shield | `case-assessment-memo` | [HHHHHejia/awesome-legal-aiagent-skills](https://github.com/HHHHHejia/awesome-legal-aiagent-skills/tree/main/litigation-dispute-resolution/draft-case-assessment-memorandum) |

## Working instructions

### Routing rules within the department

1. **`comply` is the router for multi-skill requests.** A request that touches more than one agent (e.g., "a new EU regulation just dropped that affects our vendor agreements and our IP filings") enters through `comply`, which sequences `scribe` + `guard` behind it.

2. **Cross-agent handoffs are stateful.** When one agent surfaces work for another, the routed request carries slug references so state stays linked:
   - `scribe/contract-library` templates carry the slug used by `shield/dispute-log` when a dispute arises on a contract of that template.
   - `comply/obligation-register` obligations carry slugs used by `shield/dispute-log` for regulatory-enforcement disputes and by `warden/risk-register` for control-side obligations.
   - `guard/ip-registry` assets carry slugs used by `shield/dispute-log` for IP disputes and by `scribe/contract-library` for assignment / licensing terms.

3. **Escalation is uniform across the department.** L3 is fixed to `Governance/board` per the L&C ↔ Governance boundary ruling. Always-L3 triggers by agent:
   - **comply**: BLOCKED verdict in an always-L3 category (money-services, deposit-taking, securities, health-data, credit-reporting); attestation shortfall > 20%.
   - **scribe**: automatic escalations per marketplace skill (unlimited liability, IP assignment, deal-breaker present).
   - **guard**: any overdue IP renewal; assertion decisions above stakes threshold.
   - **shield**: always-L3 dispute types (class actions, regulatory enforcement, criminal investigation, injunctive relief); any overdue response deadline; exposure above threshold.

### Boundaries with adjacent departments

| Case | We do | They do |
|---|---|---|
| A new regulation requires an internal control | `comply` identifies + records the obligation | `Cybersecurity/warden` designs + tests the control |
| A new regulation requires contractual language changes | `comply` surfaces; `scribe` updates templates | — |
| A prior internal ruling is inconsistent with current practice | We flag it | `Governance/precedent` resolves (distinguish or overrule) |
| A material dispute or launch decision crosses the fiduciary threshold | We surface it with reasoned framing | `Governance/board` decides (accept, reject, condition) |
| An AI-related regulation triggers on a proposed feature | `comply/regulated-activity-readiness` runs the check | `meta` (AI & Agents) is co-consulted for AI governance-specific questions |
| A settlement or judgment requires GL entry | `shield/dispute-log` records | `Finance & Treasury` (when built) posts the entry |

### Configuration pattern

Every agent has `operational/agent/<agent>-config.md` with sections named exactly what its wrapper skills check for. Config is intentionally full of `<FILL_IN>` — every unfilled field is announced on every invocation per §14.7 until the operator supplies real values. Do not invent values (§0.5).

Configs are per-agent, not shared at the dept level. If a jurisdiction appears in more than one agent's config (likely, e.g., "US-CA" in `comply` + `scribe` + `guard` + `shield`), the operator sets it in each — deliberate redundancy so an agent stays functional even if a dept-level config is missing.

### Logical grounding (touch-2 path)

Each agent has `logical/book-requirements.md` recording Path-1 (all-free) book candidates for touch-2 extraction. Cross-agent scripts (per §13.5 refinement 2026-07-29) will land in `Shared OS/logical/`; single-agent scripts stay under `custom/<skill>/scripts/`. Nothing extracted yet — all judgments currently reasoning-based (§0.6-flagged); flags removed on touch-2 completion.

Cross-agent script candidates likely to migrate to `Shared OS/logical/`:

- `regulatory_materiality_classifier` (comply → could serve shield's regulatory-enforcement dispute classification)
- `dispute_exposure_range_computer` (shield → could serve Finance & Treasury when built, for reserving)
- `response_deadline_calendar_computer` (shield → could serve comply for regulatory response deadlines)

### Verification discipline

Every deliverable across the department runs through `Shared OS/verification-before-completion` before returning to the operator. Not optional; inherited by every skill (§13.1).

## Fleet-level notes

- **Fleet count:** L&C's completion brings addressable agents to 50 (46 pre-L&C + 4 new).
- **CLAUDE.md §2 rail:** all 4 agents have routing rows. Dept-under-construction note removed.
- **Toon coverage:** every `.md` in the dept has a `.toon` twin (§0.8).
- **RAG index:** all skills + configs + agent.md's chunked and retrievable.

## What this department does not do

- **Doesn't decide** — surfaces, frames, escalates. Fiduciary decisions belong to `board`.
- **Doesn't accept risk** — records exposure, routes acceptance to the operator + `board`.
- **Doesn't invent regimes, obligations, IP assets, or disputes** — every state row traces to a real source citation (§0.5).
- **Doesn't design internal controls** — that's `warden`; L&C names the obligation, warden implements.
- **Doesn't own strategic vetoes** — that's `board`; L&C's job is to make sure the fiduciary has real evidence to decide on.
