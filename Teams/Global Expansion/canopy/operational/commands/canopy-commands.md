<!--
Operational: commands file for canopy (Global Expansion / Regulatory & Compliance)
per §7 commands/. Non-leader agent: invocation patterns + operator-facing commands.
-->

# canopy — Commands

> Invocation patterns for canopy (Global Expansion / Regulatory & Compliance).
> Non-leader — report-up chain to compass (Global Expansion Lead).

## Direct Invocations

### `entity-setup-by-jurisdiction`

| Command | Skill phase | Output |
|---|---|---|
| `canopy: entity setup for [country]` | Phase 1-4 | Jurisdiction scope + structure decision + counsel brief + registration checklist |
| `canopy: structure decision for [country]` | Phase 2 | Entity-structure decision matrix |
| `canopy: local counsel scoping for entity in [country]` | Phase 3 | Counsel-brief template |
| `canopy: registration checklist for [country]` | Phase 4 | Per-jurisdiction customized checklist |
| `canopy: dissolution planning for entity in [country]` | Phase 5 | Dissolution-planning memo attached to setup file |

### `tax-registration`

| Command | Skill phase | Output |
|---|---|---|
| `canopy: tax registration for [country]` | Phase 1-3 | Obligation scoping + counsel brief + registration checklist |
| `canopy: tax obligation scoping for entity in [country]` | Phase 1 | Per-jurisdiction obligation memo |
| `canopy: tax counsel brief for [country]` | Phase 2 | Counsel-brief template |
| `canopy: transfer pricing setup for [entities]` | Phase 4 | Intercompany-flow map + method selection + agreement scoping |
| `canopy: BEPS Pillar 2 scoping` | Phase 5 | Exposure memo + tax-counsel handoff |
| `canopy: digital-services tax scan` | Phase 5 | Per-jurisdiction applicability + registration status |

### `employment-law-multi-jurisdiction`

| Command | Skill phase | Output |
|---|---|---|
| `canopy: employment-law scoping for [country]` | Phase 2 | 8-dimension per-jurisdiction analysis |
| `canopy: WARN Act equivalent for [country]` | Phase 2 | Collective-redundancy scoping |
| `canopy: termination requirements in [country]` | Phase 2 | Statutory notice + severance + protected-class analysis |
| `canopy: works council scoping for [country]` | Phase 5 | Codetermination map + consultation-timing requirements |
| `canopy: employee vs contractor classification in [country]` | Phase 2 | Jurisdiction-specific test result + risk assessment |
| `canopy: employment counsel brief for [country]` | Phase 3 | Counsel-brief template |

### `data-residency-mapping`

| Command | Skill phase | Output |
|---|---|---|
| `canopy: data-flow mapping for [operation]` | Phase 1 | Data-flow map |
| `canopy: GDPR/CCPA/LGPD/PIPL scoping for [data flow]` | Phase 2 | Applicable-regime scoping memo |
| `canopy: data-protection counsel brief for [scoping]` | Phase 3 | Counsel-brief template |
| `canopy: cross-border transfer mechanism for [transfer]` | Phase 4 | Per-transfer valid mechanism identified |
| `canopy: PIPL CAC assessment scoping for [transfer]` | Phase 4 | CAC / standard-contract / certification applicability |
| `canopy: Cybersecurity handoff brief for [scoping]` | Phase 5 | warden + veil + bastion handoff |

## Coordination Commands (cross-agent)

