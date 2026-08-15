<!--
Operational: commands file for compass (Global Expansion Lead) per §7 commands/.
Leader agent: invocation patterns + operator-facing + sequencing commands.
-->

# compass — Commands

> Invocation patterns for compass (Global Expansion Lead — Ghemawat identity).
> Leader — sequences canopy, lingua, frontier per DEPARTMENT-WORKFLOW.

## Direct Invocations

### `market-selection-framework` (Phase 1)

| Command | Skill phase | Output |
|---|---|---|
| `compass: candidate pre-screen for [candidates]` | Phase 1 | 5-15 → 5-8 finalists with hard-blocker eliminations |
| `compass: CAGE analysis for [country]` | Phase 2 | Per-candidate C/A/G/E scores with cited indicators |
| `compass: industry-weighted CAGE ranking` | Phase 2 | Candidates ranked by weighted CAGE per business industry |
| `compass: LOF assessment for [country]` | Phase 3 | 4-component LOF with cited sources |
| `compass: opportunity sizing for [country]` | Phase 3 | Market size / segment / competitive intensity with cited sources |
| `compass: prioritization matrix` | Phase 4 | 2×2 with candidate placements |
| `compass: first-market-adjacency sequencing` | Phase 5 | #1, #2, #3 with adjacency logic |
| `compass: market-selection decision memo` | Phase 6 | Full framework output + explicit recommendation |

### `entry-mode-decision` (Phase 2)

| Command | Skill phase | Output |
|---|---|---|
| `compass: strategic-control assessment for [market]` | Phase 1 | Brand / IP / customer / pricing / operational control profile |
| `compass: investment + speed constraints` | Phase 2 | Operator + CFO-approved budget + timing |
| `compass: CAGE/LOF → mode mapping for [market]` | Phase 3 | Ghemawat rule applied to chosen market |
| `compass: entry-mode decision matrix for [market]` | Phase 4 | 7-9 modes × 5-6 criteria with weighted scores |
| `compass: entry-mode readiness check for [mode]` | Phase 5 | Per-mode readiness verification (DD / partner-fit / entity-setup / etc.) |
| `compass: entry-mode decision memo for [market]` | Phase 6 | Full framework + explicit recommendation |

### `go-to-market-adaptation` (Phase 3)

| Command | Skill phase | Output |
|---|---|---|
| `compass: AAA analysis for [market]` | Phase 1 | Adaptation / Aggregation / Arbitrage scoring + dominant strategy |
| `compass: product adaptation scoping for [market]` | Phase 2 | Feature / packaging / positioning / service bundle |
| `compass: pricing for [market]` | Phase 3 | Level / structure with PP + competitive benchmark |
| `compass: channel plan for [market]` | Phase 4 | Channel plan consistent with entry-mode |
| `compass: messaging brief for [market]` | Phase 5 | Meyer 8-scale profile → per-scale messaging |
| `compass: GTM launch plan for [market]` | Phase 6 | Full framework + timeline + milestones + handoffs |

### `expansion-portfolio-mgmt` (Phase 4+)

| Command | Skill phase | Output |
|---|---|---|
| `compass: portfolio inventory` | Phase 1 | Per-market performance + resources + regional grouping |
| `compass: market classification matrix` | Phase 2 | Ghemawat-adjusted BCG per market with regional overlay |
| `compass: cross-market learning transfer` | Phase 3 | Concrete recommendations per transferable insight |
| `compass: portfolio rebalance decision` | Phase 4 | Double-down / hold / invest / divest / MVP per market |
| `compass: market-exit protocol for [market]` | Phase 5 | Jurisdiction-specific coordination plan |
| `compass: annual portfolio review` | Phases 1-4 all | Full portfolio review artifact |

## Coordination Commands (cross-agent — compass sequences Global Expansion)

