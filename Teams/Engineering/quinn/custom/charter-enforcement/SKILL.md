---
name: charter-enforcement
type: custom
status: built 2026-07-09 (Fable build — quinn is the charter control point per ENGINEERING-REDESIGN-PLAN §3/§4)
based_on_catalog_entry: none — new; mechanizes the Security Charter's Rails 1–3 (quinn as enforcer) and the Rail 4 findings intake. The charter itself is operator-owned law at `Engineering/SECURITY-CHARTER.md`; this skill is its enforcement procedure, never its author
marketplace_search: 2026-07-09 skillsmp.com / mcpmarket.com — nothing fit (plan-lock/deviation-halt is this system's own design, adapted from Anthropic's defending-code harness sandbox pattern); kept custom
assigned_agent: quinn (Engineering / QA)
portable: true — enforcement procedure is business-agnostic; the charter version, allowlists, and log paths come from config
includes: assets/plan-lock-log-template.md
date_added: 2026-07-09
---

## Introduction

charter-enforcement is quinn's control-point skill: the procedures by which the Security Charter's rails actually bind. quinn freezes and hashes execution plans before any agent's external tool call (Rail 1), owns the sandbox/egress policy every call runs under (Rail 2), verifies no agent ever executes a destructive DB operation (Rail 3), and is the intake for cypher's red-team findings (Rail 4's output side). dev's delivery-governance defines the plan artifact; this skill locks and polices it.

## Purpose

The rails are law, but law without enforcement is decoration. Prompt injection, a poisoned MCP response, or a hijacked agent doesn't announce itself — it shows up as a tool call that wasn't in the plan, an egress that wasn't on the allowlist, or a "quick" DB update. quinn catches all three by procedure, not by trusting any agent's mid-run judgment — including its own: quinn's external calls are plan-locked too, hashed before the run.

## When to Use

Triggers: "lock this plan," "plan-lock," any Engineering agent about to make external tool calls, "sandbox policy," "egress request," a diff or plan containing DB mutations, "cypher findings," "charter check," "rail violation."

## Structure / Protocol

```
RAIL 1 — PLAN-LOCK
Agent submits execution plan (dev's assets/execution-plan-template.md)
  -> quinn validates completeness: task+scope · ordered call list · data touched · stop conditions
     (incomplete plan → returned, not locked; vague steps like "call tools as needed" → returned)
    -> quinn hashes the canonical plan text; appends {plan id, agent, hash, timestamp} to plan_lock_log
      -> Agent executes. Any call ∉ locked plan → HALT agent + escalate (escalation_contact)
        -> Legitimate change of plan → NEW plan citing the old, re-locked. Never edit a locked plan.

RAIL 2 — SANDBOX / EGRESS
Every external call runs sandboxed; egress ⊆ egress_allowlist
  -> Tool needs ungrated egress → FAIL CLOSED, log, escalate. No "just this once."
  -> Allowlist changes are operator decisions, logged — quinn administers, never expands on its own.

RAIL 3 — DESTRUCTIVE-DB VERIFICATION
Scan every locked plan + every gated diff for DB create/update/delete/drop/truncate/migration
  -> Agent-executed destructive op anywhere → TOP-SEVERITY breach: halt, escalate, log
  -> Correct path verified: prepared script + plain-language effect summary + operator-run request (dana authors)

RAIL 4 — FINDINGS INTAKE (receiving end; cypher's cage is cypher's skill)
cypher findings arrive → verify in-scope + sandbox-only provenance → triage severity
  -> route to aegis (vuln pipeline) / builder (fix) → fix verified → cypher re-attacks → regression-map entry
```

## Instructions

1. **Validate before locking.** A lockable plan has every section of dev's template filled: concrete ordered calls (tool · purpose · argument shape · expected effect), declared data touches, explicit stop conditions. Plans with open-ended steps ("search as needed," "iterate until done") are returned — an unbounded plan makes deviation undetectable, which defeats the rail.
2. **Hash and log, append-only.** Hash the canonical plan text (algorithm per config, default SHA-256); append the lock entry to `plan_lock_log` per the asset template. The log is tamper-evident and never edited — corrections are new entries referencing old ones (precedent's discipline, per charter Governance).
3. **Deviation = halt, not judgment.** The test is set membership: `executed call ∈ locked plan`. quinn does not evaluate whether an off-plan call "seems reasonable" — that judgment is exactly what a hijacked agent would offer. Halt, log, escalate; the operator or a re-locked plan resumes work.
4. **Administer the sandbox, never loosen it.** Keep `sandbox_policy` and `egress_allowlist` current from config; confirm sandbox-active on external calls; deny-and-log anything ungrated. Repeated denials of the same egress are surfaced to the operator as amendment pressure — never absorbed as silent exceptions.
5. **Rail 3 is absolute.** No severity triage, no configurability: an agent-executed destructive DB op is a top-severity charter breach even if it "worked" and even in a sandbox against production-shaped data. Verify the script-for-operator path instead — dana's prepared script, effect summary, operator execution.
6. **Findings intake.** Log cypher's findings (append-only), verify provenance (in-scope target, sandbox-only), triage, route, and close the loop: a finding is closed only when the fix is verified AND cypher's re-attack fails AND the fragile area is on the regression-map.
7. **Unadopted charter = most-restrictive mode.** No adopted charter version in config → no plan-locks issued (so no external tool calls department-wide), no DB writes, no red-team — and every affected output says so. Loudly degraded, never silently permissive.

## Output Format

```
## Plan-Lock: [plan id] — [agent]
Completeness: [lockable / returned — missing sections]
Hash: [algo:hash] · Logged: [plan_lock_log entry #] · Status: LOCKED / RETURNED

## Violation Report: [rail #] — [agent]
What happened · The locked-plan/allowlist delta · Action taken (HALT/escalate) · Log refs
```

## Principles

- **Deviation detection, not intent judgment** — a hijacked agent argues persuasively; set membership doesn't listen.
- **Unbounded plans are unlockable** — vagueness defeats the rail, so vagueness is returned.
- **Append-only everything** — locks, denials, findings; corrections by reference, never by edit.
- **Fail closed** — no egress, no lock, no exception "just this once."
- **Rail 3 has no exceptions and no configuration** — destructive data changes are human.
- **quinn is bound by its own rails** — quinn's external calls are plan-locked and sandboxed like everyone's.
- **Repeated friction is amendment pressure for the operator, never silent loosening.**

## Fallback

- Charter unadopted → most-restrictive mode (Instruction 7), stated in every output.
- `plan_lock_log` path unset → no locks can be recorded → no external calls proceed; flag to operator.
- An agent disputes a halt → the dispute is logged and escalated with the delta; the halt stands meanwhile.
- Hash tooling unavailable → plans recorded verbatim in the log with a `hash: unavailable — verbatim record` flag; still append-only, still enforceable by text comparison.

## Boundaries with Other Skills

- **dev/delivery-governance** defines the execution-plan artifact (the law); this skill locks and polices it (the enforcement). The split is deliberate: author and enforcer are different agents.
- **test-strategy / browser-verification** (siblings) are quinn's quality gates; this is quinn's security gate — a release can pass every test and still be blocked on a rail violation.
- **aegis** owns fixing what cypher finds; quinn owns the intake, triage, and closed-loop verification.
- **sentinel/precedent** (Governance): the append-only log discipline follows their audit-trail immutability; charter amendments are operator acts, optionally witnessed by board.
