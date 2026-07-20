# Product — Department Workflow

**Built 2026-07-10 (all 5 agents complete).** Owner: CTO → VP Product role. Law: the **Evidence Gate** (enforced by spec; no separate charter — Engineering Security Charter ≥ Fleet Charter are senior). Plan: `PRODUCT-REDESIGN-PLAN.md`.

## Summary
Product decides WHAT gets built and proves it was worth building. Five agents: **spec** defines (evidence-gated PRDs, quinn-testable criteria), **ux** discovers (reuse-first research + voice-of-customer), **loom** experiments (riskiest-first, frozen criteria, PMF reads), **metric** measures (versioned metric truth, verified instruments), **price** monetizes (WTP → packaging → governed changes). One signature rule binds them: **no evidence, no backlog entry; no criteria, no build; no measurement, no "shipped."**

## Working structure — 5 agents, 4 pods
| Pod | Agent | One-line job |
|---|---|---|
| Definition | **spec** ⭐ | the Evidence Gate: opportunity → evidence-cited PRD → RICE backlog → frozen handoff |
| Discovery | **ux**, **loom** | evidence supply (research repo + VoC) and hypothesis testing (experiments + PMF) |
| Measurement | **metric** | the single metric truth: versioned definitions, funnels, verified instruments |
| Monetization | **price** 🆕 | willingness-to-pay → packaging → governed price changes (board on locked commitments) |

⭐ = leader (identity: evidence-first-discoverer, archetype-only). 🆕 = new vs catalog.

## Working tree — the evidence loop
```
ux (research repo + voice-of-customer) ──┐
metric (metric truth + funnel reads) ────┼─► spec's intake gate (backlog-rules: cite or bounce)
loom (experiment verdicts + PMF reads) ──┘            │
                                                      ▼
                          opportunity-assessment → PRD (criteria quinn can test)
                                                      │ echo-confirmed, frozen handoff
                                                      ▼
                          Engineering builds (dev review → quinn gate → ops ships)
                                                      ▼
                          metric reads the outcome vs the PRD's named metric@vN
                              hit → recorded, informs next intake
                              miss → loom (which assumption was wrong?) → anneal (skill lesson)

price runs the same loop for money:
  pricing-research → packaging-tiers → loom revenue experiment → price-change-governance
  (board if a locked commitment is in scope) → metric reads revenue + churn
```

## Working instructions
1. **No evidence, no backlog entry.** Every backlog item cites research (ux repo IDs), metrics (metric@vN reads), or an experiment verdict (loom registry). spec's backlog-rules bounces uncited items; Confidence is capped by the evidence ladder (RICE is a flagged rubric, rule 0.6).
2. **Query before you produce.** ux queries the research repository before any new study; loom queries the experiment registry before any new test; metric reuses versioned definitions before minting new ones — the fleet never unknowingly re-runs settled work (scout's adopt-reject pattern, three homes).
3. **Criteria frozen before build and before data.** PRD acceptance criteria are written testable-at-quinn's-gate and frozen (echo-confirmed); experiment decision rules and success criteria are frozen before running; a bar moved after seeing results is not a result.
4. **Measurement is a precondition, not an afterthought.** No experiment runs until metric verifies its instruments fire live; "shipped" is a measurement event (metric reads the outcome), not a deploy event (ops owns deploys). MISSING beats interpolated everywhere.
5. **Monetization never moves silently.** Existing customers are never silently repriced — in a test (new/holdout only) or a change (governed, grandfathered, customer-favorable). A change touching a Governance locked commitment routes to board; until Governance's docs exist, it queues (most-restrictive default).
6. **Product supplies evidence; leaders decide.** PMF verdicts, priorities, and pivots route to marcus/vista (Executive Office); spec never publishes a rival roadmap; loom never makes the double-down/pivot call; metric/ux/price measure and research, they don't decide the product move.
7. **The exhaust anneals.** A shipped-but-missed item is a baseline failure for some skill's text — spec's templates, ux's synthesis, or loom's assumptions; overturned findings/verdicts route to anneal → board (Fleet Charter Rail 3) as skill lessons.

## Cross-department boundaries (share, don't duplicate)
- **spec ↔ quinn (Engineering):** spec owns WHAT passes (acceptance criteria), quinn owns WHETHER it passed; echo-confirmed both ways.
- **spec ↔ vista (Executive Office):** vista owns the company roadmap; spec feeds per-product evidence, receives priorities.
- **metric ↔ kai (Brand Studio):** metric owns in-product behavior; kai owns campaign/brand attribution; shared reads cite the owner's number; the signup event is the seam.
- **metric ↔ river (future Data & Analytics):** definitions sync via a versioned export interface, binding when that dept builds.
- **loom ↔ proto/forge (AI & Agents):** one experiment discipline, different subjects — loom tests product hypotheses on users, proto tests agents in the cage, forge benchmarks models; loom's registry mirrors scout's adopt-reject.
- **ux ↔ Client Success (future):** voice-of-customer intake is read-only on the support pipeline.
- **price ↔ board (Governance):** locked-commitment-touching changes gate at board; all changes are logged proposals. **price ↔ felix/Finance (future):** price sets the price, finance owns margin/treasury.
- **ux/loom/price ↔ Behavioral Science (future):** bias/persuasion theory is that dept's — flagged as a dependency, not inlined.
- **All agents:** Fleet Charter binds (registered tools only, board-gated skill changes via anneal); gauge scorecards these agents like any others.

## Department status
| Agent | Pod | Skills | Identity | Operational | Logical | agent.md |
|---|---|---|---|---|---|---|
| spec | Definition | 4/4 (+ rice.py, tested) | evidence-first-discoverer (leader) | 5/5 | placeholder | current |
| metric | Measurement | 4/4 (+ sample_size.py, tested) | empty (non-leader) | 5/5 | placeholder | current |
| ux | Discovery | 4/4 | empty | 5/5 | placeholder | current |
| loom | Discovery | 4/4 | empty | 5/5 | placeholder | current |
| price | Monetization | 4/4 (new agent) | empty | 5/5 | placeholder | current |

Department complete as of 2026-07-10 (spec + metric were built in the prior session; metric finished + ux/loom/price built this session after the Fable-5 interruption). Standing pending:
- **Operator §8 decisions** (PRODUCT-REDESIGN-PLAN): price confirmed (built); spec identity archetype-only (built); price→board locked-commitments gate confirmed; voice-of-customer sources per business (`<FILL_IN>` — ux idles honestly without them); scout to run the queued marketplace searches (user-story-mapping, usability-testing, jtbd-interviews, aarrr, lean-experimentation).
- **Product profiles** per business (`<FILL_IN>`: NSM, personas, funnel stages, price floors, locked-commitment refs).
- **Logical source books:** the shared statistics/experimentation text (buy once — metric/ux/loom + gauge/forge/vista fleet-wide); a pricing-economics text (price); retention/LTV source (loom/metric).
- **Deferred bindings:** metric's export interface → future Data & Analytics (river); Governance gate for price (board dormant until its docs exist — proposals queue); Behavioral Science dependency flagged across ux/loom/price.
