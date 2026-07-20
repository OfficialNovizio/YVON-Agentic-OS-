# AI & Agents — Department Workflow

**Built 2026-07-10 (all 8 agents complete).** Owner: CAIO role. Law: `FLEET-CHARTER.md` (operator-owned; Engineering Security Charter is senior). Plan: `AI-AGENTS-REDESIGN-PLAN.md` (approved, all decisions resolved).

## Summary
The meta-department: it builds (proto), connects (relay, scout), measures (gauge), diagnoses (forge), improves (anneal), gates (edge), and governs (meta) the agent fleet itself. Its signature design is the **closed improvement loop** the catalog left dangling: detect → diagnose → fix → verify.

## Working structure — 8 agents, 5 pods
| Pod | Agents | One-line job |
|---|---|---|
| Leadership | **meta** ⭐ | structural law, registries, charter custody, Rail 3 routing |
| Lifecycle | **proto**, **anneal** | birth (caged experiments) and life (board-gated skill evolution) |
| Methods | **forge**, **edge** | AI-method benchmarking/diagnosis and emerging-tech gating |
| Integration | **relay**, **scout** | capability registry/grants/allowlist and ecosystem intake |
| Observability | **gauge** | scorecards, golden runs, routing, the operator's health report |

## Working tree — the improvement loop
```
meta (law: standards · registries · charter custody)
  │
  ├─ INTAKE:  scout scans ─► intake/skill-scouting ─► relay registers (least-privilege)
  │           edge gates tech ─► pilot specs ─► proto's cage ─► promote(Rail 3)/archive(learnings→anneal)
  │
  ├─ RUN:     fleet operates (plan-locked, sandboxed — Engineering rails)
  │
  ├─ WATCH:   gauge measures (scorecard + golden runs) ─► flags ─► degradation-routing
  │                                        security smells ──────► quinn + aegis (skip the queue)
  │
  ├─ FIX:     forge diagnoses (5-layer differential)
  │              ├─ skill-text gap ─► anneal: baseline-evidenced minimal diff
  │              ├─ version/config ─► operator/platform rec (Rail 3)
  │              └─ technique misfit ─► forge's adoption gate (benchmarked)
  │           anneal proposes ─► board approves ─► anneal applies ─► versioned
  │
  └─ VERIFY:  gauge re-measures (proposal ID annotated) ─► case closes — loop complete
```

## Working instructions
1. **Nothing changes silently.** Every fleet change (skill edit, agent, model, threshold) = written proposal → board → apply → record → re-measure (Fleet Charter Rail 3; no trivial-change tier — operator decision 2026-07-10).
2. **Nothing runs unregistered.** Tools/MCPs enter via scout's intake → relay's registry → least-privilege grants → egress allowlist to quinn (Rails 1–2 authoring).
3. **Nothing ships unbaselined.** Prototypes freeze criteria before building; skill edits cite a demonstrated failure; benchmarks use the shared golden set, blind and replicated.
4. **Everything ends on purpose.** Prototypes get verdicts at expiry (silence = archive); flags end fixed/accepted/parked-with-a-date; watch entries carry triggers and drop rules.
5. **Boundaries (share, don't duplicate):** aegis owns the LLM detection classes (referenced, never copied); quinn owns rails enforcement + sandbox policy + release gates; forge/gauge share ONE golden set (Rail 3-governed); model choice binds in operator/platform config, never in skills; kai owns business analytics; future Market Intelligence's radar owns market scanning.
6. **Escalation:** charter ambiguity → most-restrictive + operator; security smells → quinn+aegis immediately; stalled cases → meta; board dormant → proposals queue visibly, nothing auto-applies.

## Department pending (operator-side)
- **Fleet Charter adoption**: fill `<FILL_IN>`s + sign §6 (until then: most-restrictive defaults).
- **Golden task set** (shared forge/gauge) — the loudest gap; benchmarks are provisional and behavior-watching is blind without it.
- **Governance docs** (constitution + locked commitments) — board is dormant, so anneal's edit path queues; anneal registered `dormant(board active)`.
- **Config `<FILL_IN>`s** across all eight agents; **operator domain list** for edge's landscapes; **forbidden-words list** for anneal's audits.
- **Logical source books**: statistics/SPC (gauge+forge — same shared-statistics want as vista/sentinel/nate/kai/rio), MCDA/decision analysis (edge+scout), maintenance economics (anneal), experimentation methodology (proto — coordinate with future Product dept), org-design measurement (meta), SRE/reliability (relay).
- **Shared OS layer**: prompting-practices copy (anneal maintains content, queued), web-search capability (scout+edge are the heaviest consumers).
- **Marketplace candidates queued for scout's first pass**: hamelsmu/evals-skills (gauge), kodustech ETL-reliability (relay), llm-benchmarking sources (forge), writing-skills companion files (meta).
