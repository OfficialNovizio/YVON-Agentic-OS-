# Engineering Department Review — YVON Harness + 4-Layer Architecture

**Reviewer:** dev (Lead Developer, Werner Vogels persona)  
**Enforcement review:** quinn (QA, Charter Enforcement)  
**Date:** 2026-07-16  
**Method:** Live pipeline execution + architecture review against dev's 8 Universal Principles + quinn's charter enforcement

---

## PHASE 1: LIVE PIPELINE EXECUTION (5 real queries)

Pipeline was run end-to-end: classification → retrieval → optimization → harness → injection → verification. Results:

| Query | Task | Strategy | Savings | Quality | Chunks | Issue |
|-------|------|----------|---------|---------|--------|-------|
| Creative Review (spark) | creative_review | FAST | 85% | 0.800 | 5/20 | ✅ Working well |
| Financial Analysis (marcus) | financial_analysis | BALANCE | 73% | 0.286 | 8/20 | ⚠️ Low quality — 30 false conflicts |
| Legal Compliance (comply) | legal_review | BALANCE | 100% | 1.000 | **0/20** | ❌ **ZERO CHUNKS** — profile mismatch |
| Governance (board) | governance_decision | BALANCE | 62% | 0.143 | 5/20 | ⚠️ Very low quality |
| Engineering Debug (dev) | engineering_debug | BALANCE | 77% | **0.000** | 5/20 | ❌ **All chunks marked unreliable** |

---

## PRINCIPLE 6 VIOLATION: "Measure, Don't Guess"

**Principle:** "Performance/reliability claims need numbers; reasoning-based claims are flagged per rule 0.6 until data backs them."

**Finding:** The entire harness upgrade (5-gate module, verifier, progressive disclosure, field monitor, self-improver, 4-layer architecture) was designed and built without running the pipeline on a single real query. All 285 tests passed on synthetic data. The first real execution reveals:

- **Legal compliance returns ZERO chunks.** Query classified correctly as legal_review, but the optimizer selected `quick_check` profile with 1200 char budget — too small for any legal chunk. The agent gets injected with nothing.
- **Financial analysis has 30 false conflicts.** The harness conflict detector triggers on Shared OS chunks that share domain terms (risk, threshold, value) but don't actually contradict. This inflates the conflict count and makes the injection text carry 30 ⚠️ flags.
- **Engineering debug has 0.000 quality.** All engineering chunks scored unreliable by the multiplicative formula. Engineering playbook content doesn't carry book-like authority — it's tagged as "playbook" (0.5 authority). With moderate freshness and default quality, reliability drops below threshold.

**Verdict: FAILED.** The design was validated against synthetic data, not production queries. Principle 6 requires: rerun all 12 E2E scenarios against ACTUAL retrieval results (not synthetic chunks), measure quality scores, and address the three failures above before proceeding to 4-layer build.

---

## PRINCIPLE 5 VIOLATION: "No Architecture with Unowned Failure Modes"

**Principle:** "Design for failure; you build it, you run it; graceful degradation and blast-radius limits are requirements."

**Finding:** The 4-layer architecture defines success paths but does not document failure modes. Specifically:

| Layer | Failure Mode | Impact | Owner? |
|-------|-------------|--------|--------|
| Multi-tenant isolation | Tenant A's graph data leaks into Tenant B's context | Privacy breach | ❌ Unassigned |
| AgentX provisioning | Tenant create times out mid-provision, leaving half-deployed agents | Orphaned tenant state | ❌ Unassigned |
| Connector SDK | Shopify OAuth token expires, agents silently produce no content for a week | Business owner loses revenue | ❌ Unassigned |
| Cross-tenant learning | Anonymization fails, customer names appear in master graph patterns | Privacy breach | ❌ Unassigned |
| Master graph vault | Obsidian sync fails, master state falls behind deployed state | Deployment drift | ❌ Unassigned |

**Verdict: FAILED until every failure mode has an assigned owner, a detection mechanism, and a documented recovery procedure.**

---

## PRINCIPLE 7 VIOLATION: "Charter-Clean Is Part of Every Gate"

