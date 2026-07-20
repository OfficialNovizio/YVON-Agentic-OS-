# AI & Agents Department — Redesign Plan (v1 DRAFT)

**Status:** approved-in-discussion 2026-07-10 (all §8 decisions resolved), awaiting build · **Model directive:** any spawned sub-agents use **Fable**, never Opus · **Owner:** CAIO role
**Supersedes:** the catalog's 4-agent AI & Agents section (proto/edge/nova/pulse, 8 skills) — see §1 for why.

---

## 0. One-paragraph summary

AI & Agents is the **meta-department: the team that builds, connects, measures, and improves the agent fleet itself.** The catalog gave it only four agents and — critically — left its two most important functions stranded in the wrong department and its most important function unstaffed entirely. This redesign brings home the two CAIO-owned agents the catalog misfiled under Market Intelligence (**forge** — AI methods/benchmarking, **scout** — tool scanning), adds the missing **leader**, and adds the agent the whole "plain-text, self-annealing second brain" philosophy demands but nobody staffed: a **skill-lifecycle/annealing agent** that maintains, versions, audits, and improves every skill file in the fleet. Result: 8 agents in 5 pods, closing the loop the catalog left open (gauge detects degradation → forge diagnoses technique → anneal fixes the skill → gauge confirms).

---

## 1. Why the catalog structure was insufficient

1. **Its own escalation path points at an agent it doesn't contain.** pulse's protocol says "Degradation → **forge** for technique review" — but forge isn't in the department. forge (AI Methods) and scout (Tool Scanner) sit in the **Market Intelligence** section of the catalog, yet both are `owner: CAIO`. They are fleet functions (model benchmarking, tool/MCP ecosystem scanning) misfiled in a CSO department. They come home.
2. **No leader.** Every built department has a leader with identity (marcus, board, spark, dev). The catalog gives AI & Agents four peer agents and no one who writes the fleet's law — agent-architecture standards, skill-authoring standards, the roster registry.
3. **Nobody owns the skills themselves.** The entire team-in-a-box is markdown skill files, and the blueprint's core promise is **self-annealing** — lessons flow back into the text. proto covers an agent's *birth*; nothing covers its *life*: skill versioning, audits, deprecation, applying post-mortem lessons, prompt/context-engineering quality. The Tier-1 skills `prompting-practices`, `memory-practices`, `reflection-protocol` are all `owner: CAIO` with no agent to own them. This is the department's largest gap — and the user's instinct that "something is missing" lands here.
4. **Name collisions with built agents.** Catalog's **nova** (AI Integration) collides with Engineering's nova (Mobile); catalog's **pulse** (Model Monitor) collides with Brand Studio's pulse (Organic Social). Both renamed (§3).
5. **Venture/stack hardcoding.** edge's `open-banking-landscape` is a venture-specific bet (fintech), not a department skill — genericized to the dated-landscape-asset pattern (rule 0.4/0.4b). gauge's "retraining rec" assumes fine-tuning infrastructure — genericized to "technique/model change rec." All "VYON tasks" benchmark references become "operator's golden task set" (config).
6. **Security overlap unmanaged.** Fleet integration (MCP registry, tool access) is exactly where prompt-injection/excessive-agency risk lives. Engineering already built the defense (aegis's detection classes, cypher's LLM attack playbooks, Rails 1–2). This department must **share those assets, not duplicate them** (per handoff §7) — the plan wires explicit boundaries (§6).

---

## 2. Department law — the Fleet Charter (operator-owned, fill-in template)

`AI & Agents/FLEET-CHARTER.md`, mirroring Engineering's SECURITY-CHARTER pattern. Proposed rails (draft — operator adopts/amends):

