---
name: engineering-department-workflow
type: department workflow file (playbook §10)
department: Engineering
status: built 2026-07-10, after all 11 agents completed (dev, quinn, ops, aegis, cypher, axiom, dana, raj, mia, nova, rank) + SECURITY-CHARTER.md
model: built with Fable (redesign of the Opus-era dev); any spawned sub-agents use Fable
agents: dev (Lead Developer, leader) · quinn (QA gate + charter control) · ops (DevOps/Reliability) · aegis (AppSec defense) · cypher (Red Team, caged) · axiom (Algorithms/DS) · dana (Data Architecture) · raj (Backend/APIs) · mia (Frontend Web) · nova (Mobile, dormant) · rank (Technical SEO)
supersedes: the catalog's 4-agent Engineering section — see ENGINEERING-REDESIGN-PLAN.md §1
---

## Summary

Engineering builds and maintains the business's website, app, backend, and data **without breaking things** — enforced by a safety spine where nothing reaches production unexamined and everything that breaks teaches the system. Eleven agents in six pods, governed by the **Security Charter** (four operator-owned rails senior to every agent) and led by **dev**, the only agent with an identity persona. The other ten operate on Universal principles only. Full design rationale is in `ENGINEERING-REDESIGN-PLAN.md`; the law is in `SECURITY-CHARTER.md`.

## Purpose

Fix the catalog's three defects (redesign §1): nobody owned production (now **ops**), the stack was hardcoded (now **dev**'s per-business stack-profile), and there was no security/adversary/data-design depth (now **aegis**, **cypher**, **dana**, **axiom**). The operator's core fear — things breaking — is answered mechanically: a quality gate (**quinn**) and a security gate (charter) that both block independently, a production owner who ships rollback-first and turns every incident into a lesson (**ops**), a standing internal attacker who proves the defenses (**cypher**), and builders (**raj/mia/nova**) who work under all of it. Every destructive data change is authored by an agent and run by the operator — never by an agent (Rail 3).

## The Security Charter (senior to everything)

Four rails, operator-owned, never waived by an agent (redesign §2):
1. **Plan-lock** — quinn freezes+hashes each agent's tool-call plan before any external call; off-plan calls halt and escalate (anti-hijack/injection).
2. **Sandbox + egress-allowlist** — every tool call sandboxed; nothing exfiltrates; fails closed.
3. **No agent runs destructive DB ops** — create/update/delete/migrate → the agent (dana) writes a script, the **operator** runs it. Not configurable.
4. **Caged adversary** — cypher attacks only operator-signed in-scope targets, in-sandbox, findings-only.

Precedence everywhere: **Security Charter > stack-profile > agent configs > convenience.**

## Working Structure (the safety spine)

```
                                    OPERATOR
        (signs the charter + red-team scope · runs every destructive DB script · final decisions)
                                        ↑
        DEV  (leader — identity: pragmatic-architect) writes the law:
        ADRs · stack-profile · code-review-standards · delivery-governance (+ the Rail 1 plan artifact)
                                        │
   ┌───── DESIGN ─────┐        ┌──────── BUILD ────────┐
   axiom (algorithms)          raj (backend/APIs)
   dana (data — Rail 3 author) mia (frontend — atlas bridge)   nova (mobile — dormant)
                                        │
                     every change → DEV review (integrity→correctness→security→tests→style)
                                        │
              ┌──────────── QUALITY & RELEASE ────────────┐
              QUINN  gate: test tiers + regression map + browser evidence     ── owns Rails 1–3 enforcement
                          + charter-enforcement (security verdict, independent of quality verdict)
                                        │  GATE PASS (both verdicts)
              OPS  ships rollback-first · monitors · incident→blameless post-mortem
                                        │
   ┌──────────── SECURITY ────────────┐
   aegis (defense): threat-model → vuln-pipeline → secure-code-review → verified-patching
   cypher (offense, CAGED): attack-playbooks (web + LLM + the rails) → findings → quinn
                                        │
   ┌──────────── SEARCH ────────────┐
   rank (technical execution) ── boundary ──> kai (Brand Studio: SEO strategy + measurement)
```

