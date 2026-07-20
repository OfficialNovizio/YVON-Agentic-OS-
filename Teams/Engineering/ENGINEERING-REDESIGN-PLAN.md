# Engineering Department — Redesign Plan (v4)

**Status:** approved-in-discussion 2026-07-08, awaiting build · **Model directive:** any spawned sub-agents use **Fable**, never Opus · **Owner:** CTO role
**Supersedes:** the catalog's 4-agent Engineering section (dev/raj/mia/quinn, 12 skills) — see §1 for why.

---

## 0. One-paragraph summary

Engineering builds and maintains the business's website, app, backend, and data **without breaking things** — enforced by a safety spine where nothing reaches production unexamined and everything that breaks teaches the system. It adds what the catalog lacked: production ownership (deploy/rollback/incident/maintenance), a data+algorithm design layer, a dedicated application-security agent, a **standing internal red team** that continuously attacks our own apps/agents/code and reports to QA, a technical-SEO agent, and mobile. Four hard safety rails — plan-lock, per-tool sandboxing, no-destructive-DB-access, and caged-adversary — are operator-owned law every agent inherits.

---

## 1. Why the catalog structure was insufficient

Three defects against the stated goal ("develop and maintain everything without breaking stuff"):

1. **Nobody owned production.** No deploy, rollback, monitoring, or incident agent — yet "maintain without breaking" lives exactly there.
2. **Stack hardcoding.** Supabase / React+Vercel / Postgres were baked into skill content. Per rule 0.4b these move to a per-business **stack-profile** document (operator-approved, versioned); skills carry stack-agnostic method + dated stack notes.
3. **No security, no design depth, no adversary.** No threat-modeling, no vuln pipeline, no DSA/data-architecture layer, and — the operator's central ask — no team whose job is to *attack us first*.

---

## 2. The Security Charter (operator-owned law — constitution-grade)

A single document, `Engineering/SECURITY-CHARTER.md` (built as a fill-in template; operator adopts). **Every Engineering agent inherits it; it is never waived by an agent, only amended by the operator.** Four rails:

