# Engineering Security Charter — TEMPLATE

> **Operator-owned law, constitution-grade.** Every Engineering agent inherits this charter and
> cannot waive it — only the operator amends it. Nothing here is in force until the operator fills
> the `<FILL_IN>` fields and adopts a version. Precedence: **Security Charter > stack profile >
> agent configs > convenience.** Any conflict with the charter HALTS the agent and escalates.
> Built from the four rails agreed 2026-07-08; sandbox/plan-lock discipline adapted from
> Anthropic's defending-code reference harness (gVisor + egress allowlist) and the system's
> append-only ledger pattern (precedent/sentinel).

**Version:** [v0.1] · **Adopted:** [YYYY-MM-DD] · **Owner:** [operator]
**Amendment rule:** [operator's explicit written approval + version bump + one-line rationale; agents propose, only the operator adopts]

---

## Rail 1 — Plan-lock before any external tool call

**Rule.** Before any agent calls an external tool, quinn (QA) freezes the agent's **execution plan** —
the ordered list of intended tool calls with their arguments — and records a hash of it (append-only,
`plan_lock_log`). During execution, **any tool call not present in the locked plan halts the agent
and escalates** to `escalation_contact`. Re-planning requires a new lock.

**Why.** This is the anti-prompt-injection / anti-hijack rail. A poisoned input, a compromised MCP
response, or an adversary trying to steer an agent off-task is caught by the *deviation from the
locked plan*, not by trusting the agent's judgment mid-run.

**Test (auditable).** `every executed tool call ∈ locked plan`. A call outside the set = violation.

**Config:** `plan_lock_log: <FILL_IN>` · `escalation_contact: <FILL_IN>` · `replan_requires_relock: true (fixed)`

---

## Rail 2 — Every tool call sandboxed, egress-allowlisted

**Rule.** Each external tool call runs inside an isolated sandbox whose network egress is restricted
to an explicit allowlist. **No data, secret, credential, or generated artifact transfers out** of the
sandbox except to allowlisted destinations. A tool needing network access it wasn't granted
**fails closed** (denied, logged) — never "just this once."

**Why.** Prevents exfiltration and blast-radius spread — if a tool or its input is malicious, the
sandbox contains it. Generalized from the harness's gVisor isolation.

**Test.** `sandbox active for call == true` AND `egress ⊆ allowlist`. Any egress outside the allowlist = violation.

**Config:** `sandbox_policy: <FILL_IN>` · `egress_allowlist: <FILL_IN>` · `fail_closed: true (fixed)`

---

## Rail 3 — No agent has destructive database access, ever

**Rule.** Read access may be granted per config. **Create / update / delete / drop / truncate — and
any schema migration — are NEVER executed by an agent.** The agent produces a prepared, reviewable
script (SQL/migration/DSL) plus a plain-language summary of its effect, and **requests the operator
to run it.** dana authors change scripts; the operator executes. This mirrors the system-wide
"never move money / execute a trade" rule, extended to data.

**Why.** An agent that can silently delete or mutate business data is an unacceptable single point of
catastrophic failure. Destructive actions stay human.

**Test.** `count(agent-executed destructive DB ops) == 0`, always. Any such op = charter breach (top severity).

**Config:** `read_access_scope: <FILL_IN>` · destructive access: **not configurable — permanently denied.**

---

## Rail 4 — The adversary is scoped and caged

**Rule.** The red-team agent (cypher) attacks **only targets on the operator-signed in-scope list**,
**only inside the sandbox**, **never against production data or third-party systems**, and produces
**findings routed to quinn** — never live changes, never weaponization usable outside our own systems.
An attack attempt against an out-of-scope target **fails closed and escalates.**

**Why.** Authorized internal red-teaming improves our defenses; anything beyond the signed scope is
prohibited, full stop.

**Test.** `every cypher action target ∈ signed scope` AND `cypher writes 0 live changes`. Violation = immediate stop + escalate.

**Config:** `red_team_scope_doc: <FILL_IN>` (operator-signed) · `scope_review_cadence: <FILL_IN>`

---

## Governance

- **Inheritance:** every `Engineering/*/operational/principles/*` file references this charter as its
  senior authority; agent principles never contradict it.
- **Logging:** plan-locks, sandbox decisions, and red-team findings are append-only and follow
  sentinel's audit-trail immutability + precedent's corrections-by-reference discipline.
- **Escalation:** any rail violation halts the agent and routes to `escalation_contact` (and board
  where spend/strategic lines are crossed). Unfilled charter = agents run in the **most restrictive
  reading** (no external tools, no DB writes, no red-team) and say so.
- **Amendment:** operator-only, versioned. Repeated escalations of the same kind are amendment
  pressure surfaced to the operator, not silent loosening.
