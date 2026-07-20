# Product Department — Redesign Plan (v1 DRAFT)

**Status:** DRAFT — for discussion, NOT approved, nothing built (rule 0.1) · **Model directive:** any spawned sub-agents use **Fable**, never Opus · **Owner:** CTO → VP Product role
**Supersedes:** the catalog's 4-agent Product section (spec/ux/metric/loom, 10 skills) — see §1 for why.

---

## 0. One-paragraph summary

Product decides WHAT gets built and proves it was worth building. The catalog gave it the right four functions (definition, research, analytics, PMF) but no leader, thin rosters (2–3 skills vs the house bar of 4), a dangling pointer to an unbuilt Data & Analytics agent, and a hole where monetization should be: nobody owns pricing, packaging, or willingness-to-pay — the place product value becomes revenue. This redesign names **spec** the leader, deepens all four rosters, adds **price** (Monetization), and wires the department around one signature rule the catalog implied but never enforced: **no evidence, no backlog entry** — every build decision traces to research, metrics, or a run experiment.

---

## 1. Why the catalog structure was insufficient

1. **No leader.** Same defect as AI & Agents had: four peers, no law-writer. spec (Product Manager) is the natural head — it already orchestrates the others' outputs into PRDs and backlog verdicts.
2. **Nobody owns monetization.** Pricing research, packaging/tiers, price-change discipline appear nowhere in the 19-department catalog's product surface (Growth owns CAC/referrals, Finance owns treasury — neither designs prices). For business-running agents this is a first-class gap: **price** is the department's missing agent.
3. **Dangling pointer, again.** metric's protocol syncs definitions to "river pipelines" — river is a Data & Analytics agent that doesn't exist yet (the forge pattern repeated). Handled as an interface-shaped boundary now, binding when that department builds.
4. **Rosters below the house bar.** 2–3 skills per agent vs Engineering/AI & Agents' minimum 4. Expanded per agent in §3 by splitting real protocol steps into real skills, not padding.
5. **Rule-0.6 exposure.** The Ellis 40% PMF bar, RICE weights, 5-user testing rounds, survey cadences — all rubrics/conventions. Kept as suggested defaults, every verdict flagged `reasoning-based, not formula-verified` until the logical layer gets real sources.
6. **Genericization.** Strip `vyon-` prefixes; "per product/venture" becomes operator config (product profiles); NSM definitions, survey thresholds, tooling are `<FILL_IN>`.
7. **Experiment discipline already exists in the fleet.** proto's eval-first-design and forge's benchmarking set the house pattern (criteria frozen before building, blind scoring, verdicts recorded). loom reuses that pattern product-side rather than inventing a rival one — one discipline, three homes (design-time/release-time/run-time → now also product-time).

---

## 2. Department law — the Evidence Gate

No separate charter document (the Fleet Charter + Security Charter are senior and suffice); Product's law is one rule enforced by spec, stated in every relevant skill:

> **No evidence, no backlog entry; no criteria, no build; no measurement, no "shipped."**
> Every backlog item cites research (ux), metrics (metric), or an experiment verdict (loom). Every PRD carries acceptance criteria testable by quinn's gate. Every shipped item gets an outcome read against the metrics spec — "shipped" is a measurement event, not a deploy event (ops owns deploys).

Price changes get one extra gate: they may touch Governance's **locked commitments** (grandfathering promises, price-guarantee clauses) — price-change proposals route through board when a locked commitment is in scope (see §3 price / §5).

---

## 3. The team — 5 agents in 4 pods