1. **No unregistered capability.** Every tool/MCP an agent can call appears in relay's registry with owner, scopes, and per-agent access map. An unregistered tool call is an off-plan call (feeds Engineering Rail 1). **relay's registry is the natural authoring point for Rail 2's egress allowlist.**
2. **Least-privilege default.** New agents/tools start with minimum access; grants are explicit, logged, and quarterly-audited.
3. **No silent fleet changes — board-gated.** Any skill edit, model change, or new agent starts as a **written change proposal** (what/why/diff/risk) routed to **board** (Governance Gate). Only after board approval does anneal apply the edit, versioned with a before/after record — never edited in place unlogged (precedent's append-only discipline, fleet edition). No autonomy tier: all changes gate, resolved 2026-07-10.
4. **Prototype cage.** proto's experimental agents run sandboxed with an expiry date; promote-or-archive is a real verdict, not a default-promote.

> Precedence: Engineering Security Charter ≥ Fleet Charter > agent configs > convenience. Conflicts halt and escalate.

---

## 3. The team — 8 agents in 5 pods

| Pod | Agent | Role | Core skills (custom C / marketplace M / shared S) |
|---|---|---|---|
| **Leadership** | **meta** ⭐🆕 | Fleet Architect — writes the fleet's law | agent-architecture-standards (agent.md/manifest/folder law — the playbook operationalized) C · skill-authoring-standards (how a skill file is written, structured, dated) C · fleet-registry (roster, slots, lifecycle states, dormant switches) C · fleet-governance (+ Fleet Charter template) C |
| **Lifecycle** | **proto** | Prototyping | agent-prototype-kit (scaffold, sandbox limits, eval-before-build) C · promote-or-archive-verdict (2-week gate, learnings capture) C · rapid-prototyping M · eval-first-design (define success before building — quinn's eval-harness pattern) C/M |
| | **anneal** 🆕 | Skill Lifecycle & Annealing — **the missing agent** | skill-lifecycle (version, audit, deprecate, retire) C · self-annealing-loop (post-mortems/reflection entries → **change proposal doc → board approval → apply edit**, logged) C · prompt-context-engineering (owns Tier-1 prompting-practices; context/token discipline) C/S · skill-quality-audit (hardcode leaks, stale dates, drift from standards — the audit we run manually, made an agent's job) C |
| **Methods** | **forge** ↩️(from Mkt-Intel) | AI Methods & Benchmarking | model-technique-registry (cost/quality per task type; model routing recs) C · benchmarking-discipline (golden task set, blind scoring, cost-quality frontier) C/M · technique-adoption (new method → benchmark → adoption rec + migration cost) C · degradation-diagnosis (gauge's escalation target) C |
| | **edge** | Emerging Tech Gate | tech-adoption-criteria (maturity, ecosystem, fit, reg exposure) C · watchlist-discipline (below-bar → dated re-check) C · pilot-spec-handoff (above-bar → proto) C · landscape-assets (DATED per-domain notes, operator-selected domains — open-banking becomes one optional instance) C |
| **Integration** | **relay** 🔁(ex-nova) | AI Integration & Tool Registry | mcp-tool-registry (what's connected, auth, owner, per-agent access map — Fleet Charter rail 1) C · least-privilege-grants (+ quarterly access audit) C · integration-patterns (idempotency, retry, circuit breakers) M · egress-allowlist-authoring (feeds Engineering Rail 2 config) C |
| | **scout** ↩️(from Mkt-Intel) | Tool & Ecosystem Scanner | ecosystem-scanning (weekly sweep: GitHub/MCP directories/skill marketplaces) C/M · tool-evaluation-intake (security via aegis, cost, overlap check, sandbox trial) C · adopt-reject-registry (verdict either way, logged to relay) C · marketplace-skill-scouting (the playbook's marketplace-first search, made a standing job) C |
| **Observability** | **gauge** 🔁(ex-pulse) | Fleet Monitor | agent-quality-scorecard (task success, cost/task, latency, escalation rate; thresholds = config `<FILL_IN>`) C · llm-ops-basics (golden-set evals, drift alerts, version pinning) M · degradation-routing (→ forge for diagnosis, → anneal for skill fix) C · fleet-health-report (CAIO dashboard cadence) C |

⭐ = department leader (identity holder — only meta gets identity content; others get empty `identity/` folders). 🆕 = new vs catalog. ↩️ = repatriated from Market Intelligence. 🔁 = renamed for collision.

Every agent ≥ 4 skills (Engineering's bar). Total: 8 agents, ~30 skills.

---

## 4. The improvement loop (how the fleet gets better, mechanized)

```
meta writes the law (architecture standards · skill standards · registry · Fleet Charter)
      │
      ▼
proto births agents (sandboxed, eval-first, promote-or-archive)
      │            scout finds tools/skills ──intake──► relay registers (least-privilege)
      ▼
fleet runs ──► gauge measures every agent (success · cost · latency · escalations)
      │
      ├── healthy → weekly fleet-health report
      │
      └── degraded → forge diagnoses (technique? model? skill?)
                        ├── model/technique issue → forge benchmarks → adoption rec
                        └── skill issue → anneal edits the skill file (versioned, logged)
                                             │
                                             ▼
                              gauge re-measures — loop closes (self-annealing)
```

The catalog had detection (pulse) with a dangling pointer (→ forge, absent) and no fixer at all. This roster closes detect → diagnose → fix → verify.

---

## 5. Cross-department boundaries (share, don't duplicate)

- **aegis → this dept:** LLM detection classes (prompt injection, excessive agency, RAG poisoning — `detection-classes-web-llm-2026-07.md`) are **shared as an asset reference**, not rebuilt. scout's tool-security screening and relay's registry cite it; aegis stays the owner.
- **cypher ↔ proto/relay:** prototype agents and newly registered tools are in-scope candidates for cypher's caged attack loop (operator adds them to the signed scope doc).
- **quinn ↔ gauge/proto:** quinn's `eval-harness` (marketplace, already adopted) is the evidence mechanism; proto's eval-first-design and gauge's golden-set evals reuse its pattern. quinn gates Engineering releases; gauge monitors the running fleet — build-time vs run-time, no double-ownership.
- **relay ↔ Rails 1–2:** relay authors the tool registry + egress allowlist; **enforcement stays Engineering/runtime (Hermes)** — same "authoring point vs enforcement point" split as dana/Rail 3.
- **scout ↔ Market Intelligence (future):** scout scans the *tool/AI* ecosystem; the CSO dept's radar scans *markets/competitors*. Clean subject-matter split.
- **anneal → board (Governance):** every fleet change anneal wants to make ships as a proposal doc through board's gate — approve, then edit. board's triple-pass pattern applies; precedent archives the proposal + verdict.
- **anneal ↔ Shared OS:** anneal owns Tier-1 `prompting-practices` + `reflection-protocol` content and maintains `Shared OS/` skills (incl. pending `memory-practices`, `web-search`); every agent still inherits them.
- **toongine:** fleet-registry maps to `agent_registry`; memory stays interface-shaped (graph owns it — handoff §7); model routing recs from forge are operator decisions (DeepSeek v4 vs Fable is Hermes config, not skill content).

---

## 6. Genericization notes (rule 0.4/0.4b)

- Strip `vyon-` prefixes; "VYON tasks" → "operator golden task set" (config `<FILL_IN>`).
- `open-banking-landscape` → optional dated landscape asset under edge, only when operator's business names the domain.
- "retraining rec" → "technique/model change rec" (no fine-tuning infra assumed).
- All thresholds (success <90%, cost drift >20%, 2-week verdict) → config templates with catalog values as suggested defaults, flagged reasoning-based per rule 0.6.

---

## 7. Build order (law first, loop-closers before loop-openers)

1. **FLEET-CHARTER.md** (template) + **meta** (leader, identity — proposal at build; suggestion to discuss: *empirical-gardener* archetype, tends systems rather than commanding them).
2. **relay** (registry — no capability exists unregistered before agents multiply).
3. **gauge** (measurement before creation — you can't improve what you don't measure).
4. **anneal** (the fixer — the annealing loop needs its owner early).
5. **forge** (diagnosis + benchmarking).
6. **scout** (intake pipeline).
7. **proto** (agent creation — last among peers: everything it births lands in a governed, measured, fixable fleet).
8. **edge** (adoption gate).
9. **DEPARTMENT-WORKFLOW.md** (only after all 8 complete).

Cadence per playbook: marketplace-search-first (skillsmp.com / mcpmarket.com / awesomeskill.ai — llm-ops, evals, prompt-engineering, MCP-integration are well-covered categories, search by purpose at each build) → present sources/plan → build one agent → audit → present → stop.

---

## 8. Decisions — RESOLVED by operator, 2026-07-10

1. **anneal's edit authority:** NO autonomous edits at any tier. Every proposed update/edit → **written proposal doc → board (Governance Gate) approval → then apply**. Wired into Fleet Charter rail 3, anneal's self-annealing-loop, and §5 boundaries.
2. **meta's identity archetype:** approved — *empirical-gardener* (tends systems rather than commanding them).
3. **Renames:** confirmed — **relay** (ex-nova) and **gauge** (ex-pulse).
4. **scout vs marketplace-first:** confirmed — scout shortlists, operator approves; the human approval step is unchanged.
5. **Market Intelligence bookkeeping:** handle intelligently at that department's build — keep the dept coherent at 5 agents (forge + scout repatriated here); rebalance its roster then, not now.