**Principle:** "Plan-lock respected (Rail 1), sandbox respected (Rail 2), no agent-run destructive DB op (Rail 3)."

**Quinn review of current pipeline:**

**Rail 1 (Plan-Lock):** The pipeline has no plan-lock enforcement. The retriever accepts any `agent_id` and `dept` parameter with no authorization check. The optimizer selects a profile without locking which sources were queried. If a prompt injection causes the retriever to query a department it shouldn't, nothing stops it.

**Rail 2 (Sandbox):** Architecturally satisfied — Python runs locally, no external egress during retrieval. But no audit log verifies this. If a compromised chunk includes an instruction to make an HTTP call, no code prevents it at the RAG level.

**Rail 3 (No Destructive DB):** Satisfied — read-only during retrieval. But the scaffold-create flow (Phase 2 planned) writes to the filesystem to create tenant directories. This needs quinn's plan-lock BEFORE any scaffold write.

**Verdict: FAILED Rail 1.** Plan-lock was identified as a missing module in the architecture plan but was deferred to Phase 3. It should be Phase 1 — you cannot deploy multi-tenant isolation without an authorization gate. A tenant must only query their own graph. Without plan-lock, nothing enforces this.

---

## PRINCIPLE 1 VIOLATION: "Every Significant Decision Is Recorded"

**Principle:** "ADR-logged, append-only, supersede-never-delete; two options honestly weighed; consequences include the downsides."

**Finding:** No Architecture Decision Records exist. The harness upgrade, the 5-gate design, the 4-layer architecture, the Google agents-cli pattern integration — none were recorded as ADRs. The only project documentation is design-phase markdown in the root directory.

**Verdict: FAILED.** Create ADRs for:

- ADR-001: 5-Gate Harness Architecture (why 5 gates, alternatives considered, tradeoffs)
- ADR-002: Multiplicative Reliability Formula (vs additive, 948x separation, false positive rate)
- ADR-003: 4-Layer Multi-Tenant Architecture (why layers, isolation model, alternatives)
- ADR-004: Token Savings Pipeline (FAST vs BALANCE routing, budget multipliers, why not QUALITY)

---

## SUMMARY — GATE STATUS

| Gate | Principle | Status | Blocking? |
|------|-----------|--------|-----------|
| Pipeline correctness | Principle 6 | ❌ Legal returns 0 chunks, engineering quality 0.000, 30 false conflicts | **YES** — fix before any new work |
| Failure mode ownership | Principle 5 | ❌ 5 failure modes unowned | **YES** — assign before Phase 1 build |
| Charter compliance | Principle 7 | ❌ Rail 1 (plan-lock) not enforced on RAG | **YES** — plan-lock before multi-tenant |
| Decision records | Principle 1 | ❌ Zero ADRs for critical architectural decisions | Blocking review, not build |
| Test coverage | Standard | ⚠️ 285 synthetic tests pass, 3 production failures found | Fix synthetic → real data |

---

## RECOMMENDED FIX ORDER

1. **Fix legal compliance profile.** The optimizer selects `quick_check` when agent_id is `comply` because comply has no agent profile override in the optimizer. Add: `'comply': 'deep_analysis'` (legal reviews need deep context).

2. **Fix engineering authority scores.** Engineering playbook content (deployment rules, CI/CD protocols) is tagged with 0.5 authority. Should be 0.7 (department document) — these are production-critical rules, not optional playbooks.

3. **Fix conflict false positives.** Lower shared-term threshold from 2 to 5, or add a domain-aware filter: chunks from the same Shared OS department sharing terms like "risk" or "threshold" are not contradictions, they're complementary.

4. **Add plan-lock to harness Gate 1.** Before Gate 1 (source authentication), add Gate 0: verify agent is authorized to query requested departments. Reject queries that cross authorization boundaries.

5. **Write ADRs for the 4 architecture decisions.** Append-only, supersede-never-delete.

6. **Assign failure mode owners.** Each of the 5 unowned failure modes gets an owner agent + detection mechanism + recovery procedure.

**Production readiness: NOT YET. Fix items 1-3 (pipeline), then proceed. Fix 4-6 in parallel before any multi-tenant deployment.**