| Pod | Agent | Role | Core skills (custom C / marketplace M) |
|---|---|---|---|
| **Definition** | **spec** ⭐ | Product Manager — writes the department's law | prd-discipline (problem, evidence refs, explicit out-of-scope, quinn-testable acceptance criteria) C · backlog-rules (evidence-gated intake, RICE w/ 0.6 flag, age-out) C · opportunity-assessment (evidence-before-scoping: problem sizing, alternatives, do-nothing cost) C · acceptance-criteria-handoff (the quinn bridge — echo-confirmed, edge's handoff pattern) C · user-story-mapping M (candidate — search by purpose at build) |
| **Discovery** | **ux** | UX Research | research-repository (reuse-first: query before any new study; findings tagged product/persona/journey, linked to PRDs) C · study-design (protocols, consent, sample discipline) C · synthesis-discipline (findings → claims with confidence flags, never vibes) C · voice-of-customer-intake (support tickets/reviews/NPS verbatims → repo, standing pipeline — Client Success boundary) C · usability-testing M + jtbd-interviews M (candidates at build) |
| | **loom** | PMF & Experimentation | pmf-scorecard (Ellis survey cadence + retention-curve flatness, verdict to spec/marcus — 0.6-flagged rubric) C · assumption-mapping (riskiest first) C · experiment-discipline (cheapest falsifying test, pre-set decision rules, criteria frozen before running — proto's eval-first pattern, product-side) C · experiment-registry (every verdict recorded, adopt-reject pattern — the fleet never unknowingly reruns a settled experiment) C · lean-experimentation M (candidate at build) |
| **Measurement** | **metric** | Product Analytics | product-metrics-spec (event taxonomy + versioned activation/retention definitions — the single metric truth) C · funnel-instrumentation (AARRR mapping, gap detection, cohort reads) C · experiment-instrumentation (loom's measurement arm — no experiment without its instruments pre-verified) C · metrics-governance (definition changes versioned + proposed, never silent; sync INTERFACE to the data layer and kai's dashboards — river binding deferred) C · aarrr-framework M (candidate at build) |
| **Monetization** | **price** 🆕 | Pricing & Packaging | pricing-research (willingness-to-pay methods — van Westendorp/conjoint as 0.6-flagged rubrics until the pricing book lands) C · packaging-tiers (feature-to-tier mapping, fence design, per-product config) C · pricing-experiment-discipline (with loom's registry; revenue experiments get extra blast-radius rules) C · price-change-governance (impact analysis; routes through board when locked commitments in scope; grandfathering discipline) C |

⭐ = leader (identity holder). 🆕 = new vs catalog. Every agent ≥4 custom skills; marketplace candidates confirmed per playbook 4.1–4.4 at build (search by purpose, present sources, stop). Total: 5 agents, ~21 custom skills + up to 5 marketplace adoptions.

**spec's identity proposal:** archetype *evidence-first-discoverer* — relentless about problem-before-solution, allergic to feature-lists-as-strategy, treats "no" as a product decision with reasons. Optional named inspiration (e.g. a discovery-methodology figure) left to operator; suggest archetype-only, matching meta's precedent.

---

## 4. The evidence loop (how "no evidence, no backlog" is mechanized)

```
ux (research repo + voice-of-customer)──┐
metric (metric truth + funnel reads) ───┼─► spec's intake gate (backlog-rules: cite or bounce)
loom (experiment verdicts + PMF reads) ─┘        │
                                                 ▼
                              opportunity-assessment → PRD (criteria quinn can test)
                                                 │ echo-confirmed handoff
                                                 ▼
                                    Engineering builds (their rails, their gates)
                                                 ▼
                              metric reads the outcome vs the PRD's named metric
                                    │ hit → recorded; informs next intake
                                    └ miss → loom (was the assumption wrong?) → lesson → anneal
                                              (product lessons anneal into PRD/backlog skill text)
price runs the same loop for monetization: research → experiment (loom registry) → change proposal (board if locked commitments) → metric reads revenue outcome
```

The department's exhaust feeds the fleet's annealing loop: a shipped-but-missed item is a baseline failure for some skill's text — spec's templates, ux's synthesis, or loom's assumptions.

---

## 5. Cross-department boundaries (share, don't duplicate)

- **spec ↔ quinn (Engineering):** acceptance criteria are written to be testable at quinn's gate — spec owns WHAT passes, quinn owns WHETHER it passed. Echo-confirmed handoff both directions.
- **spec ↔ vista (Executive Office):** vista owns the company roadmap; spec feeds it per-product evidence and receives priorities — spec never publishes a rival roadmap.
- **metric ↔ kai (Brand Studio):** kai owns brand/marketing/SEO analytics; metric owns in-product behavior. The activation definition is metric's; campaign attribution is kai's. Shared reads cite the owner's number.
- **metric ↔ river (future Data & Analytics):** definitions sync via a stated interface (versioned definitions file), binding when that dept builds — the dangling pointer handled the forge way, minus the misfiling.
- **loom ↔ proto/forge (AI & Agents):** one experiment discipline, different subjects — loom tests PRODUCT hypotheses on users; proto tests AGENT hypotheses in the cage; forge benchmarks MODELS. loom's registry mirrors scout's adopt-reject pattern.
- **ux ↔ Client Success (future):** voice-of-customer-intake consumes support exhaust; Client Success will own the support relationship — intake is read-only on their pipeline.
- **price ↔ board (Governance):** price changes touching locked commitments (price guarantees, grandfathering) gate at board; all price changes are logged proposals (silent repricing is a trust incident). **price ↔ felix/Finance (future):** price sets the price; finance owns margin/treasury math — boundary stated now, bound later.
- **ux/loom ↔ Behavioral Science (future):** persuasion/bias frameworks (kahneman et al.) are that dept's — ux flags the dependency, doesn't inline pop psychology.
- **All agents:** Fleet Charter binds (registered tools only, board-gated skill changes via anneal); gauge scorecards these agents like any others.

---

## 6. Genericization + rule-0.6 notes

- Strip `vyon-`; products/ventures = operator **product profiles** (`<FILL_IN>`: NSM, personas, funnel stages, price floors, locked-commitment refs).
- 0.6-flagged rubrics until books land: Ellis 40% bar, RICE weights, 5-user rounds, WTP survey methods, retention-flatness judgment. Every such verdict carries the flag.
- **Logical wants:** statistics/SPC (the SAME shared book gauge/forge/vista/sentinel/nate/kai/rio want — survey significance, cohort math, experiment power); a pricing economics text for price (e.g. a recognized pricing-strategy monograph, operator's choice); retention/LTV math source for loom/metric. proto's experimentation-methodology want is satisfied by the same acquisition as loom's — buy once.

---

## 7. Build order

1. **spec** (leader + identity + the Evidence Gate law in its skills).
2. **metric** (measurement before creation — gauge's precedent; the metric truth must exist before outcomes can be read).
3. **ux** (the evidence supply).
4. **loom** (experiments — consumes metric's instrumentation + ux's evidence).
5. **price** (monetization — leans on loom's registry + metric's reads).
6. **DEPARTMENT-WORKFLOW.md** (only after all five).

Cadence per playbook: marketplace-search-first per skill (candidates named in §3 are hypotheses, not adoptions — scout's marketplace-skill-scouting runs the searches now that it exists), present sources, build, audit (`skill_audit.py` post-build — now standing), present.

---

## 8. Open decisions for the operator (answer before build)

1. **Add price (Monetization)?** Rec: yes — it's the revenue-side gap; 4-skill roster drafted. Alternative: defer to a future Finance/Growth build (weaker: neither designs prices).
2. **spec's identity:** archetype *evidence-first-discoverer*, archetype-only (meta's precedent) — or name an inspiration?
3. **Locked-commitments gate for price:** confirm price-change proposals route via board when commitments are in scope (Governance is dormant until its docs exist — proposals would queue, like anneal's).
4. **Voice-of-customer sources:** which feeds exist today per business (`<FILL_IN>`: support inbox, reviews, NPS tool) — ux's intake idles honestly without them.
5. **Marketplace candidates:** approve scout running the §3 searches (user-story-mapping, usability-testing, jtbd-interviews, aarrr, lean-experimentation) as its first standing pass — adoption still presented per playbook 4.3–4.4.