### Rail 1 — Plan-lock before any external tool call
Before an agent calls any external tool, QA (quinn) **freezes and hashes its execution plan** — the ordered list of intended tool calls with arguments. Mid-run, any tool call not in the locked plan **halts the agent and escalates**. This is the anti-prompt-injection / anti-hijack rail: poisoned inputs or an adversary trying to make an agent act off-plan are caught by the deviation, not by trust. Append-only, tamper-evident (precedent's ledger discipline).

### Rail 2 — Every tool call sandboxed, egress-allowlisted
Generalized from the defending-code harness's gVisor pattern: each external tool call runs in an isolated sandbox whose network egress is restricted to an explicit allowlist, so **no data, secret, or generated artifact transfers out**. QA owns the sandbox policy; a tool needing ungranted network access **fails closed**. Nothing runs "just this once" outside the sandbox.

### Rail 3 — No agent has destructive database access, ever
Reads may be granted per config. **Create / update / delete always produce a prepared script + a request for the operator to run it** — no agent executes destructive data changes. Mirrors the system-wide "never move money" rule, extended to data. dana generates migrations/change-scripts; the operator executes. **Hard rule, not configurable.**

### Rail 4 — The adversary is scoped and caged
cypher (red team) attacks **only declared in-scope targets**, **only in-sandbox**, **never production data**, and outputs **findings to QA** — never live changes, never weaponization against anything outside our own systems. Scope is an operator-signed document; out-of-scope attempts fail closed and escalate.

> Charter precedence: **Security Charter > stack profile > agent configs > convenience.** A conflict with the charter halts and escalates.

---

## 3. The team — 11 agents in 6 pods

| Pod | Agent | Role | Core skills (custom C / marketplace M / plugin P) |
|---|---|---|---|
| **Leadership** | **dev** ⭐(leader, identity) | Lead Developer — writes the law | architecture-decisions (ADR ledger + template) C · code-review-standards C · **stack-profile** (per-business: react+vercel, aws, flutter, helix… as config) C |
| **Design** | **axiom** 🆕 | Algorithms & Data Structures | dsa-design-records (structure choice, complexity, trade-offs — ADR-for-algorithms) C · performance-profiling C/M |
| | **dana** 🆕 | Data Architecture | db-design (relational + graph/vector — **HelixDB playbook**) C · migration-discipline (always reversible; **generates scripts, operator runs them** — Rail 3) C · db-performance M |
| **Build** | **raj** | Backend / APIs | api-standards (auth, versioning, error shapes, contract tests) C · service-patterns C · backend framework via stack profile |
| | **mia** | Frontend Web | design-tokens (**atlas bridge** — brand kit → tokens) C · ui-standards + accessibility M (ui-ux-pro-max candidate) · **Agentation** feedback loop (MCP) · react/vercel notes in stack profile |
| | **nova** 🆕 | Mobile | flutter-playbook C · app-store-release-discipline C — **dormant switch** (`mobile_active`) for web-only businesses (tempo's pattern) |
| **Quality & Release** | **quinn** | QA — **blocking gate + charter control point** | test-strategy (pyramid, coverage floors, release gates) C · regression-map (fragile-areas registry, self-annealing) C · browser-verification: **Playwright (gates releases) + Reticle (gates edits)** M/MCP · **owns Rails 1–3 enforcement** |
| | **ops** 🆕 | DevOps & Reliability | release-discipline (**no deploy without a tested rollback**) C · incident-response (severity classes; blameless post-mortems → regression map + ADRs) C · maintenance-hygiene (dep/patch cadence; **restore-tested backups**; monitoring baselines) C · AWS/Vercel/**Harness.io**/**Datadog** dated playbooks |
| **Security** | **aegis** 🆕 | Application Security (defense) | threat-modeling C · vuln-scan + triage (**defending-code harness** skills) C/P · secure-code-review C · verified-patching (fix builds + PoC dies + tests pass + adversary can't re-break) C · sandbox law |
| | **cypher** 🆕 | Adversary / Red Team (offense) | attack-playbooks (OWASP Top 10 + **LLM-specific**: prompt injection, tool poisoning, plan override, data exfil; threat-intel sourced) C · continuous-attack-loop C · findings-report (→ quinn) C · **Rail 4 caged** | 
| **Search** | **rank** 🆕 | Technical SEO | wraps **claude-seo** plugin (runtime install, 25 sub-skills) P · boundary: **kai** owns SEO strategy+measurement, rank owns technical execution C |

⭐ = department leader (identity holder). 🆕 = new vs catalog.

---

## 4. The safety spine (how "without breaking stuff" is mechanized)

```
dev writes the law (ADRs · review standards · stack profile · Security Charter)
      │
      ▼
build agents (axiom/dana/raj/mia/nova) produce a change
      │  each locks its plan with quinn before any external tool call (Rail 1)
      │  each tool call runs sandboxed, egress-allowlisted (Rail 2)
      │  any DB write/delete → prepared script → operator runs it (Rail 3)
      ▼
code review (dev's checklist: correctness → security → tests)
      ▼
quinn's GATE — test tiers green + targeted regression (fragile map) + Reticle verdicts
      ▼
aegis's pass on risky diffs (threat model touched? new surface? → vuln-scan)
      ▼
ops ships — rollback tested FIRST, monitored, deploy checklist
      │
      ├──►  anything breaks → incident-response → blameless post-mortem
      │            └─► new regression-map entry + ADR (self-annealing)
      ▼
cypher attacks continuously (in-sandbox, in-scope) ──findings──► quinn ──► aegis/build ──► fix ──► cypher re-attacks
```

Nothing reaches production without passing **quinn** and **ops**; risky diffs also pass **aegis**; the whole surface is under continuous attack by **cypher**. Board's gate pattern, engineering edition.

---

## 5. Tooling map (registries + repos — proposed as connectors at deployment, not hard deps)

| Need | Tool | Source | Agent |
|---|---|---|---|
| Edit-time verification (state/network/`file:line`) | **Reticle** | github.com/reticlehq/reticle (MCP) | quinn |
| Release-gate browser tests, cross-browser, true input | **Playwright** | MCP | quinn |
| Vuln scan / triage / patch pipeline (sandboxed) | **defending-code-reference-harness** | github.com/anthropics/… | aegis + cypher |
| UI annotation → component-aware agent context | **Agentation** | agentation.com (MCP) | mia |
| SEO machinery (25 sub-skills, GEO, schema, local) | **claude-seo** | github.com/AgriciDaniel/claude-seo (plugin) | rank |
| Graph + vector + relational DB | **HelixDB** | github.com/helixdb/helix-db | dana (products; candidate for toongine memory — ADR) |
| CI/CD build-ship-secure | **Harness.io** | MCP registry | ops |
| Telemetry / incident signal | **Datadog** | MCP registry | ops |

At deployment these are surfaced via `suggest_connectors` per business — each connects what it has; skills degrade to method-only without them.

---

## 6. Cross-department & cross-system boundaries

- **atlas → mia**: brand kit is the source of design tokens (the atlas bridge); token changes trace to kit amendments.
- **board → ops/aegis**: infra/security spend and any above-threshold change gates at board's fiduciary/gate process.
- **sentinel/precedent**: the Security Charter's plan-lock and sandbox logs follow sentinel's audit-trail immutability; ADRs follow precedent's append-only discipline.
- **kai ↔ rank**: kai owns SEO strategy + measurement (scorecard §6); rank owns technical execution — clean handoff, no double-ownership.
- **toongine**: agents run *inside* the business's repo; Rails 2–3 are what make that safe. HelixDB is a candidate for toongine's own graph memory — an ADR decision at platform level.
- **Behavioral Science / AI & Agents depts (future)**: LLM-attack classes cypher tests (prompt injection, tool poisoning) overlap the AI & Agents department when built — coordinate at that build.

---

## 7. Build order (safety-first — every rail exists before any builder runs)

1. **SECURITY-CHARTER.md** (template) — the law first.
2. **dev** (leader + identity; ADRs, review standards, stack-profile).
3. **quinn** (the gate + Rails 1–3 enforcement).
4. **ops** (the safety net — rollback, incident, maintenance).
5. **aegis** (defensive security — threat model, vuln pipeline).
6. **cypher** (the caged adversary — only after defense + gate exist).
7. **axiom → dana → raj → mia → nova** (builders — nothing they make can reach prod unprotected).
8. **rank** (technical SEO).
9. **DEPARTMENT-WORKFLOW.md** (only after all 11 agents complete).

Each agent built one-at-a-time, present-then-stop, per AGENT-BUILD-PLAYBOOK.md — marketplace-search-first for every skill, genericize all stack/venture specifics, tested scripts where used, logical placeholders, honest rule-0.6 flags.

---

## 8. Open decisions carried into the build

- **nova**: build now or defer (like tempo) until a business has a mobile app? Default: build with a `mobile_active` dormant switch.
- **rank**: confirmed in Engineering (technical), not a marketing dept.
- **HelixDB for toongine memory**: a platform-level ADR, flagged for dev/dana at build.
- **Connector adoption**: which of the §5 tools the operator wants surfaced first at deployment.