| Command | Coordinates with | Purpose |
|---|---|---|
| `canopy → compass: regulatory-scoping complete for [market]` | compass (Global Expansion Lead) | Report-up on scoping completion |
| `canopy → hire: worker-classification handoff for [country]` | hire's `payroll-and-eor` (P&C Lead) | Clear scope split (canopy=LAW, hire=EXECUTION) |
| `canopy → hire: workforce planning for divest [market]` | hire's `workforce-planning` (P&C Lead) | Divest coordination |
| `canopy → merit: jurisdiction-specific protected-class handoff` | merit's `feedback-methods` + `performance-frame` (P&C) | Perf-mgmt coordination |
| `canopy → warden: GRC-framework handoff for [jurisdiction]` | warden (Cybersecurity GRC Lead) | Technical GRC alignment |
| `canopy → veil: data-protection technical handoff for [scoping]` | veil (Cybersecurity data protection) | Encryption + DLP + access-control |
| `canopy → bastion: cloud-region + on-prem residency handoff` | bastion (Cybersecurity infra) | Infrastructure implementation |
| `canopy → lingua: legal-doc localization for [jurisdiction]` | lingua's `legal-localization` (Global Expansion sibling) | Legal-doc translation coordination |
| `canopy → frontier: WHT scoping for [cross-border payment]` | frontier's `cross-border-payments` (Global Expansion sibling) | Cross-border tax coordination |
| `canopy → beacon: material regulatory event for investors` | beacon's `investor-cadence` (Comms & PR) | Reg FD fence coordination |
| `canopy → signal: internal comms for regulatory change` | signal's `internal-cadence` or `change-comms` (Comms & PR) | Internal communications |
| `canopy → herald: external comms for regulatory event` | herald (Comms & PR) | External PR |

## Escalation Commands

| Trigger | Escalate to | Rationale |
|---|---|---|
| Individual mental-health crisis signal | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |
| Local counsel unavailable in jurisdiction | operator + international-trade counsel + IAPP/practice-area network | LOAD-BEARING legal fence per Universal Principle 5 |
| Tax counsel unavailable for structure joint review | operator + international-tax counsel | LOAD-BEARING — entity-setup Principle 2 |
| Tax-arbitrage strategy pressure | operator + tax counsel + reputational-risk review | LOAD-BEARING — tax-registration Principle 3 |
| Termination decision pressure without counsel | operator + local employment counsel | LOAD-BEARING — employment-law Principle 2 |
| Works-council / union-suit risk | operator + local employment counsel + litigation counsel | Legal escalation |
| Cross-border transfer without valid mechanism | operator + data-protection counsel | LOAD-BEARING — data-residency Principle 2 |
| Breach-response incident | warden + operator + breach-response counsel | Breach-response playbook |
| China PIPL CAC assessment applicability uncertain | operator + Chinese local counsel | LOAD-BEARING — data-residency Principle 8 |
| Regulatory inquiry received from any authority | operator + relevant counsel + potentially litigation counsel | Legal-fence escalation |
| Cross-venture regulatory coordination | marcus / vista (Executive Office) + operator + counsel | Strategy escalation |
| Divest decision surfaces individual employee impact | hire (P&C Lead) + operator + counsel | Universal Principle 2 aggregate-only |
| Governance approval for major regulatory decision | board (Governance) | Governance escalation |

## Not Available (explicit)

| Command NOT accepted | Correct route | Rationale |
|---|---|---|
| `canopy: market selection` | compass (Global Expansion Lead) | Selection scope |
| `canopy: entry mode` | compass | Entry-mode scope |
| `canopy: GTM plan` | compass | GTM scope |
| `canopy: localize [content]` | lingua | Localization scope |
| `canopy: cross-border payment execution` | frontier | Cross-border ops scope |
| `canopy: classify worker as W-2/1099/EOR/PEO` | hire's `payroll-and-eor` (P&C Lead) | Execution scope; canopy scopes LAW |
| `canopy: implement encryption / DLP / breach-detection` | warden + veil + bastion (Cybersecurity) | Technical implementation |
| `canopy: draft legal contract` | operator + counsel | Legal drafting scope |
| `canopy: file with regulator` | operator + counsel | Filing scope |
| `canopy: submit tax return` | operator + local tax accountant + counsel | Filing scope |
| `canopy: individual crisis support` | manager + HR Ops + EAP | HARD BOUNDARY |
| `canopy: individual performance / discipline decision` | merit + hire + operator + counsel | Execution scope |

## Compile Behavior

Per §14.2: every command matches in-skill phase or coordination surface;
scope discipline preserved.

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any skill phase change; any cross-agent handoff
  change; any LOAD-BEARING REFUSAL change.