## Working Tree (who consumes whom)

- **dev → everyone**: the ADR ledger, stack-profile, review standards, and definition-of-done are the law all agents work under; dev routes risky diffs to aegis and algorithm-heavy diffs to axiom.
- **axiom / dana → raj / mia / nova**: algorithm choices (axiom's DSA records) and the data model + store (dana) are what the builders implement against.
- **dana → operator**: every migration/data change is a dana-authored script the operator runs (Rail 3); no agent executes it.
- **builders → dev → quinn → ops**: every change is reviewed by dev, gated by quinn (quality) and the charter (security), then shipped by ops rollback-first.
- **quinn ↔ everyone**: plan-locks every agent's external tool calls (Rail 1), owns the sandbox (Rail 2), verifies no destructive agent DB op (Rail 3), and is the sole intake for cypher's findings (Rail 4's output).
- **ops → quinn + dev**: incident post-mortems feed quinn's regression map and dev's ADRs — the self-annealing loop.
- **aegis ↔ cypher via quinn**: cypher attacks and files findings to quinn; aegis fixes and verifies (four checks); cypher re-attacks to confirm ("can't re-break").
- **mia ← atlas / rank ↔ kai (cross-department, Brand Studio)**: mia's design tokens bridge from atlas's brand kit; rank owns technical SEO execution, kai owns SEO strategy + measurement; Core Web Vitals are a shared mia/rank/kai signal.
- **nova**: dormant unless `mobile_active`; when off, frontend work is mia's.

## Working Instructions

1. **Before any external tool call.** The acting agent writes an execution plan (dev's delivery-governance artifact); quinn validates, hashes, and locks it (Rail 1). Unbounded plans ("call tools as needed") are returned, not locked. Every call runs sandboxed, egress-allowlisted (Rail 2).
2. **Design.** Load-bearing algorithm/structure choices become axiom's DSA records; store and schema choices become dana's ADRs and models. Both are reviewed by their consumers (raj/mia).
3. **Build.** raj (backend), mia (frontend), nova (mobile, if active) implement. Any destructive/schema data change is NOT executed — dana authors a reversible script, the operator runs it (Rail 3, expand-migrate-contract).
4. **Review.** dev reviews every change in fixed order: **integrity** (agent-authored-code failure modes — fabricated APIs, mock data, weakened tests, stubs-claimed-done) → correctness → security → tests → style. Risky surfaces route to aegis; algorithm-heavy diffs to axiom.
5. **Gate (two independent verdicts).** quinn runs the quality gate (test tiers by change type + targeted regression from the fragile-areas map + browser evidence via Reticle/Playwright) AND the security gate (charter compliance). Either blocks alone. Contract tests, observability, and browser verification are gate evidence, not claims.
6. **Ship.** ops deploys only on GATE PASS, rollback-exercised-first, monitored, watch-window held. Anything breaks → incident-response (restore first; charter holds mid-incident) → blameless post-mortem → mandatory feeds to quinn's regression map + dev's ADRs.
7. **Attack, continuously.** cypher (only with an operator-signed scope) attacks in-scope targets in-sandbox — the products (OWASP web) and the agents themselves (OWASP LLM 2025: prompt injection, tool poisoning, plan override) and above all the rails — and files findings to quinn. aegis fixes with four-check verification; cypher re-attacks to confirm. A rail that bends under attack reaches the operator.
8. **Maintain.** ops keeps the system healthy (dependency cadence, restore-tested backups, dated baselines, expiry register); rank keeps the site technically discoverable (crawlability, schema, GEO), specing fixes that mia/raj implement through the gate.
9. **Escalation, always upward.** Rail violations halt and escalate; floor/threshold disputes go to the operator; charter amendments are operator-only. No agent weakens a rail. Where configs are `<FILL_IN>`, agents run in the charter's most-restrictive reading and say so.
10. **Rule 0.6 standing flag.** All 11 logical/ folders are placeholders (source books pending — an SRE text shared by dev/ops, a statistics source shared across the org, algorithms/security/data texts). Until filled, domain judgments are labeled reasoning-based, not formula-verified; the one tested script (quinn's imported `with_server.py`) is verbatim from Anthropic's webapp-testing skill.

## Department Status

| Agent | Pod | Skills | Identity | Operational | Logical | agent.md |
|---|---|---|---|---|---|---|
| dev | Leadership | 4/4 | pragmatic-architect-werner-vogels (leader) | 5/5 | placeholder | current |
| quinn | Quality & Release | 5 (4 custom + 1 marketplace) | empty (non-leader) | 5/5 | placeholder | current |
| ops | Quality & Release | 4/4 | empty | 5/5 | placeholder | current |
| aegis | Security | 4 (3 custom + 1 marketplace) | empty | 5/5 | placeholder | current |
| cypher | Security | 4/4 | empty | 5/5 | placeholder | current |
| axiom | Design | 4/4 | empty | 5/5 | placeholder | current |
| dana | Design | 4/4 | empty | 5/5 | placeholder | current |
| raj | Build | 4/4 | empty | 5/5 | placeholder | current |
| mia | Build | 4/4 | empty | 5/5 | placeholder | current |
| nova | Build | 4/4 (DORMANT until mobile_active) | empty | 5/5 | placeholder | current |
| rank | Search | 4/4 | empty | 5/5 | placeholder | current |

Department complete as of 2026-07-10. Standing pending items:
- **Operator documents**: the adopted Security Charter (version + the four rails' configs), the red-team scope document (cypher is dormant without it), the stack-profile, and every agent's config `<FILL_IN>`s.
- **Logical source books** (all 11): shared SRE text (dev/ops), shared statistics source (org-wide, incl. quinn), algorithms text (axiom), security/triage texts (aegis/cypher/quinn), data-systems text (dana), reliability/API texts (raj), WCAG + perf (mia). Dated references (Google Search Central for rank, HelixDB docs for dana, store guidelines for nova) stay dated, not book-frozen.
- **Proposed connectors** (surfaced at deployment, plan §5): Reticle + Playwright (quinn), defending-code harness (aegis/cypher), Agentation (mia), claude-seo (rank), HelixDB (dana), Harness.io + Datadog (ops). Every skill degrades to method-only without them.
- **Platform-level ADR**: whether toongine's own graph-memory uses HelixDB (dana + dev).
- **Cross-department seams live**: atlas→mia (brand kit→tokens), kai↔rank (SEO), and the future AI & Agents department (overlaps cypher's LLM-attack classes).

## MCP Marketplace Integration (added 2026-07-14)

7 MCP marketplace tools are mapped to 9 of 11 agents. See `Engineering/MCP-MARKETPLACE.md` for the full reference — setup instructions, tool selection logic, and coverage map per agent.

| # | Tool | Type | Agents | Priority |
|---|------|------|--------|----------|
| 1 | **Ponytail** | Claude Code skill | dev, axiom | P0 — install immediately |
| 2 | **Browserbase MCP** | MCP server | mia, nova, cypher, aegis, quinn | P1 — core testing infra |
| 3 | **Firecrawl MCP** | MCP server | rank, cypher, dana | P1 — free tier, most-used scraper |
| 4 | **Crawl4AI** | Python library | dana, rank | P2 — open source, no keys |
| 5 | **awesome-design-md** | Reference files | mia | P2 — zero-setup DESIGN.md |
| 6 | **Scrapling** | Python library + MCP | cypher, rank, dana | P3 — escalation tool |
| 7 | **Website Cloner** | Claude Code skill | mia, rank | P3 — complex pipeline |

**Tool escalation logic (scraping tools):**
Firecrawl (first) → Crawl4AI (deep crawl / RAG) → Scrapling (when blocked by anti-bot)