| Command | Coordinates with | Purpose |
|---|---|---|
| `compass → canopy: entity setup for [market]` | canopy `entity-setup-by-jurisdiction` | Regulatory scoping post-selection |
| `compass → canopy: tax registration for [market]` | canopy `tax-registration` | Tax scoping |
| `compass → canopy: employment-law for [market]` | canopy `employment-law-multi-jurisdiction` | Employment-law scoping |
| `compass → canopy: data-residency for [market]` | canopy `data-residency-mapping` | Data-protection scoping |
| `compass → lingua: product localization for [market]` | lingua `product-localization` | Technical i18n |
| `compass → lingua: marketing localization for [market]` | lingua `marketing-localization` | Marketing translation + cultural adaptation |
| `compass → lingua: cultural adaptation for [market]` | lingua `cultural-adaptation` | Deep cultural work |
| `compass → lingua: legal localization for [market]` | lingua `legal-localization` | Legal-doc localization |
| `compass → frontier: cross-border setup for [market]` | frontier all 4 skills | FX + banking + payments + logistics |
| `compass → hire: international hiring for [market]` | hire `payroll-and-eor` (P&C Lead) | International-hiring coordination |
| `compass → signal: internal announcement of [expansion event]` | signal `internal-cadence` or `change-comms` | Internal comms |
| `compass → herald: press announcement of [expansion event]` | herald `press-kit` + `media-relations` | External PR |
| `compass → beacon: investor comms for [material expansion event]` | beacon `investor-cadence` | Reg FD fence |
| `compass → beacon: DD support for [acquisition]` | beacon `data-room-discipline` | Acquisition DD |

## Escalation Commands

| Trigger | Escalate to | Rationale |
|---|---|---|
| Individual mental-health crisis signal | manager + HR Ops + EAP | HARD BOUNDARY per Universal Principle 3 |
| Sanctions / trade-restriction status ambiguous | operator + international-trade counsel | LOAD-BEARING legal fence — market-selection-framework Principle 9 |
| Acquisition candidate without DD readiness | beacon `data-room-discipline` + operator + M&A counsel | LOAD-BEARING — entry-mode Principle 5 |
| JV candidate without partner-fit assessment | operator + M&A/JV counsel | LOAD-BEARING — entry-mode Principle 6 |
| Divest decision (any) | operator + local employment counsel per jurisdiction | LOAD-BEARING — portfolio-mgmt Principle 5 |
| Tax-arbitrage or regulatory-arbitrage GTM strategy | operator + tax / regulatory counsel | LOAD-BEARING — GTM Principle 9 |
| Cross-venture expansion decision | marcus / vista (Executive Office) | Strategy escalation |
| Regulatory action forcing accelerated exit | operator + international-trade + relevant local counsel | Legal-fence escalation |
| Material-expansion-event Reg FD implications | beacon `investor-cadence` + operator + CFO + securities counsel | Reg FD fence |
| Strategy-level cross-venture / cross-department dispute | operator + board (Governance) | Governance escalation |

## Not Available (explicit)

| Command NOT accepted | Correct route | Rationale |
|---|---|---|
| `compass: entity setup` | canopy | Regulatory scope, not compass |
| `compass: hire in [market]` | hire (P&C Lead) | Cross-department |
| `compass: draft legal contract` | operator + counsel | Legal scope |
| `compass: financial-portfolio management` | operator + CFO | Different domain entirely |
| `compass: submit sanctions filing` | operator + international-trade counsel | Filing scope |
| `compass: pitch deck for fundraising` | echo (Executive Office) | Fundraising scope |
| `compass: individual customer relationship` | future Client Success dept | Cross-department |
| `compass: individual crisis support` | manager + HR Ops + EAP | HARD BOUNDARY |

## Compile Behavior

Per §14.2:

- Every command matches an in-skill phase or coordination surface
- Coordination commands preserve scope discipline per §2 + DEPARTMENT-WORKFLOW
- Escalation commands cover 11 LOAD-BEARING REFUSALS + HARD BOUNDARY categories
- Not-available commands prevent scope creep at invocation surface

## Audit Notes

- **Last audit:** 2026-07-31 (this build).
- **Next audit trigger:** any change to any skill's phases; any cross-agent
  handoff surface change; any LOAD-BEARING REFUSAL list change.
